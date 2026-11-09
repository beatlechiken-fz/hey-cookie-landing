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
