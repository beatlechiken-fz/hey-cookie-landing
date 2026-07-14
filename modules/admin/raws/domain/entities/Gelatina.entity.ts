export interface GelatinaIngrediente {
  id: string;
  gelatinaId: string;
  ingredienteId: string;
  ingredienteNombre: string;
  ingredienteUnidad: string;
  cantidad: number;
  costoCalculado: number;
}

export interface Gelatina {
  id: string;        // gelatina_id
  nombre: string;
  activo: boolean;
  costoTotal: number;
  ingredientes: GelatinaIngrediente[];
}

export interface CreateGelatinaIngredienteDTO {
  ingredienteId: string;
  cantidad: number;
}

export interface CreateGelatinaDTO {
  nombre: string;
  activo?: boolean;
  ingredientes: CreateGelatinaIngredienteDTO[];
}

export type UpdateGelatinaDTO = Partial<CreateGelatinaDTO>;
