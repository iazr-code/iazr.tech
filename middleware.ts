import { NextResponse, type NextRequest } from "next/server";

import { resolveLocaleRedirect } from "@/lib/i18n/config";

/**
 * Prefijo de idioma: "/" → "/es" | "/en" según Accept-Language (fallback EN);
 * rutas antiguas sin prefijo ("/about") se redirigen conservando la ruta.
 */
export function middleware(request: NextRequest) {
  const target = resolveLocaleRedirect(request.nextUrl.pathname, request.headers.get("accept-language"));
  if (!target) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Excluye API, assets de Next, texturas, capturas y cualquier archivo con extensión.
  matcher: ["/((?!api|_next|textures|proyectos|.*\\..*).*)"],
};
