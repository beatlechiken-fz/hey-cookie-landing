// src/modules/admin/store/domain/usecases/PrecioPublico.usecase.ts

import {
  getPrecioEstablecidoEfectivo,
  OPCIONES_VACIAS,
  type Producto,
} from "../entities/Producto.entity";
import {
  normalizeOpciones,
  type PastelConfigCatalogo,
} from "../entities/PastelPersonalizado.entity";
import { calcularCostoProducto } from "./CalcularCostoProducto.usecase";

/** Redondea hacia arriba al siguiente múltiplo de $5 (343.45 → 345, 345 → 345). */
export function redondearPrecioCerrado(precio: number): number {
  const centavos = Math.round(precio * 100);
  return Math.ceil(centavos / 500) * 5;
}

/**
 * Precio a mostrar en el catálogo público: el precio fijo del producto (o de
 * su primer tamaño) si lo tiene; si no, el sugerido.
 */
export function precioPublicoProducto(
  producto: Producto,
  catalogo: PastelConfigCatalogo,
): number | null {
  const fijo = getPrecioEstablecidoEfectivo(producto, producto.tamanosFijos[0]?.id ?? null);
  return fijo ?? precioSugeridoProducto(producto, catalogo);
}

/**
 * Precio sugerido con las opciones por defecto y la medida base (o el primer
 * tamaño), redondeado al siguiente número cerrado.
 */
export function precioSugeridoProducto(
  producto: Producto,
  catalogo: PastelConfigCatalogo,
): number | null {
  const tamanoFijoId = producto.tamanosFijos[0]?.id ?? null;
  const { precioSugerido } = calcularCostoProducto(
    producto,
    {
      opciones: normalizeOpciones({ ...OPCIONES_VACIAS, ...producto.opcionesDefault }),
      diametroCm: producto.medidaBaseCm ?? 0,
      tamanoFijoId,
      cantidad: 1,
    },
    catalogo,
  );
  return precioSugerido > 0 ? redondearPrecioCerrado(precioSugerido) : null;
}
