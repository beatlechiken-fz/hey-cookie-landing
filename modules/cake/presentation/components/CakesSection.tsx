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

export default function CakesSection() {
  const t = useTranslations("cakes");

  return (
    <>
      {/* ----------- APP BAR --------------*/}
      <div className="relative z-50">
        <AppBar />
      </div>
      <section className="w-full pt-16 pb-8 px-6 md:px-12 bg-[#FAF3E0]">
        <h2 className="text-5xl text-center font-title text-[#DA6C94]">
          {t("title")}
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
      </section>
    </>
  );
}
