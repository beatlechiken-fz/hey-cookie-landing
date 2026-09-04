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
    factorExtra: number = 1,
  ) => {
    const factorAplicado = factor * factorExtra;
    const costoFinal = costoBase * factorAplicado;
    items.push({
      concepto,
      detalle,
      costoBase,
      factorAplicado,
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

  // Coberturas (múltiples, todas escalan y suman al precio; cada una puede
  // llevar su propio factor extra encima del factor de volumen por diámetro)
  for (const sel of opciones.coberturas ?? []) {
    const cobertura = find(catalogo.coberturas, sel.coberturaId);
    const factorCob = sel.factor ?? 1;
    if (cobertura)
      baseEstructura += addEscalado(
        `Cobertura: ${cobertura.nombre}`,
        cobertura.costoTotal,
        factorCob !== 1 ? `${detalleFactor} · ×${factorCob}` : detalleFactor,
        factorCob,
      );

    const saborCob = catalogo.saboresCobertura.find(
      (s) => s.id === sel.saborCoberturaId,
    );
    if (saborCob && saborCob.precio != null)
      baseEstructura += addFijo(
        `Sabor cobertura: ${saborCob.nombre}`,
        saborCob.precio,
      );
  }

  // Rellenos (múltiples, otra cobertura cada uno; mismo factor extra por ítem)
  for (const sel of opciones.rellenos ?? []) {
    const relleno = find(catalogo.coberturas, sel.rellenoId);
    const factorRel = sel.factor ?? 1;
    if (relleno)
      baseEstructura += addEscalado(
        `Relleno: ${relleno.nombre}`,
        relleno.costoTotal,
        factorRel !== 1 ? `${detalleFactor} · ×${factorRel}` : detalleFactor,
        factorRel,
      );

    const saborRelleno = catalogo.saboresCobertura.find(
      (s) => s.id === sel.saborRellenoId,
    );
    if (saborRelleno && saborRelleno.precio != null)
      baseEstructura += addFijo(
        `Sabor relleno: ${saborRelleno.nombre}`,
        saborRelleno.precio,
      );
  }

  // Jarabe — si humedadJarabe === "humedo", el costo base del jarabe se multiplica ×2.2
  const jarabe = find(catalogo.jarabes, opciones.jarabeId);
  if (jarabe) {
    const esHumedo = opciones.humedadJarabe === "humedo";
    const costoJarabe = esHumedo ? jarabe.costoTotal * 2.2 : jarabe.costoTotal;
    const labelJarabe = esHumedo
      ? `Jarabe: ${jarabe.nombre} (húmedo ×2.2)`
      : `Jarabe: ${jarabe.nombre}`;
    baseJarabe += addEscalado(labelJarabe, costoJarabe, detalleFactor);
  }

  // Sabor de jarabe (precio fijo, no se ve afectado por la humedad)
  const saborJar = catalogo.saboresJarabe.find(
    (s) => s.id === opciones.saborJarabeId,
  );
  if (saborJar && saborJar.precio != null)
    baseJarabe += addFijo(`Sabor jarabe: ${saborJar.nombre}`, saborJar.precio);

  // Toppings (múltiples). Por default escalan con el diámetro igual que
  // siempre (cantidad del catálogo × factor de volumen). Si esta orden trae
  // un override manual de gramaje (sel.cantidad), ese valor es la cantidad
  // FINAL para esta orden — ya no se vuelve a escalar por diámetro.
  for (const sel of opciones.toppings ?? []) {
    if (sel.ingredienteId === NINGUNO) continue;
    const t = catalogo.toppings.find((x) => x.ingredienteId === sel.ingredienteId);
    if (!t || t.costoUnidadMinima == null) continue;
    if (sel.cantidad != null) {
      addFijo(
        `Topping: ${t.nombre} (${sel.cantidad}${t.unidad}, ajustado)`,
        sel.cantidad * t.costoUnidadMinima,
      );
    } else if (t.cantidad != null) {
      const costoBase = t.cantidad * t.costoUnidadMinima;
      addEscalado(
        `Topping: ${t.nombre}`,
        costoBase,
        `${t.cantidad}${t.unidad} a base · ${detalleFactor}`,
      );
    }
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

  // Ornamentos (múltiples, precio fijo × cantidad de piezas)
  for (const sel of opciones.ornamentos ?? []) {
    if (sel.ornamentoId === NINGUNO) continue;
    const orn = catalogo.ornamentos?.find((x) => x.id === sel.ornamentoId);
    if (!orn) continue;
    const cantidad = sel.cantidad ?? 1;
    addFijo(`Ornamento: ${orn.nombre} ×${cantidad}`, orn.precio * cantidad);
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
