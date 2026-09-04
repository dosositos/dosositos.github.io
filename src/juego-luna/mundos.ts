import { ALMOHADAS, CAJAS, CAPITULOS, COBIJAS, LUNA, MUNDO, SALTO } from '@/content/luna'
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

/**
 * Cuánto tarda la barra en llenarse parada en esta plataforma.
 *
 * Vive acá y no en el motor porque el probador necesita la misma
 * cuenta: si el arnés carga durante `SALTO.msDeCarga` y el juego
 * durante otro número, el probador mide una barra que en el teléfono
 * no existe, y entonces miente. Que es lo que más hace.
 */
export function msDeCargaEn(p: Plataforma | undefined): number {
  return p?.enreda ? COBIJAS.msDeCarga : SALTO.msDeCarga
}

/** El capítulo por su número, o el primero si se pide uno que no hay. */
/**
 * El último capítulo que está escrito. Hoy los tres.
 *
 * Vive aquí y no en la página porque hay dos que lo preguntan: el juego,
 * para saber cuál es el final, y la luna de la portada, para saber si
 * ella ya llegó arriba y dibujarse llena.
 */
export const ULTIMO_CAPITULO = CAPITULOS.reduce((mayor, c) => Math.max(mayor, c.numero), 1)

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
    // La misma regla, para el capítulo de Nico: se hunden todas menos
    // el suelo, las estrellas, los tramos de impulso y las marcadas
    // como firmes. Por lo mismo de siempre — la estrella es el sitio
    // donde se respira, y en este capítulo respirar es que el suelo
    // se quede quieto mientras una piensa.
    hunde: capitulo.seHunde && indice > 0 && !p.hito && !p.impulso && !p.firme,
    resbala: p.resbala,
    rebote: p.rebote,
    alTope: p.alTope,
    aPrisa: p.aPrisa,
    enreda: p.enreda,
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
    seHunde: capitulo.seHunde,
    radioDeLaLuna: LUNA.radio + (capitulo.numero - 1) * LUNA.crecePorCapitulo,
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

/**
 * Y a qué altura está de verdad la superficie de una plataforma, con
 * todo lo que le esté pasando: la caja de Ovi inclinada y la almohada
 * de Nico hundida.
 *
 * Es la única cuenta que dice dónde se pisa. El motor la usa para
 * caminar, aterrizar y saltar; el pintor, para dibujar el suelo y la
 * sombra en el mismo sitio. Dos versiones de esta cuenta se separan el
 * día que alguien toque una sola, y eso ya pasó una vez: el probador
 * comparaba contra la línea de la plataforma en vez de contra la caja
 * cedida, y el capítulo entero salía cinco puntos más difícil.
 *
 * La almohada se hunde entera y pareja, sin cuenco. Que se marque el
 * hoyo donde están las paticas es cosa del dibujo, no de la física:
 * hundir distinto según dónde se pare ya es la traba de Ovi, y dos
 * capítulos con la misma traba no son dos capítulos.
 */
export function superficieDe(
  p: Plataforma,
  x: number,
  inclinacion: number,
  hundido: number,
): number {
  const linea = alturaDeLaCaja(p, x, inclinacion)
  return p.hunde ? linea + hundido * ALMOHADAS.seHunde : linea
}
