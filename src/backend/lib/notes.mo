import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/notes";
import Common "../types/common";

module {
  public type Id = Common.Id;
  public type Note = Types.Note;
  public type NoteInput = Types.NoteInput;
  public type NotePatch = Types.NotePatch;
  public type ChecklistItem = Types.ChecklistItem;
  public type Folder = Types.Folder;
  public type Tag = Types.Tag;
  public type Settings = Types.Settings;
  public type SortOrder = Common.SortOrder;
  public type NoteFilter = Common.NoteFilter;
  public type AppError = Common.AppError;

  /// Mutable id counters, shared by reference between the actor and the mixin.
  public type Counters = {
    var nextNoteId : Id;
    var nextFolderId : Id;
    var nextTagId : Id;
    var nextItemId : Id;
  };

  /// Mutable state shared with the API mixin. Every collection is keyed by the
  /// owning principal so each caller only ever sees their own data.
  public type State = {
    notes : Map.Map<Principal, Map.Map<Id, Note>>;
    folders : Map.Map<Principal, Map.Map<Id, Folder>>;
    tags : Map.Map<Principal, Map.Map<Id, Tag>>;
    settings : Map.Map<Principal, Settings>;
    seeded : Map.Map<Principal, Bool>;
    counters : Counters;
  };

  public func defaultSettings() : Settings {
    { theme = #automatic; sortOrder = #newest; gridView = false };
  };

  func notesOf(state : State, owner : Principal) : Map.Map<Id, Note> {
    switch (state.notes.get(owner)) {
      case (?m) { m };
      case null {
        let m = Map.empty<Id, Note>();
        state.notes.add(owner, m);
        m;
      };
    };
  };

  func foldersOf(state : State, owner : Principal) : Map.Map<Id, Folder> {
    switch (state.folders.get(owner)) {
      case (?m) { m };
      case null {
        let m = Map.empty<Id, Folder>();
        state.folders.add(owner, m);
        m;
      };
    };
  };

  func tagsOf(state : State, owner : Principal) : Map.Map<Id, Tag> {
    switch (state.tags.get(owner)) {
      case (?m) { m };
      case null {
        let m = Map.empty<Id, Tag>();
        state.tags.add(owner, m);
        m;
      };
    };
  };

  func nextNoteId(state : State) : Id {
    let id = state.counters.nextNoteId;
    state.counters.nextNoteId := id + 1;
    id;
  };

  func nextFolderId(state : State) : Id {
    let id = state.counters.nextFolderId;
    state.counters.nextFolderId := id + 1;
    id;
  };

  func nextTagId(state : State) : Id {
    let id = state.counters.nextTagId;
    state.counters.nextTagId := id + 1;
    id;
  };

  func nextItemId(state : State) : Id {
    let id = state.counters.nextItemId;
    state.counters.nextItemId := id + 1;
    id;
  };

  /// Ensure every checklist item has a unique, stable id. An incoming item that
  /// already carries a positive id keeps it, so ids held by the UI stay valid
  /// across updates; only new items (id <= 0) are assigned a fresh id.
  func assignItemIds(state : State, items : [ChecklistItem]) : [ChecklistItem] {
    items.map(func item =
      if (item.id > 0) {
        item;
      } else {
        { id = nextItemId(state); text = item.text; completed = item.completed };
      }
    );
  };

  /// Create a note owned by `owner` and return it.
  public func createNote(state : State, owner : Principal, input : NoteInput) : Note {
    let now = Time.now();
    let note : Note = {
      id = nextNoteId(state);
      title = input.title;
      body = input.body;
      checklist = assignItemIds(state, input.checklist);
      folderId = input.folderId;
      tagIds = input.tagIds;
      pinned = false;
      favorite = false;
      trashed = false;
      createdAt = now;
      updatedAt = now;
    };
    notesOf(state, owner).add(note.id, note);
    note;
  };

  /// Apply a partial update (autosave) to a note owned by `owner`.
  public func updateNote(state : State, owner : Principal, id : Id, patch : NotePatch) : ?Note {
    let notes = notesOf(state, owner);
    switch (notes.get(id)) {
      case null { null };
      case (?note) {
        let updated : Note = {
          id = note.id;
          title = (if (patch.clearTitle == ?true) {
            "";
          } else {
            patch.title ?? note.title;
          });
          body = (if (patch.clearBody == ?true) {
            "";
          } else {
            patch.body ?? note.body;
          });
          checklist = switch (patch.checklist) {
            case (?items) { assignItemIds(state, items) };
            case null { note.checklist };
          };
          folderId = (if (patch.clearFolder == ?true) {
            null;
          } else {
            switch (patch.folderId) {
              case (?f) { ?f };
              case null { note.folderId };
            };
          });
          tagIds = patch.tagIds ?? note.tagIds;
          pinned = note.pinned;
          favorite = note.favorite;
          trashed = note.trashed;
          createdAt = note.createdAt;
          updatedAt = Time.now();
        };
        notes.add(id, updated);
        ?updated;
      };
    };
  };

  /// Duplicate a note into an independent copy owned by `owner`.
  public func duplicateNote(state : State, owner : Principal, id : Id) : ?Note {
    let notes = notesOf(state, owner);
    switch (notes.get(id)) {
      case null { null };
      case (?note) {
        let now = Time.now();
        let copy : Note = {
          id = nextNoteId(state);
          title = note.title # " (copy)";
          body = note.body;
          checklist = assignItemIds(state, note.checklist);
          folderId = note.folderId;
          tagIds = note.tagIds;
          pinned = false;
          favorite = note.favorite;
          trashed = false;
          createdAt = now;
          updatedAt = now;
        };
        notes.add(copy.id, copy);
        ?copy;
      };
    };
  };

  /// Move a note to trash (soft delete).
  public func trashNote(state : State, owner : Principal, id : Id) : Bool {
    let notes = notesOf(state, owner);
    switch (notes.get(id)) {
      case null { false };
      case (?note) {
        notes.add(id, { note with trashed = true; updatedAt = Time.now() });
        true;
      };
    };
  };

  /// Restore a note from trash.
  public func restoreNote(state : State, owner : Principal, id : Id) : ?Note {
    let notes = notesOf(state, owner);
    switch (notes.get(id)) {
      case null { null };
      case (?note) {
        let restored = { note with trashed = false; updatedAt = Time.now() };
        notes.add(id, restored);
        ?restored;
      };
    };
  };

  /// Permanently delete a note.
  public func deleteNotePermanently(state : State, owner : Principal, id : Id) : Bool {
    let notes = notesOf(state, owner);
    switch (notes.get(id)) {
      case null { false };
      case (?_) {
        notes.remove(id);
        true;
      };
    };
  };

  /// Set the pinned flag on a note.
  public func setPinned(state : State, owner : Principal, id : Id, pinned : Bool) : ?Note {
    let notes = notesOf(state, owner);
    switch (notes.get(id)) {
      case null { null };
      case (?note) {
        let updated = { note with pinned; updatedAt = Time.now() };
        notes.add(id, updated);
        ?updated;
      };
    };
  };

  /// Set the favorite flag on a note.
  public func setFavorite(state : State, owner : Principal, id : Id, favorite : Bool) : ?Note {
    let notes = notesOf(state, owner);
    switch (notes.get(id)) {
      case null { null };
      case (?note) {
        let updated = { note with favorite; updatedAt = Time.now() };
        notes.add(id, updated);
        ?updated;
      };
    };
  };

  /// Toggle a checklist item's completed flag.
  public func toggleChecklistItem(state : State, owner : Principal, noteId : Id, itemId : Id) : ?Note {
    let notes = notesOf(state, owner);
    switch (notes.get(noteId)) {
      case null { null };
      case (?note) {
        var found = false;
        let items = note.checklist.map(
          func item {
            if (item.id == itemId) {
              found := true;
              { item with completed = not item.completed };
            } else {
              item;
            };
          }
        );
        if (not found) {
          null;
        } else {
          let updated = { note with checklist = items; updatedAt = Time.now() };
          notes.add(noteId, updated);
          ?updated;
        };
      };
    };
  };

  /// Does the note carry any of the given tag ids?
  func hasTag(note : Note, tagId : Id) : Bool {
    note.tagIds.any(func t = t == tagId);
  };

  /// Case-insensitive search across title, body and tag names.
  func matchesTerm(note : Note, tags : Map.Map<Id, Tag>, term : Text) : Bool {
    let q = term.toLower();
    if (q == "") { return true };
    if (note.title.toLower().contains(#text q)) { return true };
    if (note.body.toLower().contains(#text q)) { return true };
    var tagMatch = false;
    for (tagId in note.tagIds.values()) {
      switch (tags.get(tagId)) {
        case (?tag) {
          if (tag.name.toLower().contains(#text q)) { tagMatch := true };
        };
        case null {};
      };
    };
    tagMatch;
  };

  func compareNotes(a : Note, b : Note, sort : SortOrder) : Order.Order {
    switch (sort) {
      case (#newest) {
        if (a.createdAt > b.createdAt) { #less }
        else if (a.createdAt < b.createdAt) { #greater }
        else { #equal };
      };
      case (#oldest) {
        if (a.createdAt < b.createdAt) { #less }
        else if (a.createdAt > b.createdAt) { #greater }
        else { #equal };
      };
      case (#title) {
        if (a.title.toLower() < b.title.toLower()) { #less }
        else if (a.title.toLower() > b.title.toLower()) { #greater }
        else { #equal };
      };
      case (#favorites) {
        if (a.favorite and not b.favorite) { #less }
        else if (not a.favorite and b.favorite) { #greater }
        else if (a.createdAt > b.createdAt) { #less }
        else if (a.createdAt < b.createdAt) { #greater }
        else { #equal };
      };
    };
  };

  /// List notes for `owner` with sort and filters applied. Pinned notes always
  /// sort ahead of unpinned ones.
  public func listNotes(state : State, owner : Principal, sort : SortOrder, filter : NoteFilter) : [Note] {
    let notes = notesOf(state, owner);
    let matched = List.empty<Note>();
    for (note in notes.values()) {
      var keep = true;
      if (note.trashed != filter.includeTrashed) { keep := false };
      if (keep and filter.favoritesOnly and not note.favorite) { keep := false };
      switch (filter.folderId) {
        case (?fid) {
          switch (note.folderId) {
            case (?nf) { if (nf != fid) { keep := false } };
            case null { keep := false };
          };
        };
        case null {};
      };
      switch (filter.tagId) {
        case (?tid) { if (not hasTag(note, tid)) { keep := false } };
        case null {};
      };
      if (keep) { matched.add(note) };
    };
    let sorted = matched.toArray().sort(
      func (a, b) {
        if (a.pinned and not b.pinned) { #less }
        else if (not a.pinned and b.pinned) { #greater }
        else { compareNotes(a, b, sort) };
      }
    );
    sorted;
  };

  /// Search notes for `owner` across title, body and tag names.
  public func searchNotes(state : State, owner : Principal, term : Text) : [Note] {
    let notes = notesOf(state, owner);
    let tags = tagsOf(state, owner);
    let matched = List.empty<Note>();
    for (note in notes.values()) {
      if (not note.trashed and matchesTerm(note, tags, term)) {
        matched.add(note);
      };
    };
    matched.toArray().sort(
      func (a, b) {
        if (a.pinned and not b.pinned) { #less }
        else if (not a.pinned and b.pinned) { #greater }
        else if (a.updatedAt > b.updatedAt) { #less }
        else if (a.updatedAt < b.updatedAt) { #greater }
        else { #equal };
      }
    );
  };

  /// Create a folder for `owner`.
  public func createFolder(state : State, owner : Principal, name : Text) : Folder {
    let folder : Folder = { id = nextFolderId(state); name; createdAt = Time.now() };
    foldersOf(state, owner).add(folder.id, folder);
    folder;
  };

  /// Rename a folder owned by `owner`.
  public func renameFolder(state : State, owner : Principal, id : Id, name : Text) : ?Folder {
    let folders = foldersOf(state, owner);
    switch (folders.get(id)) {
      case null { null };
      case (?folder) {
        let updated = { folder with name };
        folders.add(id, updated);
        ?updated;
      };
    };
  };

  /// Delete a folder owned by `owner`. Notes in the folder are moved to no
  /// folder rather than being orphaned.
  public func deleteFolder(state : State, owner : Principal, id : Id) : Bool {
    let folders = foldersOf(state, owner);
    switch (folders.get(id)) {
      case null { false };
      case (?_) {
        folders.remove(id);
        let notes = notesOf(state, owner);
        for (note in notes.values()) {
          switch (note.folderId) {
            case (?fid) {
              if (fid == id) {
                notes.add(note.id, { note with folderId = null; updatedAt = Time.now() });
              };
            };
            case null {};
          };
        };
        true;
      };
    };
  };

  /// List folders for `owner`.
  public func listFolders(state : State, owner : Principal) : [Folder] {
    foldersOf(state, owner).values().toArray().sort(
      func (a, b) {
        if (a.name.toLower() < b.name.toLower()) { #less }
        else if (a.name.toLower() > b.name.toLower()) { #greater }
        else { #equal };
      }
    );
  };

  /// Create a tag for `owner`.
  public func createTag(state : State, owner : Principal, name : Text) : Tag {
    let tag : Tag = { id = nextTagId(state); name; createdAt = Time.now() };
    tagsOf(state, owner).add(tag.id, tag);
    tag;
  };

  /// Delete a tag owned by `owner`. The tag is removed from every note.
  public func deleteTag(state : State, owner : Principal, id : Id) : Bool {
    let tags = tagsOf(state, owner);
    switch (tags.get(id)) {
      case null { false };
      case (?_) {
        tags.remove(id);
        let notes = notesOf(state, owner);
        for (note in notes.values()) {
          if (hasTag(note, id)) {
            notes.add(note.id, {
              note with
              tagIds = note.tagIds.filter(func t = t != id);
              updatedAt = Time.now();
            });
          };
        };
        true;
      };
    };
  };

  /// List tags for `owner`.
  public func listTags(state : State, owner : Principal) : [Tag] {
    tagsOf(state, owner).values().toArray().sort(
      func (a, b) {
        if (a.name.toLower() < b.name.toLower()) { #less }
        else if (a.name.toLower() > b.name.toLower()) { #greater }
        else { #equal };
      }
    );
  };

  /// Read settings for `owner`, returning defaults when unset.
  public func getSettings(state : State, owner : Principal) : Settings {
    state.settings.get(owner) ?? defaultSettings();
  };

  /// Persist settings for `owner`.
  public func updateSettings(state : State, owner : Principal, settings : Settings) : Settings {
    state.settings.add(owner, settings);
    settings;
  };

  /// Seed sample notes for `owner` on first launch. Idempotent: a second call
  /// returns the existing notes without creating duplicates.
  public func seedSampleNotes(state : State, owner : Principal) : [Note] {
    let notes = notesOf(state, owner);
    switch (state.seeded.get(owner)) {
      case (?true) { notes.values().toArray() };
      case _ {
        let now = Time.now();
        let personal = createFolder(state, owner, "Personal");
        let work = createFolder(state, owner, "Work");
        let ideas = createTag(state, owner, "ideas");
        let important = createTag(state, owner, "important");
        let todo = createTag(state, owner, "todo");

        let welcome : Note = {
          id = nextNoteId(state);
          title = "Welcome to Nexa Notes";
          body = "<h1>Welcome to Nexa Notes</h1><p>Your notes are saved automatically and stay available offline.</p><ul><li>Tap <b>+</b> to create a note</li><li>Pin important notes to keep them on top</li><li>Organize with folders and tags</li></ul>";
          checklist = [];
          folderId = ?personal.id;
          tagIds = [important.id];
          pinned = true;
          favorite = true;
          trashed = false;
          createdAt = now;
          updatedAt = now;
        };
        notes.add(welcome.id, welcome);

        let shopping : Note = {
          id = nextNoteId(state);
          title = "Weekend shopping";
          body = "<p>Everything for the weekend.</p>";
          checklist = [
            { id = nextItemId(state); text = "Coffee beans"; completed = true },
            { id = nextItemId(state); text = "Fresh bread"; completed = false },
            { id = nextItemId(state); text = "Olive oil"; completed = false },
          ];
          folderId = ?personal.id;
          tagIds = [todo.id];
          pinned = false;
          favorite = false;
          trashed = false;
          createdAt = now - 1;
          updatedAt = now - 1;
        };
        notes.add(shopping.id, shopping);

        let meeting : Note = {
          id = nextNoteId(state);
          title = "Project kickoff notes";
          body = "<h2>Kickoff</h2><p>Goals for the quarter and the people involved.</p><ol><li>Align on scope</li><li>Agree on milestones</li><li>Assign owners</li></ol>";
          checklist = [];
          folderId = ?work.id;
          tagIds = [important.id];
          pinned = false;
          favorite = true;
          trashed = false;
          createdAt = now - 2;
          updatedAt = now - 2;
        };
        notes.add(meeting.id, meeting);

        let ideasNote : Note = {
          id = nextNoteId(state);
          title = "Ideas to explore";
          body = "<p>A running list of things worth trying.</p><ul><li>A weekly review ritual</li><li>Keyboard shortcuts for quick capture</li></ul>";
          checklist = [];
          folderId = null;
          tagIds = [ideas.id];
          pinned = false;
          favorite = false;
          trashed = false;
          createdAt = now - 3;
          updatedAt = now - 3;
        };
        notes.add(ideasNote.id, ideasNote);

        state.seeded.add(owner, true);
        notes.values().toArray();
      };
    };
  };
};
