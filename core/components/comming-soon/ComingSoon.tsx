"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ComingSoon({
  title = "",
  subtitle = "",
  description = "",
  showBack = true,
}: {
  title: string;
  subtitle: string;
  description: string;
  showBack: boolean;
}) {
  const t = useTranslations("comingSoon");

  return (
    <main
      className="
        min-h-[80vh]
        flex items-center justify-center
        px-6
      "
    >
      <div
        className="
          relative
          max-w-xl w-full
          rounded-3xl
          p-10
          text-center
          backdrop-blur-md
          shadow-xl
        "
        style={{
          backgroundColor: "rgba(58, 31, 20, 0.08)",
          border: "1px solid rgba(58, 31, 20, 0.2)",
        }}
      >
        {/* ORNAMENTO SUPERIOR */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div
            className="w-20 h-1 rounded-full"
            style={{ backgroundColor: "rgba(58, 31, 20, 0.4)" }}
          />
        </div>

        {/* ICONO */}
        <div
          className="
            mx-auto mb-6
            flex items-center justify-center
            w-16 h-16
            rounded-full
          "
          style={{ backgroundColor: "rgba(58, 31, 20, 0.2)" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-[#3A1F14]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>

        {/* TEXTO */}
        <h1 className="text-3xl font-title font-bold text-[#3A1F14]">
          {title}
        </h1>

        <p className="mt-2 text-lg font-subtitle text-[#6B3E26]">{subtitle}</p>

        <p className="mt-4 text-sm text-[#5A3A2C]/80">{description}</p>

        {/* ACCIÓN */}
        {showBack && (
          <div className="mt-8">
            <Link
              href="/"
              className="
                inline-flex items-center gap-2
                px-6 py-3
                rounded-full
                text-sm font-semibold
                transition
                hover:scale-105
              "
              style={{
                backgroundColor: "rgba(58, 31, 20, 0.15)",
                color: "#3A1F14",
              }}
            >
              {t("backHome")}
              <span className="text-lg">→</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
