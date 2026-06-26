// src/modules/admin/pdf/generarPdf.ts

import type { Orden } from "@/modules/admin/store/domain/entities/Orden.entity";
import type { ComandaData } from "@/app/api/admin/ordenes/[id]/comanda/route";

const LOGO_B64 =
  "data:image/webp;base64,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";

const C = {
  cream: "#fdf6f0",
  pink: "#c0607a",
  darkpink: "#7b2d42",
  maroon: "#3d1a24",
  border: "#f5dce4",
  softpink: "#fce4ec",
  text: "#5a2030",
  muted: "#9a6070",
  white: "#ffffff",
  gold: "#c9921a",
  coffeLight: "#f5e6d0",
  coffeeDark: "#2c1a0e",
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
function footer(texto: string): string {
  return `
  <div style="
    background: ${C.coffeLight};
    border-top: 2px solid #e8d8cc;
    padding: 14px 32px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 8px;
  ">
    <div style="display:flex; gap:18px; flex-wrap:wrap;">
      <span style="color:#7a5c30; font-size:11px; font-weight:600;">🌐 heycookie.mx</span>
      <span style="color:#7a5c30; font-size:11px; font-weight:600;">📸 @heycookie.mrl</span>
    </div>
    <div style="font-size:10px; color:#9a7a5a; text-align:right;">${texto}</div>
  </div>`;
}

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

// ── Tabla de productos (cotización/orden) ────────────────────────────────────
function productosTable(items: Orden["items"], cn: CatNames): string {
  const rows = items
    .map((item) => {
      const conf = (item.configuracion ?? {}) as Record<string, any>;
      const opc = conf.opciones ?? conf;
      const details: string[] = [];

      if (conf.diametroCm) {
        // Para el cliente: mostrar personas en vez de diámetro
        const personas = Math.max(
          1,
          Math.round(18 * Math.pow(conf.diametroCm / 24, 2)),
        );
        details.push(`Para ${personas} personas`);
      }
      if (conf.tamanoFijoId) {
        // El id del tamaño fijo ya es legible (ej. "vaso_grande", "individual")
        // Convertir snake_case a palabras con primera letra mayúscula
        const label = conf.tamanoFijoId
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase());
        details.push(
          label === "Individual" ? "Individual" : `Tamaño: ${label}`,
        );
      }

      const cobNom = opc.coberturaId ? cn.coberturas?.[opc.coberturaId] : null;
      const sabCob = opc.saborCoberturaId
        ? cn.sabores?.[opc.saborCoberturaId]
        : null;
      if (cobNom)
        details.push(
          `Cobertura: ${cobNom}${sabCob ? ` — sabor ${sabCob}` : ""}`,
        );

      const relNom = opc.rellenoId ? cn.coberturas?.[opc.rellenoId] : null;
      const sabRel = opc.saborRellenoId
        ? cn.sabores?.[opc.saborRellenoId]
        : null;
      if (relNom)
        details.push(`Relleno: ${relNom}${sabRel ? ` — sabor ${sabRel}` : ""}`);

      const jarNom = opc.jarabeId ? cn.jarabes?.[opc.jarabeId] : null;
      const sabJar = opc.saborJarabeId
        ? cn.saboresJarabe?.[opc.saborJarabeId]
        : null;
      if (jarNom)
        details.push(`Jarabe: ${jarNom}${sabJar ? ` — sabor ${sabJar}` : ""}`);

      const tops = (opc.toppingIds ?? [])
        .filter((t: string) => t !== "ninguno")
        .map((t: string) => cn.toppings?.[t])
        .filter(Boolean);
      if (tops.length) details.push(`Toppings: ${tops.join(", ")}`);

      const licNom =
        opc.licorId && opc.licorId !== "ninguno"
          ? cn.licores?.[opc.licorId]
          : null;
      if (licNom) details.push(`Licor: ${licNom}`);

      const emps = (opc.empaqueIds ?? [])
        .filter((e: string) => e !== "ninguno")
        .map((e: string) => cn.empaques?.[e])
        .filter(Boolean);
      if (emps.length) details.push(`Empaque: ${emps.join(", ")}`);

      return `<tr>
      <td>
        <div style="font-weight:700;font-size:14px;color:${C.coffeeDark};">${item.nombre}</div>
        ${
          details.length
            ? `<div style="margin-top:6px;">${details
                .map(
                  (d) => `
          <div style="font-size:12px;color:${C.text};line-height:1.7;padding:1px 0;">· ${d}</div>`,
                )
                .join("")}
        </div>`
            : ""
        }
      </td>
      <td class="center" style="white-space:nowrap;">${item.cantidad}</td>
      <td class="right" style="color:${C.muted};font-weight:500;white-space:nowrap;">$${item.precioUnitario.toFixed(2)}</td>
      <td class="right" style="color:${C.darkpink};font-size:15px;white-space:nowrap;">$${item.subtotal.toFixed(2)}</td>
    </tr>`;
    })
    .join("");

  return `<table>
    <thead><tr>
      <th>Producto</th>
      <th class="center">Cant.</th>
      <th class="right">P. Unit.</th>
      <th class="right">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ── Totales ───────────────────────────────────────────────────────────────────
function totales(orden: Orden): string {
  return `
  <div style="display:flex;justify-content:flex-end;margin:16px 32px 0;">
    <div style="
      background:${C.coffeLight}; border:1.5px solid #ddb87a;
      border-radius:16px; padding:16px 22px; min-width:220px;
    ">
      ${
        orden.descuentoTotal > 0
          ? `
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px;">
        <span style="color:${C.muted};">Subtotal</span>
        <span style="color:${C.maroon};">$${orden.subtotal.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:10px;color:#2e7d32;">
        <span>Descuento</span><span>− $${orden.descuentoTotal.toFixed(2)}</span>
      </div>
      <div style="border-top:1.5px solid #e0cfc0;margin-bottom:10px;"></div>`
          : ""
      }
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:15px;font-weight:700;color:${C.coffeeDark};">Total</span>
        <span style="font-size:24px;font-weight:900;color:${C.darkpink};">$${orden.total.toFixed(2)}</span>
      </div>
    </div>
  </div>`;
}

// ── Vigencia ──────────────────────────────────────────────────────────────────
function vigencia(orden: Orden, esCot: boolean): string {
  if (esCot) {
    const v = new Date(orden.createdAt);
    v.setDate(v.getDate() + 7);
    const fv = v.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return `
    <div style="margin:16px 32px 22px;padding:12px 16px;
      background:${C.white};border:1.5px solid #e0cfc0;border-left:4px solid ${C.gold};
      border-radius:12px;font-size:12px;color:${C.text};line-height:1.7;">
      ⏳ <strong style="color:${C.coffeeDark};">Cotización válida 7 días</strong> — vence el
      <strong style="color:${C.coffeeDark};">${fv}</strong>.
      Para confirmar tu pedido escríbenos en <strong style="color:${C.darkpink};">heycookie.mx</strong> o WhatsApp.
    </div>`;
  }
  return `
  <div style="margin:16px 32px 22px;padding:12px 16px;
    background:#f0fdf4;border:1.5px solid #bbf7d0;border-left:4px solid #22c55e;
    border-radius:12px;font-size:12px;color:#166534;line-height:1.7;">
    ✅ <strong>Orden confirmada.</strong> Cualquier modificación debe coordinarse con nuestro equipo. ¡Gracias por elegir Hey Cookie! 🍪
  </div>`;
}

// ── HTML wrapper ──────────────────────────────────────────────────────────────
function wrap(head: string, body: string, foot?: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <style>${BASE_STYLE}</style></head>
  <body><div class="doc">${head}${body}${foot ?? ""}</div></body></html>`;
}

// ── BUILD Cotización/Orden ────────────────────────────────────────────────────
export async function buildCotizacionHtml(orden: Orden): Promise<string> {
  const esCot = orden.status === "cotizacion";
  const cn = await fetchCatNames();
  const fechaEmision = new Date(orden.createdAt).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const body = `
    ${infoStrip(orden.numero, orden.createdAt, orden.clienteNombre, orden.fechaEntrega)}
    ${sec("🎂", "Productos", productosTable(orden.items, cn))}
    ${
      orden.cupones.length
        ? sec(
            "🏷️",
            "Cupones Aplicados",
            `<table>
      <thead><tr><th>Código</th><th class="right">Descuento</th></tr></thead>
      <tbody>${orden.cupones
        .map(
          (c) => `<tr>
        <td style="font-weight:600;">${c.codigo}</td>
        <td class="right" style="color:#2e7d32;">− $${c.montoDescontado.toFixed(2)}</td>
      </tr>`,
        )
        .join("")}</tbody>
    </table>`,
          )
        : ""
    }
    ${totales(orden)}
    ${orden.notas ? sec("📝", "Notas", `<div style="padding:14px 16px;font-size:13px;color:${C.text};line-height:1.7;">${orden.notas}</div>`) : ""}
    ${vigencia(orden, esCot)}
  `;

  return wrap(
    header(
      esCot ? "Cotización" : "Orden de Pedido",
      esCot ? "DOCUMENTO OFICIAL" : "ORDEN CONFIRMADA",
    ),
    body,
    footer(
      esCot
        ? `Cotización emitida el ${fechaEmision}`
        : `Orden emitida el ${fechaEmision}`,
    ),
  );
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
export async function generarCotizacionPdf(orden: Orden): Promise<void> {
  const tipo = orden.status === "cotizacion" ? "cotizacion" : "orden";
  const html = await buildCotizacionHtml(orden);
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
