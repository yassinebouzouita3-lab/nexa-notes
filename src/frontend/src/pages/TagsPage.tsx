import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { NoteCard } from "@/components/NoteCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateTag,
  useDeleteTag,
  useNotes,
  useNotesUiStore,
  useTags,
} from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import { DEFAULT_NOTE_FILTER, type Tag } from "@/types/notes";
import { Hash, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

/** Tag management plus notes filtered by the selected tag. */
export function TagsPage() {
  const { data: tags = [], isLoading } = useTags();
  const { data: notes = [] } = useNotes("newest", DEFAULT_NOTE_FILTER);
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const viewMode = useNotesUiStore((state) => state.viewMode);

  const [draft, setDraft] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of notes) {
      for (const tagId of note.tagIds) {
        const key = tagId.toString();
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return map;
  }, [notes]);

  const activeTag =
    tags.find((tag) => tag.id.toString() === selectedId) ?? null;
  const filtered = activeTag
    ? notes.filter((note) => note.tagIds.includes(activeTag.id))
    : [];

  const handleCreate = () => {
    const name = draft.trim();
    if (!name) return;
    setDraft("");
    createTag.mutate(name);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.id.toString() === selectedId) setSelectedId(null);
    deleteTag.mutate(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <motion.div
      data-ocid="tags.page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Tags
        </h1>
        <p className="text-sm text-muted-foreground">
          Label notes across folders, then filter by any tag.
        </p>
      </header>

      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleCreate();
            }
          }}
          placeholder="New tag name"
          aria-label="New tag name"
          data-ocid="tags.input"
          className="h-11 max-w-sm rounded-full"
        />
        <Button
          type="button"
          onClick={handleCreate}
          disabled={!draft.trim() || createTag.isPending}
          data-ocid="tags.add_button"
          className="h-11 rounded-full"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create
        </Button>
      </div>

      {isLoading ? (
        <LoadingState variant="list" count={3} />
      ) : tags.length === 0 ? (
        <EmptyState
          icon={<Hash className="size-9" strokeWidth={1.5} />}
          title="No tags yet"
          description="Create a tag like “research” or “urgent” to group notes across every folder."
        />
      ) : (
        <div
          data-ocid="tags.list"
          className="flex flex-wrap gap-2"
          aria-label="Your tags"
        >
          {tags.map((tag, index) => {
            const key = tag.id.toString();
            const active = key === selectedId;
            const count = counts.get(key) ?? 0;
            return (
              <div
                key={key}
                data-ocid={`tags.item.${index + 1}`}
                className={cn(
                  "transition-fast inline-flex items-center gap-1 rounded-full border pl-3 pr-1 py-1",
                  active
                    ? "border-transparent bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-card text-foreground hover:border-primary/40",
                )}
              >
                <button
                  type="button"
                  aria-pressed={active}
                  data-ocid={`tags.filter_button.${index + 1}`}
                  onClick={() => setSelectedId(active ? null : key)}
                  className="inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Hash className="size-3.5" aria-hidden="true" />
                  {tag.name}
                  <span
                    className={cn(
                      "font-mono text-[0.6875rem] tabular-nums",
                      active
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Delete tag ${tag.name}`}
                  data-ocid={`tags.delete_button.${index + 1}`}
                  onClick={() => setPendingDelete(tag)}
                  className={cn(
                    "transition-fast inline-flex size-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "text-primary-foreground/80 hover:bg-primary-foreground/20"
                      : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                  )}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTag ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Notes tagged “{activeTag.name}”
          </h2>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Hash className="size-9" strokeWidth={1.5} />}
              title="No notes with this tag"
              description="Open a note and add this tag to see it collected here."
            />
          ) : (
            <div
              data-ocid="tags.notes_list"
              className={cn(viewMode === "grid" ? "notes-grid" : "notes-list")}
            >
              {filtered.map((note, index) => (
                <div
                  key={note.id.toString()}
                  className="stagger-item"
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                >
                  <NoteCard
                    note={note}
                    tags={tags}
                    variant={viewMode}
                    index={index}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this tag?"
        description={`“${
          pendingDelete?.name ?? "This tag"
        }” will be removed from every note. The notes themselves are kept.`}
        confirmLabel="Delete tag"
        destructive
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}
