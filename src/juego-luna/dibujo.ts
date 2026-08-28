import { LUNA, MUNDO, TORTUGA } from '@/content/luna'
import { dibujarEstrellaDePapel } from '@/juego-luna/estrella'
import {
  dibujarPilaDeCajas,
  dibujarPolvo as dibujarPolvoDelCuarto,
  dibujarTorre,
  sembrarCajas,
  sembrarPolvo,
  sembrarTorres,
} from '@/juego-luna/mundo-cajas'
import { alturaDeLaCaja } from '@/juego-luna/mundos'
import { cabezaDe, dibujarTortuga } from '@/juego-luna/tortuga'
import type { EscenaLuna, Nivel, Plataforma } from '@/types'

/**
 * Pintar el mundo de la luna en un canvas 2D.
 *
 * Todo es vectorial: no hay una sola imagen. Aquí vive lo que es de
 * los tres capítulos —el cielo, la luna, la cámara, la sombra, la
 * barra— y cada mundo trae su material en su propio archivo: la
 * tortuga en `tortuga.ts`, las cajas de Ovi en `mundo-cajas.ts`. La
 * pista de Boo se quedó aquí porque fue la primera y porque es la que
 * enseña el molde.
 *
 * El mundo mide 360 de ancho y lo que mida el capítulo de alto. La
 * cámara decide qué trozo se ve, y aquí solo se dibuja lo que entra
 * en pantalla.
 */

/* Los colores salen de la paleta de la web (ver index.css): la luna
   es el blanco hueso de la margarita y el lazo de los hitos es el
   dorado del tulipán. Están escritos a mano y no leídos del CSS
   porque esto corre sesenta veces por segundo. Los de la tortuga
   viven en `tortuga.ts`. */
const COLOR = {
  cieloArriba: '#0b1026',
  cieloAbajo: '#1b2148',
  estrella: '#f8f4e8',
  luna: '#f8f4e8',
  lunaHalo: 'rgba(248, 244, 232, 0.14)',
  plataforma: '#2a3157',
  plataformaLuz: '#8a93c9',
  hito: '#f5c451',
  hitoApagado: '#6b6a5c',
  barra: '#f5c451',
  barraAviso: '#c33b52',
  barraFondo: 'rgba(11, 16, 38, 0.55)',
  sombra: 'rgba(11, 16, 38, 0.35)',

  /* La estrellita de papel de los puntos de guardado vive en
     `estrella.ts` con sus colores: es la misma en los tres capítulos
     y no es de ningún peluche. Aquí solo se usa su blanco para
     marcar el filo de la plataforma que la lleva. */
  papelDeLaEstrella: '#f8f4e8',


  /* El capítulo de Boo: la pista naranja del arreglo de Hot Wheels y
     el bambú, que es de donde le viene el nombre. La pista de verdad
     es un canal, así que lleva tres naranjas: la pared de adelante,
     su filo iluminado y el hueco en sombra por donde correría el
     carro. */
  pista: '#c2521c',
  pistaLuz: '#f79340',
  pistaFondo: '#9c400f',
  pistaCanal: '#4a1c07',
  pistaSombra: '#7d3210',
  impulso: '#f5c451',
  /* El bambú va en dos verdes según lo lejos que esté la caña, y los
     dos tiran a azul: un verde de día sobre un cielo de noche sale
     sucio, no verde. */
  bambuLejos: '#1e3a2c',
  bambuCerca: '#2f5741',
  bambuNudo: '#4a7a5a',
  bambuHoja: '#2b5039',
  /* Las cañas que sostienen la pista van más apagadas que las del
     fondo: están detrás del tramo y en su sombra, y con el mismo
     verde competían con la pista por la mirada. */
  bambuSoporte: '#25422e',
  bambuSoporteNudo: '#3c6444',
}

/** Cuánto dura el fogonazo del despegue, en milisegundos. */
const MS_FOGONAZO = 160

/** Cuánto dura el golpe de cámara al aterrizar. */
const MS_GOLPE = 130

export interface Pintor {
  /** Vuelve a medir el canvas. Se llama al montar y al cambiar la ventana. */
  medir: (anchoCss: number, altoCss: number) => void
  pintar: (escena: EscenaLuna) => void
  /** Cuánto alto del mundo entra en pantalla. Lo necesita la cámara. */
  altoDeLaVista: () => number
  /** Sin movimiento de más: se apagan el parallax, el polvo y el golpe. */
  movimientoReducido: boolean
}

/**
 * Estrellas fijas, sembradas una sola vez con una cuenta y no con
 * `Math.random`: así el cielo es el mismo en cada partida y no
 * parpadea de un frame a otro. Se siembran por todo el alto del
 * capítulo y un poco más.
 */
function sembrarEstrellas(cantidad: number, desde: number, hasta: number) {
  const estrellas: { x: number; y: number; r: number; brillo: number }[] = []
  let semilla = 20260824
  const siguiente = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }
  for (let i = 0; i < cantidad; i += 1) {
    estrellas.push({
      x: siguiente() * MUNDO.ancho,
      y: desde + siguiente() * (hasta - desde),
      r: 0.5 + siguiente() * 1.1,
      brillo: 0.25 + siguiente() * 0.55,
    })
  }
  return estrellas
}

/**
 * Las matas de bambú del capítulo de Boo, sembradas de una vez con la
 * misma cuenta que las estrellas: el bambú no puede cambiar de sitio
 * entre un frame y el siguiente.
 *
 * Van pegadas a los dos bordes y **de punta a punta del capítulo**, de
 * más abajo del suelo hasta más arriba de la cima. Una caña que
 * empieza y termina a la vista parece un palo colgado del aire: estas
 * entran y salen de la pantalla, como un bambusal de verdad.
 */
function sembrarBambu(desde: number, hasta: number) {
  const matas: {
    x: number
    desde: number
    hasta: number
    canas: {
      dx: number
      grosor: number
      inclinacion: number
      /** 0 es la de más atrás y 1 la de más adelante. */
      profundidad: number
      /** Solo la de adelante lleva hojas, y espaciadas. */
      conHojas: boolean
    }[]
  }[] = []
  let semilla = 20241223
  const siguiente = () => {
    semilla = (semilla * 1103515245 + 12345) % 2147483648
    return semilla / 2147483648
  }

  // Una mata por lado y tres cañas por mata. Con más se hacía una
  // mancha verde: lo que se veía no era bambú, era ruido.
  for (const orilla of [0, 1]) {
    // Hacia el medio de la pantalla. La mata de la derecha es la de
    // la izquierda en espejo: sin esto, en la derecha la caña nítida
    // quedaba pegada al borde y las apagadas hacia adentro, o sea al
    // revés de la de la izquierda y al revés de como se lee una mata.
    const haciaAdentro = orilla === 0 ? 1 : -1

    const canas = []
    for (let c = 0; c < 3; c += 1) {
      // La de más adelante es la más nítida, y va más adentro.
      const profundidad = c / 2
      canas.push({
        dx: ((c - 1) * 9 + (siguiente() - 0.5) * 6) * haciaAdentro,
        grosor: 4 + profundidad * 3.5,
        inclinacion: (siguiente() - 0.5) * 22 * haciaAdentro,
        profundidad,
        conHojas: c === 2,
      })
    }
    matas.push({
      x: orilla === 0 ? 14 : MUNDO.ancho - 14,
      desde: desde - siguiente() * 200,
      hasta: hasta + siguiente() * 200,
      canas,
    })
  }
  return matas
}

/**
 * En qué tramos hay un carrito parqueado y de qué color. Cada tres o
 * cuatro, y nunca en los de impulso ni en los de estrella, que ya
 * tienen algo encima.
 */
const COLORES_DE_CARRO = ['#c9455a', '#3f7fc4', '#e0a63a', '#5aa86a', '#8a6bc4']

function sembrarCarritos(nivel: Nivel) {
  const colores = COLORES_DE_CARRO
  const donde = new Map<number, { x: number; color: string }>()
  for (const p of nivel.plataformas) {
    if (p.hito || p.impulso || p.indice === 0) continue
    if (p.indice % 3 !== 1) continue
    donde.set(p.indice, {
      // Parqueado hacia una punta, no en el medio, que es donde
      // aterriza la tortuga.
      x: p.indice % 2 === 0 ? p.x + 18 : p.x + p.ancho - 18,
      color: colores[p.indice % colores.length],
    })
  }
  return donde
}

/**
 * Las vías del fondo: tramos larguísimos de pista que cruzan el mundo
 * de lado a lado, ondulando, con carros corriendo por ellos.
 *
 * Reemplazan a unos loopings sueltos que no se leían: eran aros
 * flotando, sin principio ni final, y no decían nada. Una vía que
 * entra por un borde y sale por el otro, con algo pasando encima, sí
 * cuenta que el mundo es una pista de carreras enorme y que la subida
 * es solo un rincón de ella.
 *
 * Van muy apagadas a propósito: el fondo tiene que estar vivo sin
 * pelearse con las plataformas, que son lo que hay que mirar.
 */
function sembrarVias(desde: number, hasta: number) {
  const vias: {
    y: number
    amplitud: number
    fase: number
    /** Vueltas por segundo del recorrido de un carro. */
    velocidad: number
    hacia: 1 | -1
    carros: { salida: number; color: string }[]
  }[] = []

  let semilla = 20250829
  const siguiente = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }

  const cuantas = Math.max(2, Math.round((hasta - desde) / 620))
  for (let i = 0; i < cuantas; i += 1) {
    const carros = []
    for (let c = 0; c < 1 + Math.floor(siguiente() * 2); c += 1) {
      carros.push({
        salida: siguiente(),
        color: COLORES_DE_CARRO[Math.floor(siguiente() * COLORES_DE_CARRO.length)],
      })
    }
    vias.push({
      y: hasta - ((i + 0.5) / cuantas) * (hasta - desde),
      amplitud: 30 + siguiente() * 44,
      fase: siguiente() * Math.PI * 2,
      velocidad: 0.045 + siguiente() * 0.045,
      hacia: siguiente() < 0.5 ? 1 : -1,
      carros,
    })
  }
  return vias
}

export function crearPintor(canvas: HTMLCanvasElement, nivel: Nivel): Pintor {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('sin canvas 2d')

  /** Donde espera la luna: justo arriba de la última plataforma. */
  const dondeEspera = {
    x: nivel.cima.x + nivel.cima.ancho / 2,
    y: nivel.cima.y - LUNA.sobreLaCima,
  }

  // Las estrellas se siembran en un sitio fijo del mundo y se dibujan
  // corridas: eso es lo que da la sensación de altura.
  const estrellas = sembrarEstrellas(150, nivel.cima.y - 400, nivel.suelo + 250)

  // El decorado del capítulo. Cada mundo siembra el suyo y los demás
  // se quedan vacíos, que no cuesta nada y evita un `if` por frame.
  const esDePista = nivel.material === 'pista'
  const esDeCajas = nivel.material === 'cajas'

  const matas = esDePista ? sembrarBambu(nivel.cima.y - 200, nivel.suelo + 200) : []
  const vias = esDePista ? sembrarVias(nivel.cima.y, nivel.suelo) : []
  const carritos = esDePista ? sembrarCarritos(nivel) : new Map()

  const torres = esDeCajas ? sembrarTorres(nivel.cima.y - 260, nivel.suelo + 260) : []
  const polvo = esDeCajas ? sembrarPolvo(60) : []
  const cajas = esDeCajas ? sembrarCajas(nivel) : new Map()

  let anchoCss = 0
  let altoCss = 0
  let escala = 1
  let margen = 0

  /** Dónde despegó la última vez, para dejar ahí el fogonazo. */
  let despegue = { x: 0, y: 0 }
  let ultimoDesdeSalto = 99999

  const pintor: Pintor = {
    movimientoReducido: false,

    altoDeLaVista: () => (escala > 0 ? altoCss / escala : MUNDO.alto),

    medir(ancho: number, alto: number) {
      anchoCss = ancho
      altoCss = alto

      // El canvas se dibuja en píxeles de verdad y se muestra en
      // píxeles CSS. Sin esto, en el teléfono se ve borroso. El tope
      // de 3 es por los aparatos de pantalla muy densa: más allá de
      // ahí no se nota y sí se siente en el rendimiento.
      const densidad = Math.min(window.devicePixelRatio || 1, 3)
      canvas.width = Math.round(ancho * densidad)
      canvas.height = Math.round(alto * densidad)
      canvas.style.width = `${ancho}px`
      canvas.style.height = `${alto}px`

      // El mundo tiene que verse entero de ancho: escalando solo por
      // el alto, en un teléfono largo se salía por los costados y una
      // plataforma pegada al borde quedaba fuera de la pantalla.
      escala = Math.min(alto / MUNDO.alto, ancho / MUNDO.ancho)
      margen = (ancho - MUNDO.ancho * escala) / 2
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0)
    },

    pintar(escena: EscenaLuna) {
      if (!anchoCss || !altoCss) return

      const densidad = Math.min(window.devicePixelRatio || 1, 3)
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0)

      // El cielo llena todo el ancho, aunque el mundo quede centrado.
      const cielo = ctx.createLinearGradient(0, 0, 0, altoCss)
      cielo.addColorStop(0, COLOR.cieloArriba)
      cielo.addColorStop(1, COLOR.cieloAbajo)
      ctx.fillStyle = cielo
      ctx.fillRect(0, 0, anchoCss, altoCss)

      // El golpe de cámara del aterrizaje: la pantalla acusa el
      // porrazo y vuelve. Es corto a propósito.
      let golpe = 0
      if (!pintor.movimientoReducido && escena.desdeAterrizaje < MS_GOLPE) {
        const resto = 1 - escena.desdeAterrizaje / MS_GOLPE
        golpe = Math.sin(resto * Math.PI * 2) * 3 * resto
      }

      const altoVista = pintor.altoDeLaVista()

      // Las estrellas van en su propia capa, corridas más despacio que
      // el mundo: eso hace sentir que se sube de verdad, en vez de que
      // las plataformas bajen. Con «menos movimiento» viajan pegadas
      // al mundo y no hay parallax.
      const arrastre = pintor.movimientoReducido ? 1 : 0.45
      ctx.save()
      ctx.translate(margen, -escena.camara * arrastre * escala + golpe)
      ctx.scale(escala, escala)
      dibujarEstrellas(ctx, estrellas, escena.camara * arrastre, altoVista)
      ctx.restore()

      // La luna en la cinemática de entrada va pegada a la pantalla,
      // porque el capítulo todavía no empezó y lo único que hay que
      // mirar es a ella. Después se va para arriba y no vuelve hasta
      // el final, que es donde está esperando de verdad.
      if (escena.cine === 'entrada') {
        ctx.save()
        ctx.translate(margen, golpe)
        ctx.scale(escala, escala)
        dibujarLunaEntrando(ctx, escena.cineAvance, altoVista, pintor.movimientoReducido)
        ctx.restore()
      }

      ctx.save()
      ctx.translate(margen, -escena.camara * escala + golpe)
      ctx.scale(escala, escala)

      const arriba = escena.camara - 40
      const abajo = escena.camara + altoVista + 40

      // La luna esperando arriba del último tramo. Solo aparece
      // cuando la cámara llega, que es todo el punto: sale en la
      // cinemática, se va, y no se la vuelve a ver hasta que se la
      // alcanza.
      if (escena.cine !== 'entrada') {
        dibujarLunaEsperando(ctx, dondeEspera, escena)
      }

      // El decorado va detrás de la pista y no se toca: es lo que
      // dice de qué mundo estamos hablando cuando la pista ya se
      // borró y no queda nada.
      for (const v of vias) {
        if (v.y + v.amplitud < arriba || v.y - v.amplitud > abajo) continue
        dibujarVia(ctx, v, escena.reloj)
      }
      for (const m of matas) {
        if (m.desde > abajo || m.hasta < arriba) continue
        dibujarMata(ctx, m, arriba, abajo)
      }

      // Y el del capítulo de Ovi: las torres apiladas contra las dos
      // paredes del cuarto, y el polvo flotando en la luz de la luna.
      for (const t of torres) dibujarTorre(ctx, t, arriba, abajo)
      if (esDeCajas && !pintor.movimientoReducido) {
        dibujarPolvoDelCuarto(ctx, polvo, arriba, abajo, escena.reloj)
      }

      for (const p of escena.plataformas) {
        if (p.y < arriba || p.y > abajo) continue

        // Lo que le queda a este tramo antes de borrarse. En los
        // capítulos sin desvanecimiento son todos 1 y no pasa nada.
        const vida = escena.vidaDeLaPista[p.indice] ?? 1
        if (vida <= 0) continue

        // El alfa viaja como parámetro además de como estado del
        // canvas. Dejándolo solo en globalAlpha, cualquier función de
        // adentro que lo tocara se lo llevaba puesto, y pasó: de un
        // tramo que se estaba yendo solo parpadeaba la primera caña
        // del soporte, que era lo único dibujado antes del pisotón.
        const alfa = opacidadDeLaPista(vida, escena.avisoDeLaPista, pintor.movimientoReducido)

        ctx.save()
        ctx.globalAlpha = alfa

        const caja = cajas.get(p.indice)
        if (esDePista) {
          dibujarPistaNaranja(ctx, p, escena.hitoAlcanzado, escena.reloj, alfa)
        } else if (caja) {
          dibujarPilaDeCajas(
            ctx,
            p,
            caja,
            escena.inclinacion[p.indice] ?? 0,
            escena.hitoAlcanzado,
            escena.reloj,
            alfa,
          )
        } else {
          dibujarPlataforma(ctx, p, escena.hitoAlcanzado, escena.reloj)
        }

        const carrito = carritos.get(p.indice)
        if (carrito) dibujarCarrito(ctx, carrito.x, p.y, carrito.color)
        ctx.restore()
      }

      // Se dibuja siempre que entre en pantalla, cayéndose incluida:
      // la caída se ve entera hasta que sale por abajo. Desaparecer en
      // pleno aire parecería un error del juego.
      if (escena.y < escena.camara + altoVista + 60) {
        dibujarSombra(ctx, escena)
        dibujarTortuga(ctx, escena)
        if (escena.cargando) dibujarBarra(ctx, escena)
        if (escena.cansancio > 0) dibujarEstrellitas(ctx, escena)
      }

      // El fogonazo se queda donde despegó, no donde va la tortuga.
      if (escena.desdeSalto < ultimoDesdeSalto) despegue = { x: escena.x, y: escena.y }
      ultimoDesdeSalto = escena.desdeSalto

      if (escena.desdeSalto < MS_FOGONAZO) {
        dibujarFogonazo(ctx, despegue, escena.desdeSalto)
        if (!pintor.movimientoReducido) dibujarPolvo(ctx, despegue, escena.desdeSalto)
      }

      ctx.restore()
    },
  }

  return pintor
}

function dibujarEstrellas(
  ctx: CanvasRenderingContext2D,
  estrellas: ReturnType<typeof sembrarEstrellas>,
  camara: number,
  altoVista: number,
) {
  ctx.fillStyle = COLOR.estrella
  for (const e of estrellas) {
    if (e.y < camara - 20 || e.y > camara + altoVista + 20) continue
    ctx.globalAlpha = e.brillo
    ctx.beginPath()
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/**
 * La cinemática de entrada: la luna llena y grande, respirando en el
 * medio de la pantalla, y después subiendo hasta salirse por arriba.
 *
 * Es la presentación del capítulo: sin esto, la tortuga empieza a
 * saltar y nadie sabe hacia dónde ni por qué. Con esto, se entiende de
 * una que estamos yendo detrás de ella.
 */
function dibujarLunaEntrando(
  ctx: CanvasRenderingContext2D,
  avance: number,
  altoVista: number,
  movimientoReducido: boolean,
) {
  /** Los primeros dos quintos se queda, y el resto se va subiendo. */
  const seQueda = Math.min(1, avance / 0.4)
  const seVa = Math.max(0, (avance - 0.4) / 0.6)

  // La subida arranca despacio y termina rápida, como algo que se
  // aleja de verdad.
  const empuje = seVa * seVa * seVa
  const centro = altoVista * 0.42
  const respiro = movimientoReducido ? 0 : Math.sin(seQueda * Math.PI * 2) * 4

  const y = centro + respiro - empuje * (centro + LUNA.radio * 4.4)
  const r = LUNA.radio * (1.5 - 0.5 * seVa)

  // Entra con un halo que se abre: es el «acá estoy» antes de irse.
  ctx.save()
  ctx.globalAlpha = Math.min(1, seQueda * 2) * (1 - seVa * 0.25)
  dibujarLuna(ctx, { x: MUNDO.ancho / 2, y, r })
  ctx.restore()
}

/**
 * La luna esperando arriba del último tramo, y yéndose otra vez cuando
 * la alcanza. Vive en el mundo, así que se acerca sola conforme sube.
 */
function dibujarLunaEsperando(
  ctx: CanvasRenderingContext2D,
  donde: { x: number; y: number },
  escena: EscenaLuna,
) {
  const yendose = escena.cine === 'salida' || escena.cine === 'fin'
  const seVa = yendose ? escena.cineAvance : 0
  const empuje = seVa * seVa * seVa

  // Quieta late apenas, para que se note que está viva y que es a
  // donde hay que llegar.
  const latido = 1 + Math.sin(escena.reloj * 1.3) * 0.02

  ctx.save()
  ctx.globalAlpha = 1 - seVa * 0.9
  dibujarLuna(ctx, {
    x: donde.x,
    y: donde.y - empuje * 620,
    r: LUNA.radio * latido * (1 - seVa * 0.35),
  })
  ctx.restore()
}

/** La luna, dibujada. Es a donde se va. */
function dibujarLuna(ctx: CanvasRenderingContext2D, luna: { x: number; y: number; r: number }) {
  const halo = ctx.createRadialGradient(luna.x, luna.y, luna.r * 0.6, luna.x, luna.y, luna.r * 3.4)
  halo.addColorStop(0, COLOR.lunaHalo)
  halo.addColorStop(1, 'rgba(248, 244, 232, 0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(luna.x, luna.y, luna.r * 3.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLOR.luna
  ctx.beginPath()
  ctx.arc(luna.x, luna.y, luna.r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(180, 176, 166, 0.5)'
  for (const c of [
    { x: -0.3, y: -0.24, r: 0.19 },
    { x: 0.24, y: 0.16, r: 0.27 },
    { x: 0.38, y: -0.38, r: 0.12 },
  ]) {
    ctx.beginPath()
    ctx.arc(luna.x + c.x * luna.r, luna.y + c.y * luna.r, c.r * luna.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function dibujarPlataforma(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  hitoAlcanzado: number,
  reloj: number,
) {
  const alto = 16
  ctx.fillStyle = COLOR.plataforma
  ctx.beginPath()
  ctx.roundRect(p.x, p.y, p.ancho, alto, 6)
  ctx.fill()

  // La línea de arriba es la que se pisa: se marca clara para que no
  // haya duda de dónde está el suelo.
  ctx.strokeStyle = p.hito ? COLOR.papelDeLaEstrella : COLOR.plataformaLuz
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(p.x + 2, p.y + 1)
  ctx.lineTo(p.x + p.ancho - 2, p.y + 1)
  ctx.stroke()

  if (p.hito) dibujarEstrellaDePapel(ctx, p, hitoAlcanzado >= p.indice, reloj)
}

/* ── El capítulo de Boo ──────────────────────────────────────────── */

/**
 * Lo transparente que va un tramo según lo que le queda de vida.
 *
 * Se mantiene entero hasta que entra en el aviso, y ahí parpadea cada
 * vez más rápido mientras se va. El parpadeo es lo que avisa: un suelo
 * que desaparece sin decir nada no es una traba, es una trampa. Con
 * «menos movimiento» no parpadea y solo se apaga.
 */
/** Cuántas veces parpadea un tramo antes de irse. */
const PARPADEOS = 9

export function opacidadDeLaPista(vida: number, aviso: number, movimientoReducido: boolean) {
  if (vida >= aviso) return 1

  /** 1 recién entrado en el aviso, 0 justo antes de desaparecer. */
  const resto = vida / aviso

  // Con «menos movimiento» no parpadea: se apaga y ya.
  if (movimientoReducido) return resto

  // El parpadeo sale de la vida del tramo y no del reloj. Con el
  // reloj, acelerar la frecuencia salta de fase y sale un temblor
  // sucio; con la vida, la fase va sola de menos a más y acelera
  // parejo. Al cuadrado es lo que lo hace apurarse hacia el final.
  const fase = (1 - resto) * (1 - resto) * PARPADEOS
  const encendido = Math.sin(fase * Math.PI * 2) > 0

  // Y el último trocito se apaga entero, para que el tramo no se
  // esfume de golpe desde media opacidad.
  const salida = Math.min(1, resto / 0.14)

  return (encendido ? 1 : 0.1) * salida
}

/**
 * Un tramo de pista naranja de Hot Wheels.
 *
 * La pista de verdad es un canal: un piso plano por donde corre el
 * carro y dos paredes levantadas a los lados. De perfil se ven las
 * dos, la de atrás asomando por encima del canal y la de adelante
 * tapándolo, y es esa doble línea lo que la hace leerse como pista y
 * no como una tabla. Encima van las costillas del refuerzo y en las
 * puntas las lengüetas con las que se enganchan los tramos.
 *
 * Se sostiene en cañas de bambú que bajan y se pierden en lo oscuro,
 * que es el otro material del capítulo.
 */
function dibujarPistaNaranja(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  hitoAlcanzado: number,
  reloj: number,
  alfa: number,
) {
  const alto = 15
  const izq = p.x
  const der = p.x + p.ancho

  dibujarSoportesDeBambu(ctx, p, alto, alfa)

  // La pared de atrás, que asoma por encima del canal.
  ctx.fillStyle = COLOR.pistaFondo
  ctx.beginPath()
  ctx.roundRect(izq + 2, p.y - 4, p.ancho - 4, 7, 2)
  ctx.fill()

  // El canal, en sombra: es el hueco por donde correría el carro.
  ctx.fillStyle = COLOR.pistaCanal
  ctx.fillRect(izq + 3, p.y - 1, p.ancho - 6, 4)

  // La pared de adelante, que es la que ocupa casi todo.
  ctx.fillStyle = COLOR.pista
  ctx.beginPath()
  ctx.roundRect(izq, p.y + 1, p.ancho, alto - 1, 3)
  ctx.fill()

  // El filo de arriba de esa pared: la línea que se pisa. Va clara
  // para que no haya duda de dónde está el suelo.
  ctx.fillStyle = COLOR.pistaLuz
  ctx.beginPath()
  ctx.roundRect(izq, p.y + 1, p.ancho, 2.5, 1.5)
  ctx.fill()

  // Las costillas del refuerzo, por debajo.
  ctx.fillStyle = COLOR.pistaSombra
  for (let x = izq + 7; x < der - 5; x += 12) {
    ctx.fillRect(x, p.y + alto - 5, 6, 3.5)
  }
  ctx.fillRect(izq, p.y + alto - 1.5, p.ancho, 1.5)

  // Las lengüetas de enganche de las puntas, que es el detalle que
  // termina de decir «esto es un tramo de pista de juguete».
  ctx.fillStyle = COLOR.pista
  ctx.fillRect(izq - 3, p.y + 4, 3, 6)
  ctx.fillRect(der, p.y + 4, 3, 6)

  if (p.impulso) dibujarGalones(ctx, p, reloj, alfa)
  if (p.hito) dibujarEstrellaDePapel(ctx, p, hitoAlcanzado >= p.indice, reloj)
}

/**
 * Las cañas que sostienen un tramo. Bajan y se van apagando en lo
 * oscuro en vez de terminar en el aire, que es lo que hacía que la
 * pista pareciera flotar.
 */
function dibujarSoportesDeBambu(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  alto: number,
  alfa: number,
) {
  // Cortos y discretos. Colgando setenta píxeles parecían raíces y se
  // llevaban la mirada, que tiene que estar en la pista.
  const largo = 34
  const arriba = p.y + alto - 2

  ctx.save()

  for (const donde of [0.28, 0.72]) {
    const x = p.x + p.ancho * donde
    const desvanecido = ctx.createLinearGradient(0, arriba, 0, arriba + largo)
    desvanecido.addColorStop(0, COLOR.bambuSoporte)
    desvanecido.addColorStop(0.4, COLOR.bambuSoporte)
    desvanecido.addColorStop(1, 'rgba(37, 66, 46, 0)')

    ctx.globalAlpha = alfa * 0.85
    ctx.fillStyle = desvanecido
    ctx.fillRect(x - 2.2, arriba, 4.4, largo)

    // Un nudo, uno solo: en treinta píxeles más de uno es ruido.
    ctx.globalAlpha = alfa * 0.5
    ctx.fillStyle = COLOR.bambuSoporteNudo
    ctx.fillRect(x - 2.9, arriba + 13, 5.8, 1.8)

    // La abrazadera con la que la caña agarra la pista.
    ctx.globalAlpha = alfa
    ctx.fillStyle = COLOR.pistaSombra
    ctx.fillRect(x - 3.8, arriba - 2, 7.6, 2.5)
  }

  ctx.restore()
}

/**
 * Los galones de un tramo de impulso, corriendo hacia el lado que
 * lanza. Se mueven solos: quieta, la flecha no dice que empuja.
 */
function dibujarGalones(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  reloj: number,
  alfa: number,
) {
  const hacia = p.impulso ?? 1
  const paso = 16
  const corrida = (reloj * 46) % paso
  const medio = p.y + 8.5

  ctx.save()
  ctx.strokeStyle = COLOR.impulso
  ctx.lineWidth = 2.4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 0; i * paso < p.ancho - 10; i += 1) {
    const avance = i * paso + corrida
    const x = hacia > 0 ? p.x + 5 + avance : p.x + p.ancho - 5 - avance
    if (x < p.x + 4 || x > p.x + p.ancho - 4) continue

    // Los de los extremos entran y salen apagándose, para que no
    // aparezcan de la nada en la orilla del tramo.
    const alOrilla = Math.min(x - p.x, p.x + p.ancho - x) / 18
    ctx.globalAlpha = alfa * Math.min(1, alOrilla) * 0.9

    ctx.beginPath()
    ctx.moveTo(x - 4 * hacia, medio - 4)
    ctx.lineTo(x, medio)
    ctx.lineTo(x - 4 * hacia, medio + 4)
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * Un carrito parqueado de adorno, del arreglo del que salió Boo.
 *
 * No hace nada y no estorba: está para que el mundo se parezca a una
 * pista de Hot Wheels de verdad y no a unas barras naranjas.
 */
function dibujarCarrito(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const largo = 22
  const izq = x - largo / 2

  ctx.save()

  // La carrocería, con el morro más bajo que la cola.
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(izq, y - 3)
  ctx.lineTo(izq + 4, y - 7)
  ctx.lineTo(izq + 13, y - 8)
  ctx.lineTo(izq + largo, y - 4)
  ctx.lineTo(izq + largo, y)
  ctx.lineTo(izq, y)
  ctx.closePath()
  ctx.fill()

  // El parabrisas.
  ctx.fillStyle = 'rgba(220, 235, 255, 0.75)'
  ctx.beginPath()
  ctx.moveTo(izq + 5.5, y - 6.6)
  ctx.lineTo(izq + 12, y - 7.4)
  ctx.lineTo(izq + 12, y - 4)
  ctx.lineTo(izq + 5, y - 4)
  ctx.closePath()
  ctx.fill()

  // Las ruedas.
  ctx.fillStyle = '#171a24'
  for (const rx of [izq + 5.5, izq + largo - 5.5]) {
    ctx.beginPath()
    ctx.arc(rx, y - 0.4, 3.2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#c9c9c9'
  for (const rx of [izq + 5.5, izq + largo - 5.5]) {
    ctx.beginPath()
    ctx.arc(rx, y - 0.4, 1.3, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Una mata de bambú: varias cañas saliendo de la misma base, de
 * distinto alto y grosor.
 *
 * Van de punta a punta del capítulo, de abajo del todo hasta arriba,
 * y por eso no se ve dónde empiezan ni dónde acaban: un bambú con las
 * dos puntas a la vista parece un palo flotando.
 */
function dibujarMata(
  ctx: CanvasRenderingContext2D,
  mata: {
    x: number
    desde: number
    hasta: number
    canas: {
      dx: number
      grosor: number
      inclinacion: number
      profundidad: number
      conHojas: boolean
    }[]
  },
  arriba: number,
  abajo: number,
) {
  ctx.save()

  for (const cana of mata.canas) {
    const base = mata.x + cana.dx
    const punta = base + cana.inclinacion

    // Lo lejos que está decide el color, el grosor y lo que se ve.
    // Sin eso, tres cañas encimadas son una sola mancha.
    ctx.globalAlpha = 0.26 + cana.profundidad * 0.24
    const claro = cana.profundidad > 0.5 ? COLOR.bambuCerca : COLOR.bambuLejos

    // Un degradado de lado a lado convierte el palo plano en un
    // cilindro. Es lo que más hace, y cuesta una línea.
    const vuelta = ctx.createLinearGradient(base - cana.grosor, 0, base + cana.grosor, 0)
    vuelta.addColorStop(0, COLOR.bambuLejos)
    vuelta.addColorStop(0.38, claro)
    vuelta.addColorStop(1, COLOR.bambuLejos)

    ctx.fillStyle = vuelta
    ctx.beginPath()
    ctx.moveTo(base - cana.grosor / 2, mata.hasta)
    ctx.lineTo(base + cana.grosor / 2, mata.hasta)
    ctx.lineTo(punta + cana.grosor * 0.34, mata.desde)
    ctx.lineTo(punta - cana.grosor * 0.34, mata.desde)
    ctx.closePath()
    ctx.fill()

    // Los nudos y las hojas, solo en el trozo que se ve.
    const paso = 58
    const primero = Math.ceil((arriba - mata.desde) / paso) * paso + mata.desde
    for (
      let y = Math.max(mata.desde, primero - paso);
      y < Math.min(mata.hasta, abajo + paso);
      y += paso
    ) {
      const t = (y - mata.desde) / (mata.hasta - mata.desde)
      const x = punta + (base - punta) * t
      const grosor = cana.grosor * (0.34 + 0.66 * t)

      ctx.fillStyle = COLOR.bambuNudo
      ctx.globalAlpha = (0.26 + cana.profundidad * 0.24) * 0.8
      ctx.fillRect(x - grosor / 2, y, grosor, 1.8)
      ctx.globalAlpha = 0.26 + cana.profundidad * 0.24

      // Una hoja cada tres nudos y solo en la caña de adelante. El
      // bambú de verdad tiene las hojas arriba, no por todo el tallo.
      if (!cana.conHojas || Math.round(y / paso) % 3 !== 0) continue

      // Salen hacia el medio del mundo, nunca hacia afuera: hacia
      // afuera se van de la pantalla y no se ven.
      const hacia = mata.x < MUNDO.ancho / 2 ? 1 : -1
      ctx.fillStyle = COLOR.bambuHoja
      for (const [largo, caida] of [
        [19, -8],
        [13, 4],
      ] as const) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.quadraticCurveTo(x + hacia * largo * 0.6, y + caida - 4, x + hacia * largo, y + caida)
        ctx.quadraticCurveTo(x + hacia * largo * 0.55, y + caida + 2.5, x, y + 2.5)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  ctx.restore()
}
/**
 * Una vía del fondo, con lo que pase por ella en este momento.
 *
 * La forma es una onda, así que dónde está un carro y hacia dónde
 * apunta salen de una cuenta y no de un estado guardado: el fondo no
 * tiene memoria y se dibuja igual aunque la pestaña haya estado
 * dormida media hora.
 */
function dibujarVia(
  ctx: CanvasRenderingContext2D,
  via: {
    y: number
    amplitud: number
    fase: number
    velocidad: number
    hacia: 1 | -1
    carros: { salida: number; color: string }[]
  },
  reloj: number,
) {
  /** El recorrido va de -0,1 a 1,1 para que entre y salga de cuadro. */
  const enLaVia = (u: number) => ({
    x: u * MUNDO.ancho,
    y: via.y + Math.sin(u * Math.PI * 2 + via.fase) * via.amplitud,
  })

  ctx.save()
  ctx.lineCap = 'round'
  ctx.strokeStyle = COLOR.pistaLuz

  // Los travesaños, primero, que van por debajo de los rieles.
  ctx.globalAlpha = 0.06
  ctx.lineWidth = 1.4
  for (let i = 0; i <= 40; i += 1) {
    const p = enLaVia(-0.1 + (i / 40) * 1.2)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y - 5)
    ctx.lineTo(p.x, p.y + 5)
    ctx.stroke()
  }

  // Los dos rieles.
  ctx.globalAlpha = 0.14
  ctx.lineWidth = 2.6
  for (const lado of [-5, 5]) {
    ctx.beginPath()
    for (let i = 0; i <= 60; i += 1) {
      const p = enLaVia(-0.1 + (i / 60) * 1.2)
      if (i === 0) ctx.moveTo(p.x, p.y + lado)
      else ctx.lineTo(p.x, p.y + lado)
    }
    ctx.stroke()
  }

  // Y los carros corriendo por ella, inclinados según la pendiente.
  for (const carro of via.carros) {
    const vuelta = (reloj * via.velocidad + carro.salida) % 1
    const u = via.hacia > 0 ? -0.1 + vuelta * 1.2 : 1.1 - vuelta * 1.2
    const aqui = enLaVia(u)
    const ahi = enLaVia(u + 0.01 * via.hacia)

    ctx.save()
    ctx.globalAlpha = 0.3
    ctx.translate(aqui.x, aqui.y - 1)
    ctx.rotate(Math.atan2(ahi.y - aqui.y, (ahi.x - aqui.x) * via.hacia))
    if (via.hacia < 0) ctx.scale(-1, 1)
    dibujarCarrito(ctx, 0, 0, carro.color)
    ctx.restore()
  }

  ctx.restore()
}
/**
 * La sombra dice dónde va a caer. Es media ayuda del juego.
 *
 * Se pone sobre la superficie de verdad y no sobre la `y` de la
 * plataforma: en el capítulo de Ovi la caja está inclinada, y una
 * sombra pegada a la línea de en medio queda flotando encima de la
 * punta que subió.
 */
function dibujarSombra(ctx: CanvasRenderingContext2D, escena: EscenaLuna) {
  const superficieDe = (p: Plataforma) =>
    alturaDeLaCaja(p, escena.x, escena.inclinacion[p.indice] ?? 0)

  const debajo = escena.plataformas
    .filter(
      (p) =>
        (escena.vidaDeLaPista[p.indice] ?? 1) > 0 &&
        escena.x >= p.x - 4 &&
        escena.x <= p.x + p.ancho + 4 &&
        superficieDe(p) >= escena.y - 1,
    )
    .sort((a, b) => superficieDe(a) - superficieDe(b))[0]
  if (!debajo) return

  const suelo = superficieDe(debajo)
  const caida = suelo - escena.y
  const cerca = Math.max(0, 1 - caida / 320)
  ctx.globalAlpha = 0.15 + cerca * 0.3
  ctx.fillStyle = COLOR.sombra
  ctx.beginPath()
  ctx.ellipse(escena.x, suelo + 2, 10 * (0.5 + cerca * 0.5), 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

/**
 * La barra de fuerza, pegada a ella y no en una esquina de la
 * pantalla: lo que hay que mirar es la tortuga.
 */
function dibujarBarra(ctx: CanvasRenderingContext2D, escena: EscenaLuna) {
  const ancho = 42
  const alto = 5
  const x = escena.x - ancho / 2
  // Baja con ella mientras se agacha, o queda flotando en el aire.
  const y = escena.y - TORTUGA.alto - 10 + escena.carga * 7

  ctx.fillStyle = COLOR.barraFondo
  ctx.beginPath()
  ctx.roundRect(x - 1, y - 1, ancho + 2, alto + 2, 4)
  ctx.fill()

  // Cuando se está pasando de tiempo, la barra se pone roja y
  // parpadea. El desmayo tiene que verse venir.
  const parpadeo = escena.agobio > 0 ? 0.5 + 0.5 * Math.sin(escena.reloj * 34) : 0
  ctx.fillStyle = escena.agobio > 0 && parpadeo > 0.45 ? COLOR.barraAviso : COLOR.barra
  ctx.beginPath()
  ctx.roundRect(x, y, Math.max(2, ancho * escena.carga), alto, 3)
  ctx.fill()
}

/**
 * Las estrellitas del mareo, dando vueltas sobre la cabeza. Es el
 * chiste que compensa haber perdido el salto.
 */
function dibujarEstrellitas(ctx: CanvasRenderingContext2D, escena: EscenaLuna) {
  // Le giran sobre la cabeza, esté como esté: tirada boca arriba, la
  // cabeza no está donde estaría de pie.
  const cabeza = cabezaDe(escena)
  const cx = cabeza.x
  const cy = cabeza.y - 11 * cabeza.escala
  const vuelta = escena.reloj * 4.4

  // Se asoman al principio y se van al final, para que no aparezcan
  // ni desaparezcan de golpe.
  const entrada = Math.min(1, (1 - escena.cansancio) * 6)
  const salida = Math.min(1, escena.cansancio * 5)
  ctx.globalAlpha = Math.min(entrada, salida)

  for (let i = 0; i < 3; i += 1) {
    const a = vuelta + (i / 3) * Math.PI * 2
    const x = cx + Math.cos(a) * 11 * cabeza.escala
    const y = cy + Math.sin(a) * 4 * cabeza.escala
    dibujarEstrella(ctx, x, y, (2.8 + Math.sin(a) * 0.6) * cabeza.escala)
  }
  ctx.globalAlpha = 1
}

function dibujarEstrella(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = COLOR.barra
  ctx.beginPath()
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    const radio = i % 2 === 0 ? r : r * 0.44
    const px = x + Math.cos(a) * radio
    const py = y + Math.sin(a) * radio
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

/** El fogonazo del despegue: corto, blanco y siempre, aun con menos movimiento. */
function dibujarFogonazo(ctx: CanvasRenderingContext2D, donde: { x: number; y: number }, ms: number) {
  const resto = 1 - ms / MS_FOGONAZO
  const r = 10 + (1 - resto) * 26
  const luz = ctx.createRadialGradient(donde.x, donde.y - 8, 0, donde.x, donde.y - 8, r)
  luz.addColorStop(0, `rgba(248, 244, 232, ${0.5 * resto})`)
  luz.addColorStop(1, 'rgba(248, 244, 232, 0)')
  ctx.fillStyle = luz
  ctx.beginPath()
  ctx.arc(donde.x, donde.y - 8, r, 0, Math.PI * 2)
  ctx.fill()
}

/** Polvito que se abre desde donde despegó. Sin estado: sale del reloj. */
function dibujarPolvo(ctx: CanvasRenderingContext2D, donde: { x: number; y: number }, ms: number) {
  const avance = ms / MS_FOGONAZO
  ctx.fillStyle = COLOR.estrella
  for (let i = 0; i < 5; i += 1) {
    const angulo = Math.PI + (i / 4) * Math.PI
    const d = 6 + avance * 22
    ctx.globalAlpha = 0.5 * (1 - avance)
    ctx.beginPath()
    ctx.arc(donde.x + Math.cos(angulo) * d, donde.y - 2 + Math.sin(angulo) * d * 0.4, 1.6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}
