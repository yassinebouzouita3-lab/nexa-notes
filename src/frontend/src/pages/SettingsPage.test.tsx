import { useNotesUiStore } from "@/lib/notes-store";
import { SettingsPage } from "@/pages/SettingsPage";
import { createMockNotesBackend } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  useNotesUiStore.setState({ viewMode: "grid", sortOrder: "newest" });
  document.documentElement.classList.remove("dark");
});

describe("SettingsPage", () => {
  it("applies and persists a dark theme choice", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend();
    renderWithProviders(<SettingsPage />, backend);

    await user.click(await screen.findByRole("button", { name: "Dark" }));

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
    await waitFor(() => {
      expect(backend.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ theme: "dark" }),
      );
    });
  });

  it("persists a default sort order change", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend();
    renderWithProviders(<SettingsPage />, backend);

    await user.click(
      await screen.findByRole("button", { name: "Title (A–Z)" }),
    );

    await waitFor(() => {
      expect(backend.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ sortOrder: "title" }),
      );
    });
    expect(useNotesUiStore.getState().sortOrder).toBe("title");
  });

  it("persists a default view change", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend();
    renderWithProviders(<SettingsPage />, backend);

    await user.click(await screen.findByRole("button", { name: "List" }));

    await waitFor(() => {
      expect(backend.updateSettings).toHaveBeenCalledWith(
        expect.objectContaining({ gridView: false }),
      );
    });
    expect(useNotesUiStore.getState().viewMode).toBe("list");
  });

  it("adds sample notes only after confirmation", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend();
    renderWithProviders(<SettingsPage />, backend);

    await user.click(
      await screen.findByRole("button", { name: "Add sample notes" }),
    );

    expect(await screen.findByText("Add sample notes?")).toBeInTheDocument();
    expect(backend.seedSampleNotes).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Add samples" }));

    await waitFor(() => {
      expect(backend.seedSampleNotes).toHaveBeenCalledTimes(1);
    });
  });
});
