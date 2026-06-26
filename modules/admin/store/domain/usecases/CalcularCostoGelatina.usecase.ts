// src/modules/admin/store/domain/usecases/calcularCostoGelatina.ts
//
// Calcula el desglose completo de costos para una gelatina personalizada.
// Reutiliza los mismos cargos adicionales que el pastel.

import {
  FACTOR_GELATINA_POR_LITRO,
  type GelatinaCatalogo,
  type GelatinaCotizadorConfig,
  type GelatinaCostoDesglose,
} from "../entities/GelatinaCotizador.entity";
import type { PastelConfigCatalogo } from "../entities/PastelPersonalizado.entity";

export function calcularCostoGelatina(
  gelatina: GelatinaCatalogo,
  config: GelatinaCotizadorConfig,
  catalogo: PastelConfigCatalogo,
): GelatinaCostoDesglose {
  const totalLitros = config.litrosLeche + config.litrosAgua;
  const factorOpciones = totalLitros * FACTOR_GELATINA_POR_LITRO;

  // ── Costo receta base ──────────────────────────────────────────────────────
  const costoBaseLeche = config.litrosLeche * gelatina.costoTotalLeche;
  const costoBaseAgua = config.litrosAgua * gelatina.costoTotalAgua;
  const costoBaseTotal = costoBaseLeche + costoBaseAgua;

  // ── Opciones del catálogo (escaladas por factorOpciones) ──────────────────
  const find = <T extends { id: string }>(
    arr: T[],
    id: string | null | undefined,
  ) => (!id || id === "ninguno" ? undefined : arr.find((x) => x.id === id));

  const cob = find(catalogo.coberturas, config.coberturaId);
  const rel = find(catalogo.coberturas, config.rellenoId);
  const jar = find(catalogo.jarabes, config.jarabeId);

  const costoCobertura = cob ? cob.costoTotal * factorOpciones : 0;
  const costoRelleno = rel ? rel.costoTotal * factorOpciones : 0;
  const costoJarabe = jar ? jar.costoTotal * factorOpciones : 0;

  const costoToppings = config.toppingIds
    .filter((t) => t && t !== "ninguno")
    .reduce((sum, tid) => {
      const t = catalogo.toppings.find((x) => x.ingredienteId === tid);
      return (
        sum +
        (t && t.cantidad != null && t.costoUnidadMinima != null
          ? t.cantidad * t.costoUnidadMinima * factorOpciones
          : 0)
      );
    }, 0);

  const lic = catalogo.licores.find((l) => l.ingredienteId === config.licorId);
  const costoLicor =
    lic && lic.cantidad != null && lic.costoUnidadMinima != null
      ? lic.cantidad * lic.costoUnidadMinima * factorOpciones
      : 0;

  const costoEmpaques = config.empaqueIds
    .filter((e) => e && e !== "ninguno")
    .reduce((sum, eid) => {
      const emp = catalogo.empaques.find((e) => e.id === eid);
      return sum + (emp ? emp.precio : 0);
    }, 0);

  // Extras gelatina: Transfer y Blonda (precio fijo, no escalan)
  const transferItem = catalogo.toppings.find((t) =>
    t.nombre?.toLowerCase().includes("transfer"),
  );
  const blondaItem = catalogo.empaques.find((e) =>
    e.nombre?.toLowerCase().includes("blonda"),
  );
  const costoTransfer =
    config.conTransfer && transferItem
      ? (transferItem.cantidad ?? 0) * (transferItem.costoUnidadMinima ?? 0)
      : 0;
  const costoBlonda = config.conBlonda && blondaItem ? blondaItem.precio : 0;

  const costoInsumos =
    costoBaseTotal +
    costoCobertura +
    costoRelleno +
    costoJarabe +
    costoToppings +
    costoLicor +
    costoEmpaques +
    costoTransfer +
    costoBlonda;

  // ── Cargos adicionales (misma lógica que calcularCostoDesglose) ───────────
  const baseEstructural = costoBaseTotal + costoCobertura + costoRelleno;
  const baseConOpciones = baseEstructural + costoJarabe;

  const servicios = baseEstructural * 0.1;
  const mobraPct = baseEstructural * 0.25;
  const manoDeObra = Math.max(60, mobraPct);
  const utilidad = baseConOpciones * 0.9;

  const costoProduccionTotal = costoInsumos + servicios + manoDeObra + utilidad;

  return {
    litrosLeche: config.litrosLeche,
    litrosAgua: config.litrosAgua,
    totalLitros,
    factorOpciones,
    costoBaseLeche,
    costoBaseAgua,
    costoBaseTotal,
    costoCobertura,
    costoRelleno,
    costoJarabe,
    costoToppings,
    costoLicor,
    costoEmpaques,
    costoTransfer,
    costoBlonda,
    costoInsumos,
    servicios,
    manoDeObra,
    utilidad,
    costoProduccionTotal,
    precioSugerido: costoProduccionTotal,
  };
}
