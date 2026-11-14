# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The site has two buyers with equal weight. It must convince both, and each one has to find its own track quickly.

- **Local business owners in LATAM**: clinics, medical and professional offices, shops. Their messages on WhatsApp and Instagram go unanswered, their bookings are handled by hand, and they collect no reviews at the point of sale. They buy **Track 01, a ready-made product**.
- **Mid-size companies and startups in the US and LATAM**: operations, IT and management leads. Their processes are manual and their data sits apart in Excel, ERP, email and calendars. They buy **Track 02, custom engineering**.

Secondary audiences: recruiters, institutions and academic partners who are checking the founder's background (CV and career timeline).

## Product Purpose

IA-ZR (iazr.tech) designs and implements AI systems, process automation and high-performance web platforms. These systems run a business's operations 24/7: less manual work, every lead answered in seconds, and the data in one place.

The site has two jobs: explain both tracks clearly and turn visits into a booked consultation or a contact (WhatsApp, form, booking). Success means a qualified lead books or writes in after they:
- understand which track fits them;
- see real deployments;
- try the AI chat.

Tagline: "Transformamos ideas y operaciones manuales en sistemas inteligentes que funcionan solos."

## Positioning

- The client speaks directly to the person who designs and builds the system, Iván Andrés Zúñiga Romo, who brings proven engineering, business and teaching credentials.
- IA-ZR covers the whole chain in one place: the physical point of sale (NFC/QR), conversation (WhatsApp AI), operations (booking, CRM, ERP, n8n) and management (Power BI/SQL dashboards).
- Its 9 deployments are real and in production.

## Operating Context

- **Track 01, "Ecosistema IA-ZR Control & Presencia Inteligente"**: turnkey, live in days. It includes:
  - a WhatsApp AI agent, 24/7;
  - booking and reminders;
  - NFC business cards and stands;
  - a QR code that collects 5★ Google reviews;
  - a high-conversion landing page;
  - a mini-CRM.
- **Track 02, "Sistemas Empresariales a medida"**:
  - process automation with n8n;
  - integration with ERP and accounting software (SAP, Siigo Nube);
  - executive Power BI and SQL dashboards;
  - custom full-stack SaaS and web platforms (Next.js 15, React 19, Supabase, Node.js, Python).
- **Reference flow, end to end with no manual step**:
  1. The client contacts the business on WhatsApp or scans an NFC tag or QR code.
  2. The AI agent answers and qualifies them.
  3. The appointment is confirmed and a reminder is sent.
  4. The client is registered in the CRM (Supabase) and a 5★ review is posted on Google.
- **Channels**: Instagram @iazr.tech · LinkedIn /in/iazr96 · GitHub /andreszuniga96 · WhatsApp +57 322 913 2643 · iazr.code@gmail.com.

## Capabilities and Constraints

- **Existing site**: Next.js 15 App Router, React 19 and Tailwind v4, with an immersive R3F/WebGL world (adaptive quality tiers), ES/EN with no reload (`/[locale]`), a Groq AI chat, a booking drawer (`NEXT_PUBLIC_BOOKING_URL`), and a contact form with per-IP rate limiting. Deployed on Vercel.
- **Languages**: Spanish and English. English is the fallback; Spanish is chosen from Accept-Language.
- **Team**: the founder plus occasional collaborators. "We" means the IA-ZR brand, and direct contact with the founder is a selling point. Never present a large permanent team.
- **Open decisions**:
  - Whether the domain iazr.tech is the canonical URL (today the site is at portafolio-iazr.vercel.app).
  - Track 01 prices are not published.

## Brand Commitments

- Trade name: **IA-ZR (iazr.tech)**.
- Founder: Iván Andrés Zúñiga Romo, Systems and Telecommunications Engineer; MBA with honours; Specialist in Senior Management; Specialist in AI (UNIR).
- Voice: corporate authority in the first person plural, B2B. The founder section speaks about Iván.

## Evidence on Hand

- **9 production deployments** (`lib/data/projects.ts`, screenshots in `public/proyectos/`): Emssanar EPS, SST MedSys, Zolaris Ingeniería, La Campana, Dozurcol Pasto, Método Sonora, Paisajes Sonoros, Portafolio SST, Panini 2026.
- **Zolaris Ingeniería (flagship, verified metrics):** over 80% less time to first response with the AI assistant on WhatsApp (24/7); 100% of operational traceability centralised in the custom CRM and HR platform; 99.9% uptime for the full-stack corporate site wired into n8n.
- **Metrics for the other 8 projects** have not been supplied. Do not show figures for them.
- **Track 01 clients (may be named):**
  - Zolaris Ingeniería: WhatsApp AI sales assistant, CRM and corporate site.
  - Gloria Marina Romo's ontological coaching practice: automated booking (Calendly, Google Meet, Supabase), conversion landing and review capture.
  - Businesses in Pasto (Dozurcol Pasto, La Campana): B2B web presence, local SEO and quick contact through NFC and QR cards and stands.
- **Founder** (`lib/data/experience.ts`): 7+ years of experience, 500+ people trained in national programmes (Talento TECH, Universidad de Antioquia) with 100% of MVPs delivered, a sales response SLA under 24 business hours, and a downloadable CV.
- **15 international certifications** (`certifications` in `lib/data/experience.ts`, which drives every count):
  - 8 Coursera Professional Certificates from 2025, each with a public verification URL: Power BI PL-300, Google Cybersecurity, AWS Cloud Support, SAP Technology Consultant, Microsoft Front-End, Tableau BI, Adobe Marketing, Google Digital Marketing & E-commerce.
  - 4 Huawei HCIA: AI, Cloud, IoT, 5G.
  - 3 from Google and Microsoft: Google Data Analytics, Google IT Support, Azure Fundamentals.
  - Plus executive diplomas in BPM Modelling, Human Talent Management (Universidad Mariana, 2026) and CRM Administration.
- **Absences**: there are no publishable testimonials. Never invent testimonials, clients, figures or reviews.

## Product Principles

1. **Two clear tracks**: each buyer must know within seconds whether they need Track 01 or Track 02.
2. **Show it working**: real flows, real deployments and the live AI chat beat any promise.
3. **Verifiable truth**: every figure, client and credential comes from the record above.
4. **A person behind the system**: the founder's direct accountability is part of the offer.
5. **Every visit ends in a next step**: booking, WhatsApp or the form.

## Accessibility & Inclusion

- The site must honour `prefers-reduced-motion`; it then shows a static tier with no WebGL.
- The site must be fully keyboard accessible.
- Text must stay legible on top of the 3D scene.
