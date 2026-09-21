import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChecklistItem, Id } from "@/types/notes";
import { Plus, Trash2 } from "lucide-react";

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  /** Toggle an existing item through the backend so completion persists. */
  onToggleItem?: (itemId: Id) => void;
}

/** Editable checklist: add, rename, toggle and remove task items. */
export function ChecklistEditor({
  items,
  onChange,
  onToggleItem,
}: ChecklistEditorProps) {
  const addItem = () => {
    onChange([
      ...items,
      { id: -BigInt(Date.now()), text: "", completed: false },
    ]);
  };

  const updateText = (id: Id, text: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const removeItem = (id: Id) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const toggleItem = (item: ChecklistItem) => {
    // Flip locally first so the checkbox reflects the change immediately,
    // whether the item is persisted (positive id) or still a local draft.
    onChange(
      items.map((entry) =>
        entry.id === item.id
          ? { ...entry, completed: !entry.completed }
          : entry,
      ),
    );
    if (item.id > 0n && onToggleItem) {
      onToggleItem(item.id);
    }
  };

  return (
    <div data-ocid="checklist.editor" className="flex flex-col gap-2">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tasks yet. Add one to turn this note into a checklist.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, index) => (
            <li
              key={item.id.toString()}
              data-ocid={`checklist.item.${index + 1}`}
              className="group flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2"
            >
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item)}
                aria-label={`Mark "${item.text || "task"}" complete`}
                data-ocid={`checklist.checkbox.${index + 1}`}
              />
              <Input
                value={item.text}
                onChange={(event) => updateText(item.id, event.target.value)}
                placeholder="Task description"
                aria-label="Task description"
                data-ocid={`checklist.input.${index + 1}`}
                className={cn(
                  "h-8 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
                  item.completed && "text-muted-foreground line-through",
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove task ${index + 1}`}
                data-ocid={`checklist.delete_button.${index + 1}`}
                className="size-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        data-ocid="checklist.add_button"
        className="w-fit rounded-full"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add task
      </Button>
    </div>
  );
}
