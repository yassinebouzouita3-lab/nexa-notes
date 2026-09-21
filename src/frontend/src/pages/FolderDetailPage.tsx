import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { NoteCard } from "@/components/NoteCard";
import { SortMenu } from "@/components/SortMenu";
import { ViewToggle } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import {
  useCreateNote,
  useFolders,
  useNotes,
  useNotesUiStore,
  useTags,
} from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import { DEFAULT_NOTE_FILTER, type Id } from "@/types/notes";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FolderOpen, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";

const routeApi = getRouteApi("/folder/$id");

/** Notes filtered to a single folder. */
export function FolderDetailPage() {
  const { id: idParam } = routeApi.useParams();
  const navigate = useNavigate();
  const folderId: Id = BigInt(idParam);

  const { data: folders = [] } = useFolders();
  const { data: tags = [] } = useTags();
  const viewMode = useNotesUiStore((state) => state.viewMode);
  const setViewMode = useNotesUiStore((state) => state.setViewMode);
  const sortOrder = useNotesUiStore((state) => state.sortOrder);
  const setSortOrder = useNotesUiStore((state) => state.setSortOrder);

  const filter = useMemo(
    () => ({ ...DEFAULT_NOTE_FILTER, folderId }),
    [folderId],
  );
  const { data: notes = [], isLoading } = useNotes(sortOrder, filter);
  const createNote = useCreateNote();

  const folder = folders.find((entry) => entry.id === folderId);

  const handleCreate = () => {
    createNote.mutate(
      { title: "", body: "", checklist: [], folderId, tagIds: [] },
      {
        onSuccess: (note) => {
          void navigate({
            to: "/note/$id",
            params: { id: note.id.toString() },
          });
        },
      },
    );
  };

  return (
    <motion.div
      data-ocid="folder.page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => void navigate({ to: "/folders" })}
        data-ocid="folder.back_button"
        className="w-fit rounded-full"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All folders
      </Button>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {folder?.name ?? "Folder"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Gathering notes…"
              : `${notes.length} ${notes.length === 1 ? "note" : "notes"} in this folder`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SortMenu value={sortOrder} onChange={setSortOrder} />
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </header>

      {isLoading ? (
        <LoadingState variant={viewMode} />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="size-9" strokeWidth={1.5} />}
          title="This folder is empty"
          description="Add a note here to start filling this folder with related ideas."
          actionLabel="New note in this folder"
          onAction={handleCreate}
        />
      ) : (
        <div
          data-ocid="folder.notes_list"
          className={cn(viewMode === "grid" ? "notes-grid" : "notes-list")}
        >
          {notes.map((note, index) => (
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

      <Button
        type="button"
        onClick={handleCreate}
        disabled={createNote.isPending}
        aria-label="Create a new note in this folder"
        data-ocid="folder.fab"
        className="fab fixed bottom-24 right-5 z-40 size-14 rounded-full p-0 md:bottom-8 md:right-8"
      >
        <Plus className="size-6" aria-hidden="true" />
      </Button>
    </motion.div>
  );
}
