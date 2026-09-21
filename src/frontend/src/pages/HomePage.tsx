import { EmptyState } from "@/components/EmptyState";
import { type FilterChip, FilterChips } from "@/components/FilterChips";
import { LoadingState } from "@/components/LoadingState";
import { NoteCard } from "@/components/NoteCard";
import { SortMenu } from "@/components/SortMenu";
import { ViewToggle } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import {
  useCreateNote,
  useFolders,
  useNotes,
  useNotesActor,
  useNotesUiStore,
  useSeedSampleNotes,
  useTags,
} from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import { DEFAULT_NOTE_FILTER, type NoteFilter } from "@/types/notes";
import { useNavigate } from "@tanstack/react-router";
import { NotebookPen, Plus, Star } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";

const ALL_CHIP = "all";
const FAVORITES_CHIP = "favorites";

/** Home listing: filter chips, sort, view toggle, pinned-first note grid. */
export function HomePage() {
  const navigate = useNavigate();
  const viewMode = useNotesUiStore((state) => state.viewMode);
  const setViewMode = useNotesUiStore((state) => state.setViewMode);
  const sortOrder = useNotesUiStore((state) => state.sortOrder);
  const setSortOrder = useNotesUiStore((state) => state.setSortOrder);
  const activeFolderId = useNotesUiStore((state) => state.activeFolderId);
  const setActiveFolderId = useNotesUiStore((state) => state.setActiveFolderId);
  const activeTagId = useNotesUiStore((state) => state.activeTagId);
  const setActiveTagId = useNotesUiStore((state) => state.setActiveTagId);
  const favoritesOnly = useNotesUiStore((state) => state.favoritesOnly);
  const setFavoritesOnly = useNotesUiStore((state) => state.setFavoritesOnly);

  const { data: folders = [] } = useFolders();
  const { data: tags = [] } = useTags();

  const filter: NoteFilter = useMemo(
    () => ({
      ...DEFAULT_NOTE_FILTER,
      folderId: activeFolderId,
      tagId: activeTagId,
      favoritesOnly,
    }),
    [activeFolderId, activeTagId, favoritesOnly],
  );

  const { data: notes = [], isLoading } = useNotes(sortOrder, filter);
  const { notes: actor } = useNotesActor();
  const createNote = useCreateNote();
  const seedSampleNotes = useSeedSampleNotes();
  const seeded = useRef(false);

  // First launch: seed sample notes once the backend is ready and the library
  // is confirmed empty. `isLoading` is false for a disabled query, so gate on
  // actor readiness and only mark as seeded after a successful seed.
  useEffect(() => {
    if (seeded.current || !actor || isLoading) return;
    if (notes.length > 0) return;
    seedSampleNotes.mutate(undefined, {
      onSuccess: () => {
        seeded.current = true;
      },
    });
  }, [actor, isLoading, notes.length, seedSampleNotes]);

  const chips: FilterChip[] = useMemo(() => {
    const base: FilterChip[] = [{ id: ALL_CHIP, label: "All notes" }];
    if (folders.length > 0) {
      base.push(
        ...folders.map((folder) => ({
          id: `folder:${folder.id.toString()}`,
          label: folder.name,
        })),
      );
    }
    if (tags.length > 0) {
      base.push(
        ...tags.map((tag) => ({
          id: `tag:${tag.id.toString()}`,
          label: `#${tag.name}`,
        })),
      );
    }
    base.push({ id: FAVORITES_CHIP, label: "Favorites" });
    return base;
  }, [folders, tags]);

  const activeChipId = favoritesOnly
    ? FAVORITES_CHIP
    : activeFolderId !== null
      ? `folder:${activeFolderId.toString()}`
      : activeTagId !== null
        ? `tag:${activeTagId.toString()}`
        : ALL_CHIP;

  const handleChipSelect = (id: string) => {
    if (id === ALL_CHIP) {
      setActiveFolderId(null);
      setActiveTagId(null);
      setFavoritesOnly(false);
      return;
    }
    if (id === FAVORITES_CHIP) {
      setActiveFolderId(null);
      setActiveTagId(null);
      setFavoritesOnly(true);
      return;
    }
    if (id.startsWith("folder:")) {
      setActiveFolderId(BigInt(id.slice("folder:".length)));
      setActiveTagId(null);
      setFavoritesOnly(false);
      return;
    }
    setActiveTagId(BigInt(id.slice("tag:".length)));
    setActiveFolderId(null);
    setFavoritesOnly(false);
  };

  const handleCreate = () => {
    createNote.mutate(
      {
        title: "",
        body: "",
        checklist: [],
        folderId: activeFolderId,
        tagIds: [],
      },
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

  const pinned = notes.filter((note) => note.pinned);
  const rest = notes.filter((note) => !note.pinned);
  const ordered = [...pinned, ...rest];
  const isFiltered =
    activeFolderId !== null || activeTagId !== null || favoritesOnly;

  return (
    <motion.div
      data-ocid="home.page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            All notes
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Gathering your notes…"
              : `${notes.length} ${notes.length === 1 ? "note" : "notes"}${
                  pinned.length > 0 ? ` · ${pinned.length} pinned` : ""
                }`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SortMenu value={sortOrder} onChange={setSortOrder} />
          <ViewToggle value={viewMode} onChange={setViewMode} />
        </div>
      </header>

      <FilterChips
        chips={chips}
        activeId={activeChipId}
        onSelect={handleChipSelect}
        label="Filter notes"
      />

      {isLoading ? (
        <LoadingState variant={viewMode} />
      ) : ordered.length === 0 ? (
        <EmptyState
          icon={
            isFiltered ? (
              <Star className="size-9" strokeWidth={1.5} />
            ) : (
              <NotebookPen className="size-9" strokeWidth={1.5} />
            )
          }
          title={
            isFiltered
              ? "Nothing matches this filter"
              : "Your notebook is empty"
          }
          description={
            isFiltered
              ? "Try another folder, tag or clear the favorites filter to see all of your notes."
              : "Capture a thought, a list or a plan. Your first note is one tap away."
          }
          actionLabel={isFiltered ? "Clear filters" : "Create your first note"}
          onAction={
            isFiltered ? () => handleChipSelect(ALL_CHIP) : handleCreate
          }
        />
      ) : (
        <div
          data-ocid="notes.list"
          className={cn(viewMode === "grid" ? "notes-grid" : "notes-list")}
        >
          {ordered.map((note, index) => (
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
        aria-label="Create a new note"
        data-ocid="home.fab"
        className="fab fixed bottom-24 right-5 z-40 size-14 rounded-full p-0 md:bottom-8 md:right-8"
      >
        <Plus className="size-6" aria-hidden="true" />
      </Button>
    </motion.div>
  );
}
