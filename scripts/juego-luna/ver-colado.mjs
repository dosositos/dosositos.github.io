/**
 * Le saca una foto al banco del colado.
 *
 *   npm run dev            (en otra terminal)
 *   node scripts/juego-luna/ver-colado.mjs
 *
 * Deja el PNG en private/notas/colado.png: el pato en sus cuatro
 * cuadros, al lado de la tortuga para ver el tamaño, y con ella parada
 * en su lomo, que es lo que pasa si salta igual.
 */
import { chromium } from 'playwright-core'

const nav = await chromium.launch({ channel: 'chrome' })
const pag = await nav.newPage({ viewport: { width: 1000, height: 800 }, deviceScaleFactor: 1 })

const fallos = []
pag.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('Failed to load resource')) fallos.push(m.text())
})
pag.on('pageerror', (e) => fallos.push(String(e)))

const puerto = process.argv[2] ?? 5173
await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/colado-banco.html`, {
  waitUntil: 'networkidle',
})

await pag.waitForSelector('#listo', { state: 'attached', timeout: 15000 })
const ficha = JSON.parse(await pag.locator('#listo').textContent())

await pag.locator('#lienzo').screenshot({ path: 'private/notas/colado.png' })
await nav.close()

console.log(`
  El colado
    mide ........ ${ficha.ancho} × ${ficha.alto}   (la tortuga, 30 × 50)
    el lomo ..... ${ficha.lomo} px por encima de la plataforma
    se cuela .... ${ficha.cuantos} veces por capítulo, ${ficha.msParado / 1000} s cada vez
`)

if (fallos.length) console.log('⚠ errores en la página:\n' + fallos.join('\n'))
console.log('foto en private/notas/colado.png')
process.exit(fallos.length ? 1 : 0)
