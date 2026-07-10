// PATCH /api/user/cambiar-password — cambia contraseña y limpia el flag must_change_password.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { getUserSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";

export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { password } = await req.json();
  if (!password || password.length < 8)
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 },
    );

  const db = getSupabaseAdmin();
  const password_hash = await bcrypt.hash(password, 12);

  const { error } = await db
    .from("user_accounts")
    .update({ password_hash, must_change_password: false })
    .eq("id", (session.user as any).id);

  if (error)
    return NextResponse.json(
      { error: "No se pudo actualizar la contraseña." },
      { status: 500 },
    );

  return NextResponse.json({ ok: true });
}
