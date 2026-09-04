/**
 * La estrellita de papel que marca un punto de guardado.
 *
 * Es la misma que se dobla a mano y se guarda en el frasco, con sus
 * pliegues alternos oscurecidos. Va aquí y no un lazo de Boo porque
 * estos puntos son de los tres capítulos: la estrellita ya es de ellos
 * dos y no de ninguno de los peluches.
 *
 * Vive en su propio archivo por lo mismo. Cada mundo dibuja su
 * material —la pista, las cajas, las almohadas— y encima le pone esta
 * estrella, que en los tres es idéntica.
 */
import type { Plataforma } from '@/types'

const COLOR = {
  papel: '#f8f4e8',
  pliegue: '#cfc7b4',
  papelApagado: '#5d6488',
  pliegueApagado: '#4a5070',
}

/** Apagada hasta que la pisa; encendida y latiendo después. */
export function dibujarEstrellaDePapel(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  ganada: boolean,
  reloj: number,
) {
  dibujarEstrellita(ctx, p.x + p.ancho / 2, p.y - 14, 10, ganada, reloj)
}

/**
 * La misma estrellita, suelta y de cualquier tamaño.
 *
 * Aparte de encima de las plataformas, hace falta en la llegada: allá
 * no hay dónde pisar y las estrellitas se quedan colgadas en el aire,
 * marcando por dónde subió. Es el mismo papel doblado, y por eso se
 * dibuja acá y no otra vez allá.
 */
export function dibujarEstrellita(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ganada: boolean,
  reloj: number,
  giro = 0,
) {
  const latido = ganada ? 1 + Math.sin(reloj * 2.2) * 0.07 : 1

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(giro)
  ctx.scale(latido, latido)

  if (ganada) {
    const halo = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 3)
    halo.addColorStop(0, 'rgba(248, 244, 232, 0.3)')
    halo.addColorStop(1, 'rgba(248, 244, 232, 0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(0, 0, r * 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // La silueta gordita de cinco puntas: el valle a poco más de la
  // mitad del radio es lo que la hace de papel doblado y no de dibujo
  // animado.
  const punta = (i: number, radio: number) => {
    const a = ((i * 36 - 90) * Math.PI) / 180
    return [Math.cos(a) * radio, Math.sin(a) * radio] as const
  }

  ctx.fillStyle = ganada ? COLOR.papel : COLOR.papelApagado
  ctx.beginPath()
  for (let i = 0; i < 10; i += 1) {
    const [px, py] = punta(i, i % 2 === 0 ? r : r * 0.55)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()

  // Los pliegues: uno de cada dos triángulos, sombreado.
  ctx.fillStyle = ganada ? COLOR.pliegue : COLOR.pliegueApagado
  for (let i = 0; i < 5; i += 1) {
    const [vx, vy] = punta(i * 2 + 1, r * 0.55)
    const [px, py] = punta(i * 2 + 2, r)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(vx, vy)
    ctx.lineTo(px, py)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}
