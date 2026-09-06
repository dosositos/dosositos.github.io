import { EL_PELUCHE } from '@/content/luna'
import { caparazonDe } from '@/juego-luna/tortuga'
import type { EscenaLuna } from '@/types'

/**
 * EL PELUCHE ESPERANDO EN LA LUNA
 *
 * Boo, Ovi y Nico están sentados encima de la luna desde el primer
 * cuadro del capítulo, y ella sube hasta ahí a buscarlos. Al alcanzar
 * la cima, el peluche **baja de la luna y se le sube al caparazón**, y
 * recién entonces la luna se va.
 *
 * Es la parte del juego que le pone cara a lo que ya pasaba: los
 * capítulos siempre se ganaron con un peluche, pero el peluche solo
 * salía en dos carteles de texto. Ahora está allá arriba desde el
 * principio y se ve mientras ella sube.
 *
 * **No se dibuja: es el retrato bordado**, el mismo que ella conoce de
 * los carteles y de las esquinas de la web. Están en claro en el bundle
 * (`src/assets/peluches/`, y el porqué está en `CLAUDE.md`), así que no
 * hay nada que descifrar ni que esperar. Dibujarlos a mano con curvas
 * habría sido inventar un panda que compite con el panda de verdad.
 *
 * **La dirección del archivo entra desde fuera**, no se busca acá. El
 * catálogo de retratos se arma con `import.meta.glob`, que es de Vite y
 * que node no sabe leer, y por acá pasan los arneses que corren en
 * node: `luna:probar` importa el pintor y con el catálogo enganchado se
 * caía antes de empezar. Se la pasa la página, igual que la ropita.
 *
 * Se lo sube al caparazón **solo por ese momento**. No es ropita del
 * ropero ni queda puesto: la luna se va, sale el cartel del cierre y la
 * próxima vez que se juega vuelve a estar arriba esperando.
 */

/** Los retratos ya pedidos, por dirección. Son tres del propio bundle. */
const pedidos = new Map<string, HTMLImageElement>()

/**
 * El retrato de un peluche, o nada mientras no haya llegado.
 *
 * Se pide una vez y se guarda. Mientras no esté cargado no se dibuja y
 * no pasa nada: son tres webp del bundle, llegan en el primer pestañeo
 * y el pintor vuelve a preguntar sesenta veces por segundo.
 */
export function retratoDe(url: string): HTMLImageElement | null {
  const guardado = pedidos.get(url)
  if (guardado) return guardado.complete && guardado.naturalWidth > 0 ? guardado : null

  const img = new Image()
  img.src = url
  pedidos.set(url, img)
  return null
}

/**
 * Dónde se sienta encima de la luna.
 *
 * Corrido del centro a propósito, y no en la coronilla. En el último
 * capítulo la tortuga sube a pararse justo arriba de la luna: con el
 * peluche en el centro, ella le aterrizaría encima. Corrido, quedan los
 * dos sentados uno al lado del otro, que es mucho mejor final que uno
 * solo.
 */
export function dondeSeSienta(luna: { x: number; y: number; r: number }) {
  const corrido = luna.r * EL_PELUCHE.corrido
  return {
    x: luna.x - corrido,
    // La curva de la luna en ese punto, y hundido un pelín: apoyado al
    // milímetro se ve pegado con cinta.
    y: luna.y - Math.sqrt(Math.max(0, luna.r * luna.r - corrido * corrido)) + EL_PELUCHE.seHunde,
  }
}

/** Y dónde va cuando ya se le subió al caparazón. */
export function dondeSeAgarra(escena: EscenaLuna) {
  const lomo = caparazonDe(escena)
  return { x: lomo.x, y: lomo.y + EL_PELUCHE.seHunde }
}

/**
 * Por dónde va el peluche mientras baja de la luna al caparazón.
 *
 * `t` es de 0 a 1 dentro del tramo de la bajada. Baja por una curva y
 * no en línea recta: en línea recta parecía que lo tiraban, y lo que
 * tiene que parecer es que se descuelga.
 */
export function bajandoDeLaLuna(
  desde: { x: number; y: number },
  hasta: { x: number; y: number },
  t: number,
) {
  // Un compás antes de moverse: mira hacia abajo, se decide, y recién
  // ahí se suelta. Sin ese momento la luna la alcanza y el peluche ya
  // está saltando en el mismo cuadro, y no se entiende qué pasó.
  const a = suave(entre((t - EL_PELUCHE.elCompas) / (1 - EL_PELUCHE.elCompas), 0, 1))

  // El punto de control se va hacia afuera y hacia abajo: la curva sale
  // de la luna por el costado, cae, y entra al caparazón desde arriba.
  const cx = desde.x - Math.abs(hasta.x - desde.x) * 0.35 - 26
  const cy = desde.y + (hasta.y - desde.y) * 0.72

  const u = 1 - a
  return {
    x: u * u * desde.x + 2 * u * a * cx + a * a * hasta.x,
    y: u * u * desde.y + 2 * u * a * cy + a * a * hasta.y,
    /** Se ladea al soltarse y se endereza al llegar. */
    giro: Math.sin(a * Math.PI) * EL_PELUCHE.seLadea,
    /** 0 mientras todavía está en la luna, 1 ya sentado. */
    llegado: a,
  }
}

const entre = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
const suave = (t: number) => t * t * (3 - 2 * t)

/**
 * El peluche, sentado donde se le diga.
 *
 * `x` e `y` son donde apoya el fondillo, no su centro: así se lo puede
 * poner sobre la curva de la luna o sobre el caparazón sin tener que
 * saber cuánto mide.
 */
export function dibujarPelucheSentado(
  ctx: CanvasRenderingContext2D,
  retrato: HTMLImageElement,
  donde: { x: number; y: number; alto: number; giro?: number; alfa?: number },
) {
  const { x, y, alto } = donde
  // Los retratos son cuadrados, así que el ancho es el alto.
  const lado = alto

  ctx.save()
  ctx.globalAlpha = donde.alfa ?? 1
  ctx.translate(x, y)
  if (donde.giro) ctx.rotate(donde.giro)

  // Una sombrita debajo, aplastada. Sin ella el peluche queda pegado
  // encima de la luna como una calcomanía, que es exactamente lo que
  // pasaba con la tortuga hasta que se le puso la suya.
  ctx.save()
  ctx.fillStyle = 'rgba(40, 34, 22, 0.28)'
  ctx.beginPath()
  ctx.ellipse(0, -lado * 0.04, lado * 0.36, lado * 0.09, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.drawImage(retrato, -lado / 2, -lado, lado, lado)
  ctx.restore()
}

/**
 * Cuánto se bambolea el que está esperando arriba.
 *
 * Lo mismo que hace la luna, y por lo mismo: quieto del todo parece un
 * adorno pegado, y lo que tiene que parecer es que está esperando.
 */
export function elVaiven(reloj: number, quieto: boolean) {
  return quieto ? 0 : Math.sin(reloj * 1.1) * EL_PELUCHE.vaiven
}
