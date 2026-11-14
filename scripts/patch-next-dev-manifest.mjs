/**
 * Dev-only fix for a race in Next.js 15.5 (`next dev`).
 *
 * The first time a route with generateStaticParams is requested, the dev server
 * reads `.next/prerender-manifest.json`, mutates it and rewrites it with a plain
 * `writeFile` (truncate + write). A concurrent request (e.g. /es and /en, both
 * served by /[locale]) can read the file while it is empty and crash with
 * `SyntaxError: Unexpected end of JSON input` → HTTP 500.
 *
 * This script makes that write atomic (write a temp file, then rename). It is
 * idempotent, touches only the dev server, and never affects `next build`.
 * Runs on `postinstall`; if Next changes the code, it logs and exits 0.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const MARKER = "iazr patch: atomic prerender-manifest write";
const ORIGINAL =
  "await _fs.default.promises.writeFile((0, _path.join)(this.distDir, _constants1.PRERENDER_MANIFEST), updatedManifest);";
const PATCHED = [
  `// ${MARKER}`,
  "const manifestPath = (0, _path.join)(this.distDir, _constants1.PRERENDER_MANIFEST);",
  "const tmpManifestPath = `${manifestPath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;",
  "await _fs.default.promises.writeFile(tmpManifestPath, updatedManifest);",
  "await _fs.default.promises.rename(tmpManifestPath, manifestPath);",
].join(" ");

let file;
try {
  file = createRequire(import.meta.url).resolve("next/dist/server/dev/next-dev-server.js");
} catch {
  console.log("[patch-next] next is not installed; skipping.");
  process.exit(0);
}

const source = readFileSync(file, "utf8");
if (source.includes(MARKER) || source.includes("iazr patch: atomic write")) {
  console.log("[patch-next] already applied.");
} else if (source.includes(ORIGINAL)) {
  writeFileSync(file, source.replace(ORIGINAL, PATCHED));
  console.log("[patch-next] applied atomic prerender-manifest write.");
} else {
  console.warn("[patch-next] target code not found (Next version changed?); nothing patched.");
}
