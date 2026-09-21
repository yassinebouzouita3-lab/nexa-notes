import { useNotesUiStore } from "@/lib/notes-store";
import { SearchPage } from "@/pages/SearchPage";
import { createMockNotesBackend, note } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  useNotesUiStore.setState({ viewMode: "grid" });
});

describe("SearchPage", () => {
  it("prompts the user to type before any search runs", async () => {
    const backend = createMockNotesBackend();
    renderWithProviders(<SearchPage />, backend);

    expect(
      await screen.findByText("Start typing to search"),
    ).toBeInTheDocument();
    expect(backend.searchNotes).not.toHaveBeenCalled();
  });

  it("searches as the user types and renders matching notes", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      searchNotes: vi.fn(async (term: string) =>
        term === "groceries" ? [note({ id: 3n, title: "Groceries list" })] : [],
      ),
    });

    renderWithProviders(<SearchPage />, backend);

    await user.type(await screen.findByLabelText("Search notes"), "groceries");

    expect(await screen.findByText("Groceries list")).toBeInTheDocument();
    await waitFor(() => {
      expect(backend.searchNotes).toHaveBeenCalledWith("groceries");
    });
  });

  it("shows a no-results state for a term with no matches", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      searchNotes: vi.fn(async () => []),
    });

    renderWithProviders(<SearchPage />, backend);

    await user.type(await screen.findByLabelText("Search notes"), "zzz");

    expect(await screen.findByText(/No notes match/)).toBeInTheDocument();
  });

  it("clears the search term with the clear button", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      searchNotes: vi.fn(async () => [note({ id: 3n, title: "Result" })]),
    });

    renderWithProviders(<SearchPage />, backend);

    const input = await screen.findByLabelText("Search notes");
    await user.type(input, "abc");
    await screen.findByText("Result");

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(input).toHaveValue("");
    expect(
      await screen.findByText("Start typing to search"),
    ).toBeInTheDocument();
  });
});
