// src/modules/admin/store/domain/usecases/ProductoDesdePersonalizado.usecase.ts

/**
 * Convierte la configuración de un pastel / gelatina personalizada en un
 * CreateProductoDTO, para guardarla como producto predeterminado del catálogo
 * y seguir afinándolo en el ProductoEditorModal.
 *
 * Son funciones puras: la receta (ingredientes del bizcocho / de cada base de
 * gelatina) se obtiene antes y se pasa como argumento.
 */

import {
  DIAMETRO_BASE_CM,
  type PastelConfiguracion,
  type PastelConfigCatalogo,
} from "../entities/PastelPersonalizado.entity";
import {
  FACTOR_GELATINA_POR_LITRO,
  type GelatinaCotizadorConfig,
} from "../entities/GelatinaCotizador.entity";
import type {
  CreateProductoDTO,
  IngredienteBaseItem,
  ProductoOpciones,
} from "../entities/Producto.entity";

/** Línea de receta tal como la devuelven bizcochos / gelatinas de raws. */
export interface RecetaLinea {
  ingredienteId: string;
  ingredienteNombre: string;
  ingredienteUnidad: string;
  cantidad: number;
  /** cantidad × costo_unidad_minima */
  costoCalculado: number | null;
}

/**
 * Suma las recetas (cada una multiplicada por su factor) en una sola lista de
 * ingredientes base, combinando el mismo ingrediente.
 */
function sumarRecetas(
  recetas: { lineas: RecetaLinea[]; factor: number }[],
): IngredienteBaseItem[] {
  const map = new Map<string, IngredienteBaseItem>();
  for (const { lineas, factor } of recetas) {
    if (factor <= 0) continue;
    for (const l of lineas) {
      const cantidad = l.cantidad * factor;
      const prev = map.get(l.ingredienteId);
      if (prev) {
        prev.cantidad += cantidad;
        continue;
      }
      map.set(l.ingredienteId, {
        ingredienteId: l.ingredienteId,
        nombre: l.ingredienteNombre,
        cantidad,
        unidad: l.ingredienteUnidad as IngredienteBaseItem["unidad"],
        costoUnidadMinima:
          l.cantidad > 0 && l.costoCalculado != null
            ? l.costoCalculado / l.cantidad
            : 0,
      });
    }
  }
  return [...map.values()].map((i) => ({
    ...i,
    cantidad: Math.round(i.cantidad * 100) / 100,
  }));
}

/**
 * Pastel personalizado → producto con medida personalizable a 24cm (la base de
 * todas las recetas), así el diámetro se sigue eligiendo al cotizar.
 */
export function productoDesdePastel(
  config: PastelConfiguracion,
  bizcocho: { nombre: string; ingredientes: RecetaLinea[] } | null,
): CreateProductoDTO {
  const opciones: ProductoOpciones = {
    coberturas: config.coberturas.filter((c) => c.coberturaId),
    rellenos: config.rellenos.filter((r) => r.rellenoId),
    toppings: config.toppings,
    jarabeId: config.jarabeId,
    saborJarabeId: config.saborJarabeId,
    humedadJarabe: config.humedadJarabe,
    licorId: config.licorId,
    empaqueIds: config.empaqueIds,
    ornamentos: config.ornamentos ?? [],
  };
  return {
    nombre: bizcocho ? `Pastel ${bizcocho.nombre}` : "Pastel personalizado",
    linea: "sweet",
    categoria: "pastel",
    ingredientesBase: bizcocho
      ? sumarRecetas([{ lineas: bizcocho.ingredientes, factor: 1 }])
      : [],
    opcionesDefault: opciones,
    medidaBaseCm: DIAMETRO_BASE_CM,
    permiteMedidaPersonalizada: true,
    activo: true,
  };
}

/**
 * Gelatina personalizada → producto de tamaño único: la receta base son las
 * bases de gelatina × litros, y las opciones escalan con el mismo factor que
 * usa el cotizador (litros × FACTOR_GELATINA_POR_LITRO).
 * Transfer y blonda se vuelven un topping con cantidad fija y un empaque.
 */
export function productoDesdeGelatina(
  config: GelatinaCotizadorConfig,
  bases: { lineas: RecetaLinea[]; litros: number }[],
  catalogo: PastelConfigCatalogo,
  nombre: string,
): CreateProductoDTO {
  const totalLitros = bases.reduce((s, b) => s + b.litros, 0);

  const toppings = [...config.toppings];
  const transfer = catalogo.toppings.find((t) =>
    t.nombre?.toLowerCase().includes("transfer"),
  );
  if (
    config.conTransfer &&
    transfer &&
    !toppings.some((t) => t.ingredienteId === transfer.ingredienteId)
  ) {
    // Cantidad explícita = no escala con factorOpciones (igual que en el cotizador).
    toppings.push({
      ingredienteId: transfer.ingredienteId,
      cantidad: transfer.cantidad ?? 0,
    });
  }

  const empaqueIds = [...config.empaqueIds];
  const blonda = catalogo.empaques.find((e) =>
    e.nombre?.toLowerCase().includes("blonda"),
  );
  if (config.conBlonda && blonda && !empaqueIds.includes(blonda.id)) {
    empaqueIds.push(blonda.id);
  }

  return {
    nombre,
    linea: config.categoria === "clasica" ? "sweet" : "healthy",
    categoria: "gelatina",
    ingredientesBase: sumarRecetas(
      bases.map((b) => ({ lineas: b.lineas, factor: b.litros })),
    ),
    opcionesDefault: {
      coberturas: config.coberturas.filter((c) => c.coberturaId),
      rellenos: config.rellenos.filter((r) => r.rellenoId),
      toppings,
      jarabeId: config.jarabeId,
      saborJarabeId: config.saborJarabeId,
      humedadJarabe: null,
      licorId: config.licorId,
      empaqueIds,
      ornamentos: config.ornamentos ?? [],
    },
    medidaBaseCm: null,
    permiteMedidaPersonalizada: false,
    factorOpciones: totalLitros * FACTOR_GELATINA_POR_LITRO,
    activo: true,
  };
}
