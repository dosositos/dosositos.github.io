/**
 * Le saca una foto al banco de poses de la tortuga.
 *
 *   npm run dev            (en otra terminal)
 *   node scripts/juego-luna/ver-tortuga.mjs
 *
 * Deja el PNG en private/notas/tortuga.png.
 */
import { chromium } from 'playwright-core'

const nav = await chromium.launch({ channel: 'chrome' })
const pag = await nav.newPage({ viewport: { width: 1400, height: 1100 }, deviceScaleFactor: 1 })

const fallos = []
pag.on('console', (m) => { if (m.type() === 'error') fallos.push(m.text()) })
pag.on('pageerror', (e) => fallos.push(String(e)))

const puerto = process.argv[2] ?? 5173
await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/tortuga-banco.html`, { waitUntil: 'networkidle' })
await pag.waitForTimeout(600)

const lienzo = pag.locator('#lienzo')
await lienzo.screenshot({ path: 'private/notas/tortuga.png' })

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
console.log('foto en private/notas/tortuga.png')
await nav.close()
