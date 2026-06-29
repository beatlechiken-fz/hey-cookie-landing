"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/modules/admin/store/presentation/hooks/useCartStore";
import type { GalletaPublica } from "./Cookies";
import type { Cupon } from "@/modules/admin/store/domain/entities/Cupon.entity";
import { calcularDescuentoCupon } from "@/modules/admin/store/domain/entities/Cupon.entity";

interface Props {
  producto: GalletaPublica;
  onClose: () => void;
}

interface CuponAplicado {
  cupon: Cupon;
  monto: number;
}

export default function CookieModal({ producto, onClose }: Props) {
  const { data: session } = useSession();
  const isUser = session?.user?.role === "user";

  const addItem = useCartStore((s) => s.addItem);
  const addCupon = useCartStore((s) => s.addCupon);

  const [qty, setQty] = useState(1);
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<CuponAplicado | null>(
    null,
  );
  const [cuponError, setCuponError] = useState<string | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const precio = producto.precioEstablecido ?? 0;
  const subtotal = precio * qty;
  const descuento = cuponAplicado
    ? calcularDescuentoCupon(cuponAplicado.cupon, subtotal)
    : 0;
  const total = Math.max(0, subtotal - descuento);

  const imageSrc = producto.imagenUrl ?? "/img/vc-product-splash.webp";

  async function aplicarCupon() {
    if (!codigoCupon.trim()) return;
    setCuponError(null);
    setValidandoCupon(true);
    try {
      const res = await fetch("/api/public/cupones/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoCupon.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCuponError(data.error ?? "Cupón inválido");
        setCuponAplicado(null);
      } else {
        setCuponAplicado({ cupon: data.cupon, monto: data.montoDescontado });
        setCuponError(null);
      }
    } catch {
      setCuponError("Error al validar el cupón");
    } finally {
      setValidandoCupon(false);
    }
  }

  function handleAdd() {
    addItem({
      nombre: producto.nombre,
      configuracion: { productoId: producto.id, tipo: "cookie" },
      cantidad: qty,
      costoUnitario: 0,
      precioUnitario: precio,
    });

    if (cuponAplicado) {
      const montoDescontado =
        cuponAplicado.cupon.tipoDescuento === "porcentaje"
          ? (precio * qty * cuponAplicado.cupon.valor) / 100
          : cuponAplicado.cupon.valor;

      addCupon({
        cuponId: cuponAplicado.cupon.id,
        codigo: cuponAplicado.cupon.codigo,
        tipoDescuento: cuponAplicado.cupon.tipoDescuento,
        valor: cuponAplicado.cupon.valor,
        montoDescontado,
      });
    }

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 900);
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(30,10,5,0.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FFFDF8] rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-10 text-2xl text-[#AA6A42]/60 hover:text-[#AA6A42] cursor-pointer transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-[2fr_3fr]">
          {/* IMAGE */}
          <div className="relative w-full aspect-square bg-[#FFF0E6]">
            <Image
              src={imageSrc}
              alt={producto.nombre}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 340px"
              priority
            />
          </div>

          {/* CONTENT */}
          <div className="flex flex-col gap-4 p-6">
            {/* TITLE + DESCRIPTION */}
            <div>
              <h2 className="text-2xl font-bold text-[#3A1F14] leading-tight font-subtitle">
                {producto.nombre}
              </h2>
              {producto.descripcion && (
                <p className="mt-2 text-sm text-[#6B3E26]/80 leading-relaxed">
                  {producto.descripcion}
                </p>
              )}
            </div>

            {/* PRICE */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#AA6A42]">
                ${precio.toFixed(0)}
              </span>
              <span className="text-sm text-[#AA6A42]/70">por pieza</span>
            </div>

            {/* DIVIDER */}
            <hr className="border-[#f0e0d0]" />

            {/* COUPON */}
            <div>
              <p className="text-xs font-semibold text-[#7b2d42] uppercase tracking-wider mb-2">
                {isUser ? "Cupón de descuento" : "Código promocional"}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. COOKIE10"
                  value={codigoCupon}
                  onChange={(e) => {
                    setCodigoCupon(e.target.value.toUpperCase());
                    setCuponAplicado(null);
                    setCuponError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && aplicarCupon()}
                  className="flex-1 border border-[#e8c4a0] rounded-lg px-3 py-2 text-sm text-[#3A1F14] bg-white outline-none focus:border-[#c0607a] transition-colors font-body"
                />
                <button
                  onClick={aplicarCupon}
                  disabled={validandoCupon || !codigoCupon.trim()}
                  className="px-3 py-2 rounded-lg bg-[#FFF0E6] border border-[#e8c4a0] text-[#AA6A42] text-sm font-semibold cursor-pointer hover:bg-[#fde8d0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {validandoCupon ? "…" : "Aplicar"}
                </button>
              </div>
              {cuponError && (
                <p className="mt-1.5 text-xs text-[#c0392b] flex items-center gap-1">
                  <span>✕</span> {cuponError}
                </p>
              )}
              {cuponAplicado && (
                <p className="mt-1.5 text-xs text-[#27ae60] font-semibold flex items-center gap-1">
                  <span>✓</span> Descuento aplicado: −${descuento.toFixed(0)}
                </p>
              )}
              {!isUser && (
                <p className="mt-1 text-[10px] text-[#AA6A42]/60">
                  Inicia sesión para usar cupones personalizados
                </p>
              )}
            </div>

            {/* QTY + TOTAL */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#7b2d42] uppercase tracking-wider">
                  Cantidad
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-md border border-[#e8c4a0] bg-[#FFF0E6] text-[#AA6A42] font-bold cursor-pointer hover:bg-[#fde8d0] transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#3A1F14]">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-7 h-7 rounded-md border border-[#e8c4a0] bg-[#FFF0E6] text-[#AA6A42] font-bold cursor-pointer hover:bg-[#fde8d0] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                {cuponAplicado && (
                  <p className="text-xs text-[#AA6A42]/60 line-through">
                    ${subtotal.toFixed(0)}
                  </p>
                )}
                <p className="text-lg font-bold text-[#3A1F14]">
                  Total: ${total.toFixed(0)}
                </p>
              </div>
            </div>

            {/* ADD BUTTON */}
            <button
              onClick={handleAdd}
              className={`w-full py-3 rounded-xl text-white font-bold text-base tracking-wide transition-colors cursor-pointer font-body flex items-center justify-center gap-2 ${
                justAdded ? "bg-[#6ab04c]" : "bg-[#DA6C94] hover:bg-[#c0607a]"
              }`}
            >
              {justAdded ? (
                "✓ Agregado al carrito"
              ) : (
                <>
                  <Image
                    src="/icons/shopping-bag.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="invert"
                  />
                  Agregar al carrito
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
