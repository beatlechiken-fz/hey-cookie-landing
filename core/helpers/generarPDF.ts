// src/modules/admin/pdf/generarPdf.ts

import type { Orden } from "@/modules/admin/store/domain/entities/Orden.entity";
import type { ComandaData } from "@/app/api/admin/ordenes/[id]/comanda/route";

const LOGO_B64 =
  "data:image/webp;base64,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";

// ── Shared interfaces ─────────────────────────────────────────────────────────
export interface OrdenPdfItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  detalles?: string[];
}

export interface OrdenPdfData {
  tipo: "cotizacion" | "orden";
  numero: number;
  clienteNombre: string;
  clienteEmail?: string | null;
  fechaCreacion: string;
  fechaEntrega?: string | null;
  direccionEntrega?: string | null;
  items: OrdenPdfItem[];
  subtotal: number;
  descuentoTotal: number;
  total: number;
  costoEnvio?: number;
  cupones?: { codigo: string; montoDescontado: number }[];
  notas?: string | null;
}

// ── CSS compartido (estilo user-side) ─────────────────────────────────────────
const USER_STYLE = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,'Times New Roman',serif;background:#fdf6f0;color:#3A1F14;padding:28px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .doc{max-width:640px;margin:0 auto;background:#fff;border-radius:20px;box-shadow:0 6px 32px rgba(192,96,122,0.10);overflow:hidden;border:1px solid #f5dce4}
  .hdr{background:#7b2d42;padding:26px 32px 20px;text-align:center}
  .brand{font-size:28px;font-weight:700;color:#fff;letter-spacing:-.5px;line-height:1}
  .brand span{color:#f9c0d0}
  .tagline{font-size:10px;color:rgba(255,255,255,0.55);letter-spacing:3px;text-transform:uppercase;font-family:sans-serif;margin-top:4px}
  .badge{display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:5px 18px;margin-top:12px;font-size:12px;color:#fff;font-family:sans-serif;font-weight:600}
  .chips{display:flex;gap:10px;flex-wrap:wrap;padding:18px 28px 0}
  .chip{background:#fdf6f0;border:1.5px solid #f0e0d0;border-radius:12px;padding:9px 14px;flex:1;min-width:90px}
  .chip-l{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#b07a8a;font-family:sans-serif;font-weight:600;margin-bottom:3px}
  .chip-v{font-size:13px;font-weight:700;color:#3A1F14}
  .body{padding:18px 28px 28px}
  .sec-lbl{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#b07a8a;font-family:sans-serif;font-weight:600;margin-bottom:8px;margin-top:18px}
  table{width:100%;border-collapse:collapse}
  th{padding:7px 0;border-bottom:2px solid #f0e0d0;color:#b07a8a;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:.5px;text-align:left;font-family:sans-serif}
  th.ct{text-align:center}th.rt{text-align:right}
  td{padding:9px 0;border-bottom:1px solid #fdf0e8;font-size:13px;vertical-align:top}
  td.ct{text-align:center;color:#AA6A42}td.rt{text-align:right}td.rt-b{text-align:right;font-weight:600;color:#7b2d42}
  .det{font-size:11px;color:#AA6A42;font-family:sans-serif;margin-top:3px;line-height:1.6}
  .tots-wrap{display:flex;justify-content:flex-end;margin-top:14px}
  .tots{background:#fdf6f0;border:1.5px solid #f0e0d0;border-radius:14px;padding:14px 20px;min-width:210px;font-family:sans-serif}
  .tot-r{display:flex;justify-content:space-between;padding:3px 0;font-size:13px;color:#AA6A42}
  .tot-d{color:#27ae60}
  .tot-f{display:flex;justify-content:space-between;padding:10px 0 0;font-weight:700;font-size:18px;color:#3A1F14;border-top:2px solid #f0e0d0;margin-top:8px}
  .cpns{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
  .cpn{display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:5px 10px;font-size:12px;font-family:sans-serif;color:#166534;font-weight:600}
  .nota{background:#fffbf0;border:1.5px solid #f0e0d0;border-left:4px solid #DA6C94;border-radius:10px;padding:12px 16px;font-size:12px;color:#7b2d42;line-height:1.7;margin-top:4px}
  .notice{border-radius:10px;padding:12px 16px;font-size:12px;line-height:1.7;margin-top:16px}
  .notice.ok{background:#f0fdf4;border:1.5px solid #bbf7d0;border-left:4px solid #22c55e;color:#166534}
  .notice.vg{background:#fffbf0;border:1.5px solid #fde68a;border-left:4px solid #f59e0b;color:#7a5c30}
  .ftr{background:#fdf6f0;border-top:1.5px solid #f0e0d0;padding:13px 28px;text-align:center;font-size:11px;color:#b07a8a;font-family:sans-serif;line-height:1.8}
  @media print{body{padding:10px;background:#fff}@page{margin:.8cm}}
`;

// ── Shared HTML builder (cliente) ─────────────────────────────────────────────
export function buildOrdenClienteHtml(data: OrdenPdfData): string {
  const esCot = data.tipo === "cotizacion";
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit", month: "long", year: "numeric",
    });

  const chips: { icon: string; label: string; val: string }[] = [
    { icon: "📅", label: "Fecha", val: fmt(data.fechaCreacion) },
    { icon: "👤", label: "Cliente", val: data.clienteNombre },
  ];
  if (data.fechaEntrega)
    chips.push({
      icon: "🎂",
      label: "Entrega",
      val: new Date(data.fechaEntrega).toLocaleDateString("es-MX", {
        day: "2-digit", month: "short", year: "numeric",
      }),
    });
  if (data.direccionEntrega)
    chips.push({ icon: "📍", label: "Domicilio", val: data.direccionEntrega });

  const chipsHtml = chips
    .map(
      (c) =>
        `<div class="chip"><div class="chip-l">${c.icon} ${c.label}</div><div class="chip-v">${c.val}</div></div>`,
    )
    .join("");

  const rows = data.items
    .map(
      (item) =>
        `<tr>
      <td><div style="font-weight:600">${item.nombre}</div>${
        item.detalles?.length
          ? `<div class="det">${item.detalles.map((d) => `· ${d}`).join("<br>")}</div>`
          : ""
      }</td>
      <td class="ct">${item.cantidad}</td>
      <td class="rt">$${item.precioUnitario.toFixed(2)}</td>
      <td class="rt-b">$${item.subtotal.toFixed(2)}</td>
    </tr>`,
    )
    .join("");

  const cuponesHtml = data.cupones?.length
    ? `<div class="sec-lbl">🏷️ Cupones aplicados</div>
      <div class="cpns">${data.cupones
        .map(
          (c) =>
            `<div class="cpn">${c.codigo} <span style="color:#4ade80">−$${c.montoDescontado.toFixed(2)}</span></div>`,
        )
        .join("")}</div>`
    : "";

  const notasHtml = data.notas
    ? `<div class="sec-lbl">📝 Notas</div><div class="nota">${data.notas}</div>`
    : "";

  let noticeHtml: string;
  if (esCot) {
    const v = new Date(data.fechaCreacion);
    v.setDate(v.getDate() + 7);
    const fv = v.toLocaleDateString("es-MX", {
      day: "2-digit", month: "long", year: "numeric",
    });
    noticeHtml = `<div class="notice vg">⏳ <strong>Cotización válida 7 días</strong> — vence el <strong>${fv}</strong>.<br>Para confirmar tu pedido escríbenos en <strong>heycookie.mx</strong> o por WhatsApp.</div>`;
  } else {
    noticeHtml = `<div class="notice ok">✅ <strong>Orden confirmada.</strong> Cualquier modificación debe coordinarse con nuestro equipo. ¡Gracias por elegir Hey Cookie! 🍪</div>`;
  }

  const totalFinal = data.total + (data.costoEnvio ?? 0);
  const totsHtml = `<div class="tots-wrap"><div class="tots">
    <div class="tot-r"><span>Subtotal</span><span>$${data.subtotal.toFixed(2)}</span></div>
    ${data.descuentoTotal > 0 ? `<div class="tot-r tot-d"><span>Descuento</span><span>−$${data.descuentoTotal.toFixed(2)}</span></div>` : ""}
    ${data.costoEnvio && data.costoEnvio > 0 ? `<div class="tot-r"><span>Envío</span><span>+$${data.costoEnvio.toFixed(2)}</span></div>` : ""}
    <div class="tot-f"><span>Total</span><span>$${totalFinal.toFixed(2)}</span></div>
  </div></div>`;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<title>${esCot ? "Cotización" : "Orden"} #${data.numero} — Hey Cookie</title>
<style>${USER_STYLE}</style></head>
<body><div class="doc">
  <div class="hdr">
    <div class="brand">Hey <span>Cookie</span></div>
    <div class="tagline">Repostería artesanal</div>
    <div class="badge">${esCot ? "Cotización" : "Orden de Pedido"} #${data.numero}</div>
  </div>
  <div class="chips">${chipsHtml}</div>
  <div class="body">
    <div class="sec-lbl">🎂 Productos</div>
    <table><thead><tr>
      <th>Producto</th><th class="ct">Cant.</th><th class="rt">Precio</th><th class="rt">Total</th>
    </tr></thead><tbody>${rows}</tbody></table>
    ${cuponesHtml}
    ${totsHtml}
    ${notasHtml}
    ${noticeHtml}
  </div>
  <div class="ftr">🌐 heycookie.mx &nbsp;|&nbsp; 📸 @heycookie.mrl<br>${esCot ? "Cotización emitida el " : "Orden emitida el "}${fmt(data.fechaCreacion)}</div>
</div></body></html>`;
}

// ── Color tokens (comanda) — actualizados a paleta rose/pink ──────────────────
const C = {
  cream: "#fdf6f0",
  pink: "#DA6C94",
  darkpink: "#7b2d42",
  maroon: "#3A1F14",
  border: "#f0e0d0",
  softpink: "#fce4ec",
  text: "#6B3E26",
  muted: "#b07a8a",
  white: "#ffffff",
  gold: "#AA6A42",
  coffeLight: "#fdf6f0",
  coffeeDark: "#7b2d42",
};

// ── Estilos base (compartidos, sin rosas) ────────────────────────────────────
const BASE_STYLE = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    background: #f5ede8;
    padding: 14px;
    color: ${C.maroon};
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .doc {
    max-width: 700px;
    margin: 0 auto;
    background: ${C.white};
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(80,30,10,0.13);
    overflow: hidden;
  }
  .sec-title {
    font-size: 10px; font-weight: 800;
    color: ${C.coffeeDark};
    text-transform: uppercase;
    letter-spacing: 1.8px;
    margin-bottom: 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .sec-box {
    border: 1.5px solid #e0cfc0;
    border-radius: 14px;
    overflow: hidden;
    background: ${C.white};
  }
  table { width: 100%; border-collapse: collapse; }
  th {
    background: ${C.coffeLight};
    padding: 9px 14px;
    text-align: left;
    font-size: 10px; font-weight: 700;
    color: ${C.coffeeDark};
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }
  th.right  { text-align: right; }
  th.center { text-align: center; }
  td { padding: 10px 14px; font-size: 13px; color: ${C.maroon}; vertical-align: top; }
  tr:nth-child(even) td { background: #fdf8f4; }
  td.right  { text-align: right; font-weight: 700; color: ${C.darkpink}; }
  td.center { text-align: center; }
`;

// ── Header limpio (sin fondo de color) ─────────────────────────────────────
function header(titulo: string, subtitulo: string, esInterno = false): string {
  return `
  <div style="
    background: ${C.white};
    padding: 24px 32px 20px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 2px solid #e8d8cc;
  ">
    <div style="display:flex; align-items:center; gap:14px;">
      <div style="
        width:64px; height:64px;
        background: ${C.white};
        border-radius:50%;
        box-shadow: 0 2px 12px rgba(0,0,0,0.10);
        flex-shrink:0; overflow:hidden; padding:3px;
      ">
        <img src="${LOGO_B64}" alt="Hey Cookie"
          style="width:100%;height:100%;object-fit:contain;border-radius:50%;"/>
      </div>
      <div>
        <div style="
          font-size:24px; font-weight:900;
          color: ${C.coffeeDark};
          font-family: Georgia, serif;
          letter-spacing:-0.3px; line-height:1.1;
        ">Hey Cookie</div>
        <div style="
          font-size:10px; color:#9a7a5a;
          letter-spacing:3px; text-transform:uppercase;
          margin-top:3px; font-weight:600;
        ">Bake Lab</div>
      </div>
    </div>
    <div style="
      background: ${C.coffeLight};
      border: 1.5px solid #c9a46a;
      border-radius: 12px;
      padding: 10px 18px;
      text-align: right;
    ">
      <div style="font-size:17px; font-weight:800; color:${C.coffeeDark};">${titulo}</div>
      <div style="font-size:10px; color:#7a5c30; letter-spacing:2px; text-transform:uppercase; margin-top:3px;">
        ${esInterno ? "USO INTERNO" : subtitulo}
      </div>
    </div>
  </div>`;
}

// ── Footer limpio (sin degradado) ────────────────────────────────────────────
// ── Info chips ────────────────────────────────────────────────────────────────
function infoStrip(
  numero: number,
  createdAt: string,
  clienteNombre?: string | null,
  fechaEntrega?: string | null,
): string {
  type Chip = { icon: string; label: string; val: string };
  const chips: Chip[] = [
    { icon: "#️⃣", label: "Número", val: `${numero}` },
    {
      icon: "📅",
      label: "Fecha",
      val: new Date(createdAt).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    },
    ...(clienteNombre
      ? [{ icon: "👤", label: "Cliente", val: clienteNombre }]
      : []),
    ...(fechaEntrega
      ? [
          {
            icon: "🎂",
            label: "Entrega",
            val: new Date(fechaEntrega).toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "short",
            }),
          },
        ]
      : []),
  ];
  const html = chips
    .map(
      (c) => `
    <div style="
      background:${C.white}; border:1.5px solid #e0cfc0;
      border-radius:12px; padding:9px 14px; min-width:100px;
    ">
      <div style="font-size:10px;color:${C.muted};font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px;">${c.icon} ${c.label}</div>
      <div style="font-size:14px;font-weight:700;color:${C.coffeeDark};">${c.val}</div>
    </div>`,
    )
    .join("");
  return `<div style="display:flex;gap:10px;flex-wrap:wrap;padding:20px 32px 0;">${html}</div>`;
}

// ── Sección con caja ──────────────────────────────────────────────────────────
function sec(emoji: string, titulo: string, content: string): string {
  return `
  <div style="margin:18px 32px 0;">
    <div class="sec-title"><span>${emoji}</span>${titulo}</div>
    <div class="sec-box">${content}</div>
  </div>`;
}

// ── Catálogo de nombres (para cotización/orden) ───────────────────────────────
interface CatNames {
  coberturas?: Record<string, string>;
  sabores?: Record<string, string>;
  jarabes?: Record<string, string>;
  saboresJarabe?: Record<string, string>;
  toppings?: Record<string, string>;
  licores?: Record<string, string>;
  empaques?: Record<string, string>;
}

async function fetchCatNames(): Promise<CatNames> {
  try {
    const res = await fetch("/api/admin/pastel-config");
    if (!res.ok) return {};
    const data = await res.json();
    const toMap = (arr: { id: string; nombre: string }[]) =>
      Object.fromEntries((arr ?? []).map((x: any) => [x.id, x.nombre]));
    return {
      coberturas: toMap(data.coberturas ?? []),
      sabores: toMap(data.saboresCobertura ?? []),
      jarabes: toMap(data.jarabes ?? []),
      saboresJarabe: toMap(data.saboresJarabe ?? []),
      toppings: Object.fromEntries(
        (data.toppings ?? []).map((t: any) => [t.ingredienteId, t.nombre]),
      ),
      licores: Object.fromEntries(
        (data.licores ?? []).map((l: any) => [l.ingredienteId, l.nombre]),
      ),
      empaques: toMap(data.empaques ?? []),
    };
  } catch {
    return {};
  }
}

// ── HTML wrapper ──────────────────────────────────────────────────────────────
function wrap(head: string, body: string, foot?: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <style>${BASE_STYLE}</style></head>
  <body><div class="doc">${head}${body}${foot ?? ""}</div></body></html>`;
}

// ── BUILD Cotización/Orden ────────────────────────────────────────────────────
export async function buildCotizacionHtml(orden: Orden, costoEnvio?: number): Promise<string> {
  const esCot = orden.status === "cotizacion";
  const cn = await fetchCatNames();

  const items: OrdenPdfItem[] = orden.items.map((item) => {
    const conf = ((item.configuracion ?? {}) as Record<string, unknown>);
    const opc = (conf.opciones ?? conf) as Record<string, unknown>;
    const detalles: string[] = [];

    if (typeof conf.diametroCm === "number") {
      const personas = Math.max(1, Math.round(18 * Math.pow(conf.diametroCm / 24, 2)));
      detalles.push(`Para ${personas} personas`);
    }
    if (typeof conf.tamanoFijoId === "string") {
      const label = conf.tamanoFijoId
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
      detalles.push(label === "Individual" ? "Individual" : `Tamaño: ${label}`);
    }

    const cobNom = opc.coberturaId ? cn.coberturas?.[opc.coberturaId as string] : null;
    const sabCob = opc.saborCoberturaId ? cn.sabores?.[opc.saborCoberturaId as string] : null;
    if (cobNom) detalles.push(`Cobertura: ${cobNom}${sabCob ? ` — sabor ${sabCob}` : ""}`);

    const relNom = opc.rellenoId ? cn.coberturas?.[opc.rellenoId as string] : null;
    const sabRel = opc.saborRellenoId ? cn.sabores?.[opc.saborRellenoId as string] : null;
    if (relNom) detalles.push(`Relleno: ${relNom}${sabRel ? ` — sabor ${sabRel}` : ""}`);

    const jarNom = opc.jarabeId ? cn.jarabes?.[opc.jarabeId as string] : null;
    const sabJar = opc.saborJarabeId ? cn.saboresJarabe?.[opc.saborJarabeId as string] : null;
    if (jarNom) detalles.push(`Jarabe: ${jarNom}${sabJar ? ` — sabor ${sabJar}` : ""}`);

    const tops = ((opc.toppingIds ?? []) as string[])
      .filter((t) => t !== "ninguno")
      .map((t) => cn.toppings?.[t])
      .filter(Boolean) as string[];
    if (tops.length) detalles.push(`Toppings: ${tops.join(", ")}`);

    const licNom =
      opc.licorId && opc.licorId !== "ninguno"
        ? cn.licores?.[opc.licorId as string]
        : null;
    if (licNom) detalles.push(`Licor: ${licNom}`);

    const emps = ((opc.empaqueIds ?? []) as string[])
      .filter((e) => e !== "ninguno")
      .map((e) => cn.empaques?.[e])
      .filter(Boolean) as string[];
    if (emps.length) detalles.push(`Empaque: ${emps.join(", ")}`);

    return {
      nombre: item.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
      detalles,
    };
  });

  return buildOrdenClienteHtml({
    tipo: esCot ? "cotizacion" : "orden",
    numero: orden.numero,
    clienteNombre: orden.clienteNombre ?? "—",
    fechaCreacion: orden.createdAt,
    fechaEntrega: orden.fechaEntrega,
    direccionEntrega: orden.direccionEntrega,
    items,
    subtotal: orden.subtotal,
    descuentoTotal: orden.descuentoTotal,
    total: orden.total,
    costoEnvio,
    cupones: orden.cupones.map((c) => ({
      codigo: c.codigo,
      montoDescontado: c.montoDescontado,
    })),
    notas: orden.notas,
  });
}

// ── Comanda: tabla de ingredientes ────────────────────────────────────────────
function ingTable(
  ings: { nombre: string; cantidad: number; unidad: string }[],
): string {
  if (!ings.length)
    return `<div style="padding:12px 16px;font-size:13px;color:${C.muted};font-style:italic;">Sin ingredientes registrados.</div>`;
  const rows = ings
    .map(
      (ing) => `<tr>
    <td>${ing.nombre}</td>
    <td class="right">
      <strong>${ing.cantidad % 1 === 0 ? ing.cantidad : ing.cantidad.toFixed(2)}</strong>
      <span style="color:${C.muted};font-size:11px;font-weight:400;margin-left:3px;">${ing.unidad}</span>
    </td>
  </tr>`,
    )
    .join("");
  return `<table>
    <thead><tr><th>Ingrediente</th><th class="right">Cantidad</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function procBlock(texto: string | null | undefined): string {
  if (!texto) return "";
  return `<div style="background:${C.coffeLight};border-top:1.5px solid #e0cfc0;padding:12px 16px;">
    <div style="font-size:10px;font-weight:800;color:${C.coffeeDark};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;">Procedimiento</div>
    <div style="font-size:12px;color:${C.text};line-height:1.8;">${texto}</div>
  </div>`;
}

function notaBlock(nota: string | null | undefined): string {
  if (!nota) return "";
  return `<div style="padding:8px 14px;font-size:12px;color:#7a5c30;background:${C.coffeLight};border-bottom:1px solid #e0cfc0;font-style:italic;">📌 ${nota}</div>`;
}

// ── BUILD Comanda ─────────────────────────────────────────────────────────────
export function buildComandaHtml(data: ComandaData): string {
  const EMOJIS: Record<string, string> = {
    "Receta Base": "🥚",
    Bizcocho: "🎂",
    Cobertura: "🍦",
    Relleno: "🍮",
    Jarabe: "🍯",
    Toppings: "✨",
    Licor: "🥃",
    Empaques: "📦",
  };
  const getEmoji = (t: string) => {
    for (const [k, e] of Object.entries(EMOJIS)) if (t.startsWith(k)) return e;
    return "🔸";
  };

  const pedidoRows = data.items
    .map(
      (item) => `<tr>
    <td style="font-weight:700;">${item.nombre}</td>
    <td class="center">${item.cantidad}</td>
  </tr>`,
    )
    .join("");

  const itemsSections = data.items
    .map((item) => {
      // Solo mostrar secciones que tengan ingredientes
      const seccionesHtml = item.secciones
        .filter((s) => s.ingredientes.length > 0)
        .map(
          (s) => `
        <div style="margin-bottom:14px;">
          ${sec(
            getEmoji(s.titulo),
            s.titulo,
            `${s.nota ? notaBlock(s.nota) : ""}${ingTable(s.ingredientes)}${procBlock(s.procedimiento)}`,
          )}
        </div>`,
        )
        .join("");

      if (!seccionesHtml) return "";

      return `
    <div style="margin:18px 32px 0;">
      <div style="
        background:${C.coffeeDark};
        border-radius:12px; padding:10px 16px; margin-bottom:14px;
        display:flex; align-items:center; justify-content:space-between;
      ">
        <div style="font-weight:800;font-size:15px;color:${C.white};">🍰 ${item.nombre}</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.6);">
          ${item.cantidad} unidad${item.cantidad !== 1 ? "es" : ""}
          ${item.diametroCm ? ` · ⌀ ${item.diametroCm}cm · factor ${item.factorVolumen?.toFixed(3)}` : ""}
        </div>
      </div>
      ${seccionesHtml}
    </div>`;
    })
    .join("");

  const body = `
    ${infoStrip(data.numero, data.createdAt, data.clienteNombre, data.fechaEntrega)}
    ${sec(
      "📋",
      "Resumen del Pedido",
      `<table>
      <thead><tr><th>Producto</th><th class="center">Cant.</th></tr></thead>
      <tbody>${pedidoRows}</tbody>
    </table>`,
    )}
    ${itemsSections}
    <div style="height:24px;"></div>
  `;

  return wrap(header("Comanda de Producción", "", true), body);
}

// ── Cargar html2pdf.js ────────────────────────────────────────────────────────
async function loadHtml2Pdf(): Promise<any> {
  if ((window as any).html2pdf) return (window as any).html2pdf;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    s.onload = () => resolve((window as any).html2pdf);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── Descarga ──────────────────────────────────────────────────────────────────
export async function descargarPdf(
  html: string,
  filename: string,
): Promise<void> {
  const html2pdf = await loadHtml2Pdf();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.style.cssText = "position:absolute;left:-9999px;top:0;";
  document.body.appendChild(wrapper);
  try {
    await html2pdf()
      .set({
        margin: 6,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2.5,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#f5ede8",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(wrapper.querySelector(".doc") ?? wrapper)
      .save();
  } finally {
    document.body.removeChild(wrapper);
  }
}

// ── Funciones públicas ────────────────────────────────────────────────────────
export async function generarCotizacionPdf(orden: Orden, costoEnvio?: number): Promise<void> {
  const tipo = orden.status === "cotizacion" ? "cotizacion" : "orden";
  const html = await buildCotizacionHtml(orden, costoEnvio);
  await descargarPdf(
    html,
    `heycookie_${tipo}_${orden.numero}_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

export async function generarComandaPdf(
  ordenId: string,
  ordenNumero: number,
): Promise<void> {
  const res = await fetch(`/api/admin/ordenes/${ordenId}/comanda`);
  if (!res.ok)
    throw new Error(`Error al obtener datos de comanda: ${res.statusText}`);
  const data: ComandaData = await res.json();
  const html = buildComandaHtml(data);
  await descargarPdf(
    html,
    `heycookie_comanda_${ordenNumero}_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
