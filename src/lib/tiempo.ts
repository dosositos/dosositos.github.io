// Ruta relativa a propósito: así este archivo se puede ejecutar suelto con
// node para comprobar los cálculos sin levantar toda la web.
import { ZONA_HORARIA } from '../content/config.ts'

export interface Desglose {
  anios: number
  meses: number
  dias: number
  horas: number
  minutos: number
  segundos: number
  /** Días totales corridos, sin desglosar. */
  diasTotales: number
  /** Aproximación amable para presumir: "1.198 días" */
  totalMs: number
}

interface Partes {
  anio: number
  mes: number
  dia: number
  hora: number
  minuto: number
  segundo: number
}

/**
 * Descompone una fecha en sus partes tal como se ven en Nicaragua.
 * Usamos Intl en vez de los métodos locales del navegador para que
 * los contadores digan lo mismo en el teléfono de ella, en el mío,
 * y en cualquier computadora del mundo.
 */
export function partesLocales(fecha: Date, zona: string = ZONA_HORARIA): Partes {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const p: Record<string, string> = {}
  for (const parte of fmt.formatToParts(fecha)) {
    if (parte.type !== 'literal') p[parte.type] = parte.value
  }

  return {
    anio: Number(p.year),
    mes: Number(p.month),
    dia: Number(p.day),
    // Intl puede devolver "24" a medianoche en algunos motores
    hora: Number(p.hour) % 24,
    minuto: Number(p.minute),
    segundo: Number(p.second),
  }
}

function diasEnMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate()
}

/**
 * Cuánto ha pasado entre dos momentos, en años/meses/días de calendario
 * (no en "meses de 30 días", que es lo que hace casi toda la web y por
 * eso a nadie le cuadran las cuentas).
 */
export function desglosar(desde: Date, hasta: Date = new Date()): Desglose {
  const a = partesLocales(desde)
  const b = partesLocales(hasta)

  // ── Años, meses y días de calendario ──────────────────────────
  // Contamos primero los meses enteros que caben, y solo después los
  // días sueltos. Hacerlo al revés (restando día contra día) da
  // resultados imposibles cuando los meses tienen distinta duración:
  // del 31 de enero al 1 de marzo salían días negativos.
  let mesesTotales = (b.anio - a.anio) * 12 + (b.mes - a.mes)
  if (b.dia < a.dia) mesesTotales -= 1
  if (mesesTotales < 0) mesesTotales = 0

  // Fecha de inicio adelantada esos meses enteros. Si el día no existe
  // en el mes de destino (31 de febrero), se queda en el último día.
  const anioInt = a.anio + Math.floor((a.mes - 1 + mesesTotales) / 12)
  const mesInt = ((a.mes - 1 + mesesTotales) % 12) + 1
  const diaInt = Math.min(a.dia, diasEnMes(anioInt, mesInt))

  const dias = Math.round(
    (Date.UTC(b.anio, b.mes - 1, b.dia) - Date.UTC(anioInt, mesInt - 1, diaInt)) / 86_400_000,
  )

  // ── Horas, minutos y segundos ─────────────────────────────────
  // Salen del tiempo transcurrido real, no de restar relojes: así el
  // modo "al segundo" nunca se contradice con los días totales.
  const totalMs = Math.max(0, hasta.getTime() - desde.getTime())
  const resto = totalMs % 86_400_000

  return {
    anios: Math.floor(mesesTotales / 12),
    meses: mesesTotales % 12,
    dias,
    horas: Math.floor(resto / 3_600_000),
    minutos: Math.floor((resto % 3_600_000) / 60_000),
    segundos: Math.floor((resto % 60_000) / 1000),
    diasTotales: Math.floor(totalMs / 86_400_000),
    totalMs,
  }
}

/** "2 años, 5 meses y 21 días" — con las comas y la "y" donde van. */
export function frasearDesglose(d: Desglose): string {
  const trozos: string[] = []
  if (d.anios > 0) trozos.push(`${d.anios} ${d.anios === 1 ? 'año' : 'años'}`)
  if (d.meses > 0) trozos.push(`${d.meses} ${d.meses === 1 ? 'mes' : 'meses'}`)
  if (d.dias > 0 || trozos.length === 0) trozos.push(`${d.dias} ${d.dias === 1 ? 'día' : 'días'}`)

  if (trozos.length === 1) return trozos[0]
  return `${trozos.slice(0, -1).join(', ')} y ${trozos[trozos.length - 1]}`
}

/** 1198 -> "1.198" (punto de miles, como se escribe aquí) */
export function conSeparador(n: number): string {
  return n.toLocaleString('es-NI')
}

/** Medianoche en Nicaragua del día indicado, como Date real. */
export function fechaNI(anio: number, mes: number, dia: number, hora = 0): Date {
  const mm = String(mes).padStart(2, '0')
  const dd = String(dia).padStart(2, '0')
  const hh = String(hora).padStart(2, '0')
  return new Date(`${anio}-${mm}-${dd}T${hh}:00:00-06:00`)
}

/** Próxima vez que se repita ese día y mes (este año o el que viene). */
export function proximoAniversario(mes: number, dia: number, desde: Date = new Date()): Date {
  const hoy = partesLocales(desde)
  const esteAnio = fechaNI(hoy.anio, mes, dia)
  if (esteAnio.getTime() > desde.getTime()) return esteAnio
  return fechaNI(hoy.anio + 1, mes, dia)
}

/** Próximo día 24 (nuestro mesiversario), incluido hoy si hoy es 24. */
export function proximoMesiversario(dia: number, desde: Date = new Date()): Date {
  const hoy = partesLocales(desde)
  if (hoy.dia < dia) return fechaNI(hoy.anio, hoy.mes, dia)
  const mesQueViene = hoy.mes === 12 ? 1 : hoy.mes + 1
  const anio = hoy.mes === 12 ? hoy.anio + 1 : hoy.anio
  return fechaNI(anio, mesQueViene, Math.min(dia, diasEnMes(anio, mesQueViene)))
}

/** Días completos que faltan para una fecha. */
export function diasQueFaltan(objetivo: Date, desde: Date = new Date()): number {
  const a = partesLocales(desde)
  const b = partesLocales(objetivo)
  const inicioA = Date.UTC(a.anio, a.mes - 1, a.dia)
  const inicioB = Date.UTC(b.anio, b.mes - 1, b.dia)
  return Math.round((inicioB - inicioA) / 86_400_000)
}

export const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** "24 de agosto de 2024" */
export function fechaLarga(fecha: Date): string {
  const p = partesLocales(fecha)
  return `${p.dia} de ${MESES_ES[p.mes - 1]} de ${p.anio}`
}

/**
 * El día de hoy en Nicaragua como un número: 20260824.
 *
 * Sirve de semilla para lo que tenga que cambiar una vez al día y
 * quedarse quieto el resto: el mismo día da siempre lo mismo, en
 * cualquier teléfono, y a la medianoche de aquí cambia. Con
 * `new Date().getDate()` se movería a distintas horas según la zona
 * horaria de quien mire.
 */
export function numeroDelDia(fecha: Date = new Date()): number {
  const p = partesLocales(fecha)
  return p.anio * 10_000 + p.mes * 100 + p.dia
}
