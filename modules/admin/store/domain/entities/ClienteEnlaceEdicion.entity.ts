// Enlace público para que un cliente actualice sus propios datos sin tener cuenta.
// El token aleatorio es la única llave: el uuid del cliente nunca sale al navegador.

/** Días que dura un enlace desde que se genera. */
export const ENLACE_EDICION_VIGENCIA_DIAS = 30;
/** Ediciones permitidas por enlace dentro de una ventana de 24 h. */
export const ENLACE_EDICION_MAX_POR_DIA = 10;

/** 32 bytes en base64url = 43 caracteres. Se valida antes de tocar la BD. */
export const ENLACE_TOKEN_REGEX = /^[A-Za-z0-9_-]{43}$/;

export const CLIENTE_NOMBRE_MAX = 80;
export const CLIENTE_DIRECCION_MAX = 250;
export const CLIENTE_EMAIL_MAX = 120;

export interface ClienteEnlaceEdicion {
  id: string;
  clienteId: string;
  token: string;
  expiraAt: string;
  revocado: boolean;
  ediciones: number;
  ventanaInicio: string | null;
  ventanaEdiciones: number;
  ultimoUsoAt: string | null;
  createdAt: string;
}

/** Lo único que ve el cliente en la página pública. */
export interface DatosClientePublico {
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fechaNacimiento: string | null;
  /** Con cuenta de acceso el email es su usuario de login: no se cambia desde aquí. */
  emailBloqueado: boolean;
  expiraAt: string;
}

export interface ActualizarDatosClienteDTO {
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fechaNacimiento: string | null;
}

/** Enlace listo para compartir (admin). */
export interface EnlaceEdicionCompartible {
  clienteId: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  url: string;
  whatsappUrl: string | null;
  expiraAt: string;
}

export class EnlaceEdicionError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function enlaceVigente(e: ClienteEnlaceEdicion, ahora = new Date()) {
  return !e.revocado && new Date(e.expiraAt) > ahora;
}

export function soloDigitos(telefono: string): string {
  return telefono.replace(/\D/g, "");
}

function texto(v: unknown, max: number, campo: string): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v !== "string") throw new EnlaceEdicionError(`${campo} inválido`, 400);
  // Quita caracteres de control y espacios repetidos
  const limpio = v.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  if (limpio.length > max)
    throw new EnlaceEdicionError(`${campo} admite máximo ${max} caracteres`, 400);
  return limpio || null;
}

/**
 * Lista blanca + validación de lo que llega del formulario público.
 * Cualquier campo no listado (notas, activo, cupones, cashback…) se ignora.
 */
export function validarDatosCliente(
  input: unknown,
  hoy = new Date(),
): ActualizarDatosClienteDTO {
  if (!input || typeof input !== "object")
    throw new EnlaceEdicionError("Datos inválidos", 400);
  const b = input as Record<string, unknown>;

  const nombre = texto(b.nombre, CLIENTE_NOMBRE_MAX, "El nombre");
  if (!nombre || nombre.length < 2)
    throw new EnlaceEdicionError("Escribe tu nombre", 400);

  const email = texto(b.email, CLIENTE_EMAIL_MAX, "El email")?.toLowerCase() ?? null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    throw new EnlaceEdicionError("El email no es válido", 400);

  const telefono = texto(b.telefono, 25, "El teléfono");
  if (telefono) {
    if (!/^\+?[\d\s()-]+$/.test(telefono))
      throw new EnlaceEdicionError("El teléfono solo admite números", 400);
    const n = soloDigitos(telefono).length;
    if (n < 10 || n > 15)
      throw new EnlaceEdicionError("El teléfono debe tener al menos 10 dígitos", 400);
  }

  const direccion = texto(b.direccion, CLIENTE_DIRECCION_MAX, "La dirección");

  const fecha = texto(b.fechaNacimiento, 10, "La fecha de nacimiento");
  if (fecha) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha))
      throw new EnlaceEdicionError("La fecha de nacimiento no es válida", 400);
    const d = new Date(`${fecha}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== fecha)
      throw new EnlaceEdicionError("La fecha de nacimiento no es válida", 400);
    const anio = d.getUTCFullYear();
    if (anio < 1900 || d > hoy)
      throw new EnlaceEdicionError("La fecha de nacimiento no es válida", 400);
  }

  if (!email && !telefono)
    throw new EnlaceEdicionError("Deja al menos un teléfono o un email", 400);

  return { nombre, telefono, email, direccion, fechaNacimiento: fecha };
}

export function mensajeWhatsappEnlace(nombre: string, url: string): string {
  const primerNombre = nombre.split(" ")[0];
  return (
    `¡Hola ${primerNombre}! 🍪 Somos Hey Cookie. ` +
    `Estamos actualizando nuestro directorio de clientes. ` +
    `¿Nos ayudas a confirmar tus datos y tu fecha de cumpleaños? ` +
    `Solo toma un minuto: ${url}`
  );
}

/** wa.me requiere el número con lada de país; si viene a 10 dígitos se asume México (52). */
export function whatsappUrl(telefono: string | null, mensaje: string): string | null {
  if (!telefono) return null;
  let digitos = soloDigitos(telefono);
  if (digitos.length === 10) digitos = `52${digitos}`;
  if (digitos.length < 11) return null;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`;
}
