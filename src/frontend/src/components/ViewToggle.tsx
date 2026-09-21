import type { ViewMode } from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const OPTIONS: { mode: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { mode: "grid", label: "Grid view", icon: LayoutGrid },
  { mode: "list", label: "List view", icon: List },
];

/** Segmented grid/list switch. The chosen mode is persisted by the UI store. */
export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      data-ocid="view.toggle"
      aria-label="Note layout"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = option.mode === value;
        const Icon = option.icon;
        return (
          <button
            key={option.mode}
            type="button"
            aria-label={option.label}
            aria-pressed={active}
            data-ocid={`view.${option.mode}_button`}
            onClick={() => onChange(option.mode)}
            className={cn(
              "transition-fast inline-flex size-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
