/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EL EXPEDIENTE DE CADA PALABRA                                   ║
 * ║                                                                  ║
 * ║  Arma  private/publicable/diccionario.json  con lo que el chat   ║
 * ║  sabe de cada entrada del diccionario:                           ║
 * ║                                                                  ║
 * ║    · el nacimiento — el pedazo de conversación donde la palabra  ║
 * ║      apareció por primera vez, con las burbujas de alrededor;    ║
 * ║    · la curva de uso mes a mes, para dibujarla en la ficha;      ║
 * ║    · y, en las tres entradas que son una frase entera, el propio ║
 * ║      título, que no puede vivir en claro en src/.                ║
 * ║                                                                  ║
 * ║  Nada de esto se publica sin cifrar: el archivo que escribe va   ║
 * ║  a private/publicable/, y el hook lo convierte en               ║
 * ║  public/cifrado/diccionario.enc.                                ║
 * ║                                                                  ║
 * ║  Uso:  npm run diccionario:preparar                              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const p = (...t) => path.join(RAIZ, ...t)

/**
 * Cuántas burbujas se guardan a cada lado del mensaje que estrena la
 * palabra. Con tres a cada lado la escena se entiende, pero la hoja se
 * quedaba sin sitio para la curva de uso: dos y dos alcanzan.
 */
const ALREDEDOR = 2

/* ── Las dos fuentes, juntas y en orden ─────────────────────────── */

function cargar() {
  const wa = existsSync(p('private/chat.json'))
    ? JSON.parse(readFileSync(p('private/chat.json'), 'utf8'))
    : []
  const ig = existsSync(p('private/instagram.json'))
    ? JSON.parse(readFileSync(p('private/instagram.json'), 'utf8'))
    : []

  return [...wa.map((m) => ({ ...m, fuente: m.fuente ?? 'whatsapp' })), ...ig]
    .filter((m) => typeof m.texto === 'string' || m.tipo !== 'texto')
    .sort((a, b) =>
      a.fecha === b.fecha ? a.hora * 60 + a.minuto - (b.hora * 60 + b.minuto) : a.fecha.localeCompare(b.fecha),
    )
}

const sinTildes = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-̂̈]/g, '').normalize('NFC')
const limpiar = (s) => (s ?? '').replace(/<Se editó este mensaje\.>/g, '').trim()

/** Los bordes de palabra de JS no sirven con ñ ni con tildes. */
const L = 'a-zñáéíóúü'
const conBordes = (patron) => new RegExp(`(?:^|[^${L}])(?:${patron})(?:[^${L}]|$)`, 'i')

/* ── El expediente de una palabra ───────────────────────────────── */

function expediente(mensajes, ficha) {
  const re = conBordes(ficha.patron)
  const texto = (m) => (m.tipo === 'texto' ? limpiar(m.texto) : '')
  const coincide = (m) => texto(m) && re.test(sinTildes(texto(m)))

  const usos = mensajes.filter(coincide)
  if (!usos.length) return null

  /* El momento que se muestra: normalmente el primero de todos —el
     nacimiento de la palabra—, salvo que la ficha ancle otro. */
  let indice = mensajes.indexOf(usos[0])
  if (ficha.ancla) {
    const buscado = sinTildes(ficha.ancla.texto)
    const anclado = mensajes.findIndex(
      (m) => m.fecha === ficha.ancla.fecha && sinTildes(texto(m)).includes(buscado),
    )
    if (anclado >= 0) indice = anclado
  }

  const centro = mensajes[indice]
  const desde = Math.max(0, indice - ALREDEDOR)
  const hasta = Math.min(mensajes.length - 1, indice + ALREDEDOR)

  /* El contexto no cambia de fuente, y no se va más de un día del
     centro: una burbuja de la semana pasada al lado no es contexto, es
     ruido. Se admite el día de al lado porque media conversación de
     ellos pasa la medianoche —«chi mi amor» es de las 00:00— y cortar
     ahí dejaría la burbuja sola. */
  const dia = (f) => Date.parse(`${f}T12:00:00Z`)
  const alrededor = mensajes
    .slice(desde, hasta + 1)
    .filter(
      (m) =>
        Math.abs(dia(m.fecha) - dia(centro.fecha)) <= 86_400_000 &&
        (m.fuente ?? 'whatsapp') === (centro.fuente ?? 'whatsapp'),
    )

  const nacimiento = {
    fecha: centro.fecha,
    fuente: centro.fuente ?? 'whatsapp',
    mensajes: alrededor.map((m) => ({
      de: m.de,
      texto: limpiar(m.texto),
      tipo: m.tipo ?? 'texto',
      ...(m === centro ? { esLaFrase: true } : {}),
    })),
  }

  /* La curva de uso, mes a mes: cuántas veces se dijo y —para las
     fórmulas que crecen— cuánto medía de largo. */
  const porMes = new Map()
  for (const m of usos) {
    const mes = m.fecha.slice(0, 7)
    const e = porMes.get(mes) ?? { veces: 0, suma: 0 }
    e.veces++
    e.suma += texto(m).length
    porMes.set(mes, e)
  }

  const serie = [...porMes.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mes, e]) => ({ mes, veces: e.veces, largo: Math.round(e.suma / e.veces) }))

  const resultado = { nacimiento, serie }

  /* Las entradas que son una frase entera llevan su propio título acá,
     porque en src/ no puede vivir ni una palabra de la conversación. */
  if (ficha.lema) {
    const reCanonica = ficha.formaCanonica ? conBordes(ficha.formaCanonica) : re
    const candidatos = usos.filter((m) => reCanonica.test(sinTildes(texto(m))))
    const elegido = candidatos.length ? candidatos : usos
    // El más largo de los que llevan la fórmula: es el que la trae
    // entera y no a medias.
    const mejor = elegido.reduce((a, b) => (texto(a).length > texto(b).length ? a : b))
    const t = texto(mejor)

    /* El título arranca donde arranca la fórmula —no donde arranque el
       mensaje, que suele traer media parrafada antes— y se corta en una
       palabra completa. Un lema de diccionario tiene que caber en dos
       renglones; el largo verdadero se cuenta aparte, y ese número es
       justamente parte de la gracia. */
    const plano = sinTildes(t)
    const donde = ficha.formaCanonica ? plano.search(new RegExp(ficha.formaCanonica, 'i')) : 0
    let titulo = t.slice(Math.max(0, donde)).trim()
    const MAXIMO = 74
    if (titulo.length > MAXIMO) {
      const cortado = titulo.slice(0, MAXIMO)
      const ultimo = cortado.lastIndexOf(' ')
      titulo = `${cortado.slice(0, ultimo > 40 ? ultimo : MAXIMO).replace(/[,;:.\s]+$/, '')}…`
    }
    resultado.lema = titulo[0].toUpperCase() + titulo.slice(1)
    resultado.lemaLargo = t.length
  }

  return resultado
}

/* ── A trabajar ─────────────────────────────────────────────────── */

const mensajes = cargar()
if (!mensajes.length) {
  console.error('\n  No encontré private/chat.json ni private/instagram.json.')
  console.error('  Corré antes:  npm run chat:parsear  y  npm run chat:instagram\n')
  process.exit(1)
}

const rutaPatrones = p('private/diccionario-patrones.json')
if (!existsSync(rutaPatrones)) {
  console.error('\n  Falta private/diccionario-patrones.json (qué buscar por cada entrada).\n')
  process.exit(1)
}

const { entradas: fichas } = JSON.parse(readFileSync(rutaPatrones, 'utf8'))

console.log(`\n  ${mensajes.length.toLocaleString('es-NI')} mensajes · ${Object.keys(fichas).length} entradas\n`)

const salida = {}
let vacias = 0

for (const [id, ficha] of Object.entries(fichas)) {
  const exp = expediente(mensajes, ficha)
  if (!exp) {
    console.log(`  ✗ ${id.padEnd(24)} sin rastro en el chat`)
    vacias++
    continue
  }
  salida[id] = exp
  const meses = exp.serie.length
  const total = exp.serie.reduce((s, x) => s + x.veces, 0)
  console.log(
    `  ✓ ${id.padEnd(24)} ${String(total).padStart(5)} usos · ${String(meses).padStart(2)} meses · ` +
      `${exp.nacimiento.mensajes.length} burbujas${exp.lema ? ' · con título propio' : ''}`,
  )
}

const destino = p('private/publicable/diccionario.json')
writeFileSync(
  destino,
  `${JSON.stringify(
    {
      _leeme:
        'El expediente de cada palabra del diccionario: dónde nació (con las burbujas de alrededor), cómo se usó mes a mes, y el título de las entradas que son una frase entera. Lo genera scripts/preparar-diccionario.mjs a partir de los dos chats. NO se edita a mano.',
      generado: new Date().toISOString().slice(0, 10),
      entradas: salida,
    },
    null,
    1,
  )}\n`,
)

console.log(`\n  → ${path.relative(RAIZ, destino)}`)
if (vacias) console.log(`  ${vacias} entradas quedaron sin expediente.`)
console.log('  Ahora corré  npm run secretos:cifrar  (o guardá el archivo y lo hace el hook).\n')
