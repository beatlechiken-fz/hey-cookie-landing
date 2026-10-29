// GET /api/club/beneficios — cashback (saldo + movimientos) y cupones asignados del cliente.
// Protegida por proxy: requiere token.role === "user".

import { NextResponse } from "next/server";
import { getUserSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import { CashbackRepositoryImpl } from "@/modules/admin/store/data/repositories/Cashback.repository.impl";
import { GetCashbackClienteUseCase } from "@/modules/admin/store/domain/usecases/Cashback.usecase";
import { CuponRepositoryImpl } from "@/modules/admin/store/data/repositories/Cupon.repository.impl";
import type { Cupon } from "@/modules/admin/store/domain/entities/Cupon.entity";

/** Cupón asignado que el cliente todavía puede usar hoy. */
function cuponVigente(c: Cupon, ahora: Date): boolean {
  if (!c.activo || c.asignadoCliente?.usado) return false;
  if (c.fechaInicio && new Date(c.fechaInicio) > ahora) return false;
  if (c.fechaFin && new Date(c.fechaFin) < ahora) return false;
  if (c.usosMaximos != null && c.usosActuales >= c.usosMaximos) return false;
  return true;
}

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = getSupabaseAdmin();
    const { data: cliente } = await db
      .from("clientes")
      .select("id")
      .eq("email", session.user.email ?? "")
      .maybeSingle();
    if (!cliente)
      return NextResponse.json({
        cashback: { saldo: 0, movimientos: [] },
        cupones: [],
        comprasRealizadas: 0,
      });

    const [cashback, asignados, { count: comprasRealizadas }] = await Promise.all([
      new GetCashbackClienteUseCase(new CashbackRepositoryImpl()).execute(cliente.id),
      new CuponRepositoryImpl().findAsignadosByCliente(cliente.id),
      db
        .from("ordenes")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", cliente.id)
        .in("status", ["pagado", "entregado"]),
    ]);
    const ahora = new Date();
    const cupones = asignados
      .filter((c) => cuponVigente(c, ahora))
      .map((c) => ({
        codigo: c.codigo,
        descripcion: c.descripcion,
        tipoDescuento: c.tipoDescuento,
        valor: c.valor,
        fechaFin: c.fechaFin,
      }));
    return NextResponse.json({
      cashback,
      cupones,
      comprasRealizadas: comprasRealizadas ?? 0,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
