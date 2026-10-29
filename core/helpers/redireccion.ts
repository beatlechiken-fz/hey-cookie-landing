// src/core/helpers/redireccion.ts

/**
 * Devuelve `url` solo si es una ruta interna del sitio ("/es/..."); cualquier
 * otra cosa (URL absoluta, "//dominio", vacío) cae en `fallback`. Evita que
 * un ?callbackUrl= manipulado mande al usuario a otro sitio tras el login.
 */
export function rutaInternaSegura(url: string | null | undefined, fallback: string): string {
  if (!url || !url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) return fallback;
  return url;
}

/**
 * Destino después de iniciar sesión o registrarse: si viene del carrito,
 * regresa a la página principal con el carrito abierto (?cart=1); si trae un
 * callbackUrl interno (lo pone el proxy), vuelve ahí; si no, al dashboard.
 */
export function destinoTrasLogin(
  locale: string,
  params: { from?: string | null; callbackUrl?: string | null },
): string {
  if (params.from === "cart") return `/${locale}?cart=1`;
  return rutaInternaSegura(params.callbackUrl, `/${locale}/club/dashboard`);
}
