// src/proxy.ts
// Protección de rutas en el Edge — compatible con i18n (/es/, /en/, etc.)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Locales que maneja tu proyecto
const LOCALES = ["es", "en"]; // agrega los que uses

// APIs públicas (sin sesión)
const PUBLIC_API_PATHS: string[] = [
  // "/api/menu",
];

// Quita el prefijo de locale de un pathname: /es/admin/dashboard → /admin/dashboard
function stripLocale(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clean = stripLocale(pathname); // pathname sin el /es/ o /en/

  // 1. /api/auth/* siempre pasa (NextAuth lo necesita)
  if (clean.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. /admin exacto → login, siempre público
  if (clean === "/admin") {
    return NextResponse.next();
  }

  // 3. APIs públicas declaradas
  if (isPublicApi(clean)) {
    return NextResponse.next();
  }

  // 4. Todo lo demás bajo /admin/* y /api/* → verificar JWT
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 4a. Rutas de API sin sesión → 401
  if (clean.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 4b. /admin/* sin sesión → redirigir al login (conservando el locale)
  if (clean.startsWith("/admin/")) {
    if (!token) {
      // Detectar el locale activo para redirigir a /<locale>/admin
      const locale =
        LOCALES.find(
          (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
        ) ?? LOCALES[0];

      const loginUrl = new URL(`/${locale}/admin`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Con locale
    "/:locale(es|en)/admin/:path*",
    "/:locale(es|en)/api/:path*",
    // Sin locale (por si acaso)
    "/admin/:path*",
    "/api/:path*",
  ],
};
