import { cn } from "@/lib/utils";

export interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  chips: FilterChip[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Accessible name for the chip rail. */
  label?: string;
  className?: string;
}

/** Horizontal, scrollable filter chip rail used on listing screens. */
export function FilterChips({
  chips,
  activeId,
  onSelect,
  label = "Filters",
  className,
}: FilterChipsProps) {
  return (
    <div
      data-ocid="filter.section"
      role="tablist"
      aria-label={label}
      className={cn(
        "scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0",
        className,
      )}
    >
      {chips.map((chip) => {
        const active = chip.id === activeId;
        return (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={active}
            data-ocid={`filter.tab.${chip.id}`}
            onClick={() => onSelect(chip.id)}
            className={cn(
              "transition-fast inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-transparent bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {chip.label}
            {typeof chip.count === "number" ? (
              <span
                className={cn(
                  "font-mono text-[0.6875rem] tabular-nums",
                  active
                    ? "text-primary-foreground/75"
                    : "text-muted-foreground/70",
                )}
              >
                {chip.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
