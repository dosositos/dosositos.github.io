/**
 * Los retratos de los peluches: de la imagen recortada a mano al archivo
 * que usa la web.
 *
 *   fotos-originales/peluches/{id}-estampado.png   ← lo que entra
 *   src/assets/peluches/{id}.webp                  ← lo que sale
 *
 * Estos tres son la única excepción a «todas las fotos van cifradas»: son
 * los peluches, no ellos dos, y el guiño necesita que se asomen al
 * instante. Por eso salen a src/assets/ y viajan en el bundle.
 *
 * Hace tres cosas, en este orden:
 *
 *  1. Limpia el halo verde. Las imágenes se generan sobre fondo chroma
 *     verde y ningún quitafondos recorta perfecto: queda un borde de
 *     píxeles verdosos que sobre el fondo nocturno de la web se ve
 *     clarísimo. Se detectan por verde dominante y se les baja el alfa
 *     según cuán verdes sean, en vez de repintarlos: así el halo se
 *     desvanece en lugar de volverse un contorno de otro color. Solo se
 *     mira una franja pegada al contorno — el colado tiene la peluca
 *     verde, y mirando la imagen entera se quedaba pelado.
 *
 *  2. Recorta el aire y centra. Vienen con márgenes transparentes
 *     distintos y descentrados, y en la web van en cajas iguales: sin
 *     esto, uno se ve más chico que los otros por puro margen.
 *
 *  3. Achica a LADO px y guarda en WebP. En pantalla se ven a unos 40 px;
 *     LADO deja de sobra hasta para una pantalla de tres veces la
 *     densidad, y WebP con transparencia pesa una fracción del PNG.
 *
 * Correr con: npm run peluches:preparar
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import sharp from 'sharp'

const ENTRADA = 'fotos-originales/peluches'
const SALIDA = 'src/assets/peluches'
// El colado va en la lista aunque todavía no tenga imagen: el script
// avisa y sigue, y el día que aparezca su PNG entra sin tocar nada.
const IDS = ['ovi', 'boo', 'nico', 'dummy']

/** Lado del cuadro final, en píxeles. */
const LADO = 384

/** Aire alrededor del peluche, en fracción del lado. */
const MARGEN = 0.04

/**
 * A partir de cuánto verde de más se considera resto del fondo.
 * Los tres peluches son rosa, crema y negro: en ninguno el verde manda
 * sobre el rojo y el azul a la vez, así que el umbral puede ser bajo sin
 * riesgo de comerse color bueno.
 */
const UMBRAL_VERDE = 10

/** Verde de más a partir del cual el píxel se borra del todo. */
const VERDE_PLENO = 60

/**
 * Hasta qué distancia del contorno se busca halo, en píxeles.
 *
 * Fuera de esa franja no se toca nada, y por una razón concreta: el
 * colado tiene una peluca verde lima. Sin este límite, la primera
 * versión del limpiador —que miraba la imagen entera— le habría borrado
 * el pelo completo, porque el verde de la peluca es tan verde como el
 * del fondo. El halo del recorte vive pegado al borde; el color de un
 * peluche, no.
 */
const FRANJA_DEL_BORDE = 4

/**
 * Marca los píxeles que están a menos de FRANJA_DEL_BORDE del vacío.
 *
 * Se dilata la máscara de transparencia en dos pasadas —primero las
 * filas, después las columnas—, que da el mismo resultado que mirar un
 * cuadrado alrededor de cada píxel y cuesta muchísimo menos.
 */
function cercaDelContorno(data, ancho, alto, canales) {
  const vacio = new Uint8Array(ancho * alto)
  for (let px = 0; px < ancho * alto; px++) {
    if (data[px * canales + 3] < 8) vacio[px] = 1
  }

  const porFilas = new Uint8Array(ancho * alto)
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      const desde = Math.max(0, x - FRANJA_DEL_BORDE)
      const hasta = Math.min(ancho - 1, x + FRANJA_DEL_BORDE)
      for (let k = desde; k <= hasta; k++) {
        if (vacio[y * ancho + k]) {
          porFilas[y * ancho + x] = 1
          break
        }
      }
    }
  }

  const cerca = new Uint8Array(ancho * alto)
  for (let x = 0; x < ancho; x++) {
    for (let y = 0; y < alto; y++) {
      const desde = Math.max(0, y - FRANJA_DEL_BORDE)
      const hasta = Math.min(alto - 1, y + FRANJA_DEL_BORDE)
      for (let k = desde; k <= hasta; k++) {
        if (porFilas[k * ancho + x]) {
          cerca[y * ancho + x] = 1
          break
        }
      }
    }
  }

  return cerca
}

/** Quita el halo verde del borde. Devuelve el buffer crudo modificado. */
function limpiarVerde(data, ancho, alto, canales) {
  const cerca = cercaDelContorno(data, ancho, alto, canales)
  let tocados = 0

  for (let px = 0; px < ancho * alto; px++) {
    if (!cerca[px]) continue // el interior del peluche no se toca nunca

    const i = px * canales
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]]
    const alfa = data[i + 3]
    if (alfa === 0) continue

    const verdor = g - Math.max(r, b)
    if (verdor <= UMBRAL_VERDE) continue

    // Cuanto más verde, menos se queda. El chroma puro desaparece.
    const fuerza = Math.min(1, (verdor - UMBRAL_VERDE) / (VERDE_PLENO - UMBRAL_VERDE))
    data[i + 1] = Math.max(r, b) // el verde sobrante se aplana
    data[i + 3] = Math.round(alfa * (1 - fuerza))
    tocados++
  }

  return tocados
}

/** El rectángulo que ocupa lo que no es transparente. */
function recuadroOpaco(data, ancho, alto, canales) {
  let minX = ancho, minY = alto, maxX = -1, maxY = -1

  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < ancho; x++) {
      if (data[(y * ancho + x) * canales + 3] > 8) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < 0) return null
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
}

async function prepararUno(id) {
  const origen = `${ENTRADA}/${id}-estampado.png`
  if (!existsSync(origen)) {
    console.log(`  ⚠ ${id}: falta ${origen}`)
    return false
  }

  const { data, info } = await sharp(await readFile(origen))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const tocados = limpiarVerde(data, info.width, info.height, info.channels)

  const limpio = sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })

  const caja = recuadroOpaco(data, info.width, info.height, info.channels)
  if (!caja) {
    console.log(`  ⚠ ${id}: la imagen salió entera transparente`)
    return false
  }

  // El útil se deriva del margen ya redondeado, no al revés: si no, los
  // dos redondeos no cierran y el cuadro final sale de 383 px.
  const margen = Math.round(LADO * MARGEN)
  const util = LADO - margen * 2

  const final = await limpio
    .extract(caja)
    // `contain` y no `cover`: recortar por el lado largo le cortaría las
    // orejas al que sea más alto que ancho.
    .resize(util, util, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: margen,
      bottom: margen,
      left: margen,
      right: margen,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toBuffer()

  await writeFile(`${SALIDA}/${id}.webp`, final)

  const antes = (await readFile(origen)).length
  console.log(
    `  ✓ ${id.padEnd(5)} ${caja.width}x${caja.height} → ${LADO}x${LADO}` +
      `  ${(antes / 1024).toFixed(0)} KB → ${(final.length / 1024).toFixed(0)} KB` +
      `  (${tocados} px de halo verde limpiados)`,
  )
  return true
}

await mkdir(SALIDA, { recursive: true })
console.log('\nRetratos de los peluches:\n')

let hechos = 0
for (const id of IDS) {
  if (await prepararUno(id)) hechos++
}

console.log(`\n${hechos} de ${IDS.length} listos en ${SALIDA}/\n`)
if (hechos < IDS.length) process.exitCode = 1
