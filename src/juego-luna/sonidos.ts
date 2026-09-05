import type { EventoLuna } from '@/types'

/**
 * LOS SONIDOS DEL JUEGO
 *
 * Cortos, discretos y **apagados de fábrica**. No se descarga ningún
 * archivo: cada uno se arma con la Web Audio API en el momento, que
 * para un pop y un toc sale más barato que bajar un mp3 y además deja
 * afinarlos cambiando un número.
 *
 * Arrancan apagados a propósito. Puede abrir el juego en el bus o con
 * gente al lado, y un pop inesperado a todo volumen no es una sorpresa
 * bonita: es un susto. Que los encienda ella si quiere.
 *
 * **Las recetas son datos.** Están acá abajo, en `RECETAS`, y quien las
 * toca es `tocar`, que sirve igual con un contexto de verdad y con uno
 * de los que graban sin sonar. De eso vive el banco (`npm run
 * luna:sonidos`): dibuja estos mismos sonidos y mide cuánto duran, sin
 * copiarse una sola línea de acá.
 */

const LLAVE = 'dosositos:luna:sonido'

/**
 * El volumen de todo, junto.
 *
 * Bajo aposta. Esto se oye por la bocina del teléfono mientras ella
 * mira una tortuga; no es la música de la web.
 *
 * Sale de acá para que el banco mida los picos con el mismo volumen
 * con que van a sonar, y no con el de la receta pelada.
 *
 * En 0.5 el más fuerte de los nueve —el pop del salto— pica en 0.23, o
 * sea a un cuarto de lo que aguanta el altavoz. Discreto y con sitio de
 * sobra para que tres sonidos encimados no raspen, que pasa: se puede
 * pisar una estrella justo al aterrizar de un salto.
 */
export const VOLUMEN_MAESTRO = 0.5

/** Cuánto tarda en entrar cada sonido. Sin esto suena un chasquido. */
const ATAQUE = 0.004

/** Un oscilador con su sobre: la parte con altura de un sonido. */
type Voz = {
  onda?: OscillatorType
  /** De qué frecuencia sale, en Hz. */
  de: number
  /** A cuál llega. Si no está, se queda quieta. */
  a?: number
  /** Cuánto dura, en segundos. */
  dura: number
  volumen: number
  /** Cuándo entra, en segundos desde el principio del sonido. */
  entra?: number
}

/** Un soplido de ruido filtrado: la parte sin altura, la del golpe. */
type Ruido = {
  /** Por dónde le corta el pasa-bajos, en Hz. Más bajo, más sordo. */
  corte: number
  dura: number
  volumen: number
  entra?: number
}

export type Receta = { voces?: Voz[]; ruidos?: Ruido[] }

/**
 * Qué suena en cada cosa que pasa.
 *
 * Los dos que se repiten todo el tiempo —el pop de soltar y el toc de
 * aterrizar— son los más cortos de todos, por debajo de los 100 ms. No
 * es capricho: son los que se van a oír miles de veces en una subida, y
 * un sonido de medio segundo repetido mil veces cansa a los tres
 * minutos. Los que pasan poco pueden durar más, y la cima es el único
 * que se pasa de un cuarto de segundo. Los largos de verdad los caza el
 * banco, que mide lo grabado y se queja solo.
 */
export const RECETAS: Partial<Record<EventoLuna, Receta>> = {
  /** El pop de soltar: sube y se va. Es el sonido de salir disparada. */
  salto: {
    voces: [{ onda: 'sine', de: 480, a: 900, dura: 0.06, volumen: 0.5 }],
  },

  /** El toc de aterrizar: un golpecito sordo y nada más. */
  aterrizaje: {
    voces: [{ onda: 'sine', de: 170, a: 95, dura: 0.07, volumen: 0.4 }],
    ruidos: [{ corte: 900, dura: 0.04, volumen: 0.22 }],
  },

  /** La caída: se desliza para abajo, que es lo que acaba de hacer. */
  caida: {
    voces: [{ onda: 'triangle', de: 420, a: 120, dura: 0.2, volumen: 0.4 }],
  },

  /**
   * El mareo de aguantar la barra de más. Dos tonos que se cruzan y
   * quedan desafinados entre sí: dicen lo mismo que las estrellitas
   * dando vueltas encima de su cabeza, pero por el oído.
   */
  agotada: {
    voces: [
      { onda: 'triangle', de: 330, a: 240, dura: 0.16, volumen: 0.3 },
      { onda: 'triangle', de: 352, a: 232, dura: 0.16, volumen: 0.26, entra: 0.02 },
    ],
  },

  /** El tramo de impulso: la manda sola para arriba, y se oye subir. */
  impulso: {
    voces: [{ onda: 'triangle', de: 320, a: 1250, dura: 0.22, volumen: 0.34 }],
  },

  /** La caja de peluches que la devuelve: un boing corto y blando. */
  rebote: {
    voces: [{ onda: 'sine', de: 260, a: 620, dura: 0.11, volumen: 0.38 }],
  },

  /** La estrellita de papel. Dos notas para arriba: quedó guardado. */
  hito: {
    voces: [
      { onda: 'sine', de: 880, dura: 0.07, volumen: 0.34 },
      { onda: 'sine', de: 1320, dura: 0.1, volumen: 0.3, entra: 0.07 },
    ],
  },

  /** Llegó arriba del capítulo. Tres notas, y ahí sí se puede festejar. */
  cima: {
    voces: [
      { onda: 'sine', de: 660, dura: 0.09, volumen: 0.32 },
      { onda: 'sine', de: 880, dura: 0.09, volumen: 0.32, entra: 0.09 },
      { onda: 'sine', de: 1320, dura: 0.2, volumen: 0.3, entra: 0.18 },
    ],
  },
}

/**
 * El apurón y el apagón suenan igual: un golpe seco.
 *
 * A propósito. Lo que le cayó encima es distinto y el dibujo lo dice,
 * pero por el oído lo que pasó es lo mismo —algo le pegó— y darle dos
 * sonidos distintos sería pedirle que aprenda un idioma más.
 */
const GOLPE: Receta = {
  voces: [{ onda: 'square', de: 130, a: 70, dura: 0.09, volumen: 0.24 }],
  ruidos: [{ corte: 480, dura: 0.09, volumen: 0.3 }],
}

/** La receta de un evento, o nada si ese evento no suena. */
export function recetaDe(evento: EventoLuna): Receta | undefined {
  if (evento === 'apuron' || evento === 'apagon') return GOLPE
  return RECETAS[evento]
}

/** Cuánto dura una receta entera, en segundos. Lo usa el banco. */
export function largoDe(receta: Receta): number {
  let largo = 0
  for (const voz of receta.voces ?? []) largo = Math.max(largo, (voz.entra ?? 0) + voz.dura)
  for (const ruido of receta.ruidos ?? []) largo = Math.max(largo, (ruido.entra ?? 0) + ruido.dura)
  return largo
}

/**
 * Un pedacito de ruido blanco, uno por contexto.
 *
 * Se guarda porque llenar el buffer a mano en cada aterrizaje sería
 * rehacer el mismo medio segundo de números al azar cientos de veces
 * por partida.
 */
const ruidoGuardado = new WeakMap<BaseAudioContext, AudioBuffer>()

function ruidoDe(ctx: BaseAudioContext): AudioBuffer {
  const guardado = ruidoGuardado.get(ctx)
  if (guardado) return guardado

  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.5), ctx.sampleRate)
  const datos = buffer.getChannelData(0)
  for (let i = 0; i < datos.length; i += 1) datos[i] = Math.random() * 2 - 1
  ruidoGuardado.set(ctx, buffer)
  return buffer
}

/**
 * El sobre de cualquier voz: entra en 4 ms, se apaga sola y termina en
 * cero de verdad.
 *
 * Los dos remates importan. Sin la bajada exponencial suena a lata; y
 * sin la rampa a cero del final el sonido se corta con el altavoz a
 * mitad de camino, que es exactamente un chasquido.
 */
function sobre(ctx: BaseAudioContext, volumen: number, t0: number, dura: number): GainNode {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t0)
  g.gain.linearRampToValueAtTime(volumen, t0 + ATAQUE)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dura)
  g.gain.linearRampToValueAtTime(0, t0 + dura + 0.005)
  return g
}

/**
 * Arma una receta y la manda a `destino`, empezando en `t0`.
 *
 * No sabe si el sonido está encendido ni de qué contexto se trata: eso
 * es lo que deja que el banco use esta misma función para grabar los
 * sonidos en vez de tocarlos.
 */
export function tocar(ctx: BaseAudioContext, destino: AudioNode, receta: Receta, t0: number): void {
  for (const voz of receta.voces ?? []) {
    const entra = t0 + (voz.entra ?? 0)
    const osc = ctx.createOscillator()
    osc.type = voz.onda ?? 'sine'
    osc.frequency.setValueAtTime(voz.de, entra)
    if (voz.a !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, voz.a), entra + voz.dura)
    }

    const g = sobre(ctx, voz.volumen, entra, voz.dura)
    osc.connect(g).connect(destino)
    osc.start(entra)
    osc.stop(entra + voz.dura + 0.02)
  }

  for (const ruido of receta.ruidos ?? []) {
    const entra = t0 + (ruido.entra ?? 0)
    const fuente = ctx.createBufferSource()
    fuente.buffer = ruidoDe(ctx)

    const filtro = ctx.createBiquadFilter()
    filtro.type = 'lowpass'
    filtro.frequency.setValueAtTime(ruido.corte, entra)

    const g = sobre(ctx, ruido.volumen, entra, ruido.dura)
    fuente.connect(filtro).connect(g).connect(destino)
    fuente.start(entra)
    fuente.stop(entra + ruido.dura + 0.02)
  }
}

/* ── Y de acá para abajo, el aparato que suena en el teléfono ────── */

let contexto: AudioContext | null = null
let maestro: GainNode | null = null

/** Si ya se intentó y el navegador dijo que no, no se insiste más. */
let imposible = false

function leerElInterruptor(): boolean {
  try {
    return localStorage.getItem(LLAVE) === 'si'
  } catch {
    // Sin localStorage el juego anda igual, solo que el interruptor se
    // olvida al cerrar. Apagado, que es como arranca siempre.
    return false
  }
}

let encendido = leerElInterruptor()

/**
 * Despierta el aparato de sonido.
 *
 * El navegador no deja crear ni arrancar audio hasta que la persona
 * tocó algo, así que esto se llama desde el toque que enciende el
 * interruptor y desde cada salto — que también es un toque suyo. En
 * iOS, además, el contexto se duerme solo al volver de otra pestaña, y
 * por eso se le pide despertar cada vez y no una sola.
 */
function despertar(): AudioContext | null {
  if (imposible) return null
  try {
    if (!contexto) {
      contexto = new AudioContext()
      maestro = contexto.createGain()
      maestro.gain.value = VOLUMEN_MAESTRO
      maestro.connect(contexto.destination)
    }
    if (contexto.state === 'suspended') void contexto.resume()
    return contexto
  } catch {
    imposible = true
    return null
  }
}

/** ¿Están encendidos ahora mismo? */
export function sonidoEncendido(): boolean {
  return encendido
}

/**
 * Prende o apaga, y se acuerda.
 *
 * Se llama desde el botón, o sea desde un toque de ella: es el momento
 * exacto en que el navegador deja crear el audio, y por eso se despierta
 * acá y no la primera vez que salte.
 */
export function cambiarSonido(quiere: boolean): void {
  encendido = quiere
  try {
    localStorage.setItem(LLAVE, quiere ? 'si' : 'no')
  } catch {
    /* se olvida al cerrar y ya: no vale caerse por esto */
  }
  if (quiere) despertar()
}

/**
 * Lo que llaman el juego y la escuelita en cada cosa que pasa.
 *
 * Si está apagado no toca ni crea nada, que es la mitad del punto de
 * que arranque apagado: sin encenderlo, la Web Audio API no se usa
 * nunca. Y si el evento no tiene receta tampoco pasa nada — no todos
 * los eventos del motor suenan.
 */
export function sonar(evento: EventoLuna): void {
  if (!encendido) return
  const receta = recetaDe(evento)
  if (!receta) return

  const ctx = despertar()
  if (!ctx || !maestro) return
  try {
    tocar(ctx, maestro, receta, ctx.currentTime)
  } catch {
    /* si un sonido no sale, el juego sigue: no vale caerse por esto */
  }
}
