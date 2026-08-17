/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  "¿QUIÉN DIJO ESTO?" — los textos y las reglas del juego.    ║
 * ║  Todo esto es texto plano: cambialo sin miedo.               ║
 * ║                                                              ║
 * ║  Las frases NO están aquí. Viven cifradas en                 ║
 * ║  public/cifrado/juego.enc y se abren en el teléfono con la   ║
 * ║  misma frase de la puerta. Para tocarlas:                    ║
 * ║  private/frases-candidatas.json  +  npm run juego:preparar   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Cuántas frases trae una partida y cuántas se pueden fallar. */
export const REGLAS = {
  rondas: 12,
  vidas: 3,
  /** Puntos por acertar. */
  acierto: 100,
  /** Se suman por cada acierto seguido, a partir del segundo. */
  racha: 25,
  /** Extra por acertar "los dos" o "ninguno", que son las difíciles. */
  dificil: 50,
}

/**
 * La advertencia de la primera pantalla.
 *
 * Está porque si no, el juego se resuelve sin leer: yo escribo todo en
 * minúscula y abreviando, ella empieza en mayúscula y escribe completo.
 * Con la primera letra bastaba. Así que las frases van emparejadas, y es
 * más honesto avisarlo que hacer como que no pasó nada.
 */
export const ACLARACION = {
  titulo: 'Antes de empezar, osita',
  parrafos: [
    'Todas las frases están emparejadas antes de entrar al juego. Escribimos distinto: yo mando todo en minúscula, abreviando media palabra —«m» por «me», «t» por «te», «vdd» por «verdad», «cn» por «con»— y comiéndome las tildes; vos empezás en mayúscula, escribís completo y tildás. Con eso la primera letra ya te decía de quién era, y no había nada que adivinar.',
    'Entonces empareé lo mecánico: mayúscula al inicio para todas, las abreviaciones escritas completas y los nombres propios con su mayúscula («nba» → NBA, «rubén darío» → Rubén Darío).',
    'Lo demás está intacto, palabra por palabra: los dedazos, las risas, los alargues y las palabras que solo existen entre nosotros. Ahí sí hay que acordarse.',
  ],
  /** Se lee chiquito, debajo del botón de empezar. */
  pie: 'Después de cada respuesta te enseño de dónde salió la frase.',
}

export const PORTADA = {
  titulo: '¿quién dijo esto?',
  entrada: 'a ver si te acordás de lo que decimos',
  empezar: 'jugar',
  otraVez: 'otra vez',
}

/** Cómo se llama cada botón de respuesta. */
export const OPCIONES = {
  osito: { texto: 'lo dijo osito', icono: '🐻' },
  osita: { texto: 'lo dijo osita', icono: '🎀' },
  ambos: { texto: 'los dos', icono: '🧸' },
  ninguno: { texto: 'ninguno', icono: '🚫' },
} as const

/** Lo que se lee justo después de responder. */
export const REACCIONES = {
  acierto: ['te acordabas', 'esa era', 'obvio que sí', 'me conocés', 'ni dudaste'],
  fallo: ['casi', 'nop', 'esa no', 'te confundiste', 'uy no'],
  /** Cuando la frase era inventada por mí y no cayó en la trampa. */
  trampaEsquivada: 'esa nunca la dijimos, bien vista',
  /** Cuando sí cayó. */
  trampaCaida: 'esa me la inventé yo, no la dijimos nunca',
}

/**
 * Los finales. Se elige el primero cuyo mínimo de aciertos se cumpla,
 * así que van de más a menos.
 */
export const FINALES = [
  {
    aciertos: 12,
    icono: '🌻',
    titulo: 'Doce de doce',
    texto:
      'No fallaste ni una. Da un poquito de miedo lo bien que me conocés, y también es exactamente por eso que hice todo esto.',
  },
  {
    aciertos: 9,
    icono: '🌹',
    titulo: 'Casi perfecta',
    texto:
      'Dos años escuchándonos y se nota. Las que fallaste seguro fueron de las que decimos los dos, que para eso están.',
  },
  {
    aciertos: 6,
    icono: '🧸',
    titulo: 'Nos conocés bien',
    texto:
      'Más de la mitad. Y las que se te escaparon valen igual: volviste a leer un pedacito de nuestro chat.',
  },
  {
    aciertos: 3,
    icono: '🌸',
    titulo: 'Andabas distraída',
    texto:
      'Pasa. Además hice trampa emparejando cómo escribimos, así que un poco es culpa mía. Volvé a intentar.',
  },
  {
    aciertos: 0,
    icono: '🌙',
    titulo: 'Bueno, amor',
    texto:
      'Todas mal. Voy a asumir que estabas con sueño y no que llevás dos años hablando con un desconocido.',
  },
]

/** Lo de mandar la captura, al final de la partida. */
export const REMATE = {
  invitacion: 'Mandame la captura de esto, quiero ver tu puntaje.',
  compartir: 'compartir',
  copiado: 'copiado, pegalo donde quieras',
}
