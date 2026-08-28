/**
 * Le saca una foto al banco de la pista.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:pista
 *
 * Deja el PNG en private/notas/pista.png. Es el hermano de
 * ver-tortuga.mjs: mirar el mundo sin tener que jugar hasta llegar
 * al tramo que se está tocando.
 */
import { chromium } from 'playwright-core'

const nav = await chromium.launch({ channel: 'chrome' })
const pag = await nav.newPage({ viewport: { width: 1140, height: 560 }, deviceScaleFactor: 2 })

const fallos = []
pag.on('console', (m) => {
  if (m.type() === 'error') fallos.push(m.text())
})
pag.on('pageerror', (e) => fallos.push(String(e)))

const puerto = process.argv[2] ?? 5173
await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/pista-banco.html`, {
  waitUntil: 'networkidle',
})
await pag.waitForTimeout(600)

await pag.locator('#tira').screenshot({ path: 'private/notas/pista.png' })

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
console.log('foto en private/notas/pista.png')
await nav.close()
