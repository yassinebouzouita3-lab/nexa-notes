import { useNotesUiStore } from "@/lib/notes-store";
import { HomePage } from "@/pages/HomePage";
import { createMockNotesBackend, note } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  // The UI store persists to localStorage; reset it so each test starts from
  // the default grid/newest/all state.
  useNotesUiStore.setState({
    viewMode: "grid",
    sortOrder: "newest",
    activeFolderId: null,
    activeTagId: null,
    favoritesOnly: false,
  });
});

describe("HomePage", () => {
  it("renders the notes list without a blank screen", async () => {
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [note({ id: 1n, title: "First note" })]),
    });

    renderWithProviders(<HomePage />, backend);

    expect(await screen.findByText("First note")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "All notes" }),
    ).toBeInTheDocument();
  });

  it("seeds sample notes once when the library is empty", async () => {
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => []),
      seedSampleNotes: vi.fn(async () => [note({ id: 9n, title: "Sample" })]),
    });

    renderWithProviders(<HomePage />, backend);

    await waitFor(() => {
      expect(backend.seedSampleNotes).toHaveBeenCalledTimes(1);
    });
  });

  it("does not seed when notes already exist", async () => {
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [note({ id: 1n, title: "Existing" })]),
    });

    renderWithProviders(<HomePage />, backend);

    expect(await screen.findByText("Existing")).toBeInTheDocument();
    expect(backend.seedSampleNotes).not.toHaveBeenCalled();
  });

  it("orders pinned notes before unpinned ones", async () => {
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [
        note({ id: 1n, title: "Unpinned" }),
        note({ id: 2n, title: "Pinned", pinned: true }),
      ]),
    });

    renderWithProviders(<HomePage />, backend);

    const list = await screen.findByTestId("notes.list");
    const cards = within(list).getAllByRole("link");
    expect(cards[0]).toHaveAccessibleName("Open note: Pinned");
    expect(cards[1]).toHaveAccessibleName("Open note: Unpinned");
  });

  it("creates a note from the floating + button and calls the backend", async () => {
    const user = userEvent.setup();
    const created = note({ id: 42n, title: "" });
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => []),
      createNote: vi.fn(async () => created),
    });

    renderWithProviders(<HomePage />, backend);

    const fab = await screen.findByRole("button", {
      name: "Create a new note",
    });
    await user.click(fab);

    await waitFor(() => {
      expect(backend.createNote).toHaveBeenCalledTimes(1);
    });
    expect(backend.createNote).toHaveBeenCalledWith(
      expect.objectContaining({ title: "", body: "", checklist: [] }),
    );
  });

  it("filters to favorites when the Favorites chip is selected", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async (_sort, filter) =>
        filter.favoritesOnly
          ? [note({ id: 2n, title: "Starred", favorite: true })]
          : [
              note({ id: 1n, title: "Plain" }),
              note({ id: 2n, title: "Starred", favorite: true }),
            ],
      ),
    });

    renderWithProviders(<HomePage />, backend);

    expect(await screen.findByText("Plain")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Favorites" }));

    await waitFor(() => {
      expect(screen.queryByText("Plain")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Starred")).toBeInTheDocument();
  });

  it("switches between grid and list layouts and persists the choice", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [note({ id: 1n, title: "A note" })]),
    });

    renderWithProviders(<HomePage />, backend);

    const list = await screen.findByTestId("notes.list");
    expect(list.className).toContain("notes-grid");

    await user.click(screen.getByRole("button", { name: "List view" }));

    await waitFor(() => {
      expect(screen.getByTestId("notes.list").className).toContain(
        "notes-list",
      );
    });
    expect(useNotesUiStore.getState().viewMode).toBe("list");
  });

  it("shows an empty state with a create action when there are no notes", async () => {
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => []),
      seedSampleNotes: vi.fn(async () => []),
    });

    renderWithProviders(<HomePage />, backend);

    expect(
      await screen.findByText("Your notebook is empty"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create your first note/i }),
    ).toBeInTheDocument();
  });
});
