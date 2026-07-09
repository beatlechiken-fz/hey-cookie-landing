// POST /api/public/auth/register — registro de nuevos clientes.
// Rate limiting: 5 intentos por IP por minuto.
// Crea registro en user_accounts (auth) y clientes (CRM).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import bcrypt from "bcryptjs";

// ── Rate limiter en memoria (por IP) ──────────────────────────────────────────
const rl = new Map<string, { count: number; resetAt: number }>();
const RL_MAX = 5;
const RL_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = rl.get(ip);
  if (!rec || now > rec.resetAt) {
    rl.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return true;
  }
  if (rec.count >= RL_MAX) return false;
  rec.count++;
  return true;
}

// ── Validaciones ──────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

export async function POST(req: NextRequest) {
  // Rate limit por IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento e inténtalo de nuevo." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const {
      nombre = "",
      email = "",
      telefono = "",
      password = "",
      recibirOfertas = false,
      _hp = "",
      _t = 0,
    } = body as Record<string, any>;

    // Honeypot: si el campo oculto tiene valor → bot (respuesta falsa para no revelar la defensa)
    if (_hp) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    // Timing: el formulario debe haberse abierto al menos 4 segundos antes
    if (typeof _t === "number" && Date.now() - _t < 4_000) {
      return NextResponse.json(
        { error: "Completa el formulario con calma e inténtalo de nuevo." },
        { status: 400 },
      );
    }

    // Validaciones básicas
    const errors: string[] = [];
    if (!nombre.trim() || nombre.trim().length < 2)
      errors.push("El nombre debe tener al menos 2 caracteres.");
    if (!EMAIL_RE.test(email.trim()))
      errors.push("El correo electrónico no es válido.");
    if (telefono && !PHONE_RE.test(telefono.trim()))
      errors.push("El número de teléfono no es válido.");
    if (!password || password.length < 8)
      errors.push("La contraseña debe tener al menos 8 caracteres.");

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const db = getSupabaseAdmin();
    const emailNorm = email.trim().toLowerCase();

    // Verificar si ya existe en user_accounts
    const { data: existing } = await db
      .from("user_accounts")
      .select("id")
      .eq("email", emailNorm)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico." },
        { status: 409 },
      );
    }

    // Hash de contraseña
    const password_hash = await bcrypt.hash(password, 12);

    // Crear user_account
    const { data: userAccount, error: uaError } = await db
      .from("user_accounts")
      .insert({
        email: emailNorm,
        name: nombre.trim(),
        password_hash,
      })
      .select("id")
      .single();

    if (uaError || !userAccount) {
      throw new Error(uaError?.message ?? "Error al crear la cuenta");
    }

    // Crear/actualizar registro en clientes
    const { data: clienteExistente } = await db
      .from("clientes")
      .select("id")
      .eq("email", emailNorm)
      .maybeSingle();

    if (!clienteExistente) {
      await db.from("clientes").insert({
        nombre: nombre.trim(),
        email: emailNorm,
        telefono: telefono.trim() || null,
        notas: recibirOfertas
          ? "Cliente registrado vía web. Acepta recibir ofertas y novedades."
          : "Cliente registrado vía web.",
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    console.error("[register]", e);
    return NextResponse.json(
      { error: "Error interno. Inténtalo más tarde." },
      { status: 500 },
    );
  }
}
