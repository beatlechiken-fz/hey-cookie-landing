// src/modules/admin/store/domain/usecases/IncluyeProducto.usecase.ts

import type { ProductoOpciones } from "../entities/Producto.entity";
import type { PastelConfigCatalogo } from "../entities/PastelPersonalizado.entity";

export type TipoIncluido = "cobertura" | "relleno" | "jarabe" | "licor" | "topping" | "ornamento";

export interface ItemIncluido {
  /** Único por tipo + id, para comparar contra las opciones por defecto. */
  key: string;
  tipo: TipoIncluido;
  nombre: string;
}

export type EstadoIncluido = "incluido" | "agregado" | "quitado";

export interface ItemIncluidoDiff extends ItemIncluido {
  estado: EstadoIncluido;
}

/**
 * Lo que lleva un producto con ciertas opciones, en lenguaje de cliente
 * (coberturas, rellenos, jarabe, licor, toppings, ornamentos). Los empaques
 * se omiten: no son parte del producto en sí. Se usa para los chips
 * "Incluye" del catálogo y del modal, para que lo que se ve coincida con el precio.
 */
export function incluyeProducto(
  opciones: ProductoOpciones,
  catalogo: PastelConfigCatalogo,
): ItemIncluido[] {
  const items: ItemIncluido[] = [];
  const conSabor = (nombre: string, saborId: string | null) => {
    const sabor = saborId ? catalogo.saboresCobertura.find((s) => s.id === saborId)?.nombre : null;
    return sabor ? `${nombre} de ${sabor.toLowerCase()}` : nombre;
  };

  for (const c of opciones.coberturas ?? []) {
    const cob = catalogo.coberturas.find((x) => x.id === c.coberturaId);
    if (cob) items.push({ key: `cobertura:${cob.id}`, tipo: "cobertura", nombre: conSabor(cob.nombre, c.saborCoberturaId) });
  }
  for (const r of opciones.rellenos ?? []) {
    const rel = catalogo.coberturas.find((x) => x.id === r.rellenoId);
    if (rel) items.push({ key: `relleno:${rel.id}`, tipo: "relleno", nombre: `Relleno: ${conSabor(rel.nombre, r.saborRellenoId)}` });
  }
  if (opciones.jarabeId) {
    const jar = catalogo.jarabes.find((x) => x.id === opciones.jarabeId);
    const sabor = opciones.saborJarabeId
      ? catalogo.saboresJarabe.find((s) => s.id === opciones.saborJarabeId)?.nombre
      : null;
    if (jar) items.push({ key: `jarabe:${jar.id}`, tipo: "jarabe", nombre: sabor ? `${jar.nombre} de ${sabor.toLowerCase()}` : jar.nombre });
  }
  if (opciones.licorId) {
    const lic = catalogo.licores.find((x) => x.ingredienteId === opciones.licorId);
    if (lic) items.push({ key: `licor:${lic.ingredienteId}`, tipo: "licor", nombre: lic.nombre });
  }
  for (const t of opciones.toppings ?? []) {
    const top = catalogo.toppings.find((x) => x.ingredienteId === t.ingredienteId);
    if (top) items.push({ key: `topping:${top.ingredienteId}`, tipo: "topping", nombre: top.nombre });
  }
  for (const o of opciones.ornamentos ?? []) {
    const orn = catalogo.ornamentos.find((x) => x.id === o.ornamentoId);
    if (orn) {
      items.push({
        key: `ornamento:${orn.id}`,
        tipo: "ornamento",
        nombre: o.cantidad > 1 ? `${orn.nombre} ×${o.cantidad}` : orn.nombre,
      });
    }
  }
  return items;
}

/**
 * Compara lo que lleva ahora contra lo que traía por defecto: lo que sigue
 * incluido, lo que el cliente agregó y lo que quitó (para mostrarlo tachado
 * y que no piense que todavía lo lleva).
 */
export function incluyeProductoDiff(
  actuales: ProductoOpciones,
  defaults: ProductoOpciones,
  catalogo: PastelConfigCatalogo,
): ItemIncluidoDiff[] {
  const ahora = incluyeProducto(actuales, catalogo);
  const antes = incluyeProducto(defaults, catalogo);
  const keysAntes = new Set(antes.map((i) => i.key));
  const keysAhora = new Set(ahora.map((i) => i.key));
  return [
    ...ahora.map((i) => ({ ...i, estado: (keysAntes.has(i.key) ? "incluido" : "agregado") as EstadoIncluido })),
    ...antes.filter((i) => !keysAhora.has(i.key)).map((i) => ({ ...i, estado: "quitado" as const })),
  ];
}
