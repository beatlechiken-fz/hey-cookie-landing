"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../hooks/useCartStore";
import { usePastelConfigCatalogo } from "../../hooks/usePastelConfig";
import { calcularCostoGelatina } from "../../../domain/usecases/CalcularCostoGelatina.usecase";
import {
  GELATINA_CONFIG_VACIA,
  type CategoriaGelatina,
  type GelatinaCatalogo,
  type GelatinaCotizadorConfig,
  findCostoGelatina,
} from "../../../domain/entities/GelatinaCotizador.entity";
import { SelectField, NINGUNO } from "./SelectField";
import { MultiSelectField } from "./MultiselectField";
import { QuantityStepper } from "./QuantityStepper";

interface Props {
  open: boolean;
  onClose: () => void;
}

const inputCls =
  "px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm font-semibold text-center focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition w-20";

const CATEGORIAS: { id: CategoriaGelatina; label: string; desc: string }[] = [
  { id: "clasica",    label: "Gelatina Clásica",     desc: "Agua, leche, tres leches, queso crema, yogurt" },
  { id: "healthy",    label: "Gelatina Healthy",      desc: "Agua, leche, queso crema, yogurt" },
  { id: "sin_azucar", label: "Gelatina Sin Azúcar",   desc: "Agua, leche, queso crema, yogurt" },
];

interface LitroInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  costoXLitro: number;
}

function LitroInput({ label, value, onChange, costoXLitro }: LitroInputProps) {
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-[#b07a8a] font-semibold uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min="0"
          step="0.5"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className={inputCls}
        />
        <span className="text-[12px] text-[#b07a8a]">L</span>
      </div>
      {costoXLitro > 0 && (
        <span className="text-[10px] text-[#c0a0a8]">{fmt(costoXLitro)}/L</span>
      )}
    </div>
  );
}

export function GelatinaCotizadorModal({ open, onClose }: Props) {
  const { catalogo, loading: catLoading } = usePastelConfigCatalogo();
  const addItem = useCartStore((s) => s.addItem);

  const [gelatinas, setGelatinas] = useState<GelatinaCatalogo[]>([]);
  const [loadingGel, setLoadingGel] = useState(false);

  const [config, setConfig] = useState<GelatinaCotizadorConfig>({ ...GELATINA_CONFIG_VACIA });
  const [added, setAdded] = useState(false);

  const update = <K extends keyof GelatinaCotizadorConfig>(k: K, v: GelatinaCotizadorConfig[K]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  useEffect(() => {
    if (!open) { setAdded(false); setConfig({ ...GELATINA_CONFIG_VACIA }); return; }
    setLoadingGel(true);
    fetch("/api/admin/gelatinas")
      .then((r) => r.json())
      .then((data: GelatinaCatalogo[]) => setGelatinas(data))
      .catch(() => {})
      .finally(() => setLoadingGel(false));
  }, [open]);

  const totalLitros = config.litrosAgua + config.litrosLeche + config.litrosTresLeches + config.litrosQuesoCrema + config.litrosYogurt;

  const desglose = useMemo(() => {
    if (!catalogo || !gelatinas.length || totalLitros <= 0) return null;
    return calcularCostoGelatina(gelatinas, config, catalogo);
  }, [catalogo, gelatinas, config, totalLitros]);

  const costo = (tipo: "agua" | "leche" | "tres_leches" | "queso_crema" | "yogurt") =>
    findCostoGelatina(gelatinas, tipo === "tres_leches" ? "clasica" : config.categoria, tipo);

  function handleAddToCart() {
    if (!desglose) return;
    const cat = CATEGORIAS.find((c) => c.id === config.categoria)?.label ?? "Gelatina";
    const bases: string[] = [];
    if (config.litrosAgua > 0)       bases.push(`${config.litrosAgua}L agua`);
    if (config.litrosLeche > 0)      bases.push(`${config.litrosLeche}L leche`);
    if (config.litrosTresLeches > 0) bases.push(`${config.litrosTresLeches}L tres leches`);
    if (config.litrosQuesoCrema > 0) bases.push(`${config.litrosQuesoCrema}L queso crema`);
    if (config.litrosYogurt > 0)     bases.push(`${config.litrosYogurt}L yogurt`);

    addItem({
      nombre: `${cat} (${bases.join(" + ")})`,
      configuracion: {
        tipo: "gelatina",
        categoria: config.categoria,
        litrosAgua: config.litrosAgua,
        litrosLeche: config.litrosLeche,
        litrosTresLeches: config.litrosTresLeches,
        litrosQuesoCrema: config.litrosQuesoCrema,
        litrosYogurt: config.litrosYogurt,
        coberturaId: config.coberturaId,
        saborCoberturaId: config.saborCoberturaId,
        rellenoId: config.rellenoId,
        saborRellenoId: config.saborRellenoId,
        toppingIds: config.toppingIds,
        jarabeId: config.jarabeId,
        saborJarabeId: config.saborJarabeId,
        licorId: config.licorId,
        empaqueIds: config.empaqueIds,
        conTransfer: config.conTransfer,
        conBlonda: config.conBlonda,
      },
      cantidad: config.cantidad,
      costoUnitario: desglose.costoProduccionTotal,
      precioUnitario: desglose.precioSugerido,
      desgloseCostos: {
        costoInsumos: desglose.costoInsumos,
        cargosAdicionales: [
          { concepto: "Servicios (10%)",  monto: desglose.servicios },
          { concepto: "Mano de obra",     monto: desglose.manoDeObra },
          { concepto: "Utilidad (90%)",   monto: desglose.utilidad },
          { concepto: "Cargo decoración", monto: desglose.cargoDecoracion },
        ],
        costoProduccionTotal: desglose.costoProduccionTotal,
        precioSugerido: desglose.precioSugerido,
      },
      cuponesItem: [],
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 900);
  }

  const Row = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
    <div className={`flex justify-between text-[13px] py-1 ${highlight ? "font-bold" : ""}`}>
      <span className="text-[#b07a8a]">{label}</span>
      <span className={highlight ? "text-[#c0607a] text-[15px]" : "text-[#3d1a24]"}>{value}</span>
    </div>
  );

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const isClasica = config.categoria === "clasica";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" />

          <motion.div key="modal" initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }} transition={{ duration: 0.18 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-[#f5dce4] flex flex-col overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5dce4] bg-[#fdf6f0] shrink-0">
                <div>
                  <h2 className="font-bold text-[#7b2d42] text-lg">Gelatina personalizada</h2>
                  <p className="text-[12px] text-[#b07a8a]">Elige categoría, litros y extras</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f5dce4] transition text-[#b07a8a]">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                {(loadingGel || catLoading) && (
                  <p className="text-center text-[#c0a0a8] text-sm py-6">Cargando…</p>
                )}

                {!loadingGel && !catLoading && catalogo && (
                  <>
                    {/* Categoría */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                        Tipo de gelatina
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIAS.map((cat) => (
                          <button key={cat.id} type="button"
                            onClick={() => update("categoria", cat.id)}
                            className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition ${
                              config.categoria === cat.id
                                ? "bg-[#c0607a] text-white border-[#c0607a]"
                                : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]"
                            }`}>
                            {cat.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[12px] text-[#b07a8a]">
                        {CATEGORIAS.find((c) => c.id === config.categoria)?.desc}
                      </p>
                    </div>

                    {/* Litros */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
                        Litros por base
                      </label>
                      <div className="flex gap-4 flex-wrap">
                        <LitroInput label="💧 Agua"      value={config.litrosAgua}       onChange={(v) => update("litrosAgua", v)}       costoXLitro={costo("agua")} />
                        <LitroInput label="🥛 Leche"     value={config.litrosLeche}      onChange={(v) => update("litrosLeche", v)}      costoXLitro={costo("leche")} />
                        {isClasica && (
                          <LitroInput label="🍰 Tres Leches" value={config.litrosTresLeches} onChange={(v) => update("litrosTresLeches", v)} costoXLitro={costo("tres_leches")} />
                        )}
                        <LitroInput label="🧀 Queso Crema" value={config.litrosQuesoCrema}  onChange={(v) => update("litrosQuesoCrema", v)}  costoXLitro={costo("queso_crema")} />
                        <LitroInput label="🫙 Yogurt"    value={config.litrosYogurt}     onChange={(v) => update("litrosYogurt", v)}     costoXLitro={costo("yogurt")} />

                        {totalLitros > 0 && (
                          <div className="flex flex-col justify-end pb-1">
                            <span className="text-[11px] text-[#b07a8a]">
                              Total: <strong className="text-[#7b2d42]">{totalLitros}L</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="h-px bg-[#f5dce4]" />

                    {/* Opciones catálogo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelectField label="Cobertura" value={config.coberturaId ?? NINGUNO}
                        options={catalogo.coberturas.map((c) => ({ value: c.id, label: c.nombre }))}
                        onChange={(v) => update("coberturaId", v === NINGUNO ? null : v)} />
                      <SelectField label="Sabor de cobertura" value={config.saborCoberturaId ?? NINGUNO}
                        options={catalogo.saboresCobertura.map((s) => ({ value: s.id, label: s.nombre, sublabel: s.precio != null ? `+$${s.precio}` : undefined }))}
                        onChange={(v) => update("saborCoberturaId", v === NINGUNO ? null : v)} />
                      <SelectField label="Relleno" value={config.rellenoId ?? NINGUNO}
                        options={catalogo.coberturas.map((c) => ({ value: c.id, label: c.nombre }))}
                        onChange={(v) => update("rellenoId", v === NINGUNO ? null : v)} />
                      <SelectField label="Sabor de relleno" value={config.saborRellenoId ?? NINGUNO}
                        options={catalogo.saboresCobertura.map((s) => ({ value: s.id, label: s.nombre, sublabel: s.precio != null ? `+$${s.precio}` : undefined }))}
                        onChange={(v) => update("saborRellenoId", v === NINGUNO ? null : v)} />
                      <SelectField label="Jarabe" value={config.jarabeId ?? NINGUNO}
                        options={catalogo.jarabes.map((j) => ({ value: j.id, label: j.nombre }))}
                        onChange={(v) => update("jarabeId", v === NINGUNO ? null : v)} />
                      <SelectField label="Sabor de jarabe" value={config.saborJarabeId ?? NINGUNO}
                        options={catalogo.saboresJarabe.map((s) => ({ value: s.id, label: s.nombre, sublabel: s.precio != null ? `+$${s.precio}` : undefined }))}
                        onChange={(v) => update("saborJarabeId", v === NINGUNO ? null : v)} />
                      <SelectField label="Licor" value={config.licorId ?? NINGUNO}
                        options={catalogo.licores.filter((l) => l.cantidad != null).map((l) => ({ value: l.ingredienteId, label: l.nombre, sublabel: `${l.cantidad}ml` }))}
                        onChange={(v) => update("licorId", v === NINGUNO ? null : v)} />
                    </div>

                    <div className="h-px bg-[#f5dce4]" />

                    <MultiSelectField label="Toppings" values={config.toppingIds}
                      options={catalogo.toppings.filter((t) => t.cantidad != null)
                        .map((t) => ({ value: t.ingredienteId, label: t.nombre, sublabel: `${t.cantidad}${t.unidad}` }))
                        .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }))}
                      onChange={(v) => update("toppingIds", v)} />

                    <MultiSelectField label="Empaques" values={config.empaqueIds}
                      options={catalogo.empaques.map((e) => ({ value: e.id, label: e.nombre, sublabel: `$${e.precio}` }))}
                      onChange={(v) => update("empaqueIds", v)} />

                    {/* Extras exclusivos */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">Extras de gelatina</label>
                      <div className="flex gap-3 flex-wrap">
                        {([{ key: "conTransfer" as const, label: "✨ Transfer Jelly Pop" }, { key: "conBlonda" as const, label: "🎀 Blonda" }]).map((opt) => (
                          <button key={opt.key} type="button" onClick={() => update(opt.key, !config[opt.key])}
                            className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition ${
                              config[opt.key] ? "bg-[#c0607a] text-white border-[#c0607a]" : "bg-white text-[#7b2d42] border-[#e8c4cd] hover:bg-[#fdf6f0]"
                            }`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-[#f5dce4]" />

                    {/* Cantidad */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">Cantidad</p>
                        <p className="text-[11px] text-[#b07a8a] mt-0.5">Número de gelatinas con esta configuración</p>
                      </div>
                      <QuantityStepper value={config.cantidad} onChange={(v) => update("cantidad", v)} />
                    </div>

                    {/* Desglose */}
                    {desglose && (
                      <div className="bg-[#fdf6f0] border border-[#f5dce4] rounded-xl p-4 flex flex-col gap-1">
                        <p className="text-[11px] font-bold text-[#7b2d42] uppercase tracking-wider mb-2">Desglose de costos</p>
                        {desglose.costoBaseAgua > 0       && <Row label={`Agua (${config.litrosAgua}L)`}             value={fmt(desglose.costoBaseAgua)} />}
                        {desglose.costoBaseLeche > 0      && <Row label={`Leche (${config.litrosLeche}L)`}            value={fmt(desglose.costoBaseLeche)} />}
                        {desglose.costoBaseTresLeches > 0 && <Row label={`Tres Leches (${config.litrosTresLeches}L)`} value={fmt(desglose.costoBaseTresLeches)} />}
                        {desglose.costoBaseQuesoCrema > 0 && <Row label={`Queso Crema (${config.litrosQuesoCrema}L)`} value={fmt(desglose.costoBaseQuesoCrema)} />}
                        {desglose.costoBaseYogurt > 0     && <Row label={`Yogurt (${config.litrosYogurt}L)`}          value={fmt(desglose.costoBaseYogurt)} />}
                        {desglose.costoCobertura > 0 && <Row label="Cobertura"  value={fmt(desglose.costoCobertura)} />}
                        {desglose.costoRelleno > 0   && <Row label="Relleno"    value={fmt(desglose.costoRelleno)} />}
                        {desglose.costoJarabe > 0    && <Row label="Jarabe"     value={fmt(desglose.costoJarabe)} />}
                        {desglose.costoToppings > 0  && <Row label="Toppings"   value={fmt(desglose.costoToppings)} />}
                        {desglose.costoLicor > 0     && <Row label="Licor"      value={fmt(desglose.costoLicor)} />}
                        {desglose.costoEmpaques > 0  && <Row label="Empaques"   value={fmt(desglose.costoEmpaques)} />}
                        {desglose.costoTransfer > 0  && <Row label="Transfer"   value={fmt(desglose.costoTransfer)} />}
                        {desglose.costoBlonda > 0    && <Row label="Blonda"     value={fmt(desglose.costoBlonda)} />}
                        <div className="border-t border-[#e8c4cd] my-1" />
                        <Row label="Insumos totales"   value={fmt(desglose.costoInsumos)} />
                        <Row label="Servicios (10%)"   value={fmt(desglose.servicios)} />
                        <Row label="Mano de obra"      value={fmt(desglose.manoDeObra)} />
                        <Row label="Utilidad (90%)"    value={fmt(desglose.utilidad)} />
                        <Row label="Cargo decoración"  value={fmt(desglose.cargoDecoracion)} />
                        <div className="border-t border-[#e8c4cd] my-1" />
                        <Row label="Precio por gelatina" value={fmt(desglose.precioSugerido)} highlight />
                        {config.cantidad > 1 && (
                          <Row label={`Total (×${config.cantidad})`} value={fmt(desglose.precioSugerido * config.cantidad)} highlight />
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 py-4 border-t border-[#f5dce4] bg-white shrink-0">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#e8c4cd] text-[#b07a8a] text-sm font-semibold hover:bg-[#fdf6f0] transition">
                  Cancelar
                </button>
                <button onClick={handleAddToCart} disabled={!desglose || catLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#c0607a] text-white text-sm font-bold hover:bg-[#a84d66] disabled:opacity-50 transition flex items-center justify-center gap-2">
                  {added ? (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Agregada
                    </>
                  ) : "Agregar al carrito"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
