import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FolderDetailPage } from "@/pages/FolderDetailPage";
import { FoldersPage } from "@/pages/FoldersPage";
import { HomePage } from "@/pages/HomePage";
import { NoteEditorPage } from "@/pages/NoteEditorPage";
import { SearchPage } from "@/pages/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TagsPage } from "@/pages/TagsPage";
import { TrashPage } from "@/pages/TrashPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const noteEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/note/$id",
  component: NoteEditorPage,
});

const foldersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/folders",
  component: FoldersPage,
});

const folderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/folder/$id",
  component: FolderDetailPage,
});

const tagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tags",
  component: TagsPage,
});

const trashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trash",
  component: TrashPage,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  component: SearchPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  noteEditorRoute,
  foldersRoute,
  folderDetailRoute,
  tagsRoute,
  trashRoute,
  searchRoute,
  settingsRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
