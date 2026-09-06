/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  LA MÚSICA DE FONDO DEL JUEGO                                    ║
 * ║                                                                  ║
 * ║  musica-original/*.mp3  →  private/media/musica/*.mp3            ║
 * ║  y de ahí, cifradas, a public/cifrado/media/ como todo lo demás.  ║
 * ║                                                                  ║
 * ║  Dos decisiones que valen la pena explicar:                      ║
 * ║                                                                  ║
 * ║  · SE ACHICAN MUCHO. Llegaron a 192 kbps en estéreo, 17,6 MB     ║
 * ║    entre las cuatro. Eso es media hora de datos de ella para     ║
 * ║    algo que va a sonar bajito y de fondo, y el altavoz de un     ║
 * ║    teléfono es mono de todas formas. A 64 kbps en mono pesan la  ║
 * ║    tercera parte y a ese volumen no se distingue.                ║
 * ║                                                                  ║
 * ║  · VAN CIFRADAS, como las fotos y por la misma razón: el         ║
 * ║    repositorio es público. Se cuelan en el mismo lote —          ║
 * ║    private/media/indice.json — así que comparten la sal, el      ║
 * ║    nombre opaco y la llave que el teléfono ya derivó para las    ║
 * ║    fotos. En el navegador las abre `abrirMedio`, igual que una   ║
 * ║    foto, y salen como un blob que se le da al <audio>.           ║
 * ║                                                                  ║
 * ║  Se corre solo cuando se agregan o se cambian canciones:         ║
 * ║                                                                  ║
 * ║      npm run musica:preparar                                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const ORIGEN = path.join(RAIZ, 'musica-original')
const DESTINO = path.join(RAIZ, 'private', 'media')
const INDICE = path.join(DESTINO, 'indice.json')

/** Dentro de private/media, para no mezclarlas con las fotos. */
const CARPETA = 'musica'

/**
 * A 64 kbps y en mono.
 *
 * Suena de fondo y a un quinto de volumen. Lo que se pierde ahí no se
 * oye, y lo que se gana sí: bajar tres minutos de canción en el
 * teléfono de ella deja de costar 5 MB.
 */
const KBPS = 64

const forzar = process.argv.includes('--forzar')

if (!existsSync(ORIGEN)) {
  console.log(`
  No hay nada que preparar: falta la carpeta  musica-original/

  Dejá ahí los mp3 tal como te lleguen. Git no los sube, y lo que se
  publica es la versión chiquita y cifrada.
`)
  process.exit(0)
}

const canciones = readdirSync(ORIGEN)
  .filter((n) => /\.(mp3|m4a|wav|flac|ogg|opus)$/i.test(n))
  .sort()

if (canciones.length === 0) {
  console.log('\n  La carpeta musica-original/ está, pero vacía.\n')
  process.exit(0)
}

/** Cuánto dura, en segundos. Lo usa el juego para saber cuándo cambiar. */
function duracionDe(archivo) {
  const salida = execFileSync(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', archivo],
    { encoding: 'utf8' },
  )
  return Math.round(Number(salida.trim()))
}

mkdirSync(path.join(DESTINO, CARPETA), { recursive: true })

// El índice es de todo el lote y las fotos también viven ahí, así que
// se lee lo que hay y se le agregan las canciones encima. Reescribirlo
// entero desde acá borraría las 26 fotos.
const indice = existsSync(INDICE) ? JSON.parse(readFileSync(INDICE, 'utf8')) : {}

let pesoAntes = 0
let pesoDespues = 0
let reusadas = 0

console.log(`\n  Preparando ${canciones.length} canciones...\n`)

for (const archivo of canciones) {
  const entrada = path.join(ORIGEN, archivo)
  const nombre = `${CARPETA}/${path.basename(archivo).replace(/\.[^.]+$/, '')}`
  const salida = path.join(DESTINO, `${nombre}.mp3`)

  // Reconvertir una canción que no cambió da bytes distintos, y el
  // cifrado la daría por nueva: el repositorio se llenaría de un
  // megabyte de cambios que no cambian nada.
  const alDia =
    !forzar &&
    indice[nombre] &&
    existsSync(salida) &&
    statSync(salida).mtimeMs >= statSync(entrada).mtimeMs

  if (alDia) {
    reusadas += 1
    pesoAntes += statSync(entrada).size
    pesoDespues += statSync(salida).size
    continue
  }

  try {
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-i', entrada,
        '-vn', // fuera la carátula, que se cifraría como parte del mp3
        '-map_metadata', '-1', // ni título ni artista: el nombre del archivo alcanza
        '-ac', '1',
        '-b:a', `${KBPS}k`,
        salida,
      ],
      { stdio: 'pipe' },
    )

    indice[nombre] = {
      tipo: 'musica',
      mime: 'audio/mpeg',
      duracion: duracionDe(salida),
      grande: `${nombre}.mp3`,
    }

    pesoAntes += statSync(entrada).size
    pesoDespues += statSync(salida).size
    console.log(`    ✓ ${nombre}  ${indice[nombre].duracion} s`)
  } catch (e) {
    console.log(`    ✗ ${archivo} — ${e.message.split('\n')[0]}`)
  }
}

writeFileSync(INDICE, JSON.stringify(indice, null, 2), 'utf8')

const mb = (b) => (b / 1_048_576).toFixed(1)
const cuantas = Object.values(indice).filter((f) => f.tipo === 'musica').length

console.log(`
  ✓ ${cuantas} canciones listas en private/media/${CARPETA}  (git las ignora)${
    reusadas > 0 ? `\n    ${reusadas} ya estaban hechas y no se tocaron` : ''
  }

    Antes ....... ${mb(pesoAntes)} MB
    Después ..... ${mb(pesoDespues)} MB   (${Math.round((1 - pesoDespues / pesoAntes) * 100)}% menos)

  Ahora se cifran, que es lo que se sube.
`)
