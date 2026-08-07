---
name: Hey Cookie
description: Bake Lab — repostería artesanal personalizada, baja en azúcar, con pricing instantáneo
colors:
  terracota-vintage: "#C56A4A"
  verde-oliva: "#7C8C42"
  crema-vintage: "#F5EFE6"
  caramelo-tostado: "#AA6A42"
  caramelo-tostado-hover: "#8A5535"
  rosa-frambuesa: "#DA6C94"
  rosa-frambuesa-hover: "#C15981"
  rosa-frambuesa-profundo: "#C0607A"
  rosa-frambuesa-profundo-hover: "#A84D66"
  espresso: "#3A1F14"
  cacao: "#6B3E26"
  crema: "#FAF3E0"
  crema-suave: "#FFFDF8"
  panel-suave: "#FFF7F0"
  lino: "#F0E0D0"
  arena: "#E8C4A0"
  blanco: "#FFFFFF"
  verde-exito: "#27AE60"
  rojo-error: "#C0392B"
  cafe-footer: "#261102"
typography:
  display:
    fontFamily: "Pacifico, cursive"
    fontSize: "clamp(2.3rem, 5vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "normal"
  display-serif:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.7rem, 4vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  headline-script:
    fontFamily: "Dancing Script, cursive"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.05em"
  caption:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.caramelo-tostado}"
    textColor: "{colors.blanco}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.caramelo-tostado-hover}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-accent:
    backgroundColor: "{colors.rosa-frambuesa}"
    textColor: "{colors.blanco}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-accent-hover:
    backgroundColor: "{colors.rosa-frambuesa-hover}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.crema}"
    rounded: "{rounded.full}"
    padding: "16px 32px"
  card-product:
    backgroundColor: "{colors.blanco}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input-field:
    backgroundColor: "{colors.crema-suave}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  chip-selected:
    backgroundColor: "{colors.rosa-frambuesa-profundo}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  chip-unselected:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.cacao}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
---

# Design System: Hey Cookie

## Overview

**Creative North Star: "Bake Lab"**

Hey Cookie reads as a bakery run with lab-grade precision: every customization — bizcocho, cobertura, relleno, jarabe, toppings, ornamentos — recalculates its price the instant it's touched, but nothing about the surface feels clinical. The interface stays warm, hand-set, and celebratory throughout; the precision lives in the pricing engine, not in the visual language. Buttons are soft and pill-shaped, cards lift gently on hover, and three different script/serif display faces rotate through headlines like a bakery that hand-letters its own signage.

The public Hero opens cinematic and moody — a full-bleed product photo under a dark brown-to-black radial gradient, headlines rendered in gradient text (warm gold-to-cream for the wordmark line, soft green for "Bake Lab · Sweet & Healthy") — then hands off to a warm cream daytime register for everything after it, stitched together with organic SVG wave dividers instead of hard section breaks. The admin zone (Operate mode) is **the same room** as the storefront (confirmed 2026-08-07, retiring the earlier plum-wine admin identity): identical Caramelo Tostado primary, Espresso/Cacao text, warm Lino/Arena borders, and the shared raspberry action color. Admin doesn't borrow the Hero's cinematic drama or the wave dividers — Operate mode still means dense tables, forms, and modals — but every color, radius, shadow, and type choice comes from the exact same token set the public site uses. A staff member should feel like they never left the brand when they log into `/admin`, not like they've walked into a different, more utilitarian product.

A confirmed brand tension sits on top of this: the storybook charm of *Charlie and the Chocolate Factory* — cute, whimsical, inviting — held together with an elegant "Bake Lab" polish. Neither side is allowed to erase the other. The site's organic SVG wave dividers are the confirmed carrier of that Wonka-esque playfulness and are explicitly protected (see Layout and the Wave Dividers component); elegance is added through typography, color restraint, and finish — never by flattening the waves into straight edges or muting the site into seriousness.

Real marketing collateral (an Instagram-style ad for "Galletas NY") makes this tension concrete: an olive-green + terracotta + cream "vintage" palette, an elegant serif/script "Hey Cookie · Bake Lab" logotype, a circular wax-seal badge ("Bake Lab — Hecho con propósito"), and icon+label feature callouts. Notably, this exact three-color combination already exists in the codebase as an unused `.vintage-bg` CSS class (`app/globals.css`) — defined but never wired to a live component. Treat it as latent brand truth, not a new invention: the palette below and the "vintage" world it belongs to.

**Key Characteristics:**
- Warm and artisanal, never corporate or clinical — the explicit anti-reference.
- Playful-storybook charm (the Wonka reference) held in tension with elegant Bake Lab polish — both required, neither dominant.
- Soft, fully rounded geometry everywhere; no sharp corners on any interactive surface.
- Layered script/serif typography (three display faces) treated as hand-lettered signage, not a single locked headline font.
- Real product photography throughout (genuine studio photos, never stock); no customer testimonials exist yet — don't fabricate any.
- Ambient, diffuse shadows only; elevation communicates focus (modals), never decoration.
- A confirmed but not-yet-implemented "vintage" palette (olive + terracotta + cream) exists in both real ad creative and dormant CSS — a live candidate for the next elegance pass.

## Colors

Two warm families carry the system: a grounding terracotta-and-cream base for structure, text, and the daytime body, and a raspberry-pink family used consistently as the "take action" signal. Both families are shared identically across the public site and the admin panel — there is no separate admin palette anymore.

### Primary
- **Caramelo Tostado** (`#AA6A42`): the system's dominant brand color everywhere — body text links, borders, focus rings, ghost-button text, the default solid-button fill, and (since 2026-08-07) the admin panel's primary color too: page headers, active nav state, and section titles under `/admin` all use this instead of the retired plum-wine.

### Vintage family (confirmed, latent)
Present in real ad creative and in the codebase's own unused `.vintage-bg` utility, but not yet applied to any live component. Reach for this trio specifically when a surface should lean into the elegant/Wonka-storybook tension named in Overview — a campaign page, an "about/our story" surface, packaging-adjacent content — rather than mixing it ad hoc into the daylight terracotta system above.
- **Terracota Vintage** (`#C56A4A`): a more saturated, rust-leaning terracotta than Caramelo Tostado — headline color and stamp/badge fills in the confirmed ad.
- **Verde Oliva** (`#7C8C42`): the ad's second accent — logotype color, icon strokes, leaf/botanical motifs. Does not otherwise appear in the implemented system; introducing it is what signals "vintage world," so keep it scoped to that world rather than sprinkling it into the daylight terracotta pages.
- **Crema Vintage** (`#F5EFE6`): a slightly greyer, more muted cream than Crema/Crema Suave — the vintage family's own background tone.

### Secondary
- **Rosa Frambuesa** (`#DA6C94`): the public accent used for primary calls to action and product-line punctuation — cake/cookie card titles, "Sweet" line tags, the shared `AppBar`/`Ornaments` chrome. Reserved for moments that should read as an invitation to act.
- **Rosa Frambuesa Profundo** (`#C0607A`): a deeper, slightly muted sibling used as the primary interactive color inside forms, modals, and multi-select chips in *both* zones — active toppings/ornamentos, admin buttons, cart actions. Where Rosa Frambuesa punctuates, this one does the work. This was already shared before the admin unification and is unchanged.

### Neutral
- **Espresso** (`#3A1F14`): primary body text and headline color on cream backgrounds, in both zones — replaces the admin's old `#3D1A24` dark-text token.
- **Cacao** (`#6B3E26`): secondary/muted text — labels, helper copy, timestamps, table meta text, in both zones — replaces the admin's old `#B07A8A` secondary-text token.
- **Crema** (`#FAF3E0`) / **Crema Suave** (`#FFFDF8`, `#FFF7F0`): the warm off-white backgrounds that carry nearly every daytime section and card interior.
- **Panel Suave** (`#FFF7F0`): soft panel/hover background shared by both zones — table header rows, dropdown panels, hover states. Replaces the admin's old blush "Rubor" (`#FDF6F0`).
- **Lino** (`#F0E0D0`) / **Arena** (`#E8C4A0`): borders, dividers, and unselected chip strokes — always warm, never cool gray. Also now the admin's border tokens, replacing the old blush "Rosa Polvo" (`#F5DCE4`) and admin-specific `#E8C4CD`.
- **Blanco** (`#FFFFFF`): card surfaces that need to pop off a cream page (product cards, elevated panels).
- **Café Footer** (`#261102`): the one deliberately dark neutral in the system — `FooterBar`'s own background, and the fill every Wave Divider transitions into right before the footer. Never used as a text or border color; reserved for that one structural role.

### Functional
- **Verde Éxito** (`#27AE60`, plus `#6ab04c` for the "Fitness" line tag): success states, applied-coupon confirmation, "Healthy"/"Fitness" catalog tags.
- **Rojo Error** (`#C0392B`): form and validation errors only.

### Confirmed exception: rating-scale colors
The `Contact` "Te escuchamos" satisfaction survey uses a standalone red→green scale (`#B23A3A`, `#C97A7A`, `#C68642`, `#7FB77E`, `#3FAE6A`) for its five rating faces, outside the palette above. Confirmed intentional (2026-08-06): a bad→good rating scale is a recognized convention users read instantly, and forcing it into the warm brand palette would make the ratings themselves harder to parse. Scoped strictly to that one rating control — do not reuse these five colors anywhere else on the site.

### Named Rules
**The Warm-Neutral Rule.** No neutral in this system is a cool gray. Every background, border, and muted-text value is warmed toward cream, tan, or blush — a true gray or blue-gray anywhere is an anti-pattern.

**The One-Room Rule** (retires the former Two-Rooms Rule, 2026-08-07). Admin and public are one visual system now, not two: every color, radius, shadow, and type token is shared. Nothing in the palette is scoped to "admin only" anymore. Operate-mode surfaces (dense tables, forms, modals) still follow Operate principles — scanability and information density over marketing flourish — but that's a layout/density decision, never a color decision.

**The Elegant-Never-Erases-Cute Rule.** Any pass that adds Bake Lab polish — the Vintage family, tighter type, restrained color — must leave the storybook/Wonka charm intact: the wave dividers, the round hover-lift on product cards, the hand-set script headlines. If an "elegant" revision would flatten those into something quiet and corporate, it has gone too far.

## Typography

**Display Font:** Pacifico (with fallback `cursive`)
**Display-Serif Font:** Playfair Display (with fallback `Georgia, serif`)
**Headline-Script Font:** Dancing Script (with fallback `cursive`)
**Body Font:** Montserrat (with fallback `sans-serif`)

**Character:** Hand-set and celebratory — the three display faces are used the way a bakery uses hand-lettered signage, each for a distinct role, never interchangeably. Montserrat is the only workhorse: everything a customer reads to make a decision (descriptions, prices, form labels, buttons) is Montserrat, so the script faces stay legible-by-contrast rather than competing with each other.

### Hierarchy
- **Display** (Pacifico 400, `clamp(2.3rem, 5vw, 5rem)`, line-height 1.15): the Hero's primary wordmark line ("Un bocado al corazón") — reserved for the single biggest brand moment on the site.
- **Display-Serif** (Playfair Display 400/600/700, `clamp(1.7rem, 4vw, 4rem)`, line-height 1.2): the Hero's secondary line ("Bake Lab · Sweet & Healthy") and other large editorial headlines that need weight without competing with the Display script.
- **Headline-Script** (Dancing Script 400–700, ~18px, line-height 1.3): product names and modal/card titles (`font-subtitle`) — a smaller, friendlier cursive used throughout the storefront, not just the Hero.
- **Body** (Montserrat 400/600, 14px, line-height 1.5): all paragraph copy, descriptions, table cells, and form values.
- **Label** (Montserrat 600, 11px, letter-spacing 0.05em, uppercase): field labels, section eyebrows, tag/chip text — the system's only uppercase-tracked type.
- **Caption** (Montserrat 400, 10–13px, line-height 1.3): the system's micro-copy tier — short product descriptions inside cards/modals, size-selector button text, per-unit price notes, coupon/login helper text. Sits below Body; used wherever space is tight and the copy is secondary to the decision at hand.

### Named Rules
**The One-Script Ceiling Rule.** Never more than one script/serif display face appears in a single component at once. Pacifico is Hero-only; Dancing Script lives at card/modal scale; Playfair bridges the two. Stacking two script faces in the same view reads as noise, not craft.

## Layout

Sections are wide and airy (`px-6` mobile → `px-20` desktop containers), separated not by hard rules but by organic SVG wave dividers — the seam between the dark cinematic Hero and the cream body beneath it is a hand-drawn curve, not a straight edge, and that pattern repeats at other major section boundaries. Product and option grids respond in even steps: `grid-cols-2` on mobile, up to `grid-cols-4` on desktop, with consistent `gap-3`–`gap-4` rhythm. Modals are centered overlays capped at `max-w-2xl`, with a `backdrop-filter: blur` scrim so the page behind stays visible but inert.

## Elevation & Depth

The system is ambient-shadow, not flat and not hard-edged. Cards rest under a soft, diffuse shadow (`0 4px 20px rgba(0,0,0,0.06)`) that deepens on hover (`0 8px 30px rgba(0,0,0,0.12)`) rather than lifting via transform alone — depth communicates interactivity, not decoration. Modals and drawers jump to a much heavier `shadow-2xl` to assert focus over the blurred backdrop. Nothing in the system uses a hard, sharp-edged shadow.

### Shadow Vocabulary
- **Ambient rest** (`0 4px 20px rgba(0,0,0,0.06)`): default resting state for product cards.
- **Ambient hover** (`0 8px 30px rgba(0,0,0,0.12)`): card hover/focus — paired with a slight image scale-up (`group-hover:scale-105`), never used alone.
- **Modal elevation** (`shadow-2xl`): any overlay panel (product modals, cart drawer, cotizador) that must visually detach from the blurred page behind it.

### Named Rules
**The Depth-On-Intent Rule.** Ambient shadow deepens only in response to hover/focus — at rest, every surface uses the lightest shadow in its category. Nothing sits permanently "elevated" except true overlays (modals, drawers).

## Shapes

Fully rounded, no sharp corners anywhere an interactive surface exists. The scale runs from `rounded-lg` (8px, tight elements like small tags) through `rounded-xl`/`rounded-2xl` (12–16px, the default for buttons, inputs, and modal panels) up to `rounded-3xl` (24px, product cards) and `rounded-full` (pill buttons, avatars, tag chips). Borders are always warm-neutral (Lino/Arena), 1px, and pair with the rounded corner rather than a hard edge.

### Named Rules
**The No-Sharp-Corner Rule.** Every button, card, input, modal, and chip in the codebase carries a border-radius. A squared-off interactive element is a defect, not a stylistic choice.

## Components

### Buttons
- **Shape:** fully rounded — `rounded-full` (pill) for the Hero's outbound WhatsApp CTA, `rounded-xl`/`rounded-2xl` for every transactional button (add to cart, save, confirm).
- **Primary:** Caramelo Tostado fill (`#AA6A42`), white text, `px-6 py-3`, semibold Montserrat.
- **Accent:** Rosa Frambuesa / Rosa Frambuesa Profundo fill for the highest-stakes action in a flow ("Agregar al carrito"), same shape and padding as Primary.
- **Ghost:** transparent fill, 2px Crema/Caramelo border, used specifically over the dark Hero image — inverts to a solid Cacao (`#6B3E26`) fill on hover.
- **Hover / Focus:** background steps to its darker sibling (`caramelo-tostado-hover`, `rosa-frambuesa-hover`); disabled state drops to 40–50% opacity rather than changing hue.

### Chips (toppings, ornamentos, tags)
- **Unselected:** white/Crema Suave background, Cacao text, 1px Arena border.
- **Selected:** solid Rosa Frambuesa Profundo (or Rosa Frambuesa for line tags like "Sweet"/"Healthy"), white text, no border — the fill itself is the selected-state signal, no checkmark needed.
- **Shape:** `rounded-xl`, optional 32px thumbnail image inset on the leading edge when the chip represents a real product (topping, ornamento).

### Cards / Containers
- **Corner Style:** `rounded-3xl` for product cards, `rounded-2xl` for modal panels and inner content blocks.
- **Background:** white for product cards sitting on a cream page; Crema Suave for content blocks sitting inside white modals.
- **Shadow Strategy:** see Elevation & Depth — ambient rest → ambient hover.
- **Border:** modals and inner sections use a 1px Lino border instead of a shadow when they need separation without implying elevation.
- **Internal Padding:** `p-4` for card bodies, `px-6 py-5` for modal bodies.

### Inputs / Fields
- **Style:** Crema Suave background, 1px Arena/Lino border, `rounded-xl`, Montserrat 14px value text.
- **Focus:** border color shifts to Caramelo Tostado (no glow/ring) — a deliberately quiet focus treatment consistent with the soft, unhurried tone.
- **Error:** border and helper text shift to Rojo Error; the field itself never changes shape or shadow.

### Navigation
- Public `AppBar`: transparent-over-Hero, then solid on scroll/other pages. Top-level nav labels (`MainNavItem`) are set in **Headline-Script (Dancing Script)**, not Montserrat — 24px desktop / 20px mobile, larger than the card/modal-title use of the same face documented under Typography. Active/hover state shifts to Caramelo Tostado (`#AA5A32`/`#9A4A22`), with an underline wave-icon flourish under the active item. Submenu links and secondary nav chrome (account dropdown, login button) use Montserrat as normal. User avatar is a `rounded-full` initials badge in Caramelo Tostado with a ring that appears on hover/open.
- Admin `AppBarAdmin`: same light warm-chrome bar as public (Crema/Lino tones, not a dark bar), same Caramelo Tostado active/hover state, same Montserrat nav labels (Operate mode skips the Headline-Script treatment — nav labels here are functional wayfinding, not brand moments) and the same `rounded-full` initials avatar pattern as public. Structurally distinct only in that its menu items are operational (Raws, Store, Finanzas) rather than product-catalog links.

### Named Rules
**The Script-Nav Scale Rule.** Headline-Script scales up to 24px specifically for top-level public navigation — a deliberate second size step beyond the 18px card/modal-title use documented under Typography. Don't shrink nav labels to a Montserrat/body size to "fix" a type-ramp mismatch; the script nav is the intended treatment.

### Wave Dividers (signature component)
Section boundaries — most visibly Hero-to-body — are drawn as a hand-curved SVG path (`viewBox="0 0 1440 100"`, a repeating sine-like curve) filled with the next section's background color, rather than a straight `<hr>` or hard color block edge. This is the system's most distinctive structural signature: read it as the bakery's own scalloped pastry-bag edge, not a generic wave-divider trend.

## Do's and Don'ts

### Do:
- **Do** keep every interactive surface fully rounded (`rounded-lg` minimum) — see the No-Sharp-Corner Rule.
- **Do** use real product photography freely; it exists and is genuine.
- **Do** use the exact same color tokens in admin as in public — see the One-Room Rule.
- **Do** let ambient shadow deepen only on hover/focus; keep rest states light.
- **Do** treat "Sweet & Healthy" / lower-sugar language as an ingredient-quality promise, never a certified nutritional claim.
- **Do** reach for the Vintage family (Terracota Vintage / Verde Oliva / Crema Vintage) when a surface is explicitly going for the elegant Bake Lab register — it's confirmed brand evidence, not an invention.
- **Do** keep the wave dividers, hover-lift cards, and script headlines intact through any elegance pass — see the Elegant-Never-Erases-Cute Rule.

### Don't:
- **Don't** introduce a cool gray or blue-gray neutral anywhere — see the Warm-Neutral Rule.
- **Don't** stack two script/serif display faces in the same component — see the One-Script Ceiling Rule.
- **Don't** invent or imply customer testimonials, ratings, or case studies — none exist yet.
- **Don't** give a card or modal a permanent heavy shadow at rest; heavy elevation is reserved for true overlays.
- **Don't** replace the organic SVG wave section dividers with straight edges or hard color blocks — it's a signature, not a placeholder.
- **Don't** let an "elegant" revision go quiet/corporate and lose the playful Wonka-storybook charm — see the Elegant-Never-Erases-Cute Rule.
