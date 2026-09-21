/**
 * Frontend mirror of the backend notes contract (`src/backend/types/notes.mo`
 * and `src/backend/types/common.mo`). Kept hand-written so the UI can be built
 * and typechecked before `pnpm bindgen` regenerates `backend.d.ts`.
 */

/** Stable identifier for a note, folder, tag or checklist item. */
export type Id = bigint;

/** Nanosecond timestamp (`Time.now()`). */
export type Timestamp = bigint;

/** Rich-text body stored as an HTML fragment. */
export type RichText = string;

/** A single checklist/task item inside a note. */
export interface ChecklistItem {
  id: Id;
  text: string;
  completed: boolean;
}

/** A note as returned to the client. */
export interface Note {
  id: Id;
  title: string;
  body: RichText;
  checklist: ChecklistItem[];
  folderId: Id | null;
  tagIds: Id[];
  pinned: boolean;
  favorite: boolean;
  trashed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Fields accepted when creating a note. */
export interface NoteInput {
  title: string;
  body: RichText;
  checklist: ChecklistItem[];
  folderId: Id | null;
  tagIds: Id[];
}

/** Fields accepted when updating a note (autosave). */
export interface NotePatch {
  title?: string;
  body?: RichText;
  checklist?: ChecklistItem[];
  folderId?: Id | null;
  tagIds?: Id[];
  /** Explicitly clear the title (backend sets it to ""). */
  clearTitle?: boolean;
  /** Explicitly clear the body (backend sets it to ""). */
  clearBody?: boolean;
  /** Explicitly remove the note from its folder (backend sets it to null). */
  clearFolder?: boolean;
}

/** A folder / custom category. */
export interface Folder {
  id: Id;
  name: string;
  createdAt: Timestamp;
}

/** A tag. */
export interface Tag {
  id: Id;
  name: string;
  createdAt: Timestamp;
}

/** Sort order for note listings. */
export type SortOrder = "newest" | "oldest" | "title" | "favorites";

/** Filter applied when listing notes. */
export interface NoteFilter {
  folderId: Id | null;
  tagId: Id | null;
  favoritesOnly: boolean;
  includeTrashed: boolean;
}

/**
 * Theme preference, mirroring the backend `Theme` variant
 * (`src/backend/types/notes.mo`): `light | dark | automatic`.
 *
 * `automatic` is the backend tag for "follow the system". next-themes uses its
 * own `"system"` value for the same concept, so the UI maps between the two at
 * the boundary (see `SettingsPage`).
 */
export type ThemePreference = "light" | "dark" | "automatic";

/** Per-user application settings. */
export interface Settings {
  theme: ThemePreference;
  sortOrder: SortOrder;
  gridView: boolean;
}

/** Generic failure returned by note/folder/tag operations. */
export type AppError =
  | { __kind__: "notFound"; notFound: Id }
  | { __kind__: "notAuthorized"; notAuthorized: null }
  | { __kind__: "invalidInput"; invalidInput: string };

/** The notes surface of the backend actor, as exposed by the notes mixin. */
export interface NotesBackend {
  createNote(input: NoteInput): Promise<Note>;
  updateNote(id: Id, patch: NotePatch): Promise<Note | null>;
  duplicateNote(id: Id): Promise<Note | null>;
  trashNote(id: Id): Promise<boolean>;
  restoreNote(id: Id): Promise<Note | null>;
  deleteNotePermanently(id: Id): Promise<boolean>;
  setPinned(id: Id, pinned: boolean): Promise<Note | null>;
  setFavorite(id: Id, favorite: boolean): Promise<Note | null>;
  toggleChecklistItem(noteId: Id, itemId: Id): Promise<Note | null>;
  listNotes(sort: SortOrder, filter: NoteFilter): Promise<Note[]>;
  searchNotes(term: string): Promise<Note[]>;
  createFolder(name: string): Promise<Folder>;
  renameFolder(id: Id, name: string): Promise<Folder | null>;
  deleteFolder(id: Id): Promise<boolean>;
  listFolders(): Promise<Folder[]>;
  createTag(name: string): Promise<Tag>;
  deleteTag(id: Id): Promise<boolean>;
  listTags(): Promise<Tag[]>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<Settings>;
  seedSampleNotes(): Promise<Note[]>;
}

/** Default filter used by the home listing. */
export const DEFAULT_NOTE_FILTER: NoteFilter = {
  folderId: null,
  tagId: null,
  favoritesOnly: false,
  includeTrashed: false,
};

/** Default settings applied before the backend responds. */
export const DEFAULT_SETTINGS: Settings = {
  theme: "automatic",
  sortOrder: "newest",
  gridView: true,
};
