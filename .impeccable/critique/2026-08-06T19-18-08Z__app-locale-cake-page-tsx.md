---
target: app/[locale]/cake/page.tsx (cake catalog)
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
timestamp: 2026-08-06T19-18-08Z
slug: app-locale-cake-page-tsx
---
Method: dual-agent (A: afca9360e97186d6c · B: aa36d6d0513c4c7c5)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Price/loading states work; card images pop in with no skeleton |
| 2 | Match Between System and Real World | 3 | Authentic ingredient names, but the modal's `<select>`-heavy UI reads like a spreadsheet, not a bakery menu |
| 3 | User Control and Freedom | 3 | ESC/backdrop/Cancel all close and reset cleanly |
| 4 | Consistency and Standards | 2 | Admin-zone color (Vino Ciruela `#7b2d42`) styles every label in the public modal — verified, direct Two-Rooms Rule violation |
| 5 | Error Prevention | 2 | Diámetro/personas inputs have no upper bound — `9999` is accepted silently |
| 6 | Recognition Rather Than Recall | 3 | Fields are individually legible, but 12+ stacked groups scroll early choices out of view with no recap |
| 7 | Flexibility and Efficiency of Use | n/a | Single-path catalog flow |
| 8 | Aesthetic and Minimalist Design | 2 | Grid is clean; the modal is a dense, uninterrupted form-dump |
| 9 | Error Recovery | 3 | Cupón errors shown inline and clearly |
| 10 | Help and Documentation | n/a | Out of scope for a catalog page |

**Total: 21/32 (n/a: #7, #10) — 66% → Acceptable band**

## Design Specificity Verdict

**LLM assessment**: The catalog grid itself is bakery-specific — real photography, warm script headers, authentic ingredient names (Nutella, Ate, Abanicos Macma) with thumbnails. The configurator modal is not: it's the admin catalog-editor's own components dropped onto the storefront verbatim, including a shared `DiametroPersonasSelector` styled entirely in the admin-only Vino Ciruela/mauve family. A generic bakery e-commerce template would produce a near-identical modal.

**Deterministic scan**: `detect.mjs` found 0 issues in `page.tsx` itself, 5 in `modules/cake/presentation/components` — but only 2 of those 5 are reachable from this page. `CakeModal.tsx`, `CakeSizeSelector.tsx`, and `JellyTypeSelector.tsx` (the other 3 findings) are **dead code**: nothing outside that trio imports them, and `CakesSection.tsx` imports `ProductoModal.tsx` instead. The 2 real findings: `CakeCard.tsx:35` and `ProductoModal.tsx:601/634`, both 10px text below the DESIGN.md type ramp.

**Visual overlays** (desktop + mobile, catalog grid + open modal, all 4 succeeded): the live detector found **28 anti-patterns** on the desktop grid alone, with the same set recurring in the modal on both viewports — dominated by `low-contrast` (down to 2.87:1 against a 4.5:1 requirement), `undersized-ui-text` (10px), `clipped-overflow-container`, and `nested-cards`.

## Overall Impression

The catalog grid is a near-exact repeat of the homepage's original (pre-fix) card pattern — the same white-on-brand-color badges, pink-on-white titles, and cool-gray descriptions that were already diagnosed and fixed once this session, just never applied here. The modal is the more serious problem: it's a straight admin-component reuse that breaks the codebase's own Two-Rooms Rule and drops the product photo the instant a visitor commits to configuring a cake — exactly the wrong moment to lose the visual anchor on a Persuade-mode page.

## What's Working

- **Real, appetizing photography** carries the grid — same strength as the homepage.
- **Toppings chips with 32px thumbnails** in the modal feel bakery-authored, not generic — the one part of the configurator that doesn't read like an admin tool.
- **Live, transparent pricing** updates instantly and persists through scroll, honoring the "instant pricing" product principle.

## Priority Issues

**[P1] Card contrast — the exact pattern already fixed once on the homepage, unfixed here.** `CakeCard.tsx` uses white text on `#DA6C94`/`#6ab04c`/`#27ae60` badges (2.87–3.20:1), pink-on-white titles (3.20:1), and `text-gray-600` descriptions (Warm-Neutral Rule violation) — verified live via computed styles, same numbers recur in the modal's own ingredient chips. → `/impeccable audit` (apply the same fix already used on `Cookies.tsx`/`CookiesFitness.tsx`)

**[P1] Admin-zone color leaks into the public configurator.** `DiametroPersonasSelector.tsx` (shared from `modules/admin/store/...`) hardcodes Vino Ciruela `#7b2d42` and admin-mauve `#b07a8a`/`#e8c4cd` for every label in the modal used on this public page — a direct, verified violation of DESIGN.md's own Two-Rooms Rule. → `/impeccable harden`

**[P2] Configurator modal shows no product photo.** The visitor loses the visual anchor (the cake they just clicked) exactly when committing to configure it — confirmed by reading `ProductoModal.tsx`, no `producto.imagenUrl` reference anywhere in the modal. → `/impeccable layout`

**[P2] No upper bound on diámetro/personas inputs.** `Math.max(1, ...)` only — a value like `9999` is silently accepted and produces a nonsense price. → `/impeccable harden`

**[P2] Cards have no keyboard/screen-reader affordance.** A `<div onClick>` with no `role`, `tabIndex`, or `onKeyDown` — keyboard users cannot open the primary flow at all. → `/impeccable harden`

**[P3] Configurator is a 12-decision form dump with no staging.** Contradicts the product's own "guided, low-friction" principle — everything (tamaño, cobertura, relleno, licor, jarabe, toppings, ornamentos, cupón) renders at once with no progressive disclosure. → `/impeccable distill`

## Persona Red Flags

**Jordan (First-Timer)**: opens a cake expecting to see it again and instead gets a bare options form — may hesitate or bounce before the first select.

**Riley (Stress Tester)**: diámetro/personas accept any positive number unchecked (9999cm goes straight through); confirmed dead code (`CakeModal.tsx`/`CakeSizeSelector.tsx`/`JellyTypeSelector.tsx`) sitting unused in the same directory as the live components — worth a cleanup pass separately.

**Casey (Mobile)**: the modal's close (×) button measures 32×32px, under the 44px minimum, same gap already fixed on the homepage's equivalent controls; the 12-field single-column form is a long thumb-scroll before "Agregar al carrito," though that button is usefully pinned to the footer.

## Minor Observations

- `CakeCard.tsx` description uses `text-gray-600` (cool gray) — same Warm-Neutral Rule violation already fixed on the homepage's card components.
- Mobile grid renders 1 column; DESIGN.md's documented responsive step is 2 on mobile.
- No wave divider between `CakeInfoSection` and the footer — a hard cutoff into the dark footer, inconsistent with the rest of the site's signature seam treatment.
- Modal "Semi húmedo" active-state button measures 4.33:1 contrast, just under the 4.5:1 floor — close enough that a small darkening closes it.
- Modal swap icon "⇄" renders at 1.56:1 — very low, though it's a decorative/redundant icon next to labeled fields, worth a quick look rather than a full P1.

## Questions to Consider

1. Why does the highest-stakes flow on the public storefront (committing to an event cake) reuse the admin catalog editor's components instead of a bespoke public-styled configurator?
2. If "personalization without complexity" is a stated Product Principle, why does the actual configurator have zero progressive disclosure?
3. Should `CakeModal.tsx`/`CakeSizeSelector.tsx`/`JellyTypeSelector.tsx` be deleted as dead code, or were they mid-migration to something?
