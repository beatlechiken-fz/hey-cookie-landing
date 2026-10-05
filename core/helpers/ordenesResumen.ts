// core/helpers/ordenesResumen.ts
//
// Helpers puros para mostrar órdenes en listas y calendario.

/**
 * Productos de una orden en una sola línea separada por comas, con la
 * observación de cada uno entre paréntesis cuando existe:
 * "Pastel Red Velvet (sin nueces), Cookie Oreo".
 */
export function resumenProductos(
  items: { nombre: string; observaciones?: string | null }[],
): string {
  return items
    .map((i) => {
      const obs = i.observaciones?.replace(/\s+/g, " ").trim();
      return obs ? `${i.nombre} (${obs})` : i.nombre;
    })
    .join(", ");
}
