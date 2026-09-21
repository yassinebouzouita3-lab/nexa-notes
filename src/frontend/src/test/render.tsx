import { ThemeProvider } from "@/components/ThemeProvider";
import type { NotesBackend } from "@/types/notes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { setTestActor } from "./setup";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * Renders a component inside the same providers the app uses: a fresh
 * `QueryClient` (retries off so failures surface immediately), the theme
 * provider, and a memory router. The backend actor is installed through the
 * `@caffeineai/core-infrastructure` mock in `setup.ts`.
 *
 * A router is always present because `NoteCard` and the pages use `Link` and
 * `useNavigate`, which throw outside a router context. The component under test
 * is mounted at `/` unless `renderAtRoute` is used.
 */
export function renderWithProviders(
  ui: ReactNode,
  actor: NotesBackend,
): RenderResult {
  setTestActor(actor);
  const queryClient = makeQueryClient();

  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <>{ui}</>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

/**
 * Renders a component at a real route so `useNavigate`, `Link` and route params
 * behave as they do in the app. `path` is the route pattern (e.g. `/note/$id`)
 * and `initialEntry` the concrete URL (e.g. `/note/1`).
 */
export function renderAtRoute(
  component: () => ReactNode,
  path: string,
  initialEntry: string,
  actor: NotesBackend,
): RenderResult {
  setTestActor(actor);
  const queryClient = makeQueryClient();

  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const route = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([route]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
