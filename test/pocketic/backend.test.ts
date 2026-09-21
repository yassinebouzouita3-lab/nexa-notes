import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;

/** The declarations' `SortOrder` is a Candid variant, not a string. */
const NEWEST = { newest: null } as const;

/** An empty filter: no folder, no tag, favorites off, active notes only. */
function activeFilter() {
  return {
    folderId: [] as [] | [bigint],
    tagId: [] as [] | [bigint],
    favoritesOnly: false,
    includeTrashed: false,
  };
}

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listNotes(NEWEST, activeFilter())).resolves.toEqual([]);
  await expect(actor.listFolders()).resolves.toEqual([]);
  await expect(actor.listTags()).resolves.toEqual([]);
  await expect(actor.searchNotes("anything")).resolves.toEqual([]);
});

it("round-trips a note through the real canister", async () => {
  const created = await actor.createNote({
    title: "First note",
    body: "<p>Hello</p>",
    checklist: [],
    folderId: [],
    tagIds: [],
  });
  expect(created.title).toBe("First note");
  expect(created.trashed).toBe(false);

  const listed = await actor.listNotes(NEWEST, activeFilter());
  const roundTripped = listed.find((note) => note.id === created.id);
  expect(roundTripped).toMatchObject({ title: "First note" });
});

it("applies an autosave patch and clears an emptied title", async () => {
  const created = await actor.createNote({
    title: "Draft",
    body: "<p>Body</p>",
    checklist: [],
    folderId: [],
    tagIds: [],
  });

  const renamed = await actor.updateNote(created.id, {
    title: ["Renamed"],
    body: [],
    checklist: [],
    folderId: [],
    tagIds: [],
    clearFolder: [],
    clearTitle: [],
    clearBody: [],
  });
  expect(renamed).toHaveLength(1);
  expect(renamed[0]?.title).toBe("Renamed");

  const cleared = await actor.updateNote(created.id, {
    title: [],
    body: [],
    checklist: [],
    folderId: [],
    tagIds: [],
    clearFolder: [],
    clearTitle: [true],
    clearBody: [],
  });
  expect(cleared[0]?.title).toBe("");
});

it("duplicates a note into an independent copy", async () => {
  const created = await actor.createNote({
    title: "Original",
    body: "<p>Shared body</p>",
    checklist: [],
    folderId: [],
    tagIds: [],
  });

  const copy = await actor.duplicateNote(created.id);
  expect(copy).toHaveLength(1);
  expect(copy[0]?.id).not.toBe(created.id);
  expect(copy[0]?.title).toBe("Original (copy)");

  // Editing the copy must not touch the original.
  await actor.updateNote(copy[0]!.id, {
    title: ["Copy edited"],
    body: [],
    checklist: [],
    folderId: [],
    tagIds: [],
    clearFolder: [],
    clearTitle: [],
    clearBody: [],
  });
  const listed = await actor.listNotes(NEWEST, activeFilter());
  const original = listed.find((note) => note.id === created.id);
  expect(original?.title).toBe("Original");
});

it("moves a note to trash, restores it, and deletes it permanently", async () => {
  const created = await actor.createNote({
    title: "Disposable",
    body: "",
    checklist: [],
    folderId: [],
    tagIds: [],
  });

  await expect(actor.trashNote(created.id)).resolves.toBe(true);
  const active = await actor.listNotes(NEWEST, activeFilter());
  expect(active.some((note) => note.id === created.id)).toBe(false);
  const trashed = await actor.listNotes(NEWEST, {
    ...activeFilter(),
    includeTrashed: true,
  });
  expect(trashed.some((note) => note.id === created.id)).toBe(true);

  const restored = await actor.restoreNote(created.id);
  expect(restored[0]?.trashed).toBe(false);

  await expect(actor.deleteNotePermanently(created.id)).resolves.toBe(true);
  const afterDelete = await actor.listNotes(NEWEST, {
    ...activeFilter(),
    includeTrashed: true,
  });
  expect(afterDelete.some((note) => note.id === created.id)).toBe(false);
});

it("pins and favorites a note and surfaces it through the favorites sort", async () => {
  const plain = await actor.createNote({
    title: "Plain",
    body: "",
    checklist: [],
    folderId: [],
    tagIds: [],
  });
  const starred = await actor.createNote({
    title: "Starred",
    body: "",
    checklist: [],
    folderId: [],
    tagIds: [],
  });

  await actor.setFavorite(starred.id, true);
  await actor.setPinned(plain.id, true);

  // Pinned notes sort ahead of unpinned ones regardless of the sort order.
  const pinnedFirst = await actor.listNotes(NEWEST, activeFilter());
  expect(pinnedFirst[0]?.id).toBe(plain.id);

  // The favorites sort puts favorites ahead of non-favorites among unpinned
  // notes; the pinned note still leads the whole list.
  const favorites = await actor.listNotes({ favorites: null }, activeFilter());
  const unpinned = favorites.filter((note) => !note.pinned);
  expect(unpinned[0]?.id).toBe(starred.id);
});

it("toggles a checklist item and persists the completion", async () => {
  const created = await actor.createNote({
    title: "Tasks",
    body: "",
    checklist: [{ id: 0n, text: "Buy milk", completed: false }],
    folderId: [],
    tagIds: [],
  });
  const itemId = created.checklist[0]?.id;
  expect(itemId).toBeDefined();

  const toggled = await actor.toggleChecklistItem(created.id, itemId!);
  expect(toggled[0]?.checklist[0]?.completed).toBe(true);

  const listed = await actor.listNotes(NEWEST, activeFilter());
  const persisted = listed.find((note) => note.id === created.id);
  expect(persisted?.checklist[0]?.completed).toBe(true);
});

it("searches across title, body and tag names", async () => {
  const tag = await actor.createTag("groceries");
  const created = await actor.createNote({
    title: "Shopping",
    body: "<p>milk and bread</p>",
    checklist: [],
    folderId: [],
    tagIds: [tag.id],
  });

  const byTitle = await actor.searchNotes("shopping");
  expect(byTitle.some((note) => note.id === created.id)).toBe(true);
  const byBody = await actor.searchNotes("bread");
  expect(byBody.some((note) => note.id === created.id)).toBe(true);
  const byTag = await actor.searchNotes("groceries");
  expect(byTag.some((note) => note.id === created.id)).toBe(true);
});

it("organizes notes into folders and filters by folder", async () => {
  const folder = await actor.createFolder("Work");
  await actor.createNote({
    title: "In folder",
    body: "",
    checklist: [],
    folderId: [folder.id],
    tagIds: [],
  });
  await actor.createNote({
    title: "No folder",
    body: "",
    checklist: [],
    folderId: [],
    tagIds: [],
  });

  const inFolder = await actor.listNotes(NEWEST, {
    ...activeFilter(),
    folderId: [folder.id],
  });
  expect(inFolder).toHaveLength(1);
  expect(inFolder[0]?.title).toBe("In folder");
});

it("seeds sample notes on first launch and is idempotent", async () => {
  const first = await actor.seedSampleNotes();
  expect(first.length).toBeGreaterThan(0);

  const second = await actor.seedSampleNotes();
  expect(second).toHaveLength(first.length);
});

it("persists settings through the real canister", async () => {
  const defaults = await actor.getSettings();
  expect(defaults.theme).toEqual({ automatic: null });

  const updated = await actor.updateSettings({
    theme: { dark: null },
    sortOrder: { title: null },
    gridView: false,
  });
  expect(updated.theme).toEqual({ dark: null });

  const readBack = await actor.getSettings();
  expect(readBack).toEqual(updated);
});

it("does not show one caller's notes to another", async () => {
  const alice = createIdentity("alice");
  const bob = createIdentity("bob");

  actor.setIdentity(alice);
  const aliceNote = await actor.createNote({
    title: "Alice private",
    body: "",
    checklist: [],
    folderId: [],
    tagIds: [],
  });

  actor.setIdentity(bob);
  const bobNotes = await actor.listNotes(NEWEST, activeFilter());
  expect(bobNotes.some((note) => note.id === aliceNote.id)).toBe(false);

  // Bob cannot read Alice's note through search either.
  const bobSearch = await actor.searchNotes("Alice private");
  expect(bobSearch.some((note) => note.id === aliceNote.id)).toBe(false);

  // Alice still sees her own note.
  actor.setIdentity(alice);
  const aliceNotes = await actor.listNotes(NEWEST, activeFilter());
  expect(aliceNotes.some((note) => note.id === aliceNote.id)).toBe(true);
});
