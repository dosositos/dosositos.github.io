/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PARSER DEL CHAT DE WHATSAPP                                     ║
 * ║                                                                  ║
 * ║  Lee el export crudo y lo convierte en datos manejables.         ║
 * ║  TODO lo que produce se queda en /private, que git ignora:        ║
 * ║  el chat completo NUNCA se sube a GitHub.                        ║
 * ║                                                                  ║
 * ║  Uso:                                                            ║
 * ║    1. Poné el archivo en  private/chat.txt                       ║
 * ║    2. npm run chat:parsear                                       ║
 * ║       (la primera vez te dice qué nombres encontró)              ║
 * ║    3. npm run chat:parsear -- --osito "Armando" --osita "Jenn"   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const PRIVADO = path.join(RAIZ, 'private')
const ENTRADA = path.join(PRIVADO, 'chat.txt')

// ── Argumentos ────────────────────────────────────────────────────
const args = process.argv.slice(2)
const arg = (nombre) => {
  const i = args.indexOf(`--${nombre}`)
  return i !== -1 ? args[i + 1] : null
}
const nombreOsito = arg('osito')
const nombreOsita = arg('osita')

if (!existsSync(ENTRADA)) {
  console.error(`
  ✗ No encontré  private/chat.txt

    En WhatsApp: abrí la conversación → ⋮ → Más → Exportar chat → Sin archivos.
    Guardá el .txt como  private/chat.txt  (esa carpeta nunca se sube a GitHub).
  `)
  process.exit(1)
}

// ── Formatos de línea que sabe leer ───────────────────────────────
// Android:  24/8/24, 8:15 p. m. - Armando: mensaje
// Android:  24/8/2024, 20:15 - Armando: mensaje
// iOS:      [24/8/24, 8:15:03 p. m.] Armando: mensaje
const PATRONES = [
  /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]\.?\s?m\.?)?\]\s*([^:]+?):\s([\s\S]*)$/i,
  /^(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]\.?\s?m\.?)?\s*[-–]\s*([^:]+?):\s([\s\S]*)$/i,
]

const RUIDO = [
  /cifrados de extremo a extremo/i,
  /^<Multimedia omitido>$/i,
  /^Se eliminó este mensaje/i,
  /^Este mensaje fue eliminado/i,
  /^Se cambió el (asunto|ícono|código de seguridad)/i,
  /^Llamada (perdida|de voz|de vídeo)/i,
  /^null$/i,
]

const esMultimedia = (t) => /<Multimedia omitido>|(imagen|audio|video|sticker|GIF|documento) omitid/i.test(t)

function normalizarHora(h, m, sufijo) {
  let hora = Number(h)
  if (sufijo) {
    const pm = /p/i.test(sufijo)
    if (pm && hora !== 12) hora += 12
    if (!pm && hora === 12) hora = 0
  }
  return { hora, minuto: Number(m) }
}

function leerLinea(linea) {
  for (const patron of PATRONES) {
    const m = linea.match(patron)
    if (!m) continue
    const [, d, mes, a, hh, mm, , sufijo, autor, texto] = m
    const anio = a.length === 2 ? 2000 + Number(a) : Number(a)
    const { hora, minuto } = normalizarHora(hh, mm, sufijo)
    return {
      fecha: `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      hora,
      minuto,
      autor: autor.trim(),
      texto: texto.trim(),
    }
  }
  return null
}

// ── Lectura ───────────────────────────────────────────────────────
const crudo = readFileSync(ENTRADA, 'utf8').replace(/‎|‏/g, '')
const lineas = crudo.split(/\r?\n/)

const mensajes = []
for (const linea of lineas) {
  const parsed = leerLinea(linea)
  if (parsed) {
    mensajes.push(parsed)
  } else if (mensajes.length > 0 && linea.trim()) {
    // Continuación de un mensaje de varias líneas
    mensajes[mensajes.length - 1].texto += '\n' + linea.trim()
  }
}

if (mensajes.length === 0) {
  console.error('  ✗ No pude leer ningún mensaje. ¿Seguro que es el .txt exportado por WhatsApp?')
  console.error('    Mandame las primeras 3 líneas del archivo y ajusto el parser.')
  process.exit(1)
}

// ── Detección de remitentes ───────────────────────────────────────
const conteoAutores = {}
for (const m of mensajes) conteoAutores[m.autor] = (conteoAutores[m.autor] ?? 0) + 1
const autores = Object.entries(conteoAutores).sort((a, b) => b[1] - a[1])

if (!nombreOsito || !nombreOsita) {
  console.log(`\n  ✓ Leí ${mensajes.length.toLocaleString('es-NI')} mensajes.\n`)
  console.log('  Remitentes encontrados:\n')
  for (const [nombre, n] of autores) {
    console.log(`    · "${nombre}"  —  ${n.toLocaleString('es-NI')} mensajes`)
  }
  console.log(`
  Ahora decime quién es quién:

    npm run chat:parsear -- --osito "${autores[0]?.[0] ?? 'Nombre'}" --osita "${autores[1]?.[0] ?? 'Nombre'}"
  `)
  process.exit(0)
}

const quienDe = (autor) => {
  if (autor === nombreOsito) return 'osito'
  if (autor === nombreOsita) return 'osita'
  return null
}

// ── Limpieza y clasificación ──────────────────────────────────────
const limpios = []
for (const m of mensajes) {
  const quien = quienDe(m.autor)
  if (!quien) continue
  if (RUIDO.some((r) => r.test(m.texto))) continue

  limpios.push({
    de: quien,
    fecha: m.fecha,
    hora: m.hora,
    minuto: m.minuto,
    texto: m.texto,
    tipo: esMultimedia(m.texto) ? 'multimedia' : 'texto',
  })
}

const soloTexto = limpios.filter((m) => m.tipo === 'texto')

// ── Estadísticas (materia prima del "Wrapped") ────────────────────
const porDia = {}
for (const m of soloTexto) (porDia[m.fecha] ??= []).push(m)

const contar = (quien, patron) =>
  soloTexto.filter((m) => m.de === quien && patron.test(m.texto)).length

const horas = new Array(24).fill(0)
for (const m of soloTexto) horas[m.hora]++

const emojis = {}
const REGEX_EMOJI = /\p{Extended_Pictographic}/gu
for (const m of soloTexto) {
  for (const e of m.texto.match(REGEX_EMOJI) ?? []) emojis[e] = (emojis[e] ?? 0) + 1
}

const dias = Object.keys(porDia).sort()
let rachaMax = 0
let rachaActual = 0
let diaPrevio = null
for (const d of dias) {
  const actual = new Date(d + 'T12:00:00Z')
  const esperado = diaPrevio ? new Date(diaPrevio.getTime() + 86_400_000) : null
  rachaActual = esperado && actual.getTime() === esperado.getTime() ? rachaActual + 1 : 1
  rachaMax = Math.max(rachaMax, rachaActual)
  diaPrevio = actual
}

const estadisticas = {
  totalMensajes: soloTexto.length,
  multimedia: limpios.length - soloTexto.length,
  porPersona: {
    osito: soloTexto.filter((m) => m.de === 'osito').length,
    osita: soloTexto.filter((m) => m.de === 'osita').length,
  },
  palabras: {
    osito: soloTexto.filter((m) => m.de === 'osito').reduce((n, m) => n + m.texto.split(/\s+/).length, 0),
    osita: soloTexto.filter((m) => m.de === 'osita').reduce((n, m) => n + m.texto.split(/\s+/).length, 0),
  },
  teAmo: {
    osito: contar('osito', /te amo/i),
    osita: contar('osita', /te amo/i),
  },
  teQuiero: {
    osito: contar('osito', /te quiero/i),
    osita: contar('osita', /te quiero/i),
  },
  jaja: {
    osito: contar('osito', /j[aei]j[aei]/i),
    osita: contar('osita', /j[aei]j[aei]/i),
  },
  primerMensaje: soloTexto[0],
  ultimoMensaje: soloTexto[soloTexto.length - 1],
  diasConversando: dias.length,
  rachaMasLarga: rachaMax,
  diaMasHablador: Object.entries(porDia)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([fecha, ms]) => ({ fecha, mensajes: ms.length })),
  horaPico: horas.indexOf(Math.max(...horas)),
  mensajesPorHora: horas,
  emojisTop: Object.entries(emojis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([emoji, n]) => ({ emoji, n })),
}

// ── Salida ────────────────────────────────────────────────────────
if (!existsSync(PRIVADO)) mkdirSync(PRIVADO, { recursive: true })

writeFileSync(path.join(PRIVADO, 'chat.json'), JSON.stringify(limpios), 'utf8')
writeFileSync(path.join(PRIVADO, 'por-dia.json'), JSON.stringify(porDia), 'utf8')
writeFileSync(path.join(PRIVADO, 'estadisticas.json'), JSON.stringify(estadisticas, null, 2), 'utf8')

const n = (x) => x.toLocaleString('es-NI')
console.log(`
  ✓ Listo. Todo guardado en /private (no se sube a GitHub).

    Mensajes de texto ......... ${n(estadisticas.totalMensajes)}
    Multimedia ................ ${n(estadisticas.multimedia)}
    Osito ..................... ${n(estadisticas.porPersona.osito)} mensajes, ${n(estadisticas.palabras.osito)} palabras
    Osita ..................... ${n(estadisticas.porPersona.osita)} mensajes, ${n(estadisticas.palabras.osita)} palabras
    Días conversando .......... ${n(estadisticas.diasConversando)}
    Racha más larga ........... ${n(estadisticas.rachaMasLarga)} días seguidos
    "Te amo" .................. osito ${n(estadisticas.teAmo.osito)} · osita ${n(estadisticas.teAmo.osita)}
    Hora pico ................. ${estadisticas.horaPico}:00
    Emojis top ................ ${estadisticas.emojisTop.slice(0, 6).map((e) => e.emoji).join(' ')}

    Siguiente paso:  npm run chat:frases
`)
