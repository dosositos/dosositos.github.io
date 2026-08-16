/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  OPTIMIZADOR DE FOTOS                                            ║
 * ║                                                                  ║
 * ║  Toma las fotos pesadas de /fotos-originales y las deja livianas ║
 * ║  en  private/media/  — que git ignora.                           ║
 * ║                                                                  ║
 * ║  Ojo con eso: ANTES esto escribía en public/media/, o sea que    ║
 * ║  las fotos se publicaban en claro. Ahora ninguna foto sale del   ║
 * ║  repositorio sin cifrar: el paso siguiente (cifrar-medios.mjs)   ║
 * ║  las convierte en public/cifrado/media/*.bin, y corre solo       ║
 * ║  detrás de este script.                                          ║
 * ║                                                                  ║
 * ║  Uso:                                                            ║
 * ║    1. Poné las fotos en  fotos-originales/  (podés usar carpetas ║
 * ║       por año o por momento: fotos-originales/2024/...)          ║
 * ║    2. npm run fotos:optimizar                                    ║
 * ║                                                                  ║
 * ║  De cada foto saca 2 versiones AVIF (una grande y una miniatura) ║
 * ║  Una foto de 4 MB suele quedar en ~120 KB sin que se note.       ║
 * ║  Los videos se copian tal cual: no hay nada que optimizar sin    ║
 * ║  meter ffmpeg de por medio.                                      ║
 * ║                                                                  ║
 * ║  De paso anota el tamaño y el color promedio de cada foto en     ║
 * ║  private/media/indice.json. Eso viaja cifrado y sirve para que   ║
 * ║  la web reserve el hueco exacto mientras descifra, sin saltos.   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import {
  readdirSync,
  readFileSync,
  statSync,
  mkdirSync,
  existsSync,
  copyFileSync,
  writeFileSync,
} from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const forzar = process.argv.includes('--forzar')

const RAIZ = path.resolve(import.meta.dirname, '..')
const ORIGEN = path.join(RAIZ, 'fotos-originales')
const DESTINO = path.join(RAIZ, 'private', 'media')
const INDICE = path.join(DESTINO, 'indice.json')

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

const FOTOS = /\.(jpe?g|png|webp|heic|avif|tiff?)$/i
const VIDEOS = /\.(mp4|mov|webm)$/i

function* recorrer(dir) {
  for (const entrada of readdirSync(dir)) {
    const completo = path.join(dir, entrada)
    if (statSync(completo).isDirectory()) yield* recorrer(completo)
    else if (FOTOS.test(entrada) || VIDEOS.test(entrada)) yield completo
  }
}

const archivos = [...recorrer(ORIGEN)]
if (archivos.length === 0) {
  console.log('  No hay fotos en fotos-originales/. Metelas ahí y volvé a correr.')
  process.exit(0)
}

/**
 * El ancho y el alto de un mp4, sacados del átomo `tkhd`.
 *
 * Sin esto el video no tiene medidas y el reproductor salta cuando
 * termina de descifrarse. No vale la pena arrastrar ffmpeg solo para
 * leer dos números; si el archivo no trae un tkhd reconocible se
 * devuelve null y la web usa una proporción por defecto.
 */
function medirVideo(buffer) {
  const marca = buffer.indexOf('tkhd', 0, 'latin1')
  if (marca === -1) return null

  const version = buffer[marca + 4]
  // Tras el nombre: 1 byte de versión + 3 de banderas, después el bloque
  // de tiempos (el doble de largo en la versión 1), y por último 16 bytes
  // de campos varios + 36 de la matriz de transformación.
  const largoTiempos = version === 1 ? 32 : 20
  const fin = marca + 4 + 4 + largoTiempos + 16 + 36
  if (fin + 8 > buffer.length) return null

  // 16.16 en coma fija: los 16 bits altos son los pixeles.
  const ancho = buffer.readUInt32BE(fin) / 65536
  const alto = buffer.readUInt32BE(fin + 4) / 65536
  if (!ancho || !alto || ancho > 20000 || alto > 20000) return null

  return { ancho: Math.round(ancho), alto: Math.round(alto) }
}

/** '#3f2a1d' — el color promedio, para pintar el hueco mientras carga. */
async function colorPromedio(imagen) {
  const { data } = await imagen.clone().resize(1, 1, { fit: 'fill' }).raw().toBuffer({
    resolveWithObject: true,
  })
  const hex = (n) => n.toString(16).padStart(2, '0')
  return `#${hex(data[0])}${hex(data[1])}${hex(data[2])}`
}

let pesoAntes = 0
let pesoDespues = 0
const indice = {}

// Lo de la vuelta pasada. Reconvertir una foto que no cambió cuesta
// segundos y, peor, puede dar bytes distintos: el cifrado la daría por
// nueva y el repositorio se llenaría de cambios que no cambian nada.
const indicePrevio = existsSync(INDICE) ? JSON.parse(readFileSync(INDICE, 'utf8')) : {}
let reusadas = 0

const estaAlDia = (nombre, original) => {
  const ficha = indicePrevio[nombre]
  if (!ficha) return false

  const partes = [ficha.grande, ficha.mini].filter(Boolean).map((r) => path.join(DESTINO, r))
  if (partes.some((p) => !existsSync(p))) return false

  const nacimiento = statSync(original).mtimeMs
  return partes.every((p) => statSync(p).mtimeMs >= nacimiento)
}

console.log(`\n  Optimizando ${archivos.length} archivos...\n`)

for (const archivo of archivos) {
  const relativo = path.relative(ORIGEN, archivo)
  const nombre = relativo.replace(FOTOS, '').replace(VIDEOS, '').replace(/\\/g, '/')

  if (!forzar && estaAlDia(nombre, archivo)) {
    indice[nombre] = indicePrevio[nombre]
    reusadas++
    continue
  }

  try {
    if (VIDEOS.test(archivo)) {
      const salida = path.join(DESTINO, `${nombre}${path.extname(archivo)}`)
      mkdirSync(path.dirname(salida), { recursive: true })
      copyFileSync(archivo, salida)

      const medidas = medirVideo(await readFile(archivo))
      indice[nombre] = {
        tipo: 'video',
        mime: path.extname(archivo) === '.webm' ? 'video/webm' : 'video/mp4',
        grande: path.relative(DESTINO, salida).replace(/\\/g, '/'),
        ...(medidas ?? {}),
      }

      pesoAntes += statSync(archivo).size
      pesoDespues += statSync(salida).size
      console.log(`    ✓ ${nombre}  (video, copiado tal cual)`)
      continue
    }

    const salidaGrande = path.join(DESTINO, `${nombre}.avif`)
    const salidaMini = path.join(DESTINO, `${nombre}.mini.avif`)
    mkdirSync(path.dirname(salidaGrande), { recursive: true })

    // .rotate() respeta la orientación EXIF; sharp no copia el resto de
    // metadatos al convertir, así que la ubicación GPS y la hora exacta
    // de la foto se quedan fuera sin que haya que borrarlas.
    const original = sharp(archivo).rotate()

    // toFile devuelve el tamaño final, así que no hay que medir aparte.
    const info = await original
      .clone()
      .resize({ width: ANCHO_GRANDE, withoutEnlargement: true })
      .avif({ quality: CALIDAD, effort: 5 })
      .toFile(salidaGrande)

    await original
      .clone()
      .resize({ width: ANCHO_MINIATURA, withoutEnlargement: true })
      .avif({ quality: 50, effort: 4 })
      .toFile(salidaMini)

    indice[nombre] = {
      tipo: 'foto',
      mime: 'image/avif',
      ancho: info.width,
      alto: info.height,
      color: await colorPromedio(original),
      grande: path.relative(DESTINO, salidaGrande).replace(/\\/g, '/'),
      mini: path.relative(DESTINO, salidaMini).replace(/\\/g, '/'),
    }

    pesoAntes += statSync(archivo).size
    pesoDespues += statSync(salidaGrande).size + statSync(salidaMini).size
    console.log(`    ✓ ${nombre}  ${info.width}×${info.height}  ${indice[nombre].color}`)
  } catch (e) {
    console.log(`    ✗ ${relativo} — ${e.message}`)
  }
}

writeFileSync(INDICE, JSON.stringify(indice, null, 2), 'utf8')

const mb = (b) => (b / 1_048_576).toFixed(1)
console.log(`
  ✓ ${Object.keys(indice).length} archivos listos en private/media  (git los ignora)${
    reusadas > 0 ? `\n    ${reusadas} ya estaban hechos y no se tocaron` : ''
  }

${
  pesoAntes > 0
    ? `    Antes ....... ${mb(pesoAntes)} MB
    Después ..... ${mb(pesoDespues)} MB   (${Math.round((1 - pesoDespues / pesoAntes) * 100)}% menos)`
    : ''
}

  En momentos.ts referencialos por su nombre, sin extensión:
    fotos: [{ src: 'momento9-1', alt: 'descripción' }]
`)
