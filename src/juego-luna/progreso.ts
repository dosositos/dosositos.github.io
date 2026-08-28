import type { ProgresoLuna } from '@/types'

/**
 * Lo que se acuerda el teléfono entre una vez y otra.
 *
 * Se guarda **el capítulo alcanzado y los poderes ganados**, no el
 * avance de adentro del capítulo: si cierra la página a mitad de la
 * subida de Boo, vuelve a empezar ese capítulo, pero nunca tiene que
 * volver a pasar uno que ya ganó.
 *
 * Es a propósito. Guardar el lazo exacto convertiría cerrar la página
 * en una manera de guardar partida, y el juego se juega de una
 * sentada; y perder los tres capítulos por haber cerrado sin querer
 * sería cruel.
 *
 * Los pasitos y las caídas de cada capítulo sí se guardan: son los
 * números que la carta de la luna necesita al final, y el marcador
 * contra el récord de él.
 */

const LLAVE = 'dosositos:luna'

const VACIO: ProgresoLuna = { capitulo: 0, pasitos: 0, caidas: 0, poderes: [] }

export function leerProgreso(): ProgresoLuna {
  try {
    const crudo = localStorage.getItem(LLAVE)
    if (!crudo) return { ...VACIO, poderes: [] }
    const guardado = JSON.parse(crudo) as Partial<ProgresoLuna>
    return {
      capitulo: Number(guardado.capitulo) || 0,
      pasitos: Number(guardado.pasitos) || 0,
      caidas: Number(guardado.caidas) || 0,
      // Puede venir de una versión anterior, de cuando no había
      // poderes, y entonces no está.
      poderes: Array.isArray(guardado.poderes) ? guardado.poderes.map(String) : [],
    }
  } catch {
    // Navegador con el almacenamiento cerrado, o algo escrito a mano
    // que no se entiende. Se empieza de cero y no se rompe nada.
    return { ...VACIO, poderes: [] }
  }
}

export function guardarProgreso(progreso: ProgresoLuna) {
  try {
    localStorage.setItem(LLAVE, JSON.stringify(progreso))
  } catch {
    /* si no se puede guardar, se juega igual */
  }
}

/** Suma lo de esta subida a lo que ya había, con el poder recién ganado. */
export function anotarCapitulo(
  capitulo: number,
  pasitos: number,
  caidas: number,
  poder?: string,
): ProgresoLuna {
  const antes = leerProgreso()
  const ahora: ProgresoLuna = {
    capitulo: Math.max(antes.capitulo, capitulo),
    pasitos: antes.pasitos + pasitos,
    caidas: antes.caidas + caidas,
    poderes: poder && !antes.poderes.includes(poder) ? [...antes.poderes, poder] : antes.poderes,
  }
  guardarProgreso(ahora)
  return ahora
}

/** ¿Ya se ganó este poder en alguna partida anterior? */
export function tienePoder(id: string): boolean {
  return leerProgreso().poderes.includes(id)
}
