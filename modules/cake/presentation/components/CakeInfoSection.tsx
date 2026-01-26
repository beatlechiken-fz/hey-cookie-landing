"use client";

import Icons from "@/core/assets/Icons";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FC } from "react";

const cakeSizes = [
  { diameter: "15 cm", people: "6 – 8 personas", slices: 6 },
  { diameter: "18 cm", people: "8 – 10 personas", slices: 8 },
  { diameter: "20 cm", people: "10 – 12 personas", slices: 10 },
  { diameter: "24 cm", people: "16 – 20 personas", slices: 12 },
];

type Props = {
  sweetness?: number;
};

const CakeInfoSection: FC<Props> = ({ sweetness = 3 }) => {
  const t = useTranslations("cakes");

  return (
    <section className="w-full pb-24 px-6 md:px-12 lg:px-24 bg-[#FAF3E0]">
      <h2 className="text-5xl text-center font-title text-[#DA6C94]">
        {t("title3")}
      </h2>

      <div className="w-full flex justify-center pt-4">
        <Image src={Icons.waves} alt="" width={120} height={20} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
        {/* DULZOR */}
        <div>
          <h4 className="text-xl font-bold text-[#3A1F14] mb-3">
            {t("tips.sweetnessTitle")}
          </h4>

          <p className="text-sm text-[#6B3E26]/80 mb-4">
            {t("tips.sweetnessDesc")}
          </p>

          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="shrink-0"
                fill={i < sweetness ? "#DA6C94" : "#E8D8C4"}
              >
                <path d="M12 21s-7-4.6-9.5-8.2C.7 9.9 2.2 6 6 6c2.1 0 3.4 1.2 4 2.2C10.6 7.2 11.9 6 14 6c3.8 0 5.3 3.9 3.5 6.8C19 16.4 12 21 12 21z" />
              </svg>
            ))}
          </div>

          <span className="block mt-2 text-xs text-[#6B3E26]">
            {t("tips.sweetnessScale")}
          </span>
        </div>

        {/* PORCIONES */}
        <div>
          <h4 className="text-xl font-bold text-[#3A1F14] mb-3">
            {t("tips.portionsTitle")}
          </h4>

          <p className="text-sm text-[#6B3E26]/80 mb-6">
            {t("tips.portionsDesc")}
          </p>

          <div className="flex flex-col gap-4">
            {cakeSizes.map((size) => (
              <div
                key={size.diameter}
                className="rounded-2xl bg-[#FFF7EC] border border-[#E6C7A5] p-4 flex items-center gap-4"
              >
                <svg width="44" height="44" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="#FAF3E0"
                    stroke="#DA6C94"
                    strokeWidth="2"
                  />
                  {[...Array(size.slices)].map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2="50"
                      y2="4"
                      stroke="#DA6C94"
                      strokeWidth="1.4"
                      transform={`rotate(${(360 / size.slices) * i} 50 50)`}
                    />
                  ))}
                </svg>

                <div className="text-sm text-[#6B3E26]">
                  <p className="font-semibold">{size.people}</p>
                  <p>Diámetro: {size.diameter}</p>
                  <p>{t("tips.height")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INGREDIENTES */}
        <div>
          <h4 className="text-xl font-bold text-[#3A1F14] mb-2">
            {t("tips.ingredientsTitle")}
          </h4>

          <p className="text-sm text-[#6B3E26]/80">
            {t("tips.ingredientsDesc")}
          </p>
        </div>

        {/* PEDIDO */}
        <div>
          <h4 className="text-xl font-bold text-[#3A1F14] mb-2">
            {t("tips.orderTitle")}
          </h4>

          <p className="text-sm text-[#6B3E26]/80">{t("tips.orderDesc")}</p>
        </div>
      </div>
    </section>
  );
};

export default CakeInfoSection;
