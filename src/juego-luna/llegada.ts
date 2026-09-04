/**
 * La cuenta de la llegada: dónde va la tortuga, dónde la luna, y
 * cuánto se abrió la cámara, para un avance dado de 0 a 1.
 *
 * Vive en su propio archivo porque la necesitan los dos lados y
 * tienen que estar de acuerdo. El motor la usa para subir a la
 * tortuga —y con eso la cámara la sigue sola, sin tocarle nada— y el
 * pintor para dibujar la luna donde ella la va a pisar. Con la cuenta
 * copiada en los dos, cualquier retoque en una la dejaba posándose en
 * el aire.
 */
import { LLEGADA, LUNA, MUNDO } from '@/content/luna'
import type { Nivel } from '@/types'

const entre = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/** De 0 a 1, saliendo rápido y frenando al final. */
const frenando = (t: number) => 1 - (1 - t) * (1 - t)

/** De 0 a 1, entrando y saliendo suave. */
const suave = (t: number) => t * t * (3 - 2 * t)

/** Cuánto lleva andado un tramo que va de `desde` a `hasta`. */
const tramo = (a: number, desde: number, hasta: number) => entre((a - desde) / (hasta - desde), 0, 1)

export interface Llegada {
  /** La `y` de las paticas. */
  tortugaY: number
  /** La luna: dónde está y de qué tamaño se ve. */
  luna: { x: number; y: number; r: number }
  /**
   * De 0 (todavía volando) a 1 (ya parada encima). Se adelanta un
   * pelo al final de la subida: llega frenando y la pose de aterrizar
   * tiene que estar puesta antes de que se pare del todo, no después.
   */
  quieta: number
  /** De 0 (parada) a 1 (sentada). */
  sentada: number
  /** Cuánto mundo cabe: 1 es pegada, menos es más lejos. */
  zoom: number
  /** Cuánto lleva subido desde la cima, que es lo que mide el viaje. */
  subido: number
  /**
   * De 0 a 1, cuánto se ha ido ya el cuarto: las cortinas, los
   * estantes, las vías y las plataformas.
   *
   * Sin esto, las cortinas de Nico subían pegadas a la tortuga hasta
   * la luna y se veían de fondo en el último cuadro, que es cielo. El
   * mundo no se acaba porque se salga de la pantalla —es más alto que
   * ella— así que hay que apagarlo a mano.
   */
  elCuartoSeVa: number
  /**
   * De 0 a 1, cuánto lleva hecho del viaje, ya suavizado. Lo usa el
   * motor para correrla de donde pisó la cima al centro de la luna:
   * la cima es ancha y pudo salir de cualquier punto.
   */
  avanceDelViaje: number
  /**
   * A qué altura de la pantalla la quiere la cámara, de 0 (arriba del
   * todo) a 1 (abajo). Mientras sube va donde siempre; al abrirse la
   * cámara se corre hacia arriba, para que la luna entera quepa
   * debajo de ella en vez de salirse por el borde.
   */
  altoDeCamara: number
}

export function laLlegada(avance: number, nivel: Nivel): Llegada {
  const a = entre(avance, 0, 1)

  // De donde sale la luna: la misma que estuvo esperando arriba del
  // último tramo todo el capítulo.
  const y0 = nivel.cima.y - LUNA.sobreLaCima

  // El viaje. Ella sube frenando, y la luna se le va yendo, también
  // frenando pero con menos ganas: por eso la alcanza. Es lo mismo
  // que hace la luna en los tres capítulos, solo que esta vez se
  // cansa antes que la tortuga.
  const viaje = tramo(a, 0, LLEGADA.sube)

  // Mientras se aleja, la luna también se va poniendo en el medio.
  //
  // La cámara del juego solo persigue de arriba abajo: a lo ancho el
  // mundo está quieto, y la cima —como cualquier tramo— cae donde le
  // tocó, casi nunca en el centro. Dejando la luna encima de la cima,
  // la tortuga terminaba encaramada en el borde del disco y con media
  // luna fuera de la pantalla. Se la lleva al medio durante el viaje,
  // que además es lo que hace que al final quede centrada sin tener
  // que mover la cámara a lo ancho por primera vez en todo el juego.
  const lunaX =
    nivel.cima.x + nivel.cima.ancho / 2 +
    (MUNDO.ancho / 2 - (nivel.cima.x + nivel.cima.ancho / 2)) * suave(viaje)

  const lunaY = y0 - LLEGADA.seAleja * frenando(viaje)
  const r = nivel.radioDeLaLuna + (LLEGADA.radioAlLlegar - nivel.radioDeLaLuna) * suave(viaje)

  // Donde le van a quedar las paticas: encima de la luna, hundida un
  // poquito, que apoyada al milímetro se ve pegada con cinta.
  const encima = lunaY - r + LLEGADA.seHunde
  const tortugaY = nivel.cima.y + (encima - nivel.cima.y) * frenando(viaje)

  const abriendo = suave(tramo(a, LLEGADA.sentada, 1))

  return {
    avanceDelViaje: frenando(viaje),
    quieta: suave(tramo(a, LLEGADA.sube - 0.09, LLEGADA.sube + 0.02)),
    tortugaY,
    luna: { x: lunaX, y: lunaY, r },
    sentada: suave(tramo(a, LLEGADA.sentandose, LLEGADA.sentada)),
    zoom: 1 + (LLEGADA.seAbre - 1) * abriendo,
    subido: nivel.cima.y - tortugaY,
    elCuartoSeVa: suave(entre((nivel.cima.y - tortugaY) / 620, 0, 1)),
    altoDeCamara: 0.62 + (0.34 - 0.62) * abriendo,
  }
}
