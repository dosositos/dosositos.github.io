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

/* ────────────────────────────────────────────────────────────────
   EL DICCIONARIO OSO–ESPAÑOL

   La ficha de cada palabra va en claro en src/content/diccionario.ts:
   es la voz del que cuenta, no una cita. Lo que sí es cita textual
   —el ejemplo de uso y las burbujas donde nació la palabra— vive
   cifrado en public/cifrado/diccionario.enc, igual que los chats.
   ──────────────────────────────────────────────────────────────── */

/** Una forma de escribir la misma palabra, con las veces que se usó. */
export interface FormaDePalabra {
  forma: string
  veces: number
}

/**
 * Lo que el chat sabe de una palabra.
 *
 * Nada de esto se escribe a mano: sale de peinar las dos fuentes con
 * scripts/preparar-diccionario.mjs. Son números y fechas, no frases,
 * así que pueden ir en claro sin romper la regla de privacidad — y son
 * justo lo que hace que el libro se sienta un libro de verdad.
 */
export interface DatosDePalabra {
  /** Mensajes que la contienen, en las dos fuentes juntas. */
  veces: number
  /** El reparto entre los dos. Es la mitad de la gracia de cada entrada. */
  reparto: { osito: number; osita: number }
  /** ISO 'YYYY-MM-DD' del primer mensaje donde aparece. */
  nacio: string
  /** 'HH:MM' de ese primer mensaje, en horario de Nicaragua. */
  hora?: string
  /** Quién la dijo primero. No siempre es quien más la usa. */
  acuño: Quien
  /** ISO de la última vez. Sirve para saber si la palabra sigue viva. */
  ultima?: string
  /** Variantes ortográficas, de la más usada a la menos. */
  formas?: FormaDePalabra[]
}

export interface EntradaDiccionario {
  /** Llave corta y estable. Es el ancla del índice alfabético. */
  id: string
  palabra: string
  /**
   * Por qué palabra se alfabetiza, cuando el lema empieza con algo que
   * no cuenta: «qué barbaridad» va en la B y «la letanía» en la L. Sin
   * esto, el índice del canto sale en A, Q, C…
   */
  alfabetiza?: string
  /** Cómo se pronuncia, en broma: 'o·si·ti·ta' */
  fonetica?: string
  /** La categoría, abreviada como en los diccionarios: 's. f.', 'interj.' */
  tipo: string
  definicion: string
  /** Acepciones siguientes, si la palabra tiene más de un uso. */
  acepciones?: string[]
  /** Quién la acuñó, cuando la ficha lo quiere decir en palabras. */
  autor?: Quien
  datos?: DatosDePalabra
  /** Nota manuscrita al margen de la página, opcional. */
  margen?: string
  /**
   * Si tiene expediente cifrado (dónde nació y la curva de uso). La
   * ficha se lee igual sin él; lo cifrado llega en una hoja aparte.
   */
  cifrada?: boolean
  /**
   * Cuando el título de la entrada ES una frase de la conversación —las
   * fórmulas del saludo, las medidas del infinito— no puede vivir acá
   * en claro: llega descifrado y `palabra` es solo lo que se ve
   * mientras tanto.
   */
  lemaCifrado?: boolean
  /**
   * Bajo qué letra va en el índice del canto. Se usa cuando el lema
   * llega cifrado y por lo tanto no se le puede mirar la primera letra.
   */
  letraIndice?: string
}

/* ── El expediente cifrado ────────────────────────────────────────
   Lo que llega de public/cifrado/diccionario.enc. Lo arma
   scripts/preparar-diccionario.mjs y no se escribe a mano. */

/** Un mes de uso de una palabra, para dibujar la curva. */
export interface MesDeUso {
  /** 'YYYY-MM' */
  mes: string
  veces: number
  /** Largo medio del mensaje ese mes. Solo importa en las fórmulas. */
  largo: number
}

export interface ExpedienteDePalabra {
  /** El título real, cuando la entrada es una frase entera. */
  lema?: string
  /** Cuánto medía de verdad el mensaje del que salió ese título. */
  lemaLargo?: number
  /** El pedazo de conversación donde la palabra apareció por primera vez. */
  nacimiento: {
    fecha: string
    fuente: FuenteChat
    mensajes: MensajeContexto[]
  }
  serie: MesDeUso[]
}

export interface DiccionarioGuardado {
  entradas: Record<string, ExpedienteDePalabra>
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

/* ── A la luna, a pasitos de tortuga ──────────────────────────────
   El juego escondido en la luna de la portada. Todo esto es
   geometría del mundo lógico de 360 × 640: nada que ver con píxeles
   de pantalla, que los pone el pintor según el alto del teléfono. */

/**
 * Un tramo de suelo, tal como se escribe en `luna.ts`.
 *
 * La `altura` se cuenta desde el suelo del capítulo y crece hacia
 * arriba, que es como se piensa un nivel: «esta plataforma está 120
 * más arriba que la anterior». El motor lo convierte solo.
 */
export interface PlataformaEscrita {
  x: number
  ancho: number
  altura: number
  /**
   * Los hitos guardan el avance: si se cae, vuelve al último que
   * pisó. Van cinco por capítulo, uno cada seis o siete plataformas.
   */
  hito?: boolean
  /**
   * Los tramos de impulso: al caer ahí la lanzan sola, sin dedo, con
   * la fuerza de `IMPULSO` y hacia el lado que diga. La tortuga se
   * centra en el tramo antes de salir, así que el salto sale siempre
   * igual y se puede poner el destino donde uno quiera.
   */
  impulso?: 'derecha' | 'izquierda'
}

/** La misma plataforma ya convertida. `y` es la línea que se pisa. */
export interface Plataforma {
  x: number
  y: number
  ancho: number
  hito?: boolean
  /** 1 lanza a la derecha, -1 a la izquierda. Sin esto, no es tramo de impulso. */
  impulso?: 1 | -1
  /** Su lugar en la lista, para saber qué hito se alcanzó. */
  indice: number
}

/** Lo que se guarda en el teléfono entre una vez y otra. */
export interface ProgresoLuna {
  /** El capítulo más alto que ganó. 0 es «todavía ninguno». */
  capitulo: number
  /** Los pasitos que lleva dados en total. */
  pasitos: number
  /** Las veces que se cayó en total. */
  caidas: number
  /**
   * Los poderes ganados, por su id. Se gana uno al cerrar cada
   * capítulo y se gastan de a uno por capítulo, sin recarga.
   */
  poderes: string[]
}

/** De qué está hecho el camino de un capítulo. Lo usa el pintor. */
export type MaterialDelMundo = 'pista' | 'cajas' | 'almohadas'

/** Un capítulo entero, ya listo para jugarse. */
export interface Nivel {
  plataformas: Plataforma[]
  hitos: Plataforma[]
  /** La `y` del suelo, que es la plataforma de más abajo. */
  suelo: number
  /** La última de todas: llegar ahí es terminar. */
  cima: Plataforma
  /** Dónde aparece la tortuga al empezar. */
  salida: { x: number; y: number }
  material: MaterialDelMundo
  /**
   * La traba del capítulo: la pista que se borra detrás. Si es falso,
   * el camino se queda quieto y el capítulo es solo saltar.
   */
  seDesvanece: boolean
}

/**
 * Un capítulo tal como se escribe en `luna.ts`: el peluche, su
 * presentación, el poder que se gana y las plataformas.
 */
export interface CapituloEscrito {
  /** El id del peluche, que es también el del archivo de su retrato. */
  id: string
  /** Su nombre, para los pies de foto y los carteles. */
  nombre: string
  /** Su sitio en el orden. 1 es Boo. */
  numero: number
  material: MaterialDelMundo
  seDesvanece: boolean
  /** El poder que se gana al cerrarlo. */
  poder: PoderDeLaLuna
  presentacion: {
    titulo: string
    texto: string[]
    boton: string
  }
  /** Lo que se lee al ganarlo, con el poder recién estrenado. */
  cierre: {
    titulo: string
    texto: string
  }
  plataformas: PlataformaEscrita[]
}

/** Un poder de los que se ganan al cerrar un capítulo. */
export interface PoderDeLaLuna {
  id: string
  nombre: string
  /** Cómo se usa, para el cartel. */
  comoSeUsa: string
}

/** Lo que le pasa al jugador y hay que oír fuera del motor. */
export type EventoLuna =
  | 'salto'
  | 'aterrizaje'
  | 'caida'
  | 'reaparicion'
  | 'agotada'
  | 'hito'
  | 'cima'
  /** Cayó en un tramo de impulso y salió disparada sin tocar nada. */
  | 'impulso'
  /** Gastó el poder en pleno aire. */
  | 'poder'
  /** Se acabó la cinemática de irse la luna: el capítulo terminó. */
  | 'fin'

/**
 * La foto del mundo que recibe el pintor, ya interpolada entre dos
 * pasos de física. Nadie de aquí para afuera toca el estado real.
 */
export interface EscenaLuna {
  x: number
  y: number
  /** 1 mira a la derecha, -1 a la izquierda. */
  mirando: 1 | -1
  /** 0 a 1. Solo importa mientras `cargando`. */
  carga: number
  cargando: boolean
  enSuelo: boolean
  /** Cuánto lleva caminado, para el ciclo de la caminata. */
  caminado: number
  /** Velocidad de subida y bajada. Negativa sube. Da la pose del aire. */
  vy: number
  /** Segundos desde que arrancó el juego: respiración, parpadeo, temblor. */
  reloj: number
  /** Milisegundos desde el último despegue, para el fogonazo. */
  desdeSalto: number
  /** Milisegundos desde el último aterrizaje, para el golpe de cámara. */
  desdeAterrizaje: number
  /** Mientras cae fuera de pantalla no se dibuja. */
  cayendo: boolean
  /**
   * Lo cerca que está de agotarse de tanto aguantar la barra, de 0 a
   * 1. Sirve para avisar antes de que pase.
   */
  agobio: number
  /** Lo que le queda de desmayo, de 1 a 0. En 0 está entera. */
  cansancio: number
  /** Dónde está mirando la cámara: la `y` del borde de arriba. */
  camara: number
  /** El hito más alto que pisó, o -1 si todavía ninguno. */
  hitoAlcanzado: number
  /**
   * Cuánto le queda a cada tramo de pista antes de borrarse, de 1
   * (entero) a 0 (ya no está). Va por el índice de la plataforma.
   */
  vidaDeLaPista: number[]
  /**
   * Desde qué punto de su vida un tramo empieza a parpadear, de 1 a
   * 0. Cambia con las estrellas pisadas, porque la pista se apura.
   */
  avisoDeLaPista: number
  /**
   * En qué momento del capítulo va: la luna entrando, el juego, o la
   * luna yéndose al llegar arriba.
   */
  cine: 'entrada' | 'jugando' | 'salida' | 'fin'

  /** Por dónde va la cinemática, de 0 a 1. */
  cineAvance: number

  /** Si en este momento está planeando con el dedo apoyado. */
  planeando: boolean

  /** El aire de planeo que le queda, de 1 a 0. */
  aire: number
  /** Cuántos saltos lleva dados. Son los pasitos de la tortuga. */
  pasitos: number
  /** Cuántas veces se cayó. */
  caidas: number
  plataformas: Plataforma[]
}
