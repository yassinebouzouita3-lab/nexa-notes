import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTag, useTags } from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import type { Id } from "@/types/notes";
import { Check, Plus, Tag as TagIcon } from "lucide-react";
import { useState } from "react";

interface TagPickerProps {
  selectedIds: Id[];
  onChange: (ids: Id[]) => void;
}

/** Multi-select tag picker with inline tag creation. */
export function TagPicker({ selectedIds, onChange }: TagPickerProps) {
  const { data: tags = [] } = useTags();
  const createTag = useCreateTag();
  const [draft, setDraft] = useState("");

  const toggle = (id: Id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((value) => value !== id)
        : [...selectedIds, id],
    );
  };

  const handleCreate = () => {
    const name = draft.trim();
    if (!name) return;
    setDraft("");
    createTag.mutate(name, {
      onSuccess: (tag) => onChange([...selectedIds, tag.id]),
    });
  };

  return (
    <div data-ocid="tag.picker" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tags yet — create one below.
          </p>
        ) : (
          tags.map((tag) => {
            const active = selectedIds.includes(tag.id);
            return (
              <button
                key={tag.id.toString()}
                type="button"
                aria-pressed={active}
                data-ocid={`tag.option.${tag.id.toString()}`}
                onClick={() => toggle(tag.id)}
                className={cn(
                  "transition-fast inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-transparent bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {active ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <TagIcon className="size-3.5" aria-hidden="true" />
                )}
                {tag.name}
              </button>
            );
          })
        )}
      </div>

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
          placeholder="New tag name"
          aria-label="New tag name"
          data-ocid="tag.input"
          className="h-9 rounded-full"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCreate}
          disabled={!draft.trim() || createTag.isPending}
          data-ocid="tag.add_button"
          className="rounded-full"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>
    </div>
  );
}
