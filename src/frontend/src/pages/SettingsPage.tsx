import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useNotesUiStore,
  useSeedSampleNotes,
  useSettings,
  useUpdateSettings,
} from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import type { Settings, SortOrder, ThemePreference } from "@/types/notes";
import { DEFAULT_SETTINGS } from "@/types/notes";
import { LayoutGrid, List, Monitor, Moon, RotateCcw, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "automatic", label: "System", icon: Monitor },
];

/**
 * The backend `Theme` variant is `light | dark | automatic`, while next-themes
 * uses `light | dark | system` for the same three choices. Map at the boundary
 * so the persisted value is always a valid backend tag.
 */
function toNextThemes(theme: ThemePreference): "light" | "dark" | "system" {
  return theme === "automatic" ? "system" : theme;
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title (A–Z)" },
  { value: "favorites", label: "Favorites first" },
];

/** Settings: theme, default sort, default view and sample-note reset. */
export function SettingsPage() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const seedSampleNotes = useSeedSampleNotes();
  const { setTheme } = useTheme();

  const setSortOrder = useNotesUiStore((state) => state.setSortOrder);
  const setViewMode = useNotesUiStore((state) => state.setViewMode);

  const [draft, setDraft] = useState<Settings>(DEFAULT_SETTINGS);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  const persist = (next: Settings) => {
    setDraft(next);
    updateSettings.mutate(next);
  };

  const handleTheme = (theme: ThemePreference) => {
    setTheme(toNextThemes(theme));
    persist({ ...draft, theme });
  };

  const handleSort = (sortOrder: SortOrder) => {
    setSortOrder(sortOrder);
    persist({ ...draft, sortOrder });
  };

  const handleView = (gridView: boolean) => {
    setViewMode(gridView ? "grid" : "list");
    persist({ ...draft, gridView });
  };

  const handleReset = () => {
    seedSampleNotes.mutate();
    setConfirmReset(false);
  };

  return (
    <motion.div
      data-ocid="settings.page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5"
    >
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Tune how Nexa Notes looks and behaves on this device.
        </p>
      </header>

      <section className="surface-card flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
            Appearance
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose a theme, or follow your system setting.
          </p>
        </div>
        <div
          aria-label="Theme"
          data-ocid="settings.theme_group"
          className="grid grid-cols-3 gap-2"
        >
          {THEME_OPTIONS.map((option) => {
            const active = draft.theme === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                data-ocid={`settings.theme.${option.value}`}
                onClick={() => handleTheme(option.value)}
                className={cn(
                  "transition-fast flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface-card flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
            Default sort order
          </h2>
          <p className="text-sm text-muted-foreground">
            How notes are ordered when you open your notebook.
          </p>
        </div>
        <div
          aria-label="Default sort order"
          data-ocid="settings.sort_group"
          className="flex flex-col gap-2"
        >
          {SORT_OPTIONS.map((option) => {
            const active = draft.sortOrder === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                data-ocid={`settings.sort.${option.value}`}
                onClick={() => handleSort(option.value)}
                className={cn(
                  "transition-fast flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    active ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface-card flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
            Default view
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick the layout your notes open in.
          </p>
        </div>
        <div
          aria-label="Default view"
          data-ocid="settings.view_group"
          className="grid grid-cols-2 gap-2"
        >
          {[
            { grid: true, label: "Grid", icon: LayoutGrid },
            { grid: false, label: "List", icon: List },
          ].map((option) => {
            const active = draft.gridView === option.grid;
            const Icon = option.icon;
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={active}
                data-ocid={`settings.view.${option.label.toLowerCase()}`}
                onClick={() => handleView(option.grid)}
                className={cn(
                  "transition-fast flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface-card flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
            Sample notes
          </h2>
          <p className="text-sm text-muted-foreground">
            Add the starter notes that ship with Nexa Notes. They are only added
            once, and your own notes are never touched.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="sr-only">Add sample notes</Label>
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmReset(true)}
            disabled={seedSampleNotes.isPending}
            data-ocid="settings.reset_samples_button"
            className="w-fit rounded-full"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Add sample notes
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Add sample notes?"
        description="The starter notes will be added to your notebook if they are not already there. Notes you created yourself stay exactly as they are."
        confirmLabel="Add samples"
        onConfirm={handleReset}
      />
    </motion.div>
  );
}
