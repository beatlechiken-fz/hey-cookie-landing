// src/app/api/admin/ordenes/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { OrdenRepositoryImpl } from "@/modules/admin/store/data/repositories/Orden.repository.impl";
import {
  GetOrdenByIdUseCase,
  UpdateOrdenStatusUseCase,
} from "@/modules/admin/store/domain/usecases/Orden.usecase";
import { FinanzasDatasource } from "@/modules/admin/store/data/datasources/Finanzas.datasource";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    return NextResponse.json(
      await new GetOrdenByIdUseCase(new OrdenRepositoryImpl()).execute(id),
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrada") ? 404 : 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const repo = new OrdenRepositoryImpl();

    let updated;

    // Actualizar status
    if (body.status !== undefined) {
      updated = await new UpdateOrdenStatusUseCase(repo).execute(
        id,
        body.status,
      );

      // ── Auto-crear registro financiero al marcar como pagado ──────────────
      if (body.status === "pagado") {
        const finDs = new FinanzasDatasource();
        // Verificar que no exista ya un registro para esta orden
        const existing = await finDs.getRegistroByOrdenId(id).catch(() => null);

        if (!existing) {
          // Sumar desglose de todos los items de la orden
          let insumos = 0;
          let servicios = 0;
          let manoObra = 0;
          let utilidad = 0;

          for (const item of updated.items) {
            const d = item.desgloseCostos as Record<string, any> | null;
            if (!d) {
              // Sin desglose guardado: aproximar desde costoUnitario
              const costo = item.costoUnitario * item.cantidad;
              insumos += costo * 0.55; // aprox 55% insumos
              servicios += costo * 0.08;
              manoObra += costo * 0.1;
              utilidad += costo * 0.27;
            } else {
              const cargos = (d.cargosAdicionales ?? []) as Array<{
                monto: number;
              }>;
              insumos += (d.costoInsumos ?? 0) * item.cantidad;
              servicios += (cargos[0]?.monto ?? 0) * item.cantidad;
              manoObra += (cargos[1]?.monto ?? 0) * item.cantidad;
              utilidad += (cargos[2]?.monto ?? 0) * item.cantidad;
            }
          }

          await finDs
            .createRegistro({
              ordenId: updated.id,
              ordenNumero: updated.numero,
              clienteNombre: updated.clienteNombre ?? null,
              fechaVenta: new Date().toISOString().slice(0, 10),
              totalVenta: updated.total,
              insumos: Math.round(insumos * 100) / 100,
              servicios: Math.round(servicios * 100) / 100,
              manoDeObra: Math.round(manoObra * 100) / 100,
              utilidad: Math.round(utilidad * 100) / 100,
              comision: null, // se asigna manualmente desde el módulo de finanzas
            })
            .catch(console.error); // no bloquear si falla el registro financiero
        }
      }
    }

    // Actualizar fechaEntrega
    if (body.fechaEntrega !== undefined) {
      updated = await repo.updateFechaEntrega(id, body.fechaEntrega ?? null);
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: e.message.includes("no encontrada") ? 404 : 500 },
    );
  }
}
