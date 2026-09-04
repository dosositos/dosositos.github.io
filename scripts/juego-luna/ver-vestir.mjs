/**
 * La pantalla del ropero, en el teléfono y de verdad.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:vestir
 *   npm run luna:vestir -- 5176   → si el servidor salió en otro puerto
 *
 * `npm run luna:ropero` enseña los dibujos; esto enseña la pantalla:
 * si las fichas caben de a dos en un teléfono, si lo bloqueado se lee
 * como bloqueado, y sobre todo si el retrato de arriba es lo bastante
 * grande como para que se note el cambio al tocar algo. Un ropero donde
 * no se ve lo que uno se pone no es un ropero.
 *
 * Se mira dos veces: recién llegada, con casi todo bajo llave, y con
 * los tres capítulos ganados y los récords igualados, que es cuando
 * está entero.
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

/** Abre el juego con el progreso que se le siembre y llega al cartel. */
async function abrirElCartel(progreso) {
  const pag = await nav.newPage({
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  pag.on('pageerror', (e) => fallos.push(String(e)))

  await pag.addInitScript((p) => {
    localStorage.setItem('dosositos:luna', JSON.stringify(p))
    // Los peluches, o la luna de la portada no deja pasar.
    localStorage.setItem('dosositos:peluches:los-tres', '250')
  }, progreso)

  await pag.goto(RAIZ, { waitUntil: 'domcontentloaded' })
  const candado = pag.locator('input').first()
  await candado.waitFor()
  await candado.fill(clave)
  await candado.press('Enter')
  await pag.waitForSelector('main')

  await pag.goto(`${RAIZ}/#/luna`, { waitUntil: 'domcontentloaded' })
  await pag.waitForTimeout(1200)
  return pag
}

/* ── 1 · Recién llegada: solo lo de salida ───────────────────────── */

let pag = await abrirElCartel({
  capitulo: 0,
  pasitos: 0,
  caidas: 0,
  mejorPorCapitulo: {},
  nombre: 'Manchita',
  puesto: {},
})

await pag.getByRole('button', { name: 'vestirla' }).click()
await pag.waitForTimeout(700)
await pag.screenshot({ path: 'private/notas/vestir-1-recien-llegada.png' })

// Ponerle algo y ver que el retrato cambia. Es lo único de esta
// pantalla que de verdad importa.
await pag.getByRole('button', { name: 'gorrito de fiesta' }).click()
await pag.getByRole('button', { name: 'lentes redondos' }).click()
await pag.getByRole('button', { name: 'corbatín' }).click()
await pag.waitForTimeout(600)
await pag.screenshot({ path: 'private/notas/vestir-2-puesto.png' })

const guardado = await pag.evaluate(() =>
  JSON.parse(localStorage.getItem('dosositos:luna')).puesto,
)
console.log(
  guardado.sombrero === 'gorrito' && guardado.cara === 'redondos' && guardado.cuello === 'corbatin'
    ? '✓ lo que se pone se guarda al instante'
    : `⚠ no se guardó bien lo puesto: ${JSON.stringify(guardado)}`,
)
await pag.close()

/* ── 2 · Con todo ganado ─────────────────────────────────────────── */

pag = await abrirElCartel({
  capitulo: 3,
  pasitos: 96,
  caidas: 0,
  // Igualados los tres récords (24, 30 y 30) y uno de ellos sin caerse.
  mejorPorCapitulo: {
    1: { pasitos: 24, caidas: 0 },
    2: { pasitos: 29, caidas: 2 },
    3: { pasitos: 30, caidas: 1 },
  },
  nombre: 'Manchita',
  puesto: { sombrero: 'corona', cuello: 'bufanda', caparazon: 'tulipan' },
})

await pag.getByRole('button', { name: 'vestirla' }).click()
await pag.waitForTimeout(700)
await pag.screenshot({ path: 'private/notas/vestir-3-todo-ganado.png', fullPage: true })

const bloqueadas = await pag.locator('button[disabled]').count()
console.log(
  bloqueadas === 0
    ? '✓ con todo ganado no queda nada bajo llave'
    : `⚠ quedan ${bloqueadas} cosas bajo llave con todo ganado`,
)

/* ── Y que lo puesto se vea jugando, no solo en el ropero ────────── */

await pag.getByRole('button', { name: 'así está bien' }).click()
await pag.waitForTimeout(400)
await pag.locator('button').filter({ hasText: /^subir con / }).click()
await pag.waitForTimeout(2600)
await pag.screenshot({ path: 'private/notas/vestir-4-jugando.png' })

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
await nav.close()
