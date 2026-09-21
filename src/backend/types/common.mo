module {
  /// Stable identifier for a note, folder, tag or checklist item.
  public type Id = Nat;

  /// Nanosecond timestamp (Time.now()).
  public type Timestamp = Int;

  /// Sort order for note listings.
  public type SortOrder = {
    #newest;
    #oldest;
    #title;
    #favorites;
  };

  /// Filter applied when listing notes.
  public type NoteFilter = {
    folderId : ?Id;
    tagId : ?Id;
    favoritesOnly : Bool;
    includeTrashed : Bool;
  };

  /// Generic failure returned by note/folder/tag operations.
  public type AppError = {
    #notFound : Id;
    #notAuthorized;
    #invalidInput : Text;
  };
};
