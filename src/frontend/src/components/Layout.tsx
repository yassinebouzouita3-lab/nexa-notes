import { useNotesUiStore } from "@/lib/notes-store";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Folder,
  LayoutGrid,
  List,
  Moon,
  NotebookPen,
  Search,
  Settings,
  Sun,
  Tags,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";

interface NavItem {
  to: string;
  label: string;
  icon: typeof NotebookPen;
  /** Match nested routes such as /folder/:id. */
  matchPrefix?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Notes", icon: NotebookPen },
  { to: "/folders", label: "Folders", icon: Folder, matchPrefix: "/folder" },
  { to: "/tags", label: "Tags", icon: Tags },
  { to: "/search", label: "Search", icon: Search },
];

const SECONDARY_NAV: NavItem[] = [
  { to: "/trash", label: "Trash", icon: Trash2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.to === "/") return pathname === "/";
  if (pathname === item.to) return true;
  return item.matchPrefix ? pathname.startsWith(item.matchPrefix) : false;
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      data-ocid="theme.toggle"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="transition-fast inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {isDark ? (
        <Sun className="size-[1.15rem]" aria-hidden="true" />
      ) : (
        <Moon className="size-[1.15rem]" aria-hidden="true" />
      )}
    </button>
  );
}

function ViewModeToggle() {
  const viewMode = useNotesUiStore((state) => state.viewMode);
  const toggleViewMode = useNotesUiStore((state) => state.toggleViewMode);
  const isGrid = viewMode === "grid";

  return (
    <button
      type="button"
      data-ocid="view.toggle"
      aria-label={isGrid ? "Switch to list view" : "Switch to grid view"}
      aria-pressed={!isGrid}
      onClick={toggleViewMode}
      className="transition-fast inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {isGrid ? (
        <List className="size-[1.15rem]" aria-hidden="true" />
      ) : (
        <LayoutGrid className="size-[1.15rem]" aria-hidden="true" />
      )}
    </button>
  );
}

function Wordmark() {
  return (
    <Link
      to="/"
      data-ocid="nav.home_link"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
        <NotebookPen className="size-[1.15rem]" aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Nexa Notes
      </span>
    </Link>
  );
}

function SideNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav
      data-ocid="nav.side"
      aria-label="Primary"
      className="hidden w-60 shrink-0 flex-col gap-1 border-r border-sidebar-border bg-sidebar px-3 py-5 md:flex"
    >
      <div className="px-2 pb-4">
        <Wordmark />
      </div>
      {PRIMARY_NAV.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            data-ocid={`nav.link.${item.label.toLowerCase()}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "transition-fast flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-[1.15rem] shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}

      <div className="my-3 h-px bg-sidebar-border" />

      {SECONDARY_NAV.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            data-ocid={`nav.link.${item.label.toLowerCase()}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "transition-fast flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-[1.15rem] shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav
      data-ocid="nav.bottom"
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-nav backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                data-ocid={`nav.link.${item.label.toLowerCase()}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "transition-fast flex min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[0.6875rem] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-[1.3rem]" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Responsive application shell: side nav on tablet/desktop, bottom nav on phones. */
export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isEditor = pathname.startsWith("/note/");

  return (
    <div className="flex min-h-dvh bg-background">
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
            <div className="md:hidden">
              <Wordmark />
            </div>
            <div className="hidden md:block">
              <Link
                to="/search"
                data-ocid="nav.search_link"
                className="transition-fast inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <Search className="size-4" aria-hidden="true" />
                Search notes
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {!isEditor ? <ViewModeToggle /> : null}
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-12">
          {children}
        </main>

        <footer className="mx-auto w-full max-w-6xl px-4 pb-24 pt-2 sm:px-6 md:pb-8">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      <BottomNav />
    </div>
  );
}
