// src/app/api/admin/ordenes/[id]/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import { OrdenRepositoryImpl } from "@/modules/admin/store/data/repositories/Orden.repository.impl";
import {
  GetOrdenByIdUseCase,
  UpdateOrdenStatusUseCase,
} from "@/modules/admin/store/domain/usecases/Orden.usecase";
import { FinanzasDatasource } from "@/modules/admin/store/data/datasources/Finanzas.datasource";
import { buildOrdenClienteHtml } from "@/core/helpers/generarPDF";
import type { Orden } from "@/modules/admin/store/domain/entities/Orden.entity";

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

    let updated: Orden | undefined;

    // Actualizar status
    if (body.status !== undefined) {
      const ord = await new UpdateOrdenStatusUseCase(repo).execute(
        id,
        body.status,
      );
      updated = ord;

      // ── Auto-crear registro financiero al marcar como pagado ──────────────
      if (body.status === "pagado") {
        const finDs = new FinanzasDatasource();
        const existing = await finDs.getRegistroByOrdenId(id).catch(() => null);

        if (!existing) {
          let insumos = 0;
          let servicios = 0;
          let manoObra = 0;
          let utilidad = 0;

          for (const item of ord.items) {
            const d = item.desgloseCostos as Record<string, any> | null;
            if (!d) {
              const costo = item.costoUnitario * item.cantidad;
              insumos += costo * 0.55;
              servicios += costo * 0.08;
              manoObra += costo * 0.1;
              utilidad += costo * 0.27;
            } else {
              const cargos = (d.cargosAdicionales ?? []) as Array<{ monto: number }>;
              insumos += (d.costoInsumos ?? 0) * item.cantidad;
              servicios += (cargos[0]?.monto ?? 0) * item.cantidad;
              manoObra += (cargos[1]?.monto ?? 0) * item.cantidad;
              utilidad += (cargos[2]?.monto ?? 0) * item.cantidad;
            }
          }

          await finDs
            .createRegistro({
              ordenId: ord.id,
              ordenNumero: ord.numero,
              clienteNombre: ord.clienteNombre ?? null,
              fechaVenta: new Date().toISOString().slice(0, 10),
              totalVenta: ord.total,
              insumos: Math.round(insumos * 100) / 100,
              servicios: Math.round(servicios * 100) / 100,
              manoDeObra: Math.round(manoObra * 100) / 100,
              utilidad: Math.round(utilidad * 100) / 100,
              comision: null,
            })
            .catch(console.error);
        }
      }

      // ── Enviar email de confirmación al cliente cuando entra en proceso ────
      if (body.status === "en_proceso" && process.env.RESEND_API_KEY) {
        try {
          const { data: cliente } = await getSupabaseAdmin()
            .from("clientes")
            .select("email, nombre")
            .eq("id", ord.clienteId)
            .maybeSingle();

          if (cliente?.email) {
            const { Resend } = await import("resend");
            const resend = new Resend(process.env.RESEND_API_KEY);

            const html = buildOrdenClienteHtml({
              tipo: "orden",
              numero: ord.numero,
              clienteNombre: ord.clienteNombre ?? cliente.nombre ?? "—",
              clienteEmail: cliente.email,
              fechaCreacion: ord.createdAt,
              fechaEntrega: ord.fechaEntrega,
              items: ord.items.map((item) => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.subtotal,
              })),
              subtotal: ord.subtotal,
              descuentoTotal: ord.descuentoTotal,
              total: ord.total,
              cupones: ord.cupones.map((c) => ({
                codigo: c.codigo,
                montoDescontado: c.montoDescontado,
              })),
              notas: ord.notas,
            });

            await resend.emails.send({
              from: "Hey Cookie <hola@heycookie.mx>",
              to: cliente.email,
              subject: `✅ Tu orden #${ord.numero} está en proceso — Hey Cookie`,
              html,
            });
          }
        } catch (err) {
          console.error("[orden:email]", err);
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
