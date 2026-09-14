// src/modules/admin/store/domain/entities/Orden.entity.ts

export type OrdenStatus =
  | "cotizacion"
  | "en_proceso"
  | "listo_entregar"
  | "pagado"
  | "entregado"
  | "cancelado";

export const ORDEN_STATUS_LABELS: Record<OrdenStatus, string> = {
  cotizacion: "Cotización",
  en_proceso: "En proceso",
  listo_entregar: "Listo para entregar",
  pagado: "Pagado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export interface OrdenItem {
  id?: string;
  tipo: "pastel_personalizado";
  nombre: string;
  configuracion: Record<string, any>;
  cantidad: number;
  costoUnitario: number;
  precioUnitario: number;
  subtotal: number;
  /** Snapshot del PastelCostoDesglose para generar registro financiero */
  desgloseCostos?: Record<string, any> | null;
}

export interface OrdenCuponAplicado {
  id?: string;
  cuponId: string;
  codigo: string;
  tipoDescuento: "porcentaje" | "monto_fijo";
  valor: number;
  montoDescontado: number;
}

export interface Orden {
  id: string;
  numero: number;
  clienteId: string | null;
  clienteNombre: string | null;
  status: OrdenStatus;
  subtotal: number;
  descuentoTotal: number;
  total: number;
  notas: string | null;
  fechaEntrega: string | null;
  direccionEntrega: string | null;
  items: OrdenItem[];
  cupones: OrdenCuponAplicado[];
  /** Intención: si al pasar a "en_proceso" debe restar del inventario los productos con stock. */
  descontarInventario: boolean;
  /** Hecho: true una vez que ya se descontó el inventario para esta orden (evita descontar dos veces). */
  inventarioDescontado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrdenDTO {
  clienteId?: string | null;
  status: "cotizacion" | "en_proceso";
  items: OrdenItem[];
  cupones: OrdenCuponAplicado[];
  notas?: string | null;
  fechaEntrega?: string | null;
  direccionEntrega?: string | null;
  /** Solo aplica si status = "en_proceso" — en cotización nunca se descuenta. */
  descontarInventario?: boolean;
}

export interface UpdateOrdenStatusDTO {
  status: OrdenStatus;
}

/**
 * Editar una partida (orden_item) ya existente — nombre/configuración/cantidad/precio,
 * se recalcula subtotal. any: mismo shape sin tipo dedicado que OrdenItem arriba.
 */
export interface UpdateOrdenItemDTO {
  nombre: string;
  configuracion: Record<string, any>;
  cantidad: number;
  costoUnitario: number;
  precioUnitario: number;
  desgloseCostos?: Record<string, any> | null;
}

/** Solo se puede editar/quitar partidas mientras la orden está en estos estados. */
export const ORDEN_STATUS_EDITABLES: OrdenStatus[] = ["cotizacion", "en_proceso"];
