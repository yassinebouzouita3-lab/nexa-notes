import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, toPlainText } from "@/lib/format";
import {
  useDeleteNotePermanently,
  useNotes,
  useRestoreNote,
  useTags,
} from "@/lib/notes-store";
import { DEFAULT_NOTE_FILTER, type Id, type Note } from "@/types/notes";
import { RotateCcw, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

/** Trash view: restore notes or delete them permanently behind a confirmation. */
export function TrashPage() {
  const filter = useMemo(
    () => ({ ...DEFAULT_NOTE_FILTER, includeTrashed: true }),
    [],
  );
  const { data: allNotes = [], isLoading } = useNotes("newest", filter);
  const { data: tags = [] } = useTags();
  const restoreNote = useRestoreNote();
  const deleteForever = useDeleteNotePermanently();
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);

  const trashed = allNotes.filter((note) => note.trashed);

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteForever.mutate(pendingDelete.id);
    setPendingDelete(null);
  };

  const tagName = (id: Id) => tags.find((tag) => tag.id === id)?.name;

  return (
    <motion.div
      data-ocid="trash.page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Trash
        </h1>
        <p className="text-sm text-muted-foreground">
          Deleted notes stay here until you restore or remove them for good.
        </p>
      </header>

      {isLoading ? (
        <LoadingState variant="list" count={4} />
      ) : trashed.length === 0 ? (
        <EmptyState
          icon={<Trash2 className="size-9" strokeWidth={1.5} />}
          title="Trash is empty"
          description="Notes you delete will appear here, ready to restore if you change your mind."
        />
      ) : (
        <ul data-ocid="trash.list" className="notes-list">
          {trashed.map((note, index) => (
            <li
              key={note.id.toString()}
              data-ocid={`trash.item.${index + 1}`}
              className="surface-card stagger-item flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
            >
              <div className="flex min-w-0 flex-col gap-1">
                <h2 className="truncate font-display text-base font-semibold tracking-tight text-foreground">
                  {note.title || "Untitled note"}
                </h2>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {toPlainText(note.body) || "No additional text"}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <time className="font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                    Deleted {formatRelativeTime(note.updatedAt)}
                  </time>
                  {note.tagIds.map((id) => {
                    const name = tagName(id);
                    return name ? (
                      <span
                        key={id.toString()}
                        className="tag-pill px-2 py-0.5"
                      >
                        {name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => restoreNote.mutate(note.id)}
                  disabled={restoreNote.isPending}
                  data-ocid={`trash.restore_button.${index + 1}`}
                  className="rounded-full"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Restore
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(note)}
                  data-ocid={`trash.delete_button.${index + 1}`}
                  className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this note permanently?"
        description={`“${
          pendingDelete?.title || "Untitled note"
        }” will be removed for good. This action cannot be undone.`}
        confirmLabel="Delete permanently"
        destructive
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}
