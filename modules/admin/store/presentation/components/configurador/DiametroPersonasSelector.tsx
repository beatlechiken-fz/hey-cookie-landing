"use client";
// src/modules/admin/store/presentation/components/configurador/DiametroPersonasSelector.tsx

import { useState, useEffect } from "react";
import {
  personasDesdeDiametro,
  diametroRedondeado,
} from "../../../domain/entities/PastelMedida.entity";

interface Props {
  diametroCm: number;
  medidaBaseCm?: number;
  onChange: (diametroCm: number) => void;
  label?: string;
}

export function DiametroPersonasSelector({
  diametroCm,
  medidaBaseCm = 24,
  onChange,
  label,
}: Props) {
  // Estado local del input de personas — permite escribir libremente sin ser
  // sobreescrito en cada tecla por la conversión diámetro → personas
  const [personasInput, setPersonasInput] = useState<string>(
    String(personasDesdeDiametro(diametroCm, medidaBaseCm)),
  );

  // Cuando el diámetro cambia desde afuera (ej. usuario editó el campo de cm),
  // actualiza el display de personas
  useEffect(() => {
    setPersonasInput(String(personasDesdeDiametro(diametroCm, medidaBaseCm)));
  }, [diametroCm, medidaBaseCm]);

  function handleDiametroChange(val: string) {
    const d = Math.max(1, Number(val) || medidaBaseCm);
    onChange(d);
    // El useEffect se encargará de actualizar personasInput
  }

  function handlePersonasChange(val: string) {
    // Actualiza el display local inmediatamente (permite escribir libremente)
    setPersonasInput(val);
    // Solo convierte si hay un número válido
    const p = Number(val);
    if (p > 0) {
      onChange(diametroRedondeado(p, medidaBaseCm));
    }
  }

  function handlePersonasBlur() {
    // Al salir del campo, normaliza el valor mostrado al real calculado
    const p = Number(personasInput);
    if (p > 0) {
      const d = diametroRedondeado(p, medidaBaseCm);
      onChange(d);
      setPersonasInput(String(personasDesdeDiametro(d, medidaBaseCm)));
    } else {
      setPersonasInput(String(personasDesdeDiametro(diametroCm, medidaBaseCm)));
    }
  }

  const inputCls =
    "w-24 px-3 py-2 rounded-lg border border-[#e8c4cd] bg-white text-[#3d1a24] text-sm font-semibold text-center focus:outline-none focus:border-[#c0607a] focus:ring-1 focus:ring-[#c0607a]/20 transition";

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="flex items-end gap-4 flex-wrap">
        {/* Diámetro */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
            Diámetro
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              step="1"
              value={diametroCm}
              onChange={(e) => handleDiametroChange(e.target.value)}
              className={inputCls}
            />
            <span className="text-[12px] text-[#b07a8a] font-medium">cm</span>
          </div>
        </div>

        <span className="text-[16px] text-[#e8c4cd] mb-2">⇄</span>

        {/* Personas */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-[#b07a8a] uppercase tracking-wider">
            Personas
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              step="1"
              value={personasInput}
              onChange={(e) => handlePersonasChange(e.target.value)}
              onBlur={handlePersonasBlur}
              className={inputCls}
            />
            <span className="text-[12px] text-[#b07a8a] font-medium">pax</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#b07a8a]">
        {diametroCm}cm →{" "}
        <strong className="text-[#7b2d42]">
          {personasDesdeDiametro(diametroCm, medidaBaseCm)} personas
        </strong>
        {medidaBaseCm !== 24 && <span> · base {medidaBaseCm}cm</span>}
      </p>
    </div>
  );
}
