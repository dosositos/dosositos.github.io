/**
 * Le saca fotos al juego andando de verdad.
 *
 *   npm run dev            (en otra terminal)
 *   node scripts/juego-luna/ver-luna.mjs [puerto]
 *
 * Juega solo: da unos cuantos saltos con la barra espaciadora y va
 * fotografiando. Sirve para ver la cámara, los hitos y el tamaño de
 * las cosas, que en el banco de poses no se pueden juzgar.
 */
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const clave = readFileSync('.env', 'utf8').match(/CLAVE_DOSOSITOS\s*=\s*(.+)/)[1].trim().replace(/^["']|["']$/g, '')
const RAIZ = `http://localhost:${process.argv[2] ?? 5173}`

const nav = await chromium.launch({ channel: 'chrome' })
// un teléfono parecido al de ella
const pag = await nav.newPage({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

const fallos = []
pag.on('pageerror', (e) => fallos.push(String(e)))

await pag.goto(RAIZ, { waitUntil: 'domcontentloaded' })
const candado = pag.locator('input').first()
await candado.waitFor()
await candado.fill(clave)
await candado.press('Enter')
await pag.waitForSelector('main')

await pag.goto(`${RAIZ}/#/luna`, { waitUntil: 'domcontentloaded' })
await pag.waitForTimeout(1200)
await pag.screenshot({ path: 'private/notas/luna-0-cartel.png' })

// El cartel de antes de empezar. Hasta que no se le da al botón, el
// dedo no hace nada y la tortuga solo camina de fondo.
await pag.getByRole('button', { name: 'a la luna' }).click()
await pag.waitForTimeout(600)
await pag.screenshot({ path: 'private/notas/luna-1-salida.png' })

/**
 * Un salto: aprieta la barra el tiempo que se le diga y suelta. Entre
 * medias va mirando el texto de la pantalla, que es donde salen los
 * carteles de arriba del canvas. El del lazo dura dos segundos y se
 * pierde si solo se fotografía al final.
 */
let vioElLazo = false
async function saltar(ms) {
  await pag.keyboard.down('Space')
  await pag.waitForTimeout(ms)
  await pag.keyboard.up('Space')
  for (let i = 0; i < 12; i += 1) {
    await pag.waitForTimeout(80)
    if (vioElLazo) continue
    const texto = await pag.evaluate(() => document.body.innerText)
    if (texto.includes('guardado aquí')) {
      vioElLazo = true
      await pag.screenshot({ path: 'private/notas/luna-4-aviso-lazo.png' })
    }
  }
}

// A ciegas se ve la cámara moviéndose, y con suerte pisa el primer
// lazo y cae el aviso. Que no lo pise no es un fallo del juego: el
// que comprueba que el nivel se puede pasar es `npm run luna:probar`,
// que sí calcula cada salto.
for (let i = 0; i < 20 && !vioElLazo; i += 1) await saltar(430 + (i % 7) * 80)
await pag.screenshot({ path: 'private/notas/luna-2-subiendo.png' })
console.log(vioElLazo ? '✓ pisó un lazo y salió el aviso' : '· esta vez no llegó a ningún lazo')

await pag.mouse.move(206, 500)
await pag.mouse.down()
await pag.waitForTimeout(700)
await pag.screenshot({ path: 'private/notas/luna-3-carga.png' })
await pag.mouse.up()

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
await nav.close()
