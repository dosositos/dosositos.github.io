import type { PlataformaEscrita } from '@/types'

/**
 * A la luna, a pasitos de tortuga.
 *
 * ══════════════════════════════════════════════════════════════
 *  ESTE ARCHIVO ES TUYO. Son los números del juego y los textos
 *  de pantalla. Cambiá lo que querás y recargá: no hay lógica
 *  aquí adentro, así que no se puede romper nada.
 * ══════════════════════════════════════════════════════════════
 *
 * Cómo se juega: la tortuga camina sola de un lado a otro. Apretás
 * la pantalla y se detiene mientras se llena la barra; al soltar
 * sale disparada hacia donde venía caminando. Dos decisiones con un
 * solo dedo: cuándo y con cuánta fuerza.
 *
 * Todo se mide en un mundo imaginario de 360 de ancho por 640 de
 * alto, que después se estira al alto del teléfono. Así los números
 * significan lo mismo en cualquier pantalla.
 */

/** El tamaño del mundo imaginario. Mejor no tocarlo. */
export const MUNDO = {
  ancho: 360,
  alto: 640,
}

/**
 * El salto. Estos seis números son el juego entero: si saltar se
 * siente mal, se arregla aquí y en ningún otro lado.
 */
export const SALTO = {
  /** Cuánto tira la gravedad hacia abajo. Más = cae más pesado. */
  gravedad: 2200,

  /** Fuerza del salto más flojo, apenas tocando la pantalla. */
  impulsoMinimo: 540,

  /**
   * Fuerza del salto a barra llena.
   *
   * El plan traía 700 y 1400, tanteados a ojo. Midiéndolo con
   * `npm run luna:probar` resultó que con 1400 el salto largo avanza
   * 671 px de lado, y el mundo mide 360 de ancho: se pasaba de pared
   * a pared. Con 930 el salto más largo avanza unos 300 y sube unos
   * 160, que entra bien en la pantalla.
   */
  impulsoMaximo: 930,

  /**
   * Qué tan empinado sale, en grados. 90 sería recto para arriba y
   * 0 sería rasante. 65 es un buen salto de plataformas: sube y
   * avanza parecido.
   */
  angulo: 65,

  /**
   * Cuánto tarda la barra en llenarse, en milisegundos. Más alto
   * la vuelve más fácil de medir; más bajo, más nerviosa.
   */
  msDeCarga: 900,

  /**
   * El perdón del borde. Si se pasa de la orilla caminando, todavía
   * puede saltar durante estos milisegundos. Sin esto, los saltos
   * desde la punta se sienten robados.
   */
  msDePerdon: 90,
}

/**
 * El cansancio.
 *
 * Aguantar la barra llena esperando el momento perfecto no puede salir
 * gratis: si se queda apretado demasiado, la tortuga se agota, se
 * desmaya con sus estrellitas dando vueltas y hay que esperar a que se
 * levante. Pierde el salto.
 *
 * Avisa antes de que pase: la barra se pone roja y ella tiembla más.
 * Un castigo que no se ve venir no se aprende, solo enoja.
 */
export const CANSANCIO = {
  /** Desde que empieza a cargar hasta que se desmaya. */
  msDeAguante: 2100,

  /** Cuánto antes del desmayo empieza a avisar. */
  msDeAviso: 550,

  /** Cuánto se queda tirada antes de volver a caminar. */
  msTirada: 1300,
}

/**
 * Caerse.
 *
 * Bajar del último lazo que pisó cuenta como caída, aunque haya
 * quedado parada en una plataforma de más abajo. Es lo que hace que
 * los lazos sirvan de algo: como la pista de abajo sigue estando ahí,
 * si no fuera por esta regla errar un salto costaría nada más volver
 * a subir dos escalones.
 */
export const CAIDA = {
  /** Cuánto puede bajar del último lazo antes de que cuente. */
  margenBajoElLazo: 24,
}

/** La tortuga: cómo camina y cuánto ocupa. */
export const TORTUGA = {
  /** Velocidad de la caminata. Es el reloj del juego. */
  velocidad: 55,

  /** Lo que ocupa de ancho parada. Es lo que se usa para saber
   *  hasta dónde puede caminar antes de la orilla. */
  ancho: 30,

  /**
   * Del suelo a la coronilla. Va parada en dos patas.
   *
   * Este número la agranda o la achica entera, con todo su dibujo.
   * Con 38 se veía correcta en la computadora y diminuta en el
   * teléfono, y ella es el personaje que hay que mirar todo el rato.
   */
  alto: 50,
}

/**
 * ══════════════════════════════════════════════════════════════
 *  EL NIVEL DE PRUEBA
 * ══════════════════════════════════════════════════════════════
 *
 * Cada línea es una plataforma:
 *
 *   x       dónde empieza, de 0 (orilla izquierda) a 360 (derecha)
 *   ancho   cuánto mide
 *   altura  a qué altura está, contando desde el suelo. 0 es el
 *           suelo mismo y los números crecen hacia arriba
 *   hito    si es un punto de guardado (poné `hito: true`)
 *
 * Para tantear: el salto más flojo avanza unos 95 y sube unos 50; el
 * más fuerte avanza unos 290 y sube unos 155. O sea que **dos
 * plataformas nunca deberían estar a más de 150 de altura una de
 * otra**, y conviene dejarlas más cerca que eso.
 *
 * Antes de dar por bueno un cambio, comprobalo sin abrir el navegador:
 *
 *   npm run luna:probar
 *
 * Ese comando prueba cada salto del nivel con todas las fuerzas de la
 * barra y avisa si algún tramo no se puede pasar.
 *
 * Los hitos van cada cinco a ocho saltos. Si se cae, vuelve al último
 * que haya pisado, nunca al principio.
 */
export const NIVEL_DE_PRUEBA: PlataformaEscrita[] = [
  // El suelo, ancho y tranquilo: aquí se aprende a saltar.
  { x: 30, ancho: 310, altura: 0 },

  // Primer tramo, de 85 en 85. Plataformas grandes y el zigzag ancho:
  // se cruza de un lado al otro y eso enseña solo cuánta barra hace
  // falta.
  { x: 210, ancho: 110, altura: 85 },
  { x: 40, ancho: 110, altura: 170 },
  { x: 215, ancho: 100, altura: 255 },
  { x: 35, ancho: 120, altura: 340, hito: true },

  // Segundo tramo: sube un poco más de golpe y las plataformas se
  // achican.
  { x: 215, ancho: 95, altura: 435 },
  { x: 45, ancho: 95, altura: 530 },
  { x: 220, ancho: 90, altura: 625 },
  { x: 50, ancho: 90, altura: 720 },
  { x: 210, ancho: 120, altura: 815, hito: true },

  // Tercer tramo: de 100 en 100, y ya hay que apuntar.
  { x: 45, ancho: 85, altura: 915 },
  { x: 225, ancho: 85, altura: 1015 },
  { x: 50, ancho: 80, altura: 1115 },
  { x: 230, ancho: 80, altura: 1215 },
  { x: 40, ancho: 120, altura: 1315, hito: true },

  // El último tramo, ya cerca de la luna: 105 de subida y las
  // plataformas más chicas de todas.
  { x: 225, ancho: 75, altura: 1420 },
  { x: 55, ancho: 75, altura: 1525 },
  { x: 230, ancho: 70, altura: 1630 },
  { x: 60, ancho: 70, altura: 1735 },

  // La cima: aquí, en el juego de verdad, está la carta. Va ancha a
  // propósito: el último salto antes del premio no es el sitio para
  // pedir puntería.
  { x: 110, ancho: 145, altura: 1840, hito: true },
]

/**
 * La ayuda de abajo.
 *
 * «Mantené apretado y soltá» hace falta los primeros segundos y
 * después estorba: es una línea de texto encima del juego. Se va sola
 * cuando ya está claro que entendió, y vuelve a asomarse si pasa un
 * rato largo sin saltar, por si se quedó trabada.
 */
export const AYUDA = {
  /** Después de cuántos saltos se va sola. */
  saltosParaIrse: 3,

  /** Si pasa este rato sin saltar, vuelve. */
  msDeOlvido: 30000,
}

/**
 * El cartel de antes de empezar.
 *
 * Va porque el cansancio no se puede aprender cayéndose: si se desmaya
 * sin haber avisado nunca de que aguantar la barra tenía un límite,
 * parece que el juego se rompió. Es el mismo trato que la primera
 * pantalla del juego de las frases.
 */
export const CARTEL = {
  titulo: 'Antes de subir, osita',
  parrafos: [
    'La tortuga camina sola de un lado al otro y no se para nunca. Apretá la pantalla y ahí sí se para, se agacha y la barra se le va llenando. Cuando soltás, sale disparada hacia donde venía mirando. Un solo dedo, y dos cosas que decidir: cuándo y con cuánta fuerza.',
    'Aguantar la barra cansa. Si te quedás apretando de más se marea, se cae de espaldas con las estrellitas dando vueltas y pierde ese salto. Antes de que pase, la barra se pone roja. No perdés nada más, solo hay que esperar a que se levante.',
    'Los lazos amarillos guardan por dónde ibas. Si te caés volvés al último que pisaste, nunca hasta abajo del todo.',
  ],
  boton: 'a la luna',
  pie: 'Se sube a pasitos. No hay apuro.',
}

/** Los textos de pantalla del juego. */
export const TEXTOS = {
  ayudaTocar: 'mantené apretado y soltá',
  ayudaTeclado: 'o la barra espaciadora',
  /** Al pisar un lazo. Discreto y corto: se lee de reojo. */
  hito: 'guardado aquí',
  llegada: 'llegaste',
  /** Lo acumulado de todas las veces, debajo de lo de esta subida. */
  enTotal: 'en total',
}
