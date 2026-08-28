import { MUNDO } from '@/content/luna'
import type { Plataforma, PlataformaEscrita, Nivel } from '@/types'

/**
 * Armar un nivel a partir de lo que está escrito en `luna.ts`.
 *
 * En `luna.ts` las plataformas se escriben con una **altura** que se
 * cuenta desde el suelo y crece hacia arriba, que es como se piensa un
 * nivel de verdad: «esta va 120 más arriba que la anterior». Adentro
 * del motor, en cambio, la `y` crece hacia abajo, como en cualquier
 * pantalla. La conversión pasa aquí y en ningún otro lado.
 *
 * Más adelante, cada capítulo (la pista de Boo, las cajas de Ovi, las
 * almohadas de Nico) va a traer además su traba propia. Eso también
 * vive aquí.
 */

/** A qué altura de la pantalla queda el suelo del capítulo. */
export const SUELO = MUNDO.alto - 140

export function construirNivel(escritas: PlataformaEscrita[]): Nivel {
  if (escritas.length === 0) throw new Error('un nivel sin plataformas no se puede jugar')

  const plataformas: Plataforma[] = escritas.map((p, indice) => ({
    x: p.x,
    ancho: p.ancho,
    y: SUELO - p.altura,
    hito: p.hito,
    indice,
  }))

  const primera = plataformas[0]

  return {
    plataformas,
    hitos: plataformas.filter((p) => p.hito),
    suelo: primera.y,
    cima: plataformas[plataformas.length - 1],
    salida: { x: primera.x + primera.ancho / 2, y: primera.y },
  }
}
