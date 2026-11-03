"use client";
// Botón "Nueva orden": abre el carrito del admin (donde se agregan productos,
// cupones, etc. y se genera la orden o cotización). Desde el detalle de un
// cliente, la orden queda a su nombre. Si el carrito ya tiene productos de
// otra orden, pregunta antes de descartarlos.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "../hooks/useCartStore";
import { useCartDrawerAdmin } from "../hooks/useCartDrawerAdmin";

interface Props {
  /** Cliente al que se le arma la orden (opcional). */
  cliente?: { id: string; nombre: string };
}

export function NuevaOrdenButton({ cliente }: Props) {
  const abrir = useCartDrawerAdmin((s) => s.abrir);
  const [pendiente, setPendiente] = useState<{ n: number; nombre: string | null } | null>(null);

  function empezarNueva() {
    const carrito = useCartStore.getState();
    carrito.clear();
    if (cliente) carrito.setCliente(cliente);
    setPendiente(null);
    abrir();
  }

  function alPresionar() {
    const { items, clienteId, clienteNombre } = useCartStore.getState();
    if (items.length === 0) return empezarNueva();
    // Ya es la orden de este mismo cliente: solo se continúa.
    if (cliente && clienteId === cliente.id) return abrir();
    setPendiente({ n: items.reduce((t, i) => t + i.cantidad, 0), nombre: clienteNombre });
  }

  return (
    <>
      <button
        type="button"
        onClick={alPresionar}
        className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-hc-rose px-4 text-[13.5px] font-semibold text-white shadow-[0_2px_8px_-2px_rgba(168,77,102,0.45)] transition hover:bg-hc-rose-hover active:scale-[0.98]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nueva orden
      </button>

      <AnimatePresence>
        {pendiente && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendiente(null)}
              className="fixed inset-0 z-40 bg-hc-cacao/25 backdrop-blur-[2px]"
            />
            <motion.div
              key="dlg"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="nueva-orden-titulo"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.16 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-hc-line bg-white p-5 shadow-[0_24px_64px_-16px_rgba(58,31,20,0.28)]">
                <h2 id="nueva-orden-titulo" className="text-[16px] font-bold text-hc-ink">
                  Ya hay una orden en curso
                </h2>
                <p className="mt-1.5 text-[13.5px] text-hc-muted">
                  El carrito tiene {pendiente.n} producto{pendiente.n !== 1 ? "s" : ""}
                  {pendiente.nombre ? ` para ${pendiente.nombre}` : " sin cliente"}. ¿Qué quieres hacer?
                </p>
                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={empezarNueva}
                    className="rounded-xl bg-hc-rose py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-hc-rose-hover"
                  >
                    Descartarla y empezar nueva{cliente ? ` para ${cliente.nombre.split(" ")[0]}` : ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendiente(null);
                      abrir();
                    }}
                    className="rounded-xl border border-hc-line-strong py-2.5 text-[13.5px] font-semibold text-hc-ink transition hover:bg-hc-hover"
                  >
                    Continuar la orden en curso
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
