// src/modules/admin/productos/data/datasources/Producto.datasource.ts

import { getSupabaseAdmin } from "@/core/helpers/supabase";
import type {
  Producto,
  CreateProductoDTO,
  UpdateProductoDTO,
  LineaProducto,
} from "../../domain/entities/Producto.entity";
import type {
  ProductoFilters,
  PaginatedResult,
} from "../../domain/repositories/Producto.repository";

const TABLE = "productos";

function toEntity(row: any): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? null,
    imagenUrl: row.imagen_url ?? null,
    linea: row.linea as LineaProducto,
    categoria: row.categoria ?? null,
    elaboracion: row.elaboracion ?? null,
    ingredientesBase: row.ingredientes_base ?? [],
    opcionesDefault: row.opciones_default ?? {},
    medidaBaseCm:
      row.medida_base_cm != null ? Number(row.medida_base_cm) : null,
    permiteMedidaPersonalizada: row.permite_medida_personalizada,
    tamanosFijos: row.tamanos_fijos ?? [],
    factorOpciones:
      row.factor_opciones != null ? Number(row.factor_opciones) : null,
    manoDeObraMinimo:
      row.mano_de_obra_minimo != null ? Number(row.mano_de_obra_minimo) : null,
    precioEstablecido:
      row.precio_establecido != null ? Number(row.precio_establecido) : null,
    activo: row.activo,
    orden: row.orden ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(dto: Partial<CreateProductoDTO>) {
  const row: Record<string, any> = {};
  if (dto.nombre !== undefined) row.nombre = dto.nombre;
  if (dto.descripcion !== undefined) row.descripcion = dto.descripcion;
  if (dto.imagenUrl !== undefined) row.imagen_url = dto.imagenUrl;
  if (dto.linea !== undefined) row.linea = dto.linea;
  if (dto.categoria !== undefined) row.categoria = dto.categoria;
  if (dto.elaboracion !== undefined) row.elaboracion = dto.elaboracion;
  if (dto.ingredientesBase !== undefined)
    row.ingredientes_base = dto.ingredientesBase;
  if (dto.opcionesDefault !== undefined)
    row.opciones_default = dto.opcionesDefault;
  if (dto.medidaBaseCm !== undefined) row.medida_base_cm = dto.medidaBaseCm;
  if (dto.permiteMedidaPersonalizada !== undefined)
    row.permite_medida_personalizada = dto.permiteMedidaPersonalizada;
  if (dto.tamanosFijos !== undefined) row.tamanos_fijos = dto.tamanosFijos;
  if (dto.factorOpciones !== undefined)
    row.factor_opciones = dto.factorOpciones;
  if (dto.manoDeObraMinimo !== undefined)
    row.mano_de_obra_minimo = dto.manoDeObraMinimo;
  if (dto.precioEstablecido !== undefined)
    row.precio_establecido = dto.precioEstablecido;
  if (dto.activo !== undefined) row.activo = dto.activo;
  if (dto.orden !== undefined) row.orden = dto.orden;
  return row;
}

export class ProductoSupabaseDatasource {
  private get db() {
    return getSupabaseAdmin();
  }

  async findAll(filters: ProductoFilters): Promise<PaginatedResult<Producto>> {
    const { search, linea, activo = true, page = 1, pageSize = 50 } = filters;
    const from = (page - 1) * pageSize;

    let q = this.db.from(TABLE).select("*", { count: "exact" });
    if (search) q = q.ilike("nombre", `%${search}%`);
    if (linea) q = q.eq("linea", linea);
    if (activo !== undefined) q = q.eq("activo", activo);
    q = q
      .order("nombre")
      .range(from, from + pageSize - 1);

    const { data, error, count } = await q;
    if (error) throw new Error(`findAll productos: ${error.message}`);
    return {
      data: (data ?? []).map(toEntity),
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  }

  async findById(id: string): Promise<Producto | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error?.code === "PGRST116") return null;
    if (error) throw new Error(`findById producto: ${error.message}`);
    return toEntity(data);
  }

  async create(dto: CreateProductoDTO): Promise<Producto> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert(toRow(dto))
      .select()
      .single();
    if (error) throw new Error(`create producto: ${error.message}`);
    return toEntity(data);
  }

  async update(id: string, dto: UpdateProductoDTO): Promise<Producto> {
    const { data, error } = await this.db
      .from(TABLE)
      .update(toRow(dto))
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(`update producto: ${error.message}`);
    return toEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from(TABLE)
      .update({ activo: false })
      .eq("id", id);
    if (error) throw new Error(`delete producto: ${error.message}`);
  }
}
