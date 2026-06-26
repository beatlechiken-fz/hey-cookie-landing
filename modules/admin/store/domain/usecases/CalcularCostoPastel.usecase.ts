// src/modules/admin/store/domain/usecases/calcularCostoPastel.ts

import {
  calcularFactorVolumen,
  type PastelConfigCatalogo,
  type PastelConfiguracion,
  type PastelCostoDesglose,
} from "../entities/PastelPersonalizado.entity";
import {
  calcularCostoDesglose,
  find,
  type BaseEstructuralItem,
} from "./CalcularCostosDesgloce.usecase";

/**
 * Calcula el desglose completo de costos para una configuración de pastel personalizado.
 * El bizcocho elegido es la línea estructural base; ver calcularCostoDesglose para
 * las reglas de escalado y cargos adicionales (compartidas con productos del catálogo).
 */
export function calcularCostoPastel(
  config: PastelConfiguracion,
  catalogo: PastelConfigCatalogo,
): PastelCostoDesglose {
  const factor = calcularFactorVolumen(config.diametroCm);
  const detalleFactor = `Factor ${factor.toFixed(4)} (${config.diametroCm}cm / 24cm base)`;

  const baseItems: BaseEstructuralItem[] = [];
  const bizcocho = find(catalogo.bizcochos, config.bizcochoId);
  if (bizcocho) {
    baseItems.push({
      concepto: `Bizcocho: ${bizcocho.nombre}`,
      costoBase: bizcocho.costoTotal,
      detalle: detalleFactor,
    });
  }

  return calcularCostoDesglose(
    baseItems,
    config,
    catalogo,
    factor,
    detalleFactor,
  );
}
