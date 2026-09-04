"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { OptionCard } from "./OptionCard";
import { useCartStore, resolveOrigen } from "@/modules/admin/store/presentation/hooks/useCartStore";
import { calcularCostoPastel } from "@/modules/admin/store/domain/usecases/CalcularCostoPastel.usecase";
import {
  personasDesdeDiametro,
  diametroPreciso,
} from "@/modules/admin/store/domain/entities/PastelMedida.entity";
import {
  CONFIGURACION_VACIA,
  type PastelConfiguracion,
  type HumedadJarabe,
  type CoberturaSeleccionada,
  type OrnamentoSeleccionado,
  type ToppingSeleccionado,
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
  alergias: string;
}

interface GelatinaCustomConfig {
  categoria: CategoriaGelatina;
  litrosAgua: number;
  litrosLeche: number;
  litrosTresLeches: number;
  litrosQuesoCrema: number;
  litrosYogurt: number;
  coberturas: CoberturaSeleccionada[];
  jarabeId: string | null;
  saborJarabeId: string | null;
  toppings: ToppingSeleccionado[];
  ornamentos: OrnamentoSeleccionado[];
  notas: string;
}

const GELATINA_VACIA: GelatinaCustomConfig = {
  categoria: "clasica",
  litrosAgua: 1,
  litrosLeche: 0,
  litrosTresLeches: 0,
  litrosQuesoCrema: 0,
  litrosYogurt: 0,
  coberturas: [],
  jarabeId: null,
  saborJarabeId: null,
  toppings: [],
  ornamentos: [],
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

  const jar = catalogo.jarabes.find((j) => j.id === gCfg.jarabeId);
  const saborJar = catalogo.saboresJarabe.find((s) => s.id === gCfg.saborJarabeId);

  const costoCoberturas = (gCfg.coberturas ?? []).reduce((sum, sel) => {
    const cob = catalogo.coberturas.find((c) => c.id === sel.coberturaId);
    const saborCob = catalogo.saboresCobertura.find((s) => s.id === sel.saborCoberturaId);
    return sum + (cob ? cob.costoTotal * factor * (sel.factor ?? 1) : 0) + (saborCob?.precio ?? 0);
  }, 0);
  const costoJarabe = jar ? jar.costoTotal * factor : 0;
  const costoSaborJar = saborJar?.precio ?? 0;

  // Un override de gramaje (sel.cantidad) es el valor final para esta orden,
  // ya no escala con el factor de volumen — igual que en los usecases admin.
  const costoToppings = (gCfg.toppings ?? []).reduce((sum, sel) => {
    const t = catalogo.toppings.find((x) => x.ingredienteId === sel.ingredienteId);
    if (!t || t.costoUnidadMinima == null) return sum;
    if (sel.cantidad != null) return sum + sel.cantidad * t.costoUnidadMinima;
    if (t.cantidad == null) return sum;
    return sum + t.cantidad * t.costoUnidadMinima * factor;
  }, 0);

  const costoOrnamentos = (gCfg.ornamentos ?? []).reduce((sum, sel) => {
    const orn = catalogo.ornamentos?.find((o) => o.id === sel.ornamentoId);
    return sum + (orn ? orn.precio * (sel.cantidad ?? 1) : 0);
  }, 0);

  const costoInsumos =
    costoBase + costoCoberturas + costoJarabe + costoSaborJar + costoToppings + costoOrnamentos;

  const baseEstructural = costoBase + costoCoberturas;
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
            <span className={`text-sm font-semibold ${isCenter ? "text-[#8A5535]" : "text-[#6B3E26]/60"}`}>
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
        className="flex-1 py-3 min-h-11 rounded-2xl border-2 border-[#8A5535] text-[#8A5535] font-semibold hover:bg-[#AA6A42]/10 transition disabled:opacity-40"
      >
        Atrás
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex-1 py-3 min-h-11 rounded-2xl bg-[#8A5535] text-white font-semibold hover:bg-[#6B3E26] transition disabled:opacity-40"
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

// Sabores — chips simples, sin imágenes ni cards
function SaborGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function SaborChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer ${
        selected
          ? "bg-[#3A1F14] border-[#3A1F14] text-white"
          : "bg-white border-[#e0c9b0] text-[#6B3E26] hover:border-[#AA6A42] hover:text-[#3A1F14]"
      }`}
    >
      {label}
    </button>
  );
}

/** Input de factor por cobertura/relleno individual — 1 = cantidad normal. */
function FactorInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
        Factor
      </label>
      <input
        type="number"
        min={0.1}
        max={5}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Math.max(0.1, Math.min(5, Number(e.target.value) || 1)))}
        className="w-20 px-2 py-1 rounded-lg border border-[#e0c9b0] bg-white text-[#3A1F14] text-[12px] font-semibold text-center focus:outline-none focus:border-[#AA6A42] focus:ring-1 focus:ring-[#AA6A42]/20 transition"
      />
      <span className="text-[11px] text-[#6B3E26]/80">
        × cantidad{value !== 1 && ` (${(value * 100).toFixed(0)}%)`}
      </span>
    </div>
  );
}

/**
 * Cantidad de un topping — muestra la cantidad del catálogo por default,
 * editable solo para esta orden (no cambia el catálogo global). "Restablecer"
 * vuelve a usar la del catálogo (y con eso, vuelve a escalar con el diámetro).
 */
function ToppingCantidadInput({
  cantidadCatalogo,
  unidad,
  value,
  onChange,
}: {
  cantidadCatalogo: number;
  unidad: string;
  value: number | null | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const overridden = value != null;
  return (
    <div className="flex items-center gap-2 mt-2">
      <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
        Cantidad
      </label>
      <input
        type="number"
        min={0}
        step={1}
        value={value ?? cantidadCatalogo}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(Number.isFinite(n) && n >= 0 ? n : 0);
        }}
        className="w-20 px-2 py-1 rounded-lg border border-[#e0c9b0] bg-white text-[#3A1F14] text-[12px] font-semibold text-center focus:outline-none focus:border-[#AA6A42] focus:ring-1 focus:ring-[#AA6A42]/20 transition"
      />
      <span className="text-[11px] text-[#6B3E26]/80">{unidad}</span>
      {overridden && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-[11px] text-[#AA6A42] underline hover:text-[#8A5535] transition cursor-pointer"
        >
          Restablecer ({cantidadCatalogo}{unidad})
        </button>
      )}
    </div>
  );
}

// ── Success banner ───────────────────────────────────────────────────────────

function SuccessBanner({ onDismiss, edited }: { onDismiss: () => void; edited?: boolean }) {
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
        {edited ? "¡Tus cambios se guardaron!" : "¡Tu producto ha sido agregado al carrito!"}
      </h2>
      <p className="text-green-700 text-sm leading-relaxed max-w-sm mx-auto">
        {edited
          ? "El producto se actualizó en tu carrito. Puedes seguir editándolo desde ahí o proceder a generar tu pedido."
          : "Si deseas puedes agregar más productos o proceder a generar tu pedido accediendo a tu carrito en la parte superior derecha del sitio."}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-5 px-6 py-2 rounded-full border border-green-300 text-green-700 text-sm font-medium hover:bg-green-100 transition"
      >
        {edited ? "Seguir comprando" : "Agregar otro producto"}
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
  isEditing,
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
  isEditing?: boolean;
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
            <button type="button" onClick={onQuitarCupon} className="text-[#27ae60] hover:text-[#C0392B] text-xs">
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
              className="flex-1 border border-[#e0c9b0] rounded-2xl px-4 py-2.5 min-h-11 text-sm focus:outline-none focus:border-[#AA6A42]"
            />
            <button
              type="button"
              onClick={onValidarCupon}
              disabled={validandoCupon || !cuponInput.trim()}
              className="px-4 py-2.5 min-h-11 rounded-2xl bg-[#AA6A42]/10 text-[#8A5535] text-sm font-medium hover:bg-[#AA6A42]/20 transition disabled:opacity-40"
            >
              {validandoCupon ? "..." : "Aplicar"}
            </button>
          </div>
        )}
        {cuponError && <p className="text-[#C0392B] text-xs mt-1 ml-1">{cuponError}</p>}
      </div>

      {/* Totals */}
      <div className="bg-white rounded-2xl border border-[#f0e0d0] p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm text-[#6B3E26]">
          <span>Subtotal</span>
          <span>${precioBase.toFixed(2)}</span>
        </div>
        {descuento > 0 && (
          <div className="flex justify-between text-sm text-[#27ae60]">
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
          className="flex-1 py-3 min-h-11 rounded-2xl border-2 border-[#8A5535] text-[#8A5535] font-semibold hover:bg-[#AA6A42]/10 transition"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={onAddToCart}
          className="flex-[2] py-3 min-h-11 rounded-2xl bg-[#8A5535] text-white font-semibold hover:bg-[#6B3E26] transition flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>{isEditing ? "Guardar cambios" : "Agregar al carrito"}</span>
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function CustomPipeline() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addItem = useCartStore((s) => s.addItem);
  const updateItem = useCartStore((s) => s.updateItem);

  // Editar un item ya en el carrito: /custom?editId=<id> — el carrito es un
  // store global compartido, así que el item sigue disponible tras navegar aquí.
  const editId = searchParams.get("editId");
  const editItem = useCartStore((s) =>
    editId ? (s.items.find((i) => i.id === editId) ?? null) : null,
  );
  const [editLoaded, setEditLoaded] = useState(false);

  const [catalogo, setCatalogo] = useState<ConfigPersonalizadoCatalogo | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [step, setStep] = useState(0);
  const [tipo, setTipo] = useState<TipoProducto>("pastel");
  const [added, setAdded] = useState(false);
  const [justEdited, setJustEdited] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [datos, setDatos] = useState<DatosCliente>({ nombre: "", telefono: "", direccion: "", alergias: "" });
  const [personas, setPersonas] = useState(18);
  const [config, setConfig] = useState<PastelConfiguracion>({ ...CONFIGURACION_VACIA });
  const [gCfg, setGCfg] = useState<GelatinaCustomConfig>({ ...GELATINA_VACIA });
  const [notasPastel, setNotasPastel] = useState("");
  const [toppingSearch, setToppingSearch] = useState("");

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
    // Personas siempre es entero (ver input de abajo); el diámetro que resulta
    // de convertirlo puede quedar en decimales — ya no se fuerza a cm entero.
    const dm = diametroPreciso(personas);
    setConfig((c) => ({ ...c, diametroCm: dm }));
  }, [personas]);

  useEffect(() => {
    fetch("/api/public/config-personalizado")
      .then((r) => r.json())
      .then(setCatalogo)
      .finally(() => setLoadingCatalog(false));
  }, []);

  useEffect(() => () => { if (addedTimerRef.current) clearTimeout(addedTimerRef.current); }, []);

  // Precarga la config guardada del item del carrito que se está editando.
  // Salta directo al Resumen — todo ya está lleno, solo falta ajustar y guardar.
  useEffect(() => {
    if (!editItem || editLoaded) return;
    // any: configuracion guardada por este mismo pipeline es {tipo, ...config,
    // notas/fotoRef/datos} sin tipo dedicado — se lee tal cual se guardó.
    const conf = editItem.configuracion as Record<string, any>;
    const origen = resolveOrigen(editItem);
    if (origen === "pastel-custom") {
      setTipo("pastel");
      setConfig(conf as unknown as PastelConfiguracion);
      setPersonas(personasDesdeDiametro(conf.diametroCm ?? 24));
      setNotasPastel(conf.notas ?? "");
      setStep(STEPS_PASTEL.length - 1);
    } else if (origen === "gelatina-custom") {
      setTipo("gelatina");
      setGCfg(conf as unknown as GelatinaCustomConfig);
      setStep(STEPS_GELATINA.length - 1);
    }
    if (conf.fotoRef) { setFotoRef(conf.fotoRef); setFotoPreview(conf.fotoRef); }
    if (conf.datos) setDatos(conf.datos);
    if (editItem.cuponesItem?.[0]) {
      setCuponAplicado(editItem.cuponesItem[0]);
      setCuponInput(editItem.cuponesItem[0].codigo);
    }
    setEditLoaded(true);
  }, [editItem, editLoaded]);

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
      toppings: c.toppings.some((t) => t.ingredienteId === id)
        ? c.toppings.filter((t) => t.ingredienteId !== id)
        : [...c.toppings, { ingredienteId: id }],
    }));

  // undefined = usar la cantidad del catálogo (sigue escalando con el
  // diámetro); un número = override manual solo para esta orden.
  const setToppingCantidad = (id: string, cantidad: number | undefined) =>
    setConfig((c) => ({
      ...c,
      toppings: c.toppings.map((t) =>
        t.ingredienteId === id ? { ...t, cantidad } : t,
      ),
    }));

  const toggleToppingG = (id: string) =>
    setGCfg((c) => ({
      ...c,
      toppings: c.toppings.some((t) => t.ingredienteId === id)
        ? c.toppings.filter((t) => t.ingredienteId !== id)
        : [...c.toppings, { ingredienteId: id }],
    }));

  const setToppingCantidadG = (id: string, cantidad: number | undefined) =>
    setGCfg((c) => ({
      ...c,
      toppings: c.toppings.map((t) =>
        t.ingredienteId === id ? { ...t, cantidad } : t,
      ),
    }));

  const toggleOrnamentoPastel = (id: string) =>
    setConfig((c) => ({
      ...c,
      ornamentos: (c.ornamentos ?? []).some((o) => o.ornamentoId === id)
        ? (c.ornamentos ?? []).filter((o) => o.ornamentoId !== id)
        : [...(c.ornamentos ?? []), { ornamentoId: id, cantidad: 1 }],
    }));

  const setOrnamentoCantidadPastel = (id: string, cantidad: number) =>
    setConfig((c) => ({
      ...c,
      ornamentos: (c.ornamentos ?? []).map((o) =>
        o.ornamentoId === id ? { ...o, cantidad } : o,
      ),
    }));

  const toggleOrnamentoG = (id: string) =>
    setGCfg((c) => ({
      ...c,
      ornamentos: (c.ornamentos ?? []).some((o) => o.ornamentoId === id)
        ? (c.ornamentos ?? []).filter((o) => o.ornamentoId !== id)
        : [...(c.ornamentos ?? []), { ornamentoId: id, cantidad: 1 }],
    }));

  const setOrnamentoCantidadG = (id: string, cantidad: number) =>
    setGCfg((c) => ({
      ...c,
      ornamentos: (c.ornamentos ?? []).map((o) =>
        o.ornamentoId === id ? { ...o, cantidad } : o,
      ),
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
      const payload = {
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
        origen: "pastel-custom" as const,
      };
      if (editItem) updateItem(editItem.id, payload);
      else addItem(payload);
    } else {
      const totalLitros = gCfg.litrosAgua + gCfg.litrosLeche + gCfg.litrosTresLeches + gCfg.litrosQuesoCrema + gCfg.litrosYogurt;
      const catLabel = gCfg.categoria === "clasica" ? "Clásica" : gCfg.categoria === "healthy" ? "Healthy" : "Sin Azúcar";
      const payload = {
        nombre: `Gelatina ${catLabel} personalizada (${totalLitros}L)`,
        configuracion: { tipo: "gelatina-custom", ...gCfg, fotoRef, datos },
        cantidad: 1,
        costoUnitario: 0,
        precioUnitario: calcPrecioGelatina(gCfg, catalogo!) + CARGO_EMPAQUE,
        desgloseCostos: { costoInsumos: 0, cargosAdicionales: [], costoProduccionTotal: 0, precioSugerido: calcPrecioGelatina(gCfg, catalogo!) + CARGO_EMPAQUE },
        cuponesItem,
        origen: "gelatina-custom" as const,
      };
      if (editItem) updateItem(editItem.id, payload);
      else addItem(payload);
    }

    if (editItem) {
      // Quita el ?editId= — ya se guardó, reabrir esta URL no debe reeditar el mismo item.
      router.replace("/custom");
      setEditLoaded(false);
      setJustEdited(true);
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
      {fotoError && <p className="text-[#C0392B] text-xs mt-1">{fotoError}</p>}
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
            <div>
              <label className="text-xs text-[#6B3E26]/60 mb-1 block">
                ¿Alguna alergia o restricción alimentaria? (opcional)
              </label>
              <textarea
                value={datos.alergias}
                onChange={(e) => setDatos((d) => ({ ...d, alergias: e.target.value }))}
                rows={2}
                className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#AA6A42] resize-none"
                placeholder="Ej: alergia a nueces, intolerancia a la lactosa..."
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
      const TIPOS: { id: TipoProducto; label: string; description: string }[] = [
        { id: "pastel", label: "Pastel personalizado", description: "Elige bizcocho, cobertura, relleno y más" },
        { id: "gelatina", label: "Gelatina personalizada", description: "Escoge tus bases líquidas y sabores" },
      ];
      return (
        <div>
          <SectionTitle>¿Qué deseas ordenar?</SectionTitle>
          <div className="flex justify-center">
            <div className="inline-flex rounded-2xl border border-[#e0c9b0] bg-white p-1 gap-1">
              {TIPOS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipo(t.id)}
                  aria-pressed={tipo === t.id}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    tipo === t.id
                      ? "bg-[#3A1F14] text-white"
                      : "text-[#6B3E26] hover:bg-[#FFF7F0]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-[#6B3E26]/60 text-center mt-3">
            {TIPOS.find((t) => t.id === tipo)?.description}
          </p>
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
                onChange={(e) => setPersonas(Math.min(300, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#AA6A42]"
              />
              {personas >= 300 && (
                <p className="text-xs text-[#AA6A42]/70 mt-1">
                  Para pedidos de más de 300 personas, contáctanos directamente.
                </p>
              )}
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

      // Step 3 — Coberturas (varias) + Sabor de cada una
      if (step === 3) {
        const toggleCobertura = (id: string) =>
          setConfig((cfg) => ({
            ...cfg,
            coberturas: cfg.coberturas.some((c) => c.coberturaId === id)
              ? cfg.coberturas.filter((c) => c.coberturaId !== id)
              : [...cfg.coberturas, { coberturaId: id, saborCoberturaId: null }],
          }));
        const setSaborCobertura = (coberturaId: string, saborId: string) =>
          setConfig((cfg) => ({
            ...cfg,
            coberturas: cfg.coberturas.map((c) =>
              c.coberturaId === coberturaId ? { ...c, saborCoberturaId: saborId } : c,
            ),
          }));
        const setFactorCobertura = (coberturaId: string, factor: number) =>
          setConfig((cfg) => ({
            ...cfg,
            coberturas: cfg.coberturas.map((c) =>
              c.coberturaId === coberturaId ? { ...c, factor } : c,
            ),
          }));
        return (
          <div>
            <SectionTitle>Cobertura</SectionTitle>
            <p className="text-xs text-[#6B3E26]/60 -mt-3 mb-4">
              Puedes elegir más de una — todas se suman al precio.
            </p>
            <CardGrid>
              {catalogo?.coberturas.map((c) => (
                <OptionCard
                  key={c.id}
                  id={c.id}
                  label={c.nombre}
                  image={c.imagenUrl ?? null}
                  selected={config.coberturas.some((sel) => sel.coberturaId === c.id)}
                  onClick={() => toggleCobertura(c.id)}
                />
              ))}
            </CardGrid>
            {config.coberturas.map((sel) => {
              const cob = catalogo?.coberturas.find((c) => c.id === sel.coberturaId);
              return (
                <div key={sel.coberturaId} className="mt-5">
                  <p className="text-sm font-semibold text-[#3A1F14] mb-3">
                    Sabor de {cob?.nombre ?? "cobertura"}
                  </p>
                  <SaborGrid>
                    {catalogo?.saboresCobertura.map((s) => (
                      <SaborChip
                        key={s.id}
                        label={s.nombre}
                        selected={sel.saborCoberturaId === s.id}
                        onClick={() => setSaborCobertura(sel.coberturaId, s.id)}
                      />
                    ))}
                  </SaborGrid>
                  <FactorInput
                    value={sel.factor ?? 1}
                    onChange={(f) => setFactorCobertura(sel.coberturaId, f)}
                  />
                </div>
              );
            })}
            <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} />
          </div>
        );
      }

      // Step 4 — Rellenos (varios) + Sabor de cada uno
      if (step === 4) {
        const toggleRelleno = (id: string) =>
          setConfig((cfg) => ({
            ...cfg,
            rellenos: cfg.rellenos.some((r) => r.rellenoId === id)
              ? cfg.rellenos.filter((r) => r.rellenoId !== id)
              : [...cfg.rellenos, { rellenoId: id, saborRellenoId: null }],
          }));
        const setSaborRelleno = (rellenoId: string, saborId: string) =>
          setConfig((cfg) => ({
            ...cfg,
            rellenos: cfg.rellenos.map((r) =>
              r.rellenoId === rellenoId ? { ...r, saborRellenoId: saborId } : r,
            ),
          }));
        const setFactorRelleno = (rellenoId: string, factor: number) =>
          setConfig((cfg) => ({
            ...cfg,
            rellenos: cfg.rellenos.map((r) =>
              r.rellenoId === rellenoId ? { ...r, factor } : r,
            ),
          }));
        return (
          <div>
            <SectionTitle>Relleno</SectionTitle>
            <p className="text-xs text-[#6B3E26]/60 -mt-3 mb-4">
              Puedes elegir más de uno — todos se suman al precio.
            </p>
            <CardGrid>
              {catalogo?.coberturas.map((c) => (
                <OptionCard
                  key={c.id}
                  id={c.id}
                  label={c.nombre}
                  image={c.imagenUrl ?? null}
                  selected={config.rellenos.some((sel) => sel.rellenoId === c.id)}
                  onClick={() => toggleRelleno(c.id)}
                />
              ))}
            </CardGrid>
            {config.rellenos.map((sel) => {
              const rel = catalogo?.coberturas.find((c) => c.id === sel.rellenoId);
              return (
                <div key={sel.rellenoId} className="mt-5">
                  <p className="text-sm font-semibold text-[#3A1F14] mb-3">
                    Sabor de {rel?.nombre ?? "relleno"}
                  </p>
                  <SaborGrid>
                    {catalogo?.saboresCobertura.map((s) => (
                      <SaborChip
                        key={s.id}
                        label={s.nombre}
                        selected={sel.saborRellenoId === s.id}
                        onClick={() => setSaborRelleno(sel.rellenoId, s.id)}
                      />
                    ))}
                  </SaborGrid>
                  <FactorInput
                    value={sel.factor ?? 1}
                    onChange={(f) => setFactorRelleno(sel.rellenoId, f)}
                  />
                </div>
              );
            })}
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
                      <SaborChip
                        key={s.id}
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
                            ? "border-[#8A5535] bg-[#AA6A42]/10 text-[#8A5535]"
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

      // Step 6 — Toppings + Ornamentos
      if (step === 6) {
        return (
          <div>
            <SectionTitle>Toppings (opcional)</SectionTitle>
            <input
              type="text"
              value={toppingSearch}
              onChange={(e) => setToppingSearch(e.target.value)}
              placeholder="Buscar topping…"
              className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-2.5 min-h-11 text-sm mb-4 focus:outline-none focus:border-[#AA6A42]"
            />
            <CardGrid>
              {catalogo?.toppings
                .filter((t) => t.nombre.toLowerCase().includes(toppingSearch.toLowerCase()))
                .map((t) => (
                <OptionCard
                  key={t.ingredienteId}
                  id={t.ingredienteId}
                  label={t.nombre}
                  image={t.imagenUrl ?? null}
                  selected={config.toppings.some((x) => x.ingredienteId === t.ingredienteId)}
                  onClick={() => toggleTopping(t.ingredienteId)}
                />
              ))}
            </CardGrid>
            {catalogo?.toppings.length && catalogo.toppings.filter((t) => t.nombre.toLowerCase().includes(toppingSearch.toLowerCase())).length === 0 && (
              <p className="text-xs text-[#AA6A42]/60 text-center py-4">Sin resultados para &quot;{toppingSearch}&quot;</p>
            )}
            {config.toppings.map((sel) => {
              const t = catalogo?.toppings.find((x) => x.ingredienteId === sel.ingredienteId);
              if (!t || t.cantidad == null) return null;
              return (
                <div key={sel.ingredienteId} className="mt-3">
                  <p className="text-sm font-semibold text-[#3A1F14]">{t.nombre}</p>
                  <ToppingCantidadInput
                    cantidadCatalogo={t.cantidad}
                    unidad={t.unidad}
                    value={sel.cantidad}
                    onChange={(v) => setToppingCantidad(sel.ingredienteId, v)}
                  />
                </div>
              );
            })}
            {(catalogo?.ornamentos?.length ?? 0) > 0 && (
              <div className="mt-12">
                <SectionTitle>Ornamentos (opcional)</SectionTitle>
                <p className="text-xs text-[#6B3E26]/60 -mt-3 mb-4">
                  Selecciona y ajusta la cantidad de cada uno.
                </p>
                <CardGrid>
                  {catalogo!.ornamentos!.map((o) => {
                    const sel = (config.ornamentos ?? []).find((x) => x.ornamentoId === o.id);
                    return (
                      <OptionCard
                        key={o.id}
                        id={o.id}
                        label={o.nombre}
                        image={o.imagenUrl ?? null}
                        selected={!!sel}
                        onClick={() => toggleOrnamentoPastel(o.id)}
                        quantity={sel?.cantidad}
                        onQuantityChange={(q) => setOrnamentoCantidadPastel(o.id, q)}
                      />
                    );
                  })}
                </CardGrid>
              </div>
            )}
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
        const coberturasSel = config.coberturas
          .map((sel) => {
            const cob = catalogo?.coberturas.find((c) => c.id === sel.coberturaId);
            const sabor = catalogo?.saboresCobertura.find((s) => s.id === sel.saborCoberturaId);
            return cob ? `${cob.nombre}${sabor ? ` · ${sabor.nombre}` : ""}` : null;
          })
          .filter(Boolean) as string[];
        const rellenosSel = config.rellenos
          .map((sel) => {
            const rel = catalogo?.coberturas.find((c) => c.id === sel.rellenoId);
            const sabor = catalogo?.saboresCobertura.find((s) => s.id === sel.saborRellenoId);
            return rel ? `${rel.nombre}${sabor ? ` · ${sabor.nombre}` : ""}` : null;
          })
          .filter(Boolean) as string[];
        const jarabe = catalogo?.jarabes.find((j) => j.id === config.jarabeId);
        const saborJar = catalogo?.saboresJarabe.find((s) => s.id === config.saborJarabeId);
        const licor = catalogo?.licores.find((l) => l.ingredienteId === config.licorId);
        const toppingsSel = config.toppings
          .map((sel) => {
            const t = catalogo?.toppings.find((x) => x.ingredienteId === sel.ingredienteId);
            if (!t) return null;
            return sel.cantidad != null ? `${t.nombre} (${sel.cantidad}${t.unidad})` : t.nombre;
          })
          .filter(Boolean) as string[];
        const ornamentosSel = (config.ornamentos ?? [])
          .map((sel) => {
            const orn = catalogo?.ornamentos?.find((o) => o.id === sel.ornamentoId);
            return orn ? `${orn.nombre} ×${sel.cantidad}` : null;
          })
          .filter(Boolean) as string[];

        const rows: { label: string; value: string }[] = [
          { label: "Personas", value: `${personasDesdeDiametro(config.diametroCm)} (≈ ${config.diametroCm} cm)` },
        ];
        if (bizcocho) rows.push({ label: "Bizcocho", value: bizcocho.nombre });
        if (coberturasSel.length) rows.push({ label: "Cobertura", value: coberturasSel.join(" + ") });
        if (rellenosSel.length) rows.push({ label: "Relleno", value: rellenosSel.join(" + ") });
        if (jarabe) rows.push({ label: "Jarabe", value: `${jarabe.nombre}${saborJar ? ` · ${saborJar.nombre}` : ""} — ${config.humedadJarabe === "humedo" ? "Húmedo" : "Semi húmedo"}` });
        if (toppingsSel.length) rows.push({ label: "Toppings", value: toppingsSel.join(", ") });
        if (licor) rows.push({ label: "Licor", value: licor.nombre });
        if (ornamentosSel.length) rows.push({ label: "Ornamentos", value: ornamentosSel.join(", ") });
        if (notasPastel) rows.push({ label: "Notas", value: notasPastel });
        if (datos.alergias.trim()) rows.push({ label: "Alergias", value: datos.alergias.trim() });

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
            isEditing={!!editItem}
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

      // Step 3 — Coberturas (varias) + Sabor de cada una
      if (step === 3) {
        const toggleCoberturaG = (id: string) =>
          setGCfg((cfg) => ({
            ...cfg,
            coberturas: cfg.coberturas.some((c) => c.coberturaId === id)
              ? cfg.coberturas.filter((c) => c.coberturaId !== id)
              : [...cfg.coberturas, { coberturaId: id, saborCoberturaId: null }],
          }));
        const setSaborCoberturaG = (coberturaId: string, saborId: string) =>
          setGCfg((cfg) => ({
            ...cfg,
            coberturas: cfg.coberturas.map((c) =>
              c.coberturaId === coberturaId ? { ...c, saborCoberturaId: saborId } : c,
            ),
          }));
        const setFactorCoberturaG = (coberturaId: string, factor: number) =>
          setGCfg((cfg) => ({
            ...cfg,
            coberturas: cfg.coberturas.map((c) =>
              c.coberturaId === coberturaId ? { ...c, factor } : c,
            ),
          }));
        return (
          <div>
            <SectionTitle>Cobertura (opcional)</SectionTitle>
            <p className="text-xs text-[#6B3E26]/60 -mt-3 mb-4">
              Puedes elegir más de una — todas se suman al precio.
            </p>
            <CardGrid>
              {catalogo?.coberturas.map((c) => (
                <OptionCard key={c.id} id={c.id} label={c.nombre} image={c.imagenUrl ?? null}
                  selected={gCfg.coberturas.some((sel) => sel.coberturaId === c.id)}
                  onClick={() => toggleCoberturaG(c.id)}
                />
              ))}
            </CardGrid>
            {gCfg.coberturas.map((sel) => {
              const cob = catalogo?.coberturas.find((c) => c.id === sel.coberturaId);
              return (
                <div key={sel.coberturaId} className="mt-5">
                  <p className="text-sm font-semibold text-[#3A1F14] mb-3">
                    Sabor de {cob?.nombre ?? "cobertura"}
                  </p>
                  <SaborGrid>
                    {catalogo?.saboresCobertura.map((s) => (
                      <SaborChip key={s.id} label={s.nombre}
                        selected={sel.saborCoberturaId === s.id}
                        onClick={() => setSaborCoberturaG(sel.coberturaId, s.id)} />
                    ))}
                  </SaborGrid>
                  <FactorInput
                    value={sel.factor ?? 1}
                    onChange={(f) => setFactorCoberturaG(sel.coberturaId, f)}
                  />
                </div>
              );
            })}
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
                    <SaborChip key={s.id} label={s.nombre}
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

      // Step 5 — Toppings + Ornamentos
      if (step === 5) {
        return (
          <div>
            <SectionTitle>Toppings (opcional)</SectionTitle>
            <input
              type="text"
              value={toppingSearch}
              onChange={(e) => setToppingSearch(e.target.value)}
              placeholder="Buscar topping…"
              className="w-full border border-[#e0c9b0] rounded-2xl px-4 py-2.5 min-h-11 text-sm mb-4 focus:outline-none focus:border-[#AA6A42]"
            />
            <CardGrid>
              {catalogo?.toppings
                .filter((t) => t.nombre.toLowerCase().includes(toppingSearch.toLowerCase()))
                .map((t) => (
                <OptionCard key={t.ingredienteId} id={t.ingredienteId} label={t.nombre}
                  image={t.imagenUrl ?? null}
                  selected={gCfg.toppings.some((x) => x.ingredienteId === t.ingredienteId)}
                  onClick={() => toggleToppingG(t.ingredienteId)} />
              ))}
            </CardGrid>
            {catalogo?.toppings.length && catalogo.toppings.filter((t) => t.nombre.toLowerCase().includes(toppingSearch.toLowerCase())).length === 0 && (
              <p className="text-xs text-[#AA6A42]/60 text-center py-4">Sin resultados para &quot;{toppingSearch}&quot;</p>
            )}
            {gCfg.toppings.map((sel) => {
              const t = catalogo?.toppings.find((x) => x.ingredienteId === sel.ingredienteId);
              if (!t || t.cantidad == null) return null;
              return (
                <div key={sel.ingredienteId} className="mt-3">
                  <p className="text-sm font-semibold text-[#3A1F14]">{t.nombre}</p>
                  <ToppingCantidadInput
                    cantidadCatalogo={t.cantidad}
                    unidad={t.unidad}
                    value={sel.cantidad}
                    onChange={(v) => setToppingCantidadG(sel.ingredienteId, v)}
                  />
                </div>
              );
            })}
            {(catalogo?.ornamentos?.length ?? 0) > 0 && (
              <div className="mt-12">
                <SectionTitle>Ornamentos (opcional)</SectionTitle>
                <p className="text-xs text-[#6B3E26]/60 -mt-3 mb-4">
                  Selecciona y ajusta la cantidad de cada uno.
                </p>
                <CardGrid>
                  {catalogo!.ornamentos!.map((o) => {
                    const sel = (gCfg.ornamentos ?? []).find((x) => x.ornamentoId === o.id);
                    return (
                      <OptionCard key={o.id} id={o.id} label={o.nombre}
                        image={o.imagenUrl ?? null}
                        selected={!!sel}
                        onClick={() => toggleOrnamentoG(o.id)}
                        quantity={sel?.cantidad}
                        onQuantityChange={(q) => setOrnamentoCantidadG(o.id, q)} />
                    );
                  })}
                </CardGrid>
              </div>
            )}
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
        const coberturasSel = gCfg.coberturas
          .map((sel) => {
            const cob = catalogo?.coberturas.find((c) => c.id === sel.coberturaId);
            const sabor = catalogo?.saboresCobertura.find((s) => s.id === sel.saborCoberturaId);
            return cob ? `${cob.nombre}${sabor ? ` · ${sabor.nombre}` : ""}` : null;
          })
          .filter(Boolean) as string[];
        const jarabe = catalogo?.jarabes.find((j) => j.id === gCfg.jarabeId);
        const saborJar = catalogo?.saboresJarabe.find((s) => s.id === gCfg.saborJarabeId);
        const toppingsSel = gCfg.toppings
          .map((sel) => {
            const t = catalogo?.toppings.find((x) => x.ingredienteId === sel.ingredienteId);
            if (!t) return null;
            return sel.cantidad != null ? `${t.nombre} (${sel.cantidad}${t.unidad})` : t.nombre;
          })
          .filter(Boolean) as string[];
        const ornamentosSel = (gCfg.ornamentos ?? [])
          .map((sel) => {
            const orn = catalogo?.ornamentos?.find((o) => o.id === sel.ornamentoId);
            return orn ? `${orn.nombre} ×${sel.cantidad}` : null;
          })
          .filter(Boolean) as string[];
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
        if (coberturasSel.length) rows.push({ label: "Cobertura", value: coberturasSel.join(" + ") });
        if (jarabe) rows.push({ label: "Jarabe", value: `${jarabe.nombre}${saborJar ? ` · ${saborJar.nombre}` : ""}` });
        if (toppingsSel.length) rows.push({ label: "Toppings", value: toppingsSel.join(", ") });
        if (ornamentosSel.length) rows.push({ label: "Ornamentos", value: ornamentosSel.join(", ") });
        if (gCfg.notas) rows.push({ label: "Notas", value: gCfg.notas });
        if (datos.alergias.trim()) rows.push({ label: "Alergias", value: datos.alergias.trim() });

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
            isEditing={!!editItem}
          />
        );
      }
    }

    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#3A1F14] text-center mb-1">
        {editItem ? "Editar tu pedido" : "Arma tu pedido"}
      </h1>
      <p className="text-sm text-[#6B3E26]/60 text-center mb-6">
        {editItem
          ? "Ajusta lo que necesites y guarda los cambios"
          : "Personaliza cada detalle — te contactaremos para confirmar"}
      </p>

      {added && (
        <SuccessBanner
          edited={justEdited}
          onDismiss={() => { setAdded(false); setJustEdited(false); }}
        />
      )}

      <Timeline steps={steps} current={step} />

      {step >= 1 && step < steps.length - 1 && precioBase > 0 && (
        <div className="flex items-center justify-between bg-[#FFF0E6] border border-[#e8c4a0] rounded-2xl px-4 py-2.5 mb-4 sticky top-2 z-10">
          <span className="text-xs font-semibold text-[#6B3E26] uppercase tracking-wider">Precio estimado</span>
          <span className="text-base font-bold text-[#3A1F14]">${precioBase.toFixed(0)}</span>
        </div>
      )}

      <div className="bg-[#FFFAF5] rounded-3xl p-6 shadow-sm border border-[#f0e0d0]">
        {renderStep()}
      </div>
    </div>
  );
}
