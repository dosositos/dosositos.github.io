/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CIFRADO DE LAS FOTOS                                            ║
 * ║                                                                  ║
 * ║  Hermano de cifrar-contenido.mjs, pero para archivos binarios.   ║
 * ║  Toma lo que dejó fotos:optimizar en private/media/ y publica    ║
 * ║  public/cifrado/media/, que sí se sube a GitHub y sin la frase   ║
 * ║  no es más que ruido.                                            ║
 * ║                                                                  ║
 * ║  Corre solo detrás de  npm run fotos:optimizar.                  ║
 * ║                                                                  ║
 * ║  Tres decisiones que valen la pena explicar:                     ║
 * ║                                                                  ║
 * ║  · TODO EL LOTE COMPARTE UNA SAL. Así el teléfono deriva la      ║
 * ║    llave una sola vez. Con una sal por archivo habría que dar    ║
 * ║    250.000 vueltas de PBKDF2 por foto, y con 30 fotos eso deja   ║
 * ║    el teléfono trabado medio minuto. El IV sí es distinto en     ║
 * ║    cada archivo, que es lo que AES-GCM exige de verdad.          ║
 * ║                                                                  ║
 * ║  · BINARIO, NO BASE64. Los .enc de los chats guardan el          ║
 * ║    contenido en base64 dentro de un JSON, y eso engorda un 33 %. ║
 * ║    Aquí el archivo es [IV de 12 bytes][cifrado] y se lee con     ║
 * ║    arrayBuffer(): una foto de 120 KB sigue pesando 120 KB.       ║
 * ║                                                                  ║
 * ║  · NOMBRES OPACOS. "momento8-2.bin" contaría cuántos momentos    ║
 * ║    hay y cuántas fotos trae cada uno. El nombre publicado sale   ║
 * ║    de un hash de la frase con el nombre real, así que sin la     ║
 * ║    frase no se puede adivinar, y con la misma frase sale siempre ║
 * ║    igual (no ensucia el repositorio en cada pasada).             ║
 * ║                                                                  ║
 * ║  El índice — qué foto es cuál, cuánto mide, de qué color es —    ║
 * ║  también va cifrado. Lo único en claro es la sal, que no es      ║
 * ║  secreta: sirve para que dos personas con la misma frase no      ║
 * ║  deriven la misma llave.                                         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  rmSync,
  statSync,
} from 'node:fs'
import { webcrypto as crypto, createHash } from 'node:crypto'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const ORIGEN = path.join(RAIZ, 'private', 'media')
const DESTINO = path.join(RAIZ, 'public', 'cifrado', 'media')
const INDICE = path.join(ORIGEN, 'indice.json')
const ESTADO = path.join(RAIZ, 'private', '.cifrado-medios-estado.json')
const LOTE = path.join(DESTINO, 'lote.json')

const ITERACIONES = 250_000

const args = process.argv.slice(2)
const forzar = args.includes('--forzar')
const i = args.indexOf('--clave')

try {
  process.loadEnvFile(path.join(RAIZ, '.env'))
} catch {
  // No hay .env: se seguirá esperando --clave o la variable de entorno.
}

const clave = i !== -1 ? args[i + 1] : process.env.CLAVE_DOSOSITOS

if (!clave) {
  console.error(`
  ✗ Falta la frase-contraseña.

    Lo normal es dejarla en  .env  (git no lo sube), con esta línea:

      CLAVE_DOSOSITOS=la frase que va a escribir ella
  `)
  process.exit(1)
}

if (!existsSync(INDICE)) {
  console.log(`
  No hay nada que cifrar: falta  private/media/indice.json

  Corré primero:  npm run fotos:optimizar
  `)
  process.exit(0)
}

const indice = JSON.parse(readFileSync(INDICE, 'utf8'))
const nombres = Object.keys(indice)

if (nombres.length === 0) {
  console.log('  private/media/indice.json está vacío. Nada que cifrar.')
  process.exit(0)
}

mkdirSync(DESTINO, { recursive: true })

/**
 * La sal del lote. Se genera una vez y no se vuelve a tocar: si
 * cambiara, habría que recifrarlo todo y el repositorio se llenaría de
 * archivos distintos sin motivo.
 */
let lote
if (existsSync(LOTE) && !args.includes('--nueva-sal')) {
  lote = JSON.parse(readFileSync(LOTE, 'utf8'))
} else {
  lote = {
    v: 1,
    alg: 'AES-GCM',
    kdf: `PBKDF2-SHA256-${ITERACIONES}`,
    sal: Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64'),
  }
  writeFileSync(LOTE, JSON.stringify(lote), 'utf8')
}

const sal = new Uint8Array(Buffer.from(lote.sal, 'base64'))

const material = await crypto.subtle.importKey(
  'raw',
  new TextEncoder().encode(clave),
  'PBKDF2',
  false,
  ['deriveKey'],
)
const llave = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt: sal, iterations: ITERACIONES, hash: 'SHA-256' },
  material,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt'],
)

/** El nombre publicado: un hash de la frase con la ruta real. */
const nombreOpaco = (ruta) =>
  createHash('sha256').update(`${clave}:${ruta}`, 'utf8').digest('hex').slice(0, 16)

/** [IV de 12 bytes][cifrado] — sin JSON ni base64 de por medio. */
async function cifrarBytes(bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cifrado = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, bytes)
  return Buffer.concat([Buffer.from(iv), Buffer.from(cifrado)])
}

const huella = (bytes) => createHash('sha256').update(bytes).digest('hex')

const estadoPrevio = existsSync(ESTADO) ? JSON.parse(readFileSync(ESTADO, 'utf8')) : {}
const estadoNuevo = {}

// El índice que verá el navegador: los nombres reales de archivo
// cambiados por los opacos. Todo esto viaja cifrado.
const indicePublicado = {}
const publicados = new Set(['lote.json', 'indice.bin'])
let cifrados = 0
let saltados = 0

for (const nombre of nombres) {
  const ficha = { ...indice[nombre] }

  for (const cual of ['grande', 'mini']) {
    const relativo = ficha[cual]
    if (!relativo) continue

    const archivo = path.join(ORIGEN, relativo)
    if (!existsSync(archivo)) {
      console.log(`    ✗ ${nombre} — falta ${relativo}`)
      delete ficha[cual]
      continue
    }

    const opaco = `${nombreOpaco(relativo)}.bin`
    publicados.add(opaco)
    ficha[cual] = opaco

    const bytes = readFileSync(archivo)
    estadoNuevo[relativo] = huella(bytes)

    const alDia =
      !forzar &&
      estadoPrevio[relativo] === estadoNuevo[relativo] &&
      existsSync(path.join(DESTINO, opaco))

    if (alDia) {
      saltados++
      continue
    }

    writeFileSync(path.join(DESTINO, opaco), await cifrarBytes(bytes))
    cifrados++
    console.log(`    ✓ ${nombre} · ${cual}  (${(statSync(archivo).size / 1024).toFixed(0)} KB)`)
  }

  indicePublicado[nombre] = ficha
}

// El índice, cifrado igual que las fotos.
writeFileSync(
  path.join(DESTINO, 'indice.bin'),
  await cifrarBytes(new TextEncoder().encode(JSON.stringify(indicePublicado))),
)

// Lo que ya no corresponde a ninguna foto se borra: si no, una foto
// que quitaste del proyecto se quedaría publicada para siempre.
let borrados = 0
for (const archivo of readdirSync(DESTINO)) {
  if (!publicados.has(archivo)) {
    rmSync(path.join(DESTINO, archivo))
    borrados++
  }
}

writeFileSync(ESTADO, JSON.stringify(estadoNuevo, null, 2), 'utf8')

console.log(`
  ✓ ${nombres.length} fotos publicadas en public/cifrado/media/
    ${cifrados} cifradas ahora · ${saltados} ya estaban al día${
      borrados > 0 ? ` · ${borrados} sobrantes borrados` : ''
    }

    Los nombres no dicen nada y el contenido no se abre sin la frase.
`)
