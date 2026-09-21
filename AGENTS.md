# Project Guidance

## User Preferences

- Premium minimalist UI with rounded cards and subtle shadows
- Beautiful typography and generous spacing
- Smooth page transitions and micro-animations
- Floating + button for creating a new note
- Grid/list toggle on the home screen
- Modern Material Design principles
- Accessibility and performance prioritized
- Sample notes on first launch

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend listNotes filters by EQUALITY (note.trashed == filter.includeTrashed), so a single call never returns both active and trashed notes; query each list separately when resolving one note by id.
- Generated Candid bindings encode both an absent option and a null option as candid_none(), so an optional patch field can never express clearing a value; pair each clearable field with an explicit boolean clear flag that takes precedence.
- React Query hashes keys with JSON.stringify, which throws on bigint; normalize bigint ids to strings inside query key builders while leaving the filter passed to the backend untouched.
- React Query reports isLoading=false for a DISABLED query, so first-launch effects must gate on actor readiness, not isLoading alone.
- The backend Theme variant is light|dark|automatic (the tag was renamed from `system` because `system` is a reserved Motoko keyword); map 'automatic' <-> next-themes' 'system' at the UI boundary.
- `system` is a reserved Motoko keyword and cannot be a variant tag name; there is no escaping mechanism, so the tag must be renamed.
- Under enhanced migration a stable actor field with an inline initializer fails M0250; declare it type-only and supply the value from the migration's NewActor. When the deployed baseline is an empty actor, the first migration's OldActor must be {}.
- OQL manual-mode entities need NatValue/TextValue/BoolValue/IntValue imported in the declaring file, and per-owner nested maps Map<Principal, Map<Id, T>> need OQL.Entity.manual over a flattening iterator.
- A debounced autosave that omits empty fields cannot clear them; track previous values in refs and send explicit clear flags when a field transitions to empty, resetting the refs from the mutation response.
- Checklist toggles need both an optimistic local flip and a reconcile effect keyed on the toggle mutation's response, otherwise the debounced autosave re-sends a stale checklist.
