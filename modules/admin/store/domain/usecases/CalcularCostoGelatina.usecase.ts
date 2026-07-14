import {
  FACTOR_GELATINA_POR_LITRO,
  findCostoGelatina,
  type GelatinaCatalogo,
  type GelatinaCotizadorConfig,
  type GelatinaCostoDesglose,
} from "../entities/GelatinaCotizador.entity";
import type { PastelConfigCatalogo } from "../entities/PastelPersonalizado.entity";

export function calcularCostoGelatina(
  gelatinas: GelatinaCatalogo[],
  config: GelatinaCotizadorConfig,
  catalogo: PastelConfigCatalogo,
): GelatinaCostoDesglose {
  const { categoria } = config;

  const costoBaseAgua       = config.litrosAgua       * findCostoGelatina(gelatinas, categoria,  "agua");
  const costoBaseLeche      = config.litrosLeche      * findCostoGelatina(gelatinas, categoria,  "leche");
  const costoBaseTresLeches = config.litrosTresLeches * findCostoGelatina(gelatinas, "clasica",  "tres_leches");
  const costoBaseQuesoCrema = config.litrosQuesoCrema * findCostoGelatina(gelatinas, categoria,  "queso_crema");
  const costoBaseYogurt     = config.litrosYogurt     * findCostoGelatina(gelatinas, categoria,  "yogurt");
  const costoBaseTotal      = costoBaseAgua + costoBaseLeche + costoBaseTresLeches + costoBaseQuesoCrema + costoBaseYogurt;

  const totalLitros    = config.litrosAgua + config.litrosLeche + config.litrosTresLeches + config.litrosQuesoCrema + config.litrosYogurt;
  const factorOpciones = totalLitros * FACTOR_GELATINA_POR_LITRO;

  const find = <T extends { id: string }>(arr: T[], id: string | null | undefined) =>
    !id || id === "ninguno" ? undefined : arr.find((x) => x.id === id);

  const cob = find(catalogo.coberturas, config.coberturaId);
  const rel = find(catalogo.coberturas, config.rellenoId);
  const jar = find(catalogo.jarabes,    config.jarabeId);

  const costoCobertura = cob ? cob.costoTotal * factorOpciones : 0;
  const costoRelleno   = rel ? rel.costoTotal * factorOpciones : 0;
  const costoJarabe    = jar ? jar.costoTotal * factorOpciones : 0;

  const costoToppings = config.toppingIds
    .filter((t) => t && t !== "ninguno")
    .reduce((sum, tid) => {
      const t = catalogo.toppings.find((x) => x.ingredienteId === tid);
      return sum + (t && t.cantidad != null && t.costoUnidadMinima != null
        ? t.cantidad * t.costoUnidadMinima * factorOpciones : 0);
    }, 0);

  const lic = catalogo.licores.find((l) => l.ingredienteId === config.licorId);
  const costoLicor = lic && lic.cantidad != null && lic.costoUnidadMinima != null
    ? lic.cantidad * lic.costoUnidadMinima * factorOpciones : 0;

  const costoEmpaques = config.empaqueIds
    .filter((e) => e && e !== "ninguno")
    .reduce((sum, eid) => {
      const emp = catalogo.empaques.find((e) => e.id === eid);
      return sum + (emp ? emp.precio : 0);
    }, 0);

  const transferItem = catalogo.toppings.find((t) => t.nombre?.toLowerCase().includes("transfer"));
  const blondaItem   = catalogo.empaques.find((e) => e.nombre?.toLowerCase().includes("blonda"));
  const costoTransfer = config.conTransfer && transferItem
    ? (transferItem.cantidad ?? 0) * (transferItem.costoUnidadMinima ?? 0) : 0;
  const costoBlonda = config.conBlonda && blondaItem ? blondaItem.precio : 0;

  const costoInsumos =
    costoBaseTotal + costoCobertura + costoRelleno + costoJarabe +
    costoToppings + costoLicor + costoEmpaques + costoTransfer + costoBlonda;

  const baseEstructural = costoBaseTotal + costoCobertura + costoRelleno;
  const baseConOpciones = baseEstructural + costoJarabe;

  const servicios   = baseEstructural * 0.1;
  const manoDeObra  = Math.max(60, baseEstructural * 0.25);
  const utilidad    = baseConOpciones * 0.9;

  const costoProduccionTotal = costoInsumos + servicios + manoDeObra + utilidad;
  const cargoDecoracion = 50;

  return {
    totalLitros,
    factorOpciones,
    costoBaseAgua,
    costoBaseLeche,
    costoBaseTresLeches,
    costoBaseQuesoCrema,
    costoBaseYogurt,
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
    cargoDecoracion,
    precioSugerido: costoProduccionTotal + cargoDecoracion,
  };
}
