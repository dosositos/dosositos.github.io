import type { ProgresoLuna } from '@/types'

/**
 * Lo que se acuerda el teléfono entre una vez y otra.
 *
 * Se guarda **el capítulo alcanzado**, no el avance de adentro del
 * capítulo: si cierra la página a mitad de la subida de Boo, vuelve a
 * empezar ese capítulo, pero nunca tiene que volver a pasar uno que ya
 * ganó.
 *
 * Es a propósito. Guardar la estrella exacta convertiría cerrar la página
 * en una manera de guardar partida, y el juego se juega de una
 * sentada; y perder los tres capítulos por haber cerrado sin querer
 * sería cruel.
 *
 * Los pasitos y las caídas de cada capítulo sí se guardan: son los
 * números que la carta de la luna necesita al final, y el marcador
 * contra el récord de él. Y el nombre que ella le puso a la tortuga,
 * que se pregunta una sola vez y después manda en todos los textos.
 */

const LLAVE = 'dosositos:luna'

/** Lo más largo que se acepta como nombre. Cabe en una línea. */
export const LARGO_DEL_NOMBRE = 16

const VACIO: ProgresoLuna = { capitulo: 0, pasitos: 0, caidas: 0, nombre: '' }

export function leerProgreso(): ProgresoLuna {
  try {
    const crudo = localStorage.getItem(LLAVE)
    if (!crudo) return { ...VACIO }
    const guardado = JSON.parse(crudo) as Partial<ProgresoLuna>
    return {
      capitulo: Number(guardado.capitulo) || 0,
      pasitos: Number(guardado.pasitos) || 0,
      caidas: Number(guardado.caidas) || 0,
      nombre: limpiarNombre(guardado.nombre),
    }
  } catch {
    // Navegador con el almacenamiento cerrado, o algo escrito a mano
    // que no se entiende. Se empieza de cero y no se rompe nada.
    return { ...VACIO }
  }
}

export function guardarProgreso(progreso: ProgresoLuna) {
  try {
    localStorage.setItem(LLAVE, JSON.stringify(progreso))
  } catch {
    /* si no se puede guardar, se juega igual */
  }
}

/** Suma lo de esta subida a lo que ya había. */
export function anotarCapitulo(capitulo: number, pasitos: number, caidas: number): ProgresoLuna {
  const antes = leerProgreso()
  const ahora: ProgresoLuna = {
    ...antes,
    capitulo: Math.max(antes.capitulo, capitulo),
    pasitos: antes.pasitos + pasitos,
    caidas: antes.caidas + caidas,
  }
  guardarProgreso(ahora)
  return ahora
}

/**
 * Deja el nombre en algo que se pueda enseñar: sin espacios de sobra,
 * sin saltos de línea y sin más largo del que cabe en una línea.
 *
 * Se recorta en vez de rechazarse. Si escribió de más, que la pantalla
 * le enseñe hasta dónde llega en vez de negarse a guardar: es un
 * regalo, no un formulario.
 */
export function limpiarNombre(nombre: unknown): string {
  if (typeof nombre !== 'string') return ''
  return nombre.replace(/\s+/g, ' ').trim().slice(0, LARGO_DEL_NOMBRE)
}

/**
 * Bautizar la tortuga. Se hace una sola vez, antes del primer
 * capítulo, y de ahí en adelante ese nombre manda en todos los textos.
 */
export function ponerleNombre(nombre: string): ProgresoLuna {
  const antes = leerProgreso()
  const ahora: ProgresoLuna = { ...antes, nombre: limpiarNombre(nombre) }
  guardarProgreso(ahora)
  return ahora
}

/**
 * Con qué capítulo se entra: el primero que todavía no ganó.
 *
 * Ganados todos los que hay escritos, se vuelve a jugar el último. Es
 * lo menos malo mientras no exista una pantalla para elegir capítulo,
 * y mientras falte alguno por escribir no llega a pasar nunca.
 *
 * Vive aquí y no en la página para que `npm run luna:probar` la pueda
 * comprobar: si esta cuenta se equivoca, ella no llega a ver un
 * capítulo entero y en pantalla no se nota nada raro.
 */
export function conCualEntra(progreso: ProgresoLuna, ultimoEscrito: number): number {
  return Math.min(Math.max(1, progreso.capitulo + 1), ultimoEscrito)
}
