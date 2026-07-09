// POST /api/user/ordenes — crea una orden desde el carrito público.
// Protegida por proxy: requiere token.role === "user".

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserSession } from "@/core/helpers/auth";
import { getSupabaseAdmin } from "@/core/helpers/supabase";
import { Resend } from "resend";
import type { CartItem } from "@/modules/admin/store/presentation/hooks/useCartStore";
import type { OrdenCuponAplicado } from "@/modules/admin/store/domain/entities/Orden.entity";

// ── Telegram ────────────────────────────────────────────────────────────────

async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  }).catch(() => null);
}

function buildTelegramMsg(
  numero: number,
  clienteNombre: string,
  clienteEmail: string,
  items: CartItem[],
  subtotal: number,
  descuentoTotal: number,
  total: number,
): string {
  const fecha = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const lista = items
    .map((i) => `• ${i.cantidad}× ${i.nombre} — $${(i.precioUnitario * i.cantidad).toFixed(0)}`)
    .join("\n");

  return [
    `🍪 *Nueva orden \\#${numero} — Hey Cookie*`,
    "",
    `👤 *Cliente:* ${clienteNombre}`,
    `📧 *Email:* ${clienteEmail}`,
    "",
    `🛒 *Productos:*`,
    lista,
    "",
    `─────────────────`,
    `💰 Subtotal: $${subtotal.toFixed(0)}`,
    descuentoTotal > 0 ? `🏷️ Descuento: \\-$${descuentoTotal.toFixed(0)}` : null,
    `💳 *TOTAL: $${total.toFixed(0)}*`,
    `─────────────────`,
    `📅 ${fecha}`,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

// ── Email ────────────────────────────────────────────────────────────────────

function buildItemsRows(items: CartItem[]): string {
  return items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f9f0ec;color:#3A1F14;">${i.nombre}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f9f0ec;text-align:center;color:#AA6A42;">${i.cantidad}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f9f0ec;text-align:right;color:#3A1F14;">$${i.precioUnitario.toFixed(0)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f9f0ec;text-align:right;font-weight:600;color:#3A1F14;">$${(i.precioUnitario * i.cantidad).toFixed(0)}</td>
      </tr>`,
    )
    .join("");
}

function emailBase(body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf6f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6f0;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f5dce4;">
        <tr>
          <td style="background:#7b2d42;padding:24px 32px;text-align:center;">
            <span style="font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Hey <span style="color:#f9c0d0;">Cookie</span></span>
          </td>
        </tr>
        <tr><td style="padding:28px 32px;">${body}</td></tr>
        <tr>
          <td style="padding:16px 32px;text-align:center;border-top:1px solid #f0e0d0;">
            <span style="font-size:11px;color:#b07a8a;font-family:sans-serif;">Hey Cookie — Repostería artesanal</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildAdminEmail(
  numero: number,
  clienteNombre: string,
  clienteEmail: string,
  items: CartItem[],
  subtotal: number,
  descuentoTotal: number,
  total: number,
): string {
  const fecha = new Date().toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "long",
    timeStyle: "short",
  });

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;color:#7b2d42;">Nueva orden #${numero}</h2>
    <p style="margin:0 0 20px;font-size:13px;color:#b07a8a;font-family:sans-serif;">${fecha}</p>

    <table style="width:100%;margin-bottom:20px;font-size:13px;font-family:sans-serif;background:#fdf6f0;border-radius:8px;overflow:hidden;">
      <tr>
        <td style="padding:10px 14px;"><strong style="color:#7b2d42;">Cliente</strong></td>
        <td style="padding:10px 14px;color:#3A1F14;">${clienteNombre}</td>
      </tr>
      <tr style="background:#f9eff4;">
        <td style="padding:10px 14px;"><strong style="color:#7b2d42;">Email</strong></td>
        <td style="padding:10px 14px;color:#3A1F14;">${clienteEmail}</td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;font-family:sans-serif;">
      <thead>
        <tr style="border-bottom:2px solid #f0e0d0;">
          <th style="padding:6px 0;text-align:left;color:#b07a8a;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:.5px;">Producto</th>
          <th style="padding:6px 0;text-align:center;color:#b07a8a;font-weight:600;text-transform:uppercase;font-size:11px;">Cant.</th>
          <th style="padding:6px 0;text-align:right;color:#b07a8a;font-weight:600;text-transform:uppercase;font-size:11px;">Precio</th>
          <th style="padding:6px 0;text-align:right;color:#b07a8a;font-weight:600;text-transform:uppercase;font-size:11px;">Total</th>
        </tr>
      </thead>
      <tbody>${buildItemsRows(items)}</tbody>
    </table>

    <table style="width:100%;margin-top:16px;font-size:13px;font-family:sans-serif;">
      <tr><td style="padding:4px 0;color:#AA6A42;">Subtotal</td><td style="text-align:right;color:#AA6A42;">$${subtotal.toFixed(0)}</td></tr>
      ${descuentoTotal > 0 ? `<tr><td style="padding:4px 0;color:#27ae60;">Descuento</td><td style="text-align:right;color:#27ae60;">-$${descuentoTotal.toFixed(0)}</td></tr>` : ""}
      <tr style="border-top:2px solid #f0e0d0;">
        <td style="padding:10px 0 0;font-weight:700;font-size:15px;color:#3A1F14;">TOTAL</td>
        <td style="padding:10px 0 0;text-align:right;font-weight:700;font-size:15px;color:#3A1F14;">$${total.toFixed(0)}</td>
      </tr>
    </table>`;

  return emailBase(body);
}

function buildClienteEmail(
  numero: number,
  clienteNombre: string,
  items: CartItem[],
  descuentoTotal: number,
  total: number,
): string {
  const primerNombre = clienteNombre.split(" ")[0];

  const body = `
    <p style="font-size:22px;color:#7b2d42;margin:0 0 6px;">¡Orden registrada! 🎉</p>
    <p style="font-size:14px;color:#AA6A42;font-family:sans-serif;margin:0 0 20px;">
      Hola <strong>${primerNombre}</strong>, hemos recibido tu pedido. En breve nos ponemos en contacto contigo para coordinar los detalles.
    </p>

    <div style="background:#fdf6f0;border-radius:10px;padding:14px 18px;margin-bottom:20px;font-family:sans-serif;font-size:13px;">
      <span style="color:#b07a8a;text-transform:uppercase;letter-spacing:.5px;font-size:11px;">Número de orden</span><br>
      <span style="font-size:28px;font-weight:700;color:#7b2d42;">#${numero}</span>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;font-family:sans-serif;margin-bottom:8px;">
      <thead>
        <tr style="border-bottom:1px solid #f0e0d0;">
          <th style="padding:6px 0;text-align:left;color:#b07a8a;font-weight:600;text-transform:uppercase;font-size:11px;">Producto</th>
          <th style="padding:6px 0;text-align:center;color:#b07a8a;font-weight:600;text-transform:uppercase;font-size:11px;">Cant.</th>
          <th style="padding:6px 0;text-align:right;color:#b07a8a;font-weight:600;text-transform:uppercase;font-size:11px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (i) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f9f0ec;color:#3A1F14;">${i.nombre}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f9f0ec;text-align:center;color:#AA6A42;">${i.cantidad}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f9f0ec;text-align:right;font-weight:600;color:#3A1F14;">$${(i.precioUnitario * i.cantidad).toFixed(0)}</td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>

    <table style="width:100%;margin-top:12px;font-size:13px;font-family:sans-serif;">
      ${descuentoTotal > 0 ? `<tr><td style="padding:3px 0;color:#27ae60;">Descuento aplicado</td><td style="text-align:right;color:#27ae60;">-$${descuentoTotal.toFixed(0)}</td></tr>` : ""}
      <tr style="border-top:1px solid #f0e0d0;">
        <td style="padding:10px 0 0;font-weight:700;font-size:15px;color:#3A1F14;">Total</td>
        <td style="padding:10px 0 0;text-align:right;font-weight:700;font-size:15px;color:#3A1F14;">$${total.toFixed(0)}</td>
      </tr>
    </table>

    <p style="font-size:13px;color:#AA6A42;font-family:sans-serif;margin:24px 0 0;text-align:center;">
      ¡Gracias por elegir Hey Cookie! 🍪
    </p>`;

  return emailBase(body);
}

// ── GET — lista las órdenes del usuario autenticado ─────────────────────────

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = getSupabaseAdmin();
    const userEmail = session.user.email ?? "";

    const { data: cliente } = await db
      .from("clientes")
      .select("id")
      .eq("email", userEmail)
      .maybeSingle();

    if (!cliente) return NextResponse.json({ ordenes: [] });

    const { data: ordenes, error } = await db
      .from("ordenes")
      .select("id, numero, status, subtotal, descuento_total, total, cliente_nombre, fecha_entrega, created_at")
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    if (!ordenes?.length) return NextResponse.json({ ordenes: [] });

    const ids = ordenes.map((o: any) => o.id);
    const { data: items } = await db
      .from("orden_items")
      .select("orden_id, nombre, cantidad, precio_unitario, subtotal")
      .in("orden_id", ids);

    const itemsMap: Record<string, any[]> = {};
    for (const item of items ?? []) {
      (itemsMap[item.orden_id] ??= []).push(item);
    }

    return NextResponse.json({
      ordenes: ordenes.map((o: any) => ({
        id: o.id,
        numero: Number(o.numero),
        status: o.status,
        subtotal: Number(o.subtotal),
        descuentoTotal: Number(o.descuento_total),
        total: Number(o.total),
        clienteNombre: o.cliente_nombre ?? session.user.name ?? "Cliente",
        fechaEntrega: o.fecha_entrega ?? null,
        createdAt: o.created_at,
        items: (itemsMap[o.id] ?? []).map((i: any) => ({
          nombre: i.nombre,
          cantidad: Number(i.cantidad),
          precioUnitario: Number(i.precio_unitario),
          subtotal: Number(i.subtotal),
        })),
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// ── POST — crea una orden desde el carrito público ───────────────────────────

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { items, cupones, subtotal, descuentoTotal, total } = (await req.json()) as {
      items: CartItem[];
      cupones: OrdenCuponAplicado[];
      subtotal: number;
      descuentoTotal: number;
      total: number;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
    }

    const db = getSupabaseAdmin();
    const userEmail = session.user.email ?? "";

    // Buscar o crear el cliente vinculado por email
    let { data: cliente } = await db
      .from("clientes")
      .select("id, nombre")
      .eq("email", userEmail)
      .maybeSingle();

    if (!cliente) {
      const { data: nuevo } = await db
        .from("clientes")
        .insert({ nombre: session.user.name ?? "Cliente", email: userEmail })
        .select("id, nombre")
        .single();
      cliente = nuevo;
    }

    const clienteNombre = cliente?.nombre ?? session.user.name ?? "Cliente";

    // Calcular siguiente número de orden
    const { data: ultimaOrden } = await db
      .from("ordenes")
      .select("numero")
      .order("numero", { ascending: false })
      .limit(1)
      .maybeSingle();

    const numero = (ultimaOrden?.numero ?? 0) + 1;

    // Crear la orden
    const { data: orden, error: ordenError } = await db
      .from("ordenes")
      .insert({
        numero,
        cliente_id: cliente?.id ?? null,
        cliente_nombre: clienteNombre,
        status: "cotizacion",
        subtotal: Math.round(subtotal * 100) / 100,
        descuento_total: Math.round(descuentoTotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        notas: `Orden generada por cliente: ${userEmail}`,
      })
      .select("id, numero")
      .single();

    if (ordenError || !orden) {
      throw new Error(ordenError?.message ?? "Error al crear la orden");
    }

    // Crear los items de la orden
    const ordenItems = items.map((item) => ({
      orden_id: orden.id,
      tipo: (item.configuracion as any)?.tipo ?? "cookie",
      nombre: item.nombre,
      configuracion: item.configuracion,
      cantidad: item.cantidad,
      costo_unitario: 0,
      precio_unitario: item.precioUnitario,
      subtotal: item.precioUnitario * item.cantidad,
      desglose_costos: item.desgloseCostos ?? null,
    }));

    const { error: itemsError } = await db.from("orden_items").insert(ordenItems);
    if (itemsError) throw new Error(itemsError.message);

    // Registrar cupones globales en la orden
    if (cupones.length > 0) {
      const cuponesRows = cupones.map((c) => ({
        orden_id: orden.id,
        cupon_id: c.cuponId,
        codigo: c.codigo,
        tipo_descuento: c.tipoDescuento,
        valor: c.valor,
        monto_descontado: c.montoDescontado,
      }));
      await db.from("orden_cupones").insert(cuponesRows).then(() => null);
    }

    // ── Notificaciones (fire-and-forget) ────────────────────────────────────
    const telegramMsg = buildTelegramMsg(numero, clienteNombre, userEmail, items, subtotal, descuentoTotal, total);
    const chatId1 = process.env.TELEGRAM_CHAT_ID ?? "";
    const chatId2 = process.env.TELEGRAM_CHAT_ID_2 ?? "";

    const fromEmail = process.env.RESEND_FROM_EMAIL;

    Promise.allSettled([
      sendTelegram(chatId1, telegramMsg),
      chatId2 ? sendTelegram(chatId2, telegramMsg) : Promise.resolve(),
      fromEmail
        ? new Resend(process.env.RESEND_API_KEY).emails.send({
            from: fromEmail,
            to: ["heycookie.mrl@gmail.com"],
            subject: `🍪 Nueva orden #${numero} — Hey Cookie`,
            html: buildAdminEmail(numero, clienteNombre, userEmail, items, subtotal, descuentoTotal, total),
          })
        : Promise.resolve(),
      fromEmail && userEmail
        ? new Resend(process.env.RESEND_API_KEY).emails.send({
            from: fromEmail,
            to: [userEmail],
            subject: `¡Tu orden #${numero} está registrada! 🍪`,
            html: buildClienteEmail(numero, clienteNombre, items, descuentoTotal, total),
          })
        : Promise.resolve(),
    ]).catch(() => null);

    return NextResponse.json({ ordenId: orden.id, numero: orden.numero });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
