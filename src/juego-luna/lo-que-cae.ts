import { LO_QUE_CAE, TORTUGA } from '@/content/luna'
import type { AlgoCayendo, EscenaLuna, QueCae } from '@/types'

/**
 * Lo que cae, dibujado. La única traba que es de los tres capítulos.
 *
 * **Cada objeto es un icono, y el icono es su efecto.** No hay un
 * carrito en Boo, una caja en Ovi y una almohada en Nico: son los dos
 * mismos en los tres mundos. Un objeto que se pareciera al mundo por
 * donde cae contaría de dónde salió, que no importa; lo que hace falta
 * saber es a qué le va a pegar, y eso se dice con una silueta.
 *
 * - **El apurón** es un rayo dorado. Nadie necesita que le expliquen
 *   que un rayo significa que algo va a ir rápido.
 * - **El apagón** es un ojo tachado. El mismo de mostrar y ocultar la
 *   contraseña que ella ha visto mil veces en cualquier formulario.
 *
 * **Se bambolean, no giran en redondo.** Es la diferencia entre una
 * silueta que se lee al vuelo y una que hay que perseguir con la
 * mirada. Bajar dando tumbos quedaba bonito y costaba lo único que
 * este dibujo tiene que hacer.
 *
 * Antes los dos tenían la forma de la barra de carga, con el argumento
 * de que el objeto era la barra. Se leía después de pensarlo, y un
 * icono que hay que interpretar ya llegó tarde: cuando uno de estos
 * entra en pantalla, ella está mirando el salto siguiente.
 */

const COLOR = {
  /* El rayo va en el dorado del tulipán, que es el de la barra de
     carga: lo que descompone es esa. */
  rayo: '#f5c451',
  rayoClaro: '#ffe8a8',
  rayoOscuro: '#a8802a',

  /* Y el ojo en un gris azulado, frío y apagado, que es lo contrario
     del dorado y se distingue de él a media pantalla de distancia. No
     va oscuro: el primer apagón se dibujó en ceniza de verdad y se
     perdía contra el cielo de los tres capítulos. No verlo venir rompe
     la única promesa que esta traba hace. */
  ojo: '#b9c2d6',
  ojoClaro: '#e4e9f2',
  ojoOscuro: '#4a5268',

  /** El contorno oscuro que le da silueta a los dos, contra cualquier fondo. */
  filo: 'rgba(11, 16, 38, 0.75)',

  estela: 'rgba(248, 244, 232, 0.5)',
}

/** Lo que mide el icono de ancho. La tortuga mide 30. */
const ANCHO = LO_QUE_CAE.ancho

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
  // Se bambolea entre un cuarto de vuelta y el otro, sin llegar nunca
  // a ponerse de cabeza: un icono que da vueltas enteras deja de ser
  // un icono a media caída.
  ctx.rotate(Math.sin(algo.giro) * 0.42)

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
 * El halo que llevan los dos detrás.
 *
 * Es lo que los hace saltar del fondo en los tres mundos sin tener que
 * pintarlos de blanco, que es la trampa que este juego ya aprendió a no
 * usar: lo blanco pesa. Un resplandor del color del propio icono lo
 * despega del cielo y no le roba protagonismo a nada.
 */
function halo(ctx: CanvasRenderingContext2D, color: string) {
  const luz = ctx.createRadialGradient(0, 0, ANCHO * 0.2, 0, 0, ANCHO * 1.1)
  luz.addColorStop(0, color)
  luz.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = luz
  ctx.beginPath()
  ctx.arc(0, 0, ANCHO * 1.1, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * El apurón: un rayo.
 *
 * Va dibujado en el sitio, ya rotado, con el centro en el (0, 0).
 */
function dibujarApuron(ctx: CanvasRenderingContext2D) {
  ctx.save()
  ctx.globalAlpha = 0.28
  halo(ctx, COLOR.rayo)
  ctx.globalAlpha = 1

  // El rayo de toda la vida: baja, corta hacia atrás y vuelve a bajar.
  // Siete puntos, que son los que hacen falta y ni uno más — a este
  // tamaño, un rayo con más picos es una mancha.
  const a = ANCHO / 2
  ctx.beginPath()
  ctx.moveTo(a * 0.35, -a)
  ctx.lineTo(-a * 0.7, a * 0.12)
  ctx.lineTo(-a * 0.05, a * 0.12)
  ctx.lineTo(-a * 0.35, a)
  ctx.lineTo(a * 0.7, -a * 0.16)
  ctx.lineTo(a * 0.05, -a * 0.16)
  ctx.closePath()

  const lleno = ctx.createLinearGradient(0, -a, 0, a)
  lleno.addColorStop(0, COLOR.rayoClaro)
  lleno.addColorStop(0.5, COLOR.rayo)
  lleno.addColorStop(1, COLOR.rayoOscuro)
  ctx.fillStyle = lleno
  ctx.fill()

  ctx.strokeStyle = COLOR.filo
  ctx.lineWidth = 1.6
  ctx.lineJoin = 'round'
  ctx.stroke()

  ctx.restore()
}

/**
 * El apagón: un ojo tachado.
 *
 * El de mostrar y ocultar la contraseña, que es de los pocos iconos
 * que todo el mundo ya sabe leer. Dice lo que hace sin una palabra: a
 * partir de ahora no vas a ver.
 */
function dibujarApagon(ctx: CanvasRenderingContext2D) {
  const a = ANCHO / 2

  ctx.save()
  ctx.globalAlpha = 0.26
  halo(ctx, COLOR.ojo)
  ctx.globalAlpha = 1

  // La almendra: dos arcos que se encuentran en las puntas.
  ctx.beginPath()
  ctx.moveTo(-a, 0)
  ctx.quadraticCurveTo(0, -a * 0.92, a, 0)
  ctx.quadraticCurveTo(0, a * 0.92, -a, 0)
  ctx.closePath()

  const lleno = ctx.createLinearGradient(0, -a * 0.6, 0, a * 0.6)
  lleno.addColorStop(0, COLOR.ojoClaro)
  lleno.addColorStop(1, COLOR.ojo)
  ctx.fillStyle = lleno
  ctx.fill()

  ctx.strokeStyle = COLOR.filo
  ctx.lineWidth = 1.6
  ctx.lineJoin = 'round'
  ctx.stroke()

  // La pupila, gorda: a este tamaño una pequeña desaparece y el ojo se
  // queda en un limón.
  ctx.fillStyle = COLOR.ojoOscuro
  ctx.beginPath()
  ctx.arc(0, 0, a * 0.34, 0, Math.PI * 2)
  ctx.fill()

  // Y la tachadura, que es la mitad del icono. Va con su propio filo
  // oscuro por debajo para que se despegue del ojo en vez de fundirse
  // con la pupila.
  //
  // Fina, y no del blanco de la luna: la primera versión iba gorda y
  // clarísima y se comía el ojo entero. Lo que quedaba en pantalla era
  // una raya con algo detrás, y entonces ya no es el icono que todo el
  // mundo sabe leer, es una raya.
  ctx.lineCap = 'round'
  ctx.strokeStyle = COLOR.filo
  ctx.lineWidth = 4.4
  ctx.beginPath()
  ctx.moveTo(-a * 0.86, a * 0.74)
  ctx.lineTo(a * 0.86, -a * 0.74)
  ctx.stroke()

  ctx.strokeStyle = COLOR.ojo
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.moveTo(-a * 0.86, a * 0.74)
  ctx.lineTo(a * 0.86, -a * 0.74)
  ctx.stroke()

  ctx.restore()
}

/** El puf de deshacerse, contra una plataforma o contra la tortuga. */
function dibujarPuf(ctx: CanvasRenderingContext2D, algo: AlgoCayendo) {
  const u = algo.puf
  ctx.fillStyle = algo.cual === 'apuron' ? COLOR.rayo : COLOR.ojo
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
  ctx.fillStyle = cual === 'apuron' ? COLOR.rayo : COLOR.ojo
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
