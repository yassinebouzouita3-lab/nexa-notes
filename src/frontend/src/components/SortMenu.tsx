import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SortOrder } from "@/types/notes";
import { ArrowUpDown } from "lucide-react";

interface SortMenuProps {
  value: SortOrder;
  onChange: (sort: SortOrder) => void;
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title (A–Z)" },
  { value: "favorites", label: "Favorites first" },
];

/** Dropdown that selects the note sort order. */
export function SortMenu({ value, onChange }: SortMenuProps) {
  const active = SORT_OPTIONS.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-ocid="sort.open_button"
          className="rounded-full"
        >
          <ArrowUpDown className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">{active?.label ?? "Sort"}</span>
          <span className="sm:hidden">Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        data-ocid="sort.dropdown_menu"
        className="w-48 rounded-xl"
      >
        <DropdownMenuLabel className="font-display text-xs uppercase tracking-wider text-muted-foreground">
          Sort notes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as SortOrder)}
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              data-ocid={`sort.option.${option.value}`}
              className="rounded-lg"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
