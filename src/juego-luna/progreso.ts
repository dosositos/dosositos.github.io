import { ROPERO } from '@/content/luna'
import type { ProgresoLuna, PuestoEnLaTortuga, RanuraDeLaTortuga } from '@/types'

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

const VACIO: ProgresoLuna = {
  capitulo: 0,
  pasitos: 0,
  caidas: 0,
  mejorPorCapitulo: {},
  nombre: '',
  puesto: {},
}

export function leerProgreso(): ProgresoLuna {
  try {
    const crudo = localStorage.getItem(LLAVE)
    if (!crudo) return { ...VACIO }
    const guardado = JSON.parse(crudo) as Partial<ProgresoLuna>
    return {
      capitulo: Number(guardado.capitulo) || 0,
      pasitos: Number(guardado.pasitos) || 0,
      caidas: Number(guardado.caidas) || 0,
      mejorPorCapitulo: limpiarMejores(guardado.mejorPorCapitulo),
      nombre: limpiarNombre(guardado.nombre),
      puesto: limpiarPuesto(guardado.puesto),
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

  // Lo mejor de este capítulo: menos pasitos manda, y a igualdad de
  // pasitos, menos caídas. Subir en los mismos pasitos sin caerse es
  // mejor subida, y es justo lo que él hizo en el de Boo.
  const mejorAntes = antes.mejorPorCapitulo[capitulo]
  const ahoraEsMejor =
    !mejorAntes || pasitos < mejorAntes.pasitos ||
    (pasitos === mejorAntes.pasitos && caidas < mejorAntes.caidas)

  const ahora: ProgresoLuna = {
    ...antes,
    capitulo: Math.max(antes.capitulo, capitulo),
    pasitos: antes.pasitos + pasitos,
    caidas: antes.caidas + caidas,
    mejorPorCapitulo: {
      ...antes.mejorPorCapitulo,
      [capitulo]: ahoraEsMejor ? { pasitos, caidas } : mejorAntes,
    },
  }
  guardarProgreso(ahora)
  return ahora
}

/**
 * Lo guardado de cada capítulo, dejado en algo usable.
 *
 * Se limpia igual que el nombre y por lo mismo: esto sale de
 * `localStorage`, o sea de un sitio donde cualquiera puede escribir a
 * mano. Un número que no es número tiene que dar cero, no romper la
 * pantalla del cierre.
 */
function limpiarMejores(crudo: unknown): Record<number, { pasitos: number; caidas: number }> {
  if (!crudo || typeof crudo !== 'object') return {}
  const limpio: Record<number, { pasitos: number; caidas: number }> = {}
  for (const [llave, valor] of Object.entries(crudo as Record<string, unknown>)) {
    const capitulo = Number(llave)
    if (!Number.isInteger(capitulo) || capitulo < 1) continue
    if (!valor || typeof valor !== 'object') continue
    const { pasitos, caidas } = valor as { pasitos?: unknown; caidas?: unknown }
    const cuantos = Number(pasitos)
    if (!Number.isFinite(cuantos) || cuantos <= 0) continue
    limpio[capitulo] = { pasitos: cuantos, caidas: Math.max(0, Number(caidas) || 0) }
  }
  return limpio
}

/**
 * Lo que trae puesto, dejado en algo dibujable.
 *
 * Se limpia contra el catálogo y no solo contra el tipo. Un `id` que ya
 * no existe (porque se le cambió el nombre a un accesorio, o porque
 * alguien escribió en `localStorage` a mano) llegaría hasta el canvas y
 * ahí no hay dibujo que buscar. Cae acá y la tortuga sale sin nada,
 * que es lo peor que puede pasar.
 *
 * Que esté puesto no quiere decir que esté ganado. Eso lo decide
 * `ropero.ts` cada vez que se dibuja, y así el día que se toque una
 * regla no queda nadie con algo puesto que ya no le corresponde.
 */
function limpiarPuesto(crudo: unknown): PuestoEnLaTortuga {
  if (!crudo || typeof crudo !== 'object') return {}
  const limpio: PuestoEnLaTortuga = {}
  for (const [ranura, id] of Object.entries(crudo as Record<string, unknown>)) {
    const existe = ROPERO.find((a) => a.id === id && a.ranura === ranura)
    if (existe) limpio[ranura as RanuraDeLaTortuga] = existe.id
  }
  return limpio
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

/**
 * Ponerle o quitarle algo. `id` vacío es quitarle lo de esa ranura.
 *
 * Vive aquí junto al resto del guardado y no en `ropero.ts` porque es
 * lo mismo que `ponerleNombre`: escribir una cosa en el progreso. Lo de
 * `ropero.ts` es la otra mitad, la de decidir qué se ganó.
 */
export function ponerle(ranura: RanuraDeLaTortuga, id: string): ProgresoLuna {
  const antes = leerProgreso()
  const puesto = { ...antes.puesto }
  if (id) puesto[ranura] = id
  else delete puesto[ranura]

  const ahora: ProgresoLuna = { ...antes, puesto }
  guardarProgreso(ahora)
  return ahora
}
