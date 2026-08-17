/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  DE LAS FRASES APROBADAS AL JUEGO                                ║
 * ║                                                                  ║
 * ║  Toma lo que aprobaste en private/frases-candidatas.json y arma  ║
 * ║  private/publicable/juego.json, que el hook cifra enseguida.     ║
 * ║  Hace tres cosas:                                                ║
 * ║                                                                  ║
 * ║  1. EMPAREJA LA FORMA DE ESCRIBIR. Osito escribe en minúscula,   ║
 * ║     abrevia ("m", "t", "q", "cn") y se come tildes; osita        ║
 * ║     empieza en mayúscula y escribe completo. Con eso, la          ║
 * ║     primera letra ya resolvía el juego. La tabla de equivalencias ║
 * ║     vive en private/juego-normalizacion.json.                    ║
 * ║     Lo que NO se toca: dedazos, risas, alargues y palabras        ║
 * ║     inventadas de ustedes — eso es lo gracioso y está repartido.  ║
 * ║                                                                  ║
 * ║  2. LE PONE CONTEXTO. Tres mensajes antes y tres después,        ║
 * ║     para que al responder se vea de dónde salió la frase. Casi   ║
 * ║     todo el chiste vive ahí ("Ayote con queso amor").            ║
 * ║                                                                  ║
 * ║  3. MEZCLA LAS INVENTADAS de private/frases-inventadas.json,     ║
 * ║     para que "ninguno de los dos" pueda ser la respuesta buena.  ║
 * ║                                                                  ║
 * ║  Uso:  npm run juego:preparar                                    ║
 * ║  Sale: private/publicable/juego.json  →  public/cifrado/juego.enc ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { huellaDelJuego } from './huella-juego.mjs'

const RAIZ = path.resolve(import.meta.dirname, '..')
const PRIVADO = path.join(RAIZ, 'private')
const PUBLICABLE = path.join(PRIVADO, 'publicable')

const CANDIDATAS = path.join(PRIVADO, 'frases-candidatas.json')
const INVENTADAS = path.join(PRIVADO, 'frases-inventadas.json')
const NORMALIZACION = path.join(PRIVADO, 'juego-normalizacion.json')
const SALIDA = path.join(PUBLICABLE, 'juego.json')

/** Cuántos mensajes de contexto a cada lado. Con menos no se entiende nada. */
const CONTEXTO = 3
/** Si el vecino está a más de esto, ya es otra conversación. */
const HORAS_DE_DISTANCIA = 3
/** Los mensajes largos del contexto se recortan: es contexto, no lectura. */
const LARGO_CONTEXTO = 240

const leerJson = (ruta) => (existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : null)

// ══ Lo que hay ═════════════════════════════════════════════════════

const candidatas = leerJson(CANDIDATAS)
if (!candidatas) {
  console.error(`
  ✗ No existe private/frases-candidatas.json. Generalo con:

      npm run chat:frases

    y aprobá las que te gusten ("aprobada": true).
  `)
  process.exit(1)
}

const tabla = leerJson(NORMALIZACION) ?? {}
const abreviaciones = tabla.abreviaciones ?? {}
const ortografia = tabla.ortografia ?? {}
const interrogativas = tabla.interrogativas ?? {}
const nombres = tabla.nombres ?? {}
const correcciones = tabla.correcciones ?? {}

const cargarChat = (archivo, fuente) => {
  const datos = leerJson(path.join(PRIVADO, archivo))
  if (!datos) return []
  return datos.map((m) => ({ ...m, fuente }))
}

const porFuente = {
  whatsapp: cargarChat('chat.json', 'whatsapp'),
  instagram: cargarChat('instagram.json', 'instagram'),
}

for (const lista of Object.values(porFuente)) {
  lista.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1
    const minutos = a.hora * 60 + a.minuto - (b.hora * 60 + b.minuto)
    return minutos !== 0 ? minutos : (a.ts ?? 0) - (b.ts ?? 0)
  })
}

if (porFuente.whatsapp.length + porFuente.instagram.length === 0) {
  console.error(`
  ✗ No hay ningún chat leído. Sin él no puedo sacar el contexto de las frases:

      npm run chat:parsear     (WhatsApp)
      npm run chat:instagram   (Instagram)
  `)
  process.exit(1)
}

// ══ Normalizar ═════════════════════════════════════════════════════

const sinTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Para comparar dos frases sin que estorben tildes, signos ni mayúsculas. */
const llaveDe = (t) =>
  sinTildes(t.toLowerCase())
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Risas puras: JAJAJA, KAJAJAKAK, JSJSJS. Se dejan tal cual salieron. */
const esRisa = (linea) => /^[jaksieh\s!¡.]+$/i.test(linea) && /[jk]/i.test(linea)

/** Frases que ya venían gritadas: son de los dos y no delatan a nadie. */
const esGrito = (linea) => {
  const letras = linea.replace(/[^\p{L}]/gu, '')
  return letras.length >= 3 && letras === letras.toUpperCase()
}

/** Si la palabra original iba con mayúscula, la que la reemplaza también. */
const comoVenia = (original, nueva) =>
  /^\p{Lu}/u.test(original) ? nueva[0].toUpperCase() + nueva.slice(1) : nueva

/**
 * Un patrón que encuentra un nombre propio escrito de cualquier forma:
 * "rubén darío", "ruben dario" y "Rubén Darío" entran por la misma llave.
 */
const VARIANTES = { a: 'aáà', e: 'eéè', i: 'iíì', o: 'oóò', u: 'uúùü', n: 'nñ', c: 'cç' }

function patronDeNombre(clave) {
  const cuerpo = sinTildes(clave.toLowerCase())
    .split('')
    .map((c) => {
      if (VARIANTES[c]) return `[${VARIANTES[c]}${VARIANTES[c].toUpperCase()}]`
      if (c === ' ') return '\\s+'
      return c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('')
  return new RegExp(`(?<![\\p{L}\\p{M}])${cuerpo}(?![\\p{L}\\p{M}])`, 'giu')
}

const patronesDeNombres = Object.entries(nombres)
  .filter(([clave]) => !clave.startsWith('_'))
  .map(([clave, forma]) => [patronDeNombre(clave), forma])

/** Palabra por palabra: abreviaciones y ortografía. */
function corregirPalabras(texto) {
  return texto.replace(/[\p{L}\p{M}']+/gu, (palabra) => {
    const llave = palabra.toLowerCase()
    const reemplazo = abreviaciones[llave] ?? ortografia[llave]
    return reemplazo ? comoVenia(palabra, reemplazo) : palabra
  })
}

/**
 * Las interrogativas sólo se tildan cuando abren la pregunta.
 * A media frase, "que" y "como" casi siempre son otra cosa
 * ("es cierto que venís?") y tildarlas sería el error contrario.
 */
function tildarInterrogativas(linea) {
  if (!linea.includes('?')) return linea
  return linea.replace(/^([¿¡\s"']*)([\p{L}\p{M}]+)/u, (todo, previo, palabra) => {
    const forma = interrogativas[palabra.toLowerCase()]
    return forma ? previo + comoVenia(palabra, forma) : todo
  })
}

/**
 * Mayúscula al empezar la línea y después de cada punto — salvo cuando
 * el punto es de una abreviatura ("Floyd Mayweather Jr. versión nica"),
 * que se reconoce porque lo que va antes son tres letras o menos.
 */
function capitalizar(linea) {
  return linea.replace(
    /(^|[.!?…]["')\]]?\s+|[¿¡])([^\p{L}]*)(\p{L})/gu,
    (todo, antes, relleno, letra, posicion, completa) => {
      if (/[.!?…]/.test(antes)) {
        const previa = completa.slice(0, posicion).match(/(\p{L}+)$/u)
        if (previa && previa[1].length <= 3) return todo
      }
      return antes + relleno + letra.toUpperCase()
    },
  )
}

/**
 * El emparejador. `conCorrecciones` sólo para las frases del juego:
 * el contexto se lee después de responder, así que ahí basta con la
 * pasada automática.
 */
function normalizar(texto, { conCorrecciones = false } = {}) {
  if (conCorrecciones && texto in correcciones) return correcciones[texto]

  return texto
    .split('\n')
    .map((linea) => {
      if (!linea.trim()) return linea
      if (esRisa(linea) || esGrito(linea)) return linea

      let salida = corregirPalabras(linea)
      for (const [patron, forma] of patronesDeNombres) salida = salida.replace(patron, forma)
      salida = tildarInterrogativas(salida)
      return capitalizar(salida)
    })
    .join('\n')
}

// ══ Lo que no puede salir publicado ════════════════════════════════

// Correos, contraseñas, códigos y números largos. En las frases ya lo
// filtra generar-frases.mjs, pero el contexto no pasó por tu revisión:
// son mensajes vecinos que nadie leyó.
const CREDENCIAL =
  /(\b(pass|password|contrase[ñn]a|clave|c[óo]digo|pin|otp|token|usuario|user)\b\s*[:=]|[\w.+-]+@[\w-]+\.[a-z]{2,}|\b\d{8,}\b|\b(?:\d[ -]?){13,19}\b)/i

/** Restos del export: no los escribió ninguno de los dos. */
const BASURA = /^(reacted .* to your message|.*<se edit[óo] este mensaje>.*)$/i

// ══ El chat, listo para buscar ═════════════════════════════════════

const cuandoDe = (m) => new Date(`${m.fecha}T${String(m.hora).padStart(2, '0')}:${String(m.minuto).padStart(2, '0')}:00-06:00`).getTime()

const reloj = (m) => {
  const h = m.hora % 12 === 0 ? 12 : m.hora % 12
  return `${h}:${String(m.minuto).padStart(2, '0')} ${m.hora < 12 ? 'a. m.' : 'p. m.'}`
}

/** Cómo se ve en el chat un mensaje que no es texto. */
function tipoVisible(m) {
  if (m.fuente === 'instagram') {
    if (m.tipo === 'reel' || m.tipo === 'enlace') return 'reel'
    if (m.tipo === 'foto') return 'foto'
    if (m.tipo === 'audio') return 'audio'
    return 'texto'
  }
  if (m.tipo !== 'multimedia') return 'texto'
  const t = m.texto.toLowerCase()
  if (t.includes('sticker')) return 'sticker'
  if (t.includes('gif')) return 'sticker'
  if (t.includes('video')) return 'video'
  if (t.includes('audio')) return 'audio'
  return 'foto'
}

/** Le quita al texto el "imagen omitida" que WhatsApp deja pegado. */
const sinMarcador = (texto) =>
  texto
    .replace(/\b(sticker|imagen|video|audio|GIF)\s+omitid[oa]\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

function burbuja(m, esLaFrase = false) {
  const tipo = tipoVisible(m)
  const crudo = tipo === 'texto' ? m.texto.trim() : sinMarcador(m.texto)
  const recortado = crudo.length > LARGO_CONTEXTO ? `${crudo.slice(0, LARGO_CONTEXTO).trimEnd()}…` : crudo

  return {
    de: m.de,
    texto: recortado ? normalizar(recortado) : '',
    hora: reloj(m),
    ...(tipo !== 'texto' ? { tipo } : {}),
    ...(m.reacciones?.length ? { reaccion: m.reacciones[0].emoji } : {}),
    ...(esLaFrase ? { esLaFrase: true } : {}),
  }
}

/** Los vecinos de un mensaje, sin cruzar a otra conversación. */
function contextoDe(fuente, indice) {
  const lista = porFuente[fuente]
  const centro = lista[indice]
  const cuandoCentro = cuandoDe(centro)
  const limite = HORAS_DE_DISTANCIA * 60 * 60 * 1000

  const vecinos = []
  const tomar = (desde, hasta, paso) => {
    let puestos = 0
    for (let i = desde; i !== hasta && puestos < CONTEXTO; i += paso) {
      const m = lista[i]
      if (!m) break
      if (Math.abs(cuandoDe(m) - cuandoCentro) > limite) break
      if (CREDENCIAL.test(m.texto) || BASURA.test(m.texto)) continue
      vecinos.push([i, m])
      puestos++
    }
  }

  tomar(indice - 1, -1, -1)
  tomar(indice + 1, lista.length, 1)
  vecinos.push([indice, centro])
  vecinos.sort((a, b) => a[0] - b[0])

  return {
    fecha: centro.fecha,
    fuente,
    mensajes: vecinos.map(([i, m]) => burbuja(m, i === indice)),
  }
}

/**
 * Cuánto se parecen dos frases, por palabras compartidas (0 a 1).
 * El primer argumento viene ya como conjunto porque se compara contra
 * miles de mensajes seguidos y armarlo cada vez costaba más que la cuenta.
 */
function parecidoCon(buscadas, llaveCandidata) {
  const palabras = new Set(llaveCandidata.split(' ').filter(Boolean))
  if (buscadas.size === 0 || palabras.size === 0) return 0

  let comunes = 0
  for (const p of palabras) if (buscadas.has(p)) comunes++
  return comunes / (buscadas.size + palabras.size - comunes)
}

/** La llave de cada mensaje, calculada una sola vez para todo el chat. */
const llavesDelChat = {}
for (const [nombre, lista] of Object.entries(porFuente)) {
  llavesDelChat[nombre] = lista.map((m) => (m.tipo === 'texto' ? llaveDe(m.texto) : ''))
}

/**
 * Dónde está exactamente esta frase en el chat.
 *
 * Buscar por texto exacto no alcanza: si arreglaste una frase a mano en
 * frases-candidatas.json ("q" → "que"), ya no coincide letra por letra.
 * Así que se puntúan los candidatos del mismo autor (y del mismo día, si
 * se sabe) y gana el mejor:
 *
 *   texto idéntico          → seguro
 *   igual ya emparejado     → casi seguro (es el mismo mensaje, escrito parejo)
 *   se parece mucho         → probable, y solo si comparten la mayoría de las palabras
 *
 * Antes había una última pasada que, si nada coincidía, se quedaba con
 * cualquier mensaje de ese minuto. Eso resaltaba burbujas ajenas —pasó con
 * «que se empañen los vidrios»—, así que ya no existe: si no hay un
 * candidato claro, la frase se queda sin contexto y el script lo avisa.
 */
const PARECIDO_MINIMO = 0.6

function buscar({ texto, de, fecha, hora, fuente }) {
  const fuentes = fuente ? [fuente] : ['whatsapp', 'instagram']
  const mismaHora = (m) => Boolean(hora) && `${m.hora}:${String(m.minuto).padStart(2, '0')}` === hora

  const llave = llaveDe(texto)
  const llaveEmparejada = llaveDe(normalizar(texto))
  const buscadas = new Set(llaveEmparejada.split(' ').filter(Boolean))

  let mejor = null
  let mejorPuntaje = 0

  for (const nombre of fuentes) {
    const lista = porFuente[nombre] ?? []
    const llaves = llavesDelChat[nombre]

    for (let i = 0; i < lista.length; i++) {
      const m = lista[i]
      if (m.tipo !== 'texto' || m.de !== de) continue
      if (fecha && m.fecha !== fecha) continue

      const suya = llaves[i]
      let puntaje = 0

      if (m.texto.trim() === texto) puntaje = 100
      else if (suya === llave) puntaje = 90
      else {
        // Filtro barato antes de la cuenta cara: si miden muy distinto,
        // no son el mismo mensaje.
        const diferencia = Math.abs(suya.length - llaveEmparejada.length)
        if (diferencia > Math.max(8, llaveEmparejada.length * 0.35)) continue

        const cuanto = parecidoCon(buscadas, suya)
        if (cuanto < PARECIDO_MINIMO) continue

        puntaje =
          llaveDe(normalizar(m.texto)) === llaveEmparejada ? 80 : 40 + Math.round(cuanto * 20)
      }

      // La hora desempata entre las muchas veces que se dijo lo mismo.
      if (mismaHora(m)) puntaje += 5

      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje
        mejor = [nombre, i, puntaje]
        // Texto idéntico y a la misma hora: no hay nada mejor que buscar.
        if (mejorPuntaje >= 105 || (mejorPuntaje === 100 && !hora)) return mejor
      }
    }
  }

  return mejor
}

// ══ Armar las frases ═══════════════════════════════════════════════

const frases = []
const sinContexto = []
const aproximadas = []
const descartadas = []
let numero = 0

const siguienteId = () => `f${String(++numero).padStart(3, '0')}`

// ── Las de uno solo ────────────────────────────────────────────────
for (const f of candidatas.individuales ?? []) {
  if (!f.aprobada) continue

  const texto = normalizar(f.texto, { conCorrecciones: true }).trim()
  if (!texto) {
    descartadas.push(`· «${f.texto.slice(0, 50)}» — la dejaste vacía en las correcciones`)
    continue
  }
  if (CREDENCIAL.test(texto) || BASURA.test(f.texto)) {
    descartadas.push(`· «${f.texto.slice(0, 50)}» — resto del export o dato sensible`)
    continue
  }

  const donde = buscar({
    texto: f.texto,
    de: f.respuesta,
    fecha: f.fecha,
    hora: f.hora,
    fuente: f.fuente,
  })

  if (!donde) sinContexto.push(f.texto.slice(0, 60))
  // Se encontró por parecido, no palabra por palabra: conviene mirarlo,
  // porque el mensaje resaltado podría no ser el correcto.
  else if (donde[2] < 90) aproximadas.push(f.texto.slice(0, 60))

  frases.push({
    id: siguienteId(),
    texto,
    respuesta: f.respuesta,
    fecha: f.fecha,
    fuente: f.fuente,
    ...(f.pista ? { pista: f.pista } : {}),
    contextos: donde ? [contextoDe(donde[0], donde[1])] : [],
  })
}

// ── Las que dijeron los dos ────────────────────────────────────────
// Aquí el contexto va doble: un ejemplo de cada uno, para que se vea
// que de verdad la dicen los dos y no que tuvo suerte el que respondió.
for (const f of candidatas.ambos ?? []) {
  if (!f.aprobada) continue

  const texto = normalizar(f.texto, { conCorrecciones: true }).trim()
  if (!texto) {
    descartadas.push(`· «${f.texto.slice(0, 50)}» — la dejaste vacía en las correcciones`)
    continue
  }

  const contextos = []
  for (const quien of ['osito', 'osita']) {
    const donde = buscar({ texto: f.texto, de: quien })
    if (donde) contextos.push(contextoDe(donde[0], donde[1]))
  }

  frases.push({
    id: siguienteId(),
    texto,
    respuesta: 'ambos',
    veces: { osito: f.vecesOsito, osita: f.vecesOsita },
    fuente: f.fuente,
    ...(f.pista ? { pista: f.pista } : {}),
    contextos,
  })
}

// ── Las inventadas ─────────────────────────────────────────────────
const inventadas = leerJson(INVENTADAS)?.frases ?? []
const dichas = new Set()
for (const lista of Object.values(porFuente)) {
  for (const m of lista) if (m.tipo === 'texto') dichas.add(llaveDe(m.texto))
}

const coincidencias = []
for (const f of inventadas) {
  const texto = f.texto.trim()
  if (!texto) continue

  // Si resulta que sí la dijeron, deja de ser "ninguno de los dos".
  if (dichas.has(llaveDe(texto))) {
    coincidencias.push(texto)
    continue
  }

  frases.push({
    id: siguienteId(),
    texto,
    respuesta: 'ninguno',
    fuente: 'inventado',
    ...(f.pista ? { pista: f.pista } : {}),
    contextos: [],
  })
}

// ══ Guardar ════════════════════════════════════════════════════════

mkdirSync(PUBLICABLE, { recursive: true })

/**
 * La huella de lo aprobado. `npm run revisar` la recalcula antes de
 * compilar: si aprobaste frases nuevas y no volviste a preparar el
 * juego, se entera ahí y no después de publicar.
 */
const huella = huellaDelJuego()

const cuenta = (r) => frases.filter((f) => f.respuesta === r).length

/**
 * ¿Se coló algo que delate quién habla?
 *
 * Es la comprobación de que todo lo de arriba sirvió de algo: si queda
 * una frase que empieza en minúscula o una abreviación sin escribir
 * completa, esa frase se resuelve sin pensar. No detiene nada — se
 * avisa y se arregla con una línea en "correcciones".
 */
const fugas = []
const sospechosas = new Set([...Object.keys(abreviaciones), ...Object.keys(ortografia)])

for (const f of frases) {
  if (f.respuesta === 'ninguno') continue

  const primera = f.texto.match(/\p{L}/u)?.[0]
  if (primera && primera === primera.toLowerCase() && primera !== primera.toUpperCase()) {
    fugas.push(`· empieza en minúscula: «${f.texto.slice(0, 55)}»`)
  }

  for (const palabra of f.texto.match(/[\p{L}\p{M}']+/gu) ?? []) {
    if (sospechosas.has(palabra.toLowerCase())) {
      fugas.push(`· quedó «${palabra}» sin emparejar: «${f.texto.slice(0, 45)}»`)
      break
    }
  }
}

const cabecera = {
  _leeme:
    'Generado por scripts/preparar-juego.mjs — no lo edites a mano: la próxima corrida lo pisa. Para cambiar una frase, tocá private/frases-candidatas.json o la sección "correcciones" de private/juego-normalizacion.json.',
  generado: new Date().toISOString(),
  huella,
  resumen: {
    total: frases.length,
    osito: cuenta('osito'),
    osita: cuenta('osita'),
    ambos: cuenta('ambos'),
    ninguno: cuenta('ninguno'),
    conContexto: frases.filter((f) => f.contextos.length > 0).length,
  },
}

// Una frase por línea, sin sangrar por dentro. Sangrarlo todo lo dejaba
// el doble de grande, y esto se descarga cifrado al teléfono de ella:
// el cifrado no comprime, así que cada espacio se paga en la carga.
const documento = `${JSON.stringify(cabecera, null, 2).slice(0, -2)},
  "frases": [
${frases.map((f) => `    ${JSON.stringify(f)}`).join(',\n')}
  ]
}
`

writeFileSync(SALIDA, documento, 'utf8')

const peso = (documento.length / 1024).toFixed(0)

console.log(`
  ✓ private/publicable/juego.json

    Frases ....................... ${frases.length}
      de osito ................... ${cuenta('osito')}
      de osita ................... ${cuenta('osita')}
      de los dos ................. ${cuenta('ambos')}
      de ninguno (inventadas) .... ${cuenta('ninguno')}
    Con su contexto .............. ${frases.filter((f) => f.contextos.length > 0).length}
    Pesa ......................... ${peso} KB antes de cifrar${
      descartadas.length > 0 ? `\n\n  Saqué ${descartadas.length}:\n${descartadas.map((d) => `    ${d}`).join('\n')}` : ''
    }${
      coincidencias.length > 0
        ? `\n\n  ⚠ Estas "inventadas" resultó que sí las dijeron, así que no pueden ser\n    "ninguno de los dos". Las saqué:\n${coincidencias.map((t) => `    · «${t}»`).join('\n')}`
        : ''
    }${
      sinContexto.length > 0
        ? `\n\n  · ${sinContexto.length} frases se quedaron sin contexto (no las encontré en el chat,\n    casi siempre porque editaste el texto en frases-candidatas.json):\n${sinContexto.slice(0, 8).map((t) => `    · «${t}»`).join('\n')}`
        : ''
    }${
      aproximadas.length > 0
        ? `\n\n  · ${aproximadas.length} las encontré por parecido y no palabra por palabra. Vale la pena\n    mirar que la burbuja resaltada sea la correcta:\n${aproximadas.slice(0, 8).map((t) => `    · «${t}»`).join('\n')}`
        : ''
    }${
      fugas.length > 0
        ? `\n\n  ⚠ ${fugas.length} frases todavía delatan a alguien. Arreglalas con una línea en\n    "correcciones" (private/juego-normalizacion.json):\n${fugas.slice(0, 10).map((f) => `    ${f}`).join('\n')}`
        : '\n    Ninguna frase delata a nadie por cómo está escrita ✓'
    }
`)
