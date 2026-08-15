/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  CIFRADO DEL CONTENIDO PRIVADO                                   ║
 * ║                                                                  ║
 * ║  GitHub Pages es público: cualquiera con el enlace puede ver los ║
 * ║  archivos. Por eso los chats, las frases del juego y las cartas  ║
 * ║  no se suben en claro: se suben cifrados con AES-256-GCM.        ║
 * ║  Sin la frase-contraseña son ruido ilegible, incluso para        ║
 * ║  alguien que descargue el repositorio entero.                    ║
 * ║                                                                  ║
 * ║  Uso:                                                            ║
 * ║    1. Poné los JSON curados en  private/publicable/               ║
 * ║       (ej: private/publicable/frases.json)                       ║
 * ║    2. npm run secretos:cifrar -- --clave "nuestra frase secreta" ║
 * ║                                                                  ║
 * ║  Salida: public/cifrado/frases.enc                               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { webcrypto as crypto } from 'node:crypto'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const ORIGEN = path.join(RAIZ, 'private', 'publicable')
const DESTINO = path.join(RAIZ, 'public', 'cifrado')

const ITERACIONES = 250_000 // suficiente para que un ataque por fuerza bruta sea lentísimo

const args = process.argv.slice(2)
const i = args.indexOf('--clave')
const clave = i !== -1 ? args[i + 1] : process.env.CLAVE_DOSOSITOS

if (!clave) {
  console.error(`
  ✗ Falta la frase-contraseña.

    npm run secretos:cifrar -- --clave "la frase que va a escribir ella"

    Importante: esta frase NO se guarda en ningún archivo del proyecto.
    Anotala aparte. Si la perdés, hay que volver a cifrar todo.
  `)
  process.exit(1)
}

if (!existsSync(ORIGEN)) {
  mkdirSync(ORIGEN, { recursive: true })
  console.log(`
  Creé la carpeta  private/publicable/

  Poné ahí los JSON que quieras publicar pero protegidos, y volvé a correr.
  `)
  process.exit(0)
}

const archivos = readdirSync(ORIGEN).filter((f) => f.endsWith('.json'))
if (archivos.length === 0) {
  console.log('  No hay archivos .json en private/publicable/')
  process.exit(0)
}

mkdirSync(DESTINO, { recursive: true })

async function derivarLlave(clave, sal) {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(clave),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: sal, iterations: ITERACIONES, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  )
}

const b64 = (buf) => Buffer.from(buf).toString('base64')

for (const archivo of archivos) {
  const contenido = readFileSync(path.join(ORIGEN, archivo), 'utf8')

  // Sal e IV nuevos en cada cifrado: nunca se repiten
  const sal = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const llave = await derivarLlave(clave, sal)

  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    llave,
    new TextEncoder().encode(contenido),
  )

  const salida = {
    v: 1,
    alg: 'AES-GCM',
    kdf: `PBKDF2-SHA256-${ITERACIONES}`,
    sal: b64(sal),
    iv: b64(iv),
    datos: b64(cifrado),
  }

  const nombre = archivo.replace(/\.json$/, '.enc')
  writeFileSync(path.join(DESTINO, nombre), JSON.stringify(salida), 'utf8')
  console.log(`    ✓ ${archivo}  →  public/cifrado/${nombre}`)
}

console.log(`
  ✓ Listo. Estos archivos sí se suben a GitHub, pero sin la frase
    no son más que ruido.
`)
