// src/modules/admin/store/domain/usecases/GenerarCumpleanosBeneficio.usecase.ts
//
// Revisa qué clientes cumplen años "hoy" (zona horaria de México, para evitar
// el mismo corrimiento de día que ya se corrigió en fecha_entrega) y les
// genera un cupón individual de cumpleaños si el beneficio está activo y no
// se les ha otorgado ya este año.

import { BeneficioSupabaseDatasource } from "../../data/datasources/Beneficio.datasource";
import { CuponSupabaseDatasource } from "../../data/datasources/Cupon.datasource";
import type {
  BeneficioCumpleanosConfig,
  GenerarCumpleanosResultado,
} from "../entities/Beneficio.entity";

/** "YYYY-MM-DD" de hoy en la zona horaria de México (evita el corrimiento UTC). */
function hoyMexico(): { mes: number; dia: number; anio: number; iso: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const anio = get("year");
  const mes = get("month");
  const dia = get("day");
  return { mes, dia, anio, iso: `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}` };
}

function sumarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export class GenerarCumpleanosBeneficioUseCase {
  constructor(
    private beneficios = new BeneficioSupabaseDatasource(),
    private cupones = new CuponSupabaseDatasource(),
  ) {}

  async execute(): Promise<GenerarCumpleanosResultado> {
    const beneficio = await this.beneficios.findByTipo("cumpleanos");
    if (!beneficio || !beneficio.activo) {
      return { generados: 0, omitidos: 0, clientes: [] };
    }

    const config = beneficio.config as BeneficioCumpleanosConfig;
    const { mes, dia, anio, iso: hoy } = hoyMexico();

    const clientes = await this.beneficios.findClientesConFechaNacimiento();
    const cumpleaneros = clientes.filter((c) => {
      const [, m, d] = c.fechaNacimiento.split("-").map(Number);
      return m === mes && d === dia;
    });

    let generados = 0;
    let omitidos = 0;
    const nombres: string[] = [];

    for (const cliente of cumpleaneros) {
      const yaOtorgado = await this.beneficios.yaOtorgadoEnAnio(
        beneficio.id,
        cliente.id,
        anio,
      );
      if (yaOtorgado) {
        omitidos++;
        continue;
      }

      const codigo = `CUMPLE${anio}-${cliente.id.slice(0, 6).toUpperCase()}`;
      const cupon = await this.cupones.create({
        codigo,
        descripcion: `🎂 ¡Feliz cumpleaños, ${cliente.nombre}! ${config.descuentoPorcentaje}% de descuento + regalo: ${config.regaloDescripcion}`,
        tipo: "individual",
        tipoDescuento: "porcentaje",
        valor: config.descuentoPorcentaje,
        usosMaximos: 1,
        fechaInicio: hoy,
        fechaFin: sumarDias(hoy, config.diasValidez),
      });
      await this.cupones.asignarACliente(cupon.id, cliente.id);
      await this.beneficios.registrarOtorgamiento({
        beneficioId: beneficio.id,
        clienteId: cliente.id,
        anio,
        cuponId: cupon.id,
      });

      generados++;
      nombres.push(cliente.nombre);
    }

    return { generados, omitidos, clientes: nombres };
  }
}
