import type { Quien } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  NUESTROS HIJOS                                              ║
 * ║  No tienen página propia: viven escondidos por las esquinas   ║
 * ║  de la web, asomándose apenas. Ella los va encontrando y,      ║
 * ║  cuando aparecen los tres, sale el premio de abajo.            ║
 * ║                                                               ║
 * ║  Cada uno tiene VARIOS escondites y cambia de sitio cada día.  ║
 * ║  No es al azar: el escondite sale de la fecha, así que el      ║
 * ║  mismo día está siempre en el mismo lugar — si le decís «hoy   ║
 * ║  Ovi anda en la playlist», ahí va a estar — y mañana ya se     ║
 * ║  movió. Agregar o quitar escondites es cambiar la lista.       ║
 * ║                                                               ║
 * ║  Nunca hay dos en la misma página el mismo día: el reparto     ║
 * ║  del día se encarga, aunque las listas se pisen.               ║
 * ║                                                               ║
 * ║  `frase` es lo que dice al encontrarlo, en el cartel que sale  ║
 * ║  al centro de la pantalla.                                     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Las tres esquinas libres. La de arriba a la derecha tiene los botones. */
export type EsquinaEscondite = 'abajo-izquierda' | 'abajo-derecha' | 'arriba-izquierda'

export interface Escondite {
  /** La ruta tal cual sale en la barra, después del `#`. */
  ruta: string
  esquina: EsquinaEscondite
}

export interface Peluche {
  id: string
  nombre: string
  especie: string
  color: string
  regaladoPor: Quien
  descripcion: string
  emoji: string
  /** Los sitios donde puede aparecer. Cada día le toca uno. */
  escondites: Escondite[]
  /** Lo que dice al ser encontrado. */
  frase: string
  /**
   * El que no es hijo. No cuenta para el «1 de 3», no hace falta
   * encontrarlo para el premio, y cada día se le cambia el color.
   */
  esImpostor?: boolean
}

/**
 * Páginas donde el scroll es largo.
 *
 * Ahí el peluche va siempre arriba, aunque su escondite diga abajo:
 * mandarla a bajar quince momentos hasta el fondo para encontrar un
 * peluche deja de ser un guiño y se vuelve una tarea.
 */
export const RUTAS_CON_MUCHO_SCROLL = ['/linea-del-tiempo', '/juego']

export const peluches: Peluche[] = [
  {
    id: 'nico',
    nombre: 'Nico',
    especie: 'osito',
    color: 'var(--color-nico)',
    regaladoPor: 'osito',
    descripcion:
      'Rosa pálido, de pelo rizado corto. El primogénito: lo compré para que te acompañara mientras dormías, como si yo estuviera ahí.',
    emoji: '🧸',
    escondites: [
      { ruta: '/frasco', esquina: 'abajo-izquierda' },
      { ruta: '/estadisticas', esquina: 'abajo-derecha' },
      { ruta: '/juego', esquina: 'arriba-izquierda' },
    ],
    frase: 'Me mandaron a cuidarte mientras dormís. Sigo en eso.',
  },
  {
    id: 'ovi',
    nombre: 'Ovi',
    especie: 'gorila',
    color: 'var(--color-ovi)',
    regaladoPor: 'osito',
    descripcion:
      'Todo rosa pastel, con complexión de gimnasio. Apareció en una caja de peluches viejos y se vino conmigo ese mismo día.',
    emoji: '🦍',
    escondites: [
      { ruta: '/', esquina: 'abajo-izquierda' },
      { ruta: '/playlist', esquina: 'abajo-derecha' },
      { ruta: '/estadisticas', esquina: 'abajo-izquierda' },
    ],
    frase: 'Salí de una caja vieja y terminé de hijo. La vida da vueltas.',
  },
  {
    id: 'boo',
    nombre: 'Boo',
    especie: 'oso panda',
    color: 'var(--color-boo-claro)',
    regaladoPor: 'osito',
    descripcion: 'FALTA: quién se lo regaló a quién y cuándo.',
    emoji: '🐼',
    escondites: [
      { ruta: '/linea-del-tiempo', esquina: 'abajo-derecha' },
      { ruta: '/juego', esquina: 'abajo-izquierda' },
      { ruta: '/', esquina: 'arriba-izquierda' },
    ],
    frase: 'Yo estuve en casi todas estas fechas. Nadie me tomó fotos.',
  },
  {
    // El chiste de la casa. No es hijo, no cuenta para el premio, y cada
    // día amanece de otro color — nunca se sabe bien qué es ni de dónde
    // salió, que es justamente la gracia.
    id: 'dummy',
    nombre: 'El colado',
    especie: 'pato, creemos',
    color: 'var(--color-girasol)',
    regaladoPor: 'osito',
    descripcion:
      'Amarillo, con peluca verde y pico naranja. No es nuestro. Apareció un día y nadie lo reclamó.',
    emoji: '🐤',
    escondites: [
      { ruta: '/playlist', esquina: 'arriba-izquierda' },
      { ruta: '/frasco', esquina: 'abajo-derecha' },
      { ruta: '/linea-del-tiempo', esquina: 'arriba-izquierda' },
      { ruta: '/estadisticas', esquina: 'arriba-izquierda' },
    ],
    frase: 'Yo no soy de aquí. La puerta estaba abierta y entré. Nadie dijo nada.',
    esImpostor: true,
  },
]

/** Lo que sale al encontrar al colado, que no es lo mismo que un hijo. */
export const HALLAZGO_IMPOSTOR = {
  titulo: 'Este no es nuestro',
  mensaje:
    'Se coló un día que dejamos la puerta abierta y se quedó. No lo contamos entre los hijos, pero tampoco lo echamos.',
}

/** Lo que sale cuando los encuentra a los tres. */
export const PREMIO_PELUCHES = {
  titulo: 'Los encontraste a los tres',
  mensaje:
    'Andaban repartidos por la madriguera, asomándose apenas, a ver si los veías. Ya están todos en casa y de aquí no se mueven más.',
  firma: 'osito',
}
