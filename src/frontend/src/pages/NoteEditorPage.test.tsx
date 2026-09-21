import { NoteEditorPage } from "@/pages/NoteEditorPage";
import { createMockNotesBackend, note } from "@/test/fixtures";
import { renderAtRoute } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const NOTE_ID = 5n;

function backendWithNote(overrides = {}) {
  return createMockNotesBackend({
    listNotes: vi.fn(async () => [
      note({ id: NOTE_ID, title: "Original title", body: "<p>Hello</p>" }),
    ]),
    ...overrides,
  });
}

function renderEditor(backend: ReturnType<typeof backendWithNote>) {
  return renderAtRoute(
    NoteEditorPage,
    "/note/$id",
    `/note/${NOTE_ID.toString()}`,
    backend,
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("NoteEditorPage", () => {
  it("loads the note title and body", async () => {
    const backend = backendWithNote();
    renderEditor(backend);

    expect(
      await screen.findByDisplayValue("Original title"),
    ).toBeInTheDocument();
  });

  it("autosaves a title change through updateNote", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const backend = backendWithNote();
    renderEditor(backend);

    const title = await screen.findByLabelText("Note title");
    await user.clear(title);
    await user.type(title, "Renamed");

    // The debounce is 700ms; nothing is sent before it elapses.
    expect(backend.updateNote).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(800);

    await waitFor(() => {
      expect(backend.updateNote).toHaveBeenCalled();
    });
    const [id, patch] = backend.updateNote.mock.calls.at(-1) as [
      bigint,
      { title?: string },
    ];
    expect(id).toBe(NOTE_ID);
    expect(patch.title).toBe("Renamed");
  });

  it("pins the note through setPinned", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const backend = backendWithNote();
    renderEditor(backend);

    await user.click(await screen.findByRole("button", { name: "Pin note" }));

    await waitFor(() => {
      expect(backend.setPinned).toHaveBeenCalledWith(NOTE_ID, true);
    });
  });

  it("favorites the note through setFavorite", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const backend = backendWithNote();
    renderEditor(backend);

    await user.click(
      await screen.findByRole("button", { name: "Add to favorites" }),
    );

    await waitFor(() => {
      expect(backend.setFavorite).toHaveBeenCalledWith(NOTE_ID, true);
    });
  });

  it("duplicates the note through duplicateNote", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const backend = backendWithNote();
    renderEditor(backend);

    await user.click(
      await screen.findByRole("button", { name: "Duplicate note" }),
    );

    await waitFor(() => {
      expect(backend.duplicateNote).toHaveBeenCalledWith(NOTE_ID);
    });
  });

  it("moves the note to trash through trashNote", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const backend = backendWithNote();
    renderEditor(backend);

    await user.click(
      await screen.findByRole("button", { name: "Move note to trash" }),
    );

    await waitFor(() => {
      expect(backend.trashNote).toHaveBeenCalledWith(NOTE_ID);
    });
  });

  it("requires confirmation before permanent deletion", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const backend = backendWithNote();
    renderEditor(backend);

    await user.click(
      await screen.findByRole("button", { name: "Delete permanently" }),
    );

    expect(
      await screen.findByText("Delete this note permanently?"),
    ).toBeInTheDocument();
    expect(backend.deleteNotePermanently).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Delete permanently" }),
    );

    await waitFor(() => {
      expect(backend.deleteNotePermanently).toHaveBeenCalledWith(NOTE_ID);
    });
  });

  it("toggles a persisted checklist item through the backend", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [
        note({
          id: NOTE_ID,
          title: "With tasks",
          checklist: [{ id: 11n, text: "Buy milk", completed: false }],
        }),
      ]),
      toggleChecklistItem: vi.fn(async () =>
        note({
          id: NOTE_ID,
          checklist: [{ id: 11n, text: "Buy milk", completed: true }],
        }),
      ),
    });
    renderEditor(backend);

    await user.click(
      await screen.findByRole("checkbox", {
        name: 'Mark "Buy milk" complete',
      }),
    );

    await waitFor(() => {
      expect(backend.toggleChecklistItem).toHaveBeenCalledWith(NOTE_ID, 11n);
    });
  });

  it("shows a not-found state for a missing note", async () => {
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => []),
    });
    renderEditor(backend);

    expect(
      await screen.findByText("This note no longer exists"),
    ).toBeInTheDocument();
  });

  it("loads a trashed note by querying the trashed list", async () => {
    // `useNote` queries active and trashed lists separately because a single
    // `listNotes` call can never return both. A trashed note must still open.
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async (_sort, filter) =>
        filter.includeTrashed
          ? [note({ id: NOTE_ID, title: "In the bin", trashed: true })]
          : [],
      ),
    });
    renderEditor(backend);

    expect(await screen.findByDisplayValue("In the bin")).toBeInTheDocument();
  });
});
