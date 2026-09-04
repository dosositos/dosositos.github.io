/**
 * Le saca fotos a la luna de la portada, que es la puerta del juego.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:puerta           → los tres estados, uno por foto
 *   npm run luna:puerta -- 5175   → si el servidor salió en otro puerto
 *
 * Lo que fotografía, en orden:
 *
 *  1. **Cerrada.** Sin haber encontrado a los peluches. Tiene que verse
 *     lo bastante como para dar ganas de tocarla, porque tocarla es lo
 *     que dispara el aviso.
 *  2. **El aviso**, que sale de tocarla cerrada. Que quepa en la
 *     pantalla y no se salga por el costado.
 *  3. **Abierta**, con los tres encontrados.
 *  4. **Llena**, que es como la va a ver después de subir.
 *  5. **El viaje**, la luna comiéndose la pantalla al entrar.
 *  6. **Encendiéndose sola**, sin recargar, en el momento de dar con el
 *     tercero. Ese es el que hay que mirar con más cuidado.
 *
 * Lo que hay que juzgar en las fotos es si choca con algo: el botón del
 * tema va fijo arriba a la derecha y la luna anda por esa esquina.
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

/**
 * Abre la portada con lo que se le siembre en el teléfono.
 *
 * `addInitScript` corre antes que la página, que es la única manera de
 * que el estado ya esté puesto cuando React lee `localStorage` al
 * montar. Escribiéndolo después habría que recargar.
 */
async function abrirPortada(sembrar) {
  const pag = await nav.newPage({
    // un teléfono parecido al de ella
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  pag.on('pageerror', (e) => fallos.push(String(e)))

  if (sembrar) await pag.addInitScript(sembrar)

  await pag.goto(RAIZ, { waitUntil: 'domcontentloaded' })
  const candado = pag.locator('input').first()
  await candado.waitFor()
  await candado.fill(clave)
  await candado.press('Enter')
  await pag.waitForSelector('main')
  // El encabezado entra con su animación y la luna flota: sin esperar,
  // la foto la agarra a medio aparecer.
  await pag.waitForTimeout(1400)
  return pag
}

/* ── 1 y 2 · Cerrada, y el aviso de tocarla ──────────────────────── */

let pag = await abrirPortada()
await pag.screenshot({ path: 'private/notas/puerta-1-cerrada.png' })

await pag.getByRole('button', { name: 'la luna' }).click()
await pag.waitForTimeout(700)
await pag.screenshot({ path: 'private/notas/puerta-2-aviso.png' })

const dijoQueNo = (await pag.evaluate(() => document.body.innerText)).includes('Todavía no')
const seFue = pag.url().includes('/luna')
console.log(dijoQueNo ? '✓ cerrada avisa en vez de abrir' : '⚠ cerrada no avisó nada')
console.log(seFue ? '⚠ SE ABRIÓ SIN LOS PELUCHES' : '✓ cerrada no lleva a ningún lado')
await pag.close()

/* ── 3 · Abierta, con los tres encontrados ───────────────────────── */

pag = await abrirPortada(() => {
  localStorage.setItem('dosositos:peluches:los-tres', '250')
})
await pag.screenshot({ path: 'private/notas/puerta-3-abierta.png' })
await pag.close()

/* ── El momento: se enciende sola, sin recargar ──────────────────
   Lo más frágil de toda la puerta. Ella va a encontrar al tercero en la
   portada misma, con la luna ahí arriba, y si para verla encendida
   hiciera falta recargar la página el momento se perdería entero.

   Se siembran los tres hijos como encontrados pero sin la llave de la
   luna, que es exactamente el estado en que queda el teléfono en el
   instante de tocar al tercero: el componente de los peluches anota, y
   la luna tiene que enterarse sola. */

pag = await abrirPortada(() => {
  localStorage.setItem('dosositos:peluches', JSON.stringify(['nico', 'ovi', 'boo']))
})
// Encontrar al tercero saca el resumen de los peluches, que tapa la
// pantalla entera. Hay que cerrarlo para ver la luna, y eso mismo es lo
// que va a hacer ella: el momento de la luna encendida no pasa al tocar
// al tercero, pasa al cerrar el cartel.
await pag.waitForTimeout(1200)
const resumen = pag.getByRole('button', { name: 'que duerman hasta mañana' })
if (await resumen.count()) await resumen.click()
// La luna tarda 1,6 s en encenderse del todo, que es a propósito.
await pag.waitForTimeout(2000)
await pag.screenshot({ path: 'private/notas/puerta-6-se-enciende.png' })
const llave = await pag.evaluate(() => localStorage.getItem('dosositos:peluches:los-tres'))
console.log(llave ? '✓ se abrió sola al tener los tres' : '⚠ no se abrió con los tres encontrados')
await pag.close()

/* ── 4 · Llena, después de haber subido los tres capítulos ───────── */

pag = await abrirPortada(() => {
  localStorage.setItem('dosositos:peluches:los-tres', '250')
  localStorage.setItem(
    'dosositos:luna',
    JSON.stringify({ capitulo: 3, pasitos: 96, caidas: 11, nombre: 'Manchita' }),
  )
})
await pag.screenshot({ path: 'private/notas/puerta-4-llena.png' })

/* ── Y que la puerta de verdad lleve al juego ────────────────────── */

await pag.getByRole('button', { name: /^la luna/ }).click()
// El círculo que se come la pantalla dura 780 ms y recién después
// navega. Esperar menos es fotografiar el viaje, no la llegada.
await pag.waitForTimeout(500)
await pag.screenshot({ path: 'private/notas/puerta-5-viaje.png' })
await pag.waitForTimeout(1600)
console.log(
  pag.url().includes('/luna') ? '✓ abierta lleva al juego' : '⚠ abierta no llevó a ningún lado',
)

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
await nav.close()
