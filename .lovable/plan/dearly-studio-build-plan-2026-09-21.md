# Dearly Studio — build plan

A warm, photo-first app where someone turns one photo into a personal card, a print, or both.

## What you get first (this round)

A complete, working front end with realistic sample content, on the real routes, mobile-first from 320px up:

- **Home** — hero with a real before/after (photo → card → framed print), one primary "Create from a photo" button, "Try a sample", "Preview for free. No card required.", outcome cards, three steps, occasion shortcuts, style gallery, trust block, product previews with catalog-driven "from" prices, FAQ.
- **Creation flow** at `/create` (plus `/create/card`, `/create/print`) — one guided shell with step indicator, autosave, lossless Back, Exit, Help:
  0. Outcome: card / print / both (switchable without losing work)
  1. Photo: camera, library, drag-and-drop, samples; age + rights confirmation gate before the personal picker; short privacy notice beside upload; rotate, zoom, reposition, crop, resolution warnings
  2A. Wording: recipient nickname, relationship, occasion, mood, memory, sender, language; three editable options; Warmer / Shorter / More heartfelt / Gentle humor / More formal / Try again
  2B. Visual treatment: Original + Impressionist, Watercolor, Pointillist, Pop Art, Abstract, one intensity slider, before/after swipe, queued→processing→complete→failed states
  3. Design: Warm, Classic, Elegant, Playful, Minimal; 1:1, 9:16, 4:5, postcard, folded; template-driven controls, undo/redo, reset
  4. Preview: digital export previews; print mockups with crop/bleed/safe-area overlay, metric+imperial, quality status (Good / Acceptable / Too low — acknowledge or blocked), paper, finish, frame, quantity, delivery estimate
  5. Output: WhatsApp, share, private link, downloads, save, add to cart, make another
  6. Cart + checkout summary with full price breakdown before payment
- **Other pages** — How it works, Gallery, Pricing, Products, Help, Privacy, Terms, `/privacy/request`, share page, Library, People, Orders + order detail, Account (privacy, billing), staff Admin pages.
- **Navigation** — mobile bottom bar (Home, Library, emphasized Create, Orders, Account), desktop header with cart.
- **Design** — off-white paper tones, charcoal, terracotta, muted rose, sage, soft gold; refined serif headings with readable sans body; subtle paper texture; soft rounding; restrained motion with reduced-motion support; Standard and Large text modes; 44px touch targets; no horizontal scroll at 320px.
- **Accessibility** — landmarks, heading order, visible focus, keyboard support, labelled controls, radio groups, error summaries, dialog focus trapping, live announcements, non-colour status cues.

## Then (next rounds, each a separate step)

2. **Backend** — turn on Lovable Cloud; schema and migrations for profiles, people (nickname + relationship only), assets, creations, generation jobs, share links, products, variants, carts, orders, order items, privacy requests, deletion jobs, terms acceptances, audit events; row-level security on every owned table; private storage buckets with signed expiring URLs; retention expiry on every personal row.
3. **Real logic** — unified creation state machine so card and print reuse the same photo and edits; server-side AI text and image adapters with safe mocks behind swappable interfaces; catalog, crop, bleed and DPI validation.
4. **Money and fulfilment** — Stripe-hosted test Checkout with verified, idempotent webhooks (no payment fields in the app); print-provider interface with a realistic mock, plus an environment-gated Gelato/Printful placeholder; order timeline.
5. **Privacy machinery** — fixed automatic deletion schedule (guest 24h, drafts 30d, completed 90d, print files 30d after delivery), person-request intake, full account deletion with processor propagation, share revocation.
6. **Tests and QA** — unit (pricing, crop, DPI, entitlements, transitions), component, integration (webhooks, checkout, retention), Playwright critical flows, axe plus manual keyboard, responsive checks at 320/360/390/768/1024/1440.
7. **Docs** — `.env.example`, README, `PRODUCTION-CHECKLIST.md`.

## Technical notes

- Stack is TanStack Start (React 19, TypeScript strict, Vite 7, Tailwind v4, shadcn/ui, TanStack Query, React Hook Form + Zod) — this replaces the requested React Router/Vite SPA setup; routes and domain layering are unchanged.
- Server work uses TanStack server functions and server routes rather than Supabase Edge Functions; the same adapter interfaces apply. Lovable Cloud provides Postgres, Auth, Storage.
- `domain/` (entities, services, validators) and `data/` stay free of browser globals so native clients can reuse them.
- All AI, Stripe and print-provider keys stay server-side; no key is ever requested from a normal user.
- Prices and entitlements come from a seeded catalog marked as demo data, never UI constants.

## What I will not invent

Live pricing, shipping promises, refund rules, legal compliance claims, or credentials. Unresolved production decisions (Bahrain/Saudi legal review, statutory retention periods, real provider accounts, regions and transfer safeguards) go into the README and production checklist as open items.
