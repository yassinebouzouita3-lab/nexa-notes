/// Static service documentation for the Nexa Notes backend.
///
/// The document is a compile-time literal: this mixin reads no actor state and
/// takes no parameters, so it is safe to include from `main.mo` without wiring.
mixin () {
  /// Return the backend's API documentation as Markdown.
  public query func getApiDoc() : async Text {
    "# Nexa Notes Backend API\n\n" #
    "Owner-scoped note-taking service: notes, folders, tags, checklists and per-user\n" #
    "settings. Every collection is keyed by the calling principal, so a caller only\n" #
    "ever reads and writes their own data.\n\n" #
    "## Authentication and identity\n\n" #
    "All methods are callable by any principal, including anonymous ones, but every\n" #
    "method operates on the caller's own data. There is no cross-user read or write\n" #
    "path: the owner key is always the caller's principal, never a parameter.\n\n" #
    "The app's frontend pins an Internet Identity derivation origin, published at\n" #
    "`/.well-known/ii-derivation-origin` when available. An agent that already holds\n" #
    "the user's Internet Identity authorization derives the correct per-app principal\n" #
    "against that origin (for example `icp identity link web <name> --app <host>`).\n" #
    "Such a delegation acts with the user's full authority in this app until it\n" #
    "expires.\n\n" #
    "Registration is not required to call these methods. The authorization component\n" #
    "is included for platform compatibility, but the notes endpoints do not gate on a\n" #
    "registered role: a caller that has never signed in through the frontend still\n" #
    "owns an empty, private notes space. A principal derived against a different\n" #
    "origin is a different principal, and therefore sees a different notes space.\n\n" #
    "## Units and encodings\n\n" #
    "- `Id` is a `Nat`. Note, folder, tag and checklist-item ids come from separate\n" #
    "  monotonic counters and are unique within their own kind, not across kinds.\n" #
    "- `Timestamp` is an `Int` of nanoseconds since the Unix epoch (`Time.now()`).\n" #
    "  `createdAt` is set once at creation; `updatedAt` advances on every mutation.\n" #
    "- `RichText` is a `Text` carrying an HTML fragment (bold, italic, underline,\n" #
    "  headings, bullet and numbered lists).\n" #
    "- `folderId` is `?Id`; `null` means the note is not in any folder.\n" #
    "- `tagIds` is `[Id]`; unknown ids are ignored when listing.\n" #
    "- `Theme` is `#light | #dark | #automatic`; `#automatic` follows the system.\n" #
    "- `SortOrder` is `#newest | #oldest | #title | #favorites`.\n" #
    "- `NoteFilter` is `{ folderId : ?Id; tagId : ?Id; favoritesOnly : Bool;\n" #
    "  includeTrashed : Bool }`.\n\n" #
    "## Methods\n\n" #
    "### Notes\n\n" #
    "- `createNote(input : NoteInput) : Note` - create a note owned by the caller.\n" #
    "  `pinned` and `favorite` start `false`, `trashed` starts `false`.\n" #
    "- `updateNote(id : Id, patch : NotePatch) : ?Note` - partial autosave update.\n" #
    "  Returns `null` when the note does not exist for the caller. `NotePatch` is\n" #
    "  `{ title : ?Text; body : ?RichText; checklist : ?[ChecklistItem];\n" #
    "  folderId : ?Id; tagIds : ?[Id]; clearFolder : ?Bool; clearTitle : ?Bool;\n" #
    "  clearBody : ?Bool }`.\n" #
    "- `duplicateNote(id : Id) : ?Note` - independent copy titled `<title> (copy)`,\n" #
    "  with fresh note and checklist-item ids. `pinned` and `trashed` reset to\n" #
    "  `false`; `favorite` is carried over.\n" #
    "- `trashNote(id : Id) : Bool` - soft delete. Returns `false` if not found.\n" #
    "- `restoreNote(id : Id) : ?Note` - clear the trashed flag.\n" #
    "- `deleteNotePermanently(id : Id) : Bool` - irreversible removal.\n" #
    "- `setPinned(id : Id, pinned : Bool) : ?Note`\n" #
    "- `setFavorite(id : Id, favorite : Bool) : ?Note`\n" #
    "- `toggleChecklistItem(noteId : Id, itemId : Id) : ?Note` - flip one item's\n" #
    "  `completed` flag. Returns `null` when the note is missing **or** when no item\n" #
    "  with `itemId` exists in it.\n" #
    "- `listNotes(sort : SortOrder, filter : NoteFilter) : [Note]` - query. Pinned\n" #
    "  notes always sort ahead of unpinned ones; `sort` orders within each group.\n" #
    "- `searchNotes(term : Text) : [Note]` - query. Case-insensitive substring match\n" #
    "  across title, body and tag names. An empty term matches every non-trashed\n" #
    "  note. Trashed notes are always excluded. Results are pinned-first, then most\n" #
    "  recently updated.\n\n" #
    "### Folders\n\n" #
    "- `createFolder(name : Text) : Folder`\n" #
    "- `renameFolder(id : Id, name : Text) : ?Folder`\n" #
    "- `deleteFolder(id : Id) : Bool` - notes in the folder are moved to no folder\n" #
    "  rather than being deleted or orphaned.\n" #
    "- `listFolders() : [Folder]` - query, sorted case-insensitively by name.\n\n" #
    "### Tags\n\n" #
    "- `createTag(name : Text) : Tag`\n" #
    "- `deleteTag(id : Id) : Bool` - also removes the tag from every note.\n" #
    "- `listTags() : [Tag]` - query, sorted case-insensitively by name.\n\n" #
    "### Settings\n\n" #
    "- `getSettings() : Settings` - query. Returns defaults\n" #
    "  (`theme = #automatic`, `sortOrder = #newest`, `gridView = false`) when the\n" #
    "  caller has never saved settings.\n" #
    "- `updateSettings(settings : Settings) : Settings` - replaces the whole record.\n\n" #
    "### Sample data\n\n" #
    "- `seedSampleNotes() : [Note]` - seeds a starter set of notes, folders and tags\n" #
    "  for the caller on first launch. Idempotent: a second call returns the existing\n" #
    "  notes without creating duplicates.\n\n" #
    "## Lifecycle and polling\n\n" #
    "`seedSampleNotes` is the intended first call after sign-in. It is safe to call\n" #
    "on every launch; only the first call creates data. Notes move through\n" #
    "`active -> trashed -> (restored | permanently deleted)`. `listNotes` with\n" #
    "`includeTrashed = false` returns the active set; `includeTrashed = true` returns\n" #
    "the trash view. `searchNotes` never returns trashed notes.\n\n" #
    "All reads are `query` calls and can be polled freely. There is no server-side\n" #
    "push, so clients refresh by re-querying after a mutation.\n\n" #
    "## Mutation retry safety\n\n" #
    "- `createNote`, `duplicateNote`, `createFolder`, `createTag` and\n" #
    "  `seedSampleNotes` are **not** idempotent: retrying a call that already\n" #
    "  succeeded creates a second record. `seedSampleNotes` is the exception - it is\n" #
    "  guarded by a per-caller seeded flag.\n" #
    "- `updateNote`, `setPinned`, `setFavorite`, `trashNote`, `restoreNote`,\n" #
    "  `renameFolder` and `updateSettings` are idempotent: replaying them converges\n" #
    "  on the same state.\n" #
    "- `toggleChecklistItem` is **not** idempotent - it flips the flag, so a retry\n" #
    "  toggles it back. Read the returned note and re-issue only if the flag is wrong.\n" #
    "- `deleteNotePermanently` and `deleteTag` are destructive and irreversible.\n" #
    "  `deleteFolder` is destructive for the folder but preserves its notes.\n\n" #
    "## Errors, traps and gotchas\n\n" #
    "- Missing or unowned records are reported as `null` or `false`, not as a trap.\n" #
    "  A note id belonging to another principal behaves exactly like a missing id.\n" #
    "- **Optional patch fields cannot express clearing.** Generated Candid bindings\n" #
    "  encode both an absent option and a `null` option as `candid_none()`, so\n" #
    "  `updateNote` cannot distinguish \"leave unchanged\" from \"set to null\". This\n" #
    "  applies to `title`, `body` and `folderId`: passing `title = null`,\n" #
    "  `body = null` or `folderId = null` leaves the current value in place, and an\n" #
    "  empty string is likewise indistinguishable from \"no change\".\n" #
    "- **To clear a field, send its explicit boolean signal** in the patch:\n" #
    "  `clearFolder = true` sets `folderId` to `null`, `clearTitle = true` sets\n" #
    "  `title` to `\"\"`, and `clearBody = true` sets `body` to `\"\"`. Each signal\n" #
    "  takes precedence over its value field (`folderId`, `title`, `body`\n" #
    "  respectively). Existing callers that only send the value fields keep their\n" #
    "  previous \"leave unchanged\" behavior.\n" #
    "- Checklist item ids are stable across updates: an incoming item with a\n" #
    "  positive id keeps that id, and only items with id `<= 0` (new items) receive a\n" #
    "  fresh id. Clients should send `id = 0` for newly added items and echo back the\n" #
    "  ids they received for existing ones, otherwise `toggleChecklistItem` will not\n" #
    "  find the item and returns `null`.\n" #
    "- `updateNote` replaces the whole `checklist` array when `checklist` is present;\n" #
    "  it is not a per-item merge.\n" #
    "- `deleteFolder` and `deleteTag` rewrite every affected note and advance its\n" #
    "  `updatedAt`.\n" #
    "- All timestamps are nanoseconds; convert before formatting in the client.\n";
  };
};
