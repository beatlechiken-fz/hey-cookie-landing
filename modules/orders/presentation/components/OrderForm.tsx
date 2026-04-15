"use client";

import { useRef, useState } from "react";
import SectionSelector from "./SectionSelector";
import SectionSelectorWithFlavor from "./SectionSelectorWithFlavor";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Icons from "@/core/assets/Icons";

const BIZCOCHOS = [
  {
    value: "vainilla",
    label: "Vainilla",
    image: "/img/bizcocho-vainilla.webp",
  },
  {
    value: "chocolate",
    label: "Chocolate",
    image: "/img/bizcocho-chocolate.webp",
  },
  { value: "fresa", label: "Fresa", image: "/img/bizcocho-fresa.webp" },
  { value: "moka", label: "Moka", image: "/img/bizcocho-moka.webp" },
  {
    value: "red_velvet",
    label: "Red Velvet",
    image: "/img/bizcocho-red-velvet.webp",
  },
];

const COBERTURAS = [
  {
    value: "buttercream_queso",
    label: "Buttercream de queso crema",
    desc: "Suave y cremosa con un equilibrio entre mantequilla y queso crema",
    image: "/img/cobertura-bc-qc.webp",
  },
  {
    value: "frosting_queso",
    label: "Frosting de queso crema",
    desc: "Dulce y esponjoso con queso crema predominante",
    image: "/img/cobertura-fr-qc.webp",
  },
  {
    value: "crema_mantequilla",
    label: "Crema mantequilla",
    desc: "Clásica y elgante con mantequilla predominante",
    image: "/img/cobertura-cm.webp",
  },
  {
    value: "musseline",
    label: "Musseline",
    desc: "Textura elegante con mantequilla y vainilla predominantes",
    image: "/img/cobertura-cms.webp",
  },
  {
    value: "ganache",
    label: "Ganache de chocolate",
    desc: "Intensa y brillante para los amantes del chocolate",
    image: "/img/cobertura-gc.webp",
  },
  {
    value: "ninguno",
    label: "Sin cobertura",
    desc: "",
    image: "/img/bizcocho-vainilla.webp",
  },
];

const SABORES = [
  "Ninguno",
  "Moka",
  "Café",
  "Nutella",
  "Fresa",
  "Frutos rojos",
  "Chocolate",
  "Malvavisco",
  "Rompope",
  "Mazapán",
  "Pétalos de rosa",
];

const RELLENOS = [
  {
    value: "buttercream_queso",
    label: "Buttercream de queso crema",
    desc: "Suave y cremosa con un equilibrio entre mantequilla y queso crema",
    image: "/img/relleno-bc-qc.webp",
  },
  {
    value: "frosting_queso",
    label: "Frosting de queso crema",
    desc: "Dulce y esponjoso con queso crema predominante",
    image: "/img/relleno-fr-qc.webp",
  },
  {
    value: "musseline",
    label: "Musseline",
    desc: "Textura elegante con mantequilla y vainilla predominantes",
    image: "/img/relleno-ms.webp",
  },
  {
    value: "bariloche",
    label: "Bariloche",
    desc: "Sabor premium para los amantes del chocolate",
    image: "/img/relleno-gc.webp",
  },
  {
    value: "ninguno",
    label: "Sin relleno",
    desc: "",
    image: "/img/bizcocho-vainilla.webp",
  },
];

const JARABES = [
  {
    value: "tres_leches",
    label: "Tres leches",
    desc: "Jarabe clásico y encantador con el sabor de la leche condensada",
    image: "/img/jarabe-tl.webp",
  },
  {
    value: "tres_leches_coco",
    label: "Tres leches - coco",
    desc: "Jarabe clásico con notas de coco",
    image: "/img/jarabe-tlc.webp",
  },
  {
    value: "almibar",
    label: "Almíbar",
    desc: "Jarabe a base de agua y endulzante",
    image: "/img/jarabe-al.webp",
  },
  {
    value: "ninguno",
    label: "Sin jarabe",
    desc: "",
    image: "/img/jarabe-n.webp",
  },
];

const SABORES_JARABE = [
  "Ninguno",
  "Moka",
  "Café",
  "Nutella",
  "Fresa",
  "Frutos rojos",
  "Chocolate",
  "Malvavisco",
  "Naranja",
  "Mazapán",
  "Pétalos de rosa",
];

const TOPPINGS = [
  "Mermelada de fresa",
  "Mermelada de frutos rojos",
  "Mermelada de durazno",
  "Chocolate turin blanco",
  "Chocolate turin oscuro",
  "Chocolate kitkat",
  "Chocolate de la rosa",
  "Krankys",
  "Lunetas",
  "Chocolate sicao blanco",
  "Chocolate sicao oscuro",
  "Chocolate baileys",
  "Mazapán",
  "Malvavisco",
  "Almendra",
  "Cacao",
  "Canela",
  "Galleta",
  "Fruta",
  "Calabaza",
  "Café",
  "Coco",
  "Nuez",
  "Ninguno",
];

const stepsList = [
  { id: 0, label: "Datos" },
  { id: 1, label: "Bizcocho" },
  { id: 2, label: "Cobertura" },
  { id: 3, label: "Relleno" },
  { id: 4, label: "Jarabe" },
  { id: 5, label: "Toppings" },
  { id: 6, label: "Guia" },
];

export default function OrderForm() {
  const t = useTranslations("orders");
  const [step, setStep] = useState(0);

  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [sendSuccessful, setSendSuccessful] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cake, setCake] = useState({
    bizcocho: "",
    altura: "",
    cobertura: { type: "ninguno", flavor: "ninguno", withLiquor: false },
    relleno: { type: "ninguno", flavor: "ninguno" },
    jarabe: { type: "ninguno", flavor: "ninguno", withLiquor: false },
    toppings: [] as string[],
    observaciones: "",
    referenciaImagenUrl: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    let imageUrl = "";

    if (imageFile) {
      imageUrl = await uploadToCloudinary(imageFile);
    }

    const res = await fetch("/api/orders/save-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        cake: {
          ...cake,
          referenciaImagenUrl: imageUrl,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return;
    }

    setSendSuccessful(true);
  };

  async function uploadToCloudinary(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "hey_cookie_orders"); // desde Cloudinary

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/droopfcpf/image/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) throw new Error("Error al subir imagen");

    const data = await res.json();
    return data.secure_url; // esta es la URL final
  }

  const getLabel = (list: any[], value: string) =>
    list.find((x) => x.value === value)?.label || value;

  return (
    <main className="relative min-h-full flex flex-col overflow-hidden">
      {/* 🎨 MANCHAS DECORATIVAS */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {[
          // 🔴 GRANDES (protagonistas)
          { side: "left", top: "35%", size: 520, opacity: 0.2 },

          // 🟠 MEDIANAS
          { side: "right", top: "6%", size: 260, opacity: 0.22 },
        ].map((blob, i) => (
          <svg
            key={i}
            className={`absolute ${
              blob.side === "left"
                ? "-translate-x-1/2 left-0"
                : "translate-x-1/2 right-0"
            }`}
            style={{
              top: blob.top,
              width: blob.size,
              height: blob.size,
              opacity: blob.opacity,
            }}
            viewBox="0 0 400 400"
          >
            <circle cx="200" cy="200" r="200" fill="#C9A97E" />
          </svg>
        ))}
      </div>

      <div className=" relative max-w-[640px] w-full min-w-[340px] mx-auto py-10 px-6 space-y-10">
        {/* HEADER */}
        <h1 className="text-5xl text-center font-title text-[#DA6C94] mt-2">
          {t("title")}
          <div className="w-full flex justify-center pt-4">
            <Image src={Icons.wavesPink} alt="" width={120} height={20} />
          </div>
        </h1>

        {!sendSuccessful ? (
          <>
            {/* TIMELINE */}
            <div className="w-full flex justify-center mt-10 mb-10">
              <div className="flex items-center gap-10">
                {/*
                Determina qué pasos mostrar:
                - paso anterior (si existe)
                - paso actual
                - paso siguiente (si existe)
                */}
                {[step - 1, step, step + 1].map((i) => {
                  const s = stepsList[i];
                  if (!s) return null;

                  const isActive = step === s.id;
                  const isPrevious = step - 1 === s.id;
                  const isNext = step + 1 === s.id;

                  return (
                    <div
                      key={s.id}
                      className={`
            flex flex-col items-center transition-all duration-300
            ${isActive ? "opacity-100 scale-110" : "opacity-40 scale-90"}
          `}
                    >
                      {/* Número */}
                      <div
                        className={`
              w-12 h-12 rounded-full flex items-center justify-center
              text-lg font-bold shadow-md text-white transition-all duration-300
              ${isActive ? "bg-[#c87d87]" : "bg-[#edcecc] text-gray-600"}
            `}
                      >
                        {s.id + 1}
                      </div>

                      {/* Texto */}
                      <p
                        className={`
              mt-2 text-lg font-medium font-title transition-all duration-300
              ${isActive ? "text-[#ab7743]" : "text-[#d7bda6]"}
            `}
                      >
                        {s.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- 0. DATOS DEL CLIENTE --- */}
            {step === 0 && (
              <div className="space-y-6">
                {/* INPUT: Nombre */}
                <div className="flex flex-col gap-1">
                  <label className="text-[#ab7743] font-semibold text-lg">
                    Nombre completo
                  </label>
                  <input
                    placeholder="Escribe tu nombre"
                    className="
          w-full p-3 rounded-xl border 
          border-[#edcecc] 
          bg-[#fff8f6]
          focus:outline-none focus:ring-2 focus:ring-[#c87d87]
          text-[#6b4a2b]
          placeholder:text-[#d7bda6]
          shadow-sm
        "
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                  />
                </div>

                {/* INPUT: Teléfono */}
                <div className="flex flex-col gap-1">
                  <label className="text-[#ab7743] font-semibold text-lg">
                    Número telefónico
                  </label>
                  <input
                    placeholder="Escribe tu teléfono"
                    className="
          w-full p-3 rounded-xl border 
          border-[#edcecc] 
          bg-[#fff8f6]
          focus:outline-none focus:ring-2 focus:ring-[#c87d87]
          text-[#6b4a2b]
          placeholder:text-[#d7bda6]
          shadow-sm
        "
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                  />
                </div>

                {/* BOTÓN NEXT */}
                <button
                  disabled={!customer.name || !customer.phone}
                  onClick={() => setStep(1)}
                  className="
                    w-full py-3 mt-6 rounded-xl text-xl font-semibold
                    transition-all duration-300 shadow-md

                    /* Estado DESACTIVADO */
                    disabled:bg-[#d7bda6]          /* café clarito apagado */
                    disabled:text-[#f2e8df]        /* texto crema apagado */
                    disabled:shadow-none
                    disabled:cursor-not-allowed
                    cursor-default

                    /* Estado ACTIVADO */
                    enabled:bg-[#8a5a2f]           /* café caramelo oscuro */
                    enabled:text-[#fff7f1]         /* crema suave */
                    enabled:hover:bg-[#754a26]     /* caramelo aún más profundo */
                    cursor-pointer
                "
                >
                  {t("next")}
                </button>
              </div>
            )}

            {/* --- 1. BIZCOCHO --- */}
            {step === 1 && (
              <>
                <SectionSelector
                  title=""
                  options={BIZCOCHOS}
                  selected={cake.bizcocho}
                  showBack
                  onSelect={(value: string) =>
                    setCake({ ...cake, bizcocho: value })
                  }
                  onNext={() => setStep(2)}
                  onBack={() => setStep(0)}
                />
                <input
                  placeholder="Altura del pastel"
                  className="
                        w-full p-3 rounded-xl border 
                        border-[#edcecc] 
                        bg-[#fff8f6]
                        focus:outline-none focus:ring-2 focus:ring-[#c87d87]
                        text-[#6b4a2b]
                        placeholder:text-[#d7bda6]
                        shadow-sm
                        "
                  value={cake.altura}
                  onChange={(e) => setCake({ ...cake, altura: e.target.value })}
                />
              </>
            )}

            {/* --- 2. COBERTURA --- */}
            {step === 2 && (
              <SectionSelectorWithFlavor
                title=""
                options={COBERTURAS}
                flavors={SABORES}
                selected={cake.cobertura}
                showBack
                showLiquorToggle
                onSelect={(type: string) =>
                  setCake({ ...cake, cobertura: { ...cake.cobertura, type } })
                }
                onSelectFlavor={(flavor: string) =>
                  setCake({ ...cake, cobertura: { ...cake.cobertura, flavor } })
                }
                onSelectLiquor={(withLiquor: boolean) =>
                  setCake({
                    ...cake,
                    cobertura: { ...cake.cobertura, withLiquor },
                  })
                }
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}

            {/* --- 3. RELLENO --- */}
            {step === 3 && (
              <SectionSelectorWithFlavor
                title=""
                options={RELLENOS}
                flavors={SABORES}
                selected={cake.relleno}
                showBack
                onSelect={(type: string) =>
                  setCake({ ...cake, relleno: { ...cake.relleno, type } })
                }
                onSelectFlavor={(flavor: string) =>
                  setCake({ ...cake, relleno: { ...cake.relleno, flavor } })
                }
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}

            {/* --- 4. JARABE --- */}
            {step === 4 && (
              <SectionSelectorWithFlavor
                title=""
                options={JARABES}
                flavors={SABORES_JARABE}
                selected={cake.jarabe}
                showBack
                showLiquorToggle
                onSelect={(type: string) =>
                  setCake({ ...cake, jarabe: { ...cake.jarabe, type } })
                }
                onSelectFlavor={(flavor: string) =>
                  setCake({ ...cake, jarabe: { ...cake.jarabe, flavor } })
                }
                onSelectLiquor={(withLiquor: boolean) =>
                  setCake({ ...cake, jarabe: { ...cake.jarabe, withLiquor } })
                }
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}

            {/* --- 5. TOPPINGS --- */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Elige tus toppings</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TOPPINGS.map((t) => {
                    const isSelected = cake.toppings.includes(t);

                    return (
                      <button
                        key={t}
                        onClick={() => {
                          const exists = cake.toppings.includes(t);
                          setCake({
                            ...cake,
                            toppings: exists
                              ? cake.toppings.filter((x) => x !== t)
                              : [...cake.toppings, t],
                          });
                        }}
                        className="
              flex items-center justify-between 
              w-full px-4 py-3 
              bg-[#fff8f6]
              border border-[#edcecc]
              rounded-xl shadow-sm
              transition duration-300
            "
                      >
                        {/* Nombre del topping */}
                        <span className="text-[#6b4a2b] font-medium">{t}</span>

                        {/* Toggle */}
                        <div
                          className={`
                w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300
                ${isSelected ? "bg-[#c87d87]" : "bg-[#d7bda6]"}
              `}
                        >
                          <div
                            className={`
                  w-4 h-4 rounded-full bg-white shadow-sm transform transition-all duration-300
                  ${isSelected ? "translate-x-6" : "translate-x-0"}
                `}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(4)}
                    className="
                  w-1/2 py-3 rounded-xl text-lg font-semibold
                  transition-all duration-300 shadow-md

                  bg-[#c87d87]              /* palo de rosa */
                  text-white
                  hover:bg-[#b36b75]
                "
                  >
                    {t("back")}
                  </button>

                  {/* Botón estilo café */}
                  <button
                    onClick={() => setStep(6)}
                    className="
        w-full py-3 rounded-xl text-lg font-semibold
        transition-all duration-300 shadow-md

        enabled:bg-[#8a5a2f]
        enabled:text-[#fff7f1]
        enabled:hover:bg-[#754a26]
        cursor-pointer
      "
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
            )}

            {/* --- 6. OBSERVACIONES --- */}
            {step === 6 && (
              <div className="space-y-6">
                {/* TEXTAREA OBSERVACIONES */}
                <div className="flex flex-col gap-1">
                  <label className="text-[#ab7743] font-semibold text-lg">
                    Observaciones
                  </label>

                  <textarea
                    placeholder="Escribe instrucciones especiales, colores, estilos o cualquier detalle adicional"
                    className="
          w-full p-3 rounded-xl border 
          border-[#edcecc] 
          bg-[#fff8f6]
          focus:outline-none focus:ring-2 focus:ring-[#c87d87]
          text-[#6b4a2b]
          placeholder:text-[#d7bda6]
          shadow-sm
          min-h-[140px]
        "
                    value={cake.observaciones || ""}
                    onChange={(e) =>
                      setCake({
                        ...cake,
                        observaciones: e.target.value,
                      })
                    }
                  />
                </div>

                {/* UPLOAD DE IMAGEN */}
                <div className="flex flex-col gap-2">
                  <label className="text-[#ab7743] font-semibold text-lg">
                    Imagen de referencia (opcional)
                  </label>

                  {/* ÁREA CLICKABLE */}
                  <div
                    className="
          w-full h-14
          border-2 border-dashed border-[#edcecc]
          bg-[#fff8f6]
          rounded-xl
          flex flex-col items-center justify-center
          text-[#d7bda6]
          shadow-sm
          cursor-pointer
          hover:border-[#c87d87] hover:text-[#c87d87]
          transition
        "
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-md font-medium">
                      Haz clic para cargar una imagen
                    </span>

                    {/* INPUT REAL OCULTO */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setImageFile(file); // 🔥 lo que mandarás a Cloudinary

                        const previewUrl = URL.createObjectURL(file);

                        setCake({
                          ...cake,
                          referenciaImagenUrl: previewUrl, // 🔥 solo preview temporal
                        });
                      }}
                    />
                  </div>

                  {/* PREVIEW */}
                  {cake.referenciaImagenUrl && (
                    <img
                      src={cake.referenciaImagenUrl}
                      alt="Preview"
                      className="w-48 h-48 ml-auto mr-auto object-cover rounded-xl border border-[#edcecc] shadow-md mt-3"
                    />
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(5)}
                    className="
          w-1/2 py-3 rounded-xl text-lg font-semibold
          transition-all duration-300 shadow-md
          bg-[#c87d87] text-white hover:bg-[#b36b75]
        "
                  >
                    {t("back")}
                  </button>

                  <button
                    onClick={() => setStep(7)}
                    className="
          w-full py-3 rounded-xl text-lg font-semibold
          transition-all duration-300 shadow-md
          enabled:bg-[#8a5a2f]
          enabled:text-[#fff7f1]
          enabled:hover:bg-[#754a26]
          cursor-pointer
        "
                  >
                    Ver resumen
                  </button>
                </div>
              </div>
            )}

            {/* --- 7. RESUMEN --- */}
            {step === 7 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#6b4a2b]">Resumen</h2>

                {/* Tarjeta del resumen */}
                <div className="bg-[#f7ede8] p-6 rounded-2xl shadow-sm border border-[#e5b8c7] space-y-4">
                  {/* Cliente */}
                  <div>
                    <h3 className="font-semibold text-[#c87d87] text-lg mb-1">
                      Información del cliente
                    </h3>
                    <ul className="text-[#6b4a2b] space-y-1">
                      <li>
                        <strong>Nombre:</strong> {customer.name}
                      </li>
                      <li>
                        <strong>Teléfono:</strong> {customer.phone}
                      </li>
                    </ul>
                  </div>

                  {/* DATOS DEL PASTEL */}
                  <div>
                    <h3 className="font-semibold text-[#c87d87] text-lg mb-1">
                      Detalles del pastel
                    </h3>

                    <ul className="text-[#6b4a2b] space-y-1">
                      <li>
                        <strong>Bizcocho:</strong>{" "}
                        {cake.bizcocho
                          ? getLabel(BIZCOCHOS, cake.bizcocho)
                          : "No seleccionado"}
                      </li>

                      <li>
                        <strong>Cobertura:</strong>{" "}
                        {cake.cobertura.type
                          ? getLabel(COBERTURAS, cake.cobertura.type)
                          : "No seleccionada"}
                        {cake.cobertura.flavor && ` — ${cake.cobertura.flavor}`}
                        {cake.cobertura.withLiquor && " (con licor)"}
                      </li>

                      <li>
                        <strong>Relleno:</strong>{" "}
                        {cake.relleno.type
                          ? getLabel(RELLENOS, cake.relleno.type)
                          : "No seleccionado"}
                        {cake.relleno.flavor && ` — ${cake.relleno.flavor}`}
                      </li>

                      <li>
                        <strong>Jarabe:</strong>{" "}
                        {cake.jarabe.type
                          ? getLabel(JARABES, cake.jarabe.type)
                          : "No seleccionado"}
                        {cake.jarabe.flavor && ` — ${cake.jarabe.flavor}`}
                        {cake.jarabe.withLiquor && " (con licor)"}
                      </li>
                    </ul>
                  </div>

                  {/* Toppings */}
                  <div>
                    <h3 className="font-semibold text-[#c87d87] text-lg mb-1">
                      Toppings seleccionados
                    </h3>

                    {cake.toppings.length > 0 ? (
                      <ul className="list-disc ml-5 text-[#6b4a2b] space-y-1">
                        {cake.toppings.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#6b4a2b] italic">
                        No se seleccionaron toppings.
                      </p>
                    )}
                  </div>

                  {/* Observaciones */}
                  <div>
                    <h3 className="font-semibold text-[#c87d87] text-lg mb-1">
                      Observaciones
                    </h3>

                    {cake.observaciones && cake.observaciones !== "" ? (
                      <ul className="list-disc ml-5 text-[#6b4a2b] space-y-1">
                        {cake.observaciones}
                      </ul>
                    ) : (
                      <p className="text-[#6b4a2b] italic">
                        No hay observaciones.
                      </p>
                    )}
                  </div>

                  {/* Imagen */}
                  <div>
                    <h3 className="font-semibold text-[#c87d87] text-lg mb-1">
                      Imagen de referencia
                    </h3>

                    {cake.referenciaImagenUrl ? (
                      <div className="w-full">
                        <img
                          src={cake.referenciaImagenUrl}
                          alt="Imagen de referencia del pastel"
                          className="w-42 h-42 object-cover rounded-xl border border-[#edcecc] shadow-md"
                        />
                      </div>
                    ) : (
                      <p className="text-[#6b4a2b] italic">
                        No hay imagen de referencia.
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón pistache */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(6)}
                    className="
                  w-1/2 py-3 rounded-xl text-lg font-semibold
                  transition-all duration-300 shadow-md

                  bg-[#c87d87]              /* palo de rosa */
                  text-white
                  hover:bg-[#b36b75]
                "
                  >
                    {t("back")}
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="
        w-full py-3 rounded-xl text-lg font-semibold
        transition-all duration-300 shadow-md

        enabled:bg-[#b4d8b2]
        enabled:text-[#3a4a39]
        enabled:hover:bg-[#9fc79c]
        cursor-pointer

        disabled:bg-[#d7e7d6]
        disabled:text-[#b2c3b1]
        disabled:cursor-not-allowed
      "
                  >
                    Generar pedido
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            className="
    bg-[#fff8f6]
    border border-[#edcecc]
    rounded-2xl
    p-8
    text-center
    shadow-md
    flex flex-col items-center gap-4
  "
          >
            <h2 className="text-3xl font-title text-[#c87d87]">
              ¡Pedido recibido con mucho cariño! 🎀🍰
            </h2>

            <p className="text-[#6b4a2b] text-lg leading-relaxed">
              Gracias por confiar en nosotros para crear algo tan especial. Ya
              estamos preparando todo para que tu pastel quede{" "}
              <b>tan bonito y delicioso como lo imaginaste</b>.
            </p>

            <p className="text-[#ab7743] font-medium text-lg">
              Te avisaremos cuando esté listo ✨
            </p>

            <p className="text-[#c87d87] text-xl font-semibold mt-2">
              ¡Gracias por endulzar tu día con nosotros! 🌸✨
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
