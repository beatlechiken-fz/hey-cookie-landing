// src/modules/admin/store/domain/usecases/ClienteEnlaceEdicion.usecase.ts

import type { ClienteRepository } from "../repositories/Cliente.repository";
import type { ClienteEnlaceEdicionRepository } from "../repositories/ClienteEnlaceEdicion.repository";
import type { Cliente } from "../entities/Cliente.entity";
import {
  ENLACE_EDICION_MAX_POR_DIA,
  ENLACE_EDICION_VIGENCIA_DIAS,
  ENLACE_TOKEN_REGEX,
  EnlaceEdicionError,
  enlaceVigente,
  mensajeWhatsappEnlace,
  validarDatosCliente,
  whatsappUrl,
  type ActualizarDatosClienteDTO,
  type ClienteEnlaceEdicion,
  type DatosClientePublico,
  type EnlaceEdicionCompartible,
} from "../entities/ClienteEnlaceEdicion.entity";

function expiraEn(dias = ENLACE_EDICION_VIGENCIA_DIAS) {
  return new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
}

function compartible(
  cliente: Cliente,
  enlace: ClienteEnlaceEdicion,
  baseUrl: string,
): EnlaceEdicionCompartible {
  const url = `${baseUrl}/es/mis-datos/${enlace.token}`;
  return {
    clienteId: cliente.id,
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    email: cliente.email,
    url,
    whatsappUrl: whatsappUrl(cliente.telefono, mensajeWhatsappEnlace(cliente.nombre, url)),
    expiraAt: enlace.expiraAt,
  };
}

/** Admin: devuelve el enlace vigente del cliente o crea uno. `regenerar` invalida los anteriores. */
export class ObtenerEnlaceEdicionUseCase {
  constructor(
    private enlaces: ClienteEnlaceEdicionRepository,
    private clientes: ClienteRepository,
  ) {}

  async execute(clienteId: string, baseUrl: string, regenerar = false) {
    const cliente = await this.clientes.findById(clienteId);
    if (!cliente) throw new EnlaceEdicionError("Cliente no encontrado", 404);
    if (regenerar) await this.enlaces.revocarDeCliente(clienteId);
    const enlace =
      (!regenerar && (await this.enlaces.findVigenteByCliente(clienteId))) ||
      (await this.enlaces.create(clienteId, expiraEn()));
    return compartible(cliente, enlace, baseUrl);
  }
}

/** Admin: consulta sin crear (para mostrar el estado en la ficha del cliente). */
export class ConsultarEnlaceEdicionUseCase {
  constructor(
    private enlaces: ClienteEnlaceEdicionRepository,
    private clientes: ClienteRepository,
  ) {}

  async execute(clienteId: string, baseUrl: string) {
    const cliente = await this.clientes.findById(clienteId);
    if (!cliente) throw new EnlaceEdicionError("Cliente no encontrado", 404);
    const enlace = await this.enlaces.findVigenteByCliente(clienteId);
    return enlace ? compartible(cliente, enlace, baseUrl) : null;
  }
}

export class RevocarEnlaceEdicionUseCase {
  constructor(private enlaces: ClienteEnlaceEdicionRepository) {}
  execute(clienteId: string) {
    return this.enlaces.revocarDeCliente(clienteId);
  }
}

/** Admin: enlaces para todos los clientes activos (reutiliza los vigentes). */
export class GenerarEnlacesMasivosUseCase {
  constructor(
    private enlaces: ClienteEnlaceEdicionRepository,
    private clientes: ClienteRepository,
  ) {}

  async execute(baseUrl: string): Promise<EnlaceEdicionCompartible[]> {
    const todos: Cliente[] = [];
    for (let page = 1; ; page++) {
      const res = await this.clientes.findAll({ activo: true, page, pageSize: 500 });
      todos.push(...res.data);
      if (page >= res.totalPages) break;
    }

    const vigentes = await this.enlaces.findVigentesByClientes(todos.map((c) => c.id));
    const porCliente = new Map<string, ClienteEnlaceEdicion>();
    for (const e of vigentes) if (!porCliente.has(e.clienteId)) porCliente.set(e.clienteId, e);

    const resultado: EnlaceEdicionCompartible[] = [];
    for (const cliente of todos) {
      const enlace =
        porCliente.get(cliente.id) ?? (await this.enlaces.create(cliente.id, expiraEn()));
      resultado.push(compartible(cliente, enlace, baseUrl));
    }
    return resultado;
  }
}

/** Público: resuelve token → cliente. Cualquier fallo es el mismo "no disponible". */
async function resolverToken(
  token: string,
  enlaces: ClienteEnlaceEdicionRepository,
  clientes: ClienteRepository,
) {
  const noDisponible = new EnlaceEdicionError("Este enlace no existe o ya expiró", 404);
  if (!ENLACE_TOKEN_REGEX.test(token)) throw noDisponible;
  const enlace = await enlaces.findByToken(token);
  if (!enlace || !enlaceVigente(enlace)) throw noDisponible;
  const cliente = await clientes.findById(enlace.clienteId);
  if (!cliente || !cliente.activo) throw noDisponible;
  return { enlace, cliente };
}

function aPublico(cliente: Cliente, enlace: ClienteEnlaceEdicion): DatosClientePublico {
  return {
    nombre: cliente.nombre,
    telefono: cliente.telefono,
    email: cliente.email,
    direccion: cliente.direccion,
    fechaNacimiento: cliente.fechaNacimiento,
    emailBloqueado: Boolean(cliente.authUserId),
    expiraAt: enlace.expiraAt,
  };
}

export class ObtenerDatosPorTokenUseCase {
  constructor(
    private enlaces: ClienteEnlaceEdicionRepository,
    private clientes: ClienteRepository,
  ) {}

  async execute(token: string): Promise<DatosClientePublico> {
    const { enlace, cliente } = await resolverToken(token, this.enlaces, this.clientes);
    return aPublico(cliente, enlace);
  }
}

const ETIQUETAS: Record<keyof ActualizarDatosClienteDTO, string> = {
  nombre: "Nombre",
  telefono: "Teléfono",
  email: "Email",
  direccion: "Dirección",
  fechaNacimiento: "Fecha de nacimiento",
};

export interface CambioDato {
  campo: string;
  antes: string | null;
  despues: string | null;
}

export class ActualizarDatosPorTokenUseCase {
  constructor(
    private enlaces: ClienteEnlaceEdicionRepository,
    private clientes: ClienteRepository,
  ) {}

  async execute(token: string, input: unknown) {
    const { enlace, cliente } = await resolverToken(token, this.enlaces, this.clientes);
    const dto = validarDatosCliente(input);

    // Con cuenta de acceso el email es el usuario de login: se conserva.
    if (cliente.authUserId) dto.email = cliente.email;

    const cambios: CambioDato[] = (Object.keys(ETIQUETAS) as (keyof ActualizarDatosClienteDTO)[])
      .filter((k) => (cliente[k] ?? null) !== (dto[k] ?? null))
      .map((k) => ({ campo: ETIQUETAS[k], antes: cliente[k] ?? null, despues: dto[k] ?? null }));

    if (cambios.length === 0) return { datos: aPublico(cliente, enlace), cambios, cliente };

    const duplicado = await this.clientes.findContactoDuplicado(
      {
        email: dto.email !== cliente.email ? dto.email : null,
        telefono: dto.telefono !== cliente.telefono ? dto.telefono : null,
      },
      cliente.id,
    );
    if (duplicado)
      throw new EnlaceEdicionError(
        duplicado === "email"
          ? "Ese email ya está registrado con otro cliente. Escríbenos por WhatsApp para ayudarte."
          : "Ese teléfono ya está registrado con otro cliente. Escríbenos por WhatsApp para ayudarte.",
        409,
      );

    if (!(await this.enlaces.registrarEdicion(enlace, ENLACE_EDICION_MAX_POR_DIA)))
      throw new EnlaceEdicionError(
        "Ya hiciste varios cambios hoy. Intenta de nuevo mañana.",
        429,
      );

    const actualizado = await this.clientes.update(cliente.id, dto);
    return { datos: aPublico(actualizado, enlace), cambios, cliente: actualizado };
  }
}
