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
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const MOMENTOS = path.join(RAIZ, 'src', 'content', 'momentos.ts')
const CIFRADO = path.join(RAIZ, 'public', 'cifrado')
const MANIFIESTO = path.join(CIFRADO, 'chats.manifiesto.json')

const COMANDO = 'npm run secretos:cifrar -- --clave "la frase de siempre"'

// ── Qué chats pide la web ─────────────────────────────────────────
const fuente = readFileSync(MOMENTOS, 'utf8')
const pedidos = new Map()
for (const bloque of fuente.matchAll(/id: '([a-z0-9-]+)'[\s\S]*?(?=id: '|$)/g)) {
  const ficha = bloque[0].match(/chat: \{ mensajes: (\d+)/)
  if (ficha) pedidos.set(bloque[1], Number(ficha[1]))
}

if (pedidos.size === 0) process.exit(0) // ningún momento pide chat: nada que revisar

const fallar = (titulo, detalle) => {
  console.error(`\n  ✗ ${titulo}\n\n${detalle}\n`)
  process.exit(1)
}

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
