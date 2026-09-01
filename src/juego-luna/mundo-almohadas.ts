import { ALMOHADAS } from '@/content/luna'
import { dibujarEstrellaDePapel } from '@/juego-luna/estrella'
import type { Plataforma } from '@/types'

/**
 * El mundo del capítulo de Nico: la cama a las cuatro de la mañana.
 *
 * ══════════════════════════════════════════════════════════════
 *  ESTO ES TODAVÍA EL PROTOTIPO.
 *
 *  Lo que hay aquí abajo dibuja lo justo para poder **jugar el
 *  capítulo y juzgar las dos trabas**: una almohada que se lee como
 *  almohada y se ve hundirse, y una cobija que se lee distinta de
 *  una almohada de un vistazo. Nada más. Sin sábanas revueltas, sin
 *  luz de madrugada y sin las torres del fondo. Eso viene después,
 *  con el mundo de Boo y el de Ovi de referencia.
 *
 *  Se hizo así a propósito: el capítulo de Ovi enseñó que lo que
 *  cuesta caro es la mecánica y el nivel, no el material, y que
 *  pintar bonito un mundo cuyos números todavía se van a mover es
 *  pintarlo dos veces.
 * ══════════════════════════════════════════════════════════════
 *
 * El **alfa viaja como parámetro** y no como estado del canvas, igual
 * que en los otros dos mundos. Es la lección del desvanecimiento de la
 * pista: un `globalAlpha` puesto adentro de una función de dibujo se
 * lleva puesto todo lo que venga después.
 */

/* Tela de noche: el lila apagado de una funda de almohada con la luna
   entrando por la ventana. Va oscuro a propósito — lo blanco pesa, y
   una almohada pintada al brillo del algodón de verdad sería lo más
   claro de la pantalla después de la luna. */
const COLOR = {
  tela: '#5d5570',
  telaLuz: '#7b7290',
  telaSombra: '#3d3750',
  costura: '#8d84a4',

  /** La almohada del todo hundida se apaga: se hundió en la sombra. */
  fondo: '#4a4359',
}

/** Lo que mide de alto una almohada entera, sin peso encima. */
const ALTO = 20

/** Y lo que le queda de alto tirada en el fondo, ya aplastada. */
const ALTO_HUNDIDA = 11

/* La cobija enredada: lana en la penumbra, más caliente y más pesada
   que la funda de la almohada. Se separa de la almohada **por el
   color antes que por la forma**, que a mitad de un salto no hay
   tiempo de contarle los pliegues a nada. */
const COLOR_COBIJA = {
  tela: '#6b5560',
  telaLuz: '#8a7280',
  telaSombra: '#463a45',
  costura: '#a08a97',
  fondo: '#544453',
}

/**
 * Una almohada o una cobija, con lo hundida que esté.
 *
 * Baja `hundido × ALMOHADAS.seHunde` —la misma cuenta que hace la
 * física en `superficieDe`, que si aquí se dibujara otra cosa la
 * tortuga caminaría por el aire— y de paso se aplasta, que es lo que
 * hace una almohada con alguien encima.
 */
export function dibujarAlmohada(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  hundido: number,
  hitoAlcanzado: number,
  reloj: number,
  alfa: number,
) {
  const baja = p.hunde ? hundido * ALMOHADAS.seHunde : 0
  const alto = ALTO - (ALTO - ALTO_HUNDIDA) * hundido
  // Lo que la almohada se aplasta por arriba se reparte a los lados:
  // la tela no desaparece, se corre. La cobija no se ensancha — la
  // lana no se corre para los lados, se apelmaza.
  const ancha = p.enreda ? 0 : hundido * 5

  const x = p.x - ancha
  const y = p.y + baja
  const ancho = p.ancho + ancha * 2

  if (p.enreda) dibujarCobija(ctx, x, y, ancho, alto, hundido, alfa)
  else dibujarFunda(ctx, x, y, ancho, alto, p.hunde === true && hundido > 0.9, alfa)

  // La estrella va encima y sin hundirse: las estrellas nunca se
  // hunden, y por eso son el sitio donde se respira.
  if (p.hito) dibujarEstrellaDePapel(ctx, p, hitoAlcanzado >= p.indice, reloj)
}

/** La almohada de siempre. */
function dibujarFunda(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  enElFondo: boolean,
  alfa: number,
) {
  ctx.save()
  ctx.globalAlpha = alfa

  // El cuerpo. Radio generoso: una almohada no tiene esquinas.
  const relleno = ctx.createLinearGradient(0, y, 0, y + alto)
  relleno.addColorStop(0, enElFondo ? COLOR.fondo : COLOR.telaLuz)
  relleno.addColorStop(0.55, COLOR.tela)
  relleno.addColorStop(1, COLOR.telaSombra)
  ctx.fillStyle = relleno
  ctx.beginPath()
  ctx.roundRect(x, y, ancho, alto, Math.min(alto / 2, 10))
  ctx.fill()

  // La línea de arriba es la que se pisa, y en este capítulo es la que
  // se está moviendo: se marca clara para que no haya duda de a qué
  // altura está el suelo ahora mismo.
  ctx.strokeStyle = COLOR.costura
  ctx.lineWidth = 1.5
  ctx.globalAlpha = alfa * 0.9
  ctx.beginPath()
  ctx.moveTo(x + 6, y + 1)
  ctx.lineTo(x + ancho - 6, y + 1)
  ctx.stroke()

  // El pespunte del borde, que es lo único que la separa de ser un
  // rectángulo redondeado.
  ctx.globalAlpha = alfa * 0.35
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.roundRect(x + 4, y + 3.5, ancho - 8, alto - 7, Math.min(alto / 2 - 3, 7))
  ctx.stroke()
  ctx.setLineDash([])

  ctx.restore()
}

/**
 * La cobija enredada.
 *
 * Tiene que leerse distinta de una almohada **de un vistazo y de
 * lejos**, porque lo que cambia encima de ella es el ritmo de la barra
 * y eso no se ve hasta que ya se está cargando. Tres cosas la separan,
 * en este orden de importancia: el color más caliente, las esquinas
 * duras —una almohada no tiene esquinas y una cobija doblada sí— y los
 * pliegues cruzados.
 *
 * Los pliegues van **adentro del cuerpo** y no asomando por arriba. Un
 * bulto dibujado por encima de la línea que se pisa se lee como suelo,
 * y no lo es: en un capítulo donde el suelo se está moviendo, esa
 * confusión se paga con un salto.
 */
function dibujarCobija(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  hundido: number,
  alfa: number,
) {
  ctx.save()
  ctx.globalAlpha = alfa

  const relleno = ctx.createLinearGradient(0, y, 0, y + alto)
  relleno.addColorStop(0, hundido > 0.9 ? COLOR_COBIJA.fondo : COLOR_COBIJA.telaLuz)
  relleno.addColorStop(0.55, COLOR_COBIJA.tela)
  relleno.addColorStop(1, COLOR_COBIJA.telaSombra)
  ctx.fillStyle = relleno
  ctx.beginPath()
  ctx.roundRect(x, y, ancho, alto, 4)
  ctx.fill()

  // La línea que se pisa, igual de clara que en la almohada y por lo
  // mismo: acá el suelo se mueve y no puede haber duda de dónde está.
  ctx.strokeStyle = COLOR_COBIJA.costura
  ctx.lineWidth = 1.5
  ctx.globalAlpha = alfa * 0.9
  ctx.beginPath()
  ctx.moveTo(x + 4, y + 1)
  ctx.lineTo(x + ancho - 4, y + 1)
  ctx.stroke()

  // El enredo.
  ctx.globalAlpha = alfa * 0.45
  ctx.lineWidth = 1
  for (let i = 1; i <= 3; i += 1) {
    const px = x + (ancho * i) / 4
    ctx.beginPath()
    ctx.moveTo(px - 7, y + alto - 2)
    ctx.lineTo(px + 5, y + 3)
    ctx.stroke()
  }

  // Y la punta suelta que cuelga, que es lo que la hace una cobija y
  // no un ladrillo. Cuelga para abajo, donde no se pisa, y cuelga más
  // cuanto más hundida está: es la tela que se descuelga al apelmazarse.
  ctx.globalAlpha = alfa * 0.75
  ctx.fillStyle = COLOR_COBIJA.telaSombra
  ctx.beginPath()
  ctx.moveTo(x + ancho - 26, y + alto - 1)
  ctx.lineTo(x + ancho - 6, y + alto - 1)
  ctx.lineTo(x + ancho - 13, y + alto + 8 + hundido * 5)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}
