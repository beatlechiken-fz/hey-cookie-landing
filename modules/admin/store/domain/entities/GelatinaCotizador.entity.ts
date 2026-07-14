export type CategoriaGelatina = "clasica" | "healthy" | "sin_azucar";

export const FACTOR_GELATINA_POR_LITRO = 0.5;

export interface GelatinaCatalogo {
  id: string;
  nombre: string;
  costoTotal: number;
  activo: boolean;
}

// Normaliza y busca la gelatina correcta según categoría + tipo de base
function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function findCostoGelatina(
  catalogo: GelatinaCatalogo[],
  categoria: CategoriaGelatina,
  tipo: "agua" | "leche" | "tres_leches" | "queso_crema" | "yogurt",
): number {
  const matchesTipo = (nombre: string): boolean => {
    const n = norm(nombre);
    switch (tipo) {
      case "agua":        return n.includes("agua");
      case "leche":       return n.includes("leche") && !n.includes("tres") && !n.includes("queso");
      case "tres_leches": return n.includes("tres");
      case "queso_crema": return n.includes("queso");
      case "yogurt":      return n.includes("yogurt");
    }
  };

  const matchesCategoria = (nombre: string): boolean => {
    const n = norm(nombre);
    const isHealthy    = n.includes("healthy") || n.includes("helathy");
    const isSinAzucar  = n.includes("sin az");
    if (categoria === "healthy")    return isHealthy;
    if (categoria === "sin_azucar") return isSinAzucar;
    return !isHealthy && !isSinAzucar;
  };

  return (
    catalogo.find((g) => g.activo && matchesTipo(g.nombre) && matchesCategoria(g.nombre))
      ?.costoTotal ?? 0
  );
}

export interface GelatinaCotizadorConfig {
  categoria: CategoriaGelatina;
  litrosAgua: number;
  litrosLeche: number;
  litrosTresLeches: number;
  litrosQuesoCrema: number;
  litrosYogurt: number;
  coberturaId: string | null;
  saborCoberturaId: string | null;
  rellenoId: string | null;
  saborRellenoId: string | null;
  toppingIds: string[];
  jarabeId: string | null;
  saborJarabeId: string | null;
  licorId: string | null;
  empaqueIds: string[];
  conTransfer: boolean;
  conBlonda: boolean;
  cantidad: number;
}

export const GELATINA_CONFIG_VACIA: GelatinaCotizadorConfig = {
  categoria: "clasica",
  litrosAgua: 1,
  litrosLeche: 0,
  litrosTresLeches: 0,
  litrosQuesoCrema: 0,
  litrosYogurt: 0,
  coberturaId: null,
  saborCoberturaId: null,
  rellenoId: null,
  saborRellenoId: null,
  toppingIds: [],
  jarabeId: null,
  saborJarabeId: null,
  licorId: null,
  empaqueIds: [],
  conTransfer: false,
  conBlonda: false,
  cantidad: 1,
};

export interface GelatinaCostoDesglose {
  totalLitros: number;
  factorOpciones: number;

  costoBaseAgua: number;
  costoBaseLeche: number;
  costoBaseTresLeches: number;
  costoBaseQuesoCrema: number;
  costoBaseYogurt: number;
  costoBaseTotal: number;

  costoCobertura: number;
  costoRelleno: number;
  costoJarabe: number;
  costoToppings: number;
  costoLicor: number;
  costoEmpaques: number;
  costoTransfer: number;
  costoBlonda: number;
  costoInsumos: number;

  servicios: number;
  manoDeObra: number;
  utilidad: number;

  costoProduccionTotal: number;
  cargoDecoracion: number;
  precioSugerido: number;
}
