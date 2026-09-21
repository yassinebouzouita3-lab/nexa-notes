import { TrashPage } from "@/pages/TrashPage";
import { createMockNotesBackend, note } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("TrashPage", () => {
  it("lists only trashed notes", async () => {
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [
        note({ id: 1n, title: "Kept note", trashed: false }),
        note({ id: 2n, title: "Deleted note", trashed: true }),
      ]),
    });

    renderWithProviders(<TrashPage />, backend);

    expect(await screen.findByText("Deleted note")).toBeInTheDocument();
    expect(screen.queryByText("Kept note")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing is trashed", async () => {
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [note({ id: 1n, trashed: false })]),
    });

    renderWithProviders(<TrashPage />, backend);

    expect(await screen.findByText("Trash is empty")).toBeInTheDocument();
  });

  it("restores a trashed note through the backend", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [
        note({ id: 7n, title: "Recover me", trashed: true }),
      ]),
    });

    renderWithProviders(<TrashPage />, backend);

    await user.click(await screen.findByRole("button", { name: "Restore" }));

    await waitFor(() => {
      expect(backend.restoreNote).toHaveBeenCalledWith(7n);
    });
  });

  it("requires confirmation before permanent deletion", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [
        note({ id: 7n, title: "Gone forever", trashed: true }),
      ]),
    });

    renderWithProviders(<TrashPage />, backend);

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    // The confirmation dialog appears and nothing is deleted yet.
    expect(
      await screen.findByText("Delete this note permanently?"),
    ).toBeInTheDocument();
    expect(backend.deleteNotePermanently).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "Delete permanently" }),
    );

    await waitFor(() => {
      expect(backend.deleteNotePermanently).toHaveBeenCalledWith(7n);
    });
  });

  it("does not delete when the confirmation is cancelled", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listNotes: vi.fn(async () => [
        note({ id: 7n, title: "Keep me", trashed: true }),
      ]),
    });

    renderWithProviders(<TrashPage />, backend);

    await user.click(await screen.findByRole("button", { name: "Delete" }));
    await screen.findByText("Delete this note permanently?");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Delete this note permanently?"),
      ).not.toBeInTheDocument();
    });
    expect(backend.deleteNotePermanently).not.toHaveBeenCalled();
  });
});
