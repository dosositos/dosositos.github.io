/** Las flores que usamos como acento de color en toda la web. */
export type Flor =
  | 'girasol'
  | 'rosa-roja'
  | 'rosa-amarilla'
  | 'rosa-pastel'
  | 'tulipan-amarillo'
  | 'tulipan-violeta'
  | 'hibisco'
  | 'gerbera'
  | 'margarita'
  | 'nube'
  | 'cipres'

export type Quien = 'osito' | 'osita'

/**
 * De dónde salió una conversación. Importa: los primeros días solo
 * existen en Instagram, porque WhatsApp empezó hasta el 30 de agosto.
 */
export type FuenteChat = 'instagram' | 'whatsapp'

export interface Foto {
  /** Ruta dentro de /public/media, sin el prefijo. Ej: '2024/primera-cita.webp' */
  src: string
  /** Descripción para lectores de pantalla y para cuando no cargue. */
  alt: string
  /** Pie de foto manuscrito, opcional. */
  pie?: string
  /** Inclinación en grados para el efecto polaroid. Por defecto, aleatoria estable. */
  giro?: number
}

export interface Mensaje {
  de: Quien
  texto: string
  /** Hora tal cual salía en el chat: '11:47 p. m.' */
  hora?: string
  /** Para audios, fotos y stickers dentro de la conversación. */
  tipo?: 'texto' | 'audio' | 'foto' | 'sticker'
  /** Si el mensaje responde a otro, el texto citado arriba (como en Instagram). */
  responde?: string
  /** Reacción pegada a la burbuja: '❤️' */
  reaccion?: string
}

export interface Nota {
  autor: Quien
  texto: string
}

/**
 * La ficha de una conversación — lo único que viaja en claro.
 *
 * Los mensajes de verdad NO están aquí: viven cifrados en
 * public/cifrado/chats.enc y se abren en el teléfono con la misma
 * frase de la puerta. Aquí solo queda cuántos son y de qué app,
 * que no le dice nada a nadie.
 */
export interface ChatGuardado {
  /** Cuántos mensajes trae, para poder anunciarlo sin abrirlo. */
  mensajes: number
  fuente: FuenteChat
  /** Rótulo del bloque, si "lo que nos dijimos" no encaja. */
  titulo?: string
}

export interface Momento {
  /** Slug para la URL: /#/momento/primera-cita */
  id: string
  /** ISO 'YYYY-MM-DD'. Si no recuerdan el día exacto, poné el 15 y usá fechaTexto. */
  fecha: string
  /** Sustituye a la fecha en pantalla: 'una noche de agosto'. */
  fechaTexto?: string
  titulo: string
  lugar?: string
  /** Una o dos líneas: es lo que se lee en la línea del tiempo. */
  resumen: string
  /** El texto largo que se lee al abrir la cápsula. */
  relato?: string
  flor: Flor
  fotos?: Foto[]
  /** La ficha del chat. Los mensajes van cifrados, ver ChatGuardado. */
  chat?: ChatGuardado
  nota?: Nota
  /**
   * Momento apuntado pero todavía sin escribir. Sale en la línea del
   * tiempo con su fecha y un "por escribir", para que no se pierda
   * mientras Armando llena la plantilla.
   */
  borrador?: boolean
  /** Si es true, se pide la frase-contraseña para verlo. */
  privado?: boolean
  /** Los que salen más grandes en la línea del tiempo. */
  destacado?: boolean
  /** Emoji o icono que marca el punto en la línea. */
  icono?: string
}

export interface EntradaDiccionario {
  palabra: string
  /** Cómo se pronuncia, en broma: 'o·si·ti·ta' */
  fonetica?: string
  tipo: string
  definicion: string
  ejemplo?: string
  autor?: Quien
}

export interface Estrellita {
  texto: string
  de: Quien
  /** Para el frasco: 'ánimo' | 'amor' | 'chiste' | 'recuerdo' */
  tono?: string
}

export interface FraseJuego {
  texto: string
  /** La respuesta correcta. */
  respuesta: Quien | 'ambos' | 'ninguno'
  /** Contexto que se revela después de responder. */
  pista?: string
  fecha?: string
  /**
   * De dónde salió. 'inventado' es para las que escribamos nosotros
   * de adorno: conviene que en el juego se note cuáles son reales.
   */
  fuente?: FuenteChat | 'inventado'
}
