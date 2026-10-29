// src/modules/admin/store/domain/usecases/CalcularCostoPersonalizado.usecase.ts

import type {
  PersonalizadoCatalogo,
  PersonalizadoConfiguracion,
  PersonalizadoCostoDesglose,
} from "../entities/Personalizado.entity";
import {
  calcularCostoDesglose,
  type BaseEstructuralItem,
} from "./CalcularCostosDesgloce.usecase";

/**
 * Calcula el desglose completo de costos para un armado personalizado.
 * Los insumos sueltos elegidos son la línea estructural base (equivalente al
 * bizcocho de un pastel o la base de litros de una gelatina) — sin factor de
 * volumen, ya que aquí no hay diámetro: cada insumo lleva su cantidad exacta.
 * Coberturas/rellenos/toppings/empaques usan las mismas reglas que el resto
 * del sistema (ver calcularCostoDesglose).
 */
export function calcularCostoPersonalizado(
  config: PersonalizadoConfiguracion,
  catalogo: PersonalizadoCatalogo,
): PersonalizadoCostoDesglose {
  const factor = 1; // sin escalado por tamaño — las cantidades ya son las reales
  const detalleFactor = "cantidad exacta";

  const baseItems: BaseEstructuralItem[] = [];
  for (const sel of config.insumos ?? []) {
    if (!sel.ingredienteId || sel.cantidad <= 0) continue;
    const insumo = catalogo.insumos.find((i) => i.id === sel.ingredienteId);
    if (!insumo || insumo.costoUnidadMinima == null) continue;
    baseItems.push({
      concepto: `Insumo: ${insumo.nombre}`,
      costoBase: sel.cantidad * insumo.costoUnidadMinima,
      detalle: `${sel.cantidad}${insumo.unidadBase}`,
    });
  }

  return calcularCostoDesglose(baseItems, config, catalogo, factor, detalleFactor);
}
