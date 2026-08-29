/**
 * Le saca una foto al banco del cuarto de Ovi.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:cajas
 *
 * Deja el PNG en private/notas/cajas.png. Es el hermano de
 * ver-pista.mjs: mirar el mundo sin tener que jugar hasta llegar a
 * la caja que se está tocando, y sobre todo poder mirar quieta una
 * caja cediendo, que jugando pasa en un cuarto de segundo.
 */
import { chromium } from 'playwright-core'

const nav = await chromium.launch({ channel: 'chrome' })
const pag = await nav.newPage({ viewport: { width: 2480, height: 1400 }, deviceScaleFactor: 2 })

const fallos = []
pag.on('console', (m) => {
  if (m.type() === 'error') fallos.push(m.text())
})
pag.on('pageerror', (e) => fallos.push(String(e)))

const puerto = process.argv[2] ?? 5173
await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/cajas-banco.html`, {
  waitUntil: 'networkidle',
})
await pag.waitForTimeout(600)

await pag.locator('#tira').screenshot({ path: 'private/notas/cajas.png' })

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
console.log('foto en private/notas/cajas.png')
await nav.close()
