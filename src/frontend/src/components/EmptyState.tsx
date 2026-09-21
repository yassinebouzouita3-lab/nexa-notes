import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

/** Shared empty state: illustration, headline, supporting copy, primary action. */
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-ocid="empty_state"
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="empty-illustration flex size-20 items-center justify-center">
        <span className="text-primary" aria-hidden="true">
          {icon ?? <FileText className="size-9" strokeWidth={1.5} />}
        </span>
      </div>
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {actionLabel && onAction ? (
        <Button
          type="button"
          onClick={onAction}
          data-ocid="empty_state.primary_button"
          className="mt-1 rounded-full px-5"
        >
          <Plus className="size-4" aria-hidden="true" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
