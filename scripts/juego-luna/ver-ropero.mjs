/**
 * El banco de la ropita: cada accesorio puesto, sin ganárselo jugando.
 *
 *   npm run dev            (en otra terminal)
 *   npm run luna:ropero
 *
 * Hace dos cosas. Primero comprueba, sin abrir nada, que el catálogo y
 * los dibujos calcen: cada `id` de `ROPERO` tiene que tener su dibujo en
 * `accesorios.ts` y cada regla tiene que poder cumplirse de verdad
 * jugando. Un accesorio que pide ganar un capítulo que no existe no se
 * ve mal, sencillamente no se gana nunca y nadie se entera.
 *
 * Después saca la foto, en private/notas/ropero.png.
 */
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright-core'

const CATALOGO = readFileSync('src/content/luna.ts', 'utf8')
const DIBUJOS = readFileSync('src/juego-luna/accesorios.ts', 'utf8')

/** Los `id` del catálogo, con su ranura, sacados del archivo tal cual. */
const accesorios = [...CATALOGO.matchAll(/id: '([a-z]+)',\s*\n\s*ranura: '([a-z]+)'/g)].map(
  ([, id, ranura]) => ({ id, ranura }),
)

const quejas = []

if (accesorios.length === 0) quejas.push('no se encontró ningún accesorio en el catálogo')

for (const { id, ranura } of accesorios) {
  // Los caparazones no se dibujan, se pintan: su `id` tiene que estar
  // en la tabla de colores. Los demás se buscan por su rama del dibujo.
  const tiene =
    ranura === 'caparazon'
      ? new RegExp(`^\\s+${id}: \\{ base:`, 'm').test(DIBUJOS)
      : DIBUJOS.includes(`id === '${id}'`)
  if (!tiene) quejas.push(`«${id}» está en el catálogo y no tiene dibujo en accesorios.ts`)
}

/* Las reglas: que cada una se pueda cumplir con los capítulos que hay
   escritos y con los récords que están puestos. */
const capitulos = [...CATALOGO.matchAll(/^const (BOO|OVI|NICO): CapituloEscrito/gm)].length
const records = [...CATALOGO.matchAll(/^\s+record: \d+,/gm)].length

for (const [, cual] of CATALOGO.matchAll(/llave: \{ como: 'capitulo', cual: (\d+) \}/g)) {
  if (Number(cual) > capitulos) quejas.push(`se pide el capítulo ${cual} y solo hay ${capitulos}`)
}
for (const [, cuantos] of CATALOGO.matchAll(/llave: \{ como: 'records', cuantos: (\d+) \}/g)) {
  if (Number(cuantos) > records) {
    quejas.push(`se piden ${cuantos} récords igualados y solo hay ${records} récords puestos`)
  }
}

console.log(
  quejas.length
    ? '⚠ el ropero no calza:\n  ' + quejas.join('\n  ')
    : `✓ ${accesorios.length} accesorios, todos con dibujo y todos alcanzables`,
)

const nav = await chromium.launch({ channel: 'chrome' })
const pag = await nav.newPage({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 1 })

const fallos = []
pag.on('console', (m) => {
  if (m.type() === 'error') fallos.push(m.text())
})
pag.on('pageerror', (e) => fallos.push(String(e)))

const puerto = process.argv[2] ?? 5173
await pag.goto(`http://localhost:${puerto}/scripts/juego-luna/ropero-banco.html`, {
  waitUntil: 'networkidle',
})
await pag.waitForTimeout(600)

await pag.locator('#lienzo').screenshot({ path: 'private/notas/ropero.png' })

console.log(fallos.length ? '⚠ errores:\n' + fallos.join('\n') : '✓ sin errores en la página')
console.log('foto en private/notas/ropero.png')
await nav.close()
