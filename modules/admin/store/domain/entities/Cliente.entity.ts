// src/modules/admin/clientes/domain/entities/Cliente.entity.ts

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  notas: string | null;
  authUserId: string | null; // null = sin cuenta de acceso todavía
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClienteDTO {
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  notas?: string | null;
}

export type UpdateClienteDTO = Partial<CreateClienteDTO>;

/** Resumen mínimo para selectores/buscadores (carrito, cupones, etc.) */
export interface ClienteResumen {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
}
