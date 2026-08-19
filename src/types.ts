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
  /**
   * Qué parte de la foto se ve dentro del cuadro de la polaroid.
   * Por defecto el centro; si una foto vertical queda cortada de la
   * cara, poné 'top' (o '50% 20%', que es CSS object-position).
   */
  encuadre?: string
}

/** Lo que no es texto dentro de una conversación. */
export type TipoDeMensaje = 'texto' | 'audio' | 'foto' | 'video' | 'sticker' | 'reel'

export interface Mensaje {
  de: Quien
  texto: string
  /** Hora tal cual salía en el chat: '11:47 p. m.' */
  hora?: string
  /** Para audios, fotos y stickers dentro de la conversación. */
  tipo?: TipoDeMensaje
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

/**
 * Un día como hoy: el pedacito de conversación que hubo esta misma
 * fecha, en otro año.
 *
 * Igual que los chats de los momentos, los mensajes no viven en el
 * código: llegan de public/cifrado/dia-como-hoy-MM.enc, un archivo por
 * mes para que el teléfono baje solo el que necesita. Los arma
 * scripts/preparar-dia-como-hoy.mjs.
 */
export interface RecuerdoDelDia {
  /** La fecha entera, con su año: '2025-08-17'. */
  fecha: string
  fuente: FuenteChat
  /** Cuántos mensajes se escribieron ese día, entre las dos apps. */
  total: number
  mensajes: Mensaje[]
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

/**
 * Fotos sin momento exacto.
 *
 * Un día del que quedaron fotos pero no una historia que contar: no
 * merece una cápsula entera, y tampoco se puede perder. Sale en la
 * línea del tiempo como un punto pequeño con una sola línea escrita,
 * entre momento y momento, sin enlace a ninguna parte.
 */
export interface Instante {
  id: string
  /** ISO 'YYYY-MM-DD'. Se intercala con los momentos por esta fecha. */
  fecha: string
  /** Sustituye a la fecha en pantalla, igual que en los momentos. */
  fechaTexto?: string
  lugar?: string
  /** Una línea, manuscrita. Si necesita dos párrafos, es un momento. */
  texto: string
  fotos?: Foto[]
  /** Le da color al punto. Sin flor, el punto queda del gris del tallo. */
  flor?: Flor
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

/**
 * El tono de un mensajito del frasco. No es una etiqueta que se lea en
 * pantalla: es lo que le da el color del papel a la estrellita.
 */
export type TonoEstrellita = 'animo' | 'amor' | 'chiste' | 'promesa' | 'recuerdo'

export interface Estrellita {
  /** Corto: tiene que caber doblado dentro de una estrellita de papel. */
  texto: string
  de: Quien
  tono?: TonoEstrellita
}

/**
 * El sobre cifrado del frasco: public/cifrado/frasco.enc.
 *
 * Ninguno de estos mensajitos vive en src/ — varios son frases reales
 * del chat. Se escriben en private/publicable/frasco.json y llegan al
 * teléfono cifrados, como las conversaciones.
 */
export interface FrascoGuardado {
  mensajitos: Estrellita[]
}

/* ────────────────────────────────────────────────────────────────
   EL JUEGO — "¿quién dijo esto?"

   Ninguna de estas frases vive en src/: llegan del archivo cifrado
   public/cifrado/juego.enc, que arma scripts/preparar-juego.mjs a
   partir de las que Armando aprobó. Aquí solo está la forma.
   ──────────────────────────────────────────────────────────────── */

export type RespuestaJuego = Quien | 'ambos' | 'ninguno'

export interface MensajeContexto extends Mensaje {
  /** La burbuja que hay que adivinar, para poder resaltarla. */
  esLaFrase?: boolean
}

/** Un pedazo de conversación alrededor de la frase. */
export interface ContextoDeFrase {
  fecha: string
  fuente: FuenteChat
  mensajes: MensajeContexto[]
}

export interface FraseJuego {
  id: string
  /** Ya viene normalizada: ver la aclaración en src/content/juego.ts. */
  texto: string
  respuesta: RespuestaJuego
  fecha?: string
  /** 'inventado' son las que escribimos nosotros: la respuesta es "ninguno". */
  fuente?: FuenteChat | 'inventado'
  /** Cuántas veces la dijo cada uno. Solo en las de "los dos". */
  veces?: { osito: number; osita: number }
  /** Una línea escrita a mano que se muestra al responder. */
  pista?: string
  /**
   * De dónde salió la frase, para leerlo después de responder. Las de
   * "los dos" traen dos: una de cada uno, para que se vea que de verdad
   * la dicen ambos. Las inventadas no traen ninguno.
   */
  contextos: ContextoDeFrase[]
}

/** El archivo cifrado completo. */
export interface SobreJuego {
  generado: string
  huella: string
  frases: FraseJuego[]
}
