// src/modules/admin/store/domain/entities/Cupon.entity.ts

export type TipoDescuento = "porcentaje" | "monto_fijo";
export type TipoCupon = "global" | "individual";

export interface Cupon {
  id: string;
  codigo: string;
  descripcion: string | null;
  tipo: TipoCupon;
  tipoDescuento: TipoDescuento;
  valor: number;
  usosMaximos: number | null;
  usosActuales: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  /** Solo presente cuando se consulta en contexto de un cliente específico (ej. /clientes/[id]) */
  asignadoCliente?: { usado: boolean; usadoEn: string | null } | null;
}

export interface CreateCuponDTO {
  codigo: string;
  descripcion?: string | null;
  tipo: TipoCupon;
  tipoDescuento: TipoDescuento;
  valor: number;
  usosMaximos?: number | null;
  fechaInicio?: string | null;
  fechaFin?: string | null;
}

export type UpdateCuponDTO = Partial<CreateCuponDTO>;

/** Calcula el monto de descuento que aplica un cupón sobre un subtotal */
export function calcularDescuentoCupon(cupon: Cupon, subtotal: number): number {
  if (cupon.tipoDescuento === "porcentaje") {
    return subtotal * (cupon.valor / 100);
  }
  return Math.min(cupon.valor, subtotal); // monto fijo no puede exceder el subtotal
}

/**
 * Valida si un cupón es utilizable en este momento (vigencia, usos, activo, asignación).
 *
 * @param asignadoAlCliente - true si existe una fila en cupon_clientes para
 *   (cupon.id, clienteId de la orden). Lo determina el caller consultando esa tabla.
 *
 * Reglas de tipo:
 * - global: cualquiera puede usarlo, sin importar asignación
 * - individual: solo válido si fue asignado explícitamente al cliente que
 *   intenta usarlo (asignadoAlCliente === true). Un cupón individual puede
 *   estar asignado a MUCHOS clientes simultáneamente (relación m2m).
 */
export function validarCupon(
  cupon: Cupon,
  clienteId?: string | null,
  asignadoAlCliente?: boolean,
): { valido: boolean; razon?: string } {
  if (!cupon.activo)
    return { valido: false, razon: "Este cupón ya no está activo" };

  const now = new Date();
  if (cupon.fechaInicio && new Date(cupon.fechaInicio) > now) {
    return { valido: false, razon: "Este cupón aún no es válido" };
  }
  if (cupon.fechaFin && new Date(cupon.fechaFin) < now) {
    return { valido: false, razon: "Este cupón ha expirado" };
  }
  if (cupon.usosMaximos != null && cupon.usosActuales >= cupon.usosMaximos) {
    return { valido: false, razon: "Este cupón alcanzó su límite de usos" };
  }

  if (cupon.tipo === "individual") {
    if (!clienteId) {
      return {
        valido: false,
        razon:
          "Este cupón es exclusivo para clientes a quienes se les ha asignado; asigna un cliente a la orden",
      };
    }
    if (!asignadoAlCliente) {
      return {
        valido: false,
        razon: "Este cupón no está asignado a este cliente",
      };
    }
  }

  return { valido: true };
}
