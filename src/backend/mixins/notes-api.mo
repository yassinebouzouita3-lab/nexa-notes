import Types "../types/notes";
import Common "../types/common";
import NotesLib "../lib/notes";

mixin (state : NotesLib.State) {
  public type Id = Common.Id;
  public type Note = Types.Note;
  public type NoteInput = Types.NoteInput;
  public type NotePatch = Types.NotePatch;
  public type Folder = Types.Folder;
  public type Tag = Types.Tag;
  public type Settings = Types.Settings;
  public type SortOrder = Common.SortOrder;
  public type NoteFilter = Common.NoteFilter;
  public type AppError = Common.AppError;

  /// Create a new note for the caller.
  public shared ({ caller }) func createNote(input : NoteInput) : async Note {
    NotesLib.createNote(state, caller, input);
  };

  /// Apply a partial update (autosave) to a note.
  public shared ({ caller }) func updateNote(id : Id, patch : NotePatch) : async ?Note {
    NotesLib.updateNote(state, caller, id, patch);
  };

  /// Duplicate a note into an independent copy.
  public shared ({ caller }) func duplicateNote(id : Id) : async ?Note {
    NotesLib.duplicateNote(state, caller, id);
  };

  /// Move a note to trash.
  public shared ({ caller }) func trashNote(id : Id) : async Bool {
    NotesLib.trashNote(state, caller, id);
  };

  /// Restore a note from trash.
  public shared ({ caller }) func restoreNote(id : Id) : async ?Note {
    NotesLib.restoreNote(state, caller, id);
  };

  /// Permanently delete a note.
  public shared ({ caller }) func deleteNotePermanently(id : Id) : async Bool {
    NotesLib.deleteNotePermanently(state, caller, id);
  };

  /// Pin or unpin a note.
  public shared ({ caller }) func setPinned(id : Id, pinned : Bool) : async ?Note {
    NotesLib.setPinned(state, caller, id, pinned);
  };

  /// Mark or unmark a note as favorite.
  public shared ({ caller }) func setFavorite(id : Id, favorite : Bool) : async ?Note {
    NotesLib.setFavorite(state, caller, id, favorite);
  };

  /// Toggle a checklist item inside a note.
  public shared ({ caller }) func toggleChecklistItem(noteId : Id, itemId : Id) : async ?Note {
    NotesLib.toggleChecklistItem(state, caller, noteId, itemId);
  };

  /// List the caller's notes with sort and filters.
  public query ({ caller }) func listNotes(sort : SortOrder, filter : NoteFilter) : async [Note] {
    NotesLib.listNotes(state, caller, sort, filter);
  };

  /// Search the caller's notes across title, body and tags.
  public query ({ caller }) func searchNotes(term : Text) : async [Note] {
    NotesLib.searchNotes(state, caller, term);
  };

  /// Create a folder.
  public shared ({ caller }) func createFolder(name : Text) : async Folder {
    NotesLib.createFolder(state, caller, name);
  };

  /// Rename a folder.
  public shared ({ caller }) func renameFolder(id : Id, name : Text) : async ?Folder {
    NotesLib.renameFolder(state, caller, id, name);
  };

  /// Delete a folder.
  public shared ({ caller }) func deleteFolder(id : Id) : async Bool {
    NotesLib.deleteFolder(state, caller, id);
  };

  /// List the caller's folders.
  public query ({ caller }) func listFolders() : async [Folder] {
    NotesLib.listFolders(state, caller);
  };

  /// Create a tag.
  public shared ({ caller }) func createTag(name : Text) : async Tag {
    NotesLib.createTag(state, caller, name);
  };

  /// Delete a tag.
  public shared ({ caller }) func deleteTag(id : Id) : async Bool {
    NotesLib.deleteTag(state, caller, id);
  };

  /// List the caller's tags.
  public query ({ caller }) func listTags() : async [Tag] {
    NotesLib.listTags(state, caller);
  };

  /// Read the caller's settings.
  public query ({ caller }) func getSettings() : async Settings {
    NotesLib.getSettings(state, caller);
  };

  /// Persist the caller's settings.
  public shared ({ caller }) func updateSettings(settings : Settings) : async Settings {
    NotesLib.updateSettings(state, caller, settings);
  };

  /// Seed sample notes for the caller on first launch.
  public shared ({ caller }) func seedSampleNotes() : async [Note] {
    NotesLib.seedSampleNotes(state, caller);
  };
};
