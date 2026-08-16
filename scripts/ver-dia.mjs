/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ¿QUÉ NOS DIJIMOS ESE DÍA?                                       ║
 * ║                                                                  ║
 * ║  Saca del chat la conversación de una fecha. Sirve para          ║
 * ║  acordarte de qué pasó, para elegir qué burbujas van en cada     ║
 * ║  momento, y para "un día como hoy".                              ║
 * ║                                                                  ║
 * ║  Lee las dos fuentes a la vez: WhatsApp e Instagram. Instagram   ║
 * ║  es la única memoria de los primeros días (25 al 30 de agosto).  ║
 * ║                                                                  ║
 * ║  Uso:                                                            ║
 * ║    npm run chat:dia -- 2024-11-24                                ║
 * ║    npm run chat:dia -- 2024-11-24 --todo   (sin recortar)        ║
 * ║    npm run chat:dia -- --buscar "te amo mucho"                   ║
 * ║    npm run chat:dia -- 2024-08-25 --instagram   (solo esa fuente)║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const WHATSAPP = path.join(RAIZ, 'private', 'chat.json')
const INSTAGRAM = path.join(RAIZ, 'private', 'instagram.json')

const args = process.argv.slice(2)
const todo = args.includes('--todo')
const soloWhatsapp = args.includes('--whatsapp')
const soloInstagram = args.includes('--instagram')
const iBuscar = args.indexOf('--buscar')
const termino = iBuscar !== -1 ? args[iBuscar + 1] : null
const fecha = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))

const cargar = (archivo, fuente) => {
  if (!existsSync(archivo)) return []
  return JSON.parse(readFileSync(archivo, 'utf8')).map((m) => ({ fuente, ...m }))
}

const mensajes = [
  ...(soloInstagram ? [] : cargar(WHATSAPP, 'whatsapp')),
  ...(soloWhatsapp ? [] : cargar(INSTAGRAM, 'instagram')),
].sort((a, b) => {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1
  const minutos = a.hora * 60 + a.minuto - (b.hora * 60 + b.minuto)
  // Dentro del mismo minuto manda el timestamp, que solo trae Instagram.
  return minutos !== 0 ? minutos : (a.ts ?? 0) - (b.ts ?? 0)
})

if (mensajes.length === 0) {
  console.error(`
  ✗ No hay ningún chat leído todavía. Corré:

      npm run chat:parsear     (WhatsApp)
      npm run chat:instagram   (Instagram)
  `)
  process.exit(1)
}

const reloj = (m) => {
  const h = m.hora % 12 === 0 ? 12 : m.hora % 12
  const sufijo = m.hora < 12 ? 'a.m.' : 'p.m.'
  return `${String(h).padStart(2, ' ')}:${String(m.minuto).padStart(2, '0')} ${sufijo}`
}

/** De dónde salió el mensaje, para no confundir las fuentes al citar. */
const marca = (m) => (m.fuente === 'instagram' ? '📷' : '💬')

const cuerpo = (m) => {
  if (m.tipo === 'multimedia') return '[multimedia]'
  if (m.tipo === 'foto') return '[foto]'
  if (m.tipo === 'audio') return '[audio]'
  if (m.tipo === 'reel' || m.tipo === 'enlace') {
    const pie = m.compartido?.texto?.split('\n')[0]?.slice(0, 70)
    const de = m.compartido?.autor ? ` @${m.compartido.autor}` : ''
    return `[reel${de}]${pie ? ` «${pie}»` : ''}${m.texto ? ` — ${m.texto}` : ''}`
  }
  return m.texto.replace(/\n/g, '\n                ')
}

const imprimir = (m, conFecha = false) => {
  const quien = m.de === 'osito' ? '🐻 osito' : '🎀 osita'
  const cuando = conFecha ? `${m.fecha} ${reloj(m)}` : reloj(m)
  const reacs = (m.reacciones ?? []).map((r) => r.emoji).join('')
  console.log(`  ${marca(m)} ${cuando}  ${quien}: ${cuerpo(m)}${reacs ? `   ${reacs}` : ''}`)
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
