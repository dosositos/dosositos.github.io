/**
 * Le saca fotos al juego andando de verdad.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:ver              → el capítulo de Boo, desde el bautizo
 *   npm run luna:ver -- 5173 2    → el de Ovi, con Boo ya ganado
 *
 * Juega solo: da unos cuantos saltos con la barra espaciadora y va
 * fotografiando. Sirve para ver la cámara, los carteles y el tamaño
 * de las cosas en un teléfono de verdad, que es lo que en el banco de
 * poses y en el del mundo no se puede juzgar.
 */
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const clave = readFileSync('.env', 'utf8')
  .match(/CLAVE_DOSOSITOS\s*=\s*(.+)/)[1]
  .trim()
  .replace(/^["']|["']$/g, '')

const RAIZ = `http://localhost:${process.argv[2] ?? 5173}`

/** Qué capítulo se mira. Sin argumento, el primero. */
const cual = Number(process.argv[3]) || 1

const nav = await chromium.launch({ channel: 'chrome' })
// un teléfono parecido al de ella
const pag = await nav.newPage({
  viewport: { width: 412, height: 892 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})

/**
 * Para mirar un capítulo que no sea el primero hay que hacerle creer
 * al teléfono que ya ganó los de antes, porque el juego entra siempre
 * por el primero que falte. Y de paso se le pone nombre a la tortuga,
 * que si no la primera pantalla es la del bautizo.
 *
 * Para el capítulo uno no se siembra nada: así el bautizo sale en la
 * foto, que es la pantalla nueva y la que hay que mirar.
 */
if (cual > 1) {
  await pag.addInitScript((antes) => {
    localStorage.setItem(
      'dosositos:luna',
      JSON.stringify({ capitulo: antes, pasitos: 29, caidas: 4, nombre: 'Manchita' }),
    )
  }, cual - 1)
}

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

// El bautizo, que es la primera pantalla de todas y una sola vez en la
// vida. Detrás se ve la tortuga caminando, que es media respuesta.
if (cual === 1) {
  await pag.screenshot({ path: 'private/notas/luna-0-bautizo.png' })
  await pag.locator('input[type="text"]').fill('Manchita')
  await pag.getByRole('button', { name: 'así se llama' }).click()
  await pag.waitForTimeout(400)
}

await pag.screenshot({ path: `private/notas/luna-${cual}-0-cartel.png` })

// El cartel del capítulo. Hasta que no se le da al botón, el dedo no
// hace nada y la tortuga solo camina de fondo.
await pag.locator('button').filter({ hasText: /^subir con / }).click()
await pag.waitForTimeout(600)
await pag.screenshot({ path: `private/notas/luna-${cual}-1-salida.png` })

/**
 * Un salto: aprieta la barra el tiempo que se le diga y suelta. Entre
 * medias va mirando el texto de la pantalla, que es donde salen los
 * carteles de arriba del canvas. El de la estrella dura dos segundos y
 * se pierde si solo se fotografía al final.
 */
let vioLaEstrella = false
async function saltar(ms) {
  await pag.keyboard.down('Space')
  await pag.waitForTimeout(ms)
  await pag.keyboard.up('Space')
  for (let i = 0; i < 12; i += 1) {
    await pag.waitForTimeout(80)
    if (vioLaEstrella) continue
    const texto = await pag.evaluate(() => document.body.innerText)
    if (texto.includes('guardado aquí')) {
      vioLaEstrella = true
      await pag.screenshot({ path: `private/notas/luna-${cual}-4-aviso-estrella.png` })
    }
  }
}

// A ciegas se ve la cámara moviéndose, y con suerte pisa la primera
// estrella y cae el aviso. Que no la pise no es un fallo del juego: el
// que comprueba que el nivel se puede pasar es `npm run luna:probar`,
// que sí calcula cada salto.
for (let i = 0; i < 20 && !vioLaEstrella; i += 1) await saltar(430 + (i % 7) * 80)
await pag.screenshot({ path: `private/notas/luna-${cual}-2-subiendo.png` })
console.log(vioLaEstrella ? '✓ pisó una estrella y salió el aviso' : '· esta vez no llegó a ninguna')

await pag.mouse.move(206, 500)
await pag.mouse.down()
await pag.waitForTimeout(700)
await pag.screenshot({ path: `private/notas/luna-${cual}-3-carga.png` })
await pag.mouse.up()

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
await nav.close()
