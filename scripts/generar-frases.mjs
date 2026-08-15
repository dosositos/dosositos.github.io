/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  GENERADOR DE CANDIDATAS PARA "¿QUIÉN DIJO ESTO?"                ║
 * ║                                                                  ║
 * ║  Saca del chat las frases más raras, graciosas y memorables,     ║
 * ║  puntuadas por "rareza". NO filtra nada por decencia ni por      ║
 * ║  intimidad: la revisión la hacés vos a mano después.             ║
 * ║                                                                  ║
 * ║  Uso:  npm run chat:frases                                       ║
 * ║  Sale: private/frases-candidatas.json  (revisalo y quedate con   ║
 * ║        las buenas; luego las pasamos a la web)                   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const PRIVADO = path.join(RAIZ, 'private')
const ENTRADA = path.join(PRIVADO, 'chat.json')

if (!existsSync(ENTRADA)) {
  console.error('  ✗ Falta private/chat.json. Corré primero:  npm run chat:parsear')
  process.exit(1)
}

const mensajes = JSON.parse(readFileSync(ENTRADA, 'utf8')).filter((m) => m.tipo === 'texto')

const MIN = 14
const MAX = 160

// Palabras vacías: no aportan rareza
const COMUNES = new Set(
  `de la que el en y a los se del las un por con no una su para es al lo como mas pero sus le ya o
   este si porque esta entre cuando muy sin sobre tambien me hasta hay donde quien desde todo nos
   durante todos uno les ni contra otros ese eso ante ellos e esto mi antes algunos unos yo otro
   otras otra tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo
   nosotros vos vo te ok jaja jajaja si no ya bueno bien`.split(/\s+/),
)

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\wáéíóúñü\s]/g, ' ')

// ── Frecuencia global de palabras (para medir rareza) ─────────────
const frecuencia = new Map()
for (const m of mensajes) {
  for (const p of normalizar(m.texto).split(/\s+/)) {
    if (p.length > 2 && !COMUNES.has(p)) frecuencia.set(p, (frecuencia.get(p) ?? 0) + 1)
  }
}

// ── Puntuación de "esto suena raro y me da risa" ──────────────────
function puntuar(texto) {
  let puntos = 0
  const palabras = normalizar(texto).split(/\s+/).filter((p) => p.length > 2 && !COMUNES.has(p))
  if (palabras.length < 3) return 0

  // Palabras poco frecuentes: el corazón del asunto
  const rarezas = palabras.map((p) => 1 / Math.log2((frecuencia.get(p) ?? 1) + 2))
  puntos += (rarezas.reduce((a, b) => a + b, 0) / palabras.length) * 40

  // Señales de frase memorable
  if (/[!¡]/.test(texto)) puntos += 6
  if (/\?/.test(texto) && texto.length < 90) puntos += 4
  if (/\b(jaja|jeje|jiji)/i.test(texto)) puntos += 3
  if (/\b(nunca|siempre|jamás|jamas|te juro|en serio|de verdad|obvio|literal)\b/i.test(texto)) puntos += 8
  if (/\b(amo|amor|extraño|extrano|abrazo|beso|sushi|oso|osit)/i.test(texto)) puntos += 7
  if (/(.)\1{3,}/.test(texto)) puntos += 5 // "holaaaaa"
  if (/\b[A-ZÁÉÍÓÚÑ]{4,}\b/.test(texto)) puntos += 4 // GRITANDO

  // Penalizaciones
  if (/https?:\/\//.test(texto)) puntos -= 30
  if (/^\d+$/.test(texto.trim())) puntos -= 20
  if (texto.length > 140) puntos -= 8

  return Math.max(0, puntos)
}

// ── Candidatas individuales ───────────────────────────────────────
const vistas = new Set()
const candidatas = []

for (const m of mensajes) {
  const texto = m.texto.trim()
  if (texto.length < MIN || texto.length > MAX) continue

  const llave = normalizar(texto).replace(/\s+/g, ' ').trim()
  if (vistas.has(llave)) continue
  vistas.add(llave)

  const puntos = puntuar(texto)
  if (puntos <= 0) continue

  candidatas.push({
    texto,
    respuesta: m.de,
    fecha: m.fecha,
    hora: `${m.hora}:${String(m.minuto).padStart(2, '0')}`,
    puntos: Math.round(puntos * 10) / 10,
    aprobada: false, // ← ponelo en true en las que te gusten
    pista: '',
  })
}

candidatas.sort((a, b) => b.puntos - a.puntos)

// ── Frases que dijeron LOS DOS (opción "ambos") ───────────────────
const porFrase = new Map()
for (const m of mensajes) {
  const t = m.texto.trim()
  if (t.length < MIN || t.length > 90) continue
  const llave = normalizar(t).replace(/\s+/g, ' ').trim()
  const registro = porFrase.get(llave) ?? { texto: t, osito: 0, osita: 0 }
  registro[m.de]++
  porFrase.set(llave, registro)
}

const ambos = [...porFrase.values()]
  .filter((r) => r.osito >= 2 && r.osita >= 2)
  .map((r) => ({
    texto: r.texto,
    respuesta: 'ambos',
    vecesOsito: r.osito,
    vecesOsita: r.osita,
    puntos: Math.round(puntuar(r.texto) * 10) / 10,
    aprobada: false,
    pista: '',
  }))
  .sort((a, b) => b.puntos - a.puntos)
  .slice(0, 120)

const salida = {
  generado: new Date().toISOString(),
  instrucciones:
    'Poné "aprobada": true en las que quieras que salgan en el juego. Podés editar el texto y agregar una "pista" que se muestra tras responder. Luego decime y las paso a la web.',
  individuales: candidatas.slice(0, 500),
  ambos,
}

writeFileSync(path.join(PRIVADO, 'frases-candidatas.json'), JSON.stringify(salida, null, 2), 'utf8')

console.log(`
  ✓ private/frases-candidatas.json

    Candidatas individuales ... ${candidatas.length.toLocaleString('es-NI')} (guardé las 500 mejores)
    Frases que dijeron los dos . ${ambos.length}

    Abrilo, poné "aprobada": true en las que te gusten y avisame.
    Las mejores 10 según el puntaje, para que veas si va bien encaminado:
`)

for (const c of candidatas.slice(0, 10)) {
  console.log(`    [${c.respuesta}] ${c.texto.replace(/\n/g, ' ').slice(0, 90)}`)
}
