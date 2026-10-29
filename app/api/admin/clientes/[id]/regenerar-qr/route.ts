// POST /api/admin/clientes/[id]/regenerar-qr
// Invalida el QR actual del cliente (ej. por fuga) y genera uno nuevo.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { id } = await params;
    const { data, error } = await getSupabaseAdmin().rpc(
      "regenerar_qr_token",
      { p_cliente_id: id },
    );
    if (error) throw new Error(error.message);
    return NextResponse.json({ qrToken: data as string });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
