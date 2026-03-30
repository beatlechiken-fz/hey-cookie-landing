"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function CakeCard({ cake, onClick }: any) {
  const t = useTranslations();

  return (
    <div
      className="
        cursor-pointer 
        group 
        rounded-3xl 
        bg-white 
        shadow-[0_4px_20px_rgba(0,0,0,0.06)]
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
        transition-all 
        duration-300 
        p-4
      "
      onClick={() => onClick(cake)}
    >
      <div className="overflow-hidden rounded-2xl">
        <Image
          src={cake.image}
          alt={t(cake.name)}
          width={400}
          height={300}
          className="
            w-full 
            h-56 
            object-cover 
            transition-transform 
            duration-300 
            group-hover:scale-105
          "
        />
      </div>

      <h3
        className="
          text-xl 
          font-semibold 
          mt-4 
          text-[#DA6C94]
          group-hover:text-[#c15981]
          transition-colors
        "
      >
        {t(cake.name)}
      </h3>

      <p className="text-gray-600 text-sm mt-1 line-clamp-5">
        {t(cake.description)}
      </p>
    </div>
  );
}
