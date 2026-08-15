/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ¿QUÉ NOS DIJIMOS ESE DÍA?                                       ║
 * ║                                                                  ║
 * ║  Saca del chat la conversación de una fecha. Sirve para          ║
 * ║  acordarte de qué pasó, para elegir qué burbujas van en cada     ║
 * ║  momento, y para "un día como hoy".                              ║
 * ║                                                                  ║
 * ║  Uso:                                                            ║
 * ║    npm run chat:dia -- 2024-11-24                                ║
 * ║    npm run chat:dia -- 2024-11-24 --todo   (sin recortar)        ║
 * ║    npm run chat:dia -- --buscar "te amo mucho"                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const ARCHIVO = path.join(RAIZ, 'private', 'chat.json')

if (!existsSync(ARCHIVO)) {
  console.error('  ✗ Falta private/chat.json. Corré primero:  npm run chat:parsear')
  process.exit(1)
}

const args = process.argv.slice(2)
const todo = args.includes('--todo')
const iBuscar = args.indexOf('--buscar')
const termino = iBuscar !== -1 ? args[iBuscar + 1] : null
const fecha = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))

const mensajes = JSON.parse(readFileSync(ARCHIVO, 'utf8'))

const reloj = (m) => {
  const h = m.hora % 12 === 0 ? 12 : m.hora % 12
  const sufijo = m.hora < 12 ? 'a.m.' : 'p.m.'
  return `${String(h).padStart(2, ' ')}:${String(m.minuto).padStart(2, '0')} ${sufijo}`
}

const imprimir = (m, conFecha = false) => {
  const quien = m.de === 'osito' ? '🐻 osito' : '🎀 osita'
  const cuando = conFecha ? `${m.fecha} ${reloj(m)}` : reloj(m)
  const texto = m.tipo === 'multimedia' ? '[multimedia]' : m.texto.replace(/\n/g, '\n              ')
  console.log(`  ${cuando}  ${quien}: ${texto}`)
}

// ── Modo búsqueda ─────────────────────────────────────────────────
if (termino) {
  const patron = new RegExp(termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  const encontrados = mensajes.filter((m) => m.tipo === 'texto' && patron.test(m.texto))

  console.log(`\n  "${termino}" aparece ${encontrados.length.toLocaleString('es-NI')} veces\n`)
  for (const m of encontrados.slice(0, todo ? encontrados.length : 40)) imprimir(m, true)
  if (!todo && encontrados.length > 40) {
    console.log(`\n  ... y ${encontrados.length - 40} más. Agregá --todo para verlas todas.`)
  }
  process.exit(0)
}

// ── Modo día ──────────────────────────────────────────────────────
if (!fecha) {
  console.log(`
  Decime qué día querés ver:

    npm run chat:dia -- 2024-11-24
    npm run chat:dia -- --buscar "sushi"
  `)
  process.exit(0)
}

const delDia = mensajes.filter((m) => m.fecha === fecha)

if (delDia.length === 0) {
  console.log(`\n  No hay mensajes del ${fecha}. ¿Seguro que es esa la fecha?\n`)
  process.exit(0)
}

console.log(`\n  ── ${fecha} · ${delDia.length} mensajes ──\n`)

const limite = todo ? delDia.length : 60
for (const m of delDia.slice(0, limite)) imprimir(m)

if (delDia.length > limite) {
  console.log(`\n  ... y ${delDia.length - limite} más. Agregá --todo para ver la conversación entera.`)
}
console.log()
