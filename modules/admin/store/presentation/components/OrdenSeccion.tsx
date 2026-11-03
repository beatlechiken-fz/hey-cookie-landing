// Contenedor con borde y título de una sección del detalle de una orden
// ("Orden", "Pagos"). Las acciones van a la derecha, en la línea del título.

import type { ReactNode } from "react";

interface Props {
  titulo: ReactNode;
  acciones?: ReactNode;
  children: ReactNode;
}

export function OrdenSeccion({ titulo, acciones, children }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-hc-line bg-white p-4 shadow-sm md:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-hc-ink">{titulo}</h2>
        {acciones}
      </header>
      {children}
    </section>
  );
}
