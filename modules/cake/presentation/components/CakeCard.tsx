"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type Props = {
  cake: any;
  bgColor: string;
};

export default function CakeCard({ cake, bgColor }: Props) {
  const t = useTranslations();

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="
        rounded-[28px]
        p-5
        shadow-[0_10px_30px_rgba(107,62,38,0.15)]
        border border-[#E8D8C4]
        flex flex-col
      "
      style={{ backgroundColor: bgColor }}
    >
      {/* IMAGE */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white">
        <Image
          src={cake.image}
          alt={t(cake.name)}
          fill
          className="object-cover"
        />
      </div>

      {/* INFO */}
      <div className="pt-4 flex flex-col gap-2">
        <h3 className="text-xl font-title text-[#6B3E26]">{t(cake.name)}</h3>

        <p className="text-sm text-[#6B3E26]/70 h-[60px]">
          {t(cake.description)}
        </p>

        {/* SWEETNESS */}
        <div className="flex items-center gap-1 mt-2">
          <span className="text-[14px]">{t("cakes.tips.sweetness")}</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${
                i < cake.sweetness ? "text-[#DA6C94]" : "text-[#E8D8C4]"
              }`}
            >
              ♥
            </span>
          ))}
        </div>

        {/* PRICES */}
        <div className="mt-2">
          <span className="block text-sm font-semibold text-[#3A1F14] mb-3">
            {t("cakes.tips.quotes")}
          </span>

          <div className="grid grid-cols-2 gap-3 text-center">
            {/* OPTION */}
            {cake.price4 !== "" && (
              <div className="rounded-2xl bg-[#FAF3E0] border border-[#E6C7A5] p-3 shadow-sm">
                <span className="text-xs text-[#6B3E26]">
                  {t("cakes.tips.quote1")}
                </span>
                <span className="block mt-1 text-lg font-bold text-[#377F81]">
                  {cake.price4}
                </span>
              </div>
            )}

            {/* OPTION */}
            {cake.price3 !== "" && (
              <div className="rounded-2xl bg-[#FAF3E0] border border-[#E6C7A5] p-3 shadow-sm">
                <span className="text-xs text-[#6B3E26]">
                  {t("cakes.tips.quote2")}
                </span>
                <span className="block mt-1 text-lg font-bold text-[#377F81]">
                  {cake.price3}
                </span>
              </div>
            )}

            {/* OPTION – HIGHLIGHT */}
            {cake.price2 !== "" && (
              <div className="relative rounded-2xl bg-[#FFF7EC] border-2 border-[#DA6C94] p-3 shadow-md">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] px-2 py-[2px] rounded-full bg-[#DA6C94] text-white">
                  {t("cakes.tips.hot")}
                </span>
                <span className="text-xs text-[#6B3E26]">
                  {t("cakes.tips.quote3")}
                </span>
                <span className="block mt-1 text-lg font-bold text-[#DA6C94]">
                  {cake.price2}
                </span>
              </div>
            )}

            {/* OPTION */}
            {cake.price1 !== "" && (
              <div className="rounded-2xl bg-[#FAF3E0] border border-[#E6C7A5] p-3 shadow-sm">
                <span className="text-xs text-[#6B3E26]">
                  {t("cakes.tips.quote4")}
                </span>
                <span className="block mt-1 text-lg font-bold text-[#377F81]">
                  {cake.price1}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
