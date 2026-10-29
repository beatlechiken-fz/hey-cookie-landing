// src/modules/admin/store/domain/entities/Beneficio.entity.ts
//
// Beneficios automáticos del club: reglas que, cuando se disparan, generan
// un cupón para el cliente (todo beneficio —incluso un regalo— se modela
// como un cupón). El primero es "cumpleaños"; otros se agregan igual.

export interface BeneficioCumpleanosConfig {
  descuentoPorcentaje: number;
  regaloDescripcion: string;
  /** Días de vigencia del cupón generado, a partir de hoy. */
  diasValidez: number;
}

export type BeneficioConfig = BeneficioCumpleanosConfig;

export interface Beneficio {
  id: string;
  tipo: string;
  activo: boolean;
  config: BeneficioConfig;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBeneficioDTO {
  activo?: boolean;
  config?: Partial<BeneficioConfig>;
}

export interface BeneficioOtorgamiento {
  id: string;
  beneficioId: string;
  clienteId: string;
  clienteNombre: string | null;
  anio: number;
  cuponId: string | null;
  cuponCodigo: string | null;
  createdAt: string;
}

export interface GenerarCumpleanosResultado {
  generados: number;
  omitidos: number;
  clientes: string[];
}
