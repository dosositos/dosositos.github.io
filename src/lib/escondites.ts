// Ruta relativa a propósito, como en `tiempo.ts`: así este archivo se puede
// importar desde un script de node para comprobar el reparto sin levantar la
// web. Es lo que hace `npm run peluches:hoy`.
import { RUTAS_CON_MUCHO_SCROLL, peluches } from '../content/peluches.ts'
import type { Escondite, EsquinaEscondite, Peluche } from '../content/peluches.ts'

export interface Reparto {
  peluche: Peluche
  escondite: Escondite
  esquina: EsquinaEscondite
}

/** Mezcla el día con un texto. Sirve de dado sin dejar de ser estable. */
function revolver(dia: number, texto: string): number {
  let n = dia
  for (const c of texto) n = ((n * 33) ^ (c.codePointAt(0) ?? 0)) >>> 0
  return n
}

/**
 * La esquina de verdad, después de aplicar la regla del scroll largo.
 * En la línea del tiempo y en el juego siempre arriba: mandarla al fondo
 * de una página de quince momentos es una tarea, no un guiño.
 */
function esquinaReal(escondite: Escondite): EsquinaEscondite {
  if (RUTAS_CON_MUCHO_SCROLL.includes(escondite.ruta)) return 'arriba-izquierda'
  return escondite.esquina
}

/**
 * El reparto del día: a qué página va cada uno, sin repetir página.
 *
 * Cada uno tiene su escondite preferido del día y solo si ya lo tomaron
 * se corre al siguiente de su lista. Filtrar primero y sortear después
 * parecía lo mismo, pero no lo es: al que elegía último le quedaban dos
 * opciones en vez de tres y terminaba medio año en el mismo sitio.
 *
 * Quién elige primero también cambia cada día, por lo mismo.
 *
 * El colado va siempre al final: si en algún reparto alguien se quedara
 * sin página libre, el que se pierde el día tiene que ser él y no un hijo.
 */
export function repartoDelDia(dia: number): Reparto[] {
  const tomadas = new Set<string>()
  const reparto: Reparto[] = []

  const enOrden = [...peluches].sort((a, b) => {
    const impostorA = Number(a.esImpostor ?? false)
    const impostorB = Number(b.esImpostor ?? false)
    if (impostorA !== impostorB) return impostorA - impostorB
    return revolver(dia, `orden-${a.id}`) - revolver(dia, `orden-${b.id}`)
  })

  for (const peluche of enOrden) {
    const inicio = revolver(dia, peluche.id) % peluche.escondites.length

    const escondite = peluche.escondites
      .map((_, k) => peluche.escondites[(inicio + k) % peluche.escondites.length])
      .find((e) => !tomadas.has(e.ruta))

    if (!escondite) continue // hoy no sale; mañana sí

    tomadas.add(escondite.ruta)
    reparto.push({ peluche, escondite, esquina: esquinaReal(escondite) })
  }

  return reparto
}
