// src/modules/admin/store/domain/usecases/DesglosePrecioCliente.usecase.ts

import type { PastelCostoDesglose } from "../entities/PastelPersonalizado.entity";

export interface LineaPrecioCliente {
  concepto: string;
  monto: number;
}

/** Grupos en el orden en que se le muestran al cliente. */
const GRUPOS: { prefijos: string[]; concepto: string; estructura: boolean; jarabe: boolean }[] = [
  { prefijos: ["Cobertura:", "Sabor cobertura:"], concepto: "Coberturas", estructura: true, jarabe: false },
  { prefijos: ["Relleno:", "Sabor relleno:"], concepto: "Rellenos", estructura: true, jarabe: false },
  { prefijos: ["Jarabe:", "Sabor jarabe:"], concepto: "Jarabe", estructura: false, jarabe: true },
  { prefijos: ["Licor:"], concepto: "Licor", estructura: false, jarabe: false },
  { prefijos: ["Topping:"], concepto: "Toppings", estructura: false, jarabe: false },
  { prefijos: ["Ornamento:"], concepto: "Ornamentos", estructura: false, jarabe: false },
  { prefijos: ["Empaque:"], concepto: "Empaque", estructura: false, jarabe: false },
];

/**
 * Desglose del precio en lenguaje de cliente: cuánto aporta cada parte
 * (base del tamaño elegido, coberturas, rellenos, jarabe, toppings…) al
 * precio final. No expone costos internos: los cargos de elaboración se
 * reparten entre las partes que los generan (igual que en
 * calcularCostoDesglose) y todo se escala para que la suma sea exactamente
 * `precioFinal` (que puede ser el sugerido redondeado o un precio fijo).
 */
export function desglosePrecioCliente(
  desglose: PastelCostoDesglose,
  precioFinal: number,
): LineaPrecioCliente[] {
  const grupoDe = (concepto: string) =>
    GRUPOS.find((g) => g.prefijos.some((p) => concepto.startsWith(p)));

  // Bases sobre las que se calcularon los cargos (ver calcularCostoDesglose).
  let baseEstructura = 0;
  let baseJarabe = 0;
  for (const it of desglose.items) {
    const g = grupoDe(it.concepto);
    if (!g || g.estructura) baseEstructura += it.costoFinal;
    else if (g.jarabe) baseJarabe += it.costoFinal;
  }
  const [c1 = 0, c2 = 0, c3 = 0] = desglose.cargosAdicionales.map((c) => c.monto);
  const baseConJarabe = baseEstructura + baseJarabe;

  const montos = new Map<string, number>();
  for (const it of desglose.items) {
    const g = grupoDe(it.concepto);
    const enEstructura = !g || g.estructura;
    let monto = it.costoFinal;
    if (enEstructura && baseEstructura > 0) monto += (it.costoFinal / baseEstructura) * (c1 + c2);
    if ((enEstructura || g?.jarabe) && baseConJarabe > 0) monto += (it.costoFinal / baseConJarabe) * c3;
    const concepto = g?.concepto ?? "Base";
    montos.set(concepto, (montos.get(concepto) ?? 0) + monto);
  }
  // Si no hubo base de estructura, los cargos fijos (mano de obra mínima) van a la base.
  if (baseEstructura === 0 && c1 + c2 > 0) {
    montos.set("Base", (montos.get("Base") ?? 0) + c1 + c2);
  }

  const total = [...montos.values()].reduce((a, b) => a + b, 0);
  if (total <= 0 || precioFinal <= 0) return [];

  const orden = ["Base", ...GRUPOS.map((g) => g.concepto)];
  const lineas = orden
    .filter((c) => montos.has(c))
    .map((concepto) => ({ concepto, monto: Math.round((montos.get(concepto)! / total) * precioFinal) }))
    .filter((l) => l.monto > 0);

  // Ajuste de redondeo: la suma debe dar exactamente el precio final.
  const diff = Math.round(precioFinal) - lineas.reduce((a, l) => a + l.monto, 0);
  if (diff !== 0 && lineas.length > 0) {
    const mayor = lineas.reduce((m, l) => (l.monto > m.monto ? l : m), lineas[0]);
    mayor.monto += diff;
  }
  return lineas;
}
