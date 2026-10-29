// src/proxy.ts
// Protección de rutas en el Edge — compatible con i18n (/es/, /en/, etc.)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const LOCALES = ["es", "en"];

const PUBLIC_API_PATHS: string[] = [
  "/api/public/",
  "/api/contact",
  // Protegida por su propio CRON_SECRET (ver la ruta), no por sesión NextAuth.
  "/api/cron/",
];

function stripLocale(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

function activeLocale(pathname: string): string {
  return (
    LOCALES.find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
    ) ?? LOCALES[0]
  );
}

function isPublicApi(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clean = stripLocale(pathname);

  // /api/auth/* siempre pasa (NextAuth lo necesita)
  if (clean.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // /admin exacto → login de admin, siempre público
  if (clean === "/admin") {
    return NextResponse.next();
  }

  // /club/login, /club/signin y /club/qr-invalido → autenticación/errores públicos
  if (
    clean === "/club/login" ||
    clean === "/club/signin" ||
    clean === "/club/qr-invalido"
  ) {
    return NextResponse.next();
  }

  // /club/qr/* → resuelve a dónde mandar al cliente (login/signin/dashboard), siempre público
  if (clean.startsWith("/club/qr/")) {
    return NextResponse.next();
  }

  // APIs públicas declaradas
  if (isPublicApi(clean)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Rutas de API de admin → requiere role "admin"
  if (clean.startsWith("/api/admin/")) {
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Rutas de API del club de clientes → requiere role "user"
  if (clean.startsWith("/api/club/")) {
    if (!token || token.role !== "user") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Otras APIs → cualquier token válido
  if (clean.startsWith("/api/")) {
    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // /admin/* → requiere role "admin"
  if (clean.startsWith("/admin/")) {
    if (!token || token.role !== "admin") {
      const locale = activeLocale(pathname);
      const loginUrl = new URL(`/${locale}/admin`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // /club/* → requiere role "user"
  if (clean.startsWith("/club/")) {
    if (!token || token.role !== "user") {
      const locale = activeLocale(pathname);
      const loginUrl = new URL(`/${locale}/club/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Primera sesión con contraseña temporal → forzar cambio
    if (token.mustChangePassword && clean !== "/club/cambiar-password") {
      const locale = activeLocale(pathname);
      return NextResponse.redirect(
        new URL(`/${locale}/club/cambiar-password`, request.url),
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/:locale(es|en)/admin/:path*",
    "/:locale(es|en)/club/:path*",
    "/:locale(es|en)/api/:path*",
    "/admin/:path*",
    "/club/:path*",
    "/api/:path*",
  ],
};
