"use client";

import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useState } from "react";

export function UserPerfil() {
  const { data: session, update } = useSession();
  const locale = useLocale();

  const [nombre, setNombre] = useState(session?.user?.name ?? "");
  const [email] = useState(session?.user?.email ?? "");

  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNuevo, setPasswordNuevo] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (passwordNuevo && passwordNuevo !== passwordConfirm) {
      setErrorMsg("Las contraseñas nuevas no coinciden");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim() || undefined,
          passwordActual: passwordActual || undefined,
          passwordNuevo: passwordNuevo || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Error al guardar");
        return;
      }

      // Actualizar sesión con el nuevo nombre
      if (nombre.trim() && nombre.trim() !== session?.user?.name) {
        await update({ name: nombre.trim() });
      }

      setPasswordActual("");
      setPasswordNuevo("");
      setPasswordConfirm("");
      setSuccessMsg("Cambios guardados correctamente");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      {/* Header */}
      <div className="bg-white border-b border-[#f0e0d0]">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <a
              href={`/${locale}/user/dashboard`}
              className="p-2 rounded-xl hover:bg-[#fdf6f0] text-[#AA6A42] transition-colors"
              aria-label="Volver al dashboard"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </a>
            <div>
              <h1 className="text-2xl font-title text-[#7b2d42]">Mi perfil</h1>
              <p className="text-sm text-[#AA6A42]/70 font-sans mt-0.5">Actualiza tus datos personales</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Datos personales */}
          <section className="bg-white rounded-2xl border border-[#f0e0d0] p-6 shadow-[0_2px_8px_rgba(170,106,66,0.05)]">
            <h2 className="text-base font-bold text-[#3A1F14] mb-4">Datos personales</h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider font-sans">
                  Nombre
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="px-4 py-2.5 rounded-xl border border-[#e8c4cd] text-[#3A1F14] text-sm bg-[#fffbfc] outline-none focus:border-[#c0607a] transition-colors font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider font-sans">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="px-4 py-2.5 rounded-xl border border-[#f0e0d0] text-[#AA6A42]/60 text-sm bg-[#fdf9f5] font-sans cursor-not-allowed"
                />
                <p className="text-[11px] text-[#b07a8a] font-sans">El correo no puede modificarse</p>
              </div>
            </div>
          </section>

          {/* Cambiar contraseña */}
          <section className="bg-white rounded-2xl border border-[#f0e0d0] p-6 shadow-[0_2px_8px_rgba(170,106,66,0.05)]">
            <h2 className="text-base font-bold text-[#3A1F14] mb-1">Cambiar contraseña</h2>
            <p className="text-[12px] text-[#AA6A42]/60 font-sans mb-4">Deja los campos vacíos si no deseas cambiarla</p>

            <div className="flex flex-col gap-4">
              {[
                { label: "Contraseña actual", value: passwordActual, setter: setPasswordActual, placeholder: "••••••••" },
                { label: "Nueva contraseña",  value: passwordNuevo,  setter: setPasswordNuevo,  placeholder: "Mínimo 8 caracteres" },
                { label: "Confirmar nueva",   value: passwordConfirm, setter: setPasswordConfirm, placeholder: "Repite la nueva contraseña" },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider font-sans">
                    {label}
                  </label>
                  <input
                    type="password"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="px-4 py-2.5 rounded-xl border border-[#e8c4cd] text-[#3A1F14] text-sm bg-[#fffbfc] outline-none focus:border-[#c0607a] transition-colors font-sans"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Feedback */}
          {errorMsg && (
            <p className="text-sm text-[#c0392b] bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-sans">
              {errorMsg}
            </p>
          )}
          {successMsg && (
            <p className="text-sm text-[#27ae60] bg-green-50 border border-green-200 rounded-xl px-4 py-3 font-sans">
              ✓ {successMsg}
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#c0607a] hover:bg-[#a04060] text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-sans"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <a
              href={`/${locale}/user/dashboard`}
              className="px-5 py-3 rounded-xl border border-[#f0e0d0] text-[#AA6A42] text-sm font-semibold hover:bg-[#fdf6f0] transition-colors font-sans text-center"
            >
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
