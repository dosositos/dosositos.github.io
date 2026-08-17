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
 * ║    2. npm run secretos:cifrar                                    ║
 * ║                                                                  ║
 * ║  La frase sale de  .env  (CLAVE_DOSOSITOS=...), que git ignora.  ║
 * ║  También se puede pasar a mano:  -- --clave "la frase"           ║
 * ║                                                                  ║
 * ║  Salida: public/cifrado/frases.enc                               ║
 * ║                                                                  ║
 * ║  Si nada cambió desde la última vez, no vuelve a cifrar: cada    ║
 * ║  cifrado usa sal e IV nuevos, así que rehacerlo porque sí        ║
 * ║  ensuciaría el repositorio con un archivo distinto cada vez.     ║
 * ║  Para forzarlo igual:  -- --forzar                               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { webcrypto as crypto, createHash } from 'node:crypto'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const ORIGEN = path.join(RAIZ, 'private', 'publicable')
const DESTINO = path.join(RAIZ, 'public', 'cifrado')
// Qué se cifró la última vez. Vive en private/ (que git ignora) porque
// es una huella del contenido en claro, no algo que deba publicarse.
const ESTADO = path.join(RAIZ, 'private', '.cifrado-estado.json')

const ITERACIONES = 250_000 // suficiente para que un ataque por fuerza bruta sea lentísimo

const args = process.argv.slice(2)
const forzar = args.includes('--forzar')
const i = args.indexOf('--clave')

// La frase puede venir del .env del proyecto, que git no sube.
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

    O pasarla suelta:

      npm run secretos:cifrar -- --clave "la frase que va a escribir ella"

    Si la perdés, hay que volver a cifrar todo con una nueva.
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

/**
 * ¿Hace falta volver a cifrar?
 *
 * Esto corre solo, cada vez que toco algo de private/publicable/. Si
 * cifrara siempre, cada pasada generaría sal e IV nuevos y el .enc
 * saldría distinto aunque el contenido fuera idéntico: el repositorio
 * se llenaría de cambios que no cambian nada.
 *
 * La huella es del texto en claro, así que se guarda en private/ y no
 * se publica nunca.
 */
const huella = (texto) => createHash('sha256').update(texto, 'utf8').digest('hex')

const estadoPrevio = existsSync(ESTADO) ? JSON.parse(readFileSync(ESTADO, 'utf8')) : {}
const estadoNuevo = {}

const porCifrar = archivos.filter((archivo) => {
  const contenido = readFileSync(path.join(ORIGEN, archivo), 'utf8')
  estadoNuevo[archivo] = huella(contenido)

  if (forzar) return true
  // Si el .enc no está, hay que cifrar aunque la huella coincida.
  if (!existsSync(path.join(DESTINO, archivo.replace(/\.json$/, '.enc')))) return true
  return estadoPrevio[archivo] !== estadoNuevo[archivo]
})

if (porCifrar.length === 0) {
  console.log(`  ✓ Nada que cifrar: los ${archivos.length} archivos están al día.`)
  process.exit(0)
}

for (const archivo of porCifrar) {
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

  // El mismo recibo, para el juego: cuántas frases entraron y con qué
  // huella. Así `npm run build` avisa si aprobaste frases nuevas y no
  // se volvió a preparar y cifrar el juego.
  if (archivo === 'juego.json') {
    const juego = JSON.parse(contenido)
    writeFileSync(
      path.join(DESTINO, 'juego.manifiesto.json'),
      JSON.stringify(
        {
          generado: new Date().toISOString(),
          huella: juego.huella ?? null,
          frases: juego.frases?.length ?? 0,
        },
        null,
        2,
      ),
      'utf8',
    )
    console.log(`    ✓ recibo    →  public/cifrado/juego.manifiesto.json`)
  }
}

// Las huellas quedan anotadas para no repetir trabajo la próxima vez.
writeFileSync(ESTADO, JSON.stringify(estadoNuevo, null, 2), 'utf8')

console.log(`
  ✓ Listo. Estos archivos sí se suben a GitHub, pero sin la frase
    no son más que ruido.
`)
