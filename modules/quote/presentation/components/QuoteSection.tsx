"use client";

import { DATA } from "@/core/data/customCakeData";
import { useState, useMemo, CSSProperties } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CakeItem {
  id: string;
  label: string;
  basePrice: number;
}

// ─── Pricing logic — replica exacta de la hoja "Pastel custom" ────────────────
//
//  F2 = diámetro elegido
//  C3  Bizcocho  = precio_24cm * (F2/24)²
//  C5  Cobertura = (precio_cob_24cm + precio_sabor_cob) * (F2/24) * 0.8
//  C7  Relleno   = (precio_rel_24cm + precio_sabor_rel) * (F2/24) / 2
//  C6  Licor     = precio_licor * (F2/20)
//  C8  Jarabe    = (precio_jarabe + precio_sabor_jar * (F2/24)) / 3
//  Toppings      = precio_topping_24cm * (F2/20)   [escala lineal igual que licor]
//  Empaque       = precio fijo (sin escala)
//
//  Subtotal ing = C3+C5+C7+C6+C8+toppings
//  Servicios    = (C3+C5+C7) * 0.10
//  Mano de obra = max((C3+C5+C7) * 0.25, 60)
//  Utilidad     = (C3+C5+C7+C8) * 0.90
//  Precio final = (SubtotalIng + Utilidad) * proporcion + Servicios + ManoDeObra + Empaque
//  (proporcion = 1 por defecto)

const BASE_D = 24;
const BASE_PERSONS = 16;

function diameterFromPersons(p: number): number {
  return BASE_D * Math.sqrt(p / BASE_PERSONS);
}

function priceOf(list: CakeItem[], id: string): number {
  if (!id) return 0;
  return list.find((i) => i.id === id)?.basePrice ?? 0;
}

interface Breakdown {
  bizcocho: number;
  cobertura: number;
  relleno: number;
  licor: number;
  jarabe: number;
  toppings: number;
  empaque: number;
  servicios: number;
  manoDeObra: number;
  utilidad: number;
  total: number;
}

function calcPrice(p: {
  diameter: number;
  cake: string;
  hasCobertura: boolean;
  cobertura: string;
  saborCobertura: string;
  hasRelleno: boolean;
  relleno: string;
  saborRelleno: string;
  hasLicor: boolean;
  licor: string;
  hasJarabe: boolean;
  jarabe: string;
  saborJarabe: string;
  hasToppings: boolean;
  toppings: string[];
  empaque: string[];
}): Breakdown {
  const d = p.diameter;
  const r = d / BASE_D;

  const biz = priceOf(DATA.cake, p.cake) * r;

  const cobBase = p.hasCobertura ? priceOf(DATA.cobertura, p.cobertura) : 0;
  const cobSabor = p.hasCobertura
    ? priceOf(DATA.saborCobertura, p.saborCobertura)
    : 0;
  const cob = (cobBase + cobSabor) * r * 0.8;

  const relBase = p.hasRelleno ? priceOf(DATA.relleno, p.relleno) : 0;
  const relSabor = p.hasRelleno
    ? priceOf(DATA.saborRelleno, p.saborRelleno)
    : 0;
  const rel = (relBase + relSabor) * r * 0.8;

  const lic = p.hasLicor ? priceOf(DATA.licor, p.licor) * (d / 20) : 0;

  const jarBase = p.hasJarabe ? priceOf(DATA.jarabe, p.jarabe) : 0;
  const jarSabor = p.hasJarabe ? priceOf(DATA.saborJarabe, p.saborJarabe) : 0;
  const jar = p.hasJarabe ? (jarBase + jarSabor * r) / 3 : 0;

  const top = p.hasToppings
    ? p.toppings.reduce(
        (acc, id) => acc + priceOf(DATA.toppings, id) * (d / 20),
        0,
      )
    : 0;

  const emp = p.empaque.reduce((acc, id) => acc + priceOf(DATA.empaque, id), 0);

  const ingBase = biz + cob + rel;
  const servicios = ingBase * 0.1;
  const manoDeObra = Math.max(ingBase * 0.25, 60);
  const utilidad = (ingBase + jar) * 1.1;
  const subtotal = ingBase + lic + jar + top;
  const total = subtotal + utilidad + servicios + manoDeObra + emp;

  return {
    bizcocho: biz,
    cobertura: cob,
    relleno: rel,
    licor: lic,
    jarabe: jar,
    toppings: top,
    empaque: emp,
    servicios,
    manoDeObra,
    utilidad,
    total,
  };
}

// ─── UI ────────────────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff8f5",
        border: "1px solid #ecddd5",
        borderRadius: 16,
        padding: "20px 22px",
        marginBottom: 16,
      }}
    >
      {title && (
        <p
          style={{
            margin: "0 0 14px",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 15,
            fontWeight: 600,
            color: "#7c3a3a",
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function StyledSelect({
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
}: {
  value: string;
  onChange: (v: string) => void;
  options: CakeItem[];
  placeholder?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 40px 11px 14px",
          borderRadius: 12,
          border: "1px solid #dcc8be",
          background: "#fffaf8",
          color: value ? "#3d1f1f" : "#a08080",
          fontFamily: "inherit",
          fontSize: 14,
          appearance: "none",
          cursor: "pointer",
          outline: "none",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
            {opt.basePrice > 0 ? ` +$${opt.basePrice}` : ""}
          </option>
        ))}
      </select>
      <span
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#b08070",
          pointerEvents: "none",
          fontSize: 12,
        }}
      >
        ▾
      </span>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 14, color: "#5a3030", fontWeight: 500 }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        style={{
          position: "relative",
          width: 48,
          height: 26,
          borderRadius: 13,
          border: "none",
          background: checked ? "#c97b7b" : "#ddd0c8",
          cursor: "pointer",
          transition: "background 0.25s",
          flexShrink: 0,
          padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 25 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.22s",
            display: "block",
            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
          }}
        />
      </button>
    </div>
  );
}

function CheckGrid({
  items,
  selected,
  onChange,
}: {
  items: CakeItem[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (id === "Ninguno") {
      onChange(selected.includes("Ninguno") ? [] : ["Ninguno"]);
      return;
    }
    const next = selected.filter((x) => x !== "Ninguno");
    onChange(next.includes(id) ? next.filter((x) => x !== id) : [...next, id]);
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 8,
        marginTop: 10,
      }}
    >
      {items.map((item) => {
        const active = selected.includes(item.id);
        return (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 10,
              border: active ? "1.5px solid #c97b7b" : "1px solid #dcc8be",
              background: active ? "#f9eded" : "#fffaf8",
              cursor: "pointer",
              textAlign: "left" as CSSProperties["textAlign"],
              transition: "all 0.15s",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#fff",
                border: active ? "2px solid #c97b7b" : "1.5px solid #b08080",
                background: active ? "#c97b7b" : "transparent",
              }}
            >
              {active && "✓"}
            </span>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#3d1f1f",
                  fontWeight: 500,
                  lineHeight: 1.3,
                }}
              >
                {item.label}
              </p>
              {item.basePrice > 0 && (
                <p style={{ margin: 0, fontSize: 11, color: "#a07070" }}>
                  ${item.basePrice}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PriceRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  if (value === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "5px 0",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span style={{ fontSize: 13, color: muted ? "#c09090" : "#e8c8c8" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: muted ? "#c09090" : "#f0d8d0",
          fontWeight: 500,
        }}
      >
        ${value.toFixed(2)}
      </span>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function QuoteSection() {
  const [sizeMode, setSizeMode] = useState<"diameter" | "persons">("diameter");
  const [sizeValue, setSizeValue] = useState<string>("24");

  const [selectedCake, setSelectedCake] = useState<string>("");

  const [hasCobertura, setHasCobertura] = useState<boolean>(false);
  const [selectedCobertura, setSelectedCobertura] = useState<string>("");
  const [selectedSaborCob, setSelectedSaborCob] = useState<string>("");

  const [hasRelleno, setHasRelleno] = useState<boolean>(false);
  const [selectedRelleno, setSelectedRelleno] = useState<string>("");
  const [selectedSaborRel, setSelectedSaborRel] = useState<string>("");

  const [hasLicor, setHasLicor] = useState<boolean>(false);
  const [selectedLicor, setSelectedLicor] = useState<string>("");

  const [hasJarabe, setHasJarabe] = useState<boolean>(false);
  const [selectedJarabe, setSelectedJarabe] = useState<string>("");
  const [selectedSaborJar, setSelectedSaborJar] = useState<string>("");

  const [hasToppings, setHasToppings] = useState<boolean>(false);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const [selectedEmpaque, setSelectedEmpaque] = useState<string[]>([]);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const diameter = useMemo<number>(() => {
    const v =
      parseFloat(sizeValue) ||
      (sizeMode === "diameter" ? BASE_D : BASE_PERSONS);
    return sizeMode === "diameter" ? v : diameterFromPersons(v);
  }, [sizeMode, sizeValue]);

  const result = useMemo<Breakdown>(
    () =>
      calcPrice({
        diameter,
        cake: selectedCake,
        hasCobertura,
        cobertura: selectedCobertura,
        saborCobertura: selectedSaborCob,
        hasRelleno,
        relleno: selectedRelleno,
        saborRelleno: selectedSaborRel,
        hasLicor,
        licor: selectedLicor,
        hasJarabe,
        jarabe: selectedJarabe,
        saborJarabe: selectedSaborJar,
        hasToppings,
        toppings: selectedToppings,
        empaque: selectedEmpaque,
      }),
    [
      diameter,
      selectedCake,
      hasCobertura,
      selectedCobertura,
      selectedSaborCob,
      hasRelleno,
      selectedRelleno,
      selectedSaborRel,
      hasLicor,
      selectedLicor,
      hasJarabe,
      selectedJarabe,
      selectedSaborJar,
      hasToppings,
      selectedToppings,
      selectedEmpaque,
    ],
  );

  const inputStyle: CSSProperties = {
    padding: "11px 14px",
    borderRadius: 12,
    border: "1px solid #dcc8be",
    background: "#fffaf8",
    color: "#3d1f1f",
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none",
    flex: 1,
    boxSizing: "border-box",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAF3E0",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: "40px 16px 80px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <p
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "#b07070",
            textTransform: "uppercase",
            margin: "0 0 6px",
          }}
        >
          Cotizador
        </p>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 34,
            fontWeight: 700,
            color: "#5a2424",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Diseña tu pastel
        </h1>
        <p style={{ color: "#a07070", fontSize: 14, margin: "8px 0 0" }}>
          Personaliza cada detalle y conoce el precio al instante
        </p>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        {/* 1. Tamaño */}
        <SectionCard title="📏 Tamaño del pastel">
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {(["diameter", "persons"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setSizeMode(mode);
                  setSizeValue(mode === "diameter" ? "24" : "16");
                }}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: 10,
                  fontFamily: "inherit",
                  border:
                    sizeMode === mode
                      ? "1.5px solid #c97b7b"
                      : "1px solid #dcc8be",
                  background: sizeMode === mode ? "#f4e0e0" : "#fffaf8",
                  color: sizeMode === mode ? "#7c3a3a" : "#8a6060",
                  fontWeight: sizeMode === mode ? 600 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {mode === "diameter" ? "Por diámetro (cm)" : "Por personas"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="number"
              value={sizeValue}
              min={sizeMode === "diameter" ? 8 : 2}
              max={sizeMode === "diameter" ? 50 : 100}
              placeholder={sizeMode === "diameter" ? "24" : "16"}
              onChange={(e) => setSizeValue(e.target.value)}
              style={inputStyle}
            />
            <span
              style={{
                fontSize: 14,
                color: "#c97b7b",
                fontWeight: 600,
                background: "#f4e0e0",
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #dcc8be",
                whiteSpace: "nowrap" as CSSProperties["whiteSpace"],
              }}
            >
              {sizeMode === "diameter" ? "cm" : "personas"}
            </span>
          </div>
          {sizeMode === "persons" && (
            <p style={{ margin: "8px 0 0", fontSize: 12, color: "#a08080" }}>
              ≈ {diameter.toFixed(1)} cm de diámetro
            </p>
          )}
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#a08080" }}>
            Referencia: 24 cm = 16 personas
          </p>
        </SectionCard>

        {/* 2. Bizcocho */}
        <SectionCard title="🎂 Bizcocho">
          <StyledSelect
            value={selectedCake}
            onChange={setSelectedCake}
            options={DATA.cake}
            placeholder="Selecciona el bizcocho"
          />
        </SectionCard>

        {/* 3. Cobertura */}
        <SectionCard title="✨ Cobertura">
          <Toggle
            checked={hasCobertura}
            label="¿Lleva cobertura?"
            onChange={(v) => {
              setHasCobertura(v);
              if (!v) {
                setSelectedCobertura("");
                setSelectedSaborCob("");
              }
            }}
          />
          {hasCobertura && (
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <StyledSelect
                value={selectedCobertura}
                onChange={setSelectedCobertura}
                options={DATA.cobertura}
                placeholder="Tipo de cobertura"
              />
              <StyledSelect
                value={selectedSaborCob}
                onChange={setSelectedSaborCob}
                options={DATA.saborCobertura}
                placeholder="Sabor de cobertura"
              />
            </div>
          )}
        </SectionCard>

        {/* 4. Relleno */}
        <SectionCard title="🍓 Relleno">
          <Toggle
            checked={hasRelleno}
            label="¿Lleva relleno?"
            onChange={(v) => {
              setHasRelleno(v);
              if (!v) {
                setSelectedRelleno("");
                setSelectedSaborRel("");
              }
            }}
          />
          {hasRelleno && (
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <StyledSelect
                value={selectedRelleno}
                onChange={setSelectedRelleno}
                options={DATA.relleno}
                placeholder="Tipo de relleno"
              />
              <StyledSelect
                value={selectedSaborRel}
                onChange={setSelectedSaborRel}
                options={DATA.saborRelleno}
                placeholder="Sabor de relleno"
              />
            </div>
          )}
        </SectionCard>

        {/* 5. Licor */}
        <SectionCard title="🥃 Licor">
          <Toggle
            checked={hasLicor}
            label="¿Lleva licor?"
            onChange={(v) => {
              setHasLicor(v);
              if (!v) setSelectedLicor("");
            }}
          />
          {hasLicor && (
            <div style={{ marginTop: 14 }}>
              <StyledSelect
                value={selectedLicor}
                onChange={setSelectedLicor}
                options={DATA.licor}
                placeholder="Elige el licor"
              />
            </div>
          )}
        </SectionCard>

        {/* 6. Jarabe */}
        <SectionCard title="🍯 Jarabe">
          <Toggle
            checked={hasJarabe}
            label="¿Lleva jarabe?"
            onChange={(v) => {
              setHasJarabe(v);
              if (!v) {
                setSelectedJarabe("");
                setSelectedSaborJar("");
              }
            }}
          />
          {hasJarabe && (
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <StyledSelect
                value={selectedJarabe}
                onChange={setSelectedJarabe}
                options={DATA.jarabe}
                placeholder="Tipo de jarabe"
              />
              <StyledSelect
                value={selectedSaborJar}
                onChange={setSelectedSaborJar}
                options={DATA.saborJarabe}
                placeholder="Sabor del jarabe"
              />
            </div>
          )}
        </SectionCard>

        {/* 7. Toppings */}
        <SectionCard title="🍫 Toppings">
          <Toggle
            checked={hasToppings}
            label="¿Lleva toppings?"
            onChange={(v) => {
              setHasToppings(v);
              if (!v) setSelectedToppings([]);
            }}
          />
          {hasToppings && (
            <CheckGrid
              items={DATA.toppings}
              selected={selectedToppings}
              onChange={setSelectedToppings}
            />
          )}
        </SectionCard>

        {/* 8. Empaque */}
        <SectionCard title="📦 Empaque">
          <CheckGrid
            items={DATA.empaque}
            selected={selectedEmpaque}
            onChange={setSelectedEmpaque}
          />
        </SectionCard>

        {/* Precio final */}
        <div
          style={{
            background: "#5a2424",
            borderRadius: 20,
            padding: "28px 24px",
            marginTop: 8,
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 12,
              color: "#d4a0a0",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            Total estimado
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 64,
              fontWeight: 700,
              color: "#f7d4c8",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            ${Math.round(result.total).toLocaleString("es-MX")}
          </p>

          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            style={{
              display: "block",
              margin: "14px auto 0",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "#d4a0a0",
              fontSize: 12,
              padding: "6px 16px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {showBreakdown ? "Ocultar desglose ▴" : "Ver desglose ▾"}
          </button>

          {showBreakdown && (
            <div
              style={{
                marginTop: 14,
                borderTop: "1px solid rgba(255,255,255,0.1)",
                paddingTop: 14,
              }}
            >
              <PriceRow label="Bizcocho" value={result.bizcocho} />
              <PriceRow label="Cobertura" value={result.cobertura} />
              <PriceRow label="Relleno" value={result.relleno} />
              <PriceRow label="Licor" value={result.licor} />
              <PriceRow label="Jarabe" value={result.jarabe} />
              <PriceRow label="Toppings" value={result.toppings} />
              <PriceRow label="Empaque" value={result.empaque} muted />
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.15)",
                  margin: "8px 0",
                }}
              />
              <PriceRow
                label="Servicios (10%)"
                value={result.servicios}
                muted
              />
              <PriceRow label="Mano de obra" value={result.manoDeObra} muted />
              <PriceRow label="Utilidad (90%)" value={result.utilidad} muted />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
