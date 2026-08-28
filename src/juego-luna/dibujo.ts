import { MUNDO, TORTUGA } from '@/content/luna'
import { cabezaDe, dibujarTortuga } from '@/juego-luna/tortuga'
import type { EscenaLuna, Nivel, Plataforma } from '@/types'

/**
 * Pintar el mundo de la luna en un canvas 2D.
 *
 * Todo es vectorial: no hay una sola imagen. El mundo se dibuja aquí
 * y la tortuga en `tortuga.ts`, que es un archivo aparte porque el
 * personaje solo ya tiene bastante adentro.
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

export function crearPintor(canvas: HTMLCanvasElement, nivel: Nivel): Pintor {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('sin canvas 2d')

  /** Cuánto hay que subir en este capítulo, de abajo del todo a arriba. */
  const subidaTotal = Math.max(1, nivel.suelo - nivel.cima.y)

  // Las estrellas se siembran en un sitio fijo del mundo y se dibujan
  // corridas: eso es lo que da la sensación de altura.
  const estrellas = sembrarEstrellas(150, nivel.cima.y - 400, nivel.suelo + 250)

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

      // La luna se dibuja pegada a la pantalla y no al mundo, y va
      // creciendo conforme se sube. Puesta en el mundo, a mil y pico
      // de altura, no se veía hasta el último salto: justo la que
      // tiene que estar ahí desde el principio, porque es a donde se
      // va. Así se acerca de verdad.
      const subido = Math.min(1, Math.max(0, (nivel.suelo - escena.camara) / subidaTotal))
      ctx.save()
      ctx.translate(margen, golpe)
      ctx.scale(escala, escala)
      dibujarLuna(ctx, {
        x: MUNDO.ancho * 0.66,
        y: 78 + subido * 34,
        r: 20 + subido * 34,
      })
      ctx.restore()

      ctx.save()
      ctx.translate(margen, -escena.camara * escala + golpe)
      ctx.scale(escala, escala)

      const arriba = escena.camara - 40
      const abajo = escena.camara + altoVista + 40
      for (const p of escena.plataformas) {
        if (p.y < arriba || p.y > abajo) continue
        dibujarPlataforma(ctx, p, escena.hitoAlcanzado, escena.reloj)
      }

      if (!escena.cayendo) {
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

/** La luna, esperando arriba. Es a donde se va. */
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
  ctx.strokeStyle = p.hito ? COLOR.hito : COLOR.plataformaLuz
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(p.x + 2, p.y + 1)
  ctx.lineTo(p.x + p.ancho - 2, p.y + 1)
  ctx.stroke()

  if (p.hito) dibujarLazo(ctx, p, hitoAlcanzado >= p.indice, reloj)
}

/**
 * El lazo del hito. Apagado hasta que lo pisa y encendido después,
 * con un latido lento: sin eso no se entiende que se ganó algo.
 *
 * En el capítulo de Boo va a ser el lazo amarillo del arreglo de Hot
 * Wheels. Por ahora es la forma, sin la historia.
 */
function dibujarLazo(ctx: CanvasRenderingContext2D, p: Plataforma, ganado: boolean, reloj: number) {
  const x = p.x + p.ancho / 2
  const y = p.y - 12
  const latido = ganado ? 1 + Math.sin(reloj * 2.2) * 0.06 : 1

  ctx.save()
  ctx.translate(x, y)

  if (ganado) {
    ctx.globalAlpha = 0.22
    ctx.fillStyle = COLOR.hito
    ctx.beginPath()
    ctx.arc(0, 0, 13, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.scale(latido, latido)
  ctx.fillStyle = ganado ? COLOR.hito : COLOR.hitoApagado

  // Las dos colas, que son las que hacen que se lea como un lazo y no
  // como un bigote.
  ctx.beginPath()
  ctx.moveTo(-1.4, 1.2)
  ctx.quadraticCurveTo(-5, 5, -7.5, 8.4)
  ctx.lineTo(-3.6, 6.6)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(1.4, 1.2)
  ctx.quadraticCurveTo(5, 5, 7.5, 8.4)
  ctx.lineTo(3.6, 6.6)
  ctx.closePath()
  ctx.fill()

  // Las dos gasas y el nudo.
  ctx.beginPath()
  ctx.ellipse(-4.8, -1.4, 4.6, 3.4, -0.42, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(4.8, -1.4, 4.6, 3.4, 0.42, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, -1.4, 2.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/** La sombra dice dónde va a caer. Es media ayuda del juego. */
function dibujarSombra(ctx: CanvasRenderingContext2D, escena: EscenaLuna) {
  const debajo = escena.plataformas
    .filter((p) => escena.x >= p.x - 4 && escena.x <= p.x + p.ancho + 4 && p.y >= escena.y - 1)
    .sort((a, b) => a.y - b.y)[0]
  if (!debajo) return

  const caida = debajo.y - escena.y
  const cerca = Math.max(0, 1 - caida / 320)
  ctx.globalAlpha = 0.15 + cerca * 0.3
  ctx.fillStyle = COLOR.sombra
  ctx.beginPath()
  ctx.ellipse(escena.x, debajo.y + 2, 10 * (0.5 + cerca * 0.5), 3, 0, 0, Math.PI * 2)
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
