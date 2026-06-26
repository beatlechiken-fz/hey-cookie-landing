// src/modules/admin/store/domain/usecases/calcularCostoDesglose.ts
//
// Lógica COMPARTIDA de cálculo de costos entre:
//  - Pastel personalizado (bizcocho seleccionable)
//  - Productos del catálogo (receta base fija + opciones configurables)
//
// Ambos casos terminan con la misma estructura: una "línea base estructural"
// (equivalente al bizcocho, escalable por factor de volumen) + las opciones
// de cobertura/relleno/jarabe/toppings/licor/empaque, y los mismos 3 cargos
// adicionales sobre las bases resultantes.

import type {
  PastelConfigCatalogo,
  PastelCostoDesglose,
  CostoLineaItem,
  CargoAdicional,
} from "../entities/PastelPersonalizado.entity";
import type { ProductoOpciones } from "../entities/Producto.entity";
import type { PastelConfiguracion } from "../entities/PastelPersonalizado.entity";

export const NINGUNO = "ninguno";

export function find<T extends { id: string }>(
  arr: T[],
  id: string | null | undefined,
): T | undefined {
  if (!id || id === NINGUNO) return undefined;
  return arr.find((x) => x.id === id);
}

/** Línea base estructural ya resuelta a costo (escalable por factor) — el "bizcocho" del cálculo */
export interface BaseEstructuralItem {
  concepto: string;
  costoBase: number; // costo a la medida base (24cm, 22cm, o medida del producto)
  detalle?: string;
}

/**
 * Calcula el desglose de costos dado:
 * - una o más líneas "estructurales" base (bizcocho del pastel personalizado,
 *   o ingredientes_base de un producto) que escalan por factor
 * - las opciones (cobertura, relleno, jarabe, toppings, licor, empaque)
 * - el factor de volumen aplicable (1 si no hay medida personalizada)
 *
 * Reglas de escalado (igual para ambos casos):
 * - Líneas estructurales, Cobertura, Relleno, Jarabe → escalan por factor
 * - Toppings y Licor → escalan por factor
 * - Sabores (cobertura/jarabe) y Empaques → precio FIJO, no escalan
 *
 * Cargos adicionales (sobre baseEstructura = estructural + cobertura + relleno + sabores):
 *   1. 10% de baseEstructura
 *   2. max($60, 25% de baseEstructura)
 *   3. 90% de (baseEstructura + jarabe + sabor jarabe)
 */
export function calcularCostoDesglose(
  baseEstructuralItems: BaseEstructuralItem[],
  opciones: ProductoOpciones | PastelConfiguracion,
  catalogo: PastelConfigCatalogo,
  factor: number,
  detalleFactor: string,
  factorBase?: number,
  manoDeObraMinimo: number = 60, // default $60 para pasteles estándar
): PastelCostoDesglose {
  const items: CostoLineaItem[] = [];
  const fBase = factorBase !== undefined ? factorBase : factor;

  let baseEstructura = 0;
  let baseJarabe = 0;

  const addEscaladoBase = (
    concepto: string,
    costoBase: number,
    detalle?: string,
  ) => {
    const costoFinal = costoBase * fBase;
    items.push({
      concepto,
      detalle,
      costoBase,
      factorAplicado: fBase,
      costoFinal,
    });
    return costoFinal;
  };
  const addEscalado = (
    concepto: string,
    costoBase: number,
    detalle?: string,
  ) => {
    const costoFinal = costoBase * factor;
    items.push({
      concepto,
      detalle,
      costoBase,
      factorAplicado: factor,
      costoFinal,
    });
    return costoFinal;
  };
  const addFijo = (concepto: string, costoBase: number, detalle?: string) => {
    items.push({
      concepto,
      detalle,
      costoBase,
      factorAplicado: 1,
      costoFinal: costoBase,
    });
    return costoBase;
  };

  // Líneas estructurales base (bizcocho o ingredientes_base del producto) — escalan con fBase
  for (const base of baseEstructuralItems) {
    baseEstructura += addEscaladoBase(
      base.concepto,
      base.costoBase,
      base.detalle ?? detalleFactor,
    );
  }

  // Cobertura
  const cobertura = find(catalogo.coberturas, opciones.coberturaId);
  if (cobertura)
    baseEstructura += addEscalado(
      `Cobertura: ${cobertura.nombre}`,
      cobertura.costoTotal,
      detalleFactor,
    );

  // Sabor de cobertura (precio fijo)
  const saborCob = catalogo.saboresCobertura.find(
    (s) => s.id === opciones.saborCoberturaId,
  );
  if (saborCob && saborCob.precio != null)
    baseEstructura += addFijo(
      `Sabor cobertura: ${saborCob.nombre}`,
      saborCob.precio,
    );

  // Relleno (otra cobertura)
  const relleno = find(catalogo.coberturas, opciones.rellenoId);
  if (relleno)
    baseEstructura += addEscalado(
      `Relleno: ${relleno.nombre}`,
      relleno.costoTotal,
      detalleFactor,
    );

  // Sabor de relleno (precio fijo)
  const saborRelleno = catalogo.saboresCobertura.find(
    (s) => s.id === opciones.saborRellenoId,
  );
  if (saborRelleno && saborRelleno.precio != null)
    baseEstructura += addFijo(
      `Sabor relleno: ${saborRelleno.nombre}`,
      saborRelleno.precio,
    );

  // Jarabe
  const jarabe = find(catalogo.jarabes, opciones.jarabeId);
  if (jarabe)
    baseJarabe += addEscalado(
      `Jarabe: ${jarabe.nombre}`,
      jarabe.costoTotal,
      detalleFactor,
    );

  // Sabor de jarabe (precio fijo)
  const saborJar = catalogo.saboresJarabe.find(
    (s) => s.id === opciones.saborJarabeId,
  );
  if (saborJar && saborJar.precio != null)
    baseJarabe += addFijo(`Sabor jarabe: ${saborJar.nombre}`, saborJar.precio);

  // Toppings (múltiples, escalan)
  for (const toppingId of opciones.toppingIds) {
    if (toppingId === NINGUNO) continue;
    const t = catalogo.toppings.find((x) => x.ingredienteId === toppingId);
    if (!t || t.cantidad == null || t.costoUnidadMinima == null) continue;
    const costoBase = t.cantidad * t.costoUnidadMinima;
    addEscalado(
      `Topping: ${t.nombre}`,
      costoBase,
      `${t.cantidad}${t.unidad} a base · ${detalleFactor}`,
    );
  }

  // Licor (escalado)
  const licor = catalogo.licores.find(
    (x) => x.ingredienteId === opciones.licorId,
  );
  if (licor && licor.cantidad != null && licor.costoUnidadMinima != null) {
    const costoBase = licor.cantidad * licor.costoUnidadMinima;
    addEscalado(
      `Licor: ${licor.nombre}`,
      costoBase,
      `${licor.cantidad}ml a base · ${detalleFactor}`,
    );
  }

  // Empaques (múltiples, precio fijo)
  for (const empaqueId of opciones.empaqueIds) {
    if (empaqueId === NINGUNO) continue;
    const emp = catalogo.empaques.find((x) => x.id === empaqueId);
    if (!emp) continue;
    addFijo(`Empaque: ${emp.nombre}`, emp.precio);
  }

  const costoInsumos = items.reduce((sum, i) => sum + i.costoFinal, 0);

  // ── Cargos adicionales ─────────────────────────────────────────────────────

  const baseConJarabe = baseEstructura + baseJarabe;
  const cargosAdicionales: CargoAdicional[] = [];

  const cargo1Monto = baseEstructura * 0.1;
  cargosAdicionales.push({
    concepto: "Armado y decoración base (10%)",
    base: baseEstructura,
    porcentaje: 10,
    monto: cargo1Monto,
  });

  const cargo2Pct = baseEstructura * 0.25;
  const cargo2Monto = Math.max(manoDeObraMinimo, cargo2Pct);
  cargosAdicionales.push({
    concepto:
      cargo2Pct > manoDeObraMinimo
        ? "Mano de obra (25% sobre estructura)"
        : `Mano de obra (mínimo $${manoDeObraMinimo})`,
    base: baseEstructura,
    porcentaje: cargo2Pct > manoDeObraMinimo ? 25 : 0,
    monto: cargo2Monto,
  });

  const cargo3Monto = baseConJarabe * 0.9;
  cargosAdicionales.push({
    concepto: "Proceso completo, incl. jarabe (90%)",
    base: baseConJarabe,
    porcentaje: 90,
    monto: cargo3Monto,
  });

  const totalCargos = cargosAdicionales.reduce((sum, c) => sum + c.monto, 0);
  const costoProduccionTotal = costoInsumos + totalCargos;
  const precioSugerido = costoProduccionTotal;

  return {
    factorVolumen: factor,
    items,
    costoInsumos,
    cargosAdicionales,
    costoProduccionTotal,
    precioSugerido,
  };
}
