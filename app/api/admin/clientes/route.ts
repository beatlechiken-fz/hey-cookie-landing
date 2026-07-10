// src/app/api/admin/clientes/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import { ClienteRepositoryImpl } from "@/modules/admin/store/data/repositories/Cliente.repository.impl";
import {
  GetClientesUseCase,
  CreateClienteUseCase,
} from "@/modules/admin/store/domain/usecases/Cliente.usecase";

// ── Contraseña temporal segura (sin caracteres ambiguos) ─────────────────────
function generarPasswordTemporal(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(12))
    .map((b) => chars[b % chars.length])
    .join("");
}

// ── Email de bienvenida ───────────────────────────────────────────────────────
function buildBienvenidaEmail(nombre: string, email: string, password: string): string {
  const loginUrl = `${process.env.NEXTAUTH_URL ?? "https://heycookie.mx"}/es/user/login`;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bienvenid@ a Hey Cookie</title></head>
<body style="margin:0;padding:0;background:#fdf6f0;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #f0e0d0;box-shadow:0 4px 24px rgba(192,96,122,.08)">

  <div style="background:#7b2d42;padding:28px 32px 22px;text-align:center">
    <div style="font-size:26px;font-weight:700;color:#fff;letter-spacing:-.5px">Hey <span style="color:#f9c0d0">Cookie</span></div>
    <div style="font-size:10px;color:rgba(255,255,255,.5);letter-spacing:3px;text-transform:uppercase;margin-top:4px">Repostería artesanal</div>
  </div>

  <div style="padding:28px 32px">
    <p style="font-size:20px;font-weight:700;color:#3A1F14;margin:0 0 8px">¡Bienvenid@, ${nombre}! 🍪</p>
    <p style="font-size:14px;color:#6B3E26;line-height:1.7;margin:0 0 20px">
      Tu cuenta en Hey Cookie ha sido creada. A partir de ahora puedes consultar tus pedidos, historial y más.
      Usa las siguientes credenciales para iniciar sesión:
    </p>

    <div style="background:#fdf6f0;border:1.5px solid #f0e0d0;border-radius:12px;padding:18px 20px;margin-bottom:20px">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#b07a8a;font-family:sans-serif;font-weight:600;margin-bottom:10px">Tus credenciales</div>
      <div style="font-size:13px;color:#3A1F14;margin-bottom:6px"><span style="color:#b07a8a">Correo:</span> <strong>${email}</strong></div>
      <div style="font-size:13px;color:#3A1F14">
        <span style="color:#b07a8a">Contraseña temporal:</span>
        <code style="display:inline-block;margin-top:6px;background:#f5dce4;padding:6px 14px;border-radius:8px;font-size:17px;font-family:monospace;color:#7b2d42;letter-spacing:3px;font-weight:700">${password}</code>
      </div>
    </div>

    <div style="background:#fff8f0;border:1.5px solid #f0e0d0;border-left:4px solid #DA6C94;border-radius:10px;padding:12px 16px;font-size:12px;color:#7b2d42;line-height:1.7;margin-bottom:24px">
      🔒 <strong>Importante:</strong> al iniciar sesión se te pedirá que cambies esta contraseña por una propia. Elige una que solo tú conozcas.
    </div>

    <a href="${loginUrl}" style="display:inline-block;background:#c0607a;color:#fff;padding:13px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;font-family:sans-serif">
      Iniciar sesión →
    </a>
  </div>

  <div style="background:#fdf6f0;border-top:1.5px solid #f0e0d0;padding:14px 32px;text-align:center;font-size:11px;color:#b07a8a;font-family:sans-serif;line-height:1.8">
    🌐 heycookie.mx &nbsp;|&nbsp; 📸 @heycookie.mrl<br>
    Si no solicitaste esta cuenta, ignora este mensaje.
  </div>

</div>
</body></html>`;
}

export async function GET(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const { searchParams } = req.nextUrl;
    const result = await new GetClientesUseCase(
      new ClienteRepositoryImpl(),
    ).execute({
      search: searchParams.get("search") ?? undefined,
      activo: searchParams.get("activo") !== "false",
      page: Number(searchParams.get("page") ?? 1),
      pageSize: Number(searchParams.get("pageSize") ?? 20),
    });
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession()))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const dto = await req.json();
    const db = getSupabaseAdmin();

    // Crear el registro en la tabla clientes
    const cliente = await new CreateClienteUseCase(
      new ClienteRepositoryImpl(),
    ).execute(dto);

    // Si tiene email → crear/vincular cuenta de acceso
    if (dto.email?.trim()) {
      const emailNorm = dto.email.trim().toLowerCase();

      Promise.resolve()
        .then(async () => {
          // Verificar si ya existe una cuenta para ese email
          const { data: existing } = await db
            .from("user_accounts")
            .select("id")
            .eq("email", emailNorm)
            .maybeSingle();

          if (existing) {
            // Ya tiene cuenta → solo vincular auth_user_id si aún no está
            await db
              .from("clientes")
              .update({ auth_user_id: existing.id })
              .eq("id", cliente.id);
            return; // no enviar email, ya tiene cuenta propia
          }

          // Crear nueva cuenta con contraseña temporal
          const tempPassword = generarPasswordTemporal();
          const password_hash = await bcrypt.hash(tempPassword, 12);

          const { data: newUser, error: uaError } = await db
            .from("user_accounts")
            .insert({
              email: emailNorm,
              name: dto.nombre.trim(),
              password_hash,
              must_change_password: true,
            })
            .select("id")
            .single();

          if (uaError || !newUser) {
            console.error("[clientes:crear-cuenta]", uaError);
            return;
          }

          // Vincular auth_user_id en clientes
          await db
            .from("clientes")
            .update({ auth_user_id: newUser.id })
            .eq("id", cliente.id);

          // Enviar email de bienvenida
          if (process.env.RESEND_API_KEY) {
            const { Resend } = await import("resend");
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: "Hey Cookie <hola@heycookie.mx>",
              to: emailNorm,
              subject: "¡Tu cuenta en Hey Cookie está lista! 🍪",
              html: buildBienvenidaEmail(dto.nombre.trim(), emailNorm, tempPassword),
            });
          }
        })
        .catch((err) => console.error("[clientes:post:cuenta]", err));
    }

    return NextResponse.json(cliente, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
