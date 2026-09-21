import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface ChecklistItem {
    id: Id;
    text: string;
    completed: boolean;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Folder {
    id: Id;
    name: string;
    createdAt: Timestamp;
}
export type Id = bigint;
export interface Note {
    id: Id;
    title: string;
    body: RichText;
    createdAt: Timestamp;
    tagIds: Array<Id>;
    updatedAt: Timestamp;
    pinned: boolean;
    trashed: boolean;
    checklist: Array<ChecklistItem>;
    folderId?: Id;
    favorite: boolean;
}
export interface NoteFilter {
    tagId?: Id;
    favoritesOnly: boolean;
    includeTrashed: boolean;
    folderId?: Id;
}
export interface NoteInput {
    title: string;
    body: RichText;
    tagIds: Array<Id>;
    checklist: Array<ChecklistItem>;
    folderId?: Id;
}
export interface NotePatch {
    title?: string;
    body?: RichText;
    tagIds?: Array<Id>;
    clearFolder?: boolean;
    checklist?: Array<ChecklistItem>;
    clearBody?: boolean;
    folderId?: Id;
    clearTitle?: boolean;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type RichText = string;
export interface Settings {
    theme: Theme;
    sortOrder: SortOrder;
    gridView: boolean;
}
export interface Tag {
    id: Id;
    name: string;
    createdAt: Timestamp;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum SortOrder {
    title = "title",
    favorites = "favorites",
    newest = "newest",
    oldest = "oldest"
}
export enum Theme {
    dark = "dark",
    automatic = "automatic",
    light = "light"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Create a folder.
     */
    createFolder(name: string): Promise<Folder>;
    /**
     * / Create a new note for the caller.
     */
    createNote(input: NoteInput): Promise<Note>;
    /**
     * / Create a tag.
     */
    createTag(name: string): Promise<Tag>;
    /**
     * / Delete a folder.
     */
    deleteFolder(id: Id): Promise<boolean>;
    /**
     * / Permanently delete a note.
     */
    deleteNotePermanently(id: Id): Promise<boolean>;
    /**
     * / Delete a tag.
     */
    deleteTag(id: Id): Promise<boolean>;
    /**
     * / Duplicate a note into an independent copy.
     */
    duplicateNote(id: Id): Promise<Note | null>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Return the backend's API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Read the caller's settings.
     */
    getSettings(): Promise<Settings>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List the caller's folders.
     */
    listFolders(): Promise<Array<Folder>>;
    /**
     * / List the caller's notes with sort and filters.
     */
    listNotes(sort: SortOrder, filter: NoteFilter): Promise<Array<Note>>;
    /**
     * / List the caller's tags.
     */
    listTags(): Promise<Array<Tag>>;
    /**
     * / Rename a folder.
     */
    renameFolder(id: Id, name: string): Promise<Folder | null>;
    /**
     * / Restore a note from trash.
     */
    restoreNote(id: Id): Promise<Note | null>;
    schema(): Promise<string>;
    /**
     * / Search the caller's notes across title, body and tags.
     */
    searchNotes(term: string): Promise<Array<Note>>;
    /**
     * / Seed sample notes for the caller on first launch.
     */
    seedSampleNotes(): Promise<Array<Note>>;
    /**
     * / Mark or unmark a note as favorite.
     */
    setFavorite(id: Id, favorite: boolean): Promise<Note | null>;
    /**
     * / Pin or unpin a note.
     */
    setPinned(id: Id, pinned: boolean): Promise<Note | null>;
    /**
     * / Toggle a checklist item inside a note.
     */
    toggleChecklistItem(noteId: Id, itemId: Id): Promise<Note | null>;
    /**
     * / Move a note to trash.
     */
    trashNote(id: Id): Promise<boolean>;
    /**
     * / Apply a partial update (autosave) to a note.
     */
    updateNote(id: Id, patch: NotePatch): Promise<Note | null>;
    /**
     * / Persist the caller's settings.
     */
    updateSettings(settings: Settings): Promise<Settings>;
}
