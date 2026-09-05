/**
 * Le saca una foto al banco de los sonidos, escribe la tabla, y después
 * se mete al juego a comprobar que suenan de verdad.
 *
 *   npm run dev            (en otra terminal)
 *   node scripts/juego-luna/ver-sonidos.mjs
 *
 * Deja el PNG en private/notas/sonidos.png y avisa, con nombre y
 * apellido, de cualquier sonido que se pase de largo, que raspe o que
 * termine chasqueando.
 *
 * La foto es para mirar la forma. Lo que decide si algo está mal son
 * los números, y esos los mide el banco sobre el sonido ya grabado, no
 * sobre lo que dice la receta.
 *
 * **Y la segunda mitad es la que importa.** Un banco que solo se mira a
 * sí mismo diría que los nueve sonidos están perfectos aunque nadie los
 * llamara nunca desde el juego. Así que después entra a `/#/luna`, da
 * saltos con el sonido encendido y cuenta cuántos osciladores se
 * crearon de verdad; y vuelve a entrar con el sonido apagado para
 * comprobar lo contrario, que es la promesa entera: apagado de fábrica
 * es que la Web Audio API no se toca ni una vez.
 */
import { existsSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const RAIZ = `http://localhost:${process.argv[2] ?? 5173}`

const nav = await chromium.launch({ channel: 'chrome' })
const pag = await nav.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 1 })

const fallos = []

/** Los mismos oídos para las tres pasadas: el banco y las dos del juego. */
function escuchar(pagina) {
  pagina.on('console', (m) => {
    // Los «failed to load resource» no cuentan: todas las páginas piden
    // un favicon que no existe y contestan 404, y eso no es un fallo.
    // Lo que sí cuenta es que reviente el código.
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) fallos.push(m.text())
  })
  pagina.on('pageerror', (e) => fallos.push(String(e)))
}

escuchar(pag)

await pag.goto(`${RAIZ}/scripts/juego-luna/sonidos-banco.html`, { waitUntil: 'networkidle' })

// El banco graba los nueve sonidos antes de escribir su resumen, así
// que se espera a que exista y no un rato al azar. `attached` y no
// `visible`: el resumen es un <script>, y un <script> no se ve nunca.
await pag.waitForSelector('#resumen', { state: 'attached', timeout: 15000 })
const resumen = JSON.parse(await pag.locator('#resumen').textContent())

await pag.locator('#lienzo').screenshot({ path: 'private/notas/sonidos.png' })
await pag.close()

for (const s of resumen) {
  const cabeza = `${s.comoSellama} (${s.evento})`
  if (s.ms === undefined) console.log(`  ${cabeza}`)
  else console.log(`  ${String(Math.round(s.ms)).padStart(4)} ms · pico ${s.pico} · ${cabeza}`)
  for (const queja of s.quejas) console.log(`         ⚠ ${queja}`)
}

let quejas = resumen.reduce((suma, s) => suma + s.quejas.length, 0)
console.log('')
console.log(quejas ? `⚠ ${quejas} cosa(s) que revisar` : '✓ los nueve sonidos, en su sitio')
console.log('foto en private/notas/sonidos.png')

const clave = existsSync('.env')
  ? readFileSync('.env', 'utf8')
      .match(/CLAVE_DOSOSITOS\s*=\s*(.+)/)?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, '')
  : undefined

/* ── Y ahora, el juego de verdad ─────────────────────────────────── */

/**
 * Entra al capítulo dos —el uno arrastra la historia y el bautizo—, da
 * saltos, y cuenta cuántos osciladores creó la página.
 *
 * Se cuentan osciladores y no llamadas a `sonar`, a propósito. La
 * llamada la puedo poner yo y no prueba nada; el oscilador solo existe
 * si el sonido llegó hasta el final del camino: interruptor encendido,
 * contexto despierto y receta armada.
 */
async function jugarConSonido(encendido) {
  const tel = await nav.newPage({
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  escuchar(tel)

  await tel.addInitScript((quiere) => {
    localStorage.setItem('dosositos:luna:sonido', quiere ? 'si' : 'no')
    localStorage.setItem(
      'dosositos:luna',
      JSON.stringify({ capitulo: 1, escuelita: 'hecha', nombre: 'Manchita' }),
    )

    // El contador. Va encima del AudioContext de verdad y no lo
    // reemplaza: si algo del camino estuviera roto, esto se daría
    // cuenta igual porque el error saldría del original.
    window.__sonidos = { contextos: 0, osciladores: 0 }
    const Original = window.AudioContext
    window.AudioContext = class extends Original {
      constructor(...args) {
        super(...args)
        window.__sonidos.contextos += 1
      }
      createOscillator() {
        window.__sonidos.osciladores += 1
        return super.createOscillator()
      }
    }
  }, encendido)

  await tel.goto(RAIZ, { waitUntil: 'domcontentloaded' })
  const candado = tel.locator('input').first()
  await candado.waitFor()
  await candado.fill(clave)
  await candado.press('Enter')
  await tel.waitForSelector('main')

  await tel.goto(`${RAIZ}/#/luna`, { waitUntil: 'domcontentloaded' })
  await tel.waitForTimeout(1200)

  // El interruptor está en el cartel del capítulo, y tiene que decir
  // cómo está antes de tocar nada: eso es lo que se acordó del
  // localStorage.
  const dice = await tel.locator('button[aria-pressed]').first().innerText()

  await tel.locator('button').filter({ hasText: /^subir con / }).click()
  await tel.waitForTimeout(500)

  for (let i = 0; i < 8; i += 1) {
    await tel.keyboard.down('Space')
    await tel.waitForTimeout(380 + (i % 5) * 70)
    await tel.keyboard.up('Space')
    await tel.waitForTimeout(500)
  }

  const contado = await tel.evaluate(() => window.__sonidos)
  await tel.close()
  return { dice, ...contado }
}

console.log('')
if (!clave) {
  console.log('· sin CLAVE_DOSOSITOS en .env no se puede entrar al juego: solo se miró el banco')
} else {
  const prendido = await jugarConSonido(true)
  const apagado = await jugarConSonido(false)

  console.log(`  encendido: ${prendido.osciladores} osciladores · el botón dice «${prendido.dice}»`)
  console.log(`  apagado:   ${apagado.osciladores} osciladores · el botón dice «${apagado.dice}»`)

  if (prendido.osciladores === 0) {
    quejas += 1
    console.log('⚠ con el sonido encendido el juego no tocó nada: los saltos no llegan a sonar')
  }
  if (apagado.contextos > 0) {
    quejas += 1
    console.log('⚠ apagado y aun así creó un AudioContext: eso ya no es apagado de fábrica')
  }
  if (!prendido.dice.includes('encendido') || !apagado.dice.includes('apagado')) {
    quejas += 1
    console.log('⚠ el interruptor no está diciendo cómo está')
  }
  if (quejas === 0) console.log('✓ suena jugando, y callado mientras esté apagado')
}

await nav.close()

if (fallos.length) console.log('⚠ errores en la página:\n' + fallos.join('\n'))
process.exit(quejas || fallos.length ? 1 : 0)
