/**
 * Le saca una foto al banco de la carta.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:carta
 *
 * Deja el PNG en private/notas/carta.png. Va con relleno de los
 * mismos largos que la carta de verdad: las palabras están cifradas y
 * lo que se juzga acá es el maquetado en el teléfono, no el texto.
 */
import { chromium } from 'playwright-core'

const nav = await chromium.launch({ channel: 'chrome' })
const pag = await nav.newPage({ viewport: { width: 2220, height: 1000 }, deviceScaleFactor: 2 })

const fallos = []
pag.on('console', (m) => {
  if (m.type() === 'error') fallos.push(m.text())
})
pag.on('pageerror', (e) => fallos.push(String(e)))

const puerto = process.argv[2] ?? 5173
await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/carta-banco.html`, {
  waitUntil: 'domcontentloaded',
})
// La hoja sube con un respiro de 1,4 s: hay que esperarla entera.
await pag.waitForTimeout(4200)

await pag.locator('#banco').screenshot({ path: 'private/notas/carta.png' })

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
console.log('foto en private/notas/carta.png')
await nav.close()
