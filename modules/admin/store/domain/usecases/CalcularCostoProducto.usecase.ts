// src/modules/admin/productos/domain/usecases/calcularCostoProducto.ts

import {
  calcularFactorVolumenRelativo,
  type PastelConfigCatalogo,
  type PastelCostoDesglose,
} from "@/modules/admin/store/domain/entities/PastelPersonalizado.entity";
import {
  calcularCostoDesglose,
  type BaseEstructuralItem,
} from "@/modules/admin/store/domain/usecases/CalcularCostosDesgloce.usecase";
import type {
  Producto,
  ProductoOpciones,
  TamanoFijo,
} from "../entities/Producto.entity";

export interface ProductoConfiguracion {
  opciones: ProductoOpciones;
  diametroCm?: number | null;
  tamanoFijoId?: string | null;
  cantidad: number;
}

/**
 * Calcula el desglose de costos para un producto del catálogo.
 *
 * FACTORES INDEPENDIENTES:
 *
 * factorBase    → escala la RECETA BASE (ingredientes del bizcocho/masa)
 * factorOpciones → escala las OPCIONES del catálogo (cobertura, relleno,
 *                  jarabe, toppings, licor). Estas están calculadas para
 *                  un pastel de 24cm — productos más pequeños necesitan
 *                  su propio factor.
 *
 * Para productos personalizables: ambos factores = (d/medidaBase)²
 * Para tamaños fijos/únicos: factorBase usa factorCosto, factorOpciones
 *   viene de tamanoFijo.factorOpciones → producto.factorOpciones → 1
 *
 * Ejemplos de factorOpciones para productos pequeños:
 *   Tarta sablé 8cm:          (8/24)² = 0.1111
 *   Crème brûlée 8cm:         (8/24)² = 0.1111
 *   Mini pavlova individual:  1/20    = 0.05
 *   Muffin individual:        1/6     ≈ 0.1667
 *   Panna Cotta vaso grande:  1/6     ≈ 0.1667
 *   Panna Cotta vaso chico:   1/10    = 0.1
 */
export function calcularCostoProducto(
  producto: Producto,
  config: ProductoConfiguracion,
  catalogo: PastelConfigCatalogo,
): PastelCostoDesglose {
  let factorBase = 1;
  let factorOpciones = 1;
  let detalleFactor = "Tamaño único";
  let baseItems: BaseEstructuralItem[] = [];

  const tamanoFijo: TamanoFijo | undefined =
    producto.tamanosFijos.length > 0
      ? (producto.tamanosFijos.find((t) => t.id === config.tamanoFijoId) ??
        producto.tamanosFijos[0])
      : undefined;

  if (producto.permiteMedidaPersonalizada && producto.medidaBaseCm) {
    // ── Personalizable: ambos factores proporcionales al diámetro ──────────
    const diametroCm = config.diametroCm ?? producto.medidaBaseCm;
    factorBase = calcularFactorVolumenRelativo(
      diametroCm,
      producto.medidaBaseCm,
    );
    factorOpciones = factorBase; // opciones y receta escalan igual
    detalleFactor = `Factor ${factorBase.toFixed(4)} (${diametroCm}cm / ${producto.medidaBaseCm}cm base)`;

    baseItems = producto.ingredientesBase.map((ing) => ({
      concepto: ing.nombre,
      costoBase: ing.cantidad * ing.costoUnidadMinima,
      detalle: `${ing.cantidad}${ing.unidad} a ${producto.medidaBaseCm}cm`,
    }));
  } else if (tamanoFijo) {
    // ── Tamaño fijo (Panna Cotta vaso grande/chico, etc.) ──────────────────
    factorBase = tamanoFijo.factorCosto; // escala la receta base
    factorOpciones =
      tamanoFijo.factorOpciones ?? // escala las opciones del catálogo
      producto.factorOpciones ??
      1;
    detalleFactor =
      `Tamaño: ${tamanoFijo.nombre}` +
      (factorOpciones !== 1 ? ` · opciones ×${factorOpciones.toFixed(4)}` : "");

    const recetaItems =
      tamanoFijo.ingredientesOverride ?? producto.ingredientesBase;
    // Con ingredientesOverride el factorCosto ya no aplica (receta propia)
    const fc = tamanoFijo.ingredientesOverride ? 1 : 1; // factorBase se aplica en calcularCostoDesglose
    baseItems = recetaItems.map((ing) => ({
      concepto: `${ing.nombre} (${tamanoFijo.nombre})`,
      costoBase:
        ing.cantidad *
        ing.costoUnidadMinima *
        (tamanoFijo.ingredientesOverride ? 1 : 1),
      detalle: detalleFactor,
    }));
  } else {
    // ── Tamaño único sin variantes (muffins, crème brûlée, pavlovas, etc.) ─
    factorBase = 1;
    factorOpciones = producto.factorOpciones ?? 1;
    detalleFactor =
      factorOpciones !== 1
        ? `Opciones escaladas ×${factorOpciones.toFixed(4)} (porción individual)`
        : "Tamaño único";

    baseItems = producto.ingredientesBase.map((ing) => ({
      concepto: ing.nombre,
      costoBase: ing.cantidad * ing.costoUnidadMinima,
      detalle: `${ing.cantidad}${ing.unidad}`,
    }));
  }

  return calcularCostoDesglose(
    baseItems,
    config.opciones,
    catalogo,
    factorOpciones,
    detalleFactor,
    factorBase,
    producto.manoDeObraMinimo ?? 60,
  );
}
