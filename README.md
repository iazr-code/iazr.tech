# IA-ZR · iazr.tech

**IA-ZR** is an engineering, AI and automation agency for B2B clients in the US and LATAM.
*"Transformamos ideas y operaciones manuales en sistemas inteligentes que funcionan solos."*

This repository is the agency's bilingual site (`/es`, `/en`). It sells two service tracks and
shows them working in the browser: a WhatsApp AI agent flow, a live ROI calculator with a PDF
proposal, a vision scanner, an AI assistant you can talk to, a passkey client-portal demo and a
live architecture sandbox. Founder: Iván Andrés Zúñiga Romo.

## What the site offers

| Track | For | What it includes |
| --- | --- | --- |
| **01 · Ecosistema IA-ZR Control** (ready-made) | Clinics, offices, shops | WhatsApp AI agent 24/7, booking and reminders, NFC cards and stands, QR for Google reviews, landing page, mini-CRM |
| **02 · Sistemas a medida** (custom) | Companies and institutions | n8n automation, SAP and Siigo Nube integrations, Power BI and SQL dashboards, full-stack SaaS |

Nine production deployments (`lib/data/projects.ts`) and fifteen verifiable certifications
(`lib/data/experience.ts`) back it. Figures shown on the site are only verified ones.

## Interactive modules

| Module | Where | How it works |
| --- | --- | --- |
| Neural core (WebGL) | Hero | One fixed R3F canvas, drawn only inside DOM frames (scissor); spring lean to pointer or phone tilt |
| Live telemetry | Hero | Measured site latency (`/api/health`), assistant model and first response, verified uptime, the visitor's ROI estimate |
| NFC card (CSS 3D) | Track 01 | Leans to pointer / gyroscope, flips to the antenna |
| Architecture sandbox | Track 02 | `POST /api/sandbox` runs a sample contact through ingest → AI intent → n8n/ERP/Supabase → Power BI/CRM, with real measured stage timings |
| Vision scanner | Flow | `getUserMedia` + canvas analysis (brightness, contrast, motion, edges) + `BarcodeDetector` QR; simulation fallback; nothing uploaded |
| ROI calculator + PDF | Calculator | Visible, editable assumptions; one-page PDF written in the browser (`lib/pdf`), no prices; reservation via booking, checkout links or WhatsApp |
| AI assistant | Assistant | Groq via the Vercel AI SDK, streamed; dictation (`SpeechRecognition`), spoken replies (`speechSynthesis`), on-page actions (booking, ROI prefill, cases, scanner, portal) |
| Passkey portal | Contact | Real WebAuthn ceremony on the device, labelled as a local demo (no server, nothing sent) |
| Command centre | Nav, `Ctrl+K` / `⌘K` | Searchable palette for every action above, CV, certifications, language and WhatsApp |
| PWA | Everywhere | `app/manifest.ts`, production-only service worker (`public/sw.js`), install button when the browser offers it |

## Stack

Next.js 15.5 (App Router, SSG per locale) · React 19 · Tailwind CSS v4 (tokens in `app/globals.css`) ·
three / @react-three/fiber · Vercel AI SDK + Groq · Zod · Resend · PostHog · Vitest · ESLint · TypeScript strict.

```
app/            routes: /[locale], /[locale]/about, api/{chat,health,sandbox}, manifest, icons, OG images, sitemap, robots
components/     home sections, chat (voice), roi, scanner, passkey, palette, pwa, world (WebGL), hud, brand
lib/            data, i18n dictionaries, ai prompt, agent actions, roi, pdf writer, sandbox, vision, voice, seo, stores
public/         images (founder portrait), icons, pwa icons, project screenshots, textures, sw.js
scripts/        patch-next-dev-manifest (postinstall), build-icons, build-textures
tests/          Vitest suites
```

## Run it

```bash
npm install          # also patches Next's dev manifest write (postinstall)
cp .env.example .env.local
npm run dev          # http://localhost:3000 → /es or /en
```

| Script | Does |
| --- | --- |
| `npm run dev` / `build` / `start` | Development, production build, production server |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `node scripts/build-icons.mjs` | Re-renders favicon, Apple and PWA icons from `app/icon.svg` |

The install button and offline mode only appear in a production build (`npm run build && npm start`).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical origin for metadata, sitemap and JSON-LD. Default `https://iazr.tech`; set `https://portafolio-iazr.vercel.app` until the domain points to Vercel |
| `GROQ_API_KEY` | For the live assistant | Without it the assistant answers in demo mode |
| `GROQ_MODEL` | No | Model override (default `openai/gpt-oss-20b`) |
| `RESEND_API_KEY`, `RESEND_FROM` | For the contact form | Without them the form runs in demo mode |
| `NEXT_PUBLIC_BOOKING_URL` | No | https Cal.com / Calendly link for the booking drawer |
| `NEXT_PUBLIC_CHECKOUT_CARD_URL`, `NEXT_PUBLIC_CHECKOUT_PSE_URL`, `NEXT_PUBLIC_CHECKOUT_CRYPTO_URL` | No | https payment links; without them each option opens WhatsApp. No card data ever passes through the site |
| `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_KEY`, hosts | No | Analytics |

## Deploy (Vercel)

1. Import the GitHub repository in Vercel (framework preset: Next.js).
2. Add the variables above under *Settings → Environment Variables*.
3. Point `iazr.tech` to the project under *Settings → Domains*, then set `NEXT_PUBLIC_SITE_URL=https://iazr.tech`.
4. Every push to `main` deploys.

Response headers (`next.config.ts`): `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN` and a
`Permissions-Policy` that allows camera, microphone and passkeys for this origin only.

## SEO

Per-locale metadata with `hreflang` (`es`, `en`, `x-default`), generated share images
(`app/[locale]/opengraph-image.tsx`), `sitemap.xml`, `robots.txt` and a JSON-LD graph:
Organization, ProfessionalService (both tracks), Person (founder, 15 certifications, portrait) and WebSite.

## Security

- `/api/chat`: 20 requests / 10 min per IP, validated messages, page actions sent as fixed codes only.
- `/api/sandbox`: 30 requests / 10 min per IP, validated sample input.
- Contact form: 3 submissions / 10 min per IP plus a honeypot.
- Rate-limit store is in memory per instance (best effort on serverless); `RateLimitStore` accepts a shared store.

## Notes for contributors

Project rules live in `CLAUDE.md`, product context in `PRODUCT.md`, the design system in `DESIGN.md`.
Never invent figures, clients or reviews. Never use violet.
