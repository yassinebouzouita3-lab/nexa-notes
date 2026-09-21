import type {
  ChecklistItem,
  Folder,
  Id,
  Note,
  NoteFilter,
  NoteInput,
  NotePatch,
  NotesBackend,
  Settings,
  SortOrder,
  Tag,
} from "@/types/notes";
import { DEFAULT_SETTINGS } from "@/types/notes";
import { vi } from "vitest";

/** A fixed "now" so relative-time labels are deterministic. */
export const NOW_NS = 1_700_000_000_000_000_000n;

export function note(overrides: Partial<Note> = {}): Note {
  return {
    id: 1n,
    title: "Untitled note",
    body: "",
    checklist: [],
    folderId: null,
    tagIds: [],
    pinned: false,
    favorite: false,
    trashed: false,
    createdAt: NOW_NS,
    updatedAt: NOW_NS,
    ...overrides,
  };
}

export function folder(overrides: Partial<Folder> = {}): Folder {
  return { id: 1n, name: "Folder", createdAt: NOW_NS, ...overrides };
}

export function tag(overrides: Partial<Tag> = {}): Tag {
  return { id: 1n, name: "tag", createdAt: NOW_NS, ...overrides };
}

export function checklistItem(
  overrides: Partial<ChecklistItem> = {},
): ChecklistItem {
  return { id: 1n, text: "Task", completed: false, ...overrides };
}

/**
 * A fully typed in-memory `NotesBackend`. Every method is a Vitest mock so a
 * test can assert the exact call the UI made, and the defaults return
 * empty-state values so an unconfigured method never throws.
 */
export type MockNotesBackend = {
  [K in keyof NotesBackend]: NotesBackend[K] & ReturnType<typeof vi.fn>;
};

export function createMockNotesBackend(
  overrides: Partial<MockNotesBackend> = {},
): MockNotesBackend {
  const backend: MockNotesBackend = {
    createNote: vi.fn(async (input: NoteInput) =>
      note({ id: 100n, title: input.title, body: input.body }),
    ),
    updateNote: vi.fn(async (id: Id, patch: NotePatch) =>
      note({ id, ...patch }),
    ),
    duplicateNote: vi.fn(async (id: Id) => note({ id: id + 1n })),
    trashNote: vi.fn(async () => true),
    restoreNote: vi.fn(async (id: Id) => note({ id, trashed: false })),
    deleteNotePermanently: vi.fn(async () => true),
    setPinned: vi.fn(async (id: Id, pinned: boolean) => note({ id, pinned })),
    setFavorite: vi.fn(async (id: Id, favorite: boolean) =>
      note({ id, favorite }),
    ),
    toggleChecklistItem: vi.fn(async (noteId: Id) => note({ id: noteId })),
    listNotes: vi.fn(async (_sort: SortOrder, _filter: NoteFilter) => []),
    searchNotes: vi.fn(async () => []),
    createFolder: vi.fn(async (name: string) => folder({ name })),
    renameFolder: vi.fn(async (id: Id, name: string) => folder({ id, name })),
    deleteFolder: vi.fn(async () => true),
    listFolders: vi.fn(async () => []),
    createTag: vi.fn(async (name: string) => tag({ name })),
    deleteTag: vi.fn(async () => true),
    listTags: vi.fn(async () => []),
    getSettings: vi.fn(async () => DEFAULT_SETTINGS),
    updateSettings: vi.fn(async (settings: Settings) => settings),
    seedSampleNotes: vi.fn(async () => []),
    ...overrides,
  };
  return backend;
}
