# Portafolio IAZR — "Mundo continuo" inmersivo (diseño)

Fecha: 2026-11-13 · Rama: `feat/immersive-world` · Estado: pendiente de aprobación

## 1. Intención y por qué

El portafolio debe ser **la prueba de calidad** de IAZR: quien lo abra debe sentir
asombro inmediato, autoridad técnica y confianza, y terminar **agendando una
consultoría** o escribiendo. Hoy el 3D es un globo decorativo aislado y el resto
es una página oscura tipo plantilla; el sitio está pensado para Colombia y solo
en español.

Público objetivo: startups tecnológicas, pymes corporativas y clientes
internacionales (EE.UU. / LATAM) que buscan desarrollo web de alto rendimiento,
arquitecturas modernas (React/Next.js/Supabase) y un toque visual diferencial.
Servicios a vender: desarrollo web, automatización y ecosistemas digitales
(+ dirección tecnológica, IA aplicada, mentoría que ya existen).

Acción de conversión principal, en orden: (1) recorrer los proyectos,
(2) probar el chat con IA, (3) entender los servicios B2B, (4) agendar o contactar.

## 2. Objetivos, no-objetivos, anti-objetivos

**Objetivos**
- Un único `<Canvas>` WebGL fijo, guiado por el scroll (Lenis), con el contenido
  real en HTML superpuesto.
- Todo procedural (GLSL, geometría, Web Audio): cero recursos con licencia.
- 60 FPS estables en equipos medios mediante rendimiento adaptativo en 3 niveles
  más un modo sin WebGL.
- Sitio bilingüe ES/EN; cambiar de idioma no recarga ni reinicia el contexto WebGL.
- Agendar consultoría desde un drawer sin salir de la experiencia.
- Backend endurecido (chat y formulario) y repositorio limpio.
- Conservar y elevar el contenido: 9 proyectos reales, 4 servicios, trayectoria,
  chat, formulario, telemetría PostHog.

**No-objetivos**
- Mundo explorable libre (WASD / arrastrar): descartado, va contra la conversión.
- Videos o modelos 3D externos; audio grabado.
- Activar React Compiler (puede interferir con las mutaciones de `useFrame`).
- Migrar a Next 16 o cambiar de proveedor de IA.

**Anti-objetivos (fracaso aunque "funcione")**
- Que el efecto estorbe: texto ilegible, scroll secuestrado, contenido inalcanzable
  con teclado o lector de pantalla.
- Sonido que se reproduzca sin que el visitante lo pida.
- Pasar de ~60 FPS a tirones en un portátil medio, o una carga inicial pesada.
- Perder SEO: el contenido real debe existir en HTML renderizado por servidor.

## 3. Restricciones

- Next.js 15.5 (App Router), React 19, Tailwind v4, desplegado en Vercel.
  `main` no se toca hasta que el dueño lo decida; no se hace push sin pedirlo.
- Dependencias existentes: three, @react-three/fiber, drei, gsap, lenis,
  framer-motion. Nuevas previstas: `@react-three/postprocessing` (+ `postprocessing`),
  `eslint` + `eslint-config-next` y `vitest` (dev).
- Variables de entorno actuales (GROQ, RESEND, POSTHOG) se mantienen; se agrega
  `NEXT_PUBLIC_BOOKING_URL`.
- Hay que respetar `prefers-reduced-motion`, `Save-Data` y la accesibilidad (WCAG 2.2).

## 4. Enfoques considerados

| | Enfoque | Resultado |
|---|---|---|
| A | Islas 3D dentro de la página actual | Rápido y seguro, pero sigue pareciendo plantilla con adornos. Descartado. |
| **B** | **Mundo continuo: un Canvas fijo + cámara guiada por scroll + HTML encima** | **Elegido por el dueño.** Único que convierte la web en prueba de nivel sin sacrificar conversión. |
| C | Mundo explorable libre | Máximo impacto pero frágil en móvil y poco accesible. Descartado. |

## 5. Diseño

### 5.1 Arquitectura de la página

```
app/layout.tsx                ← persistente (no se remonta al cambiar de idioma)
  ├─ <WorldCanvas/>           ← único <Canvas>, position:fixed, aria-hidden, dynamic ssr:false
  ├─ <Hud/>                   ← navbar: idioma, sonido, tema, agendar
  ├─ <BookingDrawer/>         ← drawer con iframe de NEXT_PUBLIC_BOOKING_URL
  └─ {children}
app/[locale]/page.tsx         ← es | en, renderizado por servidor, HTML superpuesto
app/[locale]/about/page.tsx
middleware.ts                 ← "/" → /es o /en según Accept-Language (fallback: en)
```

- Cambiar de idioma es navegación blanda (`Link`, `scroll={false}`) entre
  `/es` y `/en`. El layout raíz —y por tanto el Canvas— no se remonta. Cada
  idioma tiene su HTML en servidor, `hreflang` y metadatos propios.
- La escena 3D **no contiene texto**: las etiquetas viven en el HTML, así la
  escena es independiente del idioma.
- `<html lang>` se sincroniza en cliente con el idioma activo (limitación
  conocida: el HTML inicial puede declarar el idioma por defecto; `hreflang` y el
  contenido de cada ruta cubren el SEO).

### 5.2 Escenas (progreso de scroll → cámara)

Una curva de cámara (CatmullRom) se recorre con el progreso global de scroll.
Cada sección HTML tiene su rango; la escena recibe progreso global y local.

| # | Sección | Escena |
|---|---|---|
| 0 | Hero | Entidad de partículas con shader (ruido curl, reacciona al puntero) |
| 1 | Capacidades / Servicios | 4 objetos (uno por servicio) sobre la ruta de la cámara |
| 2 | Proyectos | 9 "portales": planos con la captura real como textura, distorsión por shader al hover; clic abre detalle HTML con enlace al sitio |
| 3 | Trayectoria | Cinta/línea con nodos instanciados |
| 4 | Chat IA | Escena calmada; terminal en HTML |
| 5 | Contacto | Las partículas convergen; formulario + botón de agendar |

El estado de scroll vive en una referencia de módulo (no en estado de React):
`useFrame` lo lee sin provocar renders.

### 5.3 Rendimiento adaptativo

- **Niveles:** `high` (DPR hasta 2, post-procesado completo, más partículas),
  `medium` (DPR ≤1.5, bloom ligero), `low` (DPR 1, sin post-procesado, pocas
  partículas), `static` (sin Canvas: fondo CSS y el mismo contenido).
- **Nivel inicial:** detección de WebGL, `hardwareConcurrency`, `deviceMemory`,
  puntero grueso (móvil), `Save-Data`. `prefers-reduced-motion` → `static`.
- **Ajuste en vivo:** `PerformanceMonitor` de drei baja un nivel si los FPS
  caen y puede subirlo si se estabilizan. Presupuesto objetivo: 60 FPS.
- **Draw calls:** los 14 `Line` individuales se reemplazan por una sola
  `BufferGeometry`/`LineSegments` con shader; partículas con `Points` +
  `ShaderMaterial`; elementos repetidos con `InstancedMesh`.
- Se conserva la resiliencia actual: `webglcontextlost`/`restored`, pausa fuera
  de pantalla / pestaña oculta, `ErrorBoundary` que degrada a `static`.
- Texturas de proyectos: ~1024 px de ancho en webp, carga diferida al acercarse
  la cámara.

### 5.4 Post-procesado

Bloom sutil + grano cinematográfico (y viñeta ligera) con
`@react-three/postprocessing`, solo en `high`/`medium`, cargado de forma diferida.

### 5.5 Sonido generativo (opt-in estricto)

- Web Audio API, sin archivos: colchón ambiental (osciladores desafinados →
  filtro → reverb sintética, con LFO lento), cambio de acorde por escena,
  pequeños sonidos de UI en hover/clic, filtro modulado por velocidad de scroll.
- Se crea `AudioContext` **solo tras el clic** en un botón del HUD
  (icono + estado, accesible, con `aria-pressed`). Se recuerda la preferencia
  en `localStorage` pero nunca se reproduce solo. Se pausa con la pestaña oculta.

### 5.6 Internacionalización y copy

- Diccionarios tipados `lib/i18n/{es,en}.ts`; los datos (servicios, proyectos,
  experiencia, habilidades) pasan a campos localizados.
- El chat recibe el idioma (valor validado `es|en`) y responde en ese idioma;
  el `system-prompt` se construye por idioma.
- Reescritura del discurso: de "impacto nacional / GMT-5 Colombia" a **B2B
  global** (EE.UU., LATAM, empresas tecnológicas): entrega remota, husos
  solapados con EE.UU., resultados medibles. Se mantiene la marca IA-ZR y los
  hechos verificados (años, certificaciones, mentorizados).
- JSON-LD, metadatos, `sitemap.xml` y `robots` por idioma.

### 5.7 Agendamiento

- `NEXT_PUBLIC_BOOKING_URL` (Cal.com o Calendly). Drawer accesible (foco
  atrapado, Esc cierra) que carga el iframe al abrirse.
- Fallback seguro si falta la variable o no es una URL `https`: el drawer
  muestra contacto directo (email/WhatsApp existentes) y el formulario.
- CTA de agendar en HUD, hero, servicios y contacto; evento PostHog
  `booking_opened`.

### 5.8 Backend

- **`/api/chat`:** se elimina la llamada previa a Groq que valida el modelo.
  Si el proveedor falla, el `onError` del stream y el modo demo actuales cubren
  el caso. Validación con Zod: `messages` máx. 20; solo roles `user`/`assistant`
  (se rechaza `system`); solo partes de texto; máx. 2 000 caracteres por mensaje
  y 12 000 en total; `locale` ∈ {es,en}; errores 400/413/429 con JSON claro.
- **Rate limit por IP** con TTL (`x-forwarded-for`, primer elemento, normalizado):
  módulo `lib/security/rate-limit.ts` con ventana deslizante en `Map` en memoria
  y limpieza de entradas vencidas. Límites iniciales: chat 20 solicitudes /
  10 min; formulario 3 / 10 min por IP. Sustituye el `lastSubmitAt` global.
  Interfaz pensada para poder enchufar un almacén compartido (p. ej. Upstash)
  más adelante.
- Limitación asumida y documentada: en serverless cada instancia tiene su
  propia memoria, así que el límite es de "mejor esfuerzo", no estricto.

### 5.9 Higiene del repositorio

- `git rm -r --cached .freebuff` (está versionado), borrar la carpeta y añadirla
  a `.gitignore`.
- `IAZR-foto-firma.png`: verificado que ningún archivo la referencia y está
  versionada en la raíz → se elimina.
- Instalar y configurar ESLint (`eslint` + `eslint-config-next`, config plana)
  para que `npm run lint` funcione; corregir lo que reporte o justificarlo.
- README reescrito con la arquitectura real. Se retiran las afirmaciones de PPR
  y React Compiler (el `experimental_ppr` de `page.tsx` se elimina). React
  Compiler queda desactivado a propósito.

## 6. Verificación

- `tsc`, `lint` y `build` limpios.
- Pruebas unitarias (vitest) de: rate limiter (TTL, ventana, IPs distintas),
  validación del payload del chat, validación de `NEXT_PUBLIC_BOOKING_URL`,
  completitud de diccionarios ES/EN.
- Prueba en navegador del flujo real: cambio de idioma sin reinicio del
  contexto (comprobando que el mismo `<canvas>` sigue en el DOM), drawer, botón
  de sonido, modos `reduced-motion` y sin WebGL; medición de frame times con la
  herramienta del navegador integrado.
- Límite de lo verificable: no puedo medir GPUs reales de terceros; los niveles
  se validan con emulación y la degradación en vivo cubre el resto.

## 7. Fases previstas (insumo para el plan)

1. Higiene del repo + ESLint + vitest.
2. Backend: rate limit, validación y limpieza del chat y del formulario.
3. i18n: rutas `[locale]`, middleware, diccionarios, datos localizados, SEO.
4. Núcleo 3D: Canvas persistente, sincronía Lenis, niveles y rendimiento adaptativo.
5. Escenas 0→5 con shaders e instancias, y post-procesado.
6. HUD, sonido generativo y drawer de agenda.
7. Copy B2B, pulido, README y verificación final.

## 8. Decisiones que tomé yo (a revisar)

- Idioma por defecto sin preferencia detectable: **EN**; navegadores en español → ES.
- Cambio de idioma por rutas `/es` `/en` bajo layout persistente (mejor SEO que
  un cambio solo en cliente), con la limitación de `<html lang>` indicada.
- Límites de rate limit y de longitud (números de la sección 5.8).
- `/about` se mantiene como página HTML sobre el Canvas atenuado.
- Texturas de proyectos a ~1024 px; `@react-three/postprocessing` como librería.
- Almacén de rate limit en memoria, con interfaz intercambiable.

## 9. Qué queda para el constructor

Composición exacta de cada escena (formas, paleta, curva de cámara), parámetros
de los shaders, diseño del sonido, copy final en ambos idiomas y detalles visuales
del HUD y del drawer, siempre dentro de las restricciones de arriba.
