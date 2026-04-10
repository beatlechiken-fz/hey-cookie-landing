"use client";

import AppBar from "@/core/components/app-bar/AppBar";
import FooterBar from "@/core/components/footer-bar/FooterBar";
import OrderForm from "@/modules/orders/presentation/components/OrderForm";

export default function Orders() {
  return (
    <main className="h-screen flex flex-col bg-[#FAF3E0] overflow-hidden">
      <AppBar />

      <section className="h-screen overflow-y-auto">
        <OrderForm />
      </section>

      <FooterBar />
    </main>
  );
}
