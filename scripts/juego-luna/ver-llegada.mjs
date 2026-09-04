/**
 * Le saca una foto al banco de la llegada.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:llegada
 *
 * Deja el PNG en private/notas/llegada.png. Es el hermano de
 * ver-cae.mjs y los tres bancos de mundo, y hace falta porque esto
 * pasa una sola vez en todo el juego —después de ganar los tres
 * capítulos— y dura nueve segundos que no se pueden parar.
 */
import { chromium } from 'playwright-core'

const nav = await chromium.launch({ channel: 'chrome' })
const pag = await nav.newPage({ viewport: { width: 2480, height: 1500 }, deviceScaleFactor: 2 })

const fallos = []
pag.on('console', (m) => {
  if (m.type() === 'error') fallos.push(m.text())
})
pag.on('pageerror', (e) => fallos.push(String(e)))

const puerto = process.argv[2] ?? 5173
await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/llegada-banco.html`, {
  waitUntil: 'networkidle',
})
await pag.waitForTimeout(600)

await pag.locator('#tira').screenshot({ path: 'private/notas/llegada.png' })

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
console.log('foto en private/notas/llegada.png')
await nav.close()
