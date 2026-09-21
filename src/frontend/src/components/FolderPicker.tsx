import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateFolder, useFolders } from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import type { Id } from "@/types/notes";
import { Check, Folder as FolderIcon, Plus } from "lucide-react";
import { useState } from "react";

interface FolderPickerProps {
  selectedId: Id | null;
  onChange: (id: Id | null) => void;
}

/** Single-select folder picker with inline folder creation. */
export function FolderPicker({ selectedId, onChange }: FolderPickerProps) {
  const { data: folders = [] } = useFolders();
  const createFolder = useCreateFolder();
  const [draft, setDraft] = useState("");

  const handleCreate = () => {
    const name = draft.trim();
    if (!name) return;
    setDraft("");
    createFolder.mutate(name, {
      onSuccess: (folder) => onChange(folder.id),
    });
  };

  return (
    <div data-ocid="folder.picker" className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={selectedId === null}
          data-ocid="folder.option.none"
          onClick={() => onChange(null)}
          className={cn(
            "transition-fast inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            selectedId === null
              ? "border-transparent bg-primary text-primary-foreground shadow-xs"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {selectedId === null ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : null}
          No folder
        </button>

        {folders.map((folder) => {
          const active = selectedId === folder.id;
          return (
            <button
              key={folder.id.toString()}
              type="button"
              aria-pressed={active}
              data-ocid={`folder.option.${folder.id.toString()}`}
              onClick={() => onChange(folder.id)}
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
                <FolderIcon className="size-3.5" aria-hidden="true" />
              )}
              {folder.name}
            </button>
          );
        })}
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
          placeholder="New folder name"
          aria-label="New folder name"
          data-ocid="folder.input"
          className="h-9 rounded-full"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCreate}
          disabled={!draft.trim() || createFolder.isPending}
          data-ocid="folder.add_button"
          className="rounded-full"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>
    </div>
  );
}
