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
   * pisó.
   *
   * **Cada capítulo guarda menos que el anterior:** cinco en el de
   * Boo, cuatro en el de Ovi, tres en el de Nico, y en los tres la
   * cima es una de ellas. Y no es solo cuánto camino hay que rehacer:
   * el hito va firme siempre, así que quitar uno convierte ese
   * descanso en una caja que cede o en una almohada que se hunde. El
   * probador comprueba la cuenta.
   */
  hito?: boolean
  /**
   * Los tramos de impulso: al caer ahí la lanzan sola, sin dedo, con
   * la fuerza de `IMPULSO` y hacia el lado que diga. La tortuga se
   * centra en el tramo antes de salir, así que el salto sale siempre
   * igual y se puede poner el destino donde uno quiera.
   */
  impulso?: 'derecha' | 'izquierda'
  /**
   * Solo en los capítulos donde el suelo cede: esta plataforma no.
   *
   * Las estrellas, los tramos de impulso, las cajas de peluches y el
   * suelo ya son firmes por regla, y no hace falta marcarlos. Esto es
   * para dar un respiro en medio de una racha de cajas movedizas.
   */
  firme?: boolean
  /**
   * La caja forrada de cinta de embalaje: lisa, no agarra.
   *
   * Caminando por encima no pasa nada. **Parada cargando la barra
   * sí**: se va resbalando hacia el lado que la caja está bajando, y
   * como la caja cede hacia donde ella está, cuanto más aguanta más
   * se inclina y más rápido se va. Aguantar de más la tira.
   *
   * Refuerza la lección del capítulo en vez de contradecirla: en el
   * medio de la caja no hay cuesta, así que el medio es el único
   * sitio donde se puede cargar tranquila, que es también el único
   * desde donde el salto sale a su altura entera.
   */
  resbala?: boolean
  /**
   * La caja abierta y rebosante de peluches viejos: rebota.
   *
   * Caer ahí no la para, la devuelve, con parte de lo que traía y
   * hacia donde iba. Se agota sola en tres o cuatro rebotes porque
   * cada uno sale del anterior. No cuenta como pasito: no gastó barra.
   *
   * Distinta del tramo de impulso de Boo, que centra a la tortuga y
   * la lanza siempre igual. Aquel es un regalo, este depende de cómo
   * entres.
   */
  rebote?: boolean
  /**
   * Una nota para el probador: a esta se llega **solo con la barra al
   * tope**, y es a propósito.
   *
   * No cambia nada del juego. Sirve para que `npm run luna:probar` no
   * marque como error un salto que sale en uno de cada veinte
   * intentos, que en el capítulo de Ovi es justamente la gracia.
   */
  alTope?: boolean
  /**
   * La hermana de `alTope` en el capítulo de Nico: a esta se llega
   * **solo saliendo antes de que la almohada se hunda**, y es a
   * propósito.
   *
   * Tampoco cambia nada del juego. Es lo que le dice al probador que
   * un tramo que se pasa desde la almohada entera y no desde la
   * hundida está bien escrito y no roto.
   */
  aPrisa?: boolean
  /**
   * La cobija enredada del capítulo de Nico: la barra carga más lento
   * encima.
   *
   * Caminando no pasa nada. **Parada cargando sí**: la barra tarda
   * `COBIJAS.msDeCarga` en llenarse en vez de `SALTO.msDeCarga`,
   * mientras el aguante antes del desmayo sigue siendo el mismo. O
   * sea que llegar al tope desde una cobija se paga entrando en la
   * zona roja, y como la cobija además se hunde, cada milisegundo de
   * más se cobra dos veces: en tiempo y en altura.
   *
   * La almohada cobra por esperar y la cobija cobra por apurarse. Es
   * la traba del capítulo multiplicada por sí misma, y por eso va en
   * el tercero y no en otro.
   */
  enreda?: boolean
}

/** La misma plataforma ya convertida. `y` es la línea que se pisa. */
export interface Plataforma {
  x: number
  y: number
  ancho: number
  hito?: boolean
  /** 1 lanza a la derecha, -1 a la izquierda. Sin esto, no es tramo de impulso. */
  impulso?: 1 | -1
  /**
   * Si esta plataforma se inclina cuando se para encima. Lo decide
   * `construirNivel` a partir de la traba del capítulo: en el de Ovi
   * ceden todas menos el suelo, las estrellas, los tramos de impulso,
   * las cajas de peluches y las marcadas como firmes.
   */
  cede?: boolean
  /** Lisa de cinta: cargar la barra encima la va resbalando. */
  resbala?: boolean
  /** Llena de peluches: caer ahí rebota en vez de parar. */
  rebote?: boolean
  /**
   * Si esta almohada se hunde mientras está parada encima. Lo decide
   * `construirNivel` a partir de la traba del capítulo: en el de Nico
   * se hunden todas menos el suelo, las estrellas, los tramos de
   * impulso y las marcadas como firmes.
   */
  hunde?: boolean
  /** A esta se llega solo con la barra al tope, y es a propósito. */
  alTope?: boolean
  /** Y a esta, solo saliendo antes de que la almohada se hunda. */
  aPrisa?: boolean
  /** Enredada en la cobija: la barra carga más lento parada encima. */
  enreda?: boolean
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
   * Cómo le puso ella a la tortuga la primera vez que jugó. Vacío es
   * «todavía no le puso», y mientras esté vacío se le vuelve a
   * preguntar y en los textos sale «la tortuga».
   */
  nombre: string
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
   * La traba del capítulo de Boo: la pista se borra detrás. Si es
   * falso, el camino se queda donde está.
   */
  seDesvanece: boolean
  /**
   * La traba del capítulo de Ovi: las cajas se inclinan hacia el lado
   * donde está parada, así que el punto donde aterriza decide desde
   * qué altura sale el salto siguiente.
   */
  cede: boolean
  /**
   * La traba del capítulo de Nico: las almohadas se hunden mientras
   * está parada encima, así que cuanto más se demore en salir, más
   * abajo sale el salto. Si es falso, el suelo se queda a su altura.
   */
  seHunde: boolean
  /**
   * De qué tamaño se ve la luna en este capítulo. Crece capítulo a
   * capítulo: en el cuarto de Nico ya se ve grande, que es lo que él
   * mismo le dice en la presentación.
   */
  radioDeLaLuna: number
}

/**
 * Un capítulo tal como se escribe en `luna.ts`: el peluche, su
 * presentación, su cierre y las plataformas.
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
  cede: boolean
  seHunde: boolean
  presentacion: {
    titulo: string
    texto: string[]
    boton: string
  }
  /** Lo que se lee al ganarlo, con el peluche ya trepado al caparazón. */
  cierre: {
    titulo: string
    texto: string
  }
  plataformas: PlataformaEscrita[]
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
  /** Cayó en una caja de peluches y la devolvió para arriba. */
  | 'rebote'
  /** Le pegó el apurón: la barra se le desboca unos saltos. */
  | 'apuron'
  /** Le pegó el apagón: la barra deja de verse unos saltos. */
  | 'apagon'
  /** Se acabó la cinemática de irse la luna: el capítulo terminó. */
  | 'fin'

/**
 * La foto del mundo que recibe el pintor, ya interpolada entre dos
 * pasos de física. Nadie de aquí para afuera toca el estado real.
 */
/** Cuál de las dos cosas que caen. */
export type QueCae = 'apuron' | 'apagon'

/** Una de esas cosas, mientras baja. */
export interface AlgoCayendo {
  x: number
  y: number
  cual: QueCae
  /** Cuánto lleva girando, en radianes. */
  giro: number
  /** Su sitio en el vaivén de lado, para que no baje en plomada. */
  fase: number
  /**
   * Lo que lleva deshaciéndose, de 0 (entero) a 1 (ya no está). Se
   * deshace contra una plataforma o contra la tortuga, y mientras dura
   * el puf sigue en la lista para poder dibujarlo.
   */
  puf: number
}

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
   * Cuánto está inclinada cada caja ahora mismo, de -1 (se hundió la
   * izquierda) a 1 (se hundió la derecha), por índice de plataforma.
   * En los capítulos donde nada cede se queda todo en 0.
   */
  inclinacion: number[]
  /**
   * Cuánto está hundida cada almohada ahora mismo, de 0 (entera) a 1
   * (en el fondo), por índice de plataforma. En los capítulos donde
   * nada se hunde se queda todo en 0.
   */
  hundido: number[]
  /**
   * La última caja de peluches que rebotó y hace cuántos
   * milisegundos, para dibujarla aplastándose y volviendo. Nula
   * mientras no haya rebotado ninguna.
   */
  rebote: { indice: number; ms: number } | null
  /** Lo que hay cayendo ahora mismo, con lo que se está deshaciendo. */
  loQueCae: AlgoCayendo[]
  /**
   * El efecto puesto, si hay uno, y cuántos saltos le quedan. Con
   * `apagon` el pintor no dibuja la barra: es todo lo que hace.
   */
  efecto: { cual: QueCae; saltos: number } | null
  /**
   * En qué momento del capítulo va.
   *
   * `espera` es antes de empezar: la tortuga camina por el suelo
   * detrás del cartel, pero la luna todavía no se ha presentado. Su
   * cinemática arranca cuando ella le da al botón, que es cuando
   * puede verla; corriendo antes se gastaba detrás del texto.
   */
  cine: 'espera' | 'entrada' | 'jugando' | 'salida' | 'fin'

  /** Por dónde va la cinemática, de 0 a 1. */
  cineAvance: number

  /** Cuántos saltos lleva dados. Son los pasitos de la tortuga. */
  pasitos: number
  /** Cuántas veces se cayó. */
  caidas: number
  plataformas: Plataforma[]
}
