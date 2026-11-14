---
name: IA-ZR
description: AI and automation agency site, cobalt ink on sand, proving its systems working.
colors:
  sand-ground: "#e6dbc7"
  sand-surface: "#ddd0b9"
  sand-paper: "#f0e8da"
  cobalt-ink: "#062b8a"
  cobalt-muted: "#3253a4"
  cobalt-tint: "color-mix(in oklab, #062b8a 8%, #e6dbc7)"
  hairline: "color-mix(in oklab, #062b8a 14%, transparent)"
  hairline-strong: "color-mix(in oklab, #062b8a 28%, transparent)"
  input-stroke: "color-mix(in oklab, #062b8a 24%, transparent)"
  inverse-ink: "#e6dbc7"
  inverse-muted: "#b8c2dc"
  destructive: "#9f2a1c"
  success: "#1c6a3e"
typography:
  display:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(40px, 2.75vw + 32px, 72px)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(30px, 1.4vw + 24px, 48px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(22px, 0.5vw + 20px, 28px)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(18px, 0.2vw + 17px, 20px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Host Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.3
  data:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  btn: "8px"
  pill: "9999px"
spacing:
  nav: "72px"
  section-top: "120px"
  section-bottom: "72px"
  gutter-page: "80px"
  gutter-grid: "24px"
  wrap-max: "1280px"
  btn-height: "44px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt-ink}"
    textColor: "{colors.sand-ground}"
    rounded: "{rounded.btn}"
    padding: "0 24px"
    height: "{spacing.btn-height}"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "color-mix(in oklab, #062b8a 86%, #e6dbc7)"
  button-secondary:
    backgroundColor: "{colors.cobalt-tint}"
    textColor: "{colors.cobalt-ink}"
    rounded: "{rounded.btn}"
    padding: "0 24px"
    height: "{spacing.btn-height}"
  button-primary-inverse:
    backgroundColor: "{colors.inverse-ink}"
    textColor: "{colors.cobalt-ink}"
    rounded: "{rounded.btn}"
    padding: "0 24px"
    height: "{spacing.btn-height}"
  card:
    backgroundColor: "{colors.sand-surface}"
    rounded: "{rounded.lg}"
    padding: "32px"
  card-on-surface:
    backgroundColor: "{colors.sand-ground}"
    rounded: "{rounded.lg}"
  window:
    backgroundColor: "{colors.sand-paper}"
    textColor: "{colors.cobalt-ink}"
    rounded: "{rounded.lg}"
  window-bar:
    textColor: "{colors.cobalt-muted}"
    typography: "{typography.label}"
    height: "44px"
    padding: "0 16px"
  icon-tile:
    backgroundColor: "{colors.sand-paper}"
    rounded: "10px"
    size: "40px"
  input:
    backgroundColor: "{colors.sand-paper}"
    textColor: "{colors.cobalt-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
    height: "48px"
  chip:
    backgroundColor: "{colors.cobalt-tint}"
    textColor: "{colors.cobalt-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
    typography: "{typography.label}"
  nav:
    backgroundColor: "{colors.sand-ground}"
    textColor: "{colors.cobalt-ink}"
    height: "{spacing.nav}"
  inverse-band:
    backgroundColor: "{colors.cobalt-ink}"
    textColor: "{colors.inverse-ink}"
---

# Design System: IA-ZR

## Overview

**Creative North Star: "The Working Ledger"**

A two-tone page printed in one cobalt ink on warm sand. Everything that is not text is either a hairline, a tonal surface one step darker or lighter than the ground, or a real product window showing operations happening. The page sells by showing its systems running, so the most elaborate objects on it are UI windows (the IA-ZR Control feed, the four-step flow window, the assistant chat) and the case screens, never decoration.

Density is calm and editorial: one section per screen, generous top air, headlines in a medium-weight grotesk with tight tracking, lists ruled by 1px ink hairlines instead of boxed. Colour does almost no work beyond the single ink; hierarchy comes from size, weight, and the 100% / muted-cobalt split. Depth is mostly tonal; only windows carry a soft cobalt-tinted shadow. WebGL exists, but it is held inside two DOM frames and drawn in the same cobalt ink, so it reads as part of the print rather than a glowing layer over it.

The world explicitly refuses the dark neon AI-agency default: no glow, no glass, no gradient text, no dark-only ground.

**Key Characteristics:**
- One ink (cobalt) on one ground (sand), with a single full inverse band at the close.
- Opaque surfaces only; tonal steps instead of borders on cards.
- 1px ink hairlines at 14% rule every list, bar and frame.
- Host Grotesk at weight 500 for display, 400 for text; JetBrains Mono only for data inside UI windows.
- Soft radius scale (8 / 12 / 20), tonal buttons, real full-colour tool logos on paper tiles.
- WebGL drawn only inside `[data-world-frame]` boxes, in cobalt, normal blending, no bloom.

## Colors

A strict two-tone: warm sand grounds and a deep cobalt that is ink, accent and action at once.

### Primary
- **Press Cobalt** (cobalt-ink): all text, headings, the filled primary button, selection, focus ring, the active flow-step disc, outgoing chat bubbles, and the ground of the inverse band. It is the only chromatic colour on the page.
- **Faded Cobalt** (cobalt-muted): leads, secondary text, inactive list rows and tabs, window-bar captions, labels above lists.

### Neutral
- **Sand Ground** (sand-ground): the page background, the nav, inputs-on-card contrast, and cards placed on a surface band.
- **Kraft Surface** (sand-surface): the alternating section band (`ground-surface`), cards on the ground, the founder portrait mount.
- **Paper** (sand-paper): the inside of every UI window, icon tiles, form inputs, incoming chat bubbles, the form success panel. The lightest step, used for "screen" surfaces.
- **Cobalt Tint** (cobalt-tint, ink 8% into sand): the secondary button, chips, the language switch track.
- **Hairline** (hairline, ink 14%): every border, rule and list separator. **Strong Hairline** (28%) is the input hover stroke; **Input Stroke** (24%) is the resting input border.

### Inverse
- **Sand on Cobalt** (inverse-ink on cobalt-ink): the closing band's text and its primary button fill. **Mist** (inverse-muted): secondary text inside the band. Hairlines inside the band are sand at 18% (32% strong).

### Status
- **Brick** (destructive): field errors and error panels (on a 10% tint). **Ledger Green** (success): the "operating" dot in window bars and the form success state. Neither is ever a decorative accent.

### Named Rules
**The One Ink Rule.** Cobalt is the only hue. A second accent is never introduced; emphasis is weight, size, or the inverse band. Full-colour brand logos inside icon tiles are content, not palette.

**The Opaque Rule.** Surfaces are solid sand steps. No transparency, blur or glass on the ground; the only translucent fills are the tint mixes defined above.

## Typography

**Display Font:** Host Grotesk (with ui-sans-serif, system-ui)
**Body Font:** Host Grotesk (with ui-sans-serif, system-ui)
**Data Font:** JetBrains Mono (with ui-monospace, SF Mono, Consolas)

**Character:** One grotesk carries the whole page, set medium and tight for headlines and plain for text, so the voice stays corporate and even. The mono appears only where a machine would print: timestamps, event meta, step numerals inside product windows.

### Hierarchy
- **Display** (500, clamp 40 to 72px, 1.02, -0.04em): the hero h1 only, centred, max 16ch.
- **Statement** (500, clamp(36px, 4.6vw + 8px, 80px), 1.02, -0.045em): the problem section's word-highlight statement, max 19ch. One per page.
- **Headline** (500, clamp 30 to 48px, 1.08, -0.035em): every section h2, balanced wrap.
- **Title** (500, clamp 22 to 28px, 1.2, -0.02em): card and form titles. Problem items use a fixed 20px / -0.015em variant.
- **Lead** (400, clamp 18 to 20px, 1.5, muted): the paragraph under each h2; hero lead max 58ch, prose blocks max 62ch.
- **Body** (400, 16px, 1.6): running text. List rows in tablists use 17px / 500 for the item name.
- **Small** (400, 14px): secondary lines, roles, stacks, the hero's fact line, legal-adjacent text.
- **Label** (500, 13px, 1.3): small headings above lists and window-bar captions, sentence case, no tracking.
- **Data** (JetBrains Mono 400, 13px): numbers and meta inside UI windows.
- **Wordmark** ("IA-ZR", Host Grotesk 500): 20px / -0.03em in the nav; clamp(96px, 21vw, 300px) / 0.8 / -0.06em across the closing band.

### Named Rules
**The Mono Stays In The Window Rule.** JetBrains Mono is used only for data inside UI windows (event meta, times, step numerals). Never for headings, labels or body on the page itself.

**The Sentence Case Rule.** Labels are 13px medium in sentence case with no added letter-spacing. Nothing on the page is set in tracked uppercase.

## Layout

**Wrap.** One container: `min(100% - 2 × page gutter, 1280px)`, centred. Page gutter is 80px at 1024px and up, 48px from 640 to 1023px, 24px under 640px.

**Grid.** A 12-column grid with a 24px gutter (`gap-x-6`) from 1024px up; below that everything stacks to one column with 32px (phone) to 48px row gaps. The standard two-part section is the **5/7 split**: copy in columns 1 to 5, the object (window, frame, form, chat) in columns 6 to 12. When the copy side holds only a heading pair, the lead starts at column 6 (span 6) so it shares the same seam. The founder section uses 4 + 7 starting at column 6; the footer close uses 8 + 4 (from column 9). The seam at column 6 is the page's spine.

**Section box.** Every section after the hero is one box: padding-top 120px, padding-bottom 72px (phone: 96px / 48px), min-height one large viewport (`100lvh`; `100svh` at 1024px and up). Height is content-driven, never fixed. The hero is exactly `100svh` (min 640px), with its content starting 48px under the 72px nav (40px under 56px on phone).

**Rhythm.** Sections alternate ground and surface bands: hero, problem (ground), services and flow (surface), cases, assistant, founder, contact (ground), close (inverse). Within a section: h2, then lead at 16px gap, then the list or object at 32 to 48px; list headings sit 40px below the lead with 12px to their list.

**Lists.** Lists are ruled, not boxed: each row has a top hairline and 12px vertical padding (44 to 56px minimum row height for interactive rows).

**Breakpoints.** 640px (phone gutters, stacked button rows), 1024px (12-column grid, desktop nav, 80px gutter).

## Elevation & Depth

Depth is tonal by default. Cards are a sand step against the band, with no border and no shadow. The only cast shadow belongs to product windows, which are meant to read as screens lifted off the page.

### Shadow Vocabulary
- **Window lift** (`box-shadow: 0 1px 0 color-mix(in oklab, #062b8a 4%, transparent), 0 24px 48px -24px color-mix(in oklab, #062b8a 28%, transparent)`): every `.window` (ops feed, flow panel, assistant chat). Cobalt-tinted, soft, falling straight down.

### The Lit Frame
The hero window sits in a frame lit from below: a radial cobalt wash (16% ink at 50% 110%) over a 55% kraft surface, 1px hairline, 20px radius, masked to fade out over its last 18%. This frame is also a WebGL window (see Components).

### Named Rules
**The Screens Float, Paper Doesn't Rule.** Only UI windows cast a shadow. Cards, tiles, inputs and bands stay flat; elevation means "this is a product screen."

## Shapes

Soft and consistent. Three radii: 8px for buttons, inputs, the language switch and small panels; 12px for medium panels (form success, error panels, the portrait image, feed rows); 20px for cards, windows, the lit frame and the cases frame. Icon tiles are 10px at 40px. Chips, status dots and the flow-step numerals are full pills or circles. Chat bubbles use 14px with a 4px corner on the speaker's side.

Borders are always 1px hairlines in ink at 14%; frames that hold imagery (cases frame) carry one hairline and clip to 20px.

## Components

### Buttons
Tonal, quiet, one pair page-wide.
- **Shape:** gently rounded (8px), 44px tall, 24px side padding, 16px / 500 label, 8px gap to an icon.
- **Primary:** cobalt fill, sand label. Exactly one filled action per view: "book a diagnosis" (the booking drawer).
- **Secondary:** cobalt tint (ink 8%) with cobalt label. Every other button, including icon-only square buttons (44px, or 36 to 48px inside windows).
- **Hover (fine pointers only):** lifts 1px; primary mixes 14% sand into the fill, secondary deepens to 14% ink. 160ms in.
- **Active:** `translateY(1px) scale(0.985)` in 90ms.
- **Inverse:** in the closing band the primary inverts to sand fill and cobalt label.
- **Arrow:** primary actions and directional links carry a drawn 12px arrow whose stem grows from 60% to full width and whose head moves 2px right on hover.
- **Rows:** 12px gap; under 640px hero and founder rows stack full width.

### Links
Inline text links are cobalt 500 with an underline that draws left to right (1px, 0 to 100% width) on hover and on focus. Used for nav items, card CTAs, footer directory and channel actions.

### Chips
Pills on the cobalt tint, 13px, 2 to 4px by 8 to 12px padding; an outline variant (1px hairline, no fill) marks qualification tags inside the flow window. Chips live inside windows, not on the page as eyebrows.

### Cards / Containers
- **Corner Style:** 20px.
- **Background:** kraft surface on the ground; sand ground when placed on a surface band.
- **Shadow Strategy:** none (tonal).
- **Border:** none.
- **Internal Padding:** 32px desktop, 20 to 24px phone.

### Windows (signature)
The product-UI container used for every "it's working" proof.
- Paper interior, 1px hairline, 20px radius, window lift shadow, clipped.
- **Bar:** 44px tall, 16px padding, hairline bottom, 13px / 500 muted caption; title in full ink; right side carries status (green dot + label) or a context caption. Optional three 10px ink-18% dots on the left of the ops window.
- **Panels inside:** sand-ground panels with hairline and 12 to 14px radius; data in JetBrains Mono 13px; real logos in icon tiles.

### Icon Tiles
Real full-colour tool logos (from `public/icons`) on a paper tile: 40px square, 10px radius, 1px hairline, logo at 22px; a wide variant (56px, logo 40px) for wordmark logos. Interface concepts without a brand use one line set (Lucide, 1.75 stroke) in cobalt on the same tile. Inside lists and windows tiles shrink to 32px / 8px radius (logo 18px).

### Inputs / Fields
- **Style:** paper fill, 1px input stroke (ink 24%), 8px radius, min 48px tall, 12px by 16px padding, 16px text. Labels 14px / 500 above, 6px gap.
- **Hover:** stroke to strong hairline. **Focus:** stroke to full cobalt plus a 2px cobalt outline at 0 offset.
- **Error:** stroke brick at 70%, 14px brick message below.

### Navigation
One fixed opaque bar, 72px (56px phone), sand ground with a hairline from first paint, identical at every scroll depth. Wordmark left; centre links at 15px with drawn underlines (1024px up, 28px gap); right: language switch (tint track, 44px), sound toggle, primary booking button. Under 1024px a 44px secondary square opens a full-screen sand sheet of 56px ruled rows in display weight.

### Tablists (cases and flow)
Vertical ruled lists that drive the object on the right. Inactive rows are muted and turn ink on hover; the active row is full ink. Cases mark the active row with a 20px ink rule that draws in before the name; flow steps use a 32px circular numeral that fills cobalt when active and expands its body (grid rows 0fr to 1fr, 300ms).

### Inverse Band
The closing footer is the page's only inverse section: cobalt ground, sand ink, mist secondary text, sand hairlines at 18%. It holds the close headline (8 columns) and the booking action (4 columns), the "IA-ZR" wordmark set across the wrap, then the ruled directory and legal row at 13px. All semantic tokens are reassigned inside the band so buttons, links and rules invert automatically.

### WebGL Frames
The 3D layer is a single transparent canvas that draws only inside DOM elements marked `[data-world-frame]`. Each frame measures the union of visible frames per frame and sets a scissor box to it; nothing renders elsewhere, so text is never under the scene. Two frames ship: `hero` (the lit frame: cobalt ink particles, colours #062b8a to #3253a4, normal blending, fading out over the frame's lower 30%, behind the window and never behind the headline) and `cases` (the nine case screenshots as gently curved planes that swap with a damped depth travel and a hover ripple plus slight colour split). Under reduced motion, save-data or no WebGL, the static tier shows the plain screenshot inside the same frame.

### Motion
Exponential ease-out (`cubic-bezier(0.23, 1, 0.32, 1)`) everywhere; quick in (160ms on hover), slower out (260ms). Hero entrance runs once on load: 700ms fade-up from 12px, staggered 0 / 80 / 160 / 200 / 240ms. The ops feed adds an event every 900ms and holds 2.4s, pausing off screen. Word highlight turns words from 42% to full ink as the statement crosses the screen. Booking drawer slides in from the right in 380ms. Every animation stops under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** set every surface as an opaque sand step (ground, surface, paper) and print everything in the one cobalt.
- **Do** put the copy in columns 1 to 5 and the object in columns 6 to 12 on a 12-column, 24px-gutter grid.
- **Do** use the section box (120px top, 72px bottom, at least one screen tall) for every section after the hero.
- **Do** rule lists with 1px hairlines at 14% ink instead of boxing them.
- **Do** keep one filled primary button per view; everything else is the tonal secondary or a drawn-underline link.
- **Do** show proof in windows: paper interior, 44px bar, 20px radius, the window lift shadow, real logos on paper tiles, data in JetBrains Mono.
- **Do** keep WebGL inside `[data-world-frame]` boxes, drawn in cobalt with normal blending.
- **Do** use `cubic-bezier(0.23, 1, 0.32, 1)` with 160ms in and 260ms out for state changes.

### Don't:
- **Don't** use glow, glass, bloom, gradient text or a dark ground; the inverse cobalt band is the only dark surface.
- **Don't** introduce a second accent hue; status green and brick are for state only.
- **Don't** set JetBrains Mono outside a UI window.
- **Don't** put a pill, eyebrow or tracked uppercase label above a headline.
- **Don't** cast shadows on cards, tiles or inputs; only windows lift.
- **Don't** let the WebGL scene draw outside its frame or behind any text.
- **Don't** use radii off the 8 / 12 / 20 scale for new surfaces (the 10px icon tile and 14px chat bubble are the only fixed exceptions).
