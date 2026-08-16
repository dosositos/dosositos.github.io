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

/**
 * Los momentos declaran cuántos mensajes trae su chat, porque la línea
 * del tiempo lo enseña sin descifrar nada. Ese número está escrito en
 * dos lados, así que aquí se comprueba que no se hayan separado.
 */
function revisarConteosDeChats() {
  const archivoChats = path.join(ORIGEN, 'chats.json')
  const archivoMomentos = path.join(RAIZ, 'src', 'content', 'momentos.ts')
  if (!existsSync(archivoChats) || !existsSync(archivoMomentos)) return

  const chats = JSON.parse(readFileSync(archivoChats, 'utf8'))
  const fuente = readFileSync(archivoMomentos, 'utf8')

  const declarados = new Map()
  for (const bloque of fuente.matchAll(/id: '([a-z0-9-]+)'[\s\S]*?(?=id: '|$)/g)) {
    const conteo = bloque[0].match(/chat: \{ mensajes: (\d+)/)
    if (conteo) declarados.set(bloque[1], Number(conteo[1]))
  }

  const quejas = []
  for (const [id, mensajes] of Object.entries(chats)) {
    if (id.startsWith('_')) continue
    if (!declarados.has(id)) {
      quejas.push(`· "${id}" está en chats.json pero ningún momento lo pide`)
    } else if (declarados.get(id) !== mensajes.length) {
      quejas.push(
        `· "${id}": momentos.ts dice ${declarados.get(id)} mensajes, chats.json trae ${mensajes.length}`,
      )
    }
  }
  for (const id of declarados.keys()) {
    if (!(id in chats)) quejas.push(`· "${id}" declara chat pero no está en chats.json`)
  }

  if (quejas.length > 0) {
    console.error(`
  ✗ Los chats y los momentos no cuadran:

${quejas.map((q) => `    ${q}`).join('\n')}

    Arreglá el número en src/content/momentos.ts (campo "mensajes")
    y volvé a correr. No cifré nada.
    `)
    process.exit(1)
  }
}

revisarConteosDeChats()

async function derivarLlave(clave, sal, usos = ['encrypt']) {
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
    usos,
  )
}

const b64 = (buf) => Buffer.from(buf).toString('base64')
const deB64 = (s) => new Uint8Array(Buffer.from(s, 'base64'))

/**
 * El seguro contra el error de tipeo.
 *
 * Si ya hay contenido cifrado publicado, la clave nueva tiene que abrirlo.
 * Si no abre es que te equivocaste al escribirla — y si dejáramos que
 * siguiera, volvería a cifrar todo con la clave equivocada y la puerta
 * dejaría de abrirse con la frase de siempre, sin que nadie se entere
 * hasta que ella lo intente.
 *
 * Para cambiar la frase a propósito:  npm run secretos:cifrar -- --clave "..." --nueva-clave
 */
async function comprobarLaClaveDeSiempre() {
  const testigo = path.join(DESTINO, 'saludo.enc')
  if (args.includes('--nueva-clave') || !existsSync(testigo)) return

  const sobre = JSON.parse(readFileSync(testigo, 'utf8'))
  const llave = await derivarLlave(clave, deB64(sobre.sal), ['decrypt'])

  try {
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: deB64(sobre.iv) },
      llave,
      deB64(sobre.datos),
    )
  } catch {
    console.error(`
  ✗ Esa clave no abre lo que ya está publicado.

    Casi siempre es un error de tipeo. No cifré nada: si hubiera seguido,
    la puerta habría dejado de abrirse con la frase de siempre.

    Si de verdad querés cambiar la frase, agregá  --nueva-clave
    (y acordate de que hay que volver a cifrar TODO con la nueva).
    `)
    process.exit(1)
  }
}

await comprobarLaClaveDeSiempre()

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

  // El recibo de los chats: qué momentos quedaron dentro y con cuántos
  // mensajes. No dice nada que no esté ya en momentos.ts, y sirve para
  // que `npm run build` avise si el cifrado se quedó atrás.
  if (archivo === 'chats.json') {
    const chats = JSON.parse(contenido)
    const momentos = {}
    for (const [id, mensajes] of Object.entries(chats)) {
      if (!id.startsWith('_')) momentos[id] = mensajes.length
    }
    writeFileSync(
      path.join(DESTINO, 'chats.manifiesto.json'),
      JSON.stringify({ generado: new Date().toISOString(), momentos }, null, 2),
      'utf8',
    )
    console.log(`    ✓ recibo    →  public/cifrado/chats.manifiesto.json`)
  }
}

console.log(`
  ✓ Listo. Estos archivos sí se suben a GitHub, pero sin la frase
    no son más que ruido.
`)
