"use client";

import { useTranslations } from "next-intl";
import CakeCard from "./CakeCard";
import AppBar from "@/core/components/app-bar/AppBar";
import Image from "next/image";
import Icons from "@/core/assets/Icons";

export const cakes = [
  {
    id: 1,
    image: "/img/cake-cafe.webp",
    name: "cakes.cafe.name",
    description: "cakes.cafe.description",
    sweetness: 3,
    bread: "cakes.cafe.bread",
    topping: "cakes.cafe.topping",
    filling: "cakes.cafe.filling",
    price1: "$380",
    price2: "$330",
    price3: "$280",
    price4: "$220",
  },
  {
    id: 2,
    image: "/img/cake-coco-frutos-rojos.webp",
    name: "cakes.cocoFrutosRojos.name",
    description: "cakes.cocoFrutosRojos.description",
    sweetness: 4,
    bread: "cakes.cocoFrutosRojos.bread",
    topping: "cakes.cocoFrutosRojos.topping",
    filling: "cakes.cocoFrutosRojos.filling",
    price1: "$420",
    price2: "$370",
    price3: "$310",
    price4: "$230",
  },
  {
    id: 3,
    image: "/img/cake-moka.webp",
    name: "cakes.moka.name",
    description: "cakes.moka.description",
    sweetness: 4,
    bread: "cakes.moka.bread",
    topping: "cakes.moka.topping",
    filling: "cakes.moka.filling",
    price1: "$525",
    price2: "$445",
    price3: "$370",
    price4: "$270",
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
