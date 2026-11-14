# Mundo inmersivo IAZR — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir el portafolio en un "mundo continuo": un único Canvas WebGL fijo guiado por el scroll, con el contenido real en HTML bilingüe (ES/EN) superpuesto, agenda en drawer, sonido generativo opt-in y backend endurecido.

**Architecture:** El layout raíz (`app/layout.tsx`) aloja el `<Canvas>` persistente, el HUD y el drawer de agenda; el contenido vive en `app/[locale]/…` (SSR por idioma) y el cambio de idioma es navegación blanda, de modo que el Canvas nunca se remonta. El scroll de Lenis alimenta una tienda de módulo que `useFrame` lee sin renders de React. La escena no contiene texto.

**Tech Stack:** Next.js 15.5 (App Router), React 19, Tailwind v4, three 0.185, @react-three/fiber 9.7, drei, @react-three/postprocessing 3.2, Lenis, Zod 4, AI SDK v7 + Groq, Vitest, ESLint (flat config).

**Spec:** `docs/superpowers/specs/2026-11-13-immersive-world-design.md`

## Global Constraints

- Rama `feat/immersive-world`; no se hace push ni merge a `main` sin pedirlo al dueño.
- Idiomas: `es`, `en`. Sin preferencia detectable → `en`; `Accept-Language` en español → `es`.
- Rate limit por IP con TTL: chat **20 solicitudes / 10 min**; formulario **3 / 10 min**.
- Chat: máx. **20 mensajes**, **2 000** caracteres por mensaje, **12 000** en total; solo roles `user`/`assistant`; solo partes de texto.
- Niveles de calidad: `high`, `medium`, `low`, `static`. `prefers-reduced-motion`, `Save-Data` o sin WebGL → `static`.
- Post-procesado (bloom, grano, viñeta) solo en `high`/`medium`.
- Sonido: no se crea ningún `AudioContext` antes del clic del usuario en el botón del HUD.
- `NEXT_PUBLIC_BOOKING_URL`: solo se acepta `https:`; si no, fallback a contacto directo.
- React Compiler **desactivado**. No hay `experimental_ppr`.
- La escena 3D no renderiza texto; el `<canvas>` lleva `aria-hidden`; todo el contenido es HTML accesible por teclado.
- `npm ci` estricto (sin `--legacy-peer-deps`) debe pasar; no se añade `.npmrc` salvo que sea imprescindible y documentado.
- Texturas de proyectos: potencia de 2 (**1024×512** en high/medium, **512×256** en low), subidas a GPU de a una por frame, `anisotropy` = `min(tier, máximo de la GPU)`.
- Commits terminan con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Cambio de idioma a mitad del scroll** → el mismo elemento `<canvas>` sigue en el DOM y la posición de scroll se conserva (Task 5 `localizedPath` + Task 16 verificación en navegador).
2. **URLs antiguas sin idioma** (`/about`, `/#proyectos`, enlaces compartidos) → redirigen a `/{locale}/about` o `/{locale}` sin 404 (Task 5 test de `resolveLocaleRedirect`).
3. **Redimensionar ventana / girar el móvil** → los rangos de sección se recalculan y la cámara no salta a una escena equivocada (Task 7 test de `computeSectionRanges`).
4. **`NEXT_PUBLIC_BOOKING_URL` vacía, `http:` o `javascript:`** → el drawer muestra el fallback, jamás un iframe (Task 15 test de `resolveBookingUrl`).
5. **Pestaña oculta o contexto WebGL perdido** → el bucle de render se pausa, el audio se suspende y el contenido sigue legible sobre el fondo estático (Task 14 test de suspensión + Task 16 verificación).

---

## Mapa de archivos

```
lib/i18n/config.ts            locales, defaultLocale, isLocale, pickLocale, resolveLocaleRedirect, localizedPath
lib/i18n/localized.ts         tipo Localized<T> y localize()
lib/i18n/dictionaries/es.ts   textos de UI (forma canónica: type Dictionary)
lib/i18n/dictionaries/en.ts
lib/i18n/get-dictionary.ts
lib/security/rate-limit.ts    store en memoria + limitadores chat/contact + getClientIp
lib/validations/chat.ts       parseChatRequest
lib/world/scroll-store.ts     estado de scroll global + rangos de sección
lib/world/quality.ts          niveles, detectInitialTier, TIER_SETTINGS, stepTier
lib/world/tier-store.ts       tienda observable del nivel activo
lib/world/camera-path.ts      cameraPoseAt
lib/world/interaction-store.ts proyecto en hover / escena activa
lib/world/textures.ts         cropRectForAspect, createUploadQueue
lib/world/shaders/*.ts        GLSL como strings TS
lib/audio/engine.ts           motor Web Audio generativo
lib/booking.ts                resolveBookingUrl
middleware.ts
app/layout.tsx                html, WorldMount, Hud, BookingDrawer, LocaleSync
app/[locale]/page.tsx · app/[locale]/about/page.tsx · app/sitemap.ts · app/robots.ts
components/world/*            world-mount, world-canvas, camera-rig, static-backdrop, effects, scenes/*
components/hud/*              hud, language-switch, sound-toggle
components/booking/*          booking-drawer, booking-button
components/sections/*         secciones HTML superpuestas (reemplazan hero/bento/services/projects)
scripts/build-textures.mjs    genera public/textures/projects/*.webp
tests/**                      vitest
```

Se eliminan: `app/page.tsx`, `app/about/page.tsx`, `components/three/*`, `components/hero/*`, `components/bento/*`, `components/projects/*`, `components/services/*`, `components/marquee.tsx` (si no se reutiliza), `public/sitemap.xml`, `public/robots.txt`, `.freebuff/`, `IAZR-foto-firma.png`.

---

### Task 1: Higiene del repositorio, ESLint y Vitest

**Files:**
- Delete: `.freebuff/`, `IAZR-foto-firma.png`
- Modify: `.gitignore` (añadir `.freebuff/`), `package.json` (scripts `lint`, `test`), `app/page.tsx` (quitar `experimental_ppr`)
- Create: `eslint.config.mjs`, `vitest.config.ts`, `tests/smoke.test.ts`

**Interfaces:**
- Produces: `npm test` (vitest run), `npm run lint` (`next lint`), alias `@/` resuelto en vitest.

- [ ] **Step 1:** `git rm -r --cached .freebuff IAZR-foto-firma.png`, borrar ambos del disco, añadir `.freebuff/` a `.gitignore`.
- [ ] **Step 2:** `npm i -D eslint@9 eslint-config-next@15.5 @eslint/eslintrc vitest@3 vite-tsconfig-paths`. `eslint.config.mjs` con `FlatCompat` extendiendo `next/core-web-vitals` y `next/typescript`; ignorar `.next`, `node_modules`, `scripts/`.
- [ ] **Step 3:** `vitest.config.ts` con `vite-tsconfig-paths`, `environment: "node"`, `include: ["tests/**/*.test.ts"]`. Script `"test": "vitest run"`.
- [ ] **Step 4:** Test humo `tests/smoke.test.ts`: `expect(cn("a", false && "b", "c")).toBe("a c")` importando `@/lib/utils`.
- [ ] **Step 5:** Quitar `export const experimental_ppr = true;` y su comentario de `app/page.tsx`.
- [ ] **Step 6:** Run `npm test` → PASS; `npm run lint` → sin errores (corregir los que aparezcan; warnings justificados en el commit); `npx tsc --noEmit` → limpio.
- [ ] **Step 7:** Commit `chore: higiene del repo, ESLint y Vitest`.

---

### Task 2: Rate limiter por IP con TTL

**Files:**
- Create: `lib/security/rate-limit.ts`, `tests/security/rate-limit.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type RateLimitResult = { ok: boolean; remaining: number; retryAfterMs: number };
  export interface RateLimitStore {
    hit(key: string, limit: number, windowMs: number, now: number): RateLimitResult;
  }
  export function createMemoryStore(opts?: { maxKeys?: number }): RateLimitStore; // default maxKeys 5000
  export function createRateLimiter(opts: { limit: number; windowMs: number; store?: RateLimitStore; now?: () => number }): { check(key: string): RateLimitResult };
  export function getClientIp(headers: Headers): string;
  export const chatLimiter: { check(key: string): RateLimitResult };    // 20 / 600_000 ms
  export const contactLimiter: { check(key: string): RateLimitResult }; // 3 / 600_000 ms
  ```

- [ ] **Step 1: Tests que fallan** (`now` inyectado):
  - `allows 20 then blocks the 21st within 10 min`: 20× `ok===true`, la 21ª `ok===false` y `retryAfterMs > 0`.
  - `allows again after the window expires`: tras avanzar `now` 600_001 ms, `ok===true`.
  - `sliding window`: 20 hits en t=0…19 000; en t=600_000 + 500 hay exactamente 1 cupo libre.
  - `isolates keys`: IP `1.1.1.1` agotada no afecta a `2.2.2.2`.
  - `evicts oldest keys over maxKeys`: con `maxKeys: 2`, tras 3 claves el tamaño interno no supera 2 (exponer `size()` solo en el tipo devuelto por `createMemoryStore`).
  - `getClientIp`: `"203.0.113.7, 10.0.0.1"` → `"203.0.113.7"`; espacios recortados; IPv6 `"2001:db8::1"` intacto; sin `x-forwarded-for` usa `x-real-ip`; sin ninguno → `"unknown"`.
- [ ] **Step 2:** `npx vitest run tests/security` → FAIL (módulo inexistente).
- [ ] **Step 3:** Implementar: `Map<string, number[]>` de timestamps; en cada `hit` se podan los vencidos; si se supera `maxKeys` se elimina la primera clave del `Map` (orden de inserción; reinsertar al tocar).
- [ ] **Step 4:** `npx vitest run tests/security` → PASS.
- [ ] **Step 5:** Commit `feat(security): rate limiter por IP con ventana deslizante`.

---

### Task 3: Configuración de idiomas y validación del payload del chat

**Files:**
- Create: `lib/i18n/config.ts`, `lib/validations/chat.ts`, `tests/i18n/config.test.ts`, `tests/validations/chat.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // lib/i18n/config.ts
  export const locales = ["es", "en"] as const;
  export type Locale = (typeof locales)[number];
  export const defaultLocale: Locale = "en";
  export function isLocale(v: unknown): v is Locale;
  export function pickLocale(acceptLanguage: string | null): Locale;
  export function resolveLocaleRedirect(pathname: string, acceptLanguage: string | null): string | null; // null = no redirigir
  export function localizedPath(pathname: string, target: Locale): string; // "/es/about" → "/en/about"
  // lib/validations/chat.ts
  export const CHAT_LIMITS = { maxMessages: 20, maxCharsPerMessage: 2000, maxTotalChars: 12000 } as const;
  export type ChatParseResult =
    | { ok: true; messages: UIMessage[]; locale: Locale }
    | { ok: false; status: 400 | 413; error: string };
  export function parseChatRequest(body: unknown): ChatParseResult;
  ```

- [ ] **Step 1: Tests que fallan**
  - `pickLocale`: `null`→`"en"`; `"es-CO,es;q=0.9"`→`"es"`; `"en-US,en;q=0.9,es;q=0.8"`→`"en"`; `"fr-FR"`→`"en"`; `"fr;q=1, es;q=0.5"`→`"es"` (primer idioma soportado por q).
  - `resolveLocaleRedirect`: `("/", "es")`→`"/es"`; `("/about", null)`→`"/en/about"`; `("/es/about", …)`→`null`; `("/en", …)`→`null`.
  - `localizedPath`: `("/es", "en")`→`"/en"`; `("/es/about", "en")`→`"/en/about"`.
  - `parseChatRequest`: 20 mensajes válidos → ok; 21 → `{ ok:false, status:413 }`; un texto de 2 000 → ok, 2 001 → 413; 7 mensajes de 1 800 (12 600) → 413; rol `system` → 400; body no-objeto → 400; partes `file`/`tool` se descartan y el mensaje conserva solo `text`; caracteres de control (`\u0000`, `\u001b`) eliminados pero `\n` y `\t` preservados; mensaje que queda vacío tras sanear se descarta; `locale` ausente → `"en"`, `"es"` → `"es"`, `"xx"` → 400.
- [ ] **Step 2:** `npx vitest run tests/i18n tests/validations/chat.test.ts` → FAIL.
- [ ] **Step 3:** Implementar con Zod 4 (`z.object({ messages: z.array(...).max(20), locale: z.enum(locales).optional() })`); el chequeo de longitudes devuelve 413 antes que errores de forma (400).
- [ ] **Step 4:** Tests → PASS.
- [ ] **Step 5:** Commit `feat: config de idiomas y validación del payload del chat`.

---

### Task 4: Endurecer `/api/chat` y la Server Action del formulario

**Files:**
- Modify: `app/api/chat/route.ts`, `app/actions/contact.ts`, `lib/ai/system-prompt.ts` (firma con locale, el copy se completa en Task 6)
- Create: `tests/api/chat-route.test.ts`, `tests/actions/contact.test.ts`

**Interfaces:**
- Consumes: `chatLimiter`, `contactLimiter`, `getClientIp` (Task 2); `parseChatRequest`, `Locale` (Task 3).
- Produces: `buildSystemPrompt(locale: Locale): string`; `submitContact` lee el campo oculto `locale` del `FormData`.

- [ ] **Step 1: Tests que fallan** (sin `GROQ_API_KEY` → modelo demo; `vi.spyOn(globalThis, "fetch")`):
  - Chat: body inválido → 400 JSON `{ error }`; 21 mensajes → 413; 21ª petición desde la misma IP en la ventana → 429 con cabecera `Retry-After` (segundos, entero ≥1); petición válida → 200 `text/event-stream`; **`fetch` nunca se llama a `api.groq.com/openai/v1/models`**.
  - Contacto (`vi.mock("next/headers")` devolviendo `x-forwarded-for`): 3 envíos válidos desde `1.1.1.1` → success; el 4º → error "rate"; un envío desde `2.2.2.2` justo después → success (ya no hay bloqueo global).
- [ ] **Step 2:** `npx vitest run tests/api tests/actions` → FAIL.
- [ ] **Step 3:** Route: eliminar la pre-validación con `fetch` a Groq; orden: rate limit → `parseChatRequest` → `streamText` con `buildSystemPrompt(locale)`; conservar `onError` y fallback demo del `catch`. Action: borrar `lastSubmitAt`/`THROTTLE_MS`, usar `contactLimiter.check(getClientIp(await headers()))` antes de validar.
- [ ] **Step 4:** Tests → PASS; `npm run build` → OK.
- [ ] **Step 5:** Commit `fix(api): rate limit por IP, validación del chat y sin llamada extra a Groq`.

---

### Task 5: Rutas por idioma bajo un layout raíz persistente

**Files:**
- Create: `middleware.ts`, `app/[locale]/page.tsx`, `app/[locale]/about/page.tsx`, `components/i18n/locale-sync.tsx`, `components/hud/language-switch.tsx`, `app/sitemap.ts`, `app/robots.ts`
- Delete: `app/page.tsx`, `app/about/page.tsx`, `public/sitemap.xml`, `public/robots.txt`
- Modify: `app/layout.tsx`, `lib/seo/json-ld.ts` (`buildJsonLdGraph(locale: Locale)`)

**Interfaces:**
- Consumes: `resolveLocaleRedirect`, `localizedPath`, `locales` (Task 3).
- Produces: `params: Promise<{ locale: Locale }>` en páginas; `<LanguageSwitch />` (client, usa `usePathname`, `<Link href={localizedPath(p, other)} scroll={false}>`); `<LocaleSync />` (client, fija `document.documentElement.lang` desde el primer segmento de la ruta).

- [ ] **Step 1:** `middleware.ts`: si `resolveLocaleRedirect` devuelve ruta → `NextResponse.redirect` (307). `matcher` excluye `api`, `_next`, `textures`, `proyectos` y cualquier ruta con extensión.
- [ ] **Step 2:** Mover el contenido de `app/page.tsx` y `app/about/page.tsx` a `app/[locale]/…` con `generateStaticParams` (`locales`) y `generateMetadata` que emite `alternates.languages` `{ es: "/es", en: "/en", "x-default": "/en" }` y `openGraph.locale` `es_CO`/`en_US`. Locale inválido → `notFound()`.
- [ ] **Step 3:** `app/layout.tsx`: `<html lang="en">` por defecto + `<LocaleSync />`; JSON-LD se mueve a las páginas (`buildJsonLdGraph(locale)`).
- [ ] **Step 4:** `app/sitemap.ts` (4 URLs con `alternates.languages`) y `app/robots.ts` equivalentes a los archivos públicos actuales.
- [ ] **Step 5:** Verificar: `npm run build` lista `/es`, `/en`, `/es/about`, `/en/about` como estáticas (SSG); `npm test` sigue en verde.
- [ ] **Step 6:** Commit `feat(i18n): rutas /es y /en bajo layout raíz persistente`.

---

### Task 6: Diccionarios, datos localizados y copy B2B global

**Files:**
- Create: `lib/i18n/localized.ts`, `lib/i18n/dictionaries/es.ts`, `lib/i18n/dictionaries/en.ts`, `lib/i18n/get-dictionary.ts`, `tests/i18n/dictionaries.test.ts`
- Modify: `lib/data/{site,services,projects,experience,skills}.ts`, `lib/validations/contact.ts`, `lib/ai/system-prompt.ts`, `app/actions/contact.ts` (autorespuesta en el idioma del lead), `components/contact/contact-form.tsx`, `components/chat/terminal-chat.tsx`, `components/timeline.tsx`, `components/footer.tsx`, `components/about/*`, `components/contact/contact-section.tsx`

**Interfaces:**
- Produces:
  ```ts
  export type Localized<T = string> = Record<Locale, T>;
  export function localize<T>(value: Localized<T>, locale: Locale): T;
  export type Dictionary = { /* forma de es.ts */ };       // es.ts: `export const es = {...} satisfies Dictionary`
  export function getDictionary(locale: Locale): Dictionary;
  ```
  Los campos de texto visibles de los datos pasan a `Localized` (p. ej. `Project.description: Localized`, `Service.title: Localized`, `ExperienceEntry.highlights: Localized<string[]>`). Los errores de Zod del contacto pasan a **claves** (`"name_min"`, `"email_invalid"`, …) que el formulario traduce con `dict.contact.errors[key]`. El chat envía `sendMessage({ text }, { body: { locale } })`.

- [ ] **Step 1: Tests que fallan** `tests/i18n/dictionaries.test.ts`:
  - `es` y `en` tienen exactamente el mismo conjunto de rutas de claves (recorrido profundo) y ninguna cadena vacía.
  - Cada campo `Localized` de `services`, `featuredProjects` (9), `experience`, `education`, `skills` tiene `es` y `en` no vacíos (recorrido genérico de objetos con forma `{es,en}`).
  - Cada clave de error que puede producir `contactSchema` existe en `dict.contact.errors` en ambos idiomas.
  - `buildSystemPrompt("en")` contiene `"Respond in English"` y `buildSystemPrompt("es")` contiene `"Responde en español"`; ambos conservan la frase fija anti-jailbreak de la norma 10.
- [ ] **Step 2:** `npx vitest run tests/i18n` → FAIL.
- [ ] **Step 3:** Escribir diccionarios y localizar datos. Copy: de "impacto nacional / Colombia" a B2B global (EE.UU., LATAM, empresas tecnológicas): entrega remota, solape horario con EE.UU. (GMT-5 = US Eastern en horario estándar), resultados medibles; servicios destacando desarrollo web de alto rendimiento, automatización y ecosistemas digitales (React/Next.js/Supabase). **Solo hechos verificados existentes** (7+ años, 11 certificaciones, 500+ mentorizados, 3 postgrados, SLA <24 h, auditoría 1–2 semanas); no inventar clientes ni cifras.
- [ ] **Step 4:** Tests → PASS; `npm run typecheck` y `npm run lint` limpios.
- [ ] **Step 5:** Commit `feat(i18n): diccionarios ES/EN, datos localizados y copy B2B global`.

---

### Task 7: Núcleo del mundo — scroll, niveles de calidad y Canvas persistente

**Files:**
- Create: `lib/world/scroll-store.ts`, `lib/world/quality.ts`, `lib/world/tier-store.ts`, `lib/world/camera-path.ts`, `components/world/world-mount.tsx`, `components/world/world-canvas.tsx`, `components/world/camera-rig.tsx`, `components/world/static-backdrop.tsx`, `tests/world/{scroll,quality,camera}.test.ts`
- Modify: `components/providers/providers.tsx` (Lenis → scroll-store; quitar next-themes), `app/layout.tsx` (monta `<WorldMount />`)
- Delete: `components/three/*`, `lib/hooks/use-offscreen-pause.ts` (si queda sin uso)

**Interfaces:**
- Produces:
  ```ts
  export type SceneId = "hero" | "services" | "projects" | "journey" | "chat" | "contact";
  export const SCENES: readonly SceneId[];
  export type SectionRange = { id: SceneId; start: number; end: number }; // en progreso global 0..1
  export function computeSectionRanges(sections: { id: SceneId; top: number; height: number }[], docHeight: number, viewportHeight: number): SectionRange[];
  export function localProgress(global: number, range: SectionRange): number; // sin clamp: <0 antes, >1 después
  export const scrollState: { progress: number; velocity: number; ranges: SectionRange[] };
  export function setScroll(progress: number, velocity: number): void;
  export function registerSections(root: HTMLElement): () => void; // lee [data-world-section], ResizeObserver → recomputa
  export type QualityTier = "high" | "medium" | "low" | "static";
  export type TierEnv = { webgl: boolean; reducedMotion: boolean; saveData: boolean; cores: number; deviceMemory?: number; coarsePointer: boolean };
  export function detectInitialTier(env: TierEnv): QualityTier;
  export function stepTier(tier: QualityTier, dir: "down" | "up"): QualityTier; // nunca pasa a/desde "static" por FPS
  export const TIER_SETTINGS: Record<Exclude<QualityTier, "static">, { dpr: [number, number]; particles: number; post: "full" | "light" | "none"; textureSize: 1024 | 512; anisotropy: number }>;
  export function useTier(): QualityTier;           // useSyncExternalStore sobre tier-store
  export function setTier(t: QualityTier): void;
  export function cameraPoseAt(progress: number): { position: [number, number, number]; target: [number, number, number] };
  ```
  Valores: high `{ dpr:[1,2], particles: 24000, post:"full", textureSize:1024, anisotropy:8 }`, medium `{ [1,1.5], 12000, "light", 1024, 4 }`, low `{ [1,1], 5000, "none", 512, 1 }`.
  Cada sección HTML lleva `data-world-section="<SceneId>"`.

- [ ] **Step 1: Tests que fallan**
  - `computeSectionRanges`: con docHeight 5000 y viewport 1000, una sección top 1000 height 1000 → `start 0.25, end 0.5` (progreso = scrollY / (docHeight − viewport)); tras simular resize (docHeight 8000) los rangos cambian coherentemente; rangos ordenados y no solapados.
  - `localProgress`: 0 en `start`, 1 en `end`, negativo antes.
  - `detectInitialTier`: reducedMotion → static; saveData → static; webgl false → static; cores 2 → low; coarsePointer + deviceMemory 4 → low; coarsePointer + deviceMemory 8 → medium; deviceMemory 2 (escritorio) → medium; cores 8 / memoria 8 → high.
  - `stepTier`: high↓medium↓low↓low; low↑medium↑high↑high; static↓static, static↑static.
  - `cameraPoseAt`: clamp (−1 → igual que 0; 2 → igual que 1); 0 y 1 coinciden con primer/último keyframe; muestras consecutivas a 0.001 nunca saltan más de 0.5 unidades.
- [ ] **Step 2:** `npx vitest run tests/world` → FAIL.
- [ ] **Step 3:** Implementar los módulos puros; `camera-path` con `CatmullRomCurve3` (6 keyframes, uno por escena, curva centrípeta).
- [ ] **Step 4:** Componentes: `WorldMount` = `dynamic(() => import("./world-canvas"), { ssr:false })` + `StaticBackdrop` (gradiente CSS + ruido SVG) visible en `static` o mientras carga. `WorldCanvas`: `position:fixed inset-0 -z-10`, `aria-hidden`, `pointer-events:none`, `dpr` por nivel, `<PerformanceMonitor onDecline={↓} onIncline={↑} flipflops={3} onFallback={→low}>`, `frameloop="never"` con `document.hidden`, manejo `webglcontextlost`/`restored` (→ backdrop), `ErrorBoundary` → `setTier("static")`. `CameraRig` aplica `cameraPoseAt(scrollState.progress)` con amortiguación (`maath/easing.damp3`). En `?debug` expone `window.__IAZR_WORLD__ = { tier, calls, fps }` (`gl.info.render.calls`).
- [ ] **Step 5:** Tests → PASS; `npm run build` OK; en navegador (`npm run dev`) `/en` muestra el Canvas y `/en?debug` reporta `tier`.
- [ ] **Step 6:** Commit `feat(world): canvas persistente, sincronía con Lenis y niveles adaptativos`.

---

### Task 8: Secciones HTML superpuestas

**Files:**
- Create: `components/sections/{hero,services,projects,journey,chat,contact}-section.tsx`, `components/sections/project-card.tsx`, `lib/world/interaction-store.ts`
- Modify: `app/[locale]/page.tsx`, `app/globals.css` (tipografía/espaciado del overlay, legibilidad sobre el Canvas)
- Delete: `components/hero/*`, `components/bento/*`, `components/services/*`, `components/projects/*`, `components/marquee.tsx` (si no se reutiliza)

**Interfaces:**
- Consumes: `Dictionary`, `localize` (Task 6); `registerSections`, `SceneId` (Task 7).
- Produces: `setHoveredProject(id: string | null)`, `interactionState.hoveredProject` (lo lee la escena de portales). Cada sección recibe `{ locale: Locale; dict: Dictionary }`.

- [ ] **Step 1:** Página = secciones en orden `hero → services → projects → journey → chat → contact`, cada una con `data-world-section`. Contenido conservado: hero (marca IAZR, rol, 4 métricas, CTA agendar/proyectos/CV), servicios (4) + capacidades (skills), 9 proyectos (nombre, rol, año, descripción, stack, enlace, captura `next/image` como respaldo accesible), trayectoria (`Timeline`), chat (`TerminalChat`), contacto (`ContactSection`).
- [ ] **Step 2:** Las tarjetas de proyecto llaman `setHoveredProject` en `pointerenter`/`focus` y `null` en `pointerleave`/`blur`. Los paneles usan fondo translúcido + `backdrop-blur` suficiente para contraste AA sobre la escena.
- [ ] **Step 3:** Verificar: navegación completa por teclado (Tab recorre CTAs, tarjetas, chat, formulario); `npm run build`, `lint`, `test` limpios.
- [ ] **Step 4:** Commit `feat(sections): overlay HTML del mundo con contenido localizado`.

---

### Task 9: Escena hero — entidad de partículas GLSL

**Files:**
- Create: `lib/world/shaders/noise.ts` (simplex/curl), `lib/world/shaders/entity.ts`, `components/world/scenes/hero-entity.tsx`
- Modify: `components/world/world-canvas.tsx`

**Interfaces:**
- Consumes: `TIER_SETTINGS[tier].particles`, `scrollState`, `localProgress`.
- Produces: `<HeroEntity />` (un solo `Points` con `ShaderMaterial`; uniforms `uTime`, `uPointer: vec2`, `uProgress`, `uPixelRatio`, `uColorA`, `uColorB`).

- [ ] **Step 1:** Geometría generada una vez (`BufferGeometry` con `position` + `aSeed`), recreada solo al cambiar nivel. El vertex shader desplaza con ruido curl, reacciona a `uPointer` (puntero escuchado en `window`, normalizado) y se dispersa con `uProgress`. Blending aditivo, `depthWrite:false`.
- [ ] **Step 2:** Con `reducedMotion` no aplica (nivel `static`). Fuera de su rango (`localProgress > 1.5`) se oculta (`visible=false`).
- [ ] **Step 3:** Verificar en navegador con `?debug`: `calls` del hero = 1 para la entidad; FPS ≥ 55 en la máquina de desarrollo en `high`.
- [ ] **Step 4:** Commit `feat(world): entidad de partículas del hero en GLSL`.

---

### Task 10: Servicios, red y trayectoria con instancias y geometría fusionada

**Files:**
- Create: `components/world/scenes/service-forms.tsx`, `components/world/scenes/network.tsx`, `components/world/scenes/journey-ribbon.tsx`, `lib/world/shaders/{fresnel,lines}.ts`, `lib/world/geometry.ts`, `tests/world/geometry.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function buildArcSegments(count: number, radius: number, segments: number, lift?: number): Float32Array; // pares de puntos para LineSegments
  ```
  `<ServiceForms />` (4 mallas, una por servicio, material fresnel compartido), `<Network />` (**un** `LineSegments`), `<JourneyRibbon count={n} />` (**un** `InstancedMesh` para los nodos + una línea).

- [ ] **Step 1: Test que falla** `buildArcSegments(14, 1.6, 24)` → `length === 14 * 24 * 2 * 3`; todos los puntos con distancia al origen ≥ 1.6 − 1e-6.
- [ ] **Step 2:** `npx vitest run tests/world/geometry.test.ts` → FAIL; implementar; → PASS.
- [ ] **Step 3:** Componentes, cada uno visible solo cerca de su rango. `JourneyRibbon` usa `n = experience.length + education.length`.
- [ ] **Step 4:** Verificar `?debug`: la red cuesta 1 draw call (antes 14); los nodos de trayectoria, 1.
- [ ] **Step 5:** Commit `perf(world): instancias y geometría fusionada en servicios, red y trayectoria`.

---

### Task 11: Portales de proyectos con texturas optimizadas para VRAM

**Files:**
- Create: `scripts/build-textures.mjs`, `public/textures/projects/<id>-{1024,512}.webp` (generadas y versionadas), `lib/world/textures.ts`, `components/world/scenes/project-portals.tsx`, `lib/world/shaders/portal.ts`, `tests/world/textures.test.ts`
- Modify: `package.json` (script `textures`)

**Interfaces:**
- Consumes: `featuredProjects` (ids, `image`), `interactionState.hoveredProject`, `TIER_SETTINGS[tier].textureSize/anisotropy`.
- Produces:
  ```ts
  export function cropRectForAspect(srcW: number, srcH: number, aspect: number): { x: number; y: number; w: number; h: number }; // anclado arriba (object-top)
  export function createUploadQueue(perFrame?: number): { enqueue(task: () => void): void; flush(): number; size(): number }; // default 1
  ```

- [ ] **Step 1: Tests que fallan**
  - `cropRectForAspect(1600, 1000, 2)` → `{ x:0, y:0, w:1600, h:800 }`; `(1000, 1000, 2)` → `{ x:0, y:0, w:1000, h:500 }`; imagen más ancha que el aspecto `(3000, 1000, 2)` → `{ x:500, y:0, w:2000, h:1000 }`.
  - `createUploadQueue(1)`: 3 tareas encoladas → `flush()` ejecuta 1 y devuelve 1, `size()===2`; tras 3 flush, `size()===0` y `flush()` devuelve 0.
- [ ] **Step 2:** FAIL → implementar → PASS.
- [ ] **Step 3:** `scripts/build-textures.mjs` (usa `@napi-rs/canvas` ya instalado): por cada PNG de `public/proyectos/`, recorte 2:1 anclado arriba y salida webp de 1024×512 y 512×256 (calidad 0.82). Ejecutarlo y versionar la salida.
- [ ] **Step 4:** `ProjectPortals`: 9 planos 2:1 en arco por la ruta de la cámara. Carga diferida cuando `localProgress(projects) > -0.35`: `fetch` → `createImageBitmap(blob, { imageOrientation: "flipY" })` (fuera del hilo principal) → `THREE.Texture` con `colorSpace = SRGBColorSpace`, `generateMipmaps = true`, `anisotropy = min(TIER.anisotropy, gl.capabilities.getMaxAnisotropy())` → la cola llama `gl.initTexture(tex)` **una por frame**. Hasta que llega la textura, el portal muestra un shader de ruido. Al cambiar de nivel se recargan con el tamaño nuevo y se hace `dispose()` de las anteriores; al desmontar, `dispose()` de todas. Hover (`hoveredProject`) → uniform `uHover` 0→1 amortiguado (distorsión + brillo de borde).
- [ ] **Step 5:** Verificar con `?debug` exponiendo `gl.info.memory.textures`: ≤ 9 texturas de portal activas; sin frames > 50 ms durante la carga (Performance panel o `PerformanceObserver` de long tasks en el navegador integrado).
- [ ] **Step 6:** Commit `feat(world): portales de proyectos con texturas POT y subida escalonada`.

---

### Task 12: Post-procesado y compatibilidad de dependencias

**Files:**
- Modify: `package.json`, `package-lock.json`, `components/world/world-canvas.tsx`
- Create: `components/world/effects.tsx`

**Interfaces:**
- Consumes: `TIER_SETTINGS[tier].post`.
- Produces: `<Effects mode="full" | "light" />` cargado con `React.lazy`.

- [ ] **Step 1:** `npm i @react-three/postprocessing@^3.2.2 postprocessing@^6.36` **sin** `--legacy-peer-deps`. Run `npm ls react @react-three/fiber three postprocessing` → sin `invalid`/`UNMET PEER`. Luego `rm -rf node_modules && npm ci` → exit 0 (simula el pipeline de Vercel). Solo si falla: fijar versiones compatibles o `.npmrc` documentado en README.
- [ ] **Step 2:** `Effects`: `full` = Bloom (`luminanceThreshold 0.55`, `intensity 0.9`, `mipmapBlur`) + Noise (`opacity 0.06`, `premultiply`) + Vignette (`darkness 0.55`); `light` = Bloom (`intensity 0.6`) + Noise. `low`/`static` no lo montan.
- [ ] **Step 3:** Verificar: `npm run build` OK; `?debug` en `high` FPS ≥ 55 en la máquina de desarrollo.
- [ ] **Step 4:** Commit `feat(world): bloom, grano y viñeta por nivel de calidad`.

---

### Task 13: HUD

**Files:**
- Create: `components/hud/hud.tsx`
- Modify: `app/layout.tsx`
- Delete: `components/navbar.tsx`

**Interfaces:**
- Consumes: `<LanguageSwitch />` (Task 5), `<SoundToggle />` (Task 14), `<BookingButton />` (Task 15), `getDictionary` (Task 6).
- Produces: `<Hud />` — marca, navegación por anclas, idioma, sonido, CV, agendar; menú móvil; indicador de progreso de scroll (barra fina leyendo `scrollState` en `requestAnimationFrame`, sin estado de React por frame).

- [ ] **Step 1:** Implementar; los textos salen del diccionario del idioma de la ruta (`usePathname`). Se retira el selector de tema: el mundo es oscuro por diseño (anotarlo en README).
- [ ] **Step 2:** Verificar teclado (orden de foco lógico, `aria-label` en botones de icono) y `lint`.
- [ ] **Step 3:** Commit `feat(hud): navegación, idioma, sonido y agendar`.

---

### Task 14: Sonido generativo opt-in

**Files:**
- Create: `lib/audio/engine.ts`, `components/hud/sound-toggle.tsx`, `tests/audio/engine.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type AudioEngine = {
    start(): Promise<void>; stop(): void; isRunning(): boolean;
    setScene(id: SceneId): void; setScrollVelocity(v: number): void; blip(kind: "hover" | "click"): void;
  };
  export function createAudioEngine(deps?: { createContext?: () => AudioContext; doc?: Pick<Document, "hidden" | "addEventListener" | "removeEventListener"> }): AudioEngine;
  export const SOUND_PREF_KEY = "iazr.sound";
  ```

- [ ] **Step 1: Tests que fallan** (fake `AudioContext` mínimo con `createOscillator/createGain/createBiquadFilter/createConvolver/createBuffer/resume/suspend/close`):
  - `createAudioEngine()` y `setScene`/`blip` antes de `start()` → `createContext` **no** se llama.
  - `start()` → se llama exactamente una vez, `isRunning()===true`; un segundo `start()` no crea otro contexto.
  - `visibilitychange` con `hidden=true` → `suspend()`; con `hidden=false` y motor activo → `resume()`.
  - `stop()` → rampa de ganancia a 0 y `isRunning()===false`.
- [ ] **Step 2:** FAIL → implementar → PASS. Síntesis: 3 osciladores desafinados por acorde → filtro low-pass (corte modulado por `setScrollVelocity`) → convolver con respuesta de impulso generada (ruido decreciente 2,5 s) → ganancia maestra (máx. 0.18). `setScene` transiciona a un acorde por escena en 2 s. `blip`: seno corto con envolvente de 80 ms.
- [ ] **Step 3:** `SoundToggle`: botón con `aria-pressed`, icono + etiqueta del diccionario; `localStorage` (envuelto en try/catch) recuerda la preferencia solo para mostrar una pista, nunca arranca solo. Un suscriptor de `scrollState` llama `setScene` al cambiar de rango.
- [ ] **Step 4:** Commit `feat(audio): paisaje sonoro generativo opt-in`.

---

### Task 15: Drawer de agenda

**Files:**
- Create: `lib/booking.ts`, `components/booking/booking-drawer.tsx`, `components/booking/booking-button.tsx`, `tests/booking.test.ts`
- Modify: `app/layout.tsx`, `components/sections/{hero,services,contact}-section.tsx`, `.env.example`

**Interfaces:**
- Produces:
  ```ts
  export function resolveBookingUrl(raw: string | undefined): string | null;
  export function openBooking(source: string): void;  // emite posthog "booking_opened" { source }
  export function useBookingOpen(): boolean;
  ```
  `<BookingButton source="hero" | "services" | "contact" | "hud" />`.

- [ ] **Step 1: Tests que fallan** `resolveBookingUrl`: `undefined`→`null`; `""`→`null`; `"http://cal.com/x"`→`null`; `"javascript:alert(1)"`→`null`; `"not a url"`→`null`; `"https://cal.com/iazr/30min"`→ la misma cadena; `"  https://calendly.com/iazr  "`→ recortada.
- [ ] **Step 2:** FAIL → implementar → PASS.
- [ ] **Step 3:** Drawer con `<dialog>` + `showModal()` (foco atrapado e inert nativos, `Esc` cierra, foco vuelve al botón que lo abrió); el iframe (`title`, `loading="lazy"`) se monta solo al abrir. Con `null`: email, WhatsApp y enlace a `#contacto`. Añadir `NEXT_PUBLIC_BOOKING_URL=` a `.env.example`.
- [ ] **Step 4:** Commit `feat(booking): drawer de consultoría con fallback seguro`.

---

### Task 16: README y verificación final

**Files:**
- Modify: `README.md`

- [ ] **Step 1:** README reescrito: arquitectura real (mundo continuo, rutas por idioma, niveles, texturas, audio, agenda, seguridad), variables de entorno (incluida `NEXT_PUBLIC_BOOKING_URL`), scripts (`test`, `lint`, `textures`), límites conocidos (rate limit en memoria por instancia; `<html lang>` en cliente; React Compiler desactivado a propósito; sin modo claro). Sin afirmaciones de PPR.
- [ ] **Step 2:** `npm run lint && npx tsc --noEmit && npm test && npm run build` → todo en verde; anotar el tamaño de First Load JS de `/en`.
- [ ] **Step 3: Verificación en navegador** (`npm start`, navegador integrado):
  - En `/es` a mitad de los proyectos, marcar el canvas (`document.querySelector("canvas").dataset.probe = "1"`), cambiar a EN → la URL es `/en`, `dataset.probe === "1"` y `scrollY` se conserva (±50 px).
  - `/about` y `/` redirigen a `/{locale}…`.
  - `typeof window.__audioCtxCount` / espía de `AudioContext`: 0 contextos antes de pulsar el botón de sonido, 1 después.
  - Drawer: abre, `Esc` cierra, foco vuelve; sin variable → fallback.
  - Emular `prefers-reduced-motion: reduce` → no hay `<canvas>`, todo el contenido visible.
  - `?debug` en `high`: anotar FPS y draw calls por escena.
  - Viewport móvil (375×812): nivel `low`/`medium`, sin scroll horizontal.
- [ ] **Step 4:** Commit `docs: README con la arquitectura real` y reportar al dueño lo verificado y lo no verificable (GPUs reales de terceros).
