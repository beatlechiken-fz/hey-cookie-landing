// src/modules/admin/store/domain/entities/Inventario.entity.ts
//
// Inventario de productos del catálogo (galletas, etc.) — el admin registra
// "producciones" (lotes que preparó) que suman al stock; cuando una orden se
// marca para descontar inventario, la cantidad vendida resta del stock. Todo
// movimiento (producción, venta, cancelación/restauración, ajuste manual)
// queda en `inventario_movimientos` como bitácora — `productos.stock_actual`
// es solo el acumulado, la fuente de verdad es la bitácora.

export interface Produccion {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  fecha: string; // DATE ISO
  notas: string | null;
  createdAt: string;
}

export interface CreateProduccionDTO {
  productoId: string;
  cantidad: number;
  fecha?: string;
  notas?: string | null;
}

export type TipoMovimientoInventario =
  | "produccion"
  | "venta"
  | "cancelacion"
  | "ajuste";

export const TIPO_MOVIMIENTO_LABELS: Record<TipoMovimientoInventario, string> = {
  produccion: "Producción",
  venta: "Venta",
  cancelacion: "Cancelación (restaurado)",
  ajuste: "Ajuste manual",
};

export interface InventarioMovimiento {
  id: string;
  productoId: string;
  productoNombre: string;
  tipo: TipoMovimientoInventario;
  cantidad: number; // positivo = entrada, negativo = salida
  ordenId: string | null;
  ordenNumero: number | null;
  nota: string | null;
  createdAt: string;
}

/** Fila de la tabla de stock — un renglón por producto con historial de producción. */
export interface ProductoStock {
  productoId: string;
  productoNombre: string;
  imagenUrl: string | null;
  linea: string;
  stockActual: number;
  ultimaProduccion: string | null; // fecha ISO de la producción más reciente, null = nunca se ha producido
}

export interface CreateAjusteInventarioDTO {
  productoId: string;
  /** Delta a aplicar sobre el stock actual — puede ser negativo. */
  cantidad: number;
  nota?: string | null;
}
