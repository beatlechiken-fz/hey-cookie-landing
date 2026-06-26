// src/modules/admin/store/domain/entities/PastelMedidas.ts
//
// Conversión diámetro ↔ personas para pasteles redondos.
//
// Base empírica del cliente: 24cm = 18 personas (porción estándar artesanal).
// Fórmula derivada del volumen cilíndrico (radio² × π × altura constante):
//
//   personas(d) = 18 × (d / 24)²
//   diámetro(p) = 24 × √(p / 18)
//
// El factor de escala de ingredientes sigue siendo (d/24)² (o (d/medidaBase)²
// para productos del catálogo), igual que antes. Personas es solo UI.

export const PERSONAS_BASE = 18; // personas a 24cm
export const DIAMETRO_BASE = 24; // cm base del sistema (pastel personalizado)
export const DIAMETROS_SUGERIDOS = [
  10, 12, 14, 15, 16, 18, 20, 22, 24, 26, 28, 30, 32, 35,
];

/** Personas que rinde un pastel de `diametroCm` cm */
export function personasDesdeDiametro(
  diametroCm: number,
  medidaBaseCm = DIAMETRO_BASE,
): number {
  const factor = Math.pow(diametroCm / medidaBaseCm, 2);
  return Math.max(1, Math.round(PERSONAS_BASE * factor));
}

/** Diámetro exacto (cm) para servir `personas` personas */
export function diametroDesdePersonas(
  personas: number,
  medidaBaseCm = DIAMETRO_BASE,
): number {
  if (personas <= 0) return medidaBaseCm;
  return medidaBaseCm * Math.sqrt(personas / PERSONAS_BASE);
}

/** Diámetro redondeado al cm entero más cercano para servir `personas` personas */
export function diametroRedondeado(
  personas: number,
  medidaBaseCm = DIAMETRO_BASE,
): number {
  return Math.round(diametroDesdePersonas(personas, medidaBaseCm));
}

/** Tabla de sugerencias diámetro → personas para mostrar en UI */
export const TABLA_SUGERENCIAS: { diametro: number; personas: number }[] =
  DIAMETROS_SUGERIDOS.map((d) => ({
    diametro: d,
    personas: personasDesdeDiametro(d),
  }));
