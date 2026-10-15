// PATCH /api/public/mis-datos/[token] — el cliente actualiza sus propios datos.
// Pública (sin sesión): el token aleatorio del enlace es la única llave. Solo acepta
// la lista blanca de campos de validarDatosCliente; nunca devuelve el uuid.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ipDe, limitar } from "@/core/helpers/rateLimit";
import { notificarTelegram } from "@/core/helpers/telegram";
import { ClienteRepositoryImpl } from "@/modules/admin/store/data/repositories/Cliente.repository.impl";
import { ClienteEnlaceEdicionRepositoryImpl } from "@/modules/admin/store/data/repositories/ClienteEnlaceEdicion.repository.impl";
import { ActualizarDatosPorTokenUseCase } from "@/modules/admin/store/domain/usecases/ClienteEnlaceEdicion.usecase";
import { EnlaceEdicionError } from "@/modules/admin/store/domain/entities/ClienteEnlaceEdicion.entity";

interface Params { params: Promise<{ token: string }> }

const MAX_BODY_BYTES = 4_000;

export async function PATCH(req: NextRequest, { params }: Params) {
  const sinCache = { "Cache-Control": "no-store" };

  if (!limitar(`mis-datos:${ipDe(req.headers)}`, 20, 10 * 60 * 1000))
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429, headers: sinCache },
    );

  const raw = await req.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES)
    return NextResponse.json({ error: "Datos inválidos" }, { status: 413, headers: sinCache });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400, headers: sinCache });
  }

  try {
    const { token } = await params;
    const { datos, cambios, cliente } = await new ActualizarDatosPorTokenUseCase(
      new ClienteEnlaceEdicionRepositoryImpl(),
      new ClienteRepositoryImpl(),
    ).execute(token, body);

    if (cambios.length > 0) {
      const lineas = cambios.map((c) => `• ${c.campo}: ${c.antes ?? "—"} → ${c.despues ?? "—"}`);
      await notificarTelegram(
        `📝 ${cliente.nombre} actualizó sus datos desde su enlace\n\n${lineas.join("\n")}`,
      );
    }
    return NextResponse.json({ datos, cambios: cambios.length }, { headers: sinCache });
  } catch (e) {
    if (e instanceof EnlaceEdicionError)
      return NextResponse.json({ error: e.message }, { status: e.status, headers: sinCache });
    console.error("mis-datos PATCH", e);
    return NextResponse.json(
      { error: "No pudimos guardar tus datos. Intenta de nuevo." },
      { status: 500, headers: sinCache },
    );
  }
}
