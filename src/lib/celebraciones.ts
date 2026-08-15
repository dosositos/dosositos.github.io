import { AMA_MAS, CELEBRACIONES, FECHAS, OSITA, OSITO } from '../content/config'
import { diasQueFaltan, partesLocales } from './tiempo'

export type ClaveCelebracion = keyof typeof CELEBRACIONES

export interface Celebracion {
  clave: ClaveCelebracion
  titulo: string
  mensaje: string
  flor: string
  /** Cuántos años cumple la cosa que se celebra (0 si no aplica). */
  numero: number
}

/**
 * ¿Hoy es un día especial? Devuelve la celebración de mayor peso.
 * El orden importa: si el 24 de noviembre coincide el aniversario
 * con el mesiversario, gana el aniversario.
 */
export function celebracionDeHoy(ahora: Date = new Date()): Celebracion | null {
  const hoy = partesLocales(ahora)
  const conocernos = partesLocales(new Date(FECHAS.nosConocimos.fecha))
  const novios = partesLocales(new Date(FECHAS.novios.fecha))

  if (hoy.mes === novios.mes && hoy.dia === novios.dia) {
    return {
      clave: 'aniversarioNovios',
      ...CELEBRACIONES.aniversarioNovios,
      numero: hoy.anio - novios.anio,
    }
  }

  if (hoy.mes === conocernos.mes && hoy.dia === conocernos.dia) {
    return {
      clave: 'aniversarioConocernos',
      ...CELEBRACIONES.aniversarioConocernos,
      numero: hoy.anio - conocernos.anio,
    }
  }

  if (hoy.mes === OSITO.cumple.mes && hoy.dia === OSITO.cumple.dia) {
    return { clave: 'cumpleOsito', ...CELEBRACIONES.cumpleOsito, numero: 0 }
  }

  if (hoy.mes === OSITA.cumple.mes && hoy.dia === OSITA.cumple.dia) {
    return { clave: 'cumpleOsita', ...CELEBRACIONES.cumpleOsita, numero: 0 }
  }

  // Mesiversario: cualquier día 24 que no sea uno de los de arriba
  if (hoy.dia === novios.dia) {
    const meses =
      (hoy.anio - novios.anio) * 12 + (hoy.mes - novios.mes)
    return { clave: 'mesiversario', ...CELEBRACIONES.mesiversario, numero: meses }
  }

  return null
}

/**
 * De quién es el turno de amar más hoy.
 * No se guarda nada en ningún lado: se calcula por la paridad de los
 * días transcurridos desde la fecha ancla, así que el turno es el
 * mismo en su teléfono y en el mío, hoy y dentro de diez años.
 */
export function turnoDeAmarMas(ahora: Date = new Date()): 'osito' | 'osita' {
  const ancla = new Date(`${AMA_MAS.fechaAncla}T12:00:00-06:00`)
  const dias = -diasQueFaltan(ancla, ahora) // días transcurridos desde el ancla
  const par = ((dias % 2) + 2) % 2
  if (par === 0) return AMA_MAS.turnoDelAncla
  return AMA_MAS.turnoDelAncla === 'osito' ? 'osita' : 'osito'
}
