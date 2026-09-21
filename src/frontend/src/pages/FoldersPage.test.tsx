import { FoldersPage } from "@/pages/FoldersPage";
import { createMockNotesBackend, folder } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("FoldersPage", () => {
  it("creates a folder from the input", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend();
    renderWithProviders(<FoldersPage />, backend);

    await user.type(
      await screen.findByLabelText("New folder name"),
      "Projects",
    );
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(backend.createFolder).toHaveBeenCalledWith("Projects");
    });
  });

  it("lists existing folders", async () => {
    const backend = createMockNotesBackend({
      listFolders: vi.fn(async () => [
        folder({ id: 1n, name: "Work" }),
        folder({ id: 2n, name: "Personal" }),
      ]),
    });
    renderWithProviders(<FoldersPage />, backend);

    expect(await screen.findByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("renames a folder", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listFolders: vi.fn(async () => [folder({ id: 1n, name: "Old name" })]),
    });
    renderWithProviders(<FoldersPage />, backend);

    await user.click(
      await screen.findByRole("button", { name: "Rename Old name" }),
    );
    const input = screen.getByLabelText("Folder name");
    await user.clear(input);
    await user.type(input, "New name");
    await user.click(screen.getByRole("button", { name: "Save folder name" }));

    await waitFor(() => {
      expect(backend.renameFolder).toHaveBeenCalledWith(1n, "New name");
    });
  });

  it("requires confirmation before deleting a folder", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listFolders: vi.fn(async () => [folder({ id: 1n, name: "Doomed" })]),
    });
    renderWithProviders(<FoldersPage />, backend);

    await user.click(
      await screen.findByRole("button", { name: "Delete Doomed" }),
    );

    expect(await screen.findByText("Delete this folder?")).toBeInTheDocument();
    expect(backend.deleteFolder).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete folder" }));

    await waitFor(() => {
      expect(backend.deleteFolder).toHaveBeenCalledWith(1n);
    });
  });
});
