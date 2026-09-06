/**
 * Le saca fotos a la luna de la portada, que es la puerta del juego.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:puerta           → los tres estados, uno por foto
 *   npm run luna:puerta -- 5175   → si el servidor salió en otro puerto
 *
 * Lo que fotografía, en orden:
 *
 *  1. **Cerrada.** Sin haber encontrado a los peluches. Va metida en la
 *     esquina y asomada por el borde, y ahí está el equilibrio de toda
 *     esta parte: tiene que verse lo bastante como para dar ganas de
 *     tocarla —tocarla es lo que dispara el aviso— y lo bastante poco
 *     como para que encontrarla sea encontrarla.
 *  2. **El aviso**, que sale de tocarla cerrada. Son cuatro palabras y
 *     no dicen qué falta: eso lo descubre ella.
 *  3. **Abierta**, con los tres encontrados.
 *  4. **Llena**, que es como la va a ver después de subir. Sin línea
 *     debajo: si ya subió, ya sabe qué hay arriba.
 *  5. **El viaje**, la luna comiéndose la pantalla al entrar.
 *  6. **Encendiéndose sola**, sin recargar, en el momento de dar con el
 *     tercero. Ese es el que hay que mirar con más cuidado.
 *
 * Dos cosas que juzgar en las fotos. Si choca con algo: el botón del
 * tema va fijo arriba a la derecha y la luna anda por esa esquina. Y si
 * al recortarse por el borde la página saca barra de desplazamiento de
 * lado, que eso se comprueba solo aquí abajo.
 */
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const clave = readFileSync('.env', 'utf8')
  .match(/CLAVE_DOSOSITOS\s*=\s*(.+)/)[1]
  .trim()
  .replace(/^["']|["']$/g, '')

const RAIZ = `http://localhost:${process.argv[2] ?? 5173}`

const nav = await chromium.launch({ channel: 'chrome' })

const fallos = []

/**
 * Abre la portada con lo que se le siembre en el teléfono.
 *
 * `addInitScript` corre antes que la página, que es la única manera de
 * que el estado ya esté puesto cuando React lee `localStorage` al
 * montar. Escribiéndolo después habría que recargar.
 */
async function abrirPortada(sembrar) {
  const pag = await nav.newPage({
    // un teléfono parecido al de ella
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  pag.on('pageerror', (e) => fallos.push(String(e)))

  if (sembrar) await pag.addInitScript(sembrar)

  await pag.goto(RAIZ, { waitUntil: 'domcontentloaded' })
  const candado = pag.locator('input').first()
  await candado.waitFor()
  await candado.fill(clave)
  await candado.press('Enter')
  await pag.waitForSelector('main')
  // El encabezado entra con su animación y la luna deriva desde fuera
  // de cuadro: sin esperar, la foto la agarra a medio llegar. La luna
  // arranca en 0,9 y tarda 1,5, así que 2,6 es con margen.
  await pag.waitForTimeout(2600)
  return pag
}

/**
 * La tira de cómo entra la luna, cuadro por cuadro.
 *
 * Todo lo demás de la portada tiene animación de entrada y la luna
 * estaba puesta desde el primer cuadro, que al lado de lo otro se veía
 * pegada. Ahora deriva desde fuera de cuadro, y esto es lo único que
 * puede decir si deriva bien o si pega un tirón: en una sola foto una
 * animación no se ve.
 *
 * Se recorta la esquina de arriba a la derecha, que es donde vive.
 */
async function laEntrada() {
  const pag = await nav.newPage({
    viewport: { width: 412, height: 892 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  pag.on('pageerror', (e) => fallos.push(String(e)))
  await pag.addInitScript(() => {
    localStorage.setItem('dosositos:peluches:los-tres', '250')
  })

  await pag.goto(RAIZ, { waitUntil: 'domcontentloaded' })
  const candado = pag.locator('input').first()
  await candado.waitFor()
  await candado.fill(clave)
  await candado.press('Enter')
  await pag.waitForSelector('main')

  // Donde vive la luna: pegada al borde derecho, debajo del regalo.
  // Se recorta ancho a la izquierda porque entra desde más afuera y
  // hay que verla llegar, no verla ya puesta.
  const esquina = { x: 250, y: 400, width: 162, height: 220 }
  const cuando = [0, 700, 1100, 1500, 1900, 2600]
  let ultimo = 0
  for (const ms of cuando) {
    await pag.waitForTimeout(ms - ultimo)
    ultimo = ms
    await pag.screenshot({ path: `private/notas/puerta-0-entra-${ms}.png`, clip: esquina })
  }

  await pag.close()
  console.log(`✓ la entrada de la luna, en ${cuando.length} cuadros`)
}

/* ── 0 · Cómo entra ──────────────────────────────────────────────── */

await laEntrada()

/* ── 1 y 2 · Cerrada, y el aviso de tocarla ──────────────────────── */

let pag = await abrirPortada()
await pag.screenshot({ path: 'private/notas/puerta-1-cerrada.png' })

await pag.getByRole('button', { name: 'la luna' }).click()
await pag.waitForTimeout(700)
await pag.screenshot({ path: 'private/notas/puerta-2-aviso.png' })

const dijoQueNo = (await pag.evaluate(() => document.body.innerText)).includes(
  'aún te falta algo',
)
const seFue = pag.url().includes('/luna')
console.log(dijoQueNo ? '✓ cerrada avisa en vez de abrir' : '⚠ cerrada no avisó nada')
console.log(seFue ? '⚠ SE ABRIÓ SIN LOS PELUCHES' : '✓ cerrada no lleva a ningún lado')
/* Y que meterla en la esquina no haya sacado barra de lado. Una web
   que se mueve de costado al tocarla se siente rota, y es justo lo que
   pasa si el disco se sale de la página en vez de recortarse. */
const seMueveDeLado = await pag.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
)
console.log(
  seMueveDeLado ? '⚠ LA PÁGINA SE MUEVE DE LADO' : '✓ no saca barra de desplazamiento de lado',
)
await pag.close()

/* ── 3 · Abierta, con los tres encontrados ───────────────────────── */

pag = await abrirPortada(() => {
  localStorage.setItem('dosositos:peluches:los-tres', '250')
})
await pag.screenshot({ path: 'private/notas/puerta-3-abierta.png' })
await pag.close()

/* ── El momento: se enciende sola, sin recargar ──────────────────
   Lo más frágil de toda la puerta. Ella va a encontrar al tercero en la
   portada misma, con la luna ahí arriba, y si para verla encendida
   hiciera falta recargar la página el momento se perdería entero.

   Se siembran los tres hijos como encontrados pero sin la llave de la
   luna, que es exactamente el estado en que queda el teléfono en el
   instante de tocar al tercero: el componente de los peluches anota, y
   la luna tiene que enterarse sola. */

pag = await abrirPortada(() => {
  localStorage.setItem('dosositos:peluches', JSON.stringify(['nico', 'ovi', 'boo']))
})
// Encontrar al tercero saca el resumen de los peluches, que tapa la
// pantalla entera. Hay que cerrarlo para ver la luna, y eso mismo es lo
// que va a hacer ella: el momento de la luna encendida no pasa al tocar
// al tercero, pasa al cerrar el cartel.
await pag.waitForTimeout(1200)
const resumen = pag.getByRole('button', { name: 'que duerman hasta mañana' })
if (await resumen.count()) await resumen.click()
// La luna tarda 1,6 s en encenderse del todo, que es a propósito.
await pag.waitForTimeout(2000)
await pag.screenshot({ path: 'private/notas/puerta-6-se-enciende.png' })
const llave = await pag.evaluate(() => localStorage.getItem('dosositos:peluches:los-tres'))
console.log(llave ? '✓ se abrió sola al tener los tres' : '⚠ no se abrió con los tres encontrados')
await pag.close()

/* ── 4 · Llena, después de haber subido los tres capítulos ───────── */

pag = await abrirPortada(() => {
  localStorage.setItem('dosositos:peluches:los-tres', '250')
  // Con `llegadas` y no con `capitulo`: al pisar la luna el juego se
  // reinicia para poder volver a subir, así que lo que deja la luna
  // llena es haber llegado, no por dónde va ahora.
  localStorage.setItem(
    'dosositos:luna',
    JSON.stringify({
      capitulo: 0,
      cumbre: 3,
      llegadas: 1,
      escuelita: 'hecha',
      pasitos: 0,
      caidas: 0,
      nombre: 'Manchita',
    }),
  )
})
await pag.screenshot({ path: 'private/notas/puerta-4-llena.png' })

/* ── Y que la puerta de verdad lleve al juego ────────────────────── */

await pag.getByRole('button', { name: /^la luna/ }).click()
// El círculo que se come la pantalla dura 780 ms y recién después
// navega. Esperar menos es fotografiar el viaje, no la llegada.
await pag.waitForTimeout(500)
await pag.screenshot({ path: 'private/notas/puerta-5-viaje.png' })
await pag.waitForTimeout(1600)
console.log(
  pag.url().includes('/luna') ? '✓ abierta lleva al juego' : '⚠ abierta no llevó a ningún lado',
)

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
await nav.close()
