/**
 * Imágenes de portada por sección (rediseño 2026-10). Mientras una sección no
 * tenga la suya (null), su portada muestra la foto de uno de sus productos.
 *
 * Para agregar una: subir la imagen a public/img/portadas/<seccion>.webp
 * (cuadrada, producto centrado, idealmente recortado sin fondo) y poner aquí
 * la ruta, p. ej. "/img/portadas/pasteles.webp".
 */
export const PORTADAS = {
  temporada: null,
  galletas: null,
  fitness: null,
  pasteles: null,
  reposteria: null,
  gelatinas: null,
} as const satisfies Record<string, string | null>;

export type SeccionPortada = keyof typeof PORTADAS;

export function portadaDe(seccion: SeccionPortada, respaldo?: string | null): string | null {
  return PORTADAS[seccion] ?? respaldo ?? null;
}
