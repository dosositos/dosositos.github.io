/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  UN DÍA COMO HOY                                                 ║
 * ║                                                                  ║
 * ║  Para cada día del calendario busca en el chat el mejor pedacito ║
 * ║  de conversación que hubo ese mismo día y mes, en cada año, y lo ║
 * ║  deja listo para la portada.                                     ║
 * ║                                                                  ║
 * ║  Uso:                                                            ║
 * ║    npm run dia:preparar                                          ║
 * ║    npm run dia:preparar -- --ver 11-24    (ver lo que eligió)    ║
 * ║                                                                  ║
 * ║  Salida: private/publicable/dia-como-hoy-01.json … -12.json      ║
 * ║  (uno por mes, para que el teléfono solo baje el mes de hoy).    ║
 * ║  El cifrado va encadenado en el mismo npm run.                   ║
 * ║                                                                  ║
 * ║  Lo que elige es automático, así que puede quedar flojo. Los     ║
 * ║  archivos son JSON legible: si un día no te gusta, editalo a     ║
 * ║  mano — al guardarlo se vuelve a cifrar y este script no lo      ║
 * ║  pisa mientras no lo corrás de nuevo.                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const WHATSAPP = path.join(RAIZ, 'private', 'chat.json')
const INSTAGRAM = path.join(RAIZ, 'private', 'instagram.json')
const DESTINO = path.join(RAIZ, 'private', 'publicable')

/**
 * Cuántas burbujas se enseñan. Siete y no seis por los aniversarios: la
 * carta de ella ocupa cinco mensajes y con seis ya no cabía la
 * respuesta de él, así que el mejor día del año se quedaba fuera.
 */
const BURBUJAS = 7
/** Menos de esto no es una conversación, es un mensaje suelto. */
const MINIMO = 4
/** Si entre dos mensajes del mismo se pasa de esto, ya es otra charla. */
const HUECO_MAX = 12 * 60 * 1000
/**
 * Entre el último mensaje de uno y la respuesta del otro sí se permiten
 * horas. Lo que más vale la pena enseñar — los aniversarios, los
 * cumpleaños — casi nunca es una charla: es ella escribiendo cuatro
 * mensajes a las 7 de la mañana y él contestando a las 9, cuando salió
 * de clase. Pidiendo conversación seguida, eso se perdía entero.
 */
const HUECO_RESPUESTA = 3 * 60 * 60 * 1000
/** Por debajo de esta nota, el día se queda sin recuerdo. */
const NOTA_MINIMA = 7
/** Cuántos años enseñar como mucho de un mismo día. */
const MAX_POR_DIA = 3

const args = process.argv.slice(2)
const iVer = args.indexOf('--ver')
const verDia = iVer !== -1 ? args[iVer + 1] : null

// ── El chat ────────────────────────────────────────────────────────

const cargar = (archivo, fuente) => {
  if (!existsSync(archivo)) return []
  return JSON.parse(readFileSync(archivo, 'utf8')).map((m) => ({ ...m, fuente }))
}

const mensajes = [...cargar(WHATSAPP, 'whatsapp'), ...cargar(INSTAGRAM, 'instagram')].sort(
  (a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1
    const minutos = a.hora * 60 + a.minuto - (b.hora * 60 + b.minuto)
    return minutos !== 0 ? minutos : (a.ts ?? 0) - (b.ts ?? 0)
  },
)

if (mensajes.length === 0) {
  console.error(`
  ✗ No hay ningún chat leído todavía. Corré:

      npm run chat:parsear     (WhatsApp)
      npm run chat:instagram   (Instagram)
  `)
  process.exit(1)
}

// ── Lo que nunca puede salir publicado ─────────────────────────────
// Estos mensajes no pasaron por la revisión de nadie: los elige un
// script. Así que primero se descarta todo lo que no debería aparecer
// en una portada, aunque sea entre ellos dos.

/** Correos, contraseñas, códigos y números largos. */
const CREDENCIAL =
  /(\b(pass|password|contrase[ñn]a|clave|c[óo]digo|pin|otp|token|usuario|user)\b\s*[:=]|[\w.+-]+@[\w-]+\.[a-z]{2,}|\b\d{8,}\b|\b(?:\d[ -]?){13,19}\b)/i

/** Enlaces y ubicaciones: en una burbuja suelta no se entienden. */
const ENLACE = /https?:\/\/|www\./i

/**
 * Lo subido de tono. No es censura — está en el chat y ahí se queda —,
 * pero que lo elija un script y le aparezca a ella en la portada, sin
 * que ninguno de los dos lo haya visto antes, es otra cosa.
 */
const SUBIDO =
  /\b(pipi|pene|verga|nalgas|culo|tetas?|senos|pez[oó]n|sexo|sexual|desnud\w*|cond[oó]n|masturb\w*|orgasmo|cachond\w*|calient\w*|chupar|mojad\w*|excitad\w*)\b/i

/** Los días malos también son nuestros, pero no son para la portada. */
const TENSION = /\b(enojad\w*|molest\w*|pelea\w*|discutir|discusi[oó]n|llor\w+|celos\w*)\b/i

/** Restos del export que no escribió ninguno de los dos. */
const limpiar = (texto) =>
  texto
    .replace(/<Se edit[óo] este mensaje\.?>/gi, '')
    .replace(/\b(sticker|imagen|video|audio|GIF)\s+omitid[oa]\b/gi, '')
    .replace(/[‎‏]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()

// ── Qué tan bueno es un mensaje para enseñarlo suelto ──────────────

const CARINO =
  /\b(te quiero|te amo|amor|mi vida|hermosa?|lind[oa]s?|preciosa?|bonit[oa]s?|gracias|feliz|extra[ñn]\w+|bendici[oó]n|abrazo|beso|mua|sonrisa|orgullos[oa]|te extra[ñn]o|mi osit[oa])\b/i
const RISA = /\b(jaja\w*|jeje\w*|jajaj|JAJA\w*)\b/i
/** Los días marcados: si el día es el cumpleaños, que salga el cumpleaños. */
const HITO =
  /\b(cumplea[ñn]os|feliz a[ñn]o|a[ñn]o nuevo|navidad|nochebuena|aniversario|mesiversario|felicidades|feliz d[ií]a|un mes|meses juntos|primer d[ií]a)\b/i
/** Lo que se dicen todos los días: no distingue a un día de otro. */
const RUTINA =
  /^(buenos? d[ií]as?|buenas? (tardes?|noches?)|hola+|holaa+|ya vine|ya llegu[eé]|llegu[eé]|descansa|ta bien|okok\w*|s[ií]p+|ya|mua)\b/i

const esTexto = (m) => (m.fuente === 'instagram' ? m.tipo === 'texto' : m.tipo === 'texto')

function puntosDe(texto, m) {
  let p = 0
  const largo = texto.length

  // Los mensajes largos son casi siempre los que valen: las cartas de
  // aniversario, las de cumpleaños. No se castigan por largos — de que
  // la tarjeta no crezca de más se encarga la ventana entera.
  if (largo >= 12) p += 1.5
  else p -= 0.5

  if (CARINO.test(texto)) p += 2.5
  if (RISA.test(texto)) p += 1
  if (HITO.test(texto)) p += 3
  if (texto.includes('?')) p += 0.5
  if (RUTINA.test(texto)) p -= 1.5
  if (TENSION.test(texto)) p -= 2
  if (m.reacciones?.length) p += 1

  return p
}

const cuandoDe = (m) =>
  new Date(
    `${m.fecha}T${String(m.hora).padStart(2, '0')}:${String(m.minuto).padStart(2, '0')}:00-06:00`,
  ).getTime()

const reloj = (m) => {
  const h = m.hora % 12 === 0 ? 12 : m.hora % 12
  return `${h}:${String(m.minuto).padStart(2, '0')} ${m.hora < 12 ? 'a. m.' : 'p. m.'}`
}

// ── El mejor pedazo de cada día ────────────────────────────────────

/** Todos los mensajes agrupados por fecha, y los utilizables aparte. */
const porFecha = new Map()
for (const m of mensajes) {
  let dia = porFecha.get(m.fecha)
  if (!dia) porFecha.set(m.fecha, (dia = { total: 0, usables: [] }))
  dia.total++

  if (!esTexto(m)) continue
  const texto = limpiar(m.texto ?? '')
  if (!texto) continue
  if (CREDENCIAL.test(texto) || ENLACE.test(texto) || SUBIDO.test(texto)) continue

  dia.usables.push({ ...m, texto, puntos: puntosDe(texto, m) })
}

/**
 * La mejor ventana de mensajes seguidos de un día.
 *
 * Tres cosas no se negocian: que hablen los dos y con un mínimo de
 * equilibrio (cinco mensajes míos y un "ok" suyo no es una
 * conversación), que no haya huecos largos en medio — para no pegar la
 * mañana con la noche —, y que la ventana no empiece a media parrafada.
 * Ellos escriben en ráfagas de seis o siete mensajitos seguidos: cortar
 * una por el medio deja empezando en «Mañana las verá», que sin lo de
 * antes no se entiende.
 */
const MISMA_RAFAGA = 3 * 60 * 1000

function mejorVentanaDe(usables) {
  let mejor = null

  for (let i = 0; i < usables.length; i++) {
    const ventana = []
    let suma = 0
    let cambios = 0

    // ¿Estamos cortando a alguien a la mitad de su parrafada?
    const anterior = usables[i - 1]
    const cortaRafaga =
      anterior &&
      anterior.de === usables[i].de &&
      cuandoDe(usables[i]) - cuandoDe(anterior) <= MISMA_RAFAGA

    let esperas = 0

    for (let j = i; j < usables.length && ventana.length < BURBUJAS; j++) {
      const m = usables[j]
      const previo = ventana[ventana.length - 1]

      if (previo) {
        if (m.fuente !== previo.fuente) break

        const hueco = cuandoDe(m) - cuandoDe(previo)
        const respondiendo = m.de !== previo.de

        if (hueco > (respondiendo ? HUECO_RESPUESTA : HUECO_MAX)) break
        if (respondiendo) cambios++
        // Una respuesta de dos horas después se sigue leyendo bien, pero
        // si hay dos opciones parejas gana la conversación seguida.
        if (hueco > HUECO_MAX) esperas++
      }

      ventana.push(m)
      suma += m.puntos

      if (ventana.length < MINIMO) continue

      // Equilibrio: los dos tienen que estar, y el que habla menos tiene
      // que decir algo — dos mensajes, o uno que valga por dos. Sin esto
      // se cuelan las parrafadas de uno con un "ok" del otro al final.
      const mios = ventana.filter((x) => x.de === 'osito')
      const suyos = ventana.filter((x) => x.de === 'osita')
      if (mios.length === 0 || suyos.length === 0) continue

      const letrasDe = (lista) => lista.reduce((n, x) => n + x.texto.length, 0)
      const menor = mios.length <= suyos.length ? mios : suyos
      if (menor.length < 2 && letrasDe(menor) < 40) continue

      // Que la tarjeta de la portada no se vuelva un muro: pasadas unas
      // 700 letras entre todas las burbujas, cada párrafo más resta.
      const letras = ventana.reduce((n, x) => n + x.texto.length, 0)

      // Terminar en "ya estoy en casa" desinfla cualquier recuerdo.
      const cierraFlojo = RUTINA.test(ventana[ventana.length - 1].texto)

      const nota =
        suma +
        cambios * 0.8 +
        ventana.length * 0.2 -
        esperas * 0.5 -
        Math.max(0, letras - 700) / 300 -
        (cortaRafaga ? 1.5 : 0) -
        (cierraFlojo ? 1 : 0)
      if (!mejor || nota > mejor.nota) mejor = { nota, mensajes: [...ventana] }
    }
  }

  return mejor
}

const burbuja = (m) => ({
  de: m.de,
  texto: m.texto,
  hora: reloj(m),
  ...(m.reacciones?.length ? { reaccion: m.reacciones[0].emoji } : {}),
})

/** Los recuerdos, con la llave "MM-DD". */
const recuerdos = new Map()

for (const [fecha, dia] of porFecha) {
  const mejor = mejorVentanaDe(dia.usables)
  if (!mejor || mejor.nota < NOTA_MINIMA) continue

  const llave = fecha.slice(5) // "2024-11-24" → "11-24"
  const lista = recuerdos.get(llave) ?? []
  lista.push({
    fecha,
    fuente: mejor.mensajes[0].fuente,
    total: dia.total,
    nota: mejor.nota,
    mensajes: mejor.mensajes.map(burbuja),
  })
  recuerdos.set(llave, lista)
}

// ── Modo mirón: ver un día sin escribir nada ───────────────────────

if (verDia) {
  const lista = recuerdos.get(verDia)
  if (!lista) {
    console.log(`\n  No hay ningún recuerdo guardado para el ${verDia}.\n`)
    process.exit(0)
  }
  for (const r of lista.sort((a, b) => (a.fecha < b.fecha ? -1 : 1))) {
    console.log(`\n  ── ${r.fecha} · ${r.total} mensajes ese día · nota ${r.nota.toFixed(1)} ──\n`)
    for (const m of r.mensajes) {
      const quien = m.de === 'osito' ? '🐻 osito' : '🎀 osita'
      console.log(`  ${m.hora.padStart(11)}  ${quien}: ${m.texto}${m.reaccion ? `  ${m.reaccion}` : ''}`)
    }
  }
  console.log()
  process.exit(0)
}

// ── A guardar, un archivo por mes ──────────────────────────────────

mkdirSync(DESTINO, { recursive: true })

const LEEME =
  'Un día como hoy: el pedacito de conversación que la portada enseña cada fecha. Lo elige scripts/preparar-dia-como-hoy.mjs con la nota más alta del día, así que nadie lo revisó antes. Si un día no te gusta, cambialo o borralo a mano: al guardar se vuelve a cifrar solo, y este archivo no se vuelve a escribir hasta que corrás `npm run dia:preparar` otra vez.'

let dias = 0
let entradas = 0

for (let mes = 1; mes <= 12; mes++) {
  const mm = String(mes).padStart(2, '0')
  const delMes = {}

  for (const [llave, lista] of [...recuerdos].sort(([a], [b]) => (a < b ? -1 : 1))) {
    if (!llave.startsWith(`${mm}-`)) continue

    delMes[llave] = lista
      .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
      .slice(0, MAX_POR_DIA)
      // La nota era para elegir; publicarla no le sirve a nadie.
      .map(({ nota, ...resto }) => resto)

    dias++
    entradas += delMes[llave].length
  }

  writeFileSync(
    path.join(DESTINO, `dia-como-hoy-${mm}.json`),
    `${JSON.stringify({ _leeme: LEEME, ...delMes }, null, 2)}\n`,
    'utf8',
  )
}

const sinNada = 366 - dias

console.log(`
  ✓ Un día como hoy, listo

    Días del calendario con recuerdo ....... ${dias}
    Pedacitos de conversación en total ..... ${entradas}
    Días sin nada que enseñar .............. ${sinNada}

    12 archivos en private/publicable/ (uno por mes, para que el
    teléfono baje solo el mes que necesita). El cifrado va encadenado
    aquí mismo, así que no hay nada más que hacer.

    Para ver qué eligió un día:

      npm run dia:preparar -- --ver 11-24
`)
