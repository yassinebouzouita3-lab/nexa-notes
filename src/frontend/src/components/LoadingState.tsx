import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SKELETON_IDS = Array.from({ length: 6 }, (_, i) => `note-skeleton-${i}`);

interface LoadingStateProps {
  /** Number of placeholder cards to render. */
  count?: number;
  /** Match the layout the skeletons stand in for. */
  variant?: "grid" | "list";
  className?: string;
}

/** Layout-matched shimmer skeletons shown while notes load. */
export function LoadingState({
  count = 6,
  variant = "grid",
  className,
}: LoadingStateProps) {
  const ids = SKELETON_IDS.slice(0, count);

  if (variant === "list") {
    return (
      <div
        data-ocid="loading_state"
        className={cn("notes-list", className)}
        aria-busy="true"
      >
        {ids.map((id) => (
          <div
            key={id}
            className="surface-card flex items-start gap-4 p-4"
            style={{ animation: "none" }}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-4/5 rounded-md" />
            </div>
            <Skeleton className="size-8 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      data-ocid="loading_state"
      className={cn("notes-grid", className)}
      aria-busy="true"
    >
      {ids.map((id) => (
        <div key={id} className="surface-card flex flex-col gap-3 p-4">
          <Skeleton className="h-3 w-14 rounded-full" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-5/6 rounded-md" />
          <div className="mt-1 flex items-center justify-between">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="size-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
