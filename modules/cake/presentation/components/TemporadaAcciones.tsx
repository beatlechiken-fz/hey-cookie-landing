"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TEMPORADA } from "@/core/data/temporada";

/** Botones de la portada de temporada: ir a su página y/o descargar el menú en PDF. */
export default function TemporadaAcciones({ verMenu = true, pdf = true }: { verMenu?: boolean; pdf?: boolean }) {
  const t = useTranslations(TEMPORADA?.mensajes ?? "navidad");
  if (!TEMPORADA) return null;
  return (
    <>
      {verMenu && (
        <Link
          href={TEMPORADA.ruta}
          className="inline-flex rounded-full bg-nochebuena px-5 py-2.5 font-body text-sm font-semibold text-crema transition-colors hover:bg-nochebuena-hover"
        >
          {t("verMenu")}
        </Link>
      )}
      {pdf && (
        <a
          href={TEMPORADA.menuPdf}
          download
          className={
            verMenu
              ? "inline-flex rounded-full border-2 border-crema/70 px-5 py-2 font-body text-sm font-semibold text-crema transition-colors hover:bg-crema hover:text-pino"
              : "inline-flex items-center gap-2 rounded-full bg-nochebuena px-5 py-2.5 font-body text-sm font-semibold text-crema transition-colors hover:bg-nochebuena-hover"
          }
        >
          {verMenu ? "PDF" : t("descargarMenu")}
        </a>
      )}
    </>
  );
}

/** Botón bajo los destacados de temporada en la home: lleva al menú completo. */
export function TemporadaVerCompleto() {
  const t = useTranslations(TEMPORADA?.mensajes ?? "navidad");
  if (!TEMPORADA) return null;
  return (
    <div className="mt-8 flex justify-center sm:mt-10">
      <Link
        href={TEMPORADA.ruta}
        className="inline-flex items-center gap-2 rounded-full bg-nochebuena px-6 py-3 font-body text-sm font-semibold text-crema shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)] transition-colors hover:bg-nochebuena-hover"
      >
        {t("verMenuCompleto")}
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
