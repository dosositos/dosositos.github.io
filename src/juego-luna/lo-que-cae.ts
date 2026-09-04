import { LO_QUE_CAE, TORTUGA } from '@/content/luna'
import type { AlgoCayendo, EscenaLuna, QueCae } from '@/types'

/**
 * Lo que cae, dibujado. La única traba que es de los tres capítulos.
 *
 * **Cada objeto es su propio efecto, dibujado.** No hay un carrito en
 * Boo, una caja en Ovi y una almohada en Nico: son los dos mismos en
 * los tres mundos, y los dos tienen la forma de la barra de carga —la
 * misma cápsula de 42 × 5 que ella lleva sobre la cabeza cada vez que
 * aprieta. Un objeto que se pareciera al mundo por donde cae contaría
 * de dónde salió, que no importa; contando en cambio a qué le va a
 * pegar, se entiende sin una sola palabra de explicación.
 *
 * - **El apurón** va lleno de dorado y vibrando, con las rayas de
 *   velocidad detrás. Dice «esto va rápido».
 * - **El apagón** va ceniza y vacío, con la luz partida por la mitad.
 *   Dice «esto se apaga».
 *
 * Y los dos bajan girando y meciéndose, no en plomada: algo que se
 * soltó de arriba, no algo que le tiraron.
 */

const COLOR = {
  /* El dorado del tulipán, que es el de la barra de carga. Es el
     mismo a propósito: el objeto es la barra. */
  barra: '#f5c451',
  barraOscura: '#a8802a',
  marco: 'rgba(11, 16, 38, 0.55)',

  /* La ceniza del apagón.
     
     El primer intento iba apagado de verdad, todo ceniza oscura, con
     el argumento de que un objeto brillante no puede anunciar que algo
     se apaga. Se perdía contra el cielo: no se veía venir, y no verlo
     venir rompe la única promesa que esta traba hace. Ahora lleva un
     resto de dorado agonizando en una punta —es una barra
     apagándose, no una piedra— y el contorno claro que le da silueta
     contra cualquiera de los tres fondos. */
  ceniza: '#7d7c6e',
  cenizaOscura: '#45443c',
  cenizaFilo: '#a8a596',
  raja: '#cfc6b0',

  estela: 'rgba(248, 244, 232, 0.5)',
}

/** Lo que mide el objeto: la barra de carga, un poco más chica. */
const ANCHO = LO_QUE_CAE.ancho
const ALTO = 9

export function dibujarLoQueCae(
  ctx: CanvasRenderingContext2D,
  algo: AlgoCayendo,
  reloj: number,
  quieto: boolean,
) {
  ctx.save()

  if (algo.puf > 0) {
    dibujarPuf(ctx, algo)
    ctx.restore()
    return
  }

  // La estela va antes y sin girar: marca por dónde viene bajando, que
  // es la mitad de lo que hace que se vea venir.
  dibujarEstela(ctx, algo)

  ctx.translate(algo.x, algo.y)
  ctx.rotate(algo.giro)

  // El apurón vibra y el apagón no: es la primera diferencia que se
  // nota, antes todavía que el color.
  if (algo.cual === 'apuron' && !quieto) {
    ctx.translate(Math.sin(reloj * 40 + algo.fase) * 1.2, 0)
  }

  if (algo.cual === 'apuron') dibujarApuron(ctx)
  else dibujarApagon(ctx)

  ctx.restore()
}

/** Por dónde viene bajando: tres motitas que se van perdiendo. */
function dibujarEstela(ctx: CanvasRenderingContext2D, algo: AlgoCayendo) {
  ctx.fillStyle = COLOR.estela
  for (let i = 1; i <= 3; i += 1) {
    ctx.globalAlpha = 0.26 / i
    ctx.beginPath()
    ctx.arc(algo.x - Math.sin(algo.fase) * i * 2, algo.y - i * 13, 2.4 - i * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/**
 * El apurón: la barra llena, con sus rayas de velocidad.
 *
 * Va dibujado en el sitio, ya rotado, con el centro en el (0, 0).
 */
function dibujarApuron(ctx: CanvasRenderingContext2D) {
  // El marco, igual que el de la barra de verdad.
  ctx.fillStyle = COLOR.marco
  ctx.beginPath()
  ctx.roundRect(-ANCHO / 2 - 1, -ALTO / 2 - 1, ANCHO + 2, ALTO + 2, 5)
  ctx.fill()

  // Y el relleno, lleno de punta a punta: es una barra al tope.
  const lleno = ctx.createLinearGradient(0, -ALTO / 2, 0, ALTO / 2)
  lleno.addColorStop(0, COLOR.barra)
  lleno.addColorStop(1, COLOR.barraOscura)
  ctx.fillStyle = lleno
  ctx.beginPath()
  ctx.roundRect(-ANCHO / 2, -ALTO / 2, ANCHO, ALTO, 4)
  ctx.fill()

  // Las rayas de velocidad, a los dos lados y saliéndose: es lo que
  // dice «rápido» sin escribirlo.
  ctx.strokeStyle = COLOR.barra
  ctx.lineWidth = 1.6
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.55
  for (let i = -1; i <= 1; i += 1) {
    const y = i * 4.5
    const largo = i === 0 ? 9 : 6
    ctx.beginPath()
    ctx.moveTo(-ANCHO / 2 - 3, y)
    ctx.lineTo(-ANCHO / 2 - 3 - largo, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(ANCHO / 2 + 3, y)
    ctx.lineTo(ANCHO / 2 + 3 + largo, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

/**
 * El apagón: la misma barra, **partida en dos y apagándose**.
 *
 * Las dos mitades van separadas de verdad, con el cielo pasando por el
 * medio: es lo que lo hace inconfundible con el apurón a mitad de un
 * salto, que es cuando de verdad hay que distinguirlos. En la mitad de
 * atrás le queda un resto de dorado agonizando —una barra que se
 * apaga, no una piedra— y las dos llevan contorno claro, que es lo que
 * les da silueta contra los tres fondos.
 */
function dibujarApagon(ctx: CanvasRenderingContext2D) {
  const mitad = ANCHO * 0.44
  const hueco = 3

  // La mitad de atrás, con el último dorado.
  const agonizando = ctx.createLinearGradient(-ANCHO / 2, 0, -ANCHO / 2 + mitad, 0)
  agonizando.addColorStop(0, COLOR.barraOscura)
  agonizando.addColorStop(1, COLOR.cenizaOscura)

  media(ctx, -ANCHO / 2, mitad, agonizando, -0.09)
  // Y la de adelante, ya ceniza del todo y caída un poco: son dos
  // pedazos sueltos, no una barra con una raya pintada.
  media(ctx, ANCHO / 2 - mitad + hueco, mitad, COLOR.cenizaOscura, 0.13)

  // El chispazo del corte, en el hueco: lo único claro que lleva, y va
  // justo donde se partió.
  ctx.strokeStyle = COLOR.raja
  ctx.lineWidth = 1.3
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.7
  ctx.beginPath()
  ctx.moveTo(1, -ALTO / 2 - 4)
  ctx.lineTo(-2.5, 0)
  ctx.lineTo(1.5, ALTO / 2 + 4)
  ctx.stroke()
  ctx.globalAlpha = 1
}

/** Una de las dos mitades del apagón, ladeada lo suyo. */
function media(
  ctx: CanvasRenderingContext2D,
  x: number,
  ancho: number,
  relleno: string | CanvasGradient,
  ladeo: number,
) {
  ctx.save()
  ctx.translate(x + ancho / 2, 0)
  ctx.rotate(ladeo)
  ctx.translate(-(x + ancho / 2), 0)

  ctx.fillStyle = COLOR.marco
  ctx.beginPath()
  ctx.roundRect(x - 1, -ALTO / 2 - 1, ancho + 2, ALTO + 2, 5)
  ctx.fill()

  ctx.fillStyle = relleno
  ctx.beginPath()
  ctx.roundRect(x, -ALTO / 2, ancho, ALTO, 4)
  ctx.fill()

  ctx.strokeStyle = COLOR.cenizaFilo
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  ctx.roundRect(x, -ALTO / 2, ancho, ALTO, 4)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.restore()
}

/** El puf de deshacerse, contra una plataforma o contra la tortuga. */
function dibujarPuf(ctx: CanvasRenderingContext2D, algo: AlgoCayendo) {
  const u = algo.puf
  ctx.fillStyle = algo.cual === 'apuron' ? COLOR.barra : COLOR.ceniza
  ctx.globalAlpha = (1 - u) * 0.8

  // Seis motas abriéndose en círculo y frenando. Cuesta seis trazos y
  // con eso el objeto no desaparece de golpe, que en un juego donde
  // todo lo demás se ve venir sería lo único que pasa sin avisar.
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2
    const r = 4 + u * (2 - u) * 18
    ctx.beginPath()
    ctx.arc(algo.x + Math.cos(a) * r, algo.y + Math.sin(a) * r * 0.7, 2.6 * (1 - u), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/**
 * Lo que le quedó puesto, encima de la cabeza.
 *
 * Con el apurón la barra ya se ve haciendo locuras y esto casi sobra;
 * con el apagón **no hay barra que mirar**, y sin este aviso no habría
 * forma de saber por qué. Los puntitos son los saltos que le quedan:
 * el castigo tiene que verse venir, y también verse terminar.
 */
export function dibujarLoQuePusieron(ctx: CanvasRenderingContext2D, escena: EscenaLuna) {
  if (!escena.efecto) return

  const { cual, saltos } = escena.efecto
  const x = escena.x
  const y = escena.y - TORTUGA.alto - 20

  ctx.save()
  ctx.globalAlpha = 0.9

  ctx.translate(x, y)
  ctx.scale(0.62, 0.62)
  if (cual === 'apuron') dibujarApuron(ctx)
  else dibujarApagon(ctx)
  ctx.setTransform(ctx.getTransform())
  ctx.restore()

  // Los saltos que quedan, en puntitos debajo.
  ctx.save()
  ctx.fillStyle = cual === 'apuron' ? COLOR.barra : COLOR.ceniza
  ctx.globalAlpha = 0.75
  for (let i = 0; i < saltos; i += 1) {
    const px = x - ((saltos - 1) * 5) / 2 + i * 5
    ctx.beginPath()
    ctx.arc(px, y + 8, 1.6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** Si con esto puesto la barra se puede mirar, o hay que medir a ojo. */
export function laBarraSeVe(efecto: EscenaLuna['efecto']): boolean {
  return efecto?.cual !== 'apagon'
}

/** El nombre de cada uno, para los carteles y la ayuda. */
export const COMO_SE_LLAMA: Record<QueCae, string> = {
  apuron: 'el apurón',
  apagon: 'el apagón',
}
