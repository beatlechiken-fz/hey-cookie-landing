// src/modules/admin/store/domain/repositories/ClienteEnlaceEdicion.repository.ts

import type { ClienteEnlaceEdicion } from "../entities/ClienteEnlaceEdicion.entity";

export interface ClienteEnlaceEdicionRepository {
  findByToken(token: string): Promise<ClienteEnlaceEdicion | null>;
  /** Último enlace no revocado y sin expirar del cliente. */
  findVigenteByCliente(clienteId: string): Promise<ClienteEnlaceEdicion | null>;
  findVigentesByClientes(clienteIds: string[]): Promise<ClienteEnlaceEdicion[]>;
  create(clienteId: string, expiraAt: Date): Promise<ClienteEnlaceEdicion>;
  revocarDeCliente(clienteId: string): Promise<void>;
  /**
   * Suma una edición respetando el límite por ventana de 24 h.
   * Devuelve false si el enlace ya agotó sus ediciones del día.
   */
  registrarEdicion(enlace: ClienteEnlaceEdicion, maxPorDia: number): Promise<boolean>;
}
