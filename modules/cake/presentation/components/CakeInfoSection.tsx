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
        {/* PORCIONES — ocupa toda la fila */}
        <div className="lg:col-span-2">
          <h4 className="text-xl font-bold text-[#3A1F14] mb-3">
            {t("tips.portionsTitle")}
          </h4>

          <p className="text-sm text-[#6B3E26]/80 mb-6">
            {t("tips.portionsDesc")}
          </p>

          {/* Grid interno responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p>
                    {t("tips.diameter")} {size.diameter}
                  </p>
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
