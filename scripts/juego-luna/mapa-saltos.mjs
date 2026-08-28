/**
 * El mapa de los saltos: a qué distancia se puede aterrizar según
 * cuánto haya que subir.
 *
 *   node --import ./scripts/juego-luna/alias-luna.mjs scripts/juego-luna/mapa-saltos.mjs
 *
 * Sirve para armar niveles sin adivinar. Un salto no llega «hasta
 * donde alcanza»: tiene que estar *bajando* al pasar por la altura de
 * la plataforma, así que para cada subida hay una ventana de
 * distancias que funcionan, y fuera de esa ventana no hay carga que
 * valga.
 */

let ahora = 0
const FRAME = 1000 / 60
let pendiente = null
globalThis.performance = { now: () => ahora }
globalThis.requestAnimationFrame = (cb) => { pendiente = cb; return 1 }
globalThis.cancelAnimationFrame = () => { pendiente = null }

const { crearMotor } = await import('@/juego-luna/motor.ts')
const { SALTO, MUNDO } = await import('@/content/luna.ts')

const anchoReal = MUNDO.ancho
MUNDO.ancho = 9000

/** Dónde cae un salto de esta carga sobre una plataforma a esa subida. */
function dondeCae(carga, subida) {
  const abajo = { x: 0, y: 3000, ancho: 9000, indice: 0 }
  const arriba = { x: 0, y: 3000 - subida, ancho: 9000, indice: 1 }
  const nivel = {
    plataformas: [abajo, arriba],
    hitos: [],
    suelo: abajo.y,
    cima: arriba,
    salida: { x: 4500, y: abajo.y },
  }

  let e = null
  const motor = crearMotor({ nivel, pintar: (x) => { e = x }, alEvento: () => {} })
  motor.medirVista(6000)
  motor.iniciar()
  const frame = () => { ahora += FRAME; const cb = pendiente; pendiente = null; if (cb) cb(ahora); return e }

  frame()
  const x0 = e.x
  motor.presionar()
  const frames = Math.round((SALTO.msDeCarga * carga) / FRAME)
  for (let i = 0; i < frames; i += 1) frame()
  motor.soltar()

  for (let i = 0; i < 300; i += 1) {
    const escena = frame()
    if (i > 3 && escena.enSuelo) {
      // Dos frames más: la escena trae la posición interpolada para
      // dibujar, y en el frame del aterrizaje va unos píxeles por
      // encima de la plataforma.
      frame()
      const quieta = frame()
      motor.detener()
      // Aterrizó arriba solo si está a la altura de la de arriba.
      return Math.abs(quieta.y - arriba.y) < 1 ? Math.abs(quieta.x - x0) : null
    }
  }
  motor.detener()
  return null
}

console.log('\n  El mapa de los saltos')
console.log('  Para cada subida, a qué distancia de donde despegó puede caer.\n')
console.log('   sube    distancias que llegan    barra')
console.log('   ────    ─────────────────────    ─────')

for (let subida = 50; subida <= 150; subida += 10) {
  let min = Infinity
  let max = -Infinity
  let cargaMin = 1
  let cargaMax = 0
  for (let c = 0; c <= 40; c += 1) {
    const carga = c / 40
    const d = dondeCae(carga, subida)
    if (d === null) continue
    if (d < min) { min = d; cargaMin = carga }
    if (d > max) { max = d; cargaMax = carga }
  }
  if (max < 0) {
    console.log(`   ${String(subida).padStart(4)}    no se puede subir tanto`)
    continue
  }
  const centro = Math.round((min + max) / 2)
  console.log(
    `   ${String(subida).padStart(4)}    ${String(Math.round(min)).padStart(3)} a ${String(Math.round(max)).padStart(3)}  (cómodo: ${String(centro).padStart(3)})    ${Math.round(cargaMin * 100)}%–${Math.round(cargaMax * 100)}%`,
  )
}

MUNDO.ancho = anchoReal
console.log('')
