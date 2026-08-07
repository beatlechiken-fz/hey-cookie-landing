# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are final customers ordering personalized baked goods for events and celebrations — birthdays, weddings, corporate gifts — confirmed by the site's own contact copy ("Cotizamos pedidos especiales para eventos, regalos corporativos y celebraciones"). This includes both anonymous visitors browsing the public storefront and registered customers using the `/user` portal to place orders and access account-based services.

A secondary but operationally critical audience is internal staff using the `/admin` panel to manage raw materials, the product catalog, orders, clients, coupons, and finances.

## Product Purpose

Hey Cookie is an artisan bakery (repostería) selling personalized, lower-sugar baked goods — cakes, cookies, jellies, and desserts — made with quality ingredients. Customers either pick from a catalog or fully customize a cake/gelatin (bizcocho, cobertura, relleno, jarabe, toppings, licor, ornamentos) through an interactive configurator that prices the order live, then submit it for staff fulfillment. Success is an accurate, instant price on a personalized order that moves cleanly through the staff-tracked pipeline (cotización → en proceso → listo entregar → pagado → entregado).

## Positioning

Personalized, lower-sugar repostería made with quality ingredients — customization goes down to the ingredient level (structure, filling, syrup, toppings, ornaments), combined with transparent, instant pricing. A competitor offering only a fixed catalog, or only a "healthy" line without real customization, could not truthfully make the same claim.

## Operating Context

- Public storefront (`/`, `/cake`, `/quote`, `/orders`, `/desserts`, `/jelly`, `/other`) — open to anyone.
- Admin panel (`/admin`) — staff manage raw materials (bizcochos, coberturas, jarabes, insumos, empaques, licores, ornamentos) and the store (productos, ordenes, clientes, cupones, finanzas).
- User portal (`/user`) — registered customers log in; "servicios" is in active development.
- Orders move through a fixed pipeline of states tracked by staff; every price is computed live from ingredient cost and quantity, not set manually per order (though products can also carry a manually-set `precioEstablecido`).
- Market: México (MX). Phone contact is shown on the public site.

## Capabilities and Constraints

- Confirmed: full custom pastel/gelatina configurator with live pricing; catalog "producto" purchase flow that is itself configurable (size, cobertura, relleno, jarabe, toppings, licor, ornamentos — ornamentos are fixed-price add-ons, not scaled by size); cupón (discount) system; full order-pipeline management in admin.
- "Sweet & Healthy" is a quality/ingredient positioning (lower sugar, quality ingredients), not a certified nutritional or medical claim — never present it as one.
- Undecided: whether "healthy" is formally a separate catalog line versus an ingredient philosophy applied across the whole catalog. Treat as undecided; do not force a resolution in design work.

## Brand Commitments

- Name: "Hey Cookie" (copyright line reads "Hey Cookies, MX").
- Tagline in current use: "Un bocado al corazón" / "Bake Lab — Sweet & Healthy".
- Existing logo assets to preserve, not redesign without explicit request: `public/img/hey-cookie-logo.webp`, `public/img/hey-cookie-logo-opacity.webp`, `public/icons/bg-logo.svg`.
- Public contact phone currently shown: 443 123 67 33.
- Confirmed aesthetic direction (user-stated, 2026-08-05): playful, whimsical charm — user's own reference is the visual tone of "Charlie and the Chocolate Factory" (cute, storybook, inviting) — combined with an elegant "Bake Lab" polish. Both qualities must coexist: elegance should never flatten the playful/cute charm, and playfulness should never read as unpolished. The site's current organic wave-divider motif (see DESIGN.md) is the confirmed carrier of that playful charm and must be preserved through any elegance pass.
- Real marketing/ad creative exists (an Instagram-style promotional graphic for "Galletas NY") using an olive-green + terracotta + cream palette, an elegant serif/script "Hey Cookie · Bake Lab" logotype, a circular wax-seal-style badge ("BAKE LAB — Hecho con propósito"), and icon+label feature callouts (Ingredientes reales / Bajo en azúcar / Hechas con amor). This is confirmed brand evidence, distinct from what's currently implemented on the live site.

## Evidence on Hand

Real product photography exists in the repo and is safe to use as-is — the images on the site are genuine photos of the studio's own products, not stock or placeholder imagery. What does **not** exist yet: customer testimonials or case studies. Do not fabricate either of those — use the real product photos freely, but flag the absence of testimonials instead of inventing quotes, ratings, or customer names.

## Product Principles

1. Instant, transparent pricing — every customization step must recompute price live so customers never have to guess what something costs.
2. Personalization without complexity — deep configurability (bizcocho/cobertura/relleno/jarabe/toppings/ornamentos) is presented as a guided, low-friction flow, not a form dump.
3. Quality and lower sugar as the throughline — "Sweet & Healthy" is an ingredient-quality promise, not an unverified nutritional claim.
4. Operational consistency — the pricing and options logic must stay identical between what staff configure in admin and what customers see publicly; the two must never silently diverge.
5. Evidence discipline — never fabricate testimonials, ratings, or case studies; the site has a real feedback mechanism ("Te escuchamos") but no proof content yet.
