/**
 * Le saca fotos a lo nuevo de antes de jugar: la historia y la
 * escuelita.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:antes            → los nueve cuadros y las siete clases
 *   npm run luna:antes -- 5175    → si el servidor salió en otro puerto
 *
 * Son dos cosas que pasan una sola vez y que se leen bajando con el
 * pulgar, así que lo que hay que juzgar en las fotos es de teléfono:
 *
 *  1. **La historia.** Que la línea del cuadro no le quede encima a la
 *     tortuga, que la luna suba de verdad de un cuadro al otro, y que
 *     los tres peluches se le vean trepados al caparazón y no
 *     flotando al lado.
 *  2. **La escuelita.** Que el cartel de arriba quepa sin taparle las
 *     plataformas, y sobre todo que en cada clase se vea lo que la
 *     clase enseña: la pista parpadeando, la caja inclinada, la
 *     almohada hundida.
 *
 * Y de paso comprueba dos cosas que sí tienen respuesta y que no se
 * pueden ver en una foto: que la historia lleve al bautizo la primera
 * vez, y que **la escuelita no vuelva a salir** en la segunda.
 */
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const clave = readFileSync('.env', 'utf8')
  .match(/CLAVE_DOSOSITOS\s*=\s*(.+)/)[1]
  .trim()
  .replace(/^["']|["']$/g, '')

const RAIZ = `http://localhost:${process.argv[2] ?? 5173}`

const nav = await chromium.launch({ channel: 'chrome' })

const fallos = []
const mal = (linea) => {
  fallos.push(linea)
  console.log('⚠ ' + linea)
}

/** Abre `/luna` con lo que se le siembre en el teléfono. */
async function abrirLaLuna(sembrar) {
  const pag = await nav.newPage({
    // un teléfono parecido al de ella
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  pag.on('pageerror', (e) => fallos.push(String(e)))

  if (sembrar) await pag.addInitScript(sembrar)

  await pag.goto(`${RAIZ}/#/luna`, { waitUntil: 'domcontentloaded' })
  const candado = pag.locator('input').first()
  await candado.waitFor()
  await candado.fill(clave)
  await candado.press('Enter')
  // A esperar a que el candado se vaya de verdad. Con un temporizador
  // suelto, el descifrado de la puerta a veces no había terminado y el
  // banco leía la pantalla del candado creyendo que era la historia.
  await candado.waitFor({ state: 'detached', timeout: 15000 })
  await pag.waitForTimeout(1600)
  return pag
}

/**
 * Lo que se lee en la pantalla, en minúscula.
 *
 * En minúscula porque el título de la historia va con `uppercase` de
 * CSS y `innerText` devuelve lo que se ve, no lo que está escrito:
 * buscando «Por qué una tortuga» tal cual, el banco decía que la
 * historia no salía mientras la historia estaba en la pantalla.
 */
const texto = async (pag) =>
  (await pag.evaluate(() => document.body.innerText)).toLowerCase()

/* ── 1 · La historia, cuadro por cuadro ──────────────────────────
   Sin sembrar nada: es exactamente lo que va a ver ella la primera vez
   que toque la luna de la portada. */

let pag = await abrirLaLuna()

if (!(await texto(pag)).includes('por qué una tortuga')) {
  mal('la primera pantalla no es la historia')
}

// Los cuadros del cuento. Se toca en el medio de la pantalla para
// pasar de uno al otro, que es lo que va a hacer ella con el pulgar.
// Se esperan tres segundos en cada uno para que a los que se trepan al
// caparazón les dé tiempo de subirse antes de la foto.
const CUADROS = 11
for (let i = 1; i <= CUADROS; i += 1) {
  await pag.waitForTimeout(3000)
  await pag.screenshot({ path: `private/notas/historia-${String(i).padStart(2, '0')}.png` })
  if (i < CUADROS) await pag.mouse.click(206, 500)
}

// Y el último cuadro tiene que dejarla en el bautizo, que es el remate:
// termina en «todavía no tiene nombre» y de ahí se pasa a ponérselo.
await pag.mouse.click(206, 500)
await pag.waitForTimeout(1200)
await pag.screenshot({ path: 'private/notas/historia-10-bautizo.png' })
console.log(
  (await texto(pag)).includes('cómo se llama')
    ? '✓ la historia termina en el bautizo'
    : '⚠ la historia no lleva al bautizo',
)
if (!(await texto(pag)).includes('cómo se llama')) fallos.push('historia sin bautizo')

/* ── 2 · Y del bautizo a la escuelita ───────────────────────────── */

await pag.getByRole('button', { name: 'mejor después' }).click()
await pag.waitForTimeout(1200)
await pag.screenshot({ path: 'private/notas/escuelita-00-portada.png' })

if (!(await texto(pag)).includes('la escuelita')) {
  mal('después del bautizo no viene la escuelita')
}

/* ── 3 · Las siete clases ────────────────────────────────────────
   No se juegan: se fotografía cada una desde su primer cuadro, que es
   donde se ve si el cartel de arriba deja ver las plataformas. Para
   pasar de una a la otra se usa el botón de saltar del final, que no
   existe — así que se recarga sembrando la clase, que es más honesto
   que fingir que se jugó. */

await pag.getByRole('button', { name: 'empezar la escuelita' }).click()
await pag.waitForTimeout(1500)
await pag.screenshot({ path: 'private/notas/escuelita-01-soltar.png' })

// La primera clase se pasa de un salto, y de ahí la cadena sigue sola:
// se dan saltos con la barra espaciadora y se va fotografiando lo que
// haya cada dos segundos. No es un guion, es mirarla andar.
for (let i = 2; i <= 8; i += 1) {
  for (let s = 0; s < 6; s += 1) {
    await pag.keyboard.down('Space')
    await pag.waitForTimeout(320 + s * 90)
    await pag.keyboard.up('Space')
    await pag.waitForTimeout(1100)
  }
  await pag.screenshot({ path: `private/notas/escuelita-${String(i).padStart(2, '0')}.png` })
}

const guardado = await pag.evaluate(() => localStorage.getItem('dosositos:luna'))
console.log('   lo guardado al salir: ' + guardado)

await pag.close()

/* ── 4 · La segunda vez: historia sí, escuelita no ───────────────
   Es la comprobación que más importa de todo este banco. La escuelita
   se ofrece una sola vez por teléfono, y si volviera a salir cada vez
   que ella entra al juego sería lo primero que la haría cerrarlo. */

pag = await abrirLaLuna(() => {
  localStorage.setItem(
    'dosositos:luna',
    JSON.stringify({
      capitulo: 0,
      cumbre: 3,
      llegadas: 1,
      escuelita: 'hecha',
      pasitos: 0,
      caidas: 0,
      mejorPorCapitulo: { 1: { pasitos: 31, caidas: 2 } },
      nombre: 'Manchita',
      puesto: {},
    }),
  )
})

const segunda = await texto(pag)
console.log(
  segunda.includes('por qué una tortuga')
    ? '✓ volviendo a empezar, la historia sale otra vez'
    : '⚠ volviendo a empezar no sale la historia',
)
if (!segunda.includes('por qué una tortuga')) fallos.push('sin historia al volver')

await pag.screenshot({ path: 'private/notas/historia-11-segunda-vez.png' })

// El último cuadro, que con nombre puesto tiene que nombrarla.
for (let i = 0; i < 10; i += 1) {
  await pag.mouse.click(206, 500)
  await pag.waitForTimeout(700)
}
await pag.waitForTimeout(1200)
await pag.screenshot({ path: 'private/notas/historia-12-con-nombre.png' })
const ultimo = await texto(pag)
console.log(
  ultimo.includes('manchita')
    ? '✓ con nombre puesto, el último cuadro la nombra'
    : '⚠ el último cuadro sigue diciendo que no tiene nombre',
)

// Y de ahí al cartel de Boo, sin pasar por la escuelita.
await pag.mouse.click(206, 500)
await pag.waitForTimeout(1400)
const despues = await texto(pag)
console.log(
  despues.includes('la escuelita')
    ? '⚠ LA ESCUELITA VOLVIÓ A SALIR'
    : '✓ la escuelita no vuelve a salir',
)
if (despues.includes('la escuelita')) fallos.push('escuelita repetida')

console.log(
  despues.includes('capítulo uno')
    ? '✓ empieza de nuevo por el capítulo de Boo'
    : '⚠ no entró por el capítulo uno',
)

// Y el cartel de Boo, ya sin el manual encima: eso es lo que la
// escuelita le vino a quitar.
await pag.screenshot({ path: 'private/notas/escuelita-09-cartel-de-boo.png' })

/* ── 5 · Y que detrás del cartel haya juego ──────────────────────
   La comprobación que faltaba, y la que se pagó cara. La historia y la
   escuelita se van con su propio `return`, así que mientras están
   puestas el canvas del capítulo no existe; al volver hay que montar el
   motor otra vez. Sin eso la pantalla queda en negro desde el cartel de
   Boo en adelante, y no se nota mirando el cartel: el cartel se pinta
   igual, con el negro detrás.

   Se mira el canvas de verdad, contando cuántos píxeles distintos del
   fondo tiene. Un canvas al que no pinta nadie sale de un solo color. */

async function pintaAlgo() {
  return pag.evaluate(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return 'no hay canvas'
    const ctx = canvas.getContext('2d')
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    const colores = new Set()
    for (let i = 0; i < d.length; i += 4 * 997) {
      colores.add(`${d[i]},${d[i + 1]},${d[i + 2]},${d[i + 3]}`)
    }
    return colores.size
  })
}

const antesDeEmpezar = await pintaAlgo()
console.log(
  typeof antesDeEmpezar === 'number' && antesDeEmpezar > 3
    ? `✓ detrás del cartel de Boo hay cielo pintado (${antesDeEmpezar} colores)`
    : `⚠ DETRÁS DEL CARTEL NO HAY NADA: ${antesDeEmpezar}`,
)
if (!(typeof antesDeEmpezar === 'number' && antesDeEmpezar > 3)) {
  fallos.push('pantalla en negro detrás del cartel')
}

// Y lo mismo pasando por el ropero, que es el camino más largo hasta el
// cartel y por donde se vio la primera vez.
await pag.getByRole('button', { name: /ropero|vestir|ponerle/i }).first().click()
await pag.waitForTimeout(1200)
await pag.screenshot({ path: 'private/notas/escuelita-10-ropero.png' })
await pag.getByRole('button', { name: /listo|cerrar|volver|así está/i }).first().click()
await pag.waitForTimeout(900)

await pag.getByRole('button', { name: 'subir con Boo' }).click()
await pag.waitForTimeout(2600)
await pag.screenshot({ path: 'private/notas/escuelita-11-jugando.png' })

const jugando = await pintaAlgo()
console.log(
  typeof jugando === 'number' && jugando > 3
    ? `✓ y el capítulo arranca pintando (${jugando} colores)`
    : `⚠ EL CAPÍTULO ARRANCA EN NEGRO: ${jugando}`,
)
if (!(typeof jugando === 'number' && jugando > 3)) fallos.push('capítulo en negro')
console.log(
  despues.includes('camina sola de un lado al otro')
    ? '⚠ el cartel de Boo sigue cargando el cómo se juega'
    : '✓ el cartel de Boo se quedó solo con Boo',
)

await pag.close()

console.log(fallos.length ? '\n⚠ ' + fallos.length + ' cosas que mirar:\n' + fallos.join('\n') : '\n✓ sin errores')
await nav.close()
