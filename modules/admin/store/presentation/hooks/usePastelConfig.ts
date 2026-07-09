"use client";
// src/modules/admin/store/presentation/hooks/usePastelConfig.ts

import { useState, useEffect, useMemo } from "react";
import type {
  PastelConfigCatalogo,
  PastelConfiguracion,
} from "../../domain/entities/PastelPersonalizado.entity";
import { CONFIGURACION_VACIA } from "../../domain/entities/PastelPersonalizado.entity";
import { calcularCostoPastel } from "../../domain/usecases/CalcularCostoPastel.usecase";

export function usePastelConfigCatalogo(
  url = "/api/admin/pastel-config",
) {
  const [catalogo, setCatalogo] = useState<PastelConfigCatalogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error ?? "Error al cargar catálogo");
        }
        const data = await res.json();
        if (active) setCatalogo(data);
      } catch (e: any) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [url]);

  return { catalogo, loading, error };
}

export function usePastelConfigurador() {
  const { catalogo, loading, error } = usePastelConfigCatalogo();
  const [config, setConfig] = useState<PastelConfiguracion>({
    ...CONFIGURACION_VACIA,
  });

  const update = <K extends keyof PastelConfiguracion>(
    key: K,
    value: PastelConfiguracion[K],
  ) => {
    setConfig((c) => ({ ...c, [key]: value }));
  };

  const reset = () => setConfig({ ...CONFIGURACION_VACIA });

  const desglose = useMemo(() => {
    if (!catalogo) return null;
    return calcularCostoPastel(config, catalogo);
  }, [config, catalogo]);

  return {
    catalogo,
    loading,
    error,
    config,
    setConfig,
    update,
    reset,
    desglose,
  };
}
