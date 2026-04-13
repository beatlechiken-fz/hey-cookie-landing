"use client";

import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import OrderForm from "@/modules/orders/presentation/components/OrderForm";
import Image from "next/image";

export default function Orders() {
  return (
    <main className="h-screen flex flex-col bg-[#FAF3E0] overflow-hidden">
      {/* ------------------ APP BAR ------------------ */}
      <div className="relative z-99999">
        <div className="flex h-[60px] md:h-[70px]">
          <div className="relative w-[100px] h-[86px] ml-3 lg:ml-8 md:-mt-1 overflow-visible">
            {/* Imagen encima */}
            <Image
              src="/img/hey-cookie-logo-opacity.webp"
              alt=""
              width={100}
              height={100}
              className="absolute"
            />
          </div>

          <AppBar />
        </div>
      </div>

      <section className="h-screen overflow-y-auto">
        <OrderForm />
      </section>

      <FooterBar />
    </main>
  );
}
