/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  PARSER DEL CHAT DE INSTAGRAM                                    ║
 * ║                                                                  ║
 * ║  Instagram es la fuente de los primeros días: del 25 de agosto   ║
 * ║  al 30, antes de que existiera el chat de WhatsApp. Y después    ║
 * ║  siguió siendo el lugar de los reels.                            ║
 * ║                                                                  ║
 * ║  Uso:                                                            ║
 * ║    1. Descargá tus datos de Instagram (JSON) y poné el archivo   ║
 * ║       de la conversación en  private/instagram_export.json       ║
 * ║    2. npm run chat:instagram                                     ║
 * ║                                                                  ║
 * ║  Todo lo que produce se queda en /private, que git ignora.       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Dos rarezas del export de Meta que este script arregla:
 *
 *   1. El texto viene con la codificación rota ("ArrÃ³liga" en vez de
 *      "Arróliga"): Meta guarda UTF-8 pero lo escapa como si fuera
 *      latin-1. Se deshace releyendo los bytes al revés.
 *   2. Las horas vienen en UTC. Aquí se pasan a Nicaragua (UTC-6),
 *      igual que hace src/lib/tiempo.ts, o los mensajes de la
 *      medianoche se irían al día siguiente.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const PRIVADO = path.join(RAIZ, 'private')
const ENTRADA = path.join(PRIVADO, 'instagram_export.json')

const NOMBRE_OSITO = 'Armando Alguera Arróliga'
const NOMBRE_OSITA = 'Jennifer Torrez'

/** Nicaragua no cambia de hora nunca: siempre UTC-6. */
const NICARAGUA_MS = 6 * 60 * 60 * 1000

if (!existsSync(ENTRADA)) {
  console.error(`
  ✗ No encontré  private/instagram_export.json

    En Instagram: Configuración → Centro de cuentas → Tu información y permisos
    → Descargar tu información → formato JSON. Dentro del zip, el archivo está en
    your_instagram_activity/messages/inbox/<usuario>/message_1.json
  `)
  process.exit(1)
}

// ── Arreglo de la codificación ────────────────────────────────────
// "ArrÃ³liga" son en realidad los bytes UTF-8 de "ó" leídos
// como latin-1. Al revertirlo vuelven las tildes, las ñ y los emojis.
const arreglar = (texto) => {
  if (typeof texto !== 'string') return texto
  const vuelta = Buffer.from(texto, 'latin1').toString('utf8')
  // Si la reinterpretación produjo caracteres de reemplazo, el texto ya
  // estaba bien y lo dejamos como estaba.
  return vuelta.includes('�') ? texto : vuelta
}

// ── Lectura ───────────────────────────────────────────────────────
const crudo = JSON.parse(readFileSync(ENTRADA, 'utf8'))

if (!Array.isArray(crudo.messages)) {
  console.error('  ✗ Ese JSON no tiene "messages". ¿Es el archivo de la conversación?')
  process.exit(1)
}

const quienDe = (nombre) => {
  const limpio = arreglar(nombre)
  if (limpio === NOMBRE_OSITO) return 'osito'
  if (limpio === NOMBRE_OSITA) return 'osita'
  return null // Meta AI y cualquier otro invitado inesperado
}

/** Los avisos automáticos de Instagram, que no son conversación. */
const RUIDO = [
  /^Liked a message$/i,
  /^[^ ]+ (envió|envio|sent) (un|una|an) (archivo adjunto|attachment)/i,
  /^Te enviaron un mensaje/i,
  /^Esta cuenta ya no está disponible/i,
]

const fechaNicaragua = (ms) => {
  const local = new Date(ms - NICARAGUA_MS)
  return {
    fecha: local.toISOString().slice(0, 10),
    hora: local.getUTCHours(),
    minuto: local.getUTCMinutes(),
  }
}

const esReel = (link) => /instagram\.com\/(reel|p|tv)\//i.test(link ?? '')

// ── Conversión ────────────────────────────────────────────────────
const mensajes = []
let descartados = 0

for (const m of crudo.messages) {
  const de = quienDe(m.sender_name)
  if (!de) {
    descartados++
    continue
  }

  const { fecha, hora, minuto } = fechaNicaragua(m.timestamp_ms)
  const contenido = m.content ? arreglar(m.content) : ''
  const esAviso = RUIDO.some((r) => r.test(contenido))

  // Qué es este mensaje, en orden de prioridad.
  let tipo = 'texto'
  let texto = contenido

  if (m.share) {
    tipo = esReel(m.share.link) ? 'reel' : 'enlace'
    // El "content" de un reel es siempre "X envió un archivo adjunto":
    // no aporta nada, así que lo vaciamos y guardamos el reel aparte.
    if (esAviso) texto = ''
  } else if (m.photos) {
    tipo = 'foto'
    if (esAviso) texto = ''
  } else if (m.audio_files) {
    tipo = 'audio'
    if (esAviso) texto = ''
  } else if (esAviso || !contenido.trim()) {
    descartados++
    continue
  }

  // El timestamp exacto: hace falta para desempatar los mensajes del mismo
  // minuto, que en estos dos son la mayoría.
  const mensaje = { de, fecha, hora, minuto, ts: m.timestamp_ms, texto, tipo, fuente: 'instagram' }

  if (m.share) {
    mensaje.compartido = {
      link: arreglar(m.share.link ?? ''),
      // El pie del reel: no es lo que ellos escribieron, pero muchas veces
      // es justo lo que quisieron decir.
      texto: m.share.share_text ? arreglar(m.share.share_text) : undefined,
      autor: m.share.original_content_owner
        ? arreglar(m.share.original_content_owner)
        : undefined,
    }
  }

  if (m.reactions?.length) {
    mensaje.reacciones = m.reactions.map((r) => ({
      // Las reacciones vienen sin el selector de emoji: "❤" en vez de "❤️".
      emoji: arreglar(r.reaction),
      de: quienDe(r.actor) ?? 'osito',
    }))
  }

  mensajes.push(mensaje)
}

// El export viene del más nuevo al más viejo. Lo damos vuelta.
mensajes.sort((a, b) => a.ts - b.ts)

if (mensajes.length === 0) {
  console.error(`
  ✗ No reconocí a ninguno de los dos entre los remitentes.

    Los nombres que esperaba son:
      osito → "${NOMBRE_OSITO}"
      osita → "${NOMBRE_OSITA}"

    Los que trae el archivo:
${[...new Set(crudo.messages.map((m) => arreglar(m.sender_name)))].map((n) => `      · "${n}"`).join('\n')}
  `)
  process.exit(1)
}

// ── Estadísticas ──────────────────────────────────────────────────
const soloTexto = mensajes.filter((m) => m.tipo === 'texto')
const reels = mensajes.filter((m) => m.tipo === 'reel')

const porDia = {}
for (const m of mensajes) (porDia[m.fecha] ??= []).push(m)

const dePersona = (quien, lista) => lista.filter((m) => m.de === quien).length

const emojis = {}
const REGEX_EMOJI = /\p{Extended_Pictographic}/gu
for (const m of soloTexto) {
  for (const e of m.texto.match(REGEX_EMOJI) ?? []) emojis[e] = (emojis[e] ?? 0) + 1
}

const reacciones = {}
for (const m of mensajes) {
  for (const r of m.reacciones ?? []) reacciones[r.emoji] = (reacciones[r.emoji] ?? 0) + 1
}

const dias = Object.keys(porDia).sort()

const estadisticas = {
  fuente: 'instagram',
  totalMensajes: soloTexto.length,
  reels: reels.length,
  fotos: mensajes.filter((m) => m.tipo === 'foto').length,
  audios: mensajes.filter((m) => m.tipo === 'audio').length,
  porPersona: {
    osito: dePersona('osito', soloTexto),
    osita: dePersona('osita', soloTexto),
  },
  reelsPorPersona: {
    osito: dePersona('osito', reels),
    osita: dePersona('osita', reels),
  },
  palabras: {
    osito: soloTexto
      .filter((m) => m.de === 'osito')
      .reduce((n, m) => n + m.texto.split(/\s+/).filter(Boolean).length, 0),
    osita: soloTexto
      .filter((m) => m.de === 'osita')
      .reduce((n, m) => n + m.texto.split(/\s+/).filter(Boolean).length, 0),
  },
  primerDia: dias[0],
  ultimoDia: dias[dias.length - 1],
  diasConversando: dias.length,
  primerMensaje: mensajes[0],
  // Los días de antes de WhatsApp: ahí Instagram es la única memoria que hay.
  antesDeWhatsapp: mensajes.filter((m) => m.fecha < '2024-08-30').length,
  diaMasHablador: Object.entries(porDia)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .map(([fecha, ms]) => ({ fecha, mensajes: ms.length })),
  emojisTop: Object.entries(emojis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([emoji, n]) => ({ emoji, n })),
  reaccionesTop: Object.entries(reacciones)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([emoji, n]) => ({ emoji, n })),
}

// ── Salida ────────────────────────────────────────────────────────
if (!existsSync(PRIVADO)) mkdirSync(PRIVADO, { recursive: true })

writeFileSync(path.join(PRIVADO, 'instagram.json'), JSON.stringify(mensajes), 'utf8')
writeFileSync(
  path.join(PRIVADO, 'instagram-estadisticas.json'),
  JSON.stringify(estadisticas, null, 2),
  'utf8',
)

const n = (x) => x.toLocaleString('es-NI')
console.log(`
  ✓ Listo. Todo guardado en /private (no se sube a GitHub).

    Mensajes de texto ......... ${n(estadisticas.totalMensajes)}
    Reels compartidos ......... ${n(estadisticas.reels)}  (osito ${n(estadisticas.reelsPorPersona.osito)} · osita ${n(estadisticas.reelsPorPersona.osita)})
    Fotos y audios ............ ${n(estadisticas.fotos)} · ${n(estadisticas.audios)}
    Osito ..................... ${n(estadisticas.porPersona.osito)} mensajes, ${n(estadisticas.palabras.osito)} palabras
    Osita ..................... ${n(estadisticas.porPersona.osita)} mensajes, ${n(estadisticas.palabras.osita)} palabras
    Primer mensaje ............ ${estadisticas.primerDia}
    Antes de WhatsApp ......... ${n(estadisticas.antesDeWhatsapp)} mensajes
    Días con conversación ..... ${n(estadisticas.diasConversando)}
    Emojis top ................ ${estadisticas.emojisTop.slice(0, 6).map((e) => e.emoji).join(' ')}
    Descartados ............... ${n(descartados)} (avisos automáticos y Meta AI)

    Para leer un día:  npm run chat:dia -- 2024-08-25
`)
