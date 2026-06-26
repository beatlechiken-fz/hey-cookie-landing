// src/modules/admin/finanzas/domain/entities/Finanzas.entity.ts

// ── Registro de venta ─────────────────────────────────────────────────────────

export interface FinanzasRegistro {
  id: string;
  ordenId: string | null;
  ordenNumero: number | null;
  clienteNombre: string | null;
  fechaVenta: string; // DATE ISO
  totalVenta: number;
  insumos: number;
  servicios: number;
  manoDeObra: number;
  utilidad: number;
  comision: number | null; // null = sin comisión
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinanzasRegistroDTO {
  ordenId?: string | null;
  ordenNumero?: number | null;
  clienteNombre?: string | null;
  fechaVenta?: string;
  totalVenta: number;
  insumos: number;
  servicios: number;
  manoDeObra: number;
  utilidad: number;
  comision?: number | null;
  notas?: string | null;
}

export type UpdateFinanzasRegistroDTO = Partial<CreateFinanzasRegistroDTO>;

// ── Movimientos de cuentas ────────────────────────────────────────────────────

export type TipoMovimiento = "ingreso" | "egreso";
export type CuentaMovimiento =
  | "utilidad"
  | "mano_de_obra"
  | "servicios"
  | "comision"
  | "general";

export const CUENTA_LABELS: Record<CuentaMovimiento, string> = {
  utilidad: "Utilidad",
  mano_de_obra: "Mano de obra",
  servicios: "Servicios",
  comision: "Comisión",
  general: "General",
};

export interface FinanzasMovimiento {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  cuenta: CuentaMovimiento;
  concepto: string;
  monto: number;
  notas: string | null;
  createdAt: string;
}

export interface CreateMovimientoDTO {
  fecha?: string;
  tipo: TipoMovimiento;
  cuenta: CuentaMovimiento;
  concepto: string;
  monto: number;
  notas?: string | null;
}

// ── Compras ───────────────────────────────────────────────────────────────────

export type CategoriaCompra =
  | "ingredientes"
  | "empaques"
  | "equipo"
  | "servicios"
  | "otros";

export const CATEGORIA_COMPRA_LABELS: Record<CategoriaCompra, string> = {
  ingredientes: "Ingredientes",
  empaques: "Empaques",
  equipo: "Equipo",
  servicios: "Servicios",
  otros: "Otros",
};

export interface FinanzasCompra {
  id: string;
  fecha: string;
  concepto: string;
  proveedor: string | null;
  categoria: CategoriaCompra | null;
  monto: number;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompraDTO {
  fecha?: string;
  concepto: string;
  proveedor?: string | null;
  categoria?: CategoriaCompra | null;
  monto: number;
  notas?: string | null;
}

export type UpdateCompraDTO = Partial<CreateCompraDTO>;

// ── Resumen de cuentas ────────────────────────────────────────────────────────

export interface SaldoCuenta {
  nombre: string;
  clave: CuentaMovimiento | "insumos" | "total_ventas" | "comision";
  acumulado: number; // suma de ventas (registros)
  movimientosNetos: number; // ingresos - egresos de movimientos
  saldo: number; // acumulado + movimientosNetos
}

export interface ResumenFinanciero {
  periodo: { desde: string; hasta: string };
  cuentas: SaldoCuenta[];
  totalVentas: number;
  totalCompras: number;
  saldoNeto: number;
}
