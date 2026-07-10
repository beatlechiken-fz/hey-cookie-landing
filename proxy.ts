// src/proxy.ts
// Protección de rutas en el Edge — compatible con i18n (/es/, /en/, etc.)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const LOCALES = ["es", "en"];

const PUBLIC_API_PATHS: string[] = [
  "/api/public/",
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

  // /user/login y /user/signin → autenticación pública
  if (clean === "/user/login" || clean === "/user/signin") {
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

  // Rutas de API de usuario → requiere role "user"
  if (clean.startsWith("/api/user/")) {
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

  // /user/* → requiere role "user"
  if (clean.startsWith("/user/")) {
    if (!token || token.role !== "user") {
      const locale = activeLocale(pathname);
      const loginUrl = new URL(`/${locale}/user/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Primera sesión con contraseña temporal → forzar cambio
    if (token.mustChangePassword && clean !== "/user/cambiar-password") {
      const locale = activeLocale(pathname);
      return NextResponse.redirect(
        new URL(`/${locale}/user/cambiar-password`, request.url),
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/:locale(es|en)/admin/:path*",
    "/:locale(es|en)/user/:path*",
    "/:locale(es|en)/api/:path*",
    "/admin/:path*",
    "/user/:path*",
    "/api/:path*",
  ],
};
