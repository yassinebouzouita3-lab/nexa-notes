import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { NoteCard } from "@/components/NoteCard";
import { ViewToggle } from "@/components/ViewToggle";
import { Input } from "@/components/ui/input";
import { useNotesUiStore, useSearchNotes, useTags } from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

/** Instant global search across note titles, body text and tags. */
export function SearchPage() {
  const [term, setTerm] = useState("");
  const viewMode = useNotesUiStore((state) => state.viewMode);
  const setViewMode = useNotesUiStore((state) => state.setViewMode);
  const { data: tags = [] } = useTags();
  const { data: results = [], isFetching } = useSearchNotes(term);
  const trimmed = term.trim();

  return (
    <motion.div
      data-ocid="search.page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-5"
    >
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Search
        </h1>
        <p className="text-sm text-muted-foreground">
          Find any note by title, content or tag.
        </p>
      </header>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search notes…"
            aria-label="Search notes"
            autoFocus
            data-ocid="search.input"
            className="h-11 rounded-full pl-10 pr-10"
          />
          {term ? (
            <button
              type="button"
              onClick={() => setTerm("")}
              aria-label="Clear search"
              data-ocid="search.clear_button"
              className="transition-fast absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {trimmed.length === 0 ? (
        <EmptyState
          icon={<Search className="size-9" strokeWidth={1.5} />}
          title="Start typing to search"
          description="Results appear instantly as you type — across every title, body and tag in your notebook."
        />
      ) : isFetching ? (
        <LoadingState variant={viewMode} count={4} />
      ) : results.length === 0 ? (
        <EmptyState
          icon={<Search className="size-9" strokeWidth={1.5} />}
          title={`No notes match “${trimmed}”`}
          description="Try a shorter phrase, a different spelling, or search for one of your tags."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {results.length} {results.length === 1 ? "result" : "results"} for “
            {trimmed}”
          </p>
          <div
            data-ocid="search.results"
            className={cn(viewMode === "grid" ? "notes-grid" : "notes-list")}
          >
            {results.map((note, index) => (
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
        </>
      )}
    </motion.div>
  );
}
