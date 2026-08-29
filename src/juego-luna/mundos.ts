import { CAJAS, CAPITULOS, MUNDO } from '@/content/luna'
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
 * camino, si se borra detrás y qué plataformas se inclinan al pisarlas.
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
    // Quién cede es una regla y no un dato que haya que escribir
    // treinta y dos veces: en el capítulo de Ovi ceden todas menos el
    // suelo, las estrellas, los tramos de impulso y las que estén
    // marcadas como firmes a propósito. La estrella tiene que ser el
    // sitio donde se respira, y un tramo de impulso que se moviera
    // arruinaría lo único que el juego promete que sale siempre igual.
    // Las cajas de peluches tampoco ceden: una caja llena pesa y está
    // asentada, y si además se inclinara el rebote saldría distinto
    // cada vez, que es justo lo que un rebote no puede hacer.
    cede: capitulo.cede && indice > 0 && !p.hito && !p.impulso && !p.rebote && !p.firme,
    resbala: p.resbala,
    rebote: p.rebote,
    alTope: p.alTope,
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
    cede: capitulo.cede,
  }
}

/**
 * A qué altura está la superficie de una plataforma en un punto.
 *
 * En los capítulos donde nada cede es la línea de siempre. En el de
 * Ovi, la caja es un balancín que pivota en su medio: con la
 * inclinación en 1 la punta derecha bajó `CAJAS.cede` y la izquierda
 * subió otro tanto.
 *
 * Vive aquí y no adentro del motor porque el pintor necesita
 * exactamente la misma cuenta —dónde dibujar el filo, dónde poner la
 * sombra—, y dos versiones de la misma geometría se separan el día
 * que alguien toque una sola.
 */
export function alturaDeLaCaja(p: Plataforma, x: number, inclinacion: number): number {
  if (!p.cede || inclinacion === 0) return p.y
  const medio = p.x + p.ancho / 2
  const brazo = Math.max(1, p.ancho / 2)
  const lado = Math.max(-1, Math.min(1, (x - medio) / brazo))
  return p.y + inclinacion * CAJAS.cede * lado
}
