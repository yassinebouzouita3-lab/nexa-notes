# Design Brief

## Direction

**Nexa Notes — Paper & Ink** — a calm, premium writing surface: ink on paper in light mode, ink on deep teal charcoal in dark mode, where the note itself is the only ornament.

## Tone

Refined minimalism executed with conviction — generous negative space, one deep-teal accent, zero decoration that does not carry information.

## Differentiation

Every surface is a soft, hairline-bordered card that lifts 2px on hover, and the pinned note is marked by a slim amber rail — a quiet, tactile material language instead of chrome.

## Color Palette

| Token      | OKLCH       | Role                                        |
| ---------- | ----------- | ------------------------------------------- |
| background | 0.975 0.005 190 | App canvas, cool paper off-white / dark 0.155 |
| foreground | 0.22 0.02 200   | Primary ink text                            |
| card       | 1 0 0           | Note cards, sheets, popovers (dark 0.205)   |
| primary    | 0.47 0.098 192  | Deep teal — FAB, active states, links       |
| accent     | 0.66 0.13 74    | Amber — pinned markers, favorites, warnings |
| muted      | 0.945 0.012 190 | Chips, dividers, secondary surfaces         |
| tag        | 0.94 0.022 192  | Teal-washed tag pills                       |

## Typography

- Display: **Space Grotesk** — app wordmark, screen titles, note titles, numeric counters
- Body: **Plus Jakarta Sans** — note previews, labels, buttons, settings copy
- Mono: **Geist Mono** — timestamps, word counts, keyboard hints
- Scale: hero `text-3xl md:text-4xl font-bold tracking-tight`, h2 `text-xl font-semibold`, label `text-[0.6875rem] font-semibold tracking-[0.08em] uppercase`, body `text-[0.9375rem] leading-relaxed`

## Elevation & Depth

Three-level hierarchy: flat canvas → hairline-bordered cards with a whisper-soft shadow → floating teal FAB with a colored ambient shadow; no glow, no blur-heavy glass.

## Structural Zones

| Zone          | Background              | Border                       | Notes                                     |
| ------------- | ----------------------- | ---------------------------- | ----------------------------------------- |
| Top app bar   | `bg-background`         | none (scroll-elevated)       | Wordmark + search + avatar; gains `border-b` on scroll |
| Filter chips  | `bg-background`         | `border-border` on inactive  | Horizontal scroll, active chip = `bg-primary` |
| Content       | `bg-background`         | —                            | Grid or list of `surface-card` notes      |
| Editor sheet  | `bg-card`               | `border-t`                   | Rounded top sheet, full-bleed writing area |
| Bottom nav    | `bg-card/95 backdrop-blur` | `border-t`                | 3 items, active = `text-primary` + pill   |
| FAB           | `--gradient-primary`    | none                         | Fixed bottom-right, 56px, above nav       |

## Spacing & Rhythm

Screen gutter `px-4 md:px-6`, section gaps `space-y-6`, card padding `p-4`, chip row gap `gap-2`, list gap `gap-2.5`, grid gap `gap-3.5 md:gap-4.5`; content max-width `max-w-2xl` on phones, `max-w-5xl` on tablets.

## Component Patterns

- Buttons: pill radius, `bg-primary` filled for primary, `bg-muted` ghost for secondary, `transition-spring` with scale-on-press
- Cards: `--radius-card` (20px), `bg-card`, 1px `--note-card-border`, `shadow-note`, hover lift −2px
- Badges: `tag-pill` — teal wash, uppercase 11px, tracking 0.08em; pinned rail 3px amber
- Inputs: `bg-muted/60`, radius `--radius`, focus ring 2px `--ring` with 2px offset
- Empty states: centered 96px `empty-illustration` disc + display-face headline + one muted line + primary CTA

## Motion

- Entrance: staggered `fade-up` 420ms cubic-bezier(0.22,1,0.36,1), 40ms delay per item, max 8 items
- Hover: cards lift −2px and deepen shadow over 300ms; chips scale 1.02
- Press: FAB and buttons scale to 0.96 over 420ms spring
- Page: sheet slides up 320ms ease-out; route cross-fade 220ms
- Decorative: FAB idle float 3s loop; skeleton shimmer on loading; `prefers-reduced-motion` disables all

## Constraints

- Never use raw hex/rgb or arbitrary color classes — semantic tokens only (`bg-card`, `text-muted-foreground`)
- One accent family (deep teal) plus one signal color (amber); no second saturated hue
- Body text ≥ 4.5:1 contrast in both modes; tap targets ≥ 44px
- No sharing/export UI and no reminders/due-date UI anywhere in the shell or preview
- Mobile-first; tablet expands grid columns, never the type scale

## Signature Detail

The **pinned rail** — a 3px amber capsule running the full height of a pinned note card, paired with the card's slight upward lift, making pinned notes feel physically clipped to the top of the stack.
