"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { OptionCard } from "./OptionCard";
import { useCartStore } from "@/modules/admin/store/presentation/hooks/useCartStore";
import { calcularCostoPastel } from "@/modules/admin/store/domain/usecases/CalcularCostoPastel.usecase";
import {
  personasDesdeDiametro,
  diametroDesdePersonas,
} from "@/modules/admin/store/domain/entities/PastelMedida.entity";
import {
  CONFIGURACION_VACIA,
  type PastelConfiguracion,
  type HumedadJarabe,
} from "@/modules/admin/store/domain/entities/PastelPersonalizado.entity";
import {
  FACTOR_GELATINA_POR_LITRO,
  findCostoGelatina,
  type CategoriaGelatina,
} from "@/modules/admin/store/domain/entities/GelatinaCotizador.entity";
import type { ConfigPersonalizadoCatalogo } from "@/app/api/public/config-personalizado/route";
import type { OrdenCuponAplicado } from "@/modules/admin/store/domain/entities/Orden.entity";

// ── Constants ────────────────────────────────────────────────────────────────

const COSTO_ENVIO = 30;

const STEPS_PASTEL = [
  "Datos", "Tipo", "Bizcocho", "Cobertura", "Relleno",
  "Jarabe", "Toppings", "Licor", "Notas", "Resumen",
];
const STEPS_GELATINA = [
  "Datos", "Tipo", "Bases", "Cobertura", "Jarabe", "Toppings", "Notas", "Resumen",
];
const CARGO_DECORACION = 50;
const CARGO_EMPAQUE    = 30;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_FOTO_BYTES = 5 * 1024 * 1024;

// ── Types ────────────────────────────────────────────────────────────────────

type TipoProducto = "pastel" | "gelatina";

interface DatosCliente {
  nombre: string;
  telefono: string;
  direccion: string;
}

interface GelatinaCustomConfig {
  categoria: CategoriaGelatina;
  litrosAgua: number;
  litrosLeche: number;
  litrosTresLeches: number;
  litrosQuesoCrema: number;
  litrosYogurt: number;
  coberturaId: string | null;
  saborCoberturaId: string | null;
  jarabeId: string | null;
  saborJarabeId: string | null;
  toppingIds: string[];
  notas: string;
}

const GELATINA_VACIA: GelatinaCustomConfig = {
  categoria: "clasica",
  litrosAgua: 1,
  litrosLeche: 0,
  litrosTresLeches: 0,
  litrosQuesoCrema: 0,
  litrosYogurt: 0,
  coberturaId: null,
  saborCoberturaId: null,
  jarabeId: null,
  saborJarabeId: null,
  toppingIds: [],
  notas: "",
};

// ── Pricing ──────────────────────────────────────────────────────────────────

function calcPrecioGelatina(
  gCfg: GelatinaCustomConfig,
  catalogo: ConfigPersonalizadoCatalogo,
): number {
  const { categoria } = gCfg;
  const totalLitros =
    gCfg.litrosAgua + gCfg.litrosLeche + gCfg.litrosTresLeches + gCfg.litrosQuesoCrema + gCfg.litrosYogurt;
  if (totalLitros <= 0) return 0;

  const costoBase =
    gCfg.litrosAgua       * findCostoGelatina(catalogo.gelatinas, categoria, "agua") +
    gCfg.litrosLeche      * findCostoGelatina(catalogo.gelatinas, categoria, "leche") +
    gCfg.litrosTresLeches * findCostoGelatina(catalogo.gelatinas, "clasica", "tres_leches") +
    gCfg.litrosQuesoCrema * findCostoGelatina(catalogo.gelatinas, categoria, "queso_crema") +
    gCfg.litrosYogurt     * findCostoGelatina(catalogo.gelatinas, categoria, "yogurt");

  const factor = totalLitros * FACTOR_GELATINA_POR_LITRO;

  const cob = catalogo.coberturas.find((c) => c.id === gCfg.coberturaId);
  const saborCob = catalogo.saboresCobertura.find((s) => s.id === gCfg.saborCoberturaId);
  const jar = catalogo.jarabes.find((j) => j.id === gCfg.jarabeId);
  const saborJar = catalogo.saboresJarabe.find((s) => s.id === gCfg.saborJarabeId);

  const costoCobertura = cob ? cob.costoTotal * factor : 0;
  const costoSaborCob = saborCob?.precio ?? 0;
  const costoJarabe = jar ? jar.costoTotal * factor : 0;
  const costoSaborJar = saborJar?.precio ?? 0;

  const costoToppings = gCfg.toppingIds.reduce((sum, tid) => {
    const t = catalogo.toppings.find((x) => x.ingredienteId === tid);
    return sum + (t && t.cantidad != null && t.costoUnidadMinima != null
      ? t.cantidad * t.costoUnidadMinima * factor : 0);
  }, 0);

  const costoInsumos =
    costoBase + costoCobertura + costoSaborCob + costoJarabe + costoSaborJar + costoToppings;

  const baseEstructural = costoBase + costoCobertura + costoSaborCob;
  const baseConJarabe = baseEstructural + costoJarabe + costoSaborJar;

  return (
    costoInsumos +
    baseEstructural * 0.1 +
    Math.max(60, baseEstructural * 0.25) +
    baseConJarabe * 0.9 +
    CARGO_DECORACION
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Timeline({ steps, current }: { steps: string[]; current: number }) {
  const prev = current > 0 ? steps[current - 1] : null;
  const curr = steps[current];
  const next = current < steps.length - 1 ? steps[current + 1] : null;

  return (
    <div className="flex items-center justify-center gap-8 mb-6">
      {[prev, curr, next].map((label, i) => {
        const isCenter = i === 1;
        if (!label) return <div key={i} className="w-16" />;
        return (
          <div key={i} className={`text-center transition-all ${isCenter ? "opacity-100" : "opacity-30"}`}>
            {isCenter && (
              <div className="flex justify-center mb-1">
                <div className="w-2 h-2 rounded-full bg-[#AA6A42]" />
              </div>
            )}
            <span className={`text-sm font-semibold ${isCenter ? "text-[#AA6A42]" : "text-[#6B3E26]/60"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Siguiente",
  backDisabled,
  nextDisabled,
  loading,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex gap-3 mt-8">
      <button
        type="button"
        onClick={onBack}
        disabled={backDisabled}
        className="flex-1 py-3 rounded-2xl border-2 border-[#AA6A42] text-[#AA6A42] font-semibold hover:bg-[#AA6A42]/10 transition disabled:opacity-40"
      >
        Atrás
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex-1 py-3 rounded-2xl bg-[#AA6A42] text-white font-semibold hover:bg-[#8B5635] transition disabled:opacity-40"
      >
        {loading ? "Cargando..." : nextLabel}
      </button>
    </div>
  );
}

function LiquidInput({
  label,
  litros,
  saborId,
  onLitros,
  onSabor,
  sabores,
}: {
  label: string;
  litros: number;
  saborId: string;
  onLitros: (v: number) => void;
  onSabor: (v: string) => void;
  sabores: { id: string; nombre: string }[];
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#f0e0d0]">
      <p className="font-semibold text-[#3A1F14] text-sm mb-3">{label}</p>
      <div className="flex gap-3">
        <div className="w-28">
          <label className="text-xs text-[#6B3E26]/60 mb-1 block">Litros</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={litros}
            onChange={(e) => onLitros(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full border border-[#e0c9b0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#AA6A42]"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-[#6B3E26]/60 mb-1 block">Sabor</label>
          <select
            value={saborId}
            onChange={(e) => onSabor(e.target.value)}
            className="w-full border border-[#e0c9b0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#AA6A42] bg-white"
          >
            <option value="">Sin sabor adicional</option>
            {sabores.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold text-[#3A1F14] mb-4">{children}</h2>;
}

// Responsive card grid for image options
function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {children}
    </div>
  );
}

// Sabor grid (no images, more compact)
function SaborGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {children}
    </div>
  );
}

// ── Success banner ───────────────────────────────────────────────────────────

function SuccessBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mb-8 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-8 text-center shadow-sm">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
          <svg viewBox="0 0 24 24" className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      </div>
      <h2 className="text-xl font-bold text-green-800 mb-2">
        ¡Tu producto ha sido agregado al carrito!
      </h2>
      <p className="text-green-700 text-sm leading-relaxed max-w-sm mx-auto">
        Si deseas puedes agregar más productos o proceder a generar tu pedido accediendo
        a tu carrito en la parte superior derecha del sitio.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-5 px-6 py-2 rounded-full border border-green-300 text-green-700 text-sm font-medium hover:bg-green-100 transition"
      >
        Agregar otro producto
      </button>
    </div>
  );
}

// ── Resumen step ─────────────────────────────────────────────────────────────

function ResumenStep({
  rows,
  fotoUrl,
  precioBase,
  descuento,
  total,
  cuponInput,
  cuponError,
  cuponAplicado,
  validandoCupon,
  onCuponInput,
  onValidarCupon,
  onQuitarCupon,
  onBack,
  onAddToCart,
}: {
  rows: { label: string; value: string }[];
  fotoUrl: string | null;
  precioBase: number;
  descuento: number;
  total: number;
  cuponInput: string;
  cuponError: string;
  cuponAplicado: OrdenCuponAplicado | null;
  validandoCupon: boolean;
  onCuponInput: (v: string) => void;
  onValidarCupon: () => void;
  onQuitarCupon: () => void;
  onBack: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div>
      <SectionTitle>Resumen del pedido</SectionTitle>

      <div className="bg-white rounded-2xl border border-[#f0e0d0] divide-y divide-[#f0e0d0] mb-5">
        {rows.map((r) => (
          <div key={r.label} className="flex gap-3 px-4 py-3 text-sm">
            <span className="text-[#6B3E26]/60 min-w-[90px] shrink-0">{r.label}</span>
            <span className="text-[#3A1F14] font-medium flex-1">{r.value}</span>
          </div>
        ))}
      </div>

      {fotoUrl && (
        <div className="mb-5">
          <p className="text-xs text-[#6B3E26]/60 mb-2">Imagen de referencia</p>
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-[#f0e0d0]">
            <Image src={fotoUrl} alt="Referencia" fill className="object-cover" unoptimized />
          </div>
        </div>
      )}

      {/* Coupon */}
      <div className="mb-5">
        {cuponAplicado ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <span className="text-green-700 text-sm font-medium flex-1">
              Cupón &quot;{cuponAplicado.codigo}&quot; aplicado
            </span>
            <button type="button" onClick={onQuitarCupon} className="text-green-600 hover:text-red-500 text-xs">
              Quitar
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={cuponInput}
              onChange={(e) => onCuponInput(e.target.value.toUpperCase())}
              placeholder="Código de cupón"
              className="flex-1 border border-[#e0c9b0] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#AA6A42]"
            />
            <button
              type="button"
              onClick={onValidarCupon}
              disabled={validandoCupon || !cuponInput.trim()}
              className="px-4 py-2.5 rounded-2xl bg-[#AA6A42]/10 text-[#AA6A42] text-sm font-medium hover:bg-[#AA6A42]/20 transition disabled:opacity-40"
            >
              {validandoCupon ? "..." : "Aplicar"}
            </button>
          </div>
        )}
        {cuponError && <p className="text-red-500 text-xs mt-1 ml-1">{cuponError}</p>}
      </div>

      {/* Totals */}
      <div className="bg-white rounded-2xl border border-[#f0e0d0] p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm text-[#6B3E26]">
          <span>Subtotal</span>
          <span>${precioBase.toFixed(2)}</span>
        </div>
        {descuento > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Descuento</span>
            <span>−${descuento.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-[#6B3E26]">
          <span>Empaque</span>
          <span>${CARGO_EMPAQUE}.00</span>
        </div>
        <div className="flex justify-between text-sm text-[#6B3E26]">
          <span>Envío</span>
          <span>${COSTO_ENVIO}.00</span>
        </div>
        <div className="flex justify-between text-base font-bold text-[#3A1F14] pt-2 border-t border-[#f0e0d0]">
          <span>Total</span>
          <span>${(total + CARGO_EMPAQUE + COSTO_ENVIO).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-2xl border-2 border-[#AA6A42] text-[#AA6A42] font-semibold hover:bg-[#AA6A42]/10 transition"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={onAddToCart}
          className="flex-[2] py-3 rounded-2xl bg-[#AA6A42] text-white font-semibold hover:bg-[#8B5635] transition flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>Agregar al carrito</span>
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function CustomPipeline() {
  const { data: session } = useSession();
  const addItem = useCartStore((s) => s.addItem);

  const [catalogo, setCatalogo] = useState<ConfigPersonalizadoCatalogo | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState<TipoProducto>("pastel");
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [datos, setDatos] = useState<DatosCliente>({ nombre: "", telefono: "", direccion: "" });
  const [personas, setPersonas] = useState(18);
  const [config, setConfig] = useState<PastelConfiguracion>({ ...CONFIGURACION_VACIA });
  const [gCfg, setGCfg] = useState<GelatinaCustomConfig>({ ...GELATINA_VACIA });
  const [notasPastel, setNotasPastel] = useState("");

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoRef, setFotoRef] = useState<string | null>(null);
  const [fotoError, setFotoError] = useState("");
  const [fotoUploading, setFotoUploading] = useState(false);

  const [cuponInput, setCuponInput] = useState("");
  const [cuponError, setCuponError] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<OrdenCuponAplicado | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);

  const steps = tipo === "pastel" ? STEPS_PASTEL : STEPS_GELATINA;

  useEffect(() => {
    if (session?.user?.name) {
      setDatos((d) => ({ ...d, nombre: d.nombre || session.user?.name || "" }));
    }
  }, [session]);

  useEffect(() => {
    const dm = Math.round(diametroDesdePersonas(personas));
    setConfig((c) => ({ ...c, diametroCm: dm }));
  }, [personas]);

  useEffect(() => {
    fetch("/api/public/config-personalizado")
      .then((r) => r.json())
      .then(setCatalogo)
      .finally(() => setLoadingCatalog(false));
  }, []);

  useEffect(() => () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current); }, []);

  const resetForm = () => {
    setStep(0);
    setConfig({ ...CONFIGURACION_VACIA });
    setGCfg({ ...GELATINA_VACIA });
    setPersonas(18);
    setNotasPastel("");
    setFotoPreview(null);
    setFotoRef(null);
    setFotoError("");
    setCuponInput("");
    setCuponAplicado(null);
    setCuponError("");
  };

  const toggleTopping = (id: string) =>
    setConfig((c) => ({
      ...c,
      toppingIds: c.toppingIds.includes(id)
        ? c.toppingIds.filter((t) => t !== id)
        : [...c.toppingIds, id],
    }));

  const toggleToppingG = (id: string) =>
    setGCfg((c) => ({
      ...c,
      toppingIds: c.toppingIds.includes(id)
        ? c.toppingIds.filter((t) => t !== id)
        : [...c.toppingIds, id],
    }));

  const handleFotoRef = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFotoError("Solo se permiten imágenes (JPG, PNG, WEBP, GIF, HEIC)");
      return;
    }
    if (file.size > MAX_FOTO_BYTES) {
      setFotoError("La imagen no debe superar 5 MB");
      return;
    }

    setFotoError("");
    setFotoPreview(URL.createObjectURL(file));
    setFotoRef(null);
    setFotoUploading(true);

    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/public/upload-referencia", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setFotoError(data.error ?? "Error al subir la imagen");
        setFotoPreview(null);
        return;
      }
      setFotoRef(data.url);
    } catch {
      setFotoError("Error al subir la imagen");
      setFotoPreview(null);
    } finally {
      setFotoUploading(false);
    }
  };

  const validarCupon = async () => {
    if (!cuponInput.trim()) return;
    setValidandoCupon(true);
    setCuponError("");
    try {
      const res = await fetch(`/api/public/cupones/validar?codigo=${encodeURIComponent(cuponInput.trim())}`);
      const data = await res.json();
      if (!res.ok) { setCuponError(data.error || "Cupón inválido"); return; }
      setCuponAplicado({
        cuponId: data.cupon.id,
        codigo: data.cupon.codigo,
        tipoDescuento: data.cupon.tipo_descuento,
        valor: data.cupon.valor,
        montoDescontado: data.montoDescontado,
      });
    } catch {
      setCuponError("Error al validar el cupón");
    } finally {
      setValidandoCupon(false);
    }
  };

  // Pricing
  const desgloseP = catalogo ? calcularCostoPastel(config, catalogo) : null;
  const precioBase = tipo === "pastel"
    ? (desgloseP ? desgloseP.precioSugerido + CARGO_DECORACION : 0)
    : (catalogo ? calcPrecioGelatina(gCfg, catalogo) : 0);

  const descuento = cuponAplicado
    ? cuponAplicado.tipoDescuento === "porcentaje"
      ? precioBase * (cuponAplicado.valor / 100)
      : cuponAplicado.valor
    : 0;
  const total = Math.max(0, precioBase - descuento);

  const handleAddToCart = () => {
    const cuponesItem: OrdenCuponAplicado[] = cuponAplicado
      ? [{ ...cuponAplicado, montoDescontado: descuento }]
      : [];

    if (tipo === "pastel") {
      addItem({
        nombre: `Pastel personalizado (${personasDesdeDiametro(config.diametroCm)} personas)`,
        configuracion: { tipo: "pastel-custom", ...config, notas: notasPastel, fotoRef, datos },
        cantidad: 1,
        costoUnitario: desgloseP?.costoProduccionTotal ?? 0,
        precioUnitario: (desgloseP?.precioSugerido ?? 0) + CARGO_DECORACION + CARGO_EMPAQUE,
        desgloseCostos: {
          costoInsumos: desgloseP?.costoInsumos ?? 0,
          cargosAdicionales: desgloseP?.cargosAdicionales ?? [],
          costoProduccionTotal: desgloseP?.costoProduccionTotal ?? 0,
          precioSugerido: (desgloseP?.precioSugerido ?? 0) + CARGO_DECORACION + CARGO_EMPAQUE,
        },
        cuponesItem,
      });
    } else {
      const totalLitros = gCfg.litrosAgua + gCfg.litrosLeche + gCfg.litrosTresLeches + gCfg.litrosQuesoCrema + gCfg.litrosYogurt;
      const catLabel = gCfg.categoria === "clasica" ? "Clásica" : gCfg.categoria === "healthy" ? "Healthy" : "Sin Azúcar";
      addItem({
        nombre: `Gelatina ${catLabel} personalizada (${totalLitros}L)`,
        configuracion: { tipo: "gelatina-custom", ...gCfg, fotoRef, datos },
        cantidad: 1,
        costoUnitario: 0,
        precioUnitario: calcPrecioGelatina(gCfg, catalogo!) + CARGO_EMPAQUE,
        desgloseCostos: { costoInsumos: 0, cargosAdicionales: [], costoProduccionTotal: 0, precioSugerido: calcPrecioGelatina(gCfg, catalogo!) + CARGO_EMPAQUE },
        cuponesItem,
      });
    }

    resetForm();
    setAdded(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAdded(false), 10000);
  };

  // ── Foto upload section (shared pastel/gelatina) ───────────────────────────

  const fotoSection = (
    <div>
      <label className="text-xs text-[#6B3E26]/60 mb-1 block">Foto de referencia (opcional, máx 5 MB)</label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        onChange={handleFotoRef}
        className="block w-full text-sm text-[#6B3E26] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#AA6A42]/10 file:text-[#AA6A42] file:font-medium hover:file:bg-[#AA6A42]/20 cursor-pointer"
      />
      {fotoUploading && (
        <p className="text-xs text-[#AA6A42] mt-1 flex items-center gap-1">
          <span className="inline-block w-3 h-3 border-2 border-[#AA6A42]/30 border-t-[#AA6A42] rounded-full animate-spin" />
          Subiendo imagen...
        </p>
      )}
      {fotoError && <p className="text-red-500 text-xs mt-1">{fotoError}</p>}
      {fotoPreview && !fotoUploading && (
        <div className="mt-3 relative rounded-2xl overflow-hidden h-40 border border-[#f0e0d0]">
          <Image src={fotoPreview} alt="Vista previa" fill className="object-cover" unoptimized />
          {!fotoRef && !fotoUploading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center text-xs text-[#AA6A42]">
              Procesando...
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── Step renderer ─────────────────────────────────────────────────────────

  const renderStep = () => {
    if (loadingCatalog) {
      return (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#AA6A42]/30 border-t-[#AA6A42] rounded-full animate-spin" />
        </div>
      );
    }

    // Step 0 — Datos
    if (step === 0) {
      return (
        <div>
          <SectionTitle>Tus datos de contacto</SectionTitle>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#6B3E26]/60 mb-1 block">Nombre completo *</label>
              <input
                type="text"
                value={datos.nombre}
                onChange={(e) => setDatos((d) => ({ ...d, nombre: e.target.value }))}
                className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#AA6A42]"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B3E26]/60 mb-1 block">Teléfono</label>
              <input
                type="tel"
                value={datos.telefono}
                onChange={(e) => setDatos((d) => ({ ...d, telefono: e.target.value }))}
                className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#AA6A42]"
                placeholder="55 1234 5678"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B3E26]/60 mb-1 block">Dirección de entrega</label>
              <textarea
                value={datos.direccion}
                onChange={(e) => setDatos((d) => ({ ...d, direccion: e.target.value }))}
                rows={2}
                className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#AA6A42] resize-none"
                placeholder="Calle, número, colonia, ciudad"
              />
            </div>
          </div>
          <NavButtons
            onBack={() => {}}
            onNext={() => setStep(1)}
            backDisabled
            nextDisabled={!datos.nombre.trim()}
          />
        </div>
      );
    }

    // Step 1 — Tipo
    if (step === 1) {
      return (
        <div>
          <SectionTitle>¿Qué deseas ordenar?</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <OptionCard
              id="pastel"
              label="Pastel personalizado"
              description="Elige bizcocho, cobertura, relleno y más"
              selected={tipo === "pastel"}
              onClick={() => setTipo("pastel")}
            />
            <OptionCard
              id="gelatina"
              label="Gelatina personalizada"
              description="Escoge tus bases líquidas y sabores"
              selected={tipo === "gelatina"}
              onClick={() => setTipo("gelatina")}
            />
          </div>
          <NavButtons onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </div>
      );
    }

    // ── PASTEL ───────────────────────────────────────────────────────────────

    if (tipo === "pastel") {
      // Step 2 — Bizcocho + Personas
      if (step === 2) {
        return (
          <div>
            <SectionTitle>Número de personas y bizcocho</SectionTitle>
            <div className="mb-6">
              <label className="text-xs text-[#6B3E26]/60 mb-1 block">
                Número de personas — el diámetro será aprox. {config.diametroCm} cm
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={personas}
                onChange={(e) => setPersonas(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#AA6A42]"
              />
            </div>
            <p className="text-sm font-semibold text-[#3A1F14] mb-3">Elige tu bizcocho</p>
            <CardGrid>
              {catalogo?.bizcochos.map((b) => (
                <OptionCard
                  key={b.id}
                  id={b.id}
                  label={b.nombre}
                  image={b.imagenUrl ?? null}
                  selected={config.bizcochoId === b.id}
                  onClick={() => setConfig((c) => ({ ...c, bizcochoId: b.id }))}
                />
              ))}
            </CardGrid>
            <NavButtons
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextDisabled={!config.bizcochoId}
            />
          </div>
        );
      }

      // Step 3 — Cobertura + Sabor
      if (step === 3) {
        return (
          <div>
            <SectionTitle>Cobertura</SectionTitle>
            <CardGrid>
              {catalogo?.coberturas.map((c) => (
                <OptionCard
                  key={c.id}
                  id={c.id}
                  label={c.nombre}
                  image={c.imagenUrl ?? null}
                  selected={config.coberturaId === c.id}
                  onClick={() => setConfig((cfg) => ({ ...cfg, coberturaId: c.id, saborCoberturaId: null }))}
                />
              ))}
            </CardGrid>
            {config.coberturaId && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[#3A1F14] mb-3">Sabor de cobertura</p>
                <SaborGrid>
                  {catalogo?.saboresCobertura.map((s) => (
                    <OptionCard
                      key={s.id}
                      id={s.id}
                      label={s.nombre}
                      selected={config.saborCoberturaId === s.id}
                      onClick={() => setConfig((c) => ({ ...c, saborCoberturaId: s.id }))}
                    />
                  ))}
                </SaborGrid>
              </div>
            )}
            <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        );
      }

      // Step 4 — Relleno + Sabor
      if (step === 4) {
        return (
          <div>
            <SectionTitle>Relleno</SectionTitle>
            <CardGrid>
              {catalogo?.coberturas.map((c) => (
                <OptionCard
                  key={c.id}
                  id={c.id}
                  label={c.nombre}
                  image={c.imagenUrl ?? null}
                  selected={config.rellenoId === c.id}
                  onClick={() => setConfig((cfg) => ({ ...cfg, rellenoId: c.id, saborRellenoId: null }))}
                />
              ))}
            </CardGrid>
            {config.rellenoId && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[#3A1F14] mb-3">Sabor de relleno</p>
                <SaborGrid>
                  {catalogo?.saboresCobertura.map((s) => (
                    <OptionCard
                      key={s.id}
                      id={s.id}
                      label={s.nombre}
                      selected={config.saborRellenoId === s.id}
                      onClick={() => setConfig((c) => ({ ...c, saborRellenoId: s.id }))}
                    />
                  ))}
                </SaborGrid>
              </div>
            )}
            <NavButtons onBack={() => setStep(3)} onNext={() => setStep(5)} />
          </div>
        );
      }

      // Step 5 — Jarabe + Sabor + Humedad
      if (step === 5) {
        return (
          <div>
            <SectionTitle>Jarabe (opcional)</SectionTitle>
            <CardGrid>
              {catalogo?.jarabes.map((j) => (
                <OptionCard
                  key={j.id}
                  id={j.id}
                  label={j.nombre}
                  image={j.imagenUrl ?? null}
                  selected={config.jarabeId === j.id}
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      jarabeId: c.jarabeId === j.id ? null : j.id,
                      saborJarabeId: null,
                      humedadJarabe: c.jarabeId === j.id ? null : "semi_humedo",
                    }))
                  }
                />
              ))}
            </CardGrid>
            {config.jarabeId && (
              <>
                <div className="mt-5">
                  <p className="text-sm font-semibold text-[#3A1F14] mb-3">Sabor de jarabe</p>
                  <SaborGrid>
                    {catalogo?.saboresJarabe.map((s) => (
                      <OptionCard
                        key={s.id}
                        id={s.id}
                        label={s.nombre}
                        selected={config.saborJarabeId === s.id}
                        onClick={() => setConfig((c) => ({ ...c, saborJarabeId: s.id }))}
                      />
                    ))}
                  </SaborGrid>
                </div>
                <div className="mt-5 bg-white rounded-2xl p-4 border border-[#f0e0d0]">
                  <p className="text-sm font-semibold text-[#3A1F14] mb-3">Nivel de humedad</p>
                  <div className="flex gap-3">
                    {(["semi_humedo", "humedo"] as HumedadJarabe[]).map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setConfig((c) => ({ ...c, humedadJarabe: h }))}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                          config.humedadJarabe === h
                            ? "border-[#AA6A42] bg-[#AA6A42]/10 text-[#AA6A42]"
                            : "border-[#f0e0d0] text-[#6B3E26]"
                        }`}
                      >
                        {h === "semi_humedo" ? "Semi húmedo" : "Húmedo (×2.2)"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <NavButtons onBack={() => setStep(4)} onNext={() => setStep(6)} />
          </div>
        );
      }

      // Step 6 — Toppings
      if (step === 6) {
        return (
          <div>
            <SectionTitle>Toppings (opcional)</SectionTitle>
            <CardGrid>
              {catalogo?.toppings.map((t) => (
                <OptionCard
                  key={t.ingredienteId}
                  id={t.ingredienteId}
                  label={t.nombre}
                  image={t.imagenUrl ?? null}
                  selected={config.toppingIds.includes(t.ingredienteId)}
                  onClick={() => toggleTopping(t.ingredienteId)}
                />
              ))}
            </CardGrid>
            <NavButtons onBack={() => setStep(5)} onNext={() => setStep(7)} />
          </div>
        );
      }

      // Step 7 — Licor
      if (step === 7) {
        return (
          <div>
            <SectionTitle>Licor (opcional)</SectionTitle>
            <CardGrid>
              {catalogo?.licores.map((l) => (
                <OptionCard
                  key={l.ingredienteId}
                  id={l.ingredienteId}
                  label={l.nombre}
                  image={l.imagenUrl ?? null}
                  selected={config.licorId === l.ingredienteId}
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      licorId: c.licorId === l.ingredienteId ? null : l.ingredienteId,
                    }))
                  }
                />
              ))}
            </CardGrid>
            <NavButtons onBack={() => setStep(6)} onNext={() => setStep(8)} />
          </div>
        );
      }

      // Step 8 — Notas + Foto
      if (step === 8) {
        return (
          <div>
            <SectionTitle>Notas y referencia</SectionTitle>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#6B3E26]/60 mb-1 block">
                  Notas adicionales (decoración, inscripción, alergias, etc.)
                </label>
                <textarea
                  value={notasPastel}
                  onChange={(e) => setNotasPastel(e.target.value)}
                  rows={4}
                  className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#AA6A42] resize-none"
                  placeholder="Ej: 'Feliz cumpleaños Sofía', sin nueces, decoración en rosa..."
                />
              </div>
              {fotoSection}
            </div>
            <NavButtons onBack={() => setStep(7)} onNext={() => setStep(9)} />
          </div>
        );
      }

      // Step 9 — Resumen pastel
      if (step === 9) {
        const bizcocho = catalogo?.bizcochos.find((b) => b.id === config.bizcochoId);
        const cobertura = catalogo?.coberturas.find((c) => c.id === config.coberturaId);
        const saborCob = catalogo?.saboresCobertura.find((s) => s.id === config.saborCoberturaId);
        const relleno = catalogo?.coberturas.find((c) => c.id === config.rellenoId);
        const saborRel = catalogo?.saboresCobertura.find((s) => s.id === config.saborRellenoId);
        const jarabe = catalogo?.jarabes.find((j) => j.id === config.jarabeId);
        const saborJar = catalogo?.saboresJarabe.find((s) => s.id === config.saborJarabeId);
        const licor = catalogo?.licores.find((l) => l.ingredienteId === config.licorId);
        const toppingsSel = catalogo?.toppings.filter((t) => config.toppingIds.includes(t.ingredienteId));

        const rows: { label: string; value: string }[] = [
          { label: "Personas", value: `${personasDesdeDiametro(config.diametroCm)} (≈ ${config.diametroCm} cm)` },
        ];
        if (bizcocho) rows.push({ label: "Bizcocho", value: bizcocho.nombre });
        if (cobertura) rows.push({ label: "Cobertura", value: `${cobertura.nombre}${saborCob ? ` · ${saborCob.nombre}` : ""}` });
        if (relleno) rows.push({ label: "Relleno", value: `${relleno.nombre}${saborRel ? ` · ${saborRel.nombre}` : ""}` });
        if (jarabe) rows.push({ label: "Jarabe", value: `${jarabe.nombre}${saborJar ? ` · ${saborJar.nombre}` : ""} — ${config.humedadJarabe === "humedo" ? "Húmedo" : "Semi húmedo"}` });
        if (toppingsSel?.length) rows.push({ label: "Toppings", value: toppingsSel.map((t) => t.nombre).join(", ") });
        if (licor) rows.push({ label: "Licor", value: licor.nombre });
        if (notasPastel) rows.push({ label: "Notas", value: notasPastel });

        return (
          <ResumenStep
            rows={rows}
            fotoUrl={fotoRef ?? fotoPreview}
            precioBase={precioBase}
            descuento={descuento}
            total={total}
            cuponInput={cuponInput}
            cuponError={cuponError}
            cuponAplicado={cuponAplicado}
            validandoCupon={validandoCupon}
            onCuponInput={setCuponInput}
            onValidarCupon={validarCupon}
            onQuitarCupon={() => { setCuponAplicado(null); setCuponInput(""); }}
            onBack={() => setStep(8)}
            onAddToCart={handleAddToCart}
          />
        );
      }
    }

    // ── GELATINA ─────────────────────────────────────────────────────────────

    if (tipo === "gelatina") {
      // Step 2 — Categoría + litros
      if (step === 2) {
        const CATEGORIAS: { id: CategoriaGelatina; label: string; desc: string }[] = [
          { id: "clasica",    label: "Gelatina Clásica",   desc: "Agua, leche, tres leches, queso crema, yogurt" },
          { id: "healthy",    label: "Gelatina Healthy",    desc: "Agua, leche, queso crema, yogurt" },
          { id: "sin_azucar", label: "Sin Azúcar",          desc: "Agua, leche, queso crema, yogurt" },
        ];
        const isClasica = gCfg.categoria === "clasica";
        const totalLitrosStep = gCfg.litrosAgua + gCfg.litrosLeche + gCfg.litrosTresLeches + gCfg.litrosQuesoCrema + gCfg.litrosYogurt;
        return (
          <div>
            <SectionTitle>Tipo de gelatina y bases líquidas</SectionTitle>
            <p className="text-sm font-semibold text-[#3A1F14] mb-3">Elige el tipo</p>
            <div className="flex flex-wrap gap-3 mb-2">
              {CATEGORIAS.map((cat) => (
                <button key={cat.id} type="button"
                  onClick={() => setGCfg((c) => ({ ...c, categoria: cat.id, litrosTresLeches: cat.id !== "clasica" ? 0 : c.litrosTresLeches }))}
                  className={`px-4 py-2.5 rounded-2xl text-sm font-semibold border-2 transition ${
                    gCfg.categoria === cat.id
                      ? "border-[#AA6A42] bg-[#AA6A42]/10 text-[#AA6A42]"
                      : "border-[#f0e0d0] text-[#6B3E26] hover:bg-[#f0e0d0]/40"
                  }`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#6B3E26]/60 mb-5">
              {CATEGORIAS.find((c) => c.id === gCfg.categoria)?.desc}
            </p>
            <p className="text-sm font-semibold text-[#3A1F14] mb-3">Litros por base</p>
            <div className="space-y-3">
              <LiquidInput label="Agua" litros={gCfg.litrosAgua} saborId=""
                onLitros={(v) => setGCfg((c) => ({ ...c, litrosAgua: v }))}
                onSabor={() => {}} sabores={[]} />
              <LiquidInput label="Leche" litros={gCfg.litrosLeche} saborId=""
                onLitros={(v) => setGCfg((c) => ({ ...c, litrosLeche: v }))}
                onSabor={() => {}} sabores={[]} />
              {isClasica && (
                <LiquidInput label="Tres Leches" litros={gCfg.litrosTresLeches} saborId=""
                  onLitros={(v) => setGCfg((c) => ({ ...c, litrosTresLeches: v }))}
                  onSabor={() => {}} sabores={[]} />
              )}
              <LiquidInput label="Queso Crema" litros={gCfg.litrosQuesoCrema} saborId=""
                onLitros={(v) => setGCfg((c) => ({ ...c, litrosQuesoCrema: v }))}
                onSabor={() => {}} sabores={[]} />
              <LiquidInput label="Yogurt" litros={gCfg.litrosYogurt} saborId=""
                onLitros={(v) => setGCfg((c) => ({ ...c, litrosYogurt: v }))}
                onSabor={() => {}} sabores={[]} />
            </div>
            <NavButtons
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextDisabled={totalLitrosStep <= 0}
            />
          </div>
        );
      }

      // Step 3 — Cobertura + Sabor
      if (step === 3) {
        return (
          <div>
            <SectionTitle>Cobertura (opcional)</SectionTitle>
            <CardGrid>
              {catalogo?.coberturas.map((c) => (
                <OptionCard key={c.id} id={c.id} label={c.nombre} image={c.imagenUrl ?? null}
                  selected={gCfg.coberturaId === c.id}
                  onClick={() => setGCfg((cfg) => ({ ...cfg, coberturaId: cfg.coberturaId === c.id ? null : c.id, saborCoberturaId: null }))}
                />
              ))}
            </CardGrid>
            {gCfg.coberturaId && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[#3A1F14] mb-3">Sabor de cobertura</p>
                <SaborGrid>
                  {catalogo?.saboresCobertura.map((s) => (
                    <OptionCard key={s.id} id={s.id} label={s.nombre}
                      selected={gCfg.saborCoberturaId === s.id}
                      onClick={() => setGCfg((c) => ({ ...c, saborCoberturaId: s.id }))} />
                  ))}
                </SaborGrid>
              </div>
            )}
            <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        );
      }

      // Step 4 — Jarabe + Sabor
      if (step === 4) {
        return (
          <div>
            <SectionTitle>Jarabe (opcional)</SectionTitle>
            <CardGrid>
              {catalogo?.jarabes.map((j) => (
                <OptionCard key={j.id} id={j.id} label={j.nombre} image={j.imagenUrl ?? null}
                  selected={gCfg.jarabeId === j.id}
                  onClick={() => setGCfg((c) => ({ ...c, jarabeId: c.jarabeId === j.id ? null : j.id, saborJarabeId: null }))}
                />
              ))}
            </CardGrid>
            {gCfg.jarabeId && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-[#3A1F14] mb-3">Sabor de jarabe</p>
                <SaborGrid>
                  {catalogo?.saboresJarabe.map((s) => (
                    <OptionCard key={s.id} id={s.id} label={s.nombre}
                      selected={gCfg.saborJarabeId === s.id}
                      onClick={() => setGCfg((c) => ({ ...c, saborJarabeId: s.id }))} />
                  ))}
                </SaborGrid>
              </div>
            )}
            <NavButtons onBack={() => setStep(3)} onNext={() => setStep(5)} />
          </div>
        );
      }

      // Step 5 — Toppings
      if (step === 5) {
        return (
          <div>
            <SectionTitle>Toppings (opcional)</SectionTitle>
            <CardGrid>
              {catalogo?.toppings.map((t) => (
                <OptionCard key={t.ingredienteId} id={t.ingredienteId} label={t.nombre}
                  image={t.imagenUrl ?? null}
                  selected={gCfg.toppingIds.includes(t.ingredienteId)}
                  onClick={() => toggleToppingG(t.ingredienteId)} />
              ))}
            </CardGrid>
            <NavButtons onBack={() => setStep(4)} onNext={() => setStep(6)} />
          </div>
        );
      }

      // Step 6 — Notas + Foto
      if (step === 6) {
        return (
          <div>
            <SectionTitle>Notas y referencia</SectionTitle>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#6B3E26]/60 mb-1 block">
                  Notas adicionales (diseño, colores, figuras, etc.)
                </label>
                <textarea
                  value={gCfg.notas}
                  onChange={(e) => setGCfg((c) => ({ ...c, notas: e.target.value }))}
                  rows={4}
                  className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#AA6A42] resize-none"
                  placeholder="Ej: gelatina de Frozen, colores azul y blanco, estrellitas..."
                />
              </div>
              {fotoSection}
            </div>
            <NavButtons onBack={() => setStep(5)} onNext={() => setStep(7)} />
          </div>
        );
      }

      // Step 7 — Resumen gelatina
      if (step === 7) {
        const cobertura = catalogo?.coberturas.find((c) => c.id === gCfg.coberturaId);
        const saborCob = catalogo?.saboresCobertura.find((s) => s.id === gCfg.saborCoberturaId);
        const jarabe = catalogo?.jarabes.find((j) => j.id === gCfg.jarabeId);
        const saborJar = catalogo?.saboresJarabe.find((s) => s.id === gCfg.saborJarabeId);
        const toppingsSel = catalogo?.toppings.filter((t) => gCfg.toppingIds.includes(t.ingredienteId));
        const catLabel = gCfg.categoria === "clasica" ? "Clásica" : gCfg.categoria === "healthy" ? "Healthy" : "Sin Azúcar";

        const rows: { label: string; value: string }[] = [
          { label: "Tipo", value: `Gelatina ${catLabel}` },
        ];

        const liquidosTexto: string[] = [];
        if (gCfg.litrosAgua > 0)       liquidosTexto.push(`${gCfg.litrosAgua}L agua`);
        if (gCfg.litrosLeche > 0)      liquidosTexto.push(`${gCfg.litrosLeche}L leche`);
        if (gCfg.litrosTresLeches > 0) liquidosTexto.push(`${gCfg.litrosTresLeches}L tres leches`);
        if (gCfg.litrosQuesoCrema > 0) liquidosTexto.push(`${gCfg.litrosQuesoCrema}L queso crema`);
        if (gCfg.litrosYogurt > 0)     liquidosTexto.push(`${gCfg.litrosYogurt}L yogurt`);
        if (liquidosTexto.length) rows.push({ label: "Bases", value: liquidosTexto.join(", ") });
        if (cobertura) rows.push({ label: "Cobertura", value: `${cobertura.nombre}${saborCob ? ` · ${saborCob.nombre}` : ""}` });
        if (jarabe) rows.push({ label: "Jarabe", value: `${jarabe.nombre}${saborJar ? ` · ${saborJar.nombre}` : ""}` });
        if (toppingsSel?.length) rows.push({ label: "Toppings", value: toppingsSel.map((t) => t.nombre).join(", ") });
        if (gCfg.notas) rows.push({ label: "Notas", value: gCfg.notas });

        return (
          <ResumenStep
            rows={rows}
            fotoUrl={fotoRef ?? fotoPreview}
            precioBase={precioBase}
            descuento={descuento}
            total={total}
            cuponInput={cuponInput}
            cuponError={cuponError}
            cuponAplicado={cuponAplicado}
            validandoCupon={validandoCupon}
            onCuponInput={setCuponInput}
            onValidarCupon={validarCupon}
            onQuitarCupon={() => { setCuponAplicado(null); setCuponInput(""); }}
            onBack={() => setStep(6)}
            onAddToCart={handleAddToCart}
          />
        );
      }
    }

    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#3A1F14] text-center mb-1">Arma tu pedido</h1>
      <p className="text-sm text-[#6B3E26]/60 text-center mb-6">
        Personaliza cada detalle — te contactaremos para confirmar
      </p>

      {added && <SuccessBanner onDismiss={() => setAdded(false)} />}

      <Timeline steps={steps} current={step} />

      <div className="bg-[#FFFAF5] rounded-3xl p-6 shadow-sm border border-[#f0e0d0]">
        {renderStep()}
      </div>
    </div>
  );
}
