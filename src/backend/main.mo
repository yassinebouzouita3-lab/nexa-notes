import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import IntValue "mo:caffeineai-oql/IntValue";
import NotesApi "mixins/notes-api";
import ApiDocMixin "mixins/api-doc";
import NotesLib "lib/notes";
import Types "types/notes";

actor {
  // Stable state. Initial values come from the migration chain.
  let accessControlState : AccessControl.AccessControlState;
  let notes : Map.Map<Principal, Map.Map<NotesLib.Id, Types.Note>>;
  let folders : Map.Map<Principal, Map.Map<NotesLib.Id, Types.Folder>>;
  let tags : Map.Map<Principal, Map.Map<NotesLib.Id, Types.Tag>>;
  let settings : Map.Map<Principal, Types.Settings>;
  let seeded : Map.Map<Principal, Bool>;
  let counters : { var nextNoteId : NotesLib.Id; var nextFolderId : NotesLib.Id; var nextTagId : NotesLib.Id; var nextItemId : NotesLib.Id };

  transient let state : NotesLib.State = {
    notes;
    folders;
    tags;
    settings;
    seeded;
    counters;
  };

  include MixinAuthorization(accessControlState, null);
  include NotesApi(state);
  include ApiDocMixin();

  transient let sampleNote : Types.Note = {
    id = 0;
    title = "";
    body = "";
    checklist = [];
    folderId = null;
    tagIds = [];
    pinned = false;
    favorite = false;
    trashed = false;
    createdAt = 0;
    updatedAt = 0;
  };

  transient let sampleFolder : Types.Folder = { id = 0; name = ""; createdAt = 0 };
  transient let sampleTag : Types.Tag = { id = 0; name = ""; createdAt = 0 };

  /// Flatten the per-owner note maps into a single row iterator for OQL.
  func allNotes() : Iter.Iter<Types.Note> {
    let rows = List.empty<Types.Note>();
    for (perOwner in notes.values()) {
      for (note in perOwner.values()) {
        rows.add(note);
      };
    };
    rows.values();
  };

  func allFolders() : Iter.Iter<Types.Folder> {
    let rows = List.empty<Types.Folder>();
    for (perOwner in folders.values()) {
      for (folder in perOwner.values()) {
        rows.add(folder);
      };
    };
    rows.values();
  };

  func allTags() : Iter.Iter<Types.Tag> {
    let rows = List.empty<Types.Tag>();
    for (perOwner in tags.values()) {
      for (tag in perOwner.values()) {
        rows.add(tag);
      };
    };
    rows.values();
  };

  include Expose({
    entities = [
      OQL.Entity.manual<Types.Note>("note", allNotes, "Note", "id")
        .sample(sampleNote)
        .payload("id", func n = n.id)
        .payload("title", func n = n.title)
        .payload("body", func n = n.body)
        .payload("folderId", func n = switch (n.folderId) { case (?f) f; case null 0 })
        .payload("pinned", func n = n.pinned)
        .payload("favorite", func n = n.favorite)
        .payload("trashed", func n = n.trashed)
        .payload("createdAt", func n = n.createdAt)
        .payload("updatedAt", func n = n.updatedAt)
        .payload("checklistCount", func n = n.checklist.size())
        .payload("tagCount", func n = n.tagIds.size())
        .controllerOnly()
        .build(),
      OQL.Entity.manual<Types.Folder>("folder", allFolders, "Folder", "id")
        .sample(sampleFolder)
        .payload("id", func f = f.id)
        .payload("name", func f = f.name)
        .payload("createdAt", func f = f.createdAt)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<Types.Tag>("tag", allTags, "Tag", "id")
        .sample(sampleTag)
        .payload("id", func t = t.id)
        .payload("name", func t = t.name)
        .payload("createdAt", func t = t.createdAt)
        .controllerOnly()
        .build(),
    ];
  });
};
