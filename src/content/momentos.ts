import type { Momento } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  LA LÍNEA DEL TIEMPO                                         ║
 * ║  Agregá momentos aquí, en cualquier orden: la web los         ║
 * ║  ordena sola por fecha. Con copiar uno y cambiarle los datos  ║
 * ║  ya está.                                                     ║
 * ║                                                               ║
 * ║  Los relatos de abajo son borradores míos a partir de lo que  ║
 * ║  me contaste. Corregilos sin piedad: la voz tiene que ser la  ║
 * ║  tuya, no la mía.                                             ║
 * ║                                                               ║
 * ║  Para acordarte de qué se dijeron cualquier día:              ║
 * ║      npm run chat:dia -- 2024-08-30                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
export const momentos: Momento[] = [
  {
    id: 'las-miradas',
    fecha: '2024-08-24',
    titulo: 'La noche que solo nos miramos',
    lugar: 'Area74',
    resumen:
      'Estábamos en el mismo lugar y no nos dijimos nada. Solo miradas. Y con eso bastó.',
    relato:
      'No hubo presentación, ni conversación, ni nada que se le parezca. Estábamos en la misma disco y nos miramos. Eso fue todo lo que pasó esa noche — y resulta que fue suficiente para que hoy exista esta página.',
    flor: 'girasol',
    destacado: true,
    icono: '👀',
  },
  {
    id: 'la-amiga',
    fecha: '2024-08-24',
    fechaTexto: 'entre esa noche y el día siguiente',
    titulo: 'La amiga que lo dijo en voz alta',
    resumen:
      'Su amiga hablando con mi amigo, y en medio de la conversación: que yo le parecía atractivo.',
    relato:
      'Hay parejas que se deben a una canción o a una casualidad. Nosotros nos debemos a que su amiga habló con mi amigo y soltó, como quien no quiere la cosa, que yo le había parecido atractivo. Sin ese comentario yo no habría escrito nunca.',
    flor: 'gerbera',
    icono: '🗣️',
    nota: {
      autor: 'osito',
      texto: 'Habría que agradecerle a esa amiga algún día.',
    },
  },
  {
    id: 'el-mensaje-de-instagram',
    fecha: '2024-08-25',
    titulo: 'Le escribí por Instagram',
    resumen:
      'Al día siguiente de Area74. Y lo primero que le confesé fue que me arrepentía de no haberle hablado.',
    relato:
      'Un día. Eso fue lo que aguanté. La noche anterior habíamos estado en el mismo lugar sin decirnos nada, y al día siguiente le escribí. Después de dos frases de cortesía ya le estaba diciendo que me arrepentía de algo, y ese algo era no haberle hablado en Area74. Ella lo resolvió en un mensaje: que ya lo había compensado por escribirle hoy. Todo lo que vino después empezó ahí.',
    flor: 'tulipan-violeta',
    destacado: true,
    icono: '💬',
    // La conversación real, reconstruida a partir de las capturas.
    chat: [
      { de: 'osito', texto: 'heey' },
      { de: 'osita', texto: 'Holaa' },
      { de: 'osito', texto: 'cómo estás??' },
      { de: 'osita', texto: 'Muy biennn ¿Y vos?' },
      { de: 'osito', texto: 'q buenoo, me alegro', responde: 'Muy biennn ¿Y vos?' },
      { de: 'osito', texto: 'fíjate q más o menos' },
      { de: 'osito', texto: 'me arrepiento de algo' },
      { de: 'osita', texto: 'Graciass', responde: 'q buenoo, me alegro', reaccion: '❤️' },
      { de: 'osita', texto: 'Qué pasa?', responde: 'me arrepiento de algo' },
      { de: 'osito', texto: 'es q no te hablé ayer', responde: 'Qué pasa?' },
      { de: 'osito', texto: 'de eso me arrepiento 😞' },
      { de: 'osita', texto: 'De hechoo' },
      { de: 'osita', texto: 'Peroo' },
      { de: 'osita', texto: 'Me hablaste hoy, así que ya lo compensaste' },
      { de: 'osita', texto: 'JAJAJAJAJAJAJA' },
    ],
    nota: {
      autor: 'osito',
      texto: 'Ese 😞 fue el primero de 411. Ya se veía venir.',
    },
  },
  {
    id: 'primer-mensaje-whatsapp',
    fecha: '2024-08-30',
    titulo: 'El primer "holaa"',
    resumen:
      'A las 4:19 de la tarde empezó un chat que no ha parado desde entonces.',
    relato:
      'El primer mensaje de WhatsApp fue un "holaa" mío, a las 4:19 de la tarde del 30 de agosto de 2024. Nada memorable, nada preparado. Y desde ese día no hemos dejado pasar ninguno sin escribirnos.',
    flor: 'nube',
    icono: '💌',
    chat: [
      { de: 'osito', texto: 'holaa', hora: '4:19 p. m.' },
    ],
  },
  {
    id: 'somos-novios',
    fecha: '2024-11-24',
    titulo: 'El día que dijiste que sí',
    lugar: 'FALTA',
    resumen:
      'Con un ramo de rosas amarillas, rosadas y rojas, nubes blancas y ciprés. Y vos dijiste que sí.',
    relato: 'FALTA: cómo fue, qué le dijiste, qué te dijo, cómo tenías las manos.',
    flor: 'rosa-roja',
    destacado: true,
    icono: '🌹',
    nota: {
      autor: 'osito',
      texto: 'Todavía me tiembla la mano de acordarme.',
    },
  },
  {
    id: 'flores-de-lego',
    fecha: '2025-01-01',
    fechaTexto: 'FALTA LA FECHA REAL',
    titulo: 'Las flores que armamos juntos',
    resumen:
      'Un tulipán amarillo, uno violeta, una rosa roja y un hibisco rosa. Pieza por pieza, los dos.',
    relato: 'FALTA: cuándo fue, dónde las armaron, cuánto tardaron, quién armó cuál.',
    flor: 'tulipan-amarillo',
    icono: '🌷',
  },
]
