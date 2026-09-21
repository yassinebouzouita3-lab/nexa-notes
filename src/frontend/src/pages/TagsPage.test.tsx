import { TagsPage } from "@/pages/TagsPage";
import { createMockNotesBackend, note, tag } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("TagsPage", () => {
  it("creates a tag from the input", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend();
    renderWithProviders(<TagsPage />, backend);

    await user.type(await screen.findByLabelText("New tag name"), "urgent");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(backend.createTag).toHaveBeenCalledWith("urgent");
    });
  });

  it("filters notes by the selected tag", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listTags: vi.fn(async () => [tag({ id: 1n, name: "work" })]),
      listNotes: vi.fn(async () => [
        note({ id: 1n, title: "Tagged note", tagIds: [1n] }),
        note({ id: 2n, title: "Untagged note", tagIds: [] }),
      ]),
    });
    renderWithProviders(<TagsPage />, backend);

    await user.click(await screen.findByTestId("tags.filter_button.1"));

    expect(await screen.findByText("Tagged note")).toBeInTheDocument();
    expect(screen.queryByText("Untagged note")).not.toBeInTheDocument();
  });

  it("requires confirmation before deleting a tag", async () => {
    const user = userEvent.setup();
    const backend = createMockNotesBackend({
      listTags: vi.fn(async () => [tag({ id: 1n, name: "obsolete" })]),
    });
    renderWithProviders(<TagsPage />, backend);

    await user.click(
      await screen.findByRole("button", { name: "Delete tag obsolete" }),
    );

    expect(await screen.findByText("Delete this tag?")).toBeInTheDocument();
    expect(backend.deleteTag).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete tag" }));

    await waitFor(() => {
      expect(backend.deleteTag).toHaveBeenCalledWith(1n);
    });
  });
});
