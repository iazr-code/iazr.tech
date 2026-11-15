# IA-ZR (iazr.tech) — project context

## Brand
- Trade name: **IA-ZR (iazr.tech)**, an engineering, AI and automation agency for B2B clients in the US and LATAM.
- Tagline: "Transformamos ideas y operaciones manuales en sistemas inteligentes que funcionan solos."
- Founder: Iván Andrés Zúñiga Romo. Systems and Telecommunications Engineer; MBA with honours; specialist in Senior Management and in AI (UNIR).
- Channels: Instagram @iazr.tech · LinkedIn /in/iazr96 · GitHub /andreszuniga96 · WhatsApp +57 322 913 2643 · iazr.code@gmail.com.
- Voice: the agency speaks as "we" (IA-ZR). The founder section speaks about Iván.

## Commercial structure of the site (reference: edso-systems.com)
1. Hero: B2B value proposition plus a live feed of operations resolved by AI (WhatsApp answered, appointment booked, 5★ review via NFC/QR, lead in the CRM).
2. The problem, in four points: slow response, scattered data, static web presence, operational dependence on the owner.
3. Two service tracks:
   - 01 Ready-made product: "Ecosistema IA-ZR Control & Presencia Inteligente". WhatsApp AI agent, booking and reminders, NFC cards and stands, QR for Google reviews, landing page, mini-CRM.
   - 02 Custom engineering: n8n automation, ERP and accounting integrations (SAP, Siigo Nube), Power BI and SQL dashboards, full-stack SaaS.
4. End-to-end flow, in four interactive steps: contact → AI qualifies → appointment and reminder → CRM entry plus review.
5. Case studies: the 9 real deployments in `lib/data/projects.ts`. Never invent metrics.
6. Founder and academic backing: CV download and career timeline.

## Design rules
- Web workflow, in this order: Impeccable init → Taste art direction (wait for OK) → emil-design-eng for motion → Impeccable audit → Playwright at 1440x900 and 390x844 with 0 console errors.
- The WebGL world must never compete with text. Only the hero and the Projects section get full 3D; elsewhere the scene fades back. No excessive neon or bloom.
- Never use violet.
- Every home section names its own ground (`.g-ivory`, `.g-night`, `.g-white`, `.g-sand`, `.g-engine`, `.g-slate`, `.g-warm`, `.g-deep` in `app/globals.css`) and no two consecutive sections share one; text pairs are AAA on each. Order: hero ivory, problem night, tracks white, flow sand, ROI engine, cases ivory, assistant slate, founder warm sand, contact white, footer deep night. Sections holding a WebGL frame (hero, cases) keep `bg-transparent`: an opaque section background hides the fixed canvas behind it.
- Interactive demos stay honest: telemetry shows only measured or verified values, the ROI calculator shows its assumptions, the passkey portal says it is a local demo, payments go to `NEXT_PUBLIC_CHECKOUT_*` links or WhatsApp (never card fields on the site).
- Never invent figures, reviews or clients.
- No ambient sound. Voice exists only inside the assistant (dictation and spoken replies), started by the visitor.

## Tech notes
- `npm run dev` relies on `scripts/patch-next-dev-manifest.mjs` (postinstall). It makes Next 15.5's dev prerender-manifest write atomic. Without it, concurrent first requests to `/[locale]` return 500 with `SyntaxError: Unexpected end of JSON input`.
- Do not write destructuring assignments to object members (`[s.a, s.b] = f()`): the production SWC minifier folded them to `[0,0]=` and broke the page bundle. Assign each member explicitly.
- The service worker (`public/sw.js`) registers only in production builds; icons are rendered from `app/icon.svg` by `node scripts/build-icons.mjs`.
