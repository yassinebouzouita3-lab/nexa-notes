import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatShortDate } from "@/lib/format";
import {
  useCreateFolder,
  useDeleteFolder,
  useFolders,
  useNotes,
  useRenameFolder,
} from "@/lib/notes-store";
import { DEFAULT_NOTE_FILTER, type Folder } from "@/types/notes";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Folder as FolderIcon,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

/** Folder management: create, rename and delete folders with confirmation. */
export function FoldersPage() {
  const { data: folders = [], isLoading } = useFolders();
  const { data: notes = [] } = useNotes("newest", DEFAULT_NOTE_FILTER);
  const createFolder = useCreateFolder();
  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Folder | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of notes) {
      if (note.folderId === null) continue;
      const key = note.folderId.toString();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [notes]);

  const handleCreate = () => {
    const name = draft.trim();
    if (!name) return;
    setDraft("");
    createFolder.mutate(name);
  };

  const startRename = (folder: Folder) => {
    setEditingId(folder.id.toString());
    setEditingName(folder.name);
  };

  const commitRename = (folder: Folder) => {
    const name = editingName.trim();
    setEditingId(null);
    if (!name || name === folder.name) return;
    renameFolder.mutate({ id: folder.id, name });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteFolder.mutate(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <motion.div
      data-ocid="folders.page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Folders
        </h1>
        <p className="text-sm text-muted-foreground">
          Group related notes into folders and custom categories.
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
          placeholder="New folder name"
          aria-label="New folder name"
          data-ocid="folders.input"
          className="h-11 max-w-sm rounded-full"
        />
        <Button
          type="button"
          onClick={handleCreate}
          disabled={!draft.trim() || createFolder.isPending}
          data-ocid="folders.add_button"
          className="h-11 rounded-full"
        >
          <Plus className="size-4" aria-hidden="true" />
          Create
        </Button>
      </div>

      {isLoading ? (
        <LoadingState variant="list" count={4} />
      ) : folders.length === 0 ? (
        <EmptyState
          icon={<FolderIcon className="size-9" strokeWidth={1.5} />}
          title="No folders yet"
          description="Create your first folder to keep projects, ideas and reference notes apart."
        />
      ) : (
        <ul data-ocid="folders.list" className="notes-list">
          {folders.map((folder, index) => {
            const key = folder.id.toString();
            const editing = editingId === key;
            const count = counts.get(key) ?? 0;
            return (
              <li
                key={key}
                data-ocid={`folders.item.${index + 1}`}
                className="surface-card stagger-item flex items-center gap-3 p-4"
                style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <FolderIcon className="size-5" aria-hidden="true" />
                </span>

                {editing ? (
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitRename(folder);
                      }
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    aria-label="Folder name"
                    autoFocus
                    data-ocid={`folders.rename_input.${index + 1}`}
                    className="h-9 flex-1 rounded-full"
                  />
                ) : (
                  <Link
                    to="/folder/$id"
                    params={{ id: key }}
                    data-ocid={`folders.link.${index + 1}`}
                    className="flex min-w-0 flex-1 flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="truncate font-display text-base font-semibold tracking-tight text-foreground">
                      {folder.name}
                    </span>
                    <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                      {count} {count === 1 ? "note" : "notes"} ·{" "}
                      {formatShortDate(folder.createdAt)}
                    </span>
                  </Link>
                )}

                <div className="flex shrink-0 items-center gap-1">
                  {editing ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Save folder name"
                        onClick={() => commitRename(folder)}
                        data-ocid={`folders.save_button.${index + 1}`}
                        className="size-9 rounded-full text-primary"
                      >
                        <Check className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Cancel rename"
                        onClick={() => setEditingId(null)}
                        data-ocid={`folders.cancel_button.${index + 1}`}
                        className="size-9 rounded-full text-muted-foreground"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Rename ${folder.name}`}
                        onClick={() => startRename(folder)}
                        data-ocid={`folders.edit_button.${index + 1}`}
                        className="size-9 rounded-full text-muted-foreground"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${folder.name}`}
                        onClick={() => setPendingDelete(folder)}
                        data-ocid={`folders.delete_button.${index + 1}`}
                        className="size-9 rounded-full text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete this folder?"
        description={`“${
          pendingDelete?.name ?? "This folder"
        }” will be removed. Notes inside it stay in your notebook and become unfiled.`}
        confirmLabel="Delete folder"
        destructive
        onConfirm={confirmDelete}
      />
    </motion.div>
  );
}
