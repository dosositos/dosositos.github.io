/**
 * Le saca una foto al banco de lo que cae.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:cae
 *
 * Deja el PNG en private/notas/cae.png. Es el hermano de ver-pista.mjs,
 * ver-cajas.mjs y ver-almohadas.mjs, y hace falta por dos motivos:
 * jugando no cae nada hasta pasada la primera estrella, y lo que hay
 * que juzgar es si los dos objetos se entienden solos —el apurón
 * diciendo «rápido» y el apagón diciendo «se apaga»— encima de los tres
 * mundos, con la cabeza puesta en el salto siguiente.
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
await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/cae-banco.html`, {
  waitUntil: 'networkidle',
})
await pag.waitForTimeout(600)

await pag.locator('#tira').screenshot({ path: 'private/notas/cae.png' })

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
console.log('foto en private/notas/cae.png')
await nav.close()
