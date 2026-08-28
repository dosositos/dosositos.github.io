import { TORTUGA } from '@/content/luna'
import type { EscenaLuna } from '@/types'

/**
 * La tortuga.
 *
 * Es el personaje del juego entero, así que está dibujada con cariño y
 * no como un montoncito de formas: va parada en dos patas, tiene
 * brazos y piernas con codo y rodilla, cara con dos ojos, cejas y
 * boca, y se le mueve todo según lo que esté haciendo.
 *
 * Todo es vectorial y sale de aquí: ni una imagen que descargar,
 * cifrar y esperar en el teléfono de ella.
 *
 * ── Cómo está armada ───────────────────────────────────────────
 * Primero se calcula la POSE (una lista de ángulos y desplazamientos)
 * y después se dibuja. Están separados a propósito: para cambiar cómo
 * se mueve se tocan números en `poseDe`, sin meterse con el dibujo.
 *
 * Los ángulos se miden desde "hacia abajo" y crecen hacia adelante,
 * o sea que 0 es una pierna colgando recta y 0.5 es esa pierna
 * adelantada. Se dibuja siempre mirando a la derecha y el motor la
 * voltea con el espejo.
 *
 * El origen está en los pies, en la línea que pisa.
 */

const COLOR = {
  piel: '#5f9a70',
  pielClara: '#7fb98d',
  pielOscura: '#527f63',
  panza: '#dcc79a',
  panzaLinea: '#c9b083',
  caparazon: '#b4763f',
  caparazonOscuro: '#8a5a2f',
  caparazonClaro: '#d3a06a',
  caparazonBorde: '#e5cba8',
  ojoBlanco: '#f8f4e8',
  ojo: '#1b1b22',
  boca: '#3d2a20',
  mejilla: 'rgba(234, 111, 155, 0.35)',
  brillo: 'rgba(248, 244, 232, 0.5)',
}

/**
 * El alto con el que está dibujada aquí abajo. El tamaño de verdad
 * sale de `TORTUGA.alto` en `luna.ts`, y todo el dibujo se estira
 * solo: así agrandarla o achicarla es cambiar un número, y no
 * reacomodar cuarenta coordenadas a mano.
 */
const ALTO_DIBUJADA = 38

/* Las medidas del cuerpo, en unidades del dibujo. */
const CUERPO = {
  cadera: -13,
  hombro: -10.5,
  muslo: 7,
  pantorrilla: 6.5,
  brazo: 5.5,
  antebrazo: 5,
  grosorPierna: 5.5,
  grosorBrazo: 4.6,
}

export interface Pose {
  bob: number
  temblor: number
  squashX: number
  squashY: number
  cadera: number
  inclinacion: number
  /** [pierna de atrás, pierna de adelante] */
  muslo: [number, number]
  rodilla: [number, number]
  brazo: [number, number]
  codo: [number, number]
  cabeza: number
  /** 0 es ojo cerrado, 1 bien abierto. */
  ojos: number
  /** -1 esfuerzo, 0 normal, 1 sorpresa. */
  ceja: number
  /** De 0 a 1: los ojos se le vuelven espirales. */
  mareo: number
  boca: 'sonrisa' | 'apretada' | 'abierta' | 'onda'
}

const mezclar = (a: number, b: number, t: number) => a + (b - a) * t
const limitar = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/**
 * De lo que está pasando en el juego a cómo se para la tortuga.
 *
 * Las poses no se cambian de golpe: se mezclan entre ellas según la
 * velocidad de subida o de bajada, y eso es lo que hace que el salto
 * se vea como un movimiento y no como tres dibujos pegados.
 */
export function poseDe(e: EscenaLuna): Pose {
  const pose: Pose = {
    bob: 0,
    temblor: 0,
    squashX: 1,
    squashY: 1,
    cadera: CUERPO.cadera,
    inclinacion: 0.06,
    muslo: [0, 0],
    rodilla: [0, 0],
    brazo: [0, 0],
    codo: [0.15, 0.15],
    cabeza: 0,
    ojos: 1,
    ceja: 0,
    mareo: 0,
    boca: 'sonrisa',
  }

  /* ── Caminando ──────────────────────────────────────────────
     Un ciclo cada dos pasos. Las piernas van en contrafase y los
     brazos al revés de las piernas, como camina cualquiera. El
     cuerpo sube un poquito en cada paso: sin ese sube y baja se ve
     patinando, aunque las piernas se muevan bien. */
  const fase = e.caminado * Math.PI
  const caminando = e.enSuelo && !e.cargando

  if (caminando) {
    pose.muslo = [0.55 * Math.sin(fase + Math.PI), 0.55 * Math.sin(fase)]
    pose.rodilla = [
      Math.max(0, -0.75 * Math.sin(fase + Math.PI + 0.7)),
      Math.max(0, -0.75 * Math.sin(fase + 0.7)),
    ]
    pose.brazo = [0.5 * Math.sin(fase), 0.5 * Math.sin(fase + Math.PI)]
    pose.codo = [0.3, 0.3]
    pose.bob = -1.3 * Math.abs(Math.sin(fase))
    pose.cabeza = 0.07 * Math.sin(fase + 0.4)
    pose.inclinacion = 0.1
  }

  /* ── Cargando el salto ──────────────────────────────────────
     Se agacha juntando fuerza, con los brazos atrás como quien va a
     tirarse de cabeza, y tiembla más cuanto más llena está la barra.
     La cara se cierra de esfuerzo. */
  if (e.cargando) {
    const f = e.carga
    pose.cadera = CUERPO.cadera + 4.6 * f
    pose.muslo = [-0.5 * f, -0.62 * f]
    pose.rodilla = [1.15 * f, 1.3 * f]
    pose.brazo = [-0.5 - 1.5 * f, -0.45 - 1.4 * f]
    pose.codo = [0.5 * f, 0.45 * f]
    pose.inclinacion = 0.1 + 0.3 * f
    pose.cabeza = -0.12 * f
    pose.ojos = 1 - 0.6 * f
    pose.ceja = -f
    pose.boca = f > 0.55 ? 'apretada' : 'sonrisa'
    pose.temblor = Math.sin(e.reloj * 46) * f * 0.55
    if (e.agobio > 0) {
      // El aviso de que se está pasando: se sacude de verdad.
      pose.temblor += Math.sin(e.reloj * 78) * e.agobio * 1.5
      pose.ceja = -1
    }
    pose.squashY = 1 - 0.03 * f
    pose.squashX = 1 + 0.04 * f
  }

  /* ── En el aire ─────────────────────────────────────────────
     Subiendo va estirada, con los brazos arriba y las piernas
     juntas. Cayendo se encoge, abre los brazos y pone cara de susto.
     Entre una cosa y la otra se pasa de a poco, según la velocidad. */
  if (!e.enSuelo) {
    const sube = limitar(-e.vy / 420, 0, 1)
    const cae = limitar(e.vy / 460, 0, 1)
    const aleteo = Math.sin(e.reloj * 21) * 0.22 * cae

    pose.muslo = [mezclar(-0.3, 0.12, cae), mezclar(-0.18, 0.3, cae)]
    pose.rodilla = [mezclar(0.22, 0.62, cae), mezclar(0.28, 0.78, cae)]
    // El de atrás en alto y el de adelante estirado hacia adelante,
    // que es lo que dibuja la silueta del salto. Los dos rectos para
    // arriba se perdían detrás de la cabeza, que es grande y ocupa
    // todo ese sitio.
    pose.brazo = [mezclar(-2.35, -2.7, cae) - aleteo, mezclar(1.35, 2.1, cae) + aleteo]
    pose.codo = [mezclar(-0.45, -0.2, cae), mezclar(0.28, 0.5, cae)]
    pose.inclinacion = mezclar(0.14, 0.02, cae)
    pose.cabeza = mezclar(-0.08, 0.1, cae)
    pose.cadera = CUERPO.cadera
    pose.bob = 0
    pose.ojos = 1
    pose.ceja = 1
    pose.boca = cae > 0.35 ? 'onda' : 'abierta'
    pose.squashY = mezclar(1, 1.1, sube) * mezclar(1, 0.97, cae)
    pose.squashX = mezclar(1, 0.92, sube) * mezclar(1, 1.04, cae)
  }

  /* ── El golpe del aterrizaje ────────────────────────────────
     Se aplasta y se estira de vuelta. Dura poco a propósito: es lo
     que hace que el suelo se sienta duro. */
  const MS_GOLPE = 170
  if (e.desdeAterrizaje < MS_GOLPE) {
    const resto = 1 - e.desdeAterrizaje / MS_GOLPE
    const golpe = resto * resto
    pose.squashY *= 1 - 0.17 * golpe
    pose.squashX *= 1 + 0.13 * golpe
    pose.rodilla = [pose.rodilla[0] + 0.45 * golpe, pose.rodilla[1] + 0.45 * golpe]
    pose.cadera += 2 * golpe
    pose.ojos = mezclar(pose.ojos, 0.25, golpe)
  }

  /* ── Desmayada ──────────────────────────────────────────────
     Aguantó demasiado y se agotó. Se cae sentada, con las piernas
     estiradas, los brazos colgando y los ojos hechos remolino, y se
     va levantando sola al final. Se pierde el salto: eso es el
     castigo, y el chiste de las estrellitas es el consuelo. */
  if (e.cansancio > 0) {
    // De 0 (recién se cayó) a 1 (ya está de pie).
    const avance = 1 - e.cansancio
    const caer = limitar(avance / 0.18, 0, 1)
    const parar = limitar((avance - 0.72) / 0.28, 0, 1)
    const tirada = caer * (1 - parar)

    pose.cadera = mezclar(CUERPO.cadera, -7.5, tirada)
    pose.inclinacion = mezclar(0.06, -0.42, tirada)
    pose.muslo = [mezclar(0, 1.62, tirada), mezclar(0, 1.82, tirada)]
    pose.rodilla = [mezclar(0, -0.5, tirada), mezclar(0, -0.62, tirada)]
    pose.brazo = [mezclar(0, 1.1, tirada), mezclar(0, 1.35, tirada)]
    pose.codo = [mezclar(0.15, 0.5, tirada), mezclar(0.15, 0.6, tirada)]
    pose.cabeza = mezclar(0, -0.28, tirada) + Math.sin(e.reloj * 5) * 0.06 * tirada
    pose.bob = Math.sin(e.reloj * 5) * 0.5 * tirada
    pose.squashY = mezclar(1, 0.94, tirada)
    pose.squashX = mezclar(1, 1.08, tirada)
    pose.ojos = 1
    pose.ceja = 0
    pose.mareo = tirada
    pose.boca = 'onda'
    pose.temblor = 0
    return pose
  }

  /* ── El parpadeo ────────────────────────────────────────────
     Cada tres segundos y pico, y dura un suspiro. Es de esas cosas
     que nadie nota y que, si faltan, hacen que parezca un muñeco. */
  const p = (e.reloj / 3.4) % 1
  if (p < 0.05 && e.enSuelo) pose.ojos = Math.min(pose.ojos, 0.08)

  /* La respiración, para cuando está quieta cargando. */
  if (e.cargando) pose.bob += Math.sin(e.reloj * 3) * 0.35

  return pose
}

/**
 * Dónde le queda la cabeza, en coordenadas del mundo.
 *
 * Hay que rehacer la misma cuenta que hace el canvas al encadenar los
 * `translate` y los `rotate` del dibujo, porque desde afuera no se
 * puede preguntar. Sirve para colgarle cosas encima: las estrellitas
 * del mareo iban a la altura de la cabeza estando de pie, y desmayada
 * la cabeza está tumbada y en otro sitio.
 */
export function cabezaDe(escena: EscenaLuna, pose = poseDe(escena)) {
  const escala = TORTUGA.alto / ALTO_DIBUJADA

  // La cabeza, dentro del grupo del torso.
  const lx = 5.2
  const ly = CUERPO.hombro - 10.4

  // El torso va rotado por la inclinación.
  const seno = Math.sin(-pose.inclinacion)
  const coseno = Math.cos(-pose.inclinacion)
  const rx = lx * coseno - ly * seno
  const ry = lx * seno + ly * coseno

  // Y de ahí para afuera: la cadera, el temblor, el sube y baja, el
  // aplaste y el espejo.
  const x = (rx + pose.temblor) * pose.squashX * escala * escena.mirando
  const y = (ry + pose.cadera + pose.bob) * pose.squashY * escala

  return { x: escena.x + x, y: escena.y + y, escala }
}

/** Un miembro de dos huesos. Devuelve dónde quedó la mano o el pie. */
function miembro(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  anguloAlto: number,
  largoAlto: number,
  anguloBajo: number,
  largoBajo: number,
  grosor: number,
  color: string,
) {
  const xm = x + Math.sin(anguloAlto) * largoAlto
  const ym = y + Math.cos(anguloAlto) * largoAlto
  const a = anguloAlto + anguloBajo
  const xf = xm + Math.sin(a) * largoBajo
  const yf = ym + Math.cos(a) * largoBajo

  ctx.strokeStyle = color
  ctx.lineWidth = grosor
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(xm, ym)
  ctx.lineTo(xf, yf)
  ctx.stroke()

  return { x: xf, y: yf, angulo: a }
}

function dibujarPie(ctx: CanvasRenderingContext2D, x: number, y: number, angulo: number, color: string) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angulo * 0.45)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(1.6, 0.8, 4.4, 2.6, 0, 0, Math.PI * 2)
  ctx.fill()
  // Tres uñitas, que es lo que la hace pata de tortuga y no zapato.
  ctx.fillStyle = COLOR.caparazonBorde
  for (const d of [-1.2, 0.4, 2]) {
    ctx.beginPath()
    ctx.arc(3.6 + d * 0.5, 0.2 + d * 0.5, 0.7, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function dibujarMano(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, 2.9, 0, Math.PI * 2)
  ctx.fill()
}

/** El caparazón: domo con gajos, el reborde de abajo y un brillo. */
function dibujarCaparazon(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.translate(-5.2, -10.2)
  ctx.rotate(-0.22)

  ctx.fillStyle = COLOR.caparazon
  ctx.beginPath()
  ctx.ellipse(0, 0, 9, 10, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = COLOR.caparazonOscuro
  ctx.lineWidth = 1.3
  ctx.stroke()

  // Los gajos: uno en el centro y cinco alrededor.
  ctx.strokeStyle = COLOR.caparazonOscuro
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(-0.5, -1, 4, 4.2, 0, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + 0.5
    ctx.beginPath()
    ctx.moveTo(-0.5 + Math.cos(a) * 4, -1 + Math.sin(a) * 4.2)
    ctx.lineTo(-0.5 + Math.cos(a) * 9, -1 + Math.sin(a) * 10.1)
    ctx.stroke()
  }

  // El reborde de abajo, más claro: separa el caparazón del cuerpo.
  ctx.strokeStyle = COLOR.caparazonBorde
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.ellipse(0, 0, 9, 10, 0, Math.PI * 0.05, Math.PI * 0.95)
  ctx.stroke()

  // Un brillo arriba, para que se vea duro y no de trapo.
  ctx.strokeStyle = COLOR.brillo
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.ellipse(0, 0, 7.4, 8.2, 0, Math.PI * 1.12, Math.PI * 1.5)
  ctx.stroke()

  ctx.restore()
}

/** El ojo mareado de los dibujos animados: un remolino. */
function dibujarRemolino(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.strokeStyle = COLOR.ojo
  ctx.lineWidth = 0.9
  ctx.lineCap = 'round'
  ctx.beginPath()
  for (let i = 0; i <= 34; i += 1) {
    const t = i / 34
    const a = t * Math.PI * 4
    const radio = r * t
    const px = x + Math.cos(a) * radio
    const py = y + Math.sin(a) * radio
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
}

function dibujarCara(ctx: CanvasRenderingContext2D, pose: Pose) {
  if (pose.mareo > 0.5) {
    ctx.fillStyle = COLOR.ojoBlanco
    ctx.beginPath()
    ctx.ellipse(-1.6, -2.4, 2.5, 2.9, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(3.6, -2.2, 3.3, 3.7, 0, 0, Math.PI * 2)
    ctx.fill()
    dibujarRemolino(ctx, -1.5, -2.4, 2.2)
    dibujarRemolino(ctx, 3.7, -2.2, 3)

    ctx.fillStyle = COLOR.pielClara
    ctx.beginPath()
    ctx.ellipse(5.9, 1.5, 3.9, 3.2, 0.1, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = COLOR.boca
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(4.4, 3.2)
    ctx.quadraticCurveTo(5.6, 4.4, 6.6, 3.2)
    ctx.quadraticCurveTo(7.6, 2, 8.6, 3.2)
    ctx.stroke()
    return
  }

  /* El ojo de más atrás, apenas asomando: con un solo ojo la cara
     queda de perfil plano, y con los dos puestos se ve como si
     estuviera un poco vuelta hacia nosotros. */
  const abierto = Math.max(0.06, pose.ojos)

  ctx.fillStyle = COLOR.ojoBlanco
  ctx.beginPath()
  ctx.ellipse(-1.6, -2.4, 2.5, 2.9 * abierto, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLOR.ojo
  ctx.beginPath()
  ctx.ellipse(-1.2, -2.4, 1.3, 1.5 * abierto, 0, 0, Math.PI * 2)
  ctx.fill()

  // El ojo de adelante, más grande.
  ctx.fillStyle = COLOR.ojoBlanco
  ctx.beginPath()
  ctx.ellipse(3.6, -2.2, 3.3, 3.7 * abierto, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLOR.ojo
  ctx.beginPath()
  ctx.ellipse(4.4, -2.2, 1.75, 2 * abierto, 0, 0, Math.PI * 2)
  ctx.fill()
  if (abierto > 0.4) {
    ctx.fillStyle = COLOR.ojoBlanco
    ctx.beginPath()
    ctx.arc(5.1, -3.2, 0.75, 0, Math.PI * 2)
    ctx.fill()
  }

  // Las cejas dicen casi todo lo que se entiende de la cara.
  ctx.strokeStyle = COLOR.caparazonOscuro
  ctx.lineWidth = 1.1
  ctx.lineCap = 'round'
  const alto = -6.2 - pose.ceja * 1.1
  ctx.beginPath()
  ctx.moveTo(1.9, alto + pose.ceja * 0.9)
  ctx.lineTo(5.9, alto - pose.ceja * 0.5)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-3, alto + 0.6 + pose.ceja * 0.9)
  ctx.lineTo(-0.4, alto + 0.2 - pose.ceja * 0.5)
  ctx.stroke()

  // El hocico.
  ctx.fillStyle = COLOR.pielClara
  ctx.beginPath()
  ctx.ellipse(5.9, 1.5, 3.9, 3.2, 0.1, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLOR.pielOscura
  ctx.beginPath()
  ctx.arc(7.4, 0.2, 0.55, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(8.6, 1, 0.55, 0, Math.PI * 2)
  ctx.fill()

  // La boca.
  ctx.strokeStyle = COLOR.boca
  ctx.lineWidth = 1.4
  ctx.beginPath()
  if (pose.boca === 'sonrisa') {
    ctx.arc(6.4, 2.4, 2.6, 0.15, Math.PI * 0.75)
  } else if (pose.boca === 'apretada') {
    ctx.moveTo(4.6, 3.4)
    ctx.lineTo(8.4, 3.1)
  } else if (pose.boca === 'abierta') {
    ctx.ellipse(6.4, 3.2, 1.3, 1.6, 0, 0, Math.PI * 2)
    ctx.fillStyle = COLOR.boca
    ctx.fill()
  } else {
    ctx.moveTo(4.4, 3.2)
    ctx.quadraticCurveTo(5.6, 4.4, 6.6, 3.2)
    ctx.quadraticCurveTo(7.6, 2, 8.6, 3.2)
  }
  ctx.stroke()

  // Los cachetes.
  ctx.fillStyle = COLOR.mejilla
  ctx.beginPath()
  ctx.ellipse(0.9, 2.4, 2, 1.3, 0, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * La tortuga entera, ya con su pose. El origen es la línea que pisa y
 * mira siempre a la derecha: voltearla es cosa de quien la dibuja.
 */
export function dibujarTortuga(ctx: CanvasRenderingContext2D, escena: EscenaLuna, pose = poseDe(escena)) {
  ctx.save()
  ctx.translate(escena.x, escena.y)
  ctx.scale(escena.mirando, 1)
  ctx.scale(TORTUGA.alto / ALTO_DIBUJADA, TORTUGA.alto / ALTO_DIBUJADA)

  // El aplaste y el estirón salen desde los pies, que es donde toca
  // el suelo: si salieran del centro, la tortuga se hundiría en la
  // plataforma al aterrizar.
  ctx.scale(pose.squashX, pose.squashY)
  ctx.translate(pose.temblor, pose.bob)

  const cx = 0
  const cy = pose.cadera

  // ── Lo de atrás: pierna y brazo del lado lejano, más oscuros ──
  const pieAtras = miembro(
    ctx,
    cx - 1.5,
    cy,
    pose.muslo[0],
    CUERPO.muslo,
    pose.rodilla[0],
    CUERPO.pantorrilla,
    CUERPO.grosorPierna,
    COLOR.pielOscura,
  )
  dibujarPie(ctx, pieAtras.x, pieAtras.y, pieAtras.angulo, COLOR.pielOscura)

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(-pose.inclinacion)

  // La colita. Nace bien metida debajo del caparazón y del cuerpo: si
  // arranca más afuera se ve como un pedacito suelto flotando al lado.
  ctx.fillStyle = COLOR.pielOscura
  ctx.beginPath()
  ctx.moveTo(-2.5, -3)
  ctx.quadraticCurveTo(-9.5, -1.4, -12.2, 3.4)
  ctx.quadraticCurveTo(-8, 1.4, -2.5, 1.6)
  ctx.closePath()
  ctx.fill()

  // El caparazón va en la espalda y se pinta antes que el cuerpo: se
  // le ve el domo por detrás y por arriba del hombro, como una
  // mochila, y la panza queda al frente sin nada encima.
  dibujarCaparazon(ctx)

  // El brazo del lado lejano va detrás del cuerpo pero delante del
  // caparazón. Detrás de los dos se veía solo la mano asomando por un
  // costado, como si flotara suelta.
  const manoAtras = miembro(
    ctx,
    -0.5,
    CUERPO.hombro,
    pose.brazo[0],
    CUERPO.brazo,
    pose.codo[0],
    CUERPO.antebrazo,
    CUERPO.grosorBrazo,
    COLOR.pielOscura,
  )
  dibujarMano(ctx, manoAtras.x, manoAtras.y, COLOR.pielOscura)

  // ── El cuerpo ──
  ctx.fillStyle = COLOR.piel
  ctx.beginPath()
  ctx.ellipse(1.8, -5.5, 8, 9.4, 0.04, 0, Math.PI * 2)
  ctx.fill()

  // La panza, con las rayas del plastrón.
  ctx.fillStyle = COLOR.panza
  ctx.beginPath()
  ctx.ellipse(4, -4.6, 4.8, 7, 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = COLOR.panzaLinea
  ctx.lineWidth = 0.7
  for (const dy of [-8, -5, -2, 1]) {
    ctx.beginPath()
    ctx.moveTo(0.8, dy)
    ctx.lineTo(7.6, dy + 0.5)
    ctx.stroke()
  }

  // ── El cuello y la cabeza ──
  ctx.fillStyle = COLOR.piel
  ctx.beginPath()
  ctx.roundRect(2.2, CUERPO.hombro - 4, 6.4, 8, 3.2)
  ctx.fill()

  ctx.save()
  ctx.translate(5.2, CUERPO.hombro - 10.4)
  ctx.rotate(pose.cabeza)

  ctx.fillStyle = COLOR.piel
  ctx.beginPath()
  ctx.ellipse(0.4, -1.2, 7.4, 7, -0.06, 0, Math.PI * 2)
  ctx.fill()

  dibujarCara(ctx, pose)
  ctx.restore()

  // ── El brazo de adelante, encima de todo ──
  const manoFrente = miembro(
    ctx,
    1.6,
    CUERPO.hombro + 0.5,
    pose.brazo[1],
    CUERPO.brazo,
    pose.codo[1],
    CUERPO.antebrazo,
    CUERPO.grosorBrazo,
    COLOR.pielClara,
  )
  dibujarMano(ctx, manoFrente.x, manoFrente.y, COLOR.pielClara)

  ctx.restore()

  // ── La pierna de adelante ──
  const pieFrente = miembro(
    ctx,
    cx + 1.8,
    cy,
    pose.muslo[1],
    CUERPO.muslo,
    pose.rodilla[1],
    CUERPO.pantorrilla,
    CUERPO.grosorPierna,
    COLOR.piel,
  )
  dibujarPie(ctx, pieFrente.x, pieFrente.y, pieFrente.angulo, COLOR.pielClara)

  ctx.restore()
}
