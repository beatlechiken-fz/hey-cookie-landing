"use client";

import { useLocale } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { PasswordInput } from "@/core/components/PasswordInput";

interface DireccionItem {
  id: string;
  alias: string;
  calle: string;
  colonia: string | null;
  ciudad: string | null;
  cp: string | null;
  referencias: string | null;
  predeterminada: boolean;
}

const inputCls =
  "px-4 py-2.5 rounded-xl border border-[#e8c4cd] text-[#3A1F14] text-sm bg-[#fffbfc] outline-none focus:border-[#c0607a] transition-colors font-sans";
const labelCls =
  "text-[11px] font-semibold text-[#7b2d42] uppercase tracking-wider font-sans";
const btnPrimary =
  "py-2.5 rounded-xl bg-[#c0607a] hover:bg-[#a04060] text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed font-sans";
const btnSecondary =
  "px-4 py-2.5 rounded-xl border border-[#f0e0d0] text-[#AA6A42] text-sm font-semibold hover:bg-[#fdf6f0] transition-colors font-sans cursor-pointer";

export function UserPerfil() {
  const locale = useLocale();

  // ── Profile ──────────────────────────────────────────────
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ── Password ─────────────────────────────────────────────
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNuevo, setPasswordNuevo] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // ── Addresses ────────────────────────────────────────────
  const [loadingDirs, setLoadingDirs] = useState(true);
  const [direcciones, setDirecciones] = useState<DireccionItem[]>([]);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlias, setNewAlias] = useState("Mi dirección");
  const [newCalle, setNewCalle] = useState("");
  const [newColonia, setNewColonia] = useState("");
  const [newCiudad, setNewCiudad] = useState("");
  const [newCp, setNewCp] = useState("");
  const [newRefs, setNewRefs] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlias, setEditAlias] = useState("");
  const [editCalle, setEditCalle] = useState("");
  const [editColonia, setEditColonia] = useState("");
  const [editCiudad, setEditCiudad] = useState("");
  const [editCp, setEditCp] = useState("");
  const [editRefs, setEditRefs] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Fetchers ─────────────────────────────────────────────
  const fetchPerfil = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch("/api/user/perfil");
      if (res.ok) {
        const d = await res.json();
        setNombre(d.nombre ?? "");
        setEmail(d.email ?? "");
        setTelefono(d.telefono ?? "");
      }
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchDirecciones = useCallback(async () => {
    setLoadingDirs(true);
    try {
      const res = await fetch("/api/user/direcciones");
      if (res.ok) {
        const d = await res.json();
        setDirecciones(d.direcciones ?? []);
      }
    } finally {
      setLoadingDirs(false);
    }
  }, []);

  useEffect(() => {
    fetchPerfil();
    fetchDirecciones();
  }, [fetchPerfil, fetchDirecciones]);

  // ── Handlers ─────────────────────────────────────────────
  async function handleSavePerfil(e: React.FormEvent) {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim() || undefined, telefono }),
      });
      const data = await res.json();
      if (!res.ok) { setProfileError(data.error ?? "Error al guardar"); return; }
      setProfileSuccess("Datos guardados correctamente");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    if (!passwordActual || !passwordNuevo) {
      setPassError("Completa todos los campos");
      return;
    }
    if (passwordNuevo !== passwordConfirm) {
      setPassError("Las contraseñas nuevas no coinciden");
      return;
    }

    setSavingPass(true);
    try {
      const res = await fetch("/api/user/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordActual, passwordNuevo }),
      });
      const data = await res.json();
      if (!res.ok) { setPassError(data.error ?? "Error al cambiar contraseña"); return; }
      setPasswordActual("");
      setPasswordNuevo("");
      setPasswordConfirm("");
      setPassSuccess("Contraseña actualizada correctamente");
    } finally {
      setSavingPass(false);
    }
  }

  async function handleAddDireccion(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    if (!newCalle.trim()) { setAddError("La calle es requerida"); return; }
    setSavingNew(true);
    try {
      const res = await fetch("/api/user/direcciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alias: newAlias, calle: newCalle, colonia: newColonia,
          ciudad: newCiudad, cp: newCp, referencias: newRefs,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setAddError(d.error ?? "Error al guardar dirección");
        return;
      }
      setNewAlias("Mi dirección");
      setNewCalle(""); setNewColonia(""); setNewCiudad(""); setNewCp(""); setNewRefs("");
      setShowAddForm(false);
      await fetchDirecciones();
    } finally {
      setSavingNew(false);
    }
  }

  function startEdit(dir: DireccionItem) {
    setEditingId(dir.id);
    setEditAlias(dir.alias);
    setEditCalle(dir.calle);
    setEditColonia(dir.colonia ?? "");
    setEditCiudad(dir.ciudad ?? "");
    setEditCp(dir.cp ?? "");
    setEditRefs(dir.referencias ?? "");
    setEditError(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditError(null);
    if (!editCalle.trim()) { setEditError("La calle es requerida"); return; }
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/user/direcciones/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alias: editAlias, calle: editCalle, colonia: editColonia,
          ciudad: editCiudad, cp: editCp, referencias: editRefs,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setEditError(d.error ?? "Error al actualizar");
        return;
      }
      setEditingId(null);
      await fetchDirecciones();
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteDir(id: string) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    await fetch(`/api/user/direcciones/${id}`, { method: "DELETE" });
    await fetchDirecciones();
  }

  // ── Address form fields helper ────────────────────────────
  function AddressFields({
    alias, setAlias, calle, setCalle, colonia, setColonia,
    ciudad, setCiudad, cp, setCp, refs, setRefs,
  }: {
    alias: string; setAlias: (v: string) => void;
    calle: string; setCalle: (v: string) => void;
    colonia: string; setColonia: (v: string) => void;
    ciudad: string; setCiudad: (v: string) => void;
    cp: string; setCp: (v: string) => void;
    refs: string; setRefs: (v: string) => void;
  }) {
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Alias</label>
            <input type="text" value={alias} onChange={e => setAlias(e.target.value)} className={inputCls} placeholder="Casa, Trabajo…" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>CP</label>
            <input type="text" value={cp} onChange={e => setCp(e.target.value)} className={inputCls} placeholder="64000" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Calle y número *</label>
          <input type="text" value={calle} onChange={e => setCalle(e.target.value)} className={inputCls} placeholder="Av. Siempre Viva 742" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Colonia</label>
            <input type="text" value={colonia} onChange={e => setColonia(e.target.value)} className={inputCls} placeholder="Centro" />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Ciudad</label>
            <input type="text" value={ciudad} onChange={e => setCiudad(e.target.value)} className={inputCls} placeholder="Monterrey" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Referencias</label>
          <input type="text" value={refs} onChange={e => setRefs(e.target.value)} className={inputCls} placeholder="Casa color azul, junto al parque…" />
        </div>
      </>
    );
  }

  // ── Render ────────────────────────────────────────────────
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
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </a>
            <div>
              <h1 className="text-2xl font-title text-[#7b2d42]">Mi perfil</h1>
              <p className="text-sm text-[#AA6A42]/70 font-sans mt-0.5">Actualiza tus datos personales</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── Datos personales ── */}
        <section className="bg-white rounded-2xl border border-[#f0e0d0] p-6 shadow-[0_2px_8px_rgba(170,106,66,0.05)]">
          <h2 className="text-base font-bold text-[#3A1F14] mb-4">Datos personales</h2>

          {loadingProfile ? (
            <p className="text-sm text-[#AA6A42]/60 font-sans">Cargando…</p>
          ) : (
            <form onSubmit={handleSavePerfil} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="px-4 py-2.5 rounded-xl border border-[#f0e0d0] text-[#AA6A42]/60 text-sm bg-[#fdf9f5] font-sans cursor-not-allowed"
                />
                <p className="text-[11px] text-[#b07a8a] font-sans">El correo no puede modificarse</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="Ej. 818 123 4567"
                  className={inputCls}
                />
              </div>

              {profileError && (
                <p className="text-sm text-[#c0392b] bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-sans">{profileError}</p>
              )}
              {profileSuccess && (
                <p className="text-sm text-[#27ae60] bg-green-50 border border-green-200 rounded-xl px-4 py-3 font-sans">✓ {profileSuccess}</p>
              )}

              <button type="submit" disabled={savingProfile} className={`${btnPrimary} w-full`}>
                {savingProfile ? "Guardando…" : "Guardar datos"}
              </button>
            </form>
          )}
        </section>

        {/* ── Mis direcciones ── */}
        <section className="bg-white rounded-2xl border border-[#f0e0d0] p-6 shadow-[0_2px_8px_rgba(170,106,66,0.05)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#3A1F14]">Mis direcciones</h2>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="text-[13px] font-semibold text-[#c0607a] hover:underline font-sans cursor-pointer"
              >
                + Agregar
              </button>
            )}
          </div>

          {loadingDirs ? (
            <p className="text-sm text-[#AA6A42]/60 font-sans">Cargando…</p>
          ) : (
            <div className="flex flex-col gap-3">
              {direcciones.length === 0 && !showAddForm && (
                <p className="text-sm text-[#AA6A42]/60 font-sans">No tienes direcciones guardadas.</p>
              )}

              {direcciones.map(dir => (
                <div key={dir.id} className="rounded-xl border border-[#f0e0d0] overflow-hidden">
                  {editingId === dir.id ? (
                    <form onSubmit={handleSaveEdit} className="p-4 flex flex-col gap-3">
                      <AddressFields
                        alias={editAlias} setAlias={setEditAlias}
                        calle={editCalle} setCalle={setEditCalle}
                        colonia={editColonia} setColonia={setEditColonia}
                        ciudad={editCiudad} setCiudad={setEditCiudad}
                        cp={editCp} setCp={setEditCp}
                        refs={editRefs} setRefs={setEditRefs}
                      />
                      {editError && <p className="text-xs text-[#c0392b] font-sans">{editError}</p>}
                      <div className="flex gap-2">
                        <button type="submit" disabled={savingEdit} className={`${btnPrimary} flex-1`}>
                          {savingEdit ? "Guardando…" : "Guardar"}
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className={btnSecondary}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-[#3A1F14] font-sans">{dir.alias}</p>
                        <p className="text-sm text-[#AA6A42] font-sans">
                          {dir.calle}
                          {dir.colonia ? `, ${dir.colonia}` : ""}
                          {dir.ciudad ? `, ${dir.ciudad}` : ""}
                          {dir.cp ? ` CP ${dir.cp}` : ""}
                        </p>
                        {dir.referencias && (
                          <p className="text-xs text-[#AA6A42]/70 font-sans mt-0.5">{dir.referencias}</p>
                        )}
                      </div>
                      <div className="flex gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(dir)}
                          className="text-xs font-semibold text-[#AA6A42] hover:text-[#c0607a] transition-colors font-sans cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDir(dir.id)}
                          className="text-xs font-semibold text-[#c0392b]/70 hover:text-[#c0392b] transition-colors font-sans cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add new address form */}
              {showAddForm && (
                <form onSubmit={handleAddDireccion} className="rounded-xl border border-[#e8c4cd] p-4 flex flex-col gap-3 bg-[#fffbfc]">
                  <p className="text-sm font-bold text-[#3A1F14] font-sans">Nueva dirección</p>
                  <AddressFields
                    alias={newAlias} setAlias={setNewAlias}
                    calle={newCalle} setCalle={setNewCalle}
                    colonia={newColonia} setColonia={setNewColonia}
                    ciudad={newCiudad} setCiudad={setNewCiudad}
                    cp={newCp} setCp={setNewCp}
                    refs={newRefs} setRefs={setNewRefs}
                  />
                  {addError && <p className="text-xs text-[#c0392b] font-sans">{addError}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={savingNew} className={`${btnPrimary} flex-1`}>
                      {savingNew ? "Guardando…" : "Guardar dirección"}
                    </button>
                    <button type="button" onClick={() => { setShowAddForm(false); setAddError(null); }} className={btnSecondary}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>

        {/* ── Cambiar contraseña ── */}
        <section className="bg-white rounded-2xl border border-[#f0e0d0] p-6 shadow-[0_2px_8px_rgba(170,106,66,0.05)]">
          <h2 className="text-base font-bold text-[#3A1F14] mb-1">Cambiar contraseña</h2>
          <p className="text-[12px] text-[#AA6A42]/60 font-sans mb-4">Deja los campos vacíos si no deseas cambiarla</p>

          <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
            {([
              { label: "Contraseña actual", value: passwordActual, setter: setPasswordActual, placeholder: "••••••••" },
              { label: "Nueva contraseña", value: passwordNuevo, setter: setPasswordNuevo, placeholder: "Mínimo 8 caracteres" },
              { label: "Confirmar nueva", value: passwordConfirm, setter: setPasswordConfirm, placeholder: "Repite la nueva contraseña" },
            ] as const).map(({ label, value, setter, placeholder }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className={labelCls}>{label}</label>
                <PasswordInput
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  autoComplete="off"
                  className="px-4 py-2.5 rounded-xl border border-[#e8c4cd] text-[#3A1F14] text-sm bg-[#fffbfc] outline-none focus:border-[#c0607a] transition-colors font-sans w-full"
                />
              </div>
            ))}

            {passError && (
              <p className="text-sm text-[#c0392b] bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-sans">{passError}</p>
            )}
            {passSuccess && (
              <p className="text-sm text-[#27ae60] bg-green-50 border border-green-200 rounded-xl px-4 py-3 font-sans">✓ {passSuccess}</p>
            )}

            <button type="submit" disabled={savingPass} className={`${btnPrimary} w-full`}>
              {savingPass ? "Guardando…" : "Cambiar contraseña"}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
}
