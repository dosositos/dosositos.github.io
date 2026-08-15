/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  OPTIMIZADOR DE FOTOS                                            ║
 * ║                                                                  ║
 * ║  Toma las fotos pesadas de /fotos-originales y las deja livianas ║
 * ║  en /public/media, listas para la web.                           ║
 * ║                                                                  ║
 * ║  Uso:                                                            ║
 * ║    1. Poné las fotos en  fotos-originales/  (podés usar carpetas ║
 * ║       por año o por momento: fotos-originales/2024/...)          ║
 * ║    2. npm run fotos:optimizar                                    ║
 * ║                                                                  ║
 * ║  De cada foto saca 2 versiones AVIF (una grande y una miniatura) ║
 * ║  Una foto de 4 MB suele quedar en ~120 KB sin que se note.       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const RAIZ = path.resolve(import.meta.dirname, '..')
const ORIGEN = path.join(RAIZ, 'fotos-originales')
const DESTINO = path.join(RAIZ, 'public', 'media')

const ANCHO_GRANDE = 1400
const ANCHO_MINIATURA = 480
const CALIDAD = 62

if (!existsSync(ORIGEN)) {
  mkdirSync(ORIGEN, { recursive: true })
  console.log(`
  Creé la carpeta  fotos-originales/

  Meté ahí las fotos (podés organizarlas en subcarpetas) y volvé a correr:
    npm run fotos:optimizar
  `)
  process.exit(0)
}

const EXTENSIONES = /\.(jpe?g|png|webp|heic|avif|tiff?)$/i

function* recorrer(dir) {
  for (const entrada of readdirSync(dir)) {
    const completo = path.join(dir, entrada)
    if (statSync(completo).isDirectory()) yield* recorrer(completo)
    else if (EXTENSIONES.test(entrada)) yield completo
  }
}

const archivos = [...recorrer(ORIGEN)]
if (archivos.length === 0) {
  console.log('  No hay fotos en fotos-originales/. Metelas ahí y volvé a correr.')
  process.exit(0)
}

let pesoAntes = 0
let pesoDespues = 0
let hechas = 0

console.log(`\n  Optimizando ${archivos.length} fotos...\n`)

for (const archivo of archivos) {
  const relativo = path.relative(ORIGEN, archivo)
  const sinExt = relativo.replace(EXTENSIONES, '')
  const salidaGrande = path.join(DESTINO, `${sinExt}.avif`)
  const salidaMini = path.join(DESTINO, `${sinExt}.mini.avif`)

  mkdirSync(path.dirname(salidaGrande), { recursive: true })

  try {
    const original = sharp(archivo).rotate() // respeta la orientación EXIF

    await original
      .clone()
      .resize({ width: ANCHO_GRANDE, withoutEnlargement: true })
      .avif({ quality: CALIDAD, effort: 5 })
      .toFile(salidaGrande)

    await original
      .clone()
      .resize({ width: ANCHO_MINIATURA, withoutEnlargement: true })
      .avif({ quality: 50, effort: 4 })
      .toFile(salidaMini)

    pesoAntes += statSync(archivo).size
    pesoDespues += statSync(salidaGrande).size + statSync(salidaMini).size
    hechas++

    const ruta = sinExt.replace(/\\/g, '/')
    console.log(`    ✓ ${ruta}.avif`)
  } catch (e) {
    console.log(`    ✗ ${relativo} — ${e.message}`)
  }
}

const mb = (b) => (b / 1_048_576).toFixed(1)
console.log(`
  ✓ ${hechas} fotos listas en public/media

    Antes ....... ${mb(pesoAntes)} MB
    Después ..... ${mb(pesoDespues)} MB   (${Math.round((1 - pesoDespues / pesoAntes) * 100)}% menos)

  En momentos.ts referencialas así:
    fotos: [{ src: 'carpeta/nombre.avif', alt: 'descripción' }]
`)
