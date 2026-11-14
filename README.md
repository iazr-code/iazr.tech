# IAZR — Portafolio inmersivo de Iván Andrés Zúñiga

Portafolio bilingüe (ES/EN) construido como un **mundo 3D continuo**: un único
Canvas WebGL fijo que la cámara recorre con el scroll, con todo el contenido real
en HTML accesible por encima. Escenas procedurales (GLSL), post-procesado
cinematográfico, sonido generativo opt-in, asistente con IA y agenda integrada.

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 15.5 (App Router, SSG por idioma) + React 19 |
| Estilos | Tailwind CSS v4 (`@theme` en `app/globals.css`), tema oscuro único |
| 3D | three 0.185 · @react-three/fiber 9.7 · drei · @react-three/postprocessing 3.2 |
| Scroll | Lenis (scroll nativo suavizado) → tienda de scroll leída por `useFrame` |
| Audio | Web Audio API (síntesis, sin archivos) |
| IA | Vercel AI SDK v7 + Groq (`/api/chat`, streaming) |
| Formularios | Server Action + Zod + Resend · telemetría PostHog |
| Calidad | Vitest · ESLint (CLI, config plana) · TypeScript estricto |

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena las claves que necesites
npm run dev                  # http://localhost:3000 → redirige a /en o /es
```

| Script | Qué hace |
| --- | --- |
| `npm run dev` / `build` / `start` | Desarrollo, build de producción y servidor |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run lint` | ESLint (`eslint .`; `next lint` está deprecado) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run textures` | Regenera las texturas de los portales desde `public/proyectos/*.png` |
| `npm run test:adversarial` | Batería anti-jailbreak del chat (requiere servidor + `GROQ_API_KEY`) |

## Variables de entorno

| Variable | Uso | Sin ella |
| --- | --- | --- |
| `GROQ_API_KEY` | Asistente IA real (`GROQ_MODEL` opcional) | Modo demo con respuesta predefinida |
| `RESEND_API_KEY` / `RESEND_FROM` | Entrega del formulario y autorespuesta | Modo demo (éxito sin envío) |
| `POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_KEY` | Embudo visita → lead (sin PII) | No se registra nada |
| `NEXT_PUBLIC_BOOKING_URL` | URL **https** de Cal.com o Calendly para el drawer "Agendar" | El drawer muestra email y WhatsApp |
| `NEXT_PUBLIC_SITE_URL` | URL canónica (SEO, OG, JSON-LD) | `https://portafolio-iazr.vercel.app` |

En Vercel, añade las mismas variables en **Settings → Environment Variables**
(las `NEXT_PUBLIC_*` se incrustan al compilar: redeploy tras cambiarlas).

## Arquitectura

```
app/
├── layout.tsx            # Layout raíz PERSISTENTE: WorldMount (Canvas), Hud, BookingDrawer, LocaleSync
├── [locale]/page.tsx     # Portada SSG (/es, /en): secciones con data-world-section
├── [locale]/about/       # Trayectoria, credenciales, contacto
├── api/chat/             # Streaming con rate limit + validación Zod
├── actions/contact.ts    # Server Action del formulario (rate limit por IP)
├── sitemap.ts · robots.ts
middleware.ts             # "/" y rutas sin idioma → /es | /en según Accept-Language (fallback EN)
components/
├── world/                # world-mount, world-canvas, camera-rig, effects, static-backdrop
│   └── scenes/           # hero-entity, service-forms, project-portals, journey-ribbon, network, contact-gate
├── sections/             # HTML del recorrido: hero, servicios, proyectos (+ trayectoria, chat, contacto)
├── hud/                  # hud, language-switch, sound-toggle
├── booking/              # drawer (<dialog>) y botón de agenda
lib/
├── i18n/                 # config (locales, redirecciones), diccionarios es/en, Localized<T>
├── world/                # scroll-store, camera-path, quality (niveles), tier-store, textures, geometry, shaders/
├── audio/engine.ts       # motor Web Audio
├── security/rate-limit.ts
├── validations/          # chat y contacto (Zod)
├── data/                 # proyectos, servicios, experiencia, skills (campos bilingües)
└── ai/                   # system prompt por idioma, config del modelo
```

### Mundo continuo

- **Un solo `<Canvas>`** en el layout raíz: no se remonta al navegar ni al
  cambiar de idioma (el cambio ES/EN es navegación blanda con `scroll={false}`).
- Lenis publica progreso y velocidad en `lib/world/scroll-store.ts`; cada sección
  HTML declara `data-world-section` y su rango se recalcula con `ResizeObserver`.
  La cámara recorre una curva Catmull-Rom (`camera-path.ts`) y alcanza el
  keyframe de cada escena cuando su sección está centrada.
- La escena **no contiene texto**: el `<canvas>` es `aria-hidden` y sin eventos de
  puntero; teclado, lectores de pantalla y SEO trabajan sobre el HTML.

### Rendimiento adaptativo

| Nivel | DPR | Partículas | Post-procesado | Texturas |
| --- | --- | --- | --- | --- |
| `high` | 1–2 | 24 000 | bloom + grano + viñeta | 1024×512, aniso ≤8 |
| `medium` | 1–1.5 | 12 000 | bloom ligero + grano | 1024×512, aniso ≤4 |
| `low` | 1 | 5 000 | ninguno | 512×256, aniso 1 |
| `static` | — | sin Canvas | — | capturas HTML |

- Nivel inicial por capacidades (`detectInitialTier`); `prefers-reduced-motion`,
  `Save-Data` o falta de WebGL → `static`. `PerformanceMonitor` sube o baja un
  nivel según los FPS reales (banda 45–57 a 60 Hz) y siempre puede recuperarse.
- Una geometría por efecto: la red del asistente es **una** `LineSegments` con
  pulsos GLSL; los nodos de la trayectoria, **un** `InstancedMesh`.
- Portales: texturas webp en potencia de 2 (563 KB las 18, frente a 9,3 MB de
  PNG), decodificadas con `createImageBitmap` y subidas a GPU **una por frame**;
  se liberan con `dispose()` al cambiar de nivel o al desmontar.
- Bucle pausado con la pestaña oculta; `webglcontextlost` → fondo estático.
- Depuración: `?debug` expone `window.__IAZR_WORLD__` (nivel, FPS, draw calls,
  texturas); `?tier=high|medium|low|static` fuerza un nivel.

### Sonido

Paisaje generativo (acordes por escena, filtro ligado a la velocidad de scroll,
reverb sintética, clics). **Opt-in estricto**: no se crea ningún `AudioContext`
hasta pulsar el botón del HUD; se suspende con la pestaña oculta.

### Seguridad

- `/api/chat`: rate limit **20 solicitudes / 10 min por IP**; máx. 20 mensajes,
  2 000 caracteres por mensaje y 12 000 en total; solo roles `user`/`assistant` y
  partes de texto, con caracteres de control eliminados. Sin llamada previa a Groq.
- Formulario: **3 envíos / 10 min por IP** + honeypot.
- El almacén del rate limit vive en memoria **por instancia** (mejor esfuerzo en
  serverless). `RateLimitStore` permite enchufar Upstash Redis sin tocar consumidores.

### Decisiones y límites conocidos

- **Sin modo claro**: el bloom y el blending aditivo necesitan fondo oscuro.
- **React Compiler desactivado** a propósito (las mutaciones en `useFrame` de R3F).
- Sin Partial Prerendering: las páginas son SSG puras.
- `<html lang>` se sincroniza en cliente (el layout raíz no ve el segmento
  `[locale]`); `hreflang`, metadatos y contenido por ruta cubren el SEO.
- `scripts/adversarial.mjs` fija `locale: "es"`; la frase anti-jailbreak tiene
  versión EN en el prompt inglés.

## Proyectos en producción

| Proyecto | URL |
| --- | --- |
| La Campana | https://lacampana.co/ |
| Emssanar EPS | https://emssanareps.co/ |
| Paisajes Sonoros | https://paisajes-sonoros.vercel.app/ |
| Dozurcol Pasto | https://dozurcol-pasto.vercel.app/ |
| Portafolio Sandra Gómez | https://portafolio-sandra-sst.vercel.app/ |
| Panini 2026 | https://panini26.vercel.app/ |
| Método Sonora | https://metodo-sonora.vercel.app/ |
| Zolaris | https://zolarisweb.vercel.app/ |
| SST MedSys | https://sst-med-sys.vercel.app/dashboard |

Perfil de GitHub: https://github.com/andreszuniga96
