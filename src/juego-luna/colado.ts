import { EL_COLADO } from '@/content/luna'
import type { Colado, Plataforma } from '@/types'

/**
 * EL COLADO
 *
 * El pato de la hermanita. Amarillo, peluca verde, pico naranja — los
 * mismos colores que tiene escondido por la web en `peluches.ts`, que
 * es donde ella ya lo conoce. Este es el mismo pato, metido en el
 * juego.
 *
 * No es hijo de nadie y no viene a ayudar. Se para en una plataforma,
 * ocupa el sitio unos segundos, mira, y se va. La gracia entera está
 * en que sea molesto y simpático a la vez: si fuera solo molesto habría
 * que quitarlo, y si fuera solo simpático no haría nada.
 *
 * **No la mata ni la empuja.** Es sólido y punto: si ella salta igual,
 * se le para en el lomo. Eso no le cuesta un pasito ni una caída — le
 * descuadra el salto siguiente, porque está más alta de lo que cree, y
 * cuando el pato se va, baja.
 *
 * Dibujado mirando a la derecha; el motor lo voltea con el espejo. El
 * origen está en las patas, en la línea que pisa, igual que la tortuga.
 */

const COLOR = {
  cuerpo: '#f5c451',
  cuerpoClaro: '#ffe3a0',
  cuerpoOscuro: '#c99a33',
  pico: '#e8853a',
  picoOscuro: '#bf6427',
  /* La peluca es lo que lo hace ridículo y por eso va en un verde que
     no existe en ninguno de los tres mundos: contra el cartón de Ovi,
     el bambú de Boo y las almohadas de Nico se lee al vuelo que ese
     bicho no es de ahí. */
  peluca: '#6fc26a',
  pelucaClara: '#9fe09a',
  pelucaOscura: '#488a45',
  ojo: '#2a2118',
  filo: 'rgba(11, 16, 38, 0.7)',
}

const ANCHO = EL_COLADO.ancho
const ALTO = EL_COLADO.alto

/**
 * Cuánto sube el suelo donde él está parado.
 *
 * Es lo que hace que ella se le pare en el lomo y no lo atraviese, así
 * que sale de acá y no del dibujo: el motor lo necesita sin pintar
 * nada. Es la altura del lomo, sin contar la peluca ni el cuello —
 * pararse en el pelo de alguien no se sostiene ni en un chiste.
 */
export const ALTO_DEL_LOMO = ALTO * 0.42

/** Hasta dónde llega su cuerpo a los lados, desde su centro. */
export const MEDIO_ANCHO = ANCHO / 2

/**
 * En qué plataformas se va a colar este capítulo.
 *
 * Se sortea al empezar y no sobre la marcha, y por eso vive en una
 * función aparte: así se pueden garantizar de una las reglas que tiene
 * —un par, no en los primeros saltos, **nunca en el último trecho**— y
 * así el arnés puede sortearlas mil veces y comprobar que se cumplen
 * siempre. Con una tirada de dados por aterrizaje habría que comprobar
 * las tres cada vez, podrían salir las dos juntas, y no habría manera
 * de probarlo sin jugar mil partidas enteras.
 *
 * Quedan fuera las estrellas, los tramos de impulso y las cajas de
 * peluches: esas tres tienen algo propio que pasa al aterrizar, y un
 * pato encima serían dos cosas a la vez en el mismo sitio.
 */
export function dondeSeCuela(plataformas: Plataforma[]): Set<number> {
  const puede = plataformas.filter(
    (p, i) =>
      i >= EL_COLADO.primeras &&
      i < plataformas.length - EL_COLADO.ultimas &&
      !p.hito &&
      !p.impulso &&
      !p.rebote,
  )

  const elegidas = new Set<number>()
  for (let i = 0; i < EL_COLADO.cuantos && puede.length > 0; i += 1) {
    elegidas.add(puede.splice(Math.floor(Math.random() * puede.length), 1)[0].indice)
  }
  return elegidas
}

export function dibujarColado(ctx: CanvasRenderingContext2D, colado: Colado, quieto: boolean) {
  ctx.save()
  ctx.translate(colado.x, colado.y)

  // Al llegar baja del cielo con un planeo corto, y al irse se va
  // caminando hacia donde mira, desvaneciéndose. En medio se queda.
  let opacidad = 1
  if (colado.fase === 'llegando') {
    ctx.translate(0, -(1 - colado.avance) * EL_COLADO.desdeArriba)
    opacidad = Math.min(1, colado.avance * 2)
  } else if (colado.fase === 'yendose') {
    ctx.translate(colado.mirando * colado.avance * EL_COLADO.seVa, 0)
    opacidad = 1 - colado.avance
  }
  ctx.globalAlpha = Math.max(0, opacidad)

  ctx.scale(colado.mirando, 1)

  // Se bambolea de a poquito, como quien está parado donde no debe y
  // lo sabe. Quieto con `prefers-reduced-motion`, que si no es un
  // bicho vibrando en el medio de la pantalla.
  const vaiven = quieto ? 0 : Math.sin(colado.reloj * 2.1) * 0.05
  ctx.rotate(vaiven)

  dibujarPatas(ctx, colado, quieto)
  dibujarCuerpo(ctx)
  dibujarCuello(ctx)
  dibujarCabeza(ctx, colado, quieto)

  ctx.restore()
}

/** Dos patitas naranjas, cortas, plantadas en el suelo. */
function dibujarPatas(ctx: CanvasRenderingContext2D, colado: Colado, quieto: boolean) {
  // Al irse camina: las patas se alternan. Parado no se mueven.
  const paso = colado.fase === 'yendose' && !quieto ? Math.sin(colado.reloj * 14) * 3 : 0

  ctx.strokeStyle = COLOR.picoOscuro
  ctx.lineWidth = 2.4
  ctx.lineCap = 'round'

  for (const [lado, sentido] of [
    [-ANCHO * 0.14, 1],
    [ANCHO * 0.16, -1],
  ] as const) {
    const x = lado + paso * sentido
    ctx.beginPath()
    ctx.moveTo(x, -ALTO * 0.16)
    ctx.lineTo(x, -1)
    ctx.stroke()

    // El pie, un triangulito plano. Nada de dedos: a este tamaño se
    // convierten en tres píxeles de barro.
    ctx.fillStyle = COLOR.pico
    ctx.beginPath()
    ctx.moveTo(x - 3.4, 0)
    ctx.lineTo(x + 4.2, 0)
    ctx.lineTo(x, -2.2)
    ctx.closePath()
    ctx.fill()
  }
}

/** El cuerpo: un óvalo gordo con la cola respingada. */
function dibujarCuerpo(ctx: CanvasRenderingContext2D) {
  const cy = -ALTO * 0.31
  const rx = ANCHO * 0.48
  // Redondito y no aplastado. Con 0.19 quedaba un disco, y un disco
  // amarillo con patas se lee como un sombrero antes que como un pato.
  const ry = ALTO * 0.245

  const degradado = ctx.createLinearGradient(0, cy - ry, 0, cy + ry)
  degradado.addColorStop(0, COLOR.cuerpoClaro)
  degradado.addColorStop(1, COLOR.cuerpoOscuro)

  ctx.fillStyle = degradado
  ctx.strokeStyle = COLOR.filo
  ctx.lineWidth = 1.4

  ctx.beginPath()
  ctx.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // La colita, atrás y respingada. Es lo que lo hace pato de goma y no
  // bolita amarilla, así que tiene que ser una cuña con cuerpo: la
  // primera versión era una raya de dos píxeles y parecía un palito
  // clavado en el lomo.
  ctx.fillStyle = COLOR.cuerpo
  ctx.beginPath()
  ctx.moveTo(-rx * 0.55, cy - ry * 0.55)
  ctx.quadraticCurveTo(-rx * 1.32, cy - ry * 1.1, -rx * 1.24, cy - ry * 0.05)
  ctx.quadraticCurveTo(-rx * 0.95, cy + ry * 0.32, -rx * 0.6, cy + ry * 0.28)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // El ala, una curva pegada al costado.
  ctx.strokeStyle = COLOR.cuerpoOscuro
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(-rx * 0.18, cy - ry * 0.3)
  ctx.quadraticCurveTo(rx * 0.42, cy + ry * 0.15, -rx * 0.05, cy + ry * 0.62)
  ctx.stroke()
}

/** El cuello, cortito: es un pato de baño, no un cisne. */
function dibujarCuello(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLOR.cuerpo
  ctx.strokeStyle = COLOR.filo
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(ANCHO * 0.06, -ALTO * 0.36)
  ctx.quadraticCurveTo(ANCHO * 0.3, -ALTO * 0.48, ANCHO * 0.24, -ALTO * 0.58)
  ctx.lineTo(ANCHO * 0.02, -ALTO * 0.56)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

function dibujarCabeza(ctx: CanvasRenderingContext2D, colado: Colado, quieto: boolean) {
  const cx = ANCHO * 0.16
  const cy = -ALTO * 0.66
  const r = ANCHO * 0.24

  ctx.fillStyle = COLOR.cuerpo
  ctx.strokeStyle = COLOR.filo
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // El pico. Va abierto un pelín: mira, y parece a punto de decir algo
  // que no dice nunca.
  ctx.fillStyle = COLOR.pico
  ctx.strokeStyle = COLOR.picoOscuro
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.92, cy + r * 0.14, r * 0.72, r * 0.34, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // El ojo, redondo y sin párpado. Parpadea de tanto en tanto, que es
  // lo único que lo salva de parecer un muñeco muerto.
  const parpadeo = !quieto && Math.sin(colado.reloj * 1.7) > 0.985
  ctx.fillStyle = COLOR.ojo
  if (parpadeo) {
    ctx.strokeStyle = COLOR.ojo
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(cx + r * 0.1, cy - r * 0.2)
    ctx.lineTo(cx + r * 0.6, cy - r * 0.2)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.arc(cx + r * 0.36, cy - r * 0.2, r * 0.19, 0, Math.PI * 2)
    ctx.fill()
  }

  dibujarPeluca(ctx, cx, cy, r)
}

/**
 * La peluca verde.
 *
 * Tres mechones y un flequillo, torcidos y de distinto largo. Que esté
 * mal puesta es el chiste: una peluca prolija sería un peinado.
 */
function dibujarPeluca(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const degradado = ctx.createLinearGradient(cx, cy - r * 1.6, cx, cy)
  degradado.addColorStop(0, COLOR.pelucaClara)
  degradado.addColorStop(1, COLOR.pelucaOscura)

  ctx.fillStyle = degradado
  ctx.strokeStyle = COLOR.filo
  ctx.lineWidth = 1.2

  // El casquete, calzado hasta las cejas y un poco de lado.
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.1, cy - r * 0.42, r * 1.08, r * 0.86, -0.12, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Los mechones, cada uno con su largo.
  ctx.fillStyle = COLOR.peluca
  ctx.strokeStyle = COLOR.pelucaOscura
  ctx.lineWidth = 1
  for (const [dx, alto, ancho] of [
    [-r * 0.95, r * 0.95, r * 0.34],
    [-r * 0.35, r * 1.32, r * 0.3],
    [r * 0.3, r * 1.12, r * 0.32],
    [r * 0.82, r * 0.78, r * 0.28],
  ] as const) {
    ctx.beginPath()
    ctx.moveTo(cx + dx - ancho, cy - r * 0.6)
    ctx.quadraticCurveTo(cx + dx, cy - r * 0.6 - alto, cx + dx + ancho, cy - r * 0.6)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
}
