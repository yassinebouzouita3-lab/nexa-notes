import {
  checklistProgress,
  formatAbsoluteTime,
  formatRelativeTime,
  toPlainText,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Note, Tag } from "@/types/notes";
import { Link } from "@tanstack/react-router";
import { CheckSquare, Pin, Star } from "lucide-react";

interface NoteCardProps {
  note: Note;
  /** Tags resolved from the tag list, used for the tag pill. */
  tags?: Tag[];
  /** Grid cards are compact; list cards show a wider preview. */
  variant?: "grid" | "list";
  /** Stagger index for entrance animation. */
  index?: number;
}

/** Rounded note card with title, preview, tag pill, timestamp and indicators. */
export function NoteCard({
  note,
  tags = [],
  variant = "grid",
  index = 0,
}: NoteCardProps) {
  const preview = toPlainText(note.body);
  const progress = checklistProgress(note.checklist);
  const primaryTag = tags.find((tag) => note.tagIds.includes(tag.id));
  const isList = variant === "list";

  return (
    <Link
      to="/note/$id"
      params={{ id: note.id.toString() }}
      data-ocid={`note.item.${index + 1}`}
      aria-label={`Open note: ${note.title || "Untitled note"}`}
      className={cn(
        "surface-card group relative block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isList ? "p-4" : "flex flex-col p-4",
      )}
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      {note.pinned ? (
        <span
          className="pinned-rail absolute inset-y-3 left-0 w-1"
          aria-label="Pinned note"
          title="Pinned"
        />
      ) : null}

      <div
        className={cn("flex min-w-0 flex-1 flex-col gap-2", isList && "pr-2")}
      >
        <div className="flex items-center gap-2">
          {primaryTag ? (
            <span className="tag-pill inline-flex max-w-[9rem] items-center truncate px-2 py-0.5">
              {primaryTag.name}
            </span>
          ) : (
            <span className="tag-pill inline-flex items-center px-2 py-0.5">
              Note
            </span>
          )}
          {note.favorite ? (
            <Star
              className="size-3.5 shrink-0 fill-accent text-accent"
              aria-label="Favorite note"
            />
          ) : null}
        </div>

        <h3
          className={cn(
            "font-display font-semibold leading-snug tracking-tight text-foreground",
            isList ? "text-base" : "line-clamp-2 text-[0.9375rem]",
          )}
        >
          {note.title || "Untitled note"}
        </h3>

        {preview ? (
          <p
            className={cn(
              "text-sm leading-relaxed text-muted-foreground",
              isList ? "line-clamp-2" : "line-clamp-3",
            )}
          >
            {preview}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-3 pt-1">
          <time
            dateTime={formatAbsoluteTime(note.updatedAt)}
            title={formatAbsoluteTime(note.updatedAt)}
            className="font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground"
          >
            {formatRelativeTime(note.updatedAt)}
          </time>
          {progress ? (
            <span className="inline-flex items-center gap-1 font-mono text-[0.6875rem] text-muted-foreground">
              <CheckSquare className="size-3" aria-hidden="true" />
              {progress}
            </span>
          ) : null}
          {note.pinned ? (
            <Pin
              className="ml-auto size-3.5 shrink-0 text-accent"
              aria-hidden="true"
            />
          ) : null}
        </div>
      </div>
    </Link>
  );
}
