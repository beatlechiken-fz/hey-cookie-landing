"use client";
// src/modules/admin/store/presentation/hooks/useBeneficiosAutomaticos.ts

import { useCallback, useEffect, useState } from "react";
import type {
  Beneficio,
  BeneficioOtorgamiento,
  GenerarCumpleanosResultado,
  UpdateBeneficioDTO,
} from "../../domain/entities/Beneficio.entity";

export function useBeneficiosAutomaticos() {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [otorgamientos, setOtorgamientos] = useState<BeneficioOtorgamiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/beneficios");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al cargar beneficios");
      setBeneficios(data);

      const cumpleanos = data.find((b: Beneficio) => b.tipo === "cumpleanos");
      if (cumpleanos) {
        const r2 = await fetch(`/api/admin/beneficios/cumpleanos/otorgamientos`);
        const o = await r2.json();
        if (r2.ok) setOtorgamientos(o);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = useCallback(
    async (tipo: string, dto: UpdateBeneficioDTO) => {
      const res = await fetch(`/api/admin/beneficios/${tipo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo actualizar");
      setBeneficios((prev) => prev.map((b) => (b.tipo === tipo ? data : b)));
    },
    [],
  );

  const generarCumpleanos = useCallback(async (): Promise<GenerarCumpleanosResultado> => {
    const res = await fetch("/api/admin/beneficios/cumpleanos/generar", {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "No se pudo generar");
    await load();
    return data;
  }, [load]);

  return { beneficios, otorgamientos, isLoading, error, update, generarCumpleanos };
}
