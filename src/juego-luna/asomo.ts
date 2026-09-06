import { TORTUGA } from '@/content/luna'
import { cabezaDe, dibujarTortuga, poseDe } from '@/juego-luna/tortuga'
import type { Pose } from '@/juego-luna/tortuga'
import type { EscenaLuna } from '@/types'

/**
 * El asomo de la tortuga.
 *
 * Un adelanto del juego escondido en la luna, para antes de que el
 * juego exista para ella. Al final de una página —una sola por día—
 * la tortuga entra caminando tranquila, se da cuenta de que la están
 * viendo, pega un brinco del susto y se va corriendo por donde vino.
 *
 * Dura menos de tres segundos y casi todo es la caminata: el susto y
 * la huida juntos son un segundo. Es a propósito. Si se ve entero sin
 * esfuerzo deja de ser un asomo y pasa a ser un adorno del pie de
 * página, y entonces la primera vez que ella abra el juego no va a
 * tener nada que reconocer.
 *
 * ── Por qué está aparte del motor ───────────────────────────────
 * Aquí no hay física, ni plataformas, ni nada que se pueda perder:
 * es una sola línea de tiempo en milisegundos, sin estado. Se le
 * pide la foto del instante `ms` y devuelve dónde está y cómo está
 * parada. Eso deja hacerle su banco (`npm run luna:asomo`), que
 * dibuja los fotogramas uno al lado del otro, sin esperar a que la
 * animación pase.
 *
 * Lo que sí es del juego —el dibujo y las poses— sale de
 * `tortuga.ts` sin copiar una sola línea: es la misma tortuga, no
 * una versión chiquita para el pie de página.
 */

/** Los números del asomo. El lienzo va a escala 1 a 1 con el mundo. */
export const ASOMO = {
  /**
   * El alto de la franja.
   *
   * Le tiene que caber la tortuga (55), el brinco (20) y el «!»
   * encima de la cabeza (33), con un dedo de margen: en lo alto del
   * salto el signo queda a diez del borde, y si esto se achica lo
   * primero que se pierde es justo la punta del signo.
   */
  alto: 128,

  /** Cuánto suelo le queda debajo de los pies. */
  piso: 14,

  /**
   * Lo adentro que llega antes de darse cuenta.
   *
   * Ella mide unos 27 de ancho, así que a 76 del borde ya está
   * entera dentro del lienzo y con sitio de sobra: se le ve el
   * cuerpo completo un momento antes del susto, que es lo único que
   * hay que ver.
   */
  adentro: 76,

  /** Lo que camina todavía fuera del lienzo, para no aparecer de golpe. */
  afuera: 24,

  /** El momento de quedarse tiesa. Corto: es un respingo, no una pausa. */
  msAlerta: 160,

  /** El brinco del susto, subir y bajar. */
  msBrinco: 320,

  /** Lo que tarda en desaparecer por donde vino. */
  msHuida: 620,

  /** Cuánto se despega del suelo del brinco. */
  alturaDelBrinco: 20,

  /** Cuántas veces más rápido se va que como vino. */
  apuro: 3.2,
}

/** Píxeles del mundo entre una patica y la otra. Es el del motor. */
const PASITO = 11

/* Los tiempos, encadenados. Se calculan una vez y no cambian. */
const MS_CAMINATA = ((ASOMO.adentro + ASOMO.afuera) / TORTUGA.velocidad) * 1000
const T_ALERTA = MS_CAMINATA
const T_BRINCO = T_ALERTA + ASOMO.msAlerta
const T_HUIDA = T_BRINCO + ASOMO.msBrinco
export const MS_DEL_ASOMO = T_HUIDA + ASOMO.msHuida

/** 1 entra por la izquierda, -1 entra por la derecha. */
export type LadoDelAsomo = 1 | -1

/** El signo de admiración que le sale encima de la cabeza. */
export interface Admiracion {
  x: number
  y: number
  escala: number
  giro: number
  opacidad: number
}

/** Una nubecita del polvo que levanta al salir disparada. */
export interface Polvo {
  x: number
  y: number
  radio: number
  opacidad: number
}

/** La foto de un instante: todo lo que hay que pintar y nada más. */
export interface FotoDelAsomo {
  escena: EscenaLuna
  pose: Pose
  admiracion: Admiracion | null
  polvo: Polvo[]
  /** Ya se fue: no queda nada que dibujar. */
  terminado: boolean
}

const limitar = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/** Arranca rápido y afloja. Es la forma de salir corriendo. */
const disparada = (u: number) => u * (2 - u)

/**
 * Una escena de las que espera el dibujo de la tortuga.
 *
 * `EscenaLuna` trae un montón de campos que aquí no significan nada
 * —la cámara, los hitos, la pista que se borra— porque está hecha
 * para el juego entero. Se rellenan con lo neutro una sola vez.
 */
function escenaBase(cambios: Partial<EscenaLuna>): EscenaLuna {
  return {
    x: 0,
    y: 0,
    mirando: 1,
    carga: 0,
    cargando: false,
    loQueCae: [],
    colado: null,
    efecto: null,
    enSuelo: true,
    caminado: 0,
    vy: 0,
    reloj: 0,
    desdeSalto: 9999,
    desdeAterrizaje: 9999,
    cayendo: false,
    agobio: 0,
    cansancio: 0,
    camara: 0,
    hitoAlcanzado: -1,
    vidaDeLaPista: [],
    avisoDeLaPista: 0,
    inclinacion: [],
    hundido: [],
    rebote: null,
    cine: 'jugando',
    cineAvance: 0,
    pasitos: 0,
    caidas: 0,
    plataformas: [],
    ...cambios,
  }
}

/** Dónde queda el sitio del susto, contando desde el borde por donde entró. */
function puntoDelSusto(ancho: number, lado: LadoDelAsomo) {
  return lado === 1 ? ASOMO.adentro : ancho - ASOMO.adentro
}

/**
 * Las cuatro nubecitas del arranque, siempre las mismas.
 *
 * Van hacia atrás —hacia donde ella venía— porque el polvo se queda
 * donde estaba el pie, no acompaña a quien lo levantó.
 */
const NUBES = [
  { retraso: 0, vida: 500, alto: 5, deriva: 26, subida: 13, radio: 6.5 },
  { retraso: 55, vida: 460, alto: 2, deriva: 17, subida: 8, radio: 5 },
  { retraso: 120, vida: 420, alto: 9, deriva: 36, subida: 17, radio: 4.2 },
  { retraso: 195, vida: 380, alto: 3, deriva: 12, subida: 6, radio: 3.2 },
]

function polvoDeLaHuida(msDesdeElArranque: number, x: number, suelo: number, lado: LadoDelAsomo): Polvo[] {
  const nubes: Polvo[] = []

  for (const n of NUBES) {
    const u = (msDesdeElArranque - n.retraso) / n.vida
    if (u <= 0 || u >= 1) continue
    nubes.push({
      x: x + lado * n.deriva * u,
      y: suelo - n.alto - n.subida * u,
      radio: n.radio * (0.4 + u * 1.5),
      opacidad: 0.42 * (1 - u) * (1 - u),
    })
  }

  return nubes
}

/**
 * Cómo se para en cada tramo.
 *
 * Las poses salen de `poseDe`, que es la del juego, y aquí solo se
 * retocan las cuatro cosas que el juego no tiene por qué saber
 * hacer: quedarse tiesa, mirar hacia afuera de la pantalla y correr
 * con más zancada de la que camina.
 */
function poseDelSusto(escena: EscenaLuna, ms: number): Pose {
  const pose = poseDe(escena)

  pose.ojos = 1
  pose.ceja = 1
  pose.boca = 'abierta'
  // Se echa para atrás, como quien retrocede sin mover los pies.
  pose.inclinacion = -0.2
  pose.cabeza = -0.12
  // Los brazos se le van para arriba y para atrás, de golpe.
  pose.brazo = [-2, -1.7]
  pose.codo = [-0.35, -0.25]
  // El tembleque del respingo, rápido y chiquito.
  pose.temblor = Math.sin(ms * 0.085) * 1.1
  pose.squashY = 1.06
  pose.squashX = 0.95

  return pose
}

function poseDeLaHuida(escena: EscenaLuna): Pose {
  const pose = poseDe(escena)

  // Zancada más larga que la de la caminata: sale huyendo, no
  // paseando. Se estira la pose que ya venía calculada en vez de
  // escribir otra, así el ciclo sigue siendo el mismo y no se le
  // desacompasan los brazos con las piernas.
  pose.muslo = [pose.muslo[0] * 1.25, pose.muslo[1] * 1.25]
  pose.brazo = [pose.brazo[0] * 1.5, pose.brazo[1] * 1.5]
  pose.codo = [0.5, 0.5]
  pose.inclinacion = 0.36
  pose.cabeza = 0.14
  pose.bob *= 1.5
  pose.ojos = 1
  pose.ceja = 1
  pose.boca = 'apretada'

  return pose
}

/**
 * La foto del instante `ms`.
 *
 * `ancho` es el del lienzo, que es el de la página: la tortuga entra
 * pegada a un borde y no le importa lo ancho que sea el resto.
 */
export function fotoDelAsomo(ms: number, ancho: number, lado: LadoDelAsomo): FotoDelAsomo {
  const suelo = ASOMO.alto - ASOMO.piso
  const tope = puntoDelSusto(ancho, lado)

  /* ── Entrando ────────────────────────────────────────────────
     A la velocidad de la caminata del juego, ni más rápido ni más
     lento: es la misma tortuga y hay que reconocerla después. */
  if (ms < T_ALERTA) {
    const avance = (ms / MS_CAMINATA) * (ASOMO.adentro + ASOMO.afuera)
    const x = lado === 1 ? -ASOMO.afuera + avance : ancho + ASOMO.afuera - avance
    const escena = escenaBase({
      x,
      y: suelo,
      mirando: lado,
      caminado: (ASOMO.afuera + avance) / PASITO,
      reloj: ms / 1000,
    })
    return { escena, pose: poseDe(escena), admiracion: null, polvo: [], terminado: false }
  }

  /* ── El susto ────────────────────────────────────────────────
     Tiesa donde quedó, con el «!» saliéndole encima. */
  if (ms < T_BRINCO) {
    const desde = ms - T_ALERTA
    const escena = escenaBase({
      // Un pelo para atrás, que es lo que hace el cuerpo antes de
      // que las piernas se enteren.
      x: tope - lado * 2 * (desde / ASOMO.msAlerta),
      y: suelo,
      mirando: lado,
      caminado: (ASOMO.afuera + ASOMO.adentro) / PASITO,
      reloj: ms / 1000,
    })
    const pose = poseDelSusto(escena, desde)
    return {
      escena,
      pose,
      admiracion: admiracionDe(escena, pose, desde / ASOMO.msAlerta, 1),
      polvo: [],
      terminado: false,
    }
  }

  /* ── El brinco ───────────────────────────────────────────────
     Sube y baja en un arco, y a mitad de vuelo se da la vuelta
     hacia el lado por donde entró. Girar en el aire es lo que
     convierte el susto en una huida: si se diera vuelta en el
     suelo se vería que lo pensó. */
  if (ms < T_HUIDA) {
    const u = (ms - T_BRINCO) / ASOMO.msBrinco
    const escena = escenaBase({
      x: tope - lado * 2,
      y: suelo - Math.sin(u * Math.PI) * ASOMO.alturaDelBrinco,
      // A partir de la mitad ya mira hacia la salida.
      mirando: u < 0.45 ? lado : ((-lado) as LadoDelAsomo),
      enSuelo: false,
      // Sube al principio y cae al final: es lo que le da al dibujo
      // la pose del aire sin tener que inventarle otra.
      vy: -460 * Math.cos(u * Math.PI),
      caminado: (ASOMO.afuera + ASOMO.adentro) / PASITO,
      reloj: ms / 1000,
    })
    const pose = poseDe(escena)
    pose.ceja = 1
    pose.temblor = Math.sin(ms * 0.06) * 0.6
    return {
      escena,
      pose,
      admiracion: admiracionDe(escena, pose, 1, 1),
      polvo: [],
      terminado: false,
    }
  }

  /* ── La huida ────────────────────────────────────────────────
     De vuelta al borde, tres veces más rápido, y el «!» se le cae
     detrás. */
  if (ms < MS_DEL_ASOMO) {
    const desde = ms - T_HUIDA
    const u = desde / ASOMO.msHuida
    // Lo suficiente para salirse del lienzo antes de que se acabe:
    // el final de la animación no se tiene que ver.
    const recorrido = (ASOMO.adentro + ASOMO.afuera + 20) * disparada(u)
    const x = tope - lado * (2 + recorrido)
    const escena = escenaBase({
      x,
      y: suelo,
      mirando: (-lado) as LadoDelAsomo,
      caminado: (ASOMO.afuera + ASOMO.adentro + recorrido * ASOMO.apuro) / PASITO,
      reloj: ms / 1000,
    })
    const pose = poseDeLaHuida(escena)

    /* El «!» no la acompaña: se queda flotando donde ella estaba y se
       apaga en un suspiro. Y tiene que apagarse rápido de verdad —el
       signo es dorado con reborde oscuro, y a media transparencia lo
       único que queda a la vista es el reborde, o sea un palito negro
       colgado del aire. */
    const queda = limitar(1 - u * 9, 0, 1)
    let admiracion = null
    if (queda > 0) {
      const tiesa = escenaBase({ x: tope - lado * 2, y: suelo, mirando: lado })
      admiracion = admiracionDe(tiesa, poseDelSusto(tiesa, ASOMO.msAlerta), 1, queda)
      admiracion.y -= 9 * (1 - queda)
      admiracion.escala *= 0.55 + 0.45 * queda
    }

    return {
      escena,
      pose,
      admiracion,
      polvo: polvoDeLaHuida(desde, tope, suelo, lado),
      terminado: false,
    }
  }

  const escena = escenaBase({ x: tope, y: suelo, mirando: lado })
  return { escena, pose: poseDe(escena), admiracion: null, polvo: [], terminado: true }
}

/**
 * La foto de quien pidió que nada se mueva.
 *
 * Con `prefers-reduced-motion` no hay caminata ni brinco: la tortuga
 * está parada al final de la página, mirando hacia afuera, y se va
 * apareciendo y desapareciendo con la opacidad, que la maneja quien
 * pinta. Sigue siendo el mismo guiño, sin nada que se sacuda.
 */
export function fotoQuieta(ancho: number, lado: LadoDelAsomo): FotoDelAsomo {
  const escena = escenaBase({
    x: puntoDelSusto(ancho, lado),
    y: ASOMO.alto - ASOMO.piso,
    mirando: lado,
    caminado: 0.6,
    // Un reloj fijo: `poseDe` parpadea sola con el tiempo y aquí no
    // se quiere ni eso.
    reloj: 1.2,
  })
  return { escena, pose: poseDe(escena), admiracion: null, polvo: [], terminado: false }
}

/** Dónde y de qué tamaño va el «!», colgado de la cabeza. */
function admiracionDe(escena: EscenaLuna, pose: Pose, salida: number, opacidad: number): Admiracion {
  const cabeza = cabezaDe(escena, pose)
  // Sale de la nada, se pasa de grande y se acomoda: sin ese
  // rebotito parece un icono pegado y no un susto.
  const escala = salida < 1 ? 1.35 * Math.sin((salida * Math.PI) / 2) : 1.05 - 0.05 * Math.min(1, salida)

  return {
    x: cabeza.x + escena.mirando * 5,
    y: cabeza.y - 16,
    escala: Math.max(0.05, escala),
    giro: escena.mirando * 0.18,
    opacidad,
  }
}

/* ── Pintar ──────────────────────────────────────────────────── */

/**
 * Los colores del asomo.
 *
 * El «!» va dorado con reborde oscuro y no del color del tema: los
 * dos modos son nocturnos, el dorado se lee en los dos, y este
 * amarillo es el de las estrellitas de papel del juego. El polvo es
 * el papel de siempre, casi transparente.
 */
const TINTA = {
  admiracion: '#ffd76a',
  bordeAdmiracion: '#2b1d13',
  polvo: 'rgba(232, 224, 205, 1)',
}

function pintarAdmiracion(ctx: CanvasRenderingContext2D, a: Admiracion) {
  ctx.save()
  ctx.globalAlpha = a.opacidad
  ctx.translate(a.x, a.y)
  ctx.rotate(a.giro)
  ctx.scale(a.escala, a.escala)

  // El palito y el punto, primero gordos y oscuros para el reborde y
  // después finos y dorados encima. Es el truco de siempre y sale
  // más limpio que dibujar el contorno aparte.
  for (const [color, grosor, radio] of [
    [TINTA.bordeAdmiracion, 7.4, 3.5],
    [TINTA.admiracion, 4.4, 2.2],
  ] as const) {
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = grosor
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(0, -13)
    ctx.lineTo(0, -5)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, radio, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

/** Pinta la foto sobre un lienzo ya escalado a 1 unidad = 1 píxel. */
export function pintarAsomo(ctx: CanvasRenderingContext2D, foto: FotoDelAsomo) {
  if (foto.terminado) return

  for (const nube of foto.polvo) {
    ctx.save()
    ctx.globalAlpha = nube.opacidad
    ctx.fillStyle = TINTA.polvo
    ctx.beginPath()
    ctx.ellipse(nube.x, nube.y, nube.radio, nube.radio * 0.75, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  dibujarTortuga(ctx, foto.escena, foto.pose)

  if (foto.admiracion) pintarAdmiracion(ctx, foto.admiracion)
}
