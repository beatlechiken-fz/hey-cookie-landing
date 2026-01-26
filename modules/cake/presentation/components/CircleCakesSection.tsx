"use client";

import { useTranslations } from "next-intl";
import CakeCard from "./CakeCard";
import AppBar from "@/core/components/app-bar/AppBar";
import Image from "next/image";
import Icons from "@/core/assets/Icons";

export const cakes = [
  {
    id: 1,
    image: "/img/cake-vanilla.webp",
    name: "cakes.vanilla.name",
    description: "cakes.vanilla.description",
    sweetness: 3,
    bread: "cakes.vanilla.bread",
    topping: "cakes.vanilla.topping",
    filling: "cakes.vanilla.filling",
    price1: "$420",
    price2: "$520",
    price3: "$620",
  },
  {
    id: 2,
    image: "/img/cake-chocolate.webp",
    name: "cakes.chocolate.name",
    description: "cakes.chocolate.description",
    sweetness: 5,
    bread: "cakes.chocolate.bread",
    topping: "cakes.chocolate.topping",
    filling: "cakes.chocolate.filling",
    price1: "$450",
    price2: "$580",
    price3: "$680",
  },
  {
    id: 3,
    image: "/img/cake-red.webp",
    name: "cakes.red.name",
    description: "cakes.red.description",
    sweetness: 4,
    bread: "cakes.red.bread",
    topping: "cakes.red.topping",
    filling: "cakes.red.filling",
    price1: "$480",
    price2: "$620",
    price3: "$720",
  },
];

export default function CircleCakesSection() {
  const t = useTranslations("cakes");

  return (
    <section className="w-full pt-34 pb-48 px-6 md:px-12 bg-gradient-to-br from-[#F8EDE3] via-[#F1DCC9] to-[#E6C7A5]">
      {/* TOP ORGANIC SHAPE */}
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full h-[140px]"
      >
        <path
          d="
      M0,80
      C120,40 240,120 360,80
      C480,40 600,120 720,80
      C840,40 960,120 1080,80
      C1200,40 1320,120 1440,80
      L1440,0
      L0,0
      Z
    "
          fill="#FAF3E0"
        />
      </svg>

      <h2 className="text-5xl text-center font-title text-[#DA6C94]">
        {t("title2")}
      </h2>

      <div className="w-full flex justify-center pt-4">
        <Image src={Icons.waves} alt="" width={120} height={20} />
      </div>

      <div
        className="
          mt-16
          grid
          gap-10
          grid-cols-[repeat(auto-fit,minmax(260px,1fr))]
          max-w-7xl
          mx-auto
        "
      >
        {cakes.map((cake) => (
          <CakeCard key={cake.id} cake={cake} bgColor="#FAF3E0" />
        ))}
      </div>

      {/* BOTTOM ORGANIC SHAPE */}
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-full h-[140px]"
      >
        <path
          d="
      M0,60
      C120,100 240,20 360,60
      C480,100 600,20 720,60
      C840,100 960,20 1080,60
      C1200,100 1320,20 1440,60
      L1440,140
      L0,140
      Z
    "
          fill="#FAF3E0"
        />
      </svg>
    </section>
  );
}
