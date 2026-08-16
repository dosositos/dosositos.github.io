/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ANTES DE COMPILAR: ¿está todo lo que la web va a pedir?         ║
 * ║                                                                  ║
 * ║  Corre solo, enganchado a `npm run build` (npm ejecuta el        ║
 * ║  script "prebuild" antes que "build").                           ║
 * ║                                                                  ║
 * ║  Existe por una razón concreta: los chats van cifrados, y si     ║
 * ║  te olvidás de correr `npm run secretos:cifrar` la web compila   ║
 * ║  igual, publica igual, y las conversaciones simplemente no       ║
 * ║  aparecen. Sin ruido, sin error, sin que nadie se entere hasta   ║
 * ║  que ella abra un momento. Mejor que se caiga aquí.              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const MOMENTOS = path.join(RAIZ, 'src', 'content', 'momentos.ts')
const INSTANTES = path.join(RAIZ, 'src', 'content', 'instantes.ts')
const CIFRADO = path.join(RAIZ, 'public', 'cifrado')
const MANIFIESTO = path.join(CIFRADO, 'chats.manifiesto.json')
const MEDIOS = path.join(CIFRADO, 'media')
const EN_CLARO = path.join(RAIZ, 'public', 'media')
const INDICE_LOCAL = path.join(RAIZ, 'private', 'media', 'indice.json')

const COMANDO = 'npm run secretos:cifrar -- --clave "la frase de siempre"'

const fallar = (titulo, detalle) => {
  console.error(`\n  ✗ ${titulo}\n\n${detalle}\n`)
  process.exit(1)
}

// ── Las fotos ─────────────────────────────────────────────────────
// Esto existe por un susto concreto: hasta el 16 de agosto,
// `fotos:optimizar` dejaba las fotos en public/media/, o sea en claro
// dentro de un repositorio público. Ahora van todas cifradas y esta
// revisión se asegura de que no vuelva a pasar.

if (existsSync(EN_CLARO)) {
  const sueltas = readdirSync(EN_CLARO)
  if (sueltas.length > 0) {
    fallar(
      `Hay ${sueltas.length} archivos EN CLARO en public/media/`,
      `    Eso se publica tal cual en GitHub y lo ve cualquiera, con o sin
    la frase. Las fotos van cifradas: borrá esa carpeta y corré

      npm run fotos:optimizar

    que deja las AVIF en private/media/ y publica public/cifrado/media/.`,
    )
  }
}

// ── Nombres de terceros ───────────────────────────────────────────
// Lo que va en src/ se publica en claro. Ahí solo se nombran ellos
// dos; las hermanas y los amigos se mencionan por parentesco. La lista
// vive en private/ porque escribirla acá sería el mismo error que
// intenta evitar; en GitHub Actions no existe y esto no corre.
const PROHIBIDOS = path.join(RAIZ, 'private', 'nombres-prohibidos.json')

if (existsSync(PROHIBIDOS)) {
  const { nombres } = JSON.parse(readFileSync(PROHIBIDOS, 'utf8'))
  const encontrados = []

  const revisar = (dir) => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const completo = path.join(dir, entrada.name)
      if (entrada.isDirectory()) {
        revisar(completo)
        continue
      }
      if (!/\.(ts|tsx|css|html|json)$/.test(entrada.name)) continue

      const texto = readFileSync(completo, 'utf8')
      for (const nombre of nombres) {
        if (new RegExp(`\\b${nombre}\\b`, 'i').test(texto)) {
          encontrados.push(`· «${nombre}» en ${path.relative(RAIZ, completo)}`)
        }
      }
    }
  }

  revisar(path.join(RAIZ, 'src'))

  if (encontrados.length > 0) {
    fallar(
      'Hay nombres de terceros en contenido que se publica en claro',
      `${encontrados.map((e) => `    ${e}`).join('\n')}

    Cambialos por el parentesco («mi hermanita», «su amiga»). Dentro de los
    chats cifrados no hay problema: eso no se lee sin la frase.`,
    )
  }

  console.log(`  ✓ ningún nombre de terceros en lo que se publica en claro`)
}

/** Los nombres que la web pide: fotos: [{ src: 'momento9-1' }] */
const fotosPedidas = new Set()
for (const archivo of [MOMENTOS, INSTANTES]) {
  if (!existsSync(archivo)) continue
  for (const m of readFileSync(archivo, 'utf8').matchAll(/src: '([^']+)'/g)) {
    fotosPedidas.add(m[1])
  }
}

if (fotosPedidas.size > 0) {
  if (!existsSync(path.join(MEDIOS, 'indice.bin'))) {
    fallar(
      'Faltan las fotos cifradas',
      `    ${fotosPedidas.size} fotos referenciadas y public/cifrado/media/ vacío.
    Corré:  npm run fotos:optimizar`,
    )
  }

  // Solo en la máquina donde están los originales: ahí sí se puede
  // comprobar nombre por nombre. En GitHub Actions no existe private/.
  if (existsSync(INDICE_LOCAL)) {
    const indice = JSON.parse(readFileSync(INDICE_LOCAL, 'utf8'))
    const huerfanas = [...fotosPedidas].filter((n) => !(n in indice))

    if (huerfanas.length > 0) {
      fallar(
        'La web pide fotos que no existen',
        `${huerfanas.map((n) => `    · «${n}»`).join('\n')}

    Revisá el nombre en src/content/ (va sin extensión) o meté el archivo
    en fotos-originales/ y corré  npm run fotos:optimizar`,
      )
    }
  }

  console.log(`  ✓ ${fotosPedidas.size} fotos cifradas y ninguna en claro`)
}

// ── Qué chats pide la web ─────────────────────────────────────────
const fuente = readFileSync(MOMENTOS, 'utf8')
const pedidos = new Map()
for (const bloque of fuente.matchAll(/id: '([a-z0-9-]+)'[\s\S]*?(?=id: '|$)/g)) {
  const ficha = bloque[0].match(/chat: \{ mensajes: (\d+)/)
  if (ficha) pedidos.set(bloque[1], Number(ficha[1]))
}

if (pedidos.size === 0) process.exit(0) // ningún momento pide chat: nada que revisar

// ── ¿Se cifró alguna vez? ─────────────────────────────────────────
if (!existsSync(path.join(CIFRADO, 'chats.enc')) || !existsSync(MANIFIESTO)) {
  fallar(
    'Falta public/cifrado/chats.enc',
    `    ${pedidos.size} momentos piden su conversación y el archivo cifrado no existe.
    Si publicás así, la web se ve entera pero sin un solo chat.

    Corré:

      ${COMANDO}

    (la frase no está en ningún archivo del proyecto: es la que escribe ella
     en la puerta)`,
  )
}

// ── ¿Se quedó atrás respecto al contenido? ────────────────────────
const { momentos: cifrados } = JSON.parse(readFileSync(MANIFIESTO, 'utf8'))

const quejas = []
for (const [id, mensajes] of pedidos) {
  if (!(id in cifrados)) {
    quejas.push(`· "${id}" pide chat, pero no salió en el último cifrado`)
  } else if (cifrados[id] !== mensajes) {
    quejas.push(
      `· "${id}": momentos.ts dice ${mensajes} mensajes, lo cifrado trae ${cifrados[id]}`,
    )
  }
}

if (quejas.length > 0) {
  fallar(
    'El contenido cifrado se quedó atrás',
    `${quejas.map((q) => `    ${q}`).join('\n')}

    Cambiaste private/publicable/chats.json y no volviste a cifrar. Corré:

      ${COMANDO}`,
  )
}

console.log(`  ✓ ${pedidos.size} conversaciones cifradas y al día`)
