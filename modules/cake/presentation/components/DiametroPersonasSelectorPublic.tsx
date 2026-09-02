"use client";
// Variante pública de DiametroPersonasSelector (modules/admin/.../DiametroPersonasSelector.tsx)
// con la paleta del storefront (Caramelo Tostado) en vez de los tonos admin
// (Vino Ciruela / mauve) — ver DESIGN.md, The Two-Rooms Rule.

import { useState, useEffect } from "react";
import {
  personasDesdeDiametro,
  diametroPreciso,
} from "@/modules/admin/store/domain/entities/PastelMedida.entity";

interface Props {
  diametroCm: number;
  medidaBaseCm?: number;
  onChange: (diametroCm: number) => void;
  label?: string;
}

const MAX_DIAMETRO_CM = 60;
const MAX_PERSONAS = 200;

export function DiametroPersonasSelectorPublic({
  diametroCm,
  medidaBaseCm = 24,
  onChange,
  label,
}: Props) {
  const [personasInput, setPersonasInput] = useState<string>(
    String(personasDesdeDiametro(diametroCm, medidaBaseCm)),
  );

  useEffect(() => {
    setPersonasInput(String(personasDesdeDiametro(diametroCm, medidaBaseCm)));
  }, [diametroCm, medidaBaseCm]);

  function handleDiametroChange(val: string) {
    const raw = Math.max(1, Number(val) || medidaBaseCm);
    onChange(Math.min(raw, MAX_DIAMETRO_CM));
  }

  function handlePersonasChange(val: string) {
    setPersonasInput(val);
    // Personas siempre es entero — el diámetro resultante puede quedar en decimales.
    const p = Math.round(Number(val));
    if (p > 0) {
      onChange(diametroPreciso(Math.min(p, MAX_PERSONAS), medidaBaseCm));
    }
  }

  function handlePersonasBlur() {
    const p = Math.round(Number(personasInput));
    if (p > 0) {
      const d = diametroPreciso(Math.min(p, MAX_PERSONAS), medidaBaseCm);
      onChange(d);
      setPersonasInput(String(personasDesdeDiametro(d, medidaBaseCm)));
    } else {
      setPersonasInput(String(personasDesdeDiametro(diametroCm, medidaBaseCm)));
    }
  }

  const inputCls =
    "w-24 px-3 py-2 rounded-lg border border-[#e8c4a0] bg-white text-[#3A1F14] text-sm font-semibold text-center focus:outline-none focus:border-[#AA6A42] focus:ring-1 focus:ring-[#AA6A42]/20 transition";

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[11px] font-semibold text-[#AA6A42] uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="flex items-end gap-4 flex-wrap">
        {/* Diámetro */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-[#8A5535] uppercase tracking-wider">
            Diámetro
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max={MAX_DIAMETRO_CM}
              step="0.1"
              value={diametroCm}
              onChange={(e) => handleDiametroChange(e.target.value)}
              className={inputCls}
            />
            <span className="text-[12px] text-[#8A5535] font-medium">cm</span>
          </div>
        </div>

        <span className="text-[16px] text-[#e8c4a0] mb-2">⇄</span>

        {/* Personas */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-[#8A5535] uppercase tracking-wider">
            Personas
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max={MAX_PERSONAS}
              step="1"
              value={personasInput}
              onChange={(e) => handlePersonasChange(e.target.value)}
              onBlur={handlePersonasBlur}
              className={inputCls}
            />
            <span className="text-[12px] text-[#8A5535] font-medium">pax</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#8A5535]">
        {diametroCm}cm →{" "}
        <strong className="text-[#AA6A42]">
          {personasDesdeDiametro(diametroCm, medidaBaseCm)} personas
        </strong>
        {medidaBaseCm !== 24 && <span> · base {medidaBaseCm}cm</span>}
        {(diametroCm >= MAX_DIAMETRO_CM || Number(personasInput) >= MAX_PERSONAS) && (
          <span className="text-[#C0392B]"> · tamaño máximo, contáctanos para pedidos mayores</span>
        )}
      </p>
    </div>
  );
}
