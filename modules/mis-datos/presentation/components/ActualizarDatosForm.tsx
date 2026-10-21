"use client";

import { useState } from "react";
import Image from "next/image";
import Icons from "@/core/assets/Icons";
import { DatePicker } from "@/core/components/DatePicker";
import {
  CLIENTE_DIRECCION_MAX,
  CLIENTE_EMAIL_MAX,
  CLIENTE_NOMBRE_MAX,
  type DatosClientePublico,
} from "@/modules/admin/store/domain/entities/ClienteEnlaceEdicion.entity";

interface Props {
  token: string;
  datos: DatosClientePublico | null;
}

interface Form {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  fechaNacimiento: string;
}

function aForm(d: DatosClientePublico): Form {
  return {
    nombre: d.nombre,
    telefono: d.telefono ?? "",
    email: d.email ?? "",
    direccion: d.direccion ?? "",
    fechaNacimiento: d.fechaNacimiento ?? "",
  };
}

const inputCls =
  "w-full border border-[#e0c9b0] rounded-2xl px-4 py-3 text-sm bg-white text-[#3A1F14] focus:outline-none focus:border-[#AA6A42] disabled:bg-[#f5ece3] disabled:text-[#8a6a55]";
const labelCls = "text-sm font-semibold text-[#3A1F14]";

export function ActualizarDatosForm({ token, datos }: Props) {
  const [form, setForm] = useState<Form | null>(datos ? aForm(datos) : null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  if (!datos || !form) {
    return (
      <div className="max-w-xl mx-auto text-center bg-[#FFFAF5] rounded-3xl p-8 shadow-sm border border-[#f0e0d0]">
        <h1 className="text-3xl font-title text-[#DA6C94]">Enlace no disponible</h1>
        <p className="text-[#6B3E26] mt-3">
          Este enlace no existe o ya expiró. Escríbenos por WhatsApp y te enviamos uno nuevo.
        </p>
      </div>
    );
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuardado(false);
    setForm((f) => (f ? { ...f, [k]: e.target.value } : f));
  };

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setGuardando(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/mis-datos/${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          telefono: form.telefono || null,
          email: form.email || null,
          direccion: form.direccion || null,
          fechaNacimiento: form.fechaNacimiento || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No pudimos guardar tus datos");
      setForm(aForm(data.datos));
      setGuardado(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-[#FFFAF5] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#f0e0d0]">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#AA6A42]">Mis datos</p>
        <h1 className="text-3xl sm:text-4xl font-title text-[#DA6C94] mt-2 leading-tight">
          ¡Hola, {datos.nombre.split(" ")[0]}!
        </h1>
        <div className="w-full flex justify-center pt-3">
          <Image src={Icons.wavesPink} alt="" width={120} height={20} />
        </div>
        <p className="text-[#6B3E26] mt-4 leading-relaxed">
          Confirma o corrige tus datos para tener tus pedidos al día. Si nos dejas tu fecha de
          nacimiento, ¡te tendremos una sorpresa en tu cumpleaños! 🎂
        </p>
      </div>

      <form onSubmit={guardar} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="md-nombre" className={labelCls}>Nombre</label>
          <input
            id="md-nombre"
            className={inputCls}
            value={form.nombre}
            onChange={set("nombre")}
            maxLength={CLIENTE_NOMBRE_MAX}
            autoComplete="name"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="md-telefono" className={labelCls}>Teléfono (WhatsApp)</label>
            <input
              id="md-telefono"
              type="tel"
              inputMode="tel"
              className={inputCls}
              value={form.telefono}
              onChange={set("telefono")}
              maxLength={25}
              autoComplete="tel"
              placeholder="443 123 4567"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="md-fecha" className={labelCls}>Fecha de nacimiento</label>
            <DatePicker
              id="md-fecha"
              className={inputCls}
              value={form.fechaNacimiento}
              onChange={(v) => {
                setGuardado(false);
                setForm((f) => (f ? { ...f, fechaNacimiento: v } : f));
              }}
              min="1900-01-01"
              max={hoy}
              placeholder="Elige tu fecha"
              vistaInicial="anios"
              anioInicial={new Date().getFullYear() - 30}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="md-email" className={labelCls}>Email</label>
          <input
            id="md-email"
            type="email"
            className={inputCls}
            value={form.email}
            onChange={set("email")}
            maxLength={CLIENTE_EMAIL_MAX}
            autoComplete="email"
            disabled={datos.emailBloqueado}
            placeholder="correo@ejemplo.com"
          />
          {datos.emailBloqueado && (
            <p className="text-xs text-[#8a6a55]">
              Es tu usuario para iniciar sesión; para cambiarlo escríbenos por WhatsApp.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="md-direccion" className={labelCls}>Dirección de entrega</label>
          <input
            id="md-direccion"
            className={inputCls}
            value={form.direccion}
            onChange={set("direccion")}
            maxLength={CLIENTE_DIRECCION_MAX}
            autoComplete="street-address"
            placeholder="Calle, número, colonia, ciudad"
          />
        </div>

        <div aria-live="polite">
          {error && <p className="text-sm text-[#C0392B]">{error}</p>}
          {guardado && (
            <p className="rounded-2xl bg-[#FFF0E6] border border-[#e8c4a0] px-4 py-3 text-sm text-[#6B3E26]">
              ¡Listo! Tus datos quedaron guardados. Gracias por ser parte de Hey Cookie 🍪
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={guardando}
          className="mt-1 py-3 rounded-2xl bg-[#AA6A42] text-white text-sm font-bold hover:bg-[#8a5535] disabled:opacity-50 transition"
        >
          {guardando ? "Guardando…" : "Guardar mis datos"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-[#8a6a55]">
        Este enlace es personal, no lo compartas. Vence el{" "}
        {new Date(datos.expiraAt).toLocaleDateString("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        .
      </p>
    </div>
  );
}
