"use client";
// src/modules/admin/productos/presentation/components/ProductoEditorModal.tsx

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  Producto,
  CreateProductoDTO,
  LineaProducto,
  IngredienteBaseItem,
  TamanoFijo,
} from "../../domain/entities/Producto.entity";
import type { Ingrediente } from "@/modules/admin/raws/domain/entities/Ingrediente.entity";
import { usePastelConfigCatalogo } from "@/modules/admin/store/presentation/hooks/usePastelConfig";

// ── Internal types ────────────────────────────────────────────────────────────

interface IngLineaRow {
  ingredienteId: string;
  cantidad: number;
  _nombre: string;
  _unidad: string;
  _costoUnidad: number;
}

interface TamanoRow {
  id: string;
  nombre: string;
  factorCosto: number;
  factorOpciones: number | "";
}

interface Props {
  producto: Producto | null;
  open: boolean;
  onClose: () => void;
  onSave: (dto: CreateProductoDTO, id?: string) => Promise<void>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const LINEAS: { value: LineaProducto; label: string }[] = [
  { value: "sweet", label: "🍰 Sweet" },
  { value: "fitness", label: "💪 Fitness" },
  { value: "healthy", label: "🌿 Healthy" },
];

const MANO_OBRA_REFS = [
  { label: "Pastel (default)", value: 60 },
  { label: "Tarta sablé", value: 45 },
  { label: "Crème brûlée", value: 30 },
  { label: "Panna Cotta", value: 20 },
  { label: "Muffin / Cookie", value: 10 },
  { label: "Mini pavlova", value: 5 },
];

const FACTOR_REFS = [
  { label: "Tarta 8cm", value: 0.1111 },
  { label: "Tarta 5cm", value: 0.0434 },
  { label: "Crème brûlée 8cm", value: 0.1111 },
  { label: "Mini pavlova", value: 0.05 },
  { label: "Muffin / Cookie", value: 0.1667 },
  { label: "Panna Cotta vaso gde", value: 0.1667 },
  { label: "Panna Cotta vaso chico", value: 0.1 },
];

const NINGUNO = "__ninguno__";

// ── Component ─────────────────────────────────────────────────────────────────

export function ProductoEditorModal({
  producto,
  open,
  onClose,
  onSave,
}: Props) {
  // ── Form fields ───────────────────────────────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [linea, setLinea] = useState<LineaProducto>("sweet");
  const [elaboracion, setElaboracion] = useState("");
  const [permiteMedida, setPermiteMedida] = useState(false);
  const [medidaBaseCm, setMedidaBaseCm] = useState<number | "">(24);
  const [tipoTamano, setTipoTamano] = useState<"unico" | "fijos">("unico");
  const [tamanos, setTamanos] = useState<TamanoRow[]>([]);
  const [factorOpciones, setFactorOpciones] = useState<number | "">("");
  const [manoDeObraMinimo, setManoDeObraMinimo] = useState<number | "">("");
  const [precioEstablecido, setPrecioEstablecido] = useState<number | "">("");

  // Ingredientes
  const [lineas, setLineas] = useState<IngLineaRow[]>([]);
  const [ingSearch, setIngSearch] = useState("");
  const [ingResults, setIngResults] = useState<Ingrediente[]>([]);
  const [ingLoading, setIngLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Opciones default
  const [defCoberturaId, setDefCoberturaId] = useState<string | null>(null);
  const [defSaborCoberturaId, setDefSaborCoberturaId] = useState<string | null>(
    null,
  );
  const [defRellenoId, setDefRellenoId] = useState<string | null>(null);
  const [defSaborRellenoId, setDefSaborRellenoId] = useState<string | null>(
    null,
  );
  const [defJarabeId, setDefJarabeId] = useState<string | null>(null);
  const [defSaborJarabeId, setDefSaborJarabeId] = useState<string | null>(null);
  const [defLicorId, setDefLicorId] = useState<string | null>(null);
  const [defToppingIds, setDefToppingIds] = useState<string[]>([]);
  const [defEmpaqueIds, setDefEmpaqueIds] = useState<string[]>([]);

  // Catálogo para opciones default
  const { catalogo, loading: catLoading } = usePastelConfigCatalogo();

  // ── UI ────────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<
    "info" | "receta" | "tamanos" | "ajustes" | "default"
  >("info");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Initialize ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (producto) {
      setNombre(producto.nombre);
      setDescripcion(producto.descripcion ?? "");
      setLinea(producto.linea);
      setElaboracion(producto.elaboracion ?? "");
      setPermiteMedida(producto.permiteMedidaPersonalizada);
      setMedidaBaseCm(producto.medidaBaseCm ?? 24);
      setFactorOpciones(producto.factorOpciones ?? "");
      setManoDeObraMinimo(producto.manoDeObraMinimo ?? "");
      setPrecioEstablecido(producto.precioEstablecido ?? "");
      setLineas(
        producto.ingredientesBase.map((ing) => ({
          ingredienteId: ing.ingredienteId,
          cantidad: ing.cantidad,
          _nombre: ing.nombre,
          _unidad: ing.unidad,
          _costoUnidad: ing.costoUnidadMinima,
        })),
      );
      if (producto.tamanosFijos.length > 0) {
        setTipoTamano("fijos");
        setTamanos(
          producto.tamanosFijos.map((t) => ({
            id: t.id,
            nombre: t.nombre,
            factorCosto: t.factorCosto,
            factorOpciones: t.factorOpciones ?? "",
          })),
        );
      } else {
        setTipoTamano("unico");
        setTamanos([]);
      }
      // Opciones default
      const od = producto.opcionesDefault;
      setDefCoberturaId(od.coberturaId ?? null);
      setDefSaborCoberturaId(od.saborCoberturaId ?? null);
      setDefRellenoId(od.rellenoId ?? null);
      setDefSaborRellenoId(od.saborRellenoId ?? null);
      setDefJarabeId(od.jarabeId ?? null);
      setDefSaborJarabeId(od.saborJarabeId ?? null);
      setDefLicorId(od.licorId ?? null);
      setDefToppingIds(od.toppingIds ?? []);
      setDefEmpaqueIds(od.empaqueIds ?? []);
    } else {
      setNombre("");
      setDescripcion("");
      setLinea("sweet");
      setElaboracion("");
      setPermiteMedida(false);
      setMedidaBaseCm(24);
      setTipoTamano("unico");
      setTamanos([]);
      setFactorOpciones("");
      setManoDeObraMinimo("");
      setPrecioEstablecido("");
      setLineas([]);
      setDefCoberturaId(null);
      setDefSaborCoberturaId(null);
      setDefRellenoId(null);
      setDefSaborRellenoId(null);
      setDefJarabeId(null);
      setDefSaborJarabeId(null);
      setDefLicorId(null);
      setDefToppingIds([]);
      setDefEmpaqueIds([]);
    }
    setError(null);
    setTab("info");
    setIngSearch("");
    setIngResults([]);
    setShowDropdown(false);
  }, [open, producto]);

  // ── Debounced ingredient search ───────────────────────────────────────────
  useEffect(() => {
    if (ingSearch.length < 2) {
      setIngResults([]);
      setShowDropdown(false);
      return;
    }
    const t = setTimeout(async () => {
      setIngLoading(true);
      try {
        const res = await fetch(
          `/api/admin/ingredientes?search=${encodeURIComponent(ingSearch)}&pageSize=8`,
        );
        const data = await res.json();
        setIngResults(data.data ?? []);
        setShowDropdown(true);
      } finally {
        setIngLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [ingSearch]);

  // ── Ingredient handlers ───────────────────────────────────────────────────
  const addIngrediente = useCallback((ing: Ingrediente) => {
    setLineas((prev) => {
      if (prev.some((l) => l.ingredienteId === ing.id)) return prev;
      return [
        ...prev,
        {
          ingredienteId: ing.id,
          cantidad: 0,
          _nombre: ing.nombre,
          _unidad: ing.unidadBase,
          _costoUnidad: ing.costoUnidadMinima ?? 0,
        },
      ];
    });
    setIngSearch("");
    setIngResults([]);
    setShowDropdown(false);
  }, []);

  const removeLinea = (id: string) =>
    setLineas((p) => p.filter((l) => l.ingredienteId !== id));
  const updateCantidad = (id: string, val: number) =>
    setLineas((p) =>
      p.map((l) => (l.ingredienteId === id ? { ...l, cantidad: val } : l)),
    );
  const costoTotal = lineas.reduce(
    (s, l) => s + l.cantidad * l._costoUnidad,
    0,
  );

  // ── Tamaño handlers ───────────────────────────────────────────────────────
  const addTamano = () =>
    setTamanos((p) => [
      ...p,
      { id: uid(), nombre: "", factorCosto: 1, factorOpciones: "" },
    ]);
  const removeTamano = (id: string) =>
    setTamanos((p) => p.filter((t) => t.id !== id));
  const updateTamano = (id: string, field: keyof TamanoRow, val: any) =>
    setTamanos((p) => p.map((t) => (t.id === id ? { ...t, [field]: val } : t)));

  // ── Topping toggle helper ─────────────────────────────────────────────────
  const toggleTopping = (
    id: string,
    arr: string[],
    set: (v: string[]) => void,
  ) => {
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };
  const toggleEmpaque = (id: string) =>
    toggleTopping(id, defEmpaqueIds, setDefEmpaqueIds);

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      setTab("info");
      return;
    }
    if (lineas.some((l) => !l.ingredienteId || l.cantidad <= 0)) {
      setError("Todos los ingredientes deben tener cantidad mayor a 0");
      setTab("receta");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const dto: CreateProductoDTO = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        linea,
        elaboracion: elaboracion.trim() || null,
        ingredientesBase: lineas
          .filter((l) => l.cantidad > 0)
          .map(
            (l) =>
              ({
                ingredienteId: l.ingredienteId,
                nombre: l._nombre,
                cantidad: l.cantidad,
                unidad: l._unidad as any,
                costoUnidadMinima: l._costoUnidad,
              }) as IngredienteBaseItem,
          ),
        opcionesDefault: {
          coberturaId: defCoberturaId,
          saborCoberturaId: defSaborCoberturaId,
          rellenoId: defRellenoId,
          saborRellenoId: defSaborRellenoId,
          jarabeId: defJarabeId,
          saborJarabeId: defSaborJarabeId,
          licorId: defLicorId,
          toppingIds: defToppingIds,
          empaqueIds: defEmpaqueIds,
        },
        medidaBaseCm: permiteMedida ? Number(medidaBaseCm) || 24 : null,
        permiteMedidaPersonalizada: permiteMedida,
        tamanosFijos:
          tipoTamano === "fijos"
            ? tamanos.map(
                (t) =>
                  ({
                    id: t.id,
                    nombre: t.nombre,
                    factorCosto: Number(t.factorCosto) || 1,
                    factorOpciones:
                      t.factorOpciones !== "" ? Number(t.factorOpciones) : null,
                  }) as TamanoFijo,
              )
            : [],
        factorOpciones: factorOpciones !== "" ? Number(factorOpciones) : null,
        manoDeObraMinimo:
          manoDeObraMinimo !== "" ? Number(manoDeObraMinimo) : null,
        precioEstablecido:
          precioEstablecido !== "" ? Number(precioEstablecido) : null,
        activo: true,
      };
      await onSave(dto, producto?.id);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition placeholder:text-[#c0a0a8]";
  const labelCls =
    "text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider";
  const sectionCls =
    "flex flex-col gap-3 p-4 rounded-xl bg-[#fdf6f0] border border-[#f5dce4]";
  const tabCls = (active: boolean) =>
    `px-3 py-3 text-[12px] font-semibold border-b-2 transition -mb-px ${
      active
        ? "border-[#c0607a] text-[#c0607a]"
        : "border-transparent text-[#b07a8a] hover:text-[#7b2d42]"
    }`;

  const tabs = [
    { key: "info" as const, label: "Info" },
    { key: "receta" as const, label: "Receta base" },
    { key: "tamanos" as const, label: "Tamaños" },
    { key: "default" as const, label: "Opciones ★" },
    { key: "ajustes" as const, label: "Ajustes" },
  ];

  // ── Select helpers for default options tab ────────────────────────────────
  const SelectOpc = ({
    label,
    value,
    onChange,
    options,
  }: {
    label: string;
    value: string | null;
    onChange: (v: string | null) => void;
    options: { value: string; label: string }[];
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className={labelCls}>{label}</label>
      <select
        value={value ?? NINGUNO}
        onChange={(e) =>
          onChange(e.target.value === NINGUNO ? null : e.target.value)
        }
        className={inputCls}
      >
        <option value={NINGUNO}>— Ninguno —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  const MultiChips = ({
    label,
    selected,
    onChange,
    options,
  }: {
    label: string;
    selected: string[];
    onChange: (v: string[]) => void;
    options: { value: string; label: string; sublabel?: string }[];
  }) => (
    <div className="flex flex-col gap-2">
      <label className={labelCls}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() =>
                onChange(
                  active
                    ? selected.filter((x) => x !== o.value)
                    : [...selected, o.value],
                )
              }
              className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition ${
                active
                  ? "bg-[#c0607a] text-white border-[#c0607a]"
                  : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]"
              }`}
            >
              {o.label}
              {o.sublabel && (
                <span
                  className={`ml-1 text-[10px] ${active ? "opacity-80" : "text-[#b07a8a]"}`}
                >
                  {o.sublabel}
                </span>
              )}
            </button>
          );
        })}
        {options.length === 0 && (
          <p className="text-[12px] text-[#c0a0a8]">
            No hay opciones disponibles
          </p>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#f5dce4] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0] shrink-0">
                <div>
                  <h2 className="font-bold text-[#7b2d42] text-lg">
                    {producto ? "Editar producto" : "Nuevo producto"}
                  </h2>
                  {nombre && (
                    <p className="text-[12px] text-[#b07a8a] mt-0.5">
                      {nombre}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-[#f5dce4] transition text-[#b07a8a]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#f5dce4] shrink-0 bg-white px-6 overflow-x-auto">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={tabCls(tab === t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
                {/* ── INFO ─────────────────────────────────────────────── */}
                {tab === "info" && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Nombre *</label>
                      <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej: Cookie Vainilla Chips"
                        className={inputCls}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Línea</label>
                      <div className="flex gap-2">
                        {LINEAS.map((l) => (
                          <button
                            key={l.value}
                            type="button"
                            onClick={() => setLinea(l.value)}
                            className={`flex-1 py-2 rounded-xl text-[13px] font-semibold border transition ${linea === l.value ? "bg-[#c0607a] text-white border-[#c0607a]" : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]"}`}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Descripción</label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={3}
                        placeholder="Descripción para el cliente…"
                        className={inputCls + " resize-none"}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>
                        Elaboración / Procedimiento
                      </label>
                      <textarea
                        value={elaboracion}
                        onChange={(e) => setElaboracion(e.target.value)}
                        rows={4}
                        placeholder="Pasos de preparación…"
                        className={inputCls + " resize-none"}
                      />
                    </div>
                  </>
                )}

                {/* ── RECETA BASE ──────────────────────────────────────── */}
                {tab === "receta" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Ingredientes</label>
                      <span className="text-[11px] text-[#b07a8a]">
                        {lineas.length} agregado{lineas.length !== 1 ? "s" : ""}{" "}
                        · costo ${costoTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        className={inputCls + " pr-9"}
                        value={ingSearch}
                        onChange={(e) => setIngSearch(e.target.value)}
                        placeholder="Buscar y agregar ingrediente…"
                      />
                      {ingLoading ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[#c0607a] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c0a0a8] pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      )}
                      {showDropdown && ingResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#f5dce4] rounded-xl shadow-lg z-10 overflow-hidden">
                          {ingResults.map((ing) => (
                            <button
                              key={ing.id}
                              type="button"
                              onClick={() => addIngrediente(ing)}
                              disabled={lineas.some(
                                (l) => l.ingredienteId === ing.id,
                              )}
                              className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-[#fdf6f0] disabled:opacity-40 transition border-b border-[#f9eef2] last:border-0"
                            >
                              <span className="text-[#3d1a24] font-medium">
                                {ing.nombre}
                              </span>
                              <span className="text-[11px] text-[#b07a8a]">
                                ${ing.costoUnidadMinima?.toFixed(4)} /{" "}
                                {ing.unidadBase}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {lineas.length > 0 && (
                      <div className="rounded-xl border border-[#f5dce4] overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#fdf6f0] border-b border-[#f5dce4]">
                              <th className="px-3 py-2 text-left text-[10px] font-semibold text-[#b07a8a] uppercase">
                                Ingrediente
                              </th>
                              <th className="px-3 py-2 text-center text-[10px] font-semibold text-[#b07a8a] uppercase">
                                Cantidad
                              </th>
                              <th className="px-3 py-2 text-right text-[10px] font-semibold text-[#b07a8a] uppercase">
                                Costo
                              </th>
                              <th className="px-3 py-2 w-8" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f9eef2]">
                            {lineas.map((l) => (
                              <tr key={l.ingredienteId}>
                                <td className="px-3 py-2">
                                  <p className="font-medium text-[#3d1a24] text-[13px]">
                                    {l._nombre}
                                  </p>
                                  <p className="text-[11px] text-[#b07a8a]">
                                    ${l._costoUnidad.toFixed(4)}/{l._unidad}
                                  </p>
                                </td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-1 justify-center">
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={l.cantidad || ""}
                                      onChange={(e) =>
                                        updateCantidad(
                                          l.ingredienteId,
                                          Number(e.target.value),
                                        )
                                      }
                                      className="w-20 text-center px-2 py-1 rounded-lg border border-[#e8c4cd] text-sm focus:outline-none focus:border-[#c0607a] transition"
                                    />
                                    <span className="text-[11px] text-[#b07a8a]">
                                      {l._unidad}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-right font-medium text-[#7b2d42] text-[13px]">
                                  ${(l.cantidad * l._costoUnidad).toFixed(2)}
                                </td>
                                <td className="px-3 py-2">
                                  <button
                                    type="button"
                                    onClick={() => removeLinea(l.ingredienteId)}
                                    className="p-1 rounded-lg hover:bg-red-50 text-[#c0a0a8] hover:text-red-500 transition"
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    >
                                      <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-[#fdf6f0] border-t border-[#f5dce4]">
                              <td
                                colSpan={2}
                                className="px-3 py-2 text-right text-[11px] font-semibold text-[#b07a8a] uppercase"
                              >
                                Total
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-[#c0607a] text-base">
                                ${costoTotal.toFixed(2)}
                              </td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                    {lineas.length === 0 && (
                      <div className="rounded-xl border border-dashed border-[#e8c4cd] py-8 text-center text-[#c0a0a8] text-sm">
                        Escribe en el buscador para agregar ingredientes
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAMAÑOS ──────────────────────────────────────────── */}
                {tab === "tamanos" && (
                  <>
                    <div className={sectionCls}>
                      <label className={labelCls}>
                        ¿El cliente elige el diámetro?
                      </label>
                      <div className="flex gap-2">
                        {[
                          { v: false, label: "No — tamaño fijo o único" },
                          { v: true, label: "Sí — medida personalizable" },
                        ].map((opt) => (
                          <button
                            key={String(opt.v)}
                            type="button"
                            onClick={() => setPermiteMedida(opt.v)}
                            className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition ${permiteMedida === opt.v ? "bg-[#c0607a] text-white border-[#c0607a]" : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]"}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {permiteMedida && (
                        <div className="flex items-center gap-2 mt-1">
                          <label className="text-[11px] text-[#b07a8a] shrink-0">
                            Medida base:
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={medidaBaseCm}
                            onChange={(e) =>
                              setMedidaBaseCm(Number(e.target.value) || "")
                            }
                            className={inputCls + " max-w-[80px] text-center"}
                          />
                          <span className="text-[11px] text-[#b07a8a]">cm</span>
                        </div>
                      )}
                    </div>
                    {!permiteMedida && (
                      <div className={sectionCls}>
                        <label className={labelCls}>Variantes de tamaño</label>
                        <div className="flex gap-2">
                          {[
                            { v: "unico", label: "Tamaño único" },
                            { v: "fijos", label: "Tamaños fijos" },
                          ].map((opt) => (
                            <button
                              key={opt.v}
                              type="button"
                              onClick={() => setTipoTamano(opt.v as any)}
                              className={`flex-1 py-2 rounded-xl text-[12px] font-semibold border transition ${tipoTamano === opt.v ? "bg-[#c0607a] text-white border-[#c0607a]" : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]"}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {tipoTamano === "fijos" && (
                          <div className="flex flex-col gap-2 mt-1">
                            {tamanos.map((t, i) => (
                              <div
                                key={t.id}
                                className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-[#e8c4cd]"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    value={t.nombre}
                                    onChange={(e) =>
                                      updateTamano(
                                        t.id,
                                        "nombre",
                                        e.target.value,
                                      )
                                    }
                                    placeholder={`Variante ${i + 1} (ej: Vaso grande)`}
                                    className={inputCls + " flex-1"}
                                  />
                                  <button
                                    onClick={() => removeTamano(t.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#c0a0a8] hover:text-red-500 transition"
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    >
                                      <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[#b07a8a] font-semibold uppercase">
                                      Factor receta
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.0001"
                                      value={t.factorCosto}
                                      onChange={(e) =>
                                        updateTamano(
                                          t.id,
                                          "factorCosto",
                                          Number(e.target.value),
                                        )
                                      }
                                      className={inputCls}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[#b07a8a] font-semibold uppercase">
                                      Factor opciones
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.0001"
                                      value={t.factorOpciones}
                                      onChange={(e) =>
                                        updateTamano(
                                          t.id,
                                          "factorOpciones",
                                          e.target.value === ""
                                            ? ""
                                            : Number(e.target.value),
                                        )
                                      }
                                      placeholder="Vacío = igual a receta"
                                      className={inputCls}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={addTamano}
                              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[#c0607a] text-[#c0607a] text-[12px] font-semibold hover:bg-[#fdf6f0] transition"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              >
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                              Agregar variante
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── OPCIONES DEFAULT ─────────────────────────────────── */}
                {tab === "default" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="text-amber-500 text-lg shrink-0">★</span>
                      <p className="text-[12px] text-amber-800 leading-relaxed">
                        Define qué opciones aparecen{" "}
                        <strong>preseleccionadas</strong> cuando alguien abre el
                        configurador de este producto. El cliente puede
                        cambiarlas libremente — estas son solo los valores de
                        partida.
                      </p>
                    </div>

                    {catLoading && (
                      <p className="text-center text-[#c0a0a8] text-sm py-4">
                        Cargando catálogo…
                      </p>
                    )}

                    {catalogo && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <SelectOpc
                            label="Cobertura"
                            value={defCoberturaId}
                            onChange={setDefCoberturaId}
                            options={catalogo.coberturas.map((c) => ({
                              value: c.id,
                              label: c.nombre,
                            }))}
                          />

                          <SelectOpc
                            label="Sabor de cobertura"
                            value={defSaborCoberturaId}
                            onChange={setDefSaborCoberturaId}
                            options={catalogo.saboresCobertura.map((s) => ({
                              value: s.id,
                              label: s.nombre,
                            }))}
                          />

                          <SelectOpc
                            label="Relleno"
                            value={defRellenoId}
                            onChange={setDefRellenoId}
                            options={catalogo.coberturas.map((c) => ({
                              value: c.id,
                              label: c.nombre,
                            }))}
                          />

                          <SelectOpc
                            label="Sabor de relleno"
                            value={defSaborRellenoId}
                            onChange={setDefSaborRellenoId}
                            options={catalogo.saboresCobertura.map((s) => ({
                              value: s.id,
                              label: s.nombre,
                            }))}
                          />

                          <SelectOpc
                            label="Jarabe"
                            value={defJarabeId}
                            onChange={setDefJarabeId}
                            options={catalogo.jarabes.map((j) => ({
                              value: j.id,
                              label: j.nombre,
                            }))}
                          />

                          <SelectOpc
                            label="Sabor de jarabe"
                            value={defSaborJarabeId}
                            onChange={setDefSaborJarabeId}
                            options={catalogo.saboresJarabe.map((s) => ({
                              value: s.id,
                              label: s.nombre,
                            }))}
                          />

                          <SelectOpc
                            label="Licor"
                            value={defLicorId}
                            onChange={setDefLicorId}
                            options={catalogo.licores
                              .filter((l) => l.cantidad != null)
                              .map((l) => ({
                                value: l.ingredienteId,
                                label: l.nombre,
                              }))}
                          />
                        </div>

                        <MultiChips
                          label="Toppings preseleccionados"
                          selected={defToppingIds}
                          onChange={setDefToppingIds}
                          options={catalogo.toppings
                            .filter((t) => t.cantidad != null)
                            .map((t) => ({
                              value: t.ingredienteId,
                              label: t.nombre,
                              sublabel: `${t.cantidad}${t.unidad}`,
                            }))}
                        />

                        <MultiChips
                          label="Empaques preseleccionados"
                          selected={defEmpaqueIds}
                          onChange={setDefEmpaqueIds}
                          options={catalogo.empaques.map((e) => ({
                            value: e.id,
                            label: e.nombre,
                            sublabel: `$${e.precio}`,
                          }))}
                        />

                        {/* Resumen */}
                        {(defCoberturaId ||
                          defRellenoId ||
                          defToppingIds.length > 0 ||
                          defEmpaqueIds.length > 0) && (
                          <div className={sectionCls}>
                            <p className={labelCls}>Resumen de defaults</p>
                            <div className="flex flex-col gap-1 text-[12px]">
                              {defCoberturaId && (
                                <div className="flex gap-2">
                                  <span className="text-[#b07a8a]">
                                    Cobertura:
                                  </span>
                                  <span className="text-[#3d1a24] font-medium">
                                    {
                                      catalogo.coberturas.find(
                                        (c) => c.id === defCoberturaId,
                                      )?.nombre
                                    }
                                  </span>
                                  <button
                                    onClick={() => setDefCoberturaId(null)}
                                    className="text-red-400 hover:text-red-600 ml-auto"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              {defRellenoId && (
                                <div className="flex gap-2">
                                  <span className="text-[#b07a8a]">
                                    Relleno:
                                  </span>
                                  <span className="text-[#3d1a24] font-medium">
                                    {
                                      catalogo.coberturas.find(
                                        (c) => c.id === defRellenoId,
                                      )?.nombre
                                    }
                                  </span>
                                  <button
                                    onClick={() => setDefRellenoId(null)}
                                    className="text-red-400 hover:text-red-600 ml-auto"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              {defToppingIds.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                  <span className="text-[#b07a8a] shrink-0">
                                    Toppings:
                                  </span>
                                  {defToppingIds.map((tid) => {
                                    const t = catalogo.toppings.find(
                                      (x) => x.ingredienteId === tid,
                                    );
                                    return t ? (
                                      <span
                                        key={tid}
                                        className="flex items-center gap-1 bg-[#f5dce4] text-[#7b2d42] px-2 py-0.5 rounded-full"
                                      >
                                        {t.nombre}
                                        <button
                                          onClick={() =>
                                            setDefToppingIds(
                                              defToppingIds.filter(
                                                (x) => x !== tid,
                                              ),
                                            )
                                          }
                                          className="text-red-400 hover:text-red-600"
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              {defEmpaqueIds.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                  <span className="text-[#b07a8a] shrink-0">
                                    Empaques:
                                  </span>
                                  {defEmpaqueIds.map((eid) => {
                                    const e = catalogo.empaques.find(
                                      (x) => x.id === eid,
                                    );
                                    return e ? (
                                      <span
                                        key={eid}
                                        className="flex items-center gap-1 bg-[#f5dce4] text-[#7b2d42] px-2 py-0.5 rounded-full"
                                      >
                                        {e.nombre}
                                        <button
                                          onClick={() => toggleEmpaque(eid)}
                                          className="text-red-400 hover:text-red-600"
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {!defCoberturaId &&
                          !defRellenoId &&
                          defToppingIds.length === 0 &&
                          defEmpaqueIds.length === 0 && (
                            <p className="text-[12px] text-[#c0a0a8] text-center py-2">
                              Sin opciones predeterminadas — el configurador
                              abrirá con todo en blanco.
                            </p>
                          )}
                      </>
                    )}
                  </div>
                )}

                {/* ── AJUSTES ──────────────────────────────────────────── */}
                {tab === "ajustes" && (
                  <>
                    <div className={sectionCls}>
                      <div>
                        <label className={labelCls}>Precio establecido</label>
                        <p className="text-[11px] text-[#b07a8a] mt-1">
                          Precio de venta fijo definido manualmente. Si se
                          define, el configurador mostrará ambas opciones
                          (sugerido vs establecido) para que elijas al cotizar.
                          Vacío = usar siempre el precio sugerido calculado.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#b07a8a] text-sm">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={precioEstablecido}
                          onChange={(e) =>
                            setPrecioEstablecido(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          placeholder="Ej: 25.00"
                          className={inputCls + " max-w-[140px]"}
                        />
                        {precioEstablecido !== "" && (
                          <button
                            type="button"
                            onClick={() => setPrecioEstablecido("")}
                            className="text-[11px] text-[#c0a0a8] hover:text-red-500 transition"
                          >
                            Quitar precio establecido
                          </button>
                        )}
                      </div>
                      {precioEstablecido !== "" && (
                        <p className="text-[11px] text-[#c0607a] font-semibold">
                          Al cotizar se ofrecerá elegir entre $
                          {Number(precioEstablecido).toFixed(2)} (establecido) y
                          el precio calculado.
                        </p>
                      )}
                    </div>
                    <div className={sectionCls}>
                      <div>
                        <label className={labelCls}>Mano de obra mínima</label>
                        <p className="text-[11px] text-[#b07a8a] mt-1">
                          Cargo 2 = max(mínimo, 25% base estructural). Vacío =
                          $60.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#b07a8a] text-sm">$</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={manoDeObraMinimo}
                          onChange={(e) =>
                            setManoDeObraMinimo(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          placeholder="60"
                          className={inputCls + " max-w-[100px]"}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {MANO_OBRA_REFS.map((r) => (
                          <button
                            key={r.label}
                            type="button"
                            onClick={() => setManoDeObraMinimo(r.value)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${manoDeObraMinimo === r.value ? "bg-[#c0607a] text-white border-[#c0607a]" : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]"}`}
                          >
                            {r.label}{" "}
                            <span className="opacity-60">${r.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={sectionCls}>
                      <div>
                        <label className={labelCls}>
                          Factor de opciones del catálogo
                        </label>
                        <p className="text-[11px] text-[#b07a8a] mt-1">
                          Las opciones están costeadas para 24cm. Para productos
                          individuales define el factor de escala. Vacío = mismo
                          que receta base.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.0001"
                          value={factorOpciones}
                          onChange={(e) =>
                            setFactorOpciones(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          placeholder="Ej: 0.1667"
                          className={inputCls + " max-w-[150px]"}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {FACTOR_REFS.map((r) => (
                          <button
                            key={r.label}
                            type="button"
                            onClick={() => setFactorOpciones(r.value)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${factorOpciones === r.value ? "bg-[#c0607a] text-white border-[#c0607a]" : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]"}`}
                          >
                            {r.label}{" "}
                            <span className="opacity-60">{r.value}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {error && (
                <div className="mx-6 mb-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 shrink-0">
                  {error}
                </div>
              )}

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-[#f5dce4] bg-white shrink-0">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition"
                >
                  {saving
                    ? "Guardando…"
                    : producto
                      ? "Guardar cambios"
                      : "Crear producto"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
