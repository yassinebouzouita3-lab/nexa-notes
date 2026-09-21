import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // The deployed baseline is an empty actor: this chain starts from no state.
  type OldActor = {};

  type Id = Nat;
  type Timestamp = Int;

  type ChecklistItem = {
    id : Id;
    text : Text;
    completed : Bool;
  };

  type Note = {
    id : Id;
    title : Text;
    body : Text;
    checklist : [ChecklistItem];
    folderId : ?Id;
    tagIds : [Id];
    pinned : Bool;
    favorite : Bool;
    trashed : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  type Folder = { id : Id; name : Text; createdAt : Timestamp };
  type Tag = { id : Id; name : Text; createdAt : Timestamp };

  type Settings = {
    theme : { #light; #dark; #automatic };
    sortOrder : { #newest; #oldest; #title; #favorites };
    gridView : Bool;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    notes : Map.Map<Principal, Map.Map<Id, Note>>;
    folders : Map.Map<Principal, Map.Map<Id, Folder>>;
    tags : Map.Map<Principal, Map.Map<Id, Tag>>;
    settings : Map.Map<Principal, Settings>;
    seeded : Map.Map<Principal, Bool>;
    counters : {
      var nextNoteId : Id;
      var nextFolderId : Id;
      var nextTagId : Id;
      var nextItemId : Id;
    };
  };

  public func migration(old : OldActor) : NewActor {
    ignore old;
    {
      accessControlState = AccessControl.initState();
      notes = Map.empty();
      folders = Map.empty();
      tags = Map.empty();
      settings = Map.empty();
      seeded = Map.empty();
      counters = {
        var nextNoteId = 0;
        var nextFolderId = 0;
        var nextTagId = 0;
        var nextItemId = 0;
      };
    };
  };
};
