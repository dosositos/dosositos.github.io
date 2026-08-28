import type { CapituloEscrito } from '@/types'

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
 * La pista que se borra, que es la traba del capítulo de Boo.
 *
 * En cuanto despega de un tramo, ese tramo empieza a irse. No hay
 * vuelta atrás: lo que pisó, se borra. Es su frase de la esquina
 * hecha mecánica.
 *
 * No se borra nada hasta pasada la primera estrella. Los primeros
 * saltos son para aprender y aprender con el suelo desapareciendo no
 * se puede. Y al volver a una estrella después de caerse, la pista de
 * arriba vuelve entera: si no, la caída sería el final de la partida.
 *
 * Y se va poniendo más difícil: cada estrella que pisa le quita tiempo
 * a la pista, así que el último tramo del capítulo se borra a menos de
 * la mitad de lo que tardaba el primero.
 */
export const PISTA = {
  /** Desde que despega hasta que ese tramo ya no está, al principio. */
  msParaIrse: 2600,

  /** Cuánto tiempo menos dura la pista con cada estrella pisada. */
  msMenosPorEstrella: 380,

  /** Por apurada que se ponga, nunca se va más rápido que esto. */
  msMinimo: 1100,

  /** Cuánto antes de irse empieza a parpadear. */
  msDeAviso: 1200,
}

/**
 * Las cajas que ceden, que es la traba del capítulo de Ovi.
 *
 * Una pila de cajas de cartón no es una tabla atornillada: si te
 * parás en la orilla, se va para ese lado. Aquí es un balancín que
 * pivota en el medio, así que aterrizar a la derecha hunde la derecha
 * y **levanta la izquierda**, y el salto siguiente sale desde otra
 * altura. Aterrizar bien deja de ser llegar: es llegar *a un sitio*.
 *
 * No ceden todas. El suelo, las estrellas y los tramos de impulso van
 * firmes por regla: la estrella tiene que ser el sitio donde se
 * respira, y un tramo de impulso que se moviera arruinaría lo único
 * que el juego promete que sale siempre igual.
 */
export const CAJAS = {
  /**
   * Cuánto baja la punta de la caja con la inclinación al tope, en
   * unidades del mundo.
   *
   * **No es lo que se hunde ella.** La caja es un balancín, así que
   * el punto donde está parada baja `cede` por su distancia al medio
   * *dos veces*: una porque el peso ahí inclina más, y otra porque un
   * punto más lejos del pivote baja más. Y encima la tortuga nunca
   * llega al borde de verdad, que se le acaba el suelo a media
   * tortuga de la punta.
   *
   * En números: en una caja de 100 de ancho, lo más orillada que
   * puede estar es al 70% del semiancho, y ahí se hunde 15 × 0,7² ≈
   * 7 px. Eso es lo que se siente al saltar. Los 15 son lo que se ve
   * en el dibujo, que son unos 12 grados de inclinación.
   *
   * Se probó con 7 y la traba no existía: la caja se movía en
   * pantalla pero el salto salía igual, porque lo que llegaba al
   * juego eran tres píxeles y medio.
   */
  cede: 15,

  /**
   * Cuánto tarda en irse del todo hacia el lado donde está parada.
   * Corto: es peso, no un motor.
   */
  msParaCeder: 260,

  /**
   * Y cuánto tarda en volver a quedar derecha después de que se fue.
   * Más lento que lo anterior, porque volver a su sitio es lo que
   * hace la caja sola y ceder lo hace empujada.
   */
  msParaEnderezar: 520,
}

/**
 * Los tramos de impulso: al caer ahí sale disparada sola, sin dedo.
 *
 * La tortuga se centra en el tramo antes de salir, así que el salto
 * es siempre el mismo y el destino se puede poner con precisión. Sirve
 * para enseñarle qué se siente un salto largo sin explicárselo.
 */
export const IMPULSO = {
  /** La fuerza del lanzamiento. La de la barra llena. */
  fuerza: 930,
}

/**
 * La luna, que es a donde se va.
 *
 * No está pegada a la pantalla todo el rato: llena y grande arriba a
 * un lado, se comía la pantalla y no dejaba mirar los saltos. Ahora
 * sale en una cinemática al empezar el capítulo, se va para arriba, y
 * está esperando de verdad arriba del último tramo. Al llegar se va
 * otra vez, y esa es la excusa para el capítulo siguiente.
 */
export const LUNA = {
  /** Su tamaño mientras espera arriba, en unidades del mundo. */
  radio: 44,

  /** Cuánto más arriba de la última plataforma está. */
  sobreLaCima: 165,

  /** Lo que dura la cinemática de entrada. Un toque se la salta. */
  msDeEntrada: 3000,

  /** Lo que dura la de irse, al llegar arriba. */
  msDeSalida: 2600,
}

/**
 * ══════════════════════════════════════════════════════════════
 *  LOS CAPÍTULOS
 * ══════════════════════════════════════════════════════════════
 *
 * Cada línea de `plataformas` es un tramo del camino:
 *
 *   x        dónde empieza, de 0 (orilla izquierda) a 360 (derecha)
 *   ancho    cuánto mide
 *   altura   a qué altura está, contando desde el suelo. 0 es el
 *            suelo mismo y los números crecen hacia arriba
 *   hito     si es un lazo, o sea un punto de guardado
 *   impulso  'derecha' o 'izquierda' si es un tramo de impulso
 *
 * Para tantear: el salto más flojo avanza unos 95 y sube unos 50, el
 * más fuerte avanza unos 290 y sube unos 155. O sea que **dos
 * plataformas nunca deberían estar a más de 150 de altura una de
 * otra**, y conviene dejarlas más cerca que eso.
 *
 * Antes de dar por bueno un cambio, comprobalo sin abrir el navegador:
 *
 *   npm run luna:probar
 *
 * Prueba cada salto de cada capítulo con todas las fuerzas de la barra
 * y avisa si algún tramo no se puede pasar. `npm run luna:mapa` dice a
 * qué distancias se puede aterrizar según lo que haya que subir.
 */

/** El capítulo uno: la pista de Hot Wheels y el bambú. */
const BOO: CapituloEscrito = {
  id: 'boo',
  nombre: 'Boo',
  numero: 1,
  material: 'pista',
  seDesvanece: true,
  cede: false,
  presentacion: {
    titulo: 'Capítulo uno: Boo',
    texto: [
      'Boo llegó en diciembre, en el arreglo de Hot Wheels que me regalaste. Esa misma noche te dije que me iba a dormir con él, y diez días después todavía olía a vos.',
      'Su mundo es de pista naranja y de bambú, que de ahí le viene el nombre. Y la pista se borra detrás porque él dice que estuvo en casi todas nuestras fechas y que nadie le tomó fotos. Lo que pisás acá, se va.',
    ],
    boton: 'subir con Boo',
  },
  cierre: {
    titulo: 'Ganaste a Boo',
    texto:
      'Se te trepa al caparazón y ahí se queda, mirando para abajo lo que subiste. Uno de tres. Los otros dos están más arriba y la luna ya se fue para allá.',
  },
  plataformas: [
    // El suelo, ancho y tranquilo. Aquí se aprende a saltar.
    { x: 30, ancho: 310, altura: 0 },

    // ── Los primeros diez, regalados ──────────────────────────
    // Sube de 70 en 75, plataformas grandes y el zigzag ancho. La
    // pista todavía no se borra: hasta el primer lazo no pasa nada.
    { x: 205, ancho: 125, altura: 70 },
    { x: 40, ancho: 125, altura: 145 },
    { x: 200, ancho: 120, altura: 220 },
    { x: 45, ancho: 120, altura: 292 },
    { x: 205, ancho: 115, altura: 367 },
    { x: 40, ancho: 115, altura: 440 },
    { x: 205, ancho: 115, altura: 515 },
    { x: 45, ancho: 115, altura: 590 },
    { x: 200, ancho: 120, altura: 663 },
    { x: 35, ancho: 140, altura: 740, hito: true },

    // ── Desde aquí la pista se borra ──────────────────────────
    // Sube de 88 en 90 y las plataformas se achican. A mitad de
    // tramo, el primer impulso: se cae ahí y sale sola.
    { x: 210, ancho: 105, altura: 830 },
    { x: 45, ancho: 105, altura: 920 },
    { x: 215, ancho: 100, altura: 1008 },
    { x: 40, ancho: 110, altura: 1098, impulso: 'derecha' },
    { x: 230, ancho: 115, altura: 1238 },
    { x: 35, ancho: 130, altura: 1330, hito: true },

    // ── El tramo desparejo ────────────────────────────────────
    // Aquí se deja de poder repetir la misma carga: una sube 110 y
    // la siguiente 60, y hay una en el medio del mundo que obliga a
    // esperar a que la tortuga se dé la vuelta.
    { x: 215, ancho: 100, altura: 1440 },
    { x: 90, ancho: 95, altura: 1500 },
    { x: 225, ancho: 95, altura: 1595 },
    { x: 50, ancho: 100, altura: 1690 },
    { x: 185, ancho: 135, altura: 1780, hito: true },

    // ── Ya pesa ───────────────────────────────────────────────
    // De 100 a 110 y las plataformas más chicas hasta aquí.
    { x: 35, ancho: 95, altura: 1885 },
    { x: 145, ancho: 100, altura: 1985 },
    { x: 35, ancho: 115, altura: 2085 },
    { x: 220, ancho: 90, altura: 2200 },
    { x: 50, ancho: 90, altura: 2310 },
    { x: 180, ancho: 130, altura: 2415, hito: true },

    // ── El último trecho hasta la luna ────────────────────────
    // Y un impulso de regalo antes del final, que deja la cima a
    // tiro sin pedir puntería.
    { x: 40, ancho: 85, altura: 2525 },
    { x: 220, ancho: 85, altura: 2635 },
    { x: 45, ancho: 100, altura: 2745, impulso: 'derecha' },

    // La cima. Aquí, en el juego entero, está la carta. Va ancha a
    // propósito: el último salto antes del premio no es el sitio
    // para pedir puntería, y encima llega en volandas.
    { x: 195, ancho: 150, altura: 2885, hito: true },
  ],
}

/** El capítulo dos: el cuarto de las cajas de donde salió Ovi. */
const OVI: CapituloEscrito = {
  id: 'ovi',
  nombre: 'Ovi',
  numero: 2,
  material: 'cajas',
  seDesvanece: false,
  cede: true,
  presentacion: {
    titulo: 'Capítulo dos: Ovi',
    texto: [
      'Ovi estaba en una caja de peluches viejos, con otros que llevaban años ahí metidos, y se vino conmigo ese mismo día. Todo rosa pastel y con esos brazos de gimnasio que tiene. Todavía no entiendo cómo nadie lo había sacado antes.',
      'Su mundo es el cuarto de donde salió: cajas apiladas y cinta de embalaje, con rótulos que nadie volvió a leer. Y las cajas ceden. Se van para el lado donde te parás, así que dónde caés decide desde qué altura sale el salto siguiente. No basta con caer en la caja, importa en qué parte de la caja caés.',
    ],
    boton: 'subir con Ovi',
  },
  cierre: {
    titulo: 'Ganaste a Ovi',
    texto:
      'Se sube al caparazón y se acomoda al lado de Boo, que ya venía ahí. Dos de tres. El que falta es el más viejo de los tres y está todavía más arriba.',
  },
  plataformas: [
    // El suelo del cuarto, que es la única caja de verdad ancha. Aquí
    // no cede nada: la primera de todas va firme por regla.
    { x: 25, ancho: 315, altura: 0 },

    // ── Las cajas se presentan ────────────────────────────────
    // Sube de 78 en 83 y las cajas van anchas. La subida es más
    // fácil que la de Boo a propósito: lo nuevo que hay que
    // aprender aquí no es el salto, es que el suelo se mueve.
    { x: 200, ancho: 130, altura: 78 },
    { x: 40, ancho: 130, altura: 158 },
    { x: 195, ancho: 125, altura: 240 },
    { x: 45, ancho: 125, altura: 322 },
    { x: 200, ancho: 120, altura: 405 },
    { x: 40, ancho: 120, altura: 488 },
    { x: 190, ancho: 140, altura: 570, hito: true },

    // ── Y ahora sí ────────────────────────────────────────────
    // Se achican y suben de 92 en 100. Y al final del tramo, el
    // primer hueco que solo se pasa con la barra al tope: se llega
    // corta dos veces, y a la tercera se entiende que hay cargas
    // que no se pueden medir a ojo, hay que irse hasta el fondo.
    { x: 45, ancho: 110, altura: 662 },
    { x: 210, ancho: 105, altura: 755 },
    { x: 50, ancho: 105, altura: 848 },
    { x: 215, ancho: 100, altura: 945 },
    { x: 60, ancho: 100, altura: 1089, alTope: true },
    { x: 195, ancho: 135, altura: 1170, hito: true },

    // ── El tramo desparejo ────────────────────────────────────
    // Una sube 100 y la siguiente 62. Con el suelo quieto esto era
    // solo cambiar de carga; con las cajas cediendo, además hay
    // que elegir en qué punta de la caja quedarse antes de saltar.
    { x: 45, ancho: 100, altura: 1270 },
    { x: 175, ancho: 90, altura: 1332 },
    { x: 40, ancho: 95, altura: 1432 },
    { x: 200, ancho: 90, altura: 1494 },
    { x: 55, ancho: 90, altura: 1594 },
    { x: 190, ancho: 130, altura: 1692, hito: true },

    // ── Ya pesa ───────────────────────────────────────────────
    // Las cajas más chicas del capítulo y el segundo hueco al tope,
    // este ya sin aviso ninguno.
    { x: 40, ancho: 90, altura: 1792 },
    { x: 205, ancho: 85, altura: 1896 },
    { x: 45, ancho: 85, altura: 1999 },
    { x: 215, ancho: 85, altura: 2104 },
    { x: 40, ancho: 95, altura: 2248, alTope: true },
    { x: 185, ancho: 130, altura: 2334, hito: true },

    // ── El último trecho hasta la luna ────────────────────────
    // Sin regalo de impulso, que ese es de Boo. Lo que hay aquí es
    // una caja firme a mitad del tramo, para respirar una vez
    // antes del final.
    { x: 40, ancho: 85, altura: 2439 },
    { x: 200, ancho: 80, altura: 2544 },
    { x: 45, ancho: 90, altura: 2649, firme: true },
    { x: 205, ancho: 85, altura: 2754 },
    { x: 50, ancho: 90, altura: 2859 },

    // La cima. Ancha, como la de Boo: el último salto antes del
    // premio no es el sitio para pedir puntería.
    { x: 190, ancho: 150, altura: 2964, hito: true },
  ],
}

/**
 * Los capítulos, en orden de llegada de los peluches.
 *
 * Falta Nico, que es el primogénito y va al final. Es otra variación
 * del mismo molde y entra aquí mismo cuando le toque.
 */
export const CAPITULOS: CapituloEscrito[] = [BOO, OVI]

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
 * El bautizo: la primera pantalla de todas, una sola vez.
 *
 * La tortuga es de ella, y hasta ahora no tenía nombre. Se le pregunta
 * antes del primer capítulo y lo que escriba manda en todos los textos
 * del juego, en los tres capítulos.
 *
 * Se puede dejar para después sin que pase nada: el juego la llama «la
 * tortuga» y se lo vuelve a preguntar la próxima vez. Lo que no hay es
 * una pantalla de ajustes para cambiarlo, así que mientras no lo
 * ponga, la puerta sigue abierta.
 *
 * En los textos de aquí abajo, `{tortuga}` y `{Tortuga}` son el hueco
 * donde entra el nombre. Sin nombre puesto se llenan solos con «la
 * tortuga» y «La tortuga».
 */
export const BAUTIZO = {
  titulo: '¿Cómo se llama?',
  parrafos: [
    'Esta es la que sube, y hasta hoy no tiene nombre. Es tuya: ponele el que querás y así se va a llamar de aquí hasta arriba.',
  ],
  /** Lo que se ve escrito flojito adentro de la casilla, sin escribir nada. */
  ejemplo: 'la tortuga',
  boton: 'así se llama',
  saltar: 'mejor después',
  pie: 'Si ahorita no se te ocurre, dale nomás y te lo vuelvo a preguntar la próxima.',
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
    '{Tortuga} camina sola de un lado al otro y no se para nunca. Apretá la pantalla y ahí sí se para, se agacha y la barra se le va llenando. Cuando soltás, sale disparada hacia donde venía mirando. Un solo dedo, y dos cosas que decidir: cuándo y con cuánta fuerza.',
    'Aguantar la barra cansa. Si te quedás apretando de más se marea, se cae de espaldas con las estrellitas dando vueltas y pierde ese salto. Antes de que pase, la barra se pone roja. No perdés nada más, solo hay que esperar a que se levante.',
    'Las estrellitas de papel guardan por dónde ibas, como las del frasco. Si te caés volvés a la última que pisaste, nunca hasta abajo del todo.',
  ],
  boton: 'a la luna',
  pie: 'Se sube a pasitos. No hay apuro.',
}

/** Los textos de pantalla del juego. */
export const TEXTOS = {
  ayudaTocar: 'mantené apretado y soltá',
  ayudaTeclado: 'o la barra espaciadora',
  /** Al pisar una estrella. Discreto y corto: se lee de reojo. */
  hito: 'guardado aquí',
  llegada: 'llegaste',
  /** Lo acumulado de todas las veces, debajo de lo de esta subida. */
  enTotal: 'en total',
  /** El botón para seguir con el capítulo siguiente, recién ganado el de ahora. */
  seguir: 'seguir con',
  /** Y al cerrar el último que está escrito, mientras falte alguno. */
  enObra: 'el capítulo que falta todavía lo estoy haciendo',
}
