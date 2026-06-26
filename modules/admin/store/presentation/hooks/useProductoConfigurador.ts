"use client";
// src/modules/admin/productos/presentation/hooks/useProductoConfigurador.ts

import { useState, useMemo, useEffect } from "react";
import { usePastelConfigCatalogo } from "@/modules/admin/store/presentation/hooks/usePastelConfig";
import {
  calcularCostoProducto,
  type ProductoConfiguracion,
} from "../../domain/usecases/CalcularCostoProducto.usecase";
import {
  OPCIONES_VACIAS,
  type Producto,
  type ProductoOpciones,
} from "../../domain/entities/Producto.entity";

export function useProductoConfigurador(producto: Producto | null) {
  const { catalogo, loading, error } = usePastelConfigCatalogo();

  const [opciones, setOpciones] = useState<ProductoOpciones>({
    ...OPCIONES_VACIAS,
  });
  const [diametroCm, setDiametroCm] = useState<number>(
    producto?.medidaBaseCm ?? 0,
  );
  const [tamanoFijoId, setTamanoFijoId] = useState<string | null>(
    producto?.tamanosFijos[0]?.id ?? null,
  );
  const [cantidad, setCantidad] = useState(1);

  // Inicializa con las opciones por defecto del producto cuando cambia
  useEffect(() => {
    if (!producto) return;
    setOpciones({ ...OPCIONES_VACIAS, ...producto.opcionesDefault });
    setDiametroCm(producto.medidaBaseCm ?? 0);
    setTamanoFijoId(producto.tamanosFijos[0]?.id ?? null);
    setCantidad(1);
  }, [producto]);

  const update = <K extends keyof ProductoOpciones>(
    key: K,
    value: ProductoOpciones[K],
  ) => {
    setOpciones((o) => ({ ...o, [key]: value }));
  };

  const reset = () => {
    if (!producto) return;
    setOpciones({ ...OPCIONES_VACIAS, ...producto.opcionesDefault });
    setDiametroCm(producto.medidaBaseCm ?? 0);
    setTamanoFijoId(producto.tamanosFijos[0]?.id ?? null);
    setCantidad(1);
  };

  const desglose = useMemo(() => {
    if (!catalogo || !producto) return null;
    const config: ProductoConfiguracion = {
      opciones,
      diametroCm,
      tamanoFijoId,
      cantidad,
    };
    return calcularCostoProducto(producto, config, catalogo);
  }, [catalogo, producto, opciones, diametroCm, tamanoFijoId, cantidad]);

  return {
    catalogo,
    loading,
    error,
    opciones,
    diametroCm,
    tamanoFijoId,
    cantidad,
    setOpciones,
    setDiametroCm,
    setTamanoFijoId,
    setCantidad,
    update,
    reset,
    desglose,
  };
}
