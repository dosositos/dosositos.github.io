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
 * saltos, y cuenta lo que sonó de verdad.
 *
 * Se cuentan osciladores y canciones que el navegador aceptó tocar, no
 * llamadas a `sonar` ni a `arrancarMusica`. Las llamadas las puedo
 * poner yo y no prueban nada; un oscilador solo existe si el sonido
 * llegó hasta el final del camino, y una canción solo se da por sonando
 * cuando la promesa de `play()` resolvió — que es donde se cae si el
 * navegador todavía no daba por bueno el toque, o si el mp3 no se pudo
 * descifrar.
 *
 * `como` es 'defecto' (no se toca el localStorage, que es como lo va a
 * encontrar ella la primera vez) o 'apagado'.
 */
async function jugarConSonido(como) {
  const tel = await nav.newPage({
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  escuchar(tel)

  await tel.addInitScript((quiere) => {
    // En 'defecto' no se escribe nada aposta: lo que se está probando
    // es justamente qué pasa cuando ella nunca eligió.
    if (quiere === 'apagado') localStorage.setItem('dosositos:luna:sonido', 'no')
    localStorage.setItem(
      'dosositos:luna',
      JSON.stringify({ capitulo: 1, escuelita: 'hecha', nombre: 'Manchita' }),
    )

    // Los contadores. Van encima de lo de verdad y no lo reemplazan: si
    // algo del camino estuviera roto, esto se daría cuenta igual porque
    // el error saldría del original.
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

    window.__musica = { intentos: 0, sonando: 0, error: '', fuentes: [] }
    const tocarOriginal = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function (...args) {
      window.__musica.intentos += 1
      // Se guarda el elemento para poder adelantarle el reloj desde el
      // arnés: `new Audio()` no está en el DOM y no hay otra manera de
      // llegar a él. Y cada blob distinto es una canción distinta, que
      // es como se comprueba que el bucle cambió de una a otra.
      window.__musica.ultimo = this
      if (this.src && !window.__musica.fuentes.includes(this.src)) {
        window.__musica.fuentes.push(this.src)
      }
      const promesa = tocarOriginal.apply(this, args)
      promesa
        .then(() => {
          window.__musica.sonando += 1
        })
        .catch((e) => {
          window.__musica.error = String(e)
        })
      return promesa
    }
  }, como)

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

  // La primera canción se baja y se descifra entera antes de sonar, y
  // esa primera vez arrastra las 250.000 vueltas de PBKDF2 del lote.
  // Los ocho saltos suelen dar de sobra, pero no siempre.
  await tel.waitForTimeout(2500)

  // Y el bucle: esperar tres minutos y medio a que se acabe una canción
  // no es una prueba, es una siesta. Se le adelanta el reloj hasta el
  // final y se mira si entra otra, que es lo mismo que va a pasar en su
  // teléfono cuando llegue ahí sola.
  await tel.evaluate(() => {
    const a = window.__musica.ultimo
    if (a && Number.isFinite(a.duration)) a.currentTime = Math.max(0, a.duration - 0.4)
  })
  await tel.waitForTimeout(4000)

  // `ultimo` es un elemento del DOM y no cruza: se deja acá adentro.
  const contado = await tel.evaluate(() => ({
    ...window.__sonidos,
    musica: {
      intentos: window.__musica.intentos,
      sonando: window.__musica.sonando,
      error: window.__musica.error,
      distintas: window.__musica.fuentes.length,
    },
  }))
  await tel.close()
  return { dice, ...contado }
}

console.log('')
if (!clave) {
  console.log('· sin CLAVE_DOSOSITOS en .env no se puede entrar al juego: solo se miró el banco')
} else {
  const defecto = await jugarConSonido('defecto')
  const apagado = await jugarConSonido('apagado')

  const linea = (que, r) =>
    `  ${que.padEnd(9)} ${String(r.osciladores).padStart(2)} osciladores · ` +
    `${r.musica.distintas} canción(es) distintas · el botón dice «${r.dice}»`

  console.log(linea('de fábrica', defecto))
  console.log(linea('apagado', apagado))

  if (!defecto.dice.includes('encendido')) {
    quejas += 1
    console.log('⚠ de fábrica tiene que venir encendido, y el botón dice que no')
  }
  if (defecto.osciladores === 0) {
    quejas += 1
    console.log('⚠ de fábrica el juego no tocó nada: los saltos no llegan a sonar')
  }
  if (defecto.musica.sonando === 0) {
    quejas += 1
    console.log(
      `⚠ la música no arrancó (${defecto.musica.intentos} intento(s))` +
        (defecto.musica.error ? `: ${defecto.musica.error}` : ''),
    )
  } else if (defecto.musica.distintas < 2) {
    quejas += 1
    console.log('⚠ al acabarse la canción no entró la siguiente: el bucle se para en la primera')
  }
  if (apagado.contextos > 0) {
    quejas += 1
    console.log('⚠ apagado y aun así creó un AudioContext: apagado tiene que ser apagado')
  }
  if (apagado.musica.intentos > 0) {
    quejas += 1
    console.log('⚠ apagado y aun así intentó poner música')
  }
  if (!apagado.dice.includes('apagado')) {
    quejas += 1
    console.log('⚠ el interruptor no está diciendo cómo está')
  }
  if (quejas === 0) console.log('✓ suena de fábrica —pops y música—, y apagado no suena nada')
}

await nav.close()

if (fallos.length) console.log('⚠ errores en la página:\n' + fallos.join('\n'))
process.exit(quejas || fallos.length ? 1 : 0)
