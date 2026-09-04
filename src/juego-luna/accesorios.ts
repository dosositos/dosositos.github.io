/**
 * La ropita de la tortuga, dibujada.
 *
 * La otra mitad del ropero. Acá está solo el canvas: qué se llama cada
 * cosa, qué dice y qué hay que hacer para ganársela está en `ROPERO`,
 * en `content/luna.ts`, que es donde Armando puede tocarlo. Los `id`
 * son los que amarran las dos mitades.
 *
 * ── El sistema de coordenadas ──────────────────────────────────
 * Cada función se dibuja **dentro de la transformación que ya montó
 * `tortuga.ts`**, o sea en las mismas unidades que el resto del dibujo
 * y ya girada con la parte del cuerpo que le toca. Eso es lo que hace
 * que el gorro se incline con la cabeza y la bufanda cuelgue del
 * cuello sin que nadie tenga que recalcular nada.
 *
 *  - Lo de la cabeza (`sombrero`, `cara`) va con la cabeza ya
 *    trasladada y girada. Ahí la cabeza es una elipse de 7,4 por 7
 *    centrada en (0,4 · -1,2), los ojos están en (-1,6 · -2,4) y
 *    (3,6 · -2,2), y el hocico en (5,9 · 1,5).
 *  - Lo del cuello va en las coordenadas del cuerpo, donde el cuello
 *    es un rectángulo de (2,2 · -14,5) a (8,6 · -6,5).
 *
 * Todo mira a la derecha. Del espejo se encarga quien la dibuja.
 *
 * ── Por qué nada de esto usa imágenes ──────────────────────────
 * Por lo mismo que la tortuga: una imagen habría que optimizarla,
 * cifrarla, publicarla y esperarla en el teléfono de ella, y esto son
 * cuatro trazos.
 */

/** Los colores de la ropa. Salen de la paleta de las flores. */
const COLOR = {
  papel: '#f8f4e8',
  papelSombra: '#d9d2be',
  dorado: '#f5c451',
  doradoOscuro: '#c39833',
  lana: '#8fa9d8',
  lanaOscura: '#6c85b4',
  rosa: '#ea6f9b',
  rosaOscuro: '#c04e78',
  metal: '#3d3d47',
  vidrio: 'rgba(180, 220, 240, 0.32)',
  vidrioOscuro: '#22222b',
  brillo: 'rgba(248, 244, 232, 0.55)',
}

/**
 * Los caparazones de colores.
 *
 * Son cuatro tonos del mismo caparazón y no cuatro dibujos: el domo,
 * los gajos y el reborde se dibujan igual, solo cambian los colores. El
 * `natural` es el de siempre y es el que sale cuando no hay nada
 * puesto.
 */
export interface ColoresDelCaparazon {
  base: string
  oscuro: string
  claro: string
  borde: string
}

export const CAPARAZONES: Record<string, ColoresDelCaparazon> = {
  natural: { base: '#b4763f', oscuro: '#8a5a2f', claro: '#d3a06a', borde: '#e5cba8' },
  girasol: { base: '#e0a92c', oscuro: '#a97c14', claro: '#f3cf6a', borde: '#f8ecc4' },
  hibisco: { base: '#d4568a', oscuro: '#a13763', claro: '#ef8ab2', borde: '#f9d5e4' },
  tulipan: { base: '#8a6bc4', oscuro: '#634a95', claro: '#b096e0', borde: '#e2d8f5' },
}

/** Los colores que toca usar, con lo que haya puesto o sin nada. */
export function coloresDelCaparazon(id: string | undefined): ColoresDelCaparazon {
  return (id && CAPARAZONES[id]) || CAPARAZONES.natural
}

/* ── En la cabeza ────────────────────────────────────────────────── */

/** Un pompón: un círculo con dos mechones cortos que lo despeinan. */
function pompon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = color
  ctx.lineWidth = r * 0.45
  ctx.lineCap = 'round'
  for (const a of [-0.9, 0.5]) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(a) * r * 1.35, y + Math.sin(a) * r * 1.35)
    ctx.stroke()
  }
}

/**
 * El sombrero, dentro de la transformación de la cabeza.
 *
 * `reloj` son los segundos desde que arrancó el juego, y lo usa el
 * cintillo para bambolear sus bolitas. Los demás lo ignoran.
 */
export function dibujarSombrero(ctx: CanvasRenderingContext2D, id: string, reloj: number) {
  ctx.save()
  // La coronilla de la cabeza, que es de donde cuelga todo esto.
  ctx.translate(0.6, -7.4)

  if (id === 'gorrito') {
    // Un cono torcido hacia atrás. Derecho parecía un sombrero de
    // mago y quedaba más solemne que gracioso.
    ctx.rotate(-0.22)

    ctx.fillStyle = COLOR.rosa
    ctx.beginPath()
    ctx.moveTo(-4.4, 1.2)
    ctx.lineTo(4.4, 1.2)
    ctx.lineTo(0.6, -10.5)
    ctx.closePath()
    ctx.fill()

    // Las rayas. Van cortadas contra el cono, que ya está en el
    // camino de recorte, para que no se salgan por los costados.
    ctx.save()
    ctx.clip()
    ctx.strokeStyle = COLOR.papel
    ctx.lineWidth = 1.1
    for (const dy of [-0.6, -3.4, -6.2]) {
      ctx.beginPath()
      ctx.moveTo(-5, dy)
      ctx.lineTo(5, dy - 1.6)
      ctx.stroke()
    }
    ctx.restore()

    pompon(ctx, 0.6, -10.8, 1.5, COLOR.papel)
    ctx.restore()
    return
  }

  if (id === 'lana') {
    // Le tapa media cabeza, que es lo que hace que se lea como gorro
    // de lana y no como una boina apoyada encima.
    ctx.fillStyle = COLOR.lana
    ctx.beginPath()
    ctx.ellipse(0.2, 1.4, 6.6, 5.6, 0, Math.PI, Math.PI * 2)
    ctx.fill()

    // La vuelta de abajo, más oscura y más gorda.
    ctx.fillStyle = COLOR.lanaOscura
    ctx.beginPath()
    ctx.roundRect(-6.6, 0.4, 13.2, 2.6, 1.3)
    ctx.fill()

    pompon(ctx, 0.2, -5, 2.1, COLOR.papel)
    ctx.restore()
    return
  }

  if (id === 'cintillo') {
    // Las bolitas van en resortes y se bambolean solas, cada una a su
    // ritmo. Que vayan desfasadas es todo el chiste: iguales parecen
    // una sola cosa con dos puntas.
    ctx.strokeStyle = COLOR.metal
    ctx.lineWidth = 1.1
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.ellipse(0.2, 1.6, 6.2, 5, 0, Math.PI * 1.15, Math.PI * 1.85)
    ctx.stroke()

    for (const [i, x] of [-3.6, 4].entries()) {
      const vaiven = Math.sin(reloj * 2.6 + i * 1.9) * 1.5
      ctx.strokeStyle = COLOR.metal
      ctx.lineWidth = 0.9
      ctx.beginPath()
      ctx.moveTo(x, -2.4)
      ctx.quadraticCurveTo(x + vaiven * 0.5, -5, x + vaiven, -7.2)
      ctx.stroke()

      ctx.fillStyle = COLOR.rosa
      ctx.beginPath()
      ctx.arc(x + vaiven, -8.3, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    return
  }

  if (id === 'corona') {
    // Cinco puntas de papel dorado. La del medio más alta, que es lo
    // que la hace leerse como corona y no como sierra.
    const puntas = [
      [-5.4, 0.4],
      [-2.9, -3.4],
      [-0.2, 0.9],
      [2.6, -4.2],
      [5.2, -0.2],
    ]

    ctx.fillStyle = COLOR.dorado
    ctx.beginPath()
    ctx.moveTo(-6, 2.4)
    for (const [x, y] of puntas) ctx.lineTo(x, y)
    ctx.lineTo(6, 2.4)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = COLOR.doradoOscuro
    ctx.lineWidth = 0.8
    ctx.stroke()

    // Una piedrita en el frente. Sin ella la corona es un triángulo
    // más entre los otros cuatro.
    ctx.fillStyle = COLOR.rosa
    ctx.beginPath()
    ctx.arc(2.6, 0.6, 1.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    return
  }

  ctx.restore()
}

/** Los lentes, dentro de la transformación de la cabeza. */
export function dibujarEnLaCara(ctx: CanvasRenderingContext2D, id: string) {
  // Los dos ojos, con su tamaño. El de adelante es más grande porque
  // está más cerca: los lentes tienen que seguir esa misma cuenta o se
  // ven pegados encima en vez de puestos.
  const izquierdo = { x: -1.6, y: -2.4, r: 2.6 }
  const derecho = { x: 3.7, y: -2.2, r: 3.2 }

  if (id === 'redondos') {
    ctx.strokeStyle = COLOR.metal
    ctx.lineWidth = 0.9

    for (const ojo of [izquierdo, derecho]) {
      ctx.fillStyle = COLOR.vidrio
      ctx.beginPath()
      ctx.arc(ojo.x, ojo.y, ojo.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    }

    // El puente y la patilla que se va hacia la oreja.
    ctx.beginPath()
    ctx.moveTo(izquierdo.x + izquierdo.r, izquierdo.y)
    ctx.lineTo(derecho.x - derecho.r, derecho.y)
    ctx.moveTo(izquierdo.x - izquierdo.r, izquierdo.y)
    ctx.lineTo(izquierdo.x - izquierdo.r - 2.6, izquierdo.y - 0.6)
    ctx.stroke()
    return
  }

  if (id === 'oscuros') {
    ctx.fillStyle = COLOR.vidrioOscuro
    for (const ojo of [izquierdo, derecho]) {
      ctx.beginPath()
      ctx.ellipse(ojo.x, ojo.y, ojo.r + 0.5, ojo.r, -0.1, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.strokeStyle = COLOR.vidrioOscuro
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(izquierdo.x + izquierdo.r, izquierdo.y - 0.8)
    ctx.lineTo(derecho.x - derecho.r, derecho.y - 0.8)
    ctx.moveTo(izquierdo.x - izquierdo.r, izquierdo.y - 0.8)
    ctx.lineTo(izquierdo.x - izquierdo.r - 2.6, izquierdo.y - 1.4)
    ctx.stroke()

    // El reflejo en diagonal, que es lo único que los separa de dos
    // manchas negras encima de la cara.
    ctx.strokeStyle = COLOR.brillo
    ctx.lineWidth = 0.9
    for (const ojo of [izquierdo, derecho]) {
      ctx.beginPath()
      ctx.moveTo(ojo.x - ojo.r * 0.5, ojo.y + ojo.r * 0.4)
      ctx.lineTo(ojo.x + ojo.r * 0.2, ojo.y - ojo.r * 0.6)
      ctx.stroke()
    }
  }
}

/* ── En el cuello ────────────────────────────────────────────────── */

/**
 * Lo del cuello, en las coordenadas del cuerpo.
 *
 * `arrastre` es cuánto se le va la bufanda hacia atrás, de 0 (quieta)
 * a 1 (volando). Sale de la velocidad, y es lo que hace que en el aire
 * la bufanda cuente algo en vez de quedarse colgando como un trapo.
 */
export function dibujarEnElCuello(
  ctx: CanvasRenderingContext2D,
  id: string,
  arrastre: number,
  reloj: number,
) {
  if (id === 'corbatin') {
    ctx.save()
    ctx.translate(5.4, -9.4)
    ctx.rotate(-0.12)

    ctx.fillStyle = COLOR.rosa
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-3.4, -2.2)
    ctx.lineTo(-3.4, 2.2)
    ctx.closePath()
    ctx.moveTo(0, 0)
    ctx.lineTo(3.4, -2.2)
    ctx.lineTo(3.4, 2.2)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = COLOR.rosaOscuro
    ctx.beginPath()
    ctx.arc(0, 0, 1.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    return
  }

  if (id === 'bufanda') {
    ctx.save()
    ctx.translate(5.4, -12.2)

    /*
     * La punta va a dos sitios distintos y se mueve entre los dos según
     * la velocidad. Quieta cuelga por delante, sobre la panza, que es
     * donde se lee como bufanda; en el aire se le va para atrás y para
     * arriba, por encima del caparazón.
     *
     * Lo de «por encima del caparazón» no es un detalle. Mandada para
     * atrás sin subirla, la punta le pasaba por dentro del caparazón y
     * lo que se veía era un aro rosado alrededor del cuerpo, como un
     * flotador. El caparazón llega hasta unos diez de alto ahí atrás,
     * así que la punta tiene que salir por encima de eso o no sale.
     */
    const ondeo = Math.sin(reloj * 3.4) * 0.9
    const puntaX = -1.4 + arrastre * -15
    const puntaY = 7 + ondeo + arrastre * -25
    // El punto de control acompaña, si no la tela se dobla en pico.
    const curvaX = -0.4 + arrastre * -6.4
    const curvaY = 3.4 + arrastre * -10.5

    ctx.strokeStyle = COLOR.rosaOscuro
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(0.4, 0.6)
    ctx.quadraticCurveTo(curvaX, curvaY, puntaX, puntaY)
    ctx.stroke()

    // Los flecos de la punta, hacia donde va la tela.
    ctx.lineWidth = 0.8
    for (const d of [-1, 0, 1]) {
      ctx.beginPath()
      ctx.moveTo(puntaX, puntaY)
      ctx.lineTo(puntaX + d * 1.2 - arrastre * 1.6, puntaY + 2.2 - arrastre * 3.4)
      ctx.stroke()
    }

    // Y la vuelta del cuello encima de todo, que es lo que tapa el
    // arranque de la punta y hace que se vea enrollada y no pegada.
    ctx.fillStyle = COLOR.rosa
    ctx.beginPath()
    ctx.roundRect(-3.6, -1.9, 7.6, 3.8, 1.9)
    ctx.fill()
    ctx.restore()
  }
}
