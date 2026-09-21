import { ChecklistEditor } from "@/components/ChecklistEditor";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { FolderPicker } from "@/components/FolderPicker";
import { RichTextEditor } from "@/components/RichTextEditor";
import { TagPicker } from "@/components/TagPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatAbsoluteTime, formatShortDate } from "@/lib/format";
import {
  useDeleteNotePermanently,
  useDuplicateNote,
  useNote,
  useSetFavorite,
  useSetPinned,
  useToggleChecklistItem,
  useTrashNote,
  useUpdateNote,
} from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import type { ChecklistItem, Id, NotePatch } from "@/types/notes";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Pin,
  Star,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const routeApi = getRouteApi("/note/$id");

/** Full-page note editor with autosave, checklist, tags, folder and actions. */
export function NoteEditorPage() {
  const { id: idParam } = routeApi.useParams();
  const navigate = useNavigate();
  const noteId: Id = BigInt(idParam);

  const { data: note, isLoading } = useNote(noteId);
  const updateNote = useUpdateNote();
  const duplicateNote = useDuplicateNote();
  const trashNote = useTrashNote();
  const deleteForever = useDeleteNotePermanently();
  const setPinned = useSetPinned();
  const setFavorite = useSetFavorite();
  const toggleChecklistItem = useToggleChecklistItem();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [folderId, setFolderId] = useState<Id | null>(null);
  const [tagIds, setTagIds] = useState<Id[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const initializedFor = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<NotePatch>({});
  const prevTitle = useRef<string | null>(null);
  const prevBody = useRef<string | null>(null);
  const prevFolderId = useRef<Id | null>(null);
  const mutate = updateNote.mutate;

  // One-time initialization per note identity; never overwrite a live draft.
  useEffect(() => {
    if (!note || initializedFor.current === idParam) return;
    initializedFor.current = idParam;
    setTitle(note.title);
    setBody(note.body);
    setChecklist(note.checklist);
    setFolderId(note.folderId);
    setTagIds(note.tagIds);
    prevTitle.current = note.title;
    prevBody.current = note.body;
    prevFolderId.current = note.folderId;
  }, [note, idParam]);

  // Reconcile the checklist from the backend after a toggle so a stale local
  // copy can never be re-sent by the next autosave and undo the toggle.
  useEffect(() => {
    if (!toggleChecklistItem.data) return;
    setChecklist(toggleChecklistItem.data.checklist);
  }, [toggleChecklistItem.data]);

  // Debounced autosave on every change.
  useEffect(() => {
    if (initializedFor.current !== idParam) return;
    const patch: NotePatch = { title, body, checklist, folderId, tagIds };
    // The backend treats an omitted field as "leave unchanged", so an emptied
    // title/body or a cleared folder needs an explicit clear flag.
    if (
      prevTitle.current !== null &&
      title === "" &&
      prevTitle.current !== ""
    ) {
      patch.clearTitle = true;
    }
    if (prevBody.current !== null && body === "" && prevBody.current !== "") {
      patch.clearBody = true;
    }
    if (prevFolderId.current !== null && folderId === null) {
      patch.clearFolder = true;
    }
    latest.current = patch;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      mutate(
        { id: noteId, patch: latest.current },
        {
          onSuccess: (saved) => {
            setSavedAt(Date.now());
            if (saved) {
              prevTitle.current = saved.title;
              prevBody.current = saved.body;
              prevFolderId.current = saved.folderId;
            }
          },
        },
      );
    }, 700);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [title, body, checklist, folderId, tagIds, noteId, idParam, mutate]);

  if (isLoading) {
    return (
      <div
        data-ocid="note.loading_state"
        className="flex items-center justify-center gap-2 py-24 text-muted-foreground"
      >
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        Loading note…
      </div>
    );
  }

  if (!note) {
    return (
      <div
        data-ocid="note.error_state"
        className="flex flex-col items-center gap-4 py-24 text-center"
      >
        <h1 className="font-display text-xl font-semibold text-foreground">
          This note no longer exists
        </h1>
        <p className="text-sm text-muted-foreground">
          It may have been deleted. Head back to your notes to keep writing.
        </p>
        <Button
          type="button"
          onClick={() => void navigate({ to: "/" })}
          data-ocid="note.back_button"
          className="rounded-full"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to notes
        </Button>
      </div>
    );
  }

  const handleDuplicate = () => {
    duplicateNote.mutate(noteId, {
      onSuccess: (copy) => {
        if (copy) {
          void navigate({
            to: "/note/$id",
            params: { id: copy.id.toString() },
          });
        }
      },
    });
  };

  const handleTrash = () => {
    trashNote.mutate(noteId, {
      onSuccess: () => void navigate({ to: "/" }),
    });
  };

  const handleDeleteForever = () => {
    deleteForever.mutate(noteId, {
      onSuccess: () => void navigate({ to: "/" }),
    });
  };

  return (
    <motion.div
      data-ocid="note.page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-3xl flex-col gap-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void navigate({ to: "/" })}
          data-ocid="note.back_button"
          className="rounded-full"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All notes
        </Button>

        <div className="flex items-center gap-1.5">
          <span
            data-ocid="note.save_state"
            className="mr-1 inline-flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground"
          >
            {updateNote.isPending ? (
              <>
                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : savedAt ? (
              <>
                <Check className="size-3" aria-hidden="true" />
                Saved
              </>
            ) : (
              "Autosave on"
            )}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={note.pinned ? "Unpin note" : "Pin note"}
            aria-pressed={note.pinned}
            onClick={() =>
              setPinned.mutate({ id: noteId, pinned: !note.pinned })
            }
            data-ocid="note.pin_toggle"
            className={cn(
              "rounded-full",
              note.pinned ? "text-accent" : "text-muted-foreground",
            )}
          >
            <Pin
              className={cn("size-4", note.pinned && "fill-accent")}
              aria-hidden="true"
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              note.favorite ? "Remove from favorites" : "Add to favorites"
            }
            aria-pressed={note.favorite}
            onClick={() =>
              setFavorite.mutate({ id: noteId, favorite: !note.favorite })
            }
            data-ocid="note.favorite_toggle"
            className={cn(
              "rounded-full",
              note.favorite ? "text-accent" : "text-muted-foreground",
            )}
          >
            <Star
              className={cn("size-4", note.favorite && "fill-accent")}
              aria-hidden="true"
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Duplicate note"
            onClick={handleDuplicate}
            disabled={duplicateNote.isPending}
            data-ocid="note.duplicate_button"
            className="rounded-full text-muted-foreground"
          >
            <Copy className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Move note to trash"
            onClick={handleTrash}
            disabled={trashNote.isPending}
            data-ocid="note.delete_button"
            className="rounded-full text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="surface-card flex flex-col gap-5 p-5 sm:p-7">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Untitled note"
          aria-label="Note title"
          data-ocid="note.title_input"
          className="h-auto border-0 bg-transparent px-0 font-display text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0 sm:text-3xl"
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
          <span>Created {formatShortDate(note.createdAt)}</span>
          <span>Edited {formatAbsoluteTime(note.updatedAt)}</span>
        </div>

        <RichTextEditor
          value={body}
          onChange={setBody}
          placeholder="Start writing your note…"
        />

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Checklist
          </h2>
          <ChecklistEditor
            items={checklist}
            onChange={setChecklist}
            onToggleItem={(itemId) =>
              toggleChecklistItem.mutate({ noteId, itemId })
            }
          />
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Folder
          </h2>
          <FolderPicker selectedId={folderId} onChange={setFolderId} />
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </h2>
          <TagPicker selectedIds={tagIds} onChange={setTagIds} />
        </section>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setConfirmDelete(true)}
          data-ocid="note.permanent_delete_button"
          className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete permanently
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this note permanently?"
        description="This note will be removed for good and cannot be recovered. This action cannot be undone."
        confirmLabel="Delete permanently"
        destructive
        onConfirm={handleDeleteForever}
      />
    </motion.div>
  );
}
