import Common "common";

module {
  public type Id = Common.Id;
  public type Timestamp = Common.Timestamp;
  public type SortOrder = Common.SortOrder;
  public type NoteFilter = Common.NoteFilter;
  public type AppError = Common.AppError;

  /// A single checklist/task item inside a note.
  public type ChecklistItem = {
    id : Id;
    text : Text;
    completed : Bool;
  };

  /// Rich-text body stored as an HTML fragment (bold, italic, underline,
  /// headings, bullet and numbered lists).
  public type RichText = Text;

  /// A note as returned to the client.
  public type Note = {
    id : Id;
    title : Text;
    body : RichText;
    checklist : [ChecklistItem];
    folderId : ?Id;
    tagIds : [Id];
    pinned : Bool;
    favorite : Bool;
    trashed : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Fields accepted when creating a note.
  public type NoteInput = {
    title : Text;
    body : RichText;
    checklist : [ChecklistItem];
    folderId : ?Id;
    tagIds : [Id];
  };

  /// Fields accepted when updating a note (autosave).
  ///
  /// Optional fields cannot express "clear": an absent option and a null option
  /// are both encoded as `candid_none()` by generated bindings, so `folderId`
  /// can only ever move a note into a folder, and an empty `title`/`body` is
  /// indistinguishable from "leave unchanged". Each clearable field therefore
  /// has an explicit boolean signal that takes precedence over its value field:
  /// `clearFolder = true` removes the note from its folder, `clearTitle = true`
  /// sets the title to `""`, and `clearBody = true` sets the body to `""`.
  public type NotePatch = {
    title : ?Text;
    body : ?RichText;
    checklist : ?[ChecklistItem];
    folderId : ?Id;
    tagIds : ?[Id];
    clearFolder : ?Bool;
    clearTitle : ?Bool;
    clearBody : ?Bool;
  };

  /// A folder / custom category.
  public type Folder = {
    id : Id;
    name : Text;
    createdAt : Timestamp;
  };

  /// A tag.
  public type Tag = {
    id : Id;
    name : Text;
    createdAt : Timestamp;
  };

  /// Per-user application settings.
  public type Settings = {
    theme : Theme;
    sortOrder : SortOrder;
    gridView : Bool;
  };

  /// Theme preference.
  public type Theme = {
    #light;
    #dark;
    #automatic;
  };
};
