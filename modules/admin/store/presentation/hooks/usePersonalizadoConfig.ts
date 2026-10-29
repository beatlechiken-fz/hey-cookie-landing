"use client";
// src/modules/admin/store/presentation/hooks/usePersonalizadoConfig.ts

import { useState, useEffect, useMemo } from "react";
import type {
  PersonalizadoCatalogo,
  PersonalizadoConfiguracion,
} from "../../domain/entities/Personalizado.entity";
import { PERSONALIZADO_CONFIG_VACIA } from "../../domain/entities/Personalizado.entity";
import { calcularCostoPersonalizado } from "../../domain/usecases/CalcularCostoPersonalizado.usecase";

export function usePersonalizadoConfigurador() {
  const [catalogo, setCatalogo] = useState<PersonalizadoCatalogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<PersonalizadoConfiguracion>({
    ...PERSONALIZADO_CONFIG_VACIA,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/personalizado-config");
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
  }, []);

  const update = <K extends keyof PersonalizadoConfiguracion>(
    key: K,
    value: PersonalizadoConfiguracion[K],
  ) => {
    setConfig((c) => ({ ...c, [key]: value }));
  };

  const reset = () => setConfig({ ...PERSONALIZADO_CONFIG_VACIA });

  const desglose = useMemo(() => {
    if (!catalogo) return null;
    return calcularCostoPersonalizado(config, catalogo);
  }, [config, catalogo]);

  return { catalogo, loading, error, config, setConfig, update, reset, desglose };
}
