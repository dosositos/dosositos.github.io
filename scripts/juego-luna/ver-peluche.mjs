/**
 * Le saca una foto al cierre de capítulo: el peluche bajando de la
 * luna al caparazón.
 *
 *   npm run dev            (en otra terminal)
 *   node scripts/juego-luna/ver-peluche.mjs
 *
 * Deja el PNG en private/notas/peluche.png, con los dos capítulos donde
 * esto pasa. En el tercero la luna no se va: se quedan los dos arriba,
 * y eso se mira con `npm run luna:llegada`.
 */
import { chromium } from 'playwright-core'

const nav = await chromium.launch({ channel: 'chrome' })
const pag = await nav.newPage({ viewport: { width: 2300, height: 1400 }, deviceScaleFactor: 1 })

const fallos = []
pag.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('Failed to load resource')) fallos.push(m.text())
})
pag.on('pageerror', (e) => fallos.push(String(e)))

const puerto = process.argv[2] ?? 5173
await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/peluche-banco.html`, {
  waitUntil: 'networkidle',
})

await pag.waitForSelector('#listo', { state: 'attached', timeout: 15000 })
const { cuadros } = JSON.parse(await pag.locator('#listo').textContent())

await pag.locator('#todo').screenshot({ path: 'private/notas/peluche.png' })
await nav.close()

console.log(`\n  ${cuadros} cuadros del cierre de capítulo`)
if (fallos.length) console.log('⚠ errores en la página:\n' + fallos.join('\n'))
console.log('  foto en private/notas/peluche.png\n')
process.exit(fallos.length ? 1 : 0)
