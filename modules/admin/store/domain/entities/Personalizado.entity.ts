// src/modules/admin/store/domain/entities/Personalizado.entity.ts
//
// "Armado personalizado" — un pedido a la medida que NO parte de un bizcocho
// ni de una gelatina: el admin elige directamente insumos sueltos, coberturas,
// rellenos, toppings y empaques, y el sistema calcula el total con la misma
// lógica de costeo que pastel/gelatina (ver CalcularCostosDesgloce.usecase).

import type {
  PastelConfigCatalogo,
  PastelCostoDesglose,
} from "./PastelPersonalizado.entity";
import { OPCIONES_VACIAS, type ProductoOpciones } from "./Producto.entity";

/** Insumo suelto elegido directamente del catálogo de materias primas (`ingredientes`). */
export interface InsumoSeleccionado {
  ingredienteId: string;
  cantidad: number; // en la unidad base del insumo (gr/ml/pieza)
}

/** Opción de insumo disponible para elegir — catálogo completo de `ingredientes` activos. */
export interface OpcionInsumo {
  id: string;
  nombre: string;
  unidadBase: string;
  costoUnidadMinima: number | null;
  categoria?: string | null;
}

/** Catálogo que alimenta el configurador de armado personalizado. */
export interface PersonalizadoCatalogo extends PastelConfigCatalogo {
  insumos: OpcionInsumo[];
}

/**
 * Configuración de un armado personalizado: insumos sueltos (la línea
 * "estructural", equivalente al bizcocho/gelatina) + las mismas opciones de
 * cobertura/relleno/toppings/empaques que el resto del sistema. Sin diámetro
 * ni factor de volumen automático — cada insumo/cobertura/relleno se dimensiona
 * a mano (cantidad exacta, o el campo `factor` de cada cobertura/relleno).
 */
export interface PersonalizadoConfiguracion extends ProductoOpciones {
  insumos: InsumoSeleccionado[];
  cantidad: number;
}

export const PERSONALIZADO_CONFIG_VACIA: PersonalizadoConfiguracion = {
  ...OPCIONES_VACIAS,
  insumos: [],
  cantidad: 1,
};

export type PersonalizadoCostoDesglose = PastelCostoDesglose;
