import { CAPITULOS, MUNDO } from '@/content/luna'
import type { CapituloEscrito, Nivel, Plataforma } from '@/types'

/**
 * Armar un capítulo a partir de lo que está escrito en `luna.ts`.
 *
 * En `luna.ts` las plataformas se escriben con una **altura** que se
 * cuenta desde el suelo y crece hacia arriba, que es como se piensa un
 * nivel de verdad: «esta va 120 más arriba que la anterior». Adentro
 * del motor, en cambio, la `y` crece hacia abajo, como en cualquier
 * pantalla. La conversión pasa aquí y en ningún otro lado.
 *
 * Aquí vive también la traba de cada capítulo: de qué está hecho el
 * camino y si se borra detrás.
 */

/** A qué altura de la pantalla queda el suelo del capítulo. */
export const SUELO = MUNDO.alto - 140

/** El capítulo por su número, o el primero si se pide uno que no hay. */
export function capituloNumero(numero: number): CapituloEscrito {
  return CAPITULOS.find((c) => c.numero === numero) ?? CAPITULOS[0]
}

export function construirNivel(capitulo: CapituloEscrito): Nivel {
  const escritas = capitulo.plataformas
  if (escritas.length === 0) throw new Error('un capítulo sin plataformas no se puede jugar')

  const plataformas: Plataforma[] = escritas.map((p, indice) => ({
    x: p.x,
    ancho: p.ancho,
    y: SUELO - p.altura,
    hito: p.hito,
    impulso: p.impulso === 'derecha' ? 1 : p.impulso === 'izquierda' ? -1 : undefined,
    indice,
  }))

  const primera = plataformas[0]

  return {
    plataformas,
    hitos: plataformas.filter((p) => p.hito),
    suelo: primera.y,
    cima: plataformas[plataformas.length - 1],
    salida: { x: primera.x + primera.ancho / 2, y: primera.y },
    material: capitulo.material,
    seDesvanece: capitulo.seDesvanece,
  }
}
