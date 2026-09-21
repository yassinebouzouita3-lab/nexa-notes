import { useNotesUiStore } from "@/lib/notes-store";
import { FolderDetailPage } from "@/pages/FolderDetailPage";
import { createMockNotesBackend, folder, note } from "@/test/fixtures";
import { renderAtRoute } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  useNotesUiStore.setState({ viewMode: "grid", sortOrder: "newest" });
});

function renderFolder(backend: ReturnType<typeof createMockNotesBackend>) {
  return renderAtRoute(FolderDetailPage, "/folder/$id", "/folder/1", backend);
}

describe("FolderDetailPage", () => {
  it("shows the folder name and its notes", async () => {
    const backend = createMockNotesBackend({
      listFolders: vi.fn(async () => [folder({ id: 1n, name: "Research" })]),
      listNotes: vi.fn(async () => [
        note({ id: 1n, title: "Paper notes", folderId: 1n }),
      ]),
    });
    renderFolder(backend);

    expect(await screen.findByText("Research")).toBeInTheDocument();
    expect(await screen.findByText("Paper notes")).toBeInTheDocument();
  });

  it("shows an empty state when the folder has no notes", async () => {
    const backend = createMockNotesBackend({
      listFolders: vi.fn(async () => [folder({ id: 1n, name: "Empty" })]),
      listNotes: vi.fn(async () => []),
    });
    renderFolder(backend);

    expect(await screen.findByText("This folder is empty")).toBeInTheDocument();
  });

  it("creates a note scoped to the folder", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listFolders: vi.fn(async () => [folder({ id: 1n, name: "Work" })]),
      listNotes: vi.fn(async () => []),
      createNote: vi.fn(async () => note({ id: 42n, folderId: 1n })),
    });
    renderFolder(backend);

    await user.click(
      await screen.findByRole("button", {
        name: "Create a new note in this folder",
      }),
    );

    await waitFor(() => {
      expect(backend.createNote).toHaveBeenCalledWith(
        expect.objectContaining({ folderId: 1n }),
      );
    });
  });
});
