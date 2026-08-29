// Ruta relativa a propósito, como en `escondites.ts` y en `tiempo.ts`: así
// este archivo se puede importar desde un script de node para preguntarle
// dónde se asoma hoy sin levantar la web. Es lo que hace
// `npm run luna:asomo -- --semana`.
import { repartoDelDia, revolver } from './escondites.ts'

/**
 * Dónde se asoma hoy la tortuga.
 *
 * Una página por día y una sola, igual que los peluches: si saliera
 * en todas dejaría de ser un hallazgo en dos visitas. Y al final del
 * todo, debajo de la firma, para que haya que llegar hasta abajo.
 */

/** Las páginas donde puede aparecer. Los momentos quedan fuera: son muchos. */
export const PAGINAS_DEL_ASOMO = [
  '/',
  '/linea-del-tiempo',
  '/juego',
  '/diccionario',
  '/playlist',
  '/estadisticas',
  '/frasco',
]

export interface AsomoDelDia {
  ruta: string
  /** 1 entra por la izquierda, -1 entra por la derecha. */
  lado: 1 | -1
}

/**
 * La página y el lado de hoy.
 *
 * Se salta las páginas donde ese día hay un peluche escondido abajo:
 * los dos hallazgos viven en el mismo rincón de la misma pantalla, y
 * juntos se estorban — el que tenga el ojo puesto en la esquina se
 * pierde la tortuga, y al revés. Arriba a la izquierda no molesta, así
 * que esas páginas siguen contando.
 *
 * Si un día quedaran todas ocupadas, se asoma igual donde toque: es
 * peor que no salga.
 */
export function asomoDelDia(dia: number): AsomoDelDia {
  const ocupadas = new Set(
    repartoDelDia(dia)
      .filter(({ esquina }) => esquina.startsWith('abajo'))
      .map(({ escondite }) => escondite.ruta),
  )

  const libres = PAGINAS_DEL_ASOMO.filter((ruta) => !ocupadas.has(ruta))
  const donde = libres.length ? libres : PAGINAS_DEL_ASOMO

  return {
    ruta: donde[revolver(dia, 'asomo-tortuga') % donde.length],
    lado: revolver(dia, 'asomo-lado') % 2 === 0 ? 1 : -1,
  }
}
