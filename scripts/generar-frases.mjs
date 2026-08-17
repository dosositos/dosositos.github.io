/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  GENERADOR DE CANDIDATAS PARA "¿QUIÉN DIJO ESTO?"                ║
 * ║                                                                  ║
 * ║  Busca lo gracioso, no lo bonito. Una frase sirve para el juego  ║
 * ║  cuando es CONCRETA (yucas, KPIs, Under Armour, un gato en la    ║
 * ║  ventana) o cuando está MAL ESCRITA de una forma que sólo se le  ║
 * ║  ocurre a uno de los dos ("a qhora salsi amor?"). Lo cursi       ║
 * ║  genérico —"siempre nos apoyaremos mi amor"— es precioso pero    ║
 * ║  no se puede adivinar: lo pudo decir cualquiera de los dos.      ║
 * ║  Por eso aquí eso RESTA en vez de sumar.                         ║
 * ║                                                                  ║
 * ║  Aprende de tu revisión. Cada vez que aprobás o descartás,       ║
 * ║  la próxima corrida sabe un poco más de qué te da risa:          ║
 * ║   · lo aprobado se conserva intacto y encabeza el archivo        ║
 * ║   · lo descartado queda anotado y no vuelve a aparecer NUNCA     ║
 * ║   · las palabras de unas y otras inclinan el puntaje             ║
 * ║                                                                  ║
 * ║  No filtra por decencia ni por intimidad: eso lo decidís vos.    ║
 * ║  Sí filtra credenciales (correos con contraseña, códigos), que   ║
 * ║  no son un chiste sino una fuga.                                 ║
 * ║                                                                  ║
 * ║  Uso:  npm run chat:frases                                       ║
 * ║  Sale: private/frases-candidatas.json   (revisalo y avisame)     ║
 * ║        private/frases-descartadas.json  (memoria de lo que no)   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const PRIVADO = path.join(RAIZ, 'private')
const ARCHIVO_CANDIDATAS = path.join(PRIVADO, 'frases-candidatas.json')
const ARCHIVO_DESCARTADAS = path.join(PRIVADO, 'frases-descartadas.json')

const leerJson = (ruta) => (existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : null)

const cargar = (archivo, fuente) => {
  const datos = leerJson(path.join(PRIVADO, archivo))
  if (!datos) return []
  return datos.filter((m) => m.tipo === 'texto').map((m) => ({ ...m, fuente }))
}

const mensajes = [...cargar('chat.json', 'whatsapp'), ...cargar('instagram.json', 'instagram')]

if (mensajes.length === 0) {
  console.error(`
  ✗ No hay ningún chat leído todavía. Corré:

      npm run chat:parsear     (WhatsApp)
      npm run chat:instagram   (Instagram)
  `)
  process.exit(1)
}

// Lo que aprobaste mide 40 caracteres de mediana y nunca pasó de 118.
// Los mensajes largos son informativos, no graciosos: ahí se cuentan
// cosas, y contar no delata a nadie.
const MIN = 13
const MAX = 115
const CUANTAS = 400

const normalizar = (t) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\wáéíóúñü\s]/g, ' ')

const llaveDe = (t) => normalizar(t).replace(/\s+/g, ' ').trim()

// ══ Vocabularios ═══════════════════════════════════════════════════

// Palabras vacías: no aportan nada, ni rareza ni concreción
const COMUNES = new Set(
  `de la que el en y a los se del las un por con no una su para es al lo como mas pero sus le ya o
   este si porque esta entre cuando muy sin sobre tambien me hasta hay donde quien desde todo nos
   durante todos uno les ni contra otros ese eso ante ellos e esto mi antes algunos unos yo otro
   otras otra tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo
   nosotros vos vo te ok jaja jajaja bueno bien ser sos soy fue era son han has hay hace haces
   tengo tenes tiene puede pueden queria quiero quieres vas voy va van creo dice dijo decir ahora
   luego entonces igual verdad claro solo tambien asi aqui alla mismo cada vez veces dia dias
   cosa cosas gracias favor talvez quiza pues aunque mientras despues sino sea seria tal
   jajajaja jajajajaja jajaj jajajaj jaja jsjs jsjsjs`.split(/\s+/),
)

// El registro romántico. Precioso en el chat, inservible en el juego:
// estas palabras las usan los dos por igual, no delatan a nadie.
const ROMANTICO =
  /\b(amor|amo|amas|amarte|amaré|amare|amándote|amandote|cielo|vida|corazón|corazon|corazoncito|beso|besos|besito|besitos|abrazo|abrazos|abrazito|cariño|carino|hermoso|hermosa|precioso|preciosa|lindo|linda|lindito|bello|bella|extraño|extrano|te quiero|mi vida|mi cielo)\b/i

// Cursilería de plantilla: promesas, agradecimientos y declaraciones
// que suenan a tarjeta de regalo. Se pudo haber dicho cualquier día.
const PLANTILLA_CURSI =
  /\b(siempre|nunca|jamás|jamas|eternamente|apasionadamente|por siempre|juntos|mutuamente|apoyar|apoyamos|apoyaremos|apoyas|apoyes|anhelo|anhelaba|agradezco|prometo|promesa|te lo juro|orgullo|orgullosa|orgulloso|especial|especiales|maravilloso|maravillosa|bendición|bendicion)\b/i

// Reacciones de relleno: no dicen nada de quién las escribió
const RELLENO =
  /^(s[íi]|no|ok|okey|dale|ajá|aja|ya|listo|jaja+|jsjs+|ka?ja[jak]*|mmm+|uy|ay|oh|wow|obvio|cierto|exacto|igual|amor|mi amor|amén|amen|buenas|hola|holi|adiós|adios)$/i

// Terrenos concretos: lo cotidiano y lo específico es lo que delata
const CONCRETO = new RegExp(
  '\\b(' +
    `comida|comer|comí|comi|almuerzo|cena|desayuno|pollo|arroz|frijol|queso|tortilla|yuca|yucas|
     sushi|pizza|hamburguesa|helado|pastel|café|cafe|leche|miel|jugo|gaseosa|sopa|carne|huevo|pan|
     galleta|chocolate|
     perro|perrito|perra|gato|gatito|gata|pájaro|pajaro|loro|zancudo|mosquito|hormiga|cucaracha|
     vaca|oveja|toro|pez|peces|
     carro|moto|bus|taxi|parqueo|gasolina|llanta|manejar|conducir|semáforo|semaforo|
     celular|cel|compu|computadora|laptop|cpu|batería|bateria|cargador|wifi|internet|pantalla|
     teclado|impresora|cable|app|filtro|filtros|sticker|stickers|
     clase|clases|universidad|uam|examen|tarea|profe|profesor|maestra|nota|notas|bachiller|
     graduación|graduacion|carnet|matrícula|matricula|
     partido|gol|goles|liga|laliga|equipo|jugador|playoffs|entrenar|gimnasio|gym|pesas|
     película|pelicula|serie|capítulo|capitulo|temporada|netflix|hbo|anime|canción|cancion|álbum|
     album|concierto|
     jabón|jabon|shampoo|toalla|cepillo|pasta|desodorante|perfume|rasurar|rasuras|uñas|cejas|
     delineador|rubor|maquillaje|
     cama|sábana|sabana|almohada|manta|cobija|chinela|chinelas|cuarto|cocina|baño|bano|ventana|
     puerta|techo|piso|
     plata|córdobas|cordobas|dólares|dolares|precio|caro|barato|factura|recibo|cotizar|banco|
     doctor|clínica|clinica|hospital|pastilla|medicina|gripa|fiebre|dolor|radiografía|radiografia|
     vacuna`.replace(/\s+/g, '') +
    ')\\b',
  'i',
)

const CREDENCIAL =
  /(\b(pass|password|contrase[ñn]a|clave|c[óo]digo|pin|otp|token|usuario|user)\b\s*[:=]|[\w.+-]+@[\w-]+\.[a-z]{2,}|\b\d{8,}\b|\b(?:\d[ -]?){13,19}\b)/i

// Duelo. Puntúa altísimo porque es concreto y raro, pero nadie quiere
// encontrarse un pésame en medio de un juego de adivinanzas.
const DUELO =
  /\b(falleci[óo]|fallecimiento|muri[óo]|luto|p[ée]same|entierro|velorio|funeral|sepelio|descanse en paz|q\.?e\.?p\.?d|condolencia|c[áa]ncer|quimio|cuidados intensivos|dio el pesar|orar[ée]|or[ée] por|mis oraciones|fortaleza|resignaci[óo]n)\b/i

// Mensajes reenviados, avisos de la universidad, cadenas: se leen
// formales y no los escribió ninguno de los dos.
const INSTITUCIONAL =
  /\b(deber[áa]n|estimad[oa]s|se les informa|a partir de este momento|favor de|comunicamos|se solicita|inscripci[óo]n|reg[íi]strate|registrarse|atentamente|cordial saludo)\b/i

// ══ Frecuencias del corpus ═════════════════════════════════════════

const frecuencia = new Map()
for (const m of mensajes) {
  for (const p of normalizar(m.texto).split(/\s+/)) {
    if (p.length > 2) frecuencia.set(p, (frecuencia.get(p) ?? 0) + 1)
  }
}

const contenidoDe = (texto) =>
  normalizar(texto).split(/\s+/).filter((p) => p.length > 2 && !COMUNES.has(p))

// ══ Detector de palabras trabadas ══════════════════════════════════
// "jugnado", "a qhora salsi", "esvcribe", "bisitos", "Estabaya".
// Una palabra casi inexistente que se parece muchísimo a una que se
// dice todo el tiempo es un dedazo, y los dedazos son personalísimos.

const FRECUENTES = [...frecuencia.entries()]
  .filter(([p, n]) => n >= 40 && p.length >= 4)
  .map(([p]) => p)

const porLargo = new Map()
for (const p of FRECUENTES) {
  if (!porLargo.has(p.length)) porLargo.set(p.length, [])
  porLargo.get(p.length).push(p)
}

/** Levenshtein con corte: apenas pasa de `tope` abandona. */
function distancia(a, b, tope) {
  if (Math.abs(a.length - b.length) > tope) return tope + 1
  let previa = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const fila = [i]
    let minimo = i
    for (let j = 1; j <= b.length; j++) {
      const costo = a[i - 1] === b[j - 1] ? 0 : 1
      fila[j] = Math.min(previa[j] + 1, fila[j - 1] + 1, previa[j - 1] + costo)
      if (fila[j] < minimo) minimo = fila[j]
    }
    if (minimo > tope) return tope + 1
    previa = fila
  }
  return previa[b.length]
}

const cacheTrabada = new Map()
function esTrabada(palabra) {
  if (cacheTrabada.has(palabra)) return cacheTrabada.get(palabra)
  let veredicto = false
  const veces = frecuencia.get(palabra) ?? 0
  if (palabra.length >= 4 && veces <= 3 && !/(.)\1{2,}/.test(palabra)) {
    buscar: for (let largo = palabra.length - 2; largo <= palabra.length + 2; largo++) {
      for (const conocida of porLargo.get(largo) ?? []) {
        if (conocida === palabra) continue
        if (conocida[0] !== palabra[0] && conocida.at(-1) !== palabra.at(-1)) continue
        if (distancia(palabra, conocida, 2) <= 2) {
          veredicto = true
          break buscar
        }
      }
    }
  }
  cacheTrabada.set(palabra, veredicto)
  return veredicto
}

// ══ Lo que ya revisaste ════════════════════════════════════════════

const previo = leerJson(ARCHIVO_CANDIDATAS)
const memoria = leerJson(ARCHIVO_DESCARTADAS)

// Un "false" sólo significa "no me gustó" si de verdad abriste el
// archivo. Si corrés esto dos veces seguidas sin revisar, las nuevas
// candidatas siguen en false y sería una masacre tirarlas al basurero.
// Por eso: si nadie tocó el archivo desde que se generó, no cuentan.
const revisado =
  previo != null &&
  existsSync(ARCHIVO_CANDIDATAS) &&
  statSync(ARCHIVO_CANDIDATAS).mtimeMs > new Date(previo.generado).getTime() + 60_000

const aprobadasPrevias = { individuales: [], ambos: [] }
const textosAprobados = []
const textosDescartados = []
let pendientes = 0

for (const lista of ['individuales', 'ambos']) {
  for (const f of previo?.[lista] ?? []) {
    if (f.aprobada) {
      aprobadasPrevias[lista].push(f)
      textosAprobados.push(f.texto)
    } else if (revisado) {
      textosDescartados.push(f.texto)
    } else {
      pendientes++
    }
  }
}
for (const t of memoria?.textos ?? []) textosDescartados.push(t)

// Las credenciales que se hubieran colado en la revisión salen igual
const credencialesRescatadas = aprobadasPrevias.individuales
  .concat(aprobadasPrevias.ambos)
  .filter((f) => CREDENCIAL.test(f.texto))

for (const lista of ['individuales', 'ambos']) {
  aprobadasPrevias[lista] = aprobadasPrevias[lista].filter((f) => !CREDENCIAL.test(f.texto))
}

const vetadas = new Set(textosDescartados.map(llaveDe))
const yaAprobadas = new Set(textosAprobados.map(llaveDe))

// ══ Lo aprendido de tu gusto ═══════════════════════════════════════
// Log-odds por palabra: cuánto se inclina hacia "aprobada" cada una.
// Con pocos ejemplos es una pista, no una ley, así que va topado.

const aciertos = new Map()
const fallos = new Map()
const anotar = (mapa, textos) => {
  for (const t of textos) for (const p of new Set(contenidoDe(t))) mapa.set(p, (mapa.get(p) ?? 0) + 1)
}
anotar(aciertos, textosAprobados)
anotar(fallos, textosDescartados)

const hayGusto = textosAprobados.length >= 25 && textosDescartados.length >= 25
const sesgo = Math.log((textosAprobados.length + 1) / (textosDescartados.length + 1))

function aprendido(texto) {
  if (!hayGusto) return 0
  const palabras = [...new Set(contenidoDe(texto))].filter(
    (p) => (aciertos.get(p) ?? 0) + (fallos.get(p) ?? 0) >= 2,
  )
  if (palabras.length === 0) return 0
  let suma = 0
  for (const p of palabras) {
    suma += Math.log(((aciertos.get(p) ?? 0) + 0.5) / ((fallos.get(p) ?? 0) + 0.5)) - sesgo
  }
  return Math.max(-9, Math.min(9, (suma / Math.sqrt(palabras.length)) * 4))
}

// ══ Puntaje: ¿esto da risa y delata a alguien? ═════════════════════

function puntuar(texto) {
  const palabras = contenidoDe(texto)
  if (palabras.length < 2) return 0

  // Todo lo bueno se mide POR PALABRA, no en total. Si no, gana el
  // mensaje larguísimo que menciona diez cosas y no tiene gracia.
  const denso = Math.max(0.4, Math.min(1, 1.15 - palabras.length / 26))

  let bueno = 0

  // Rareza: palabras que casi no se dicen en cuatro años de chat
  const rarezas = palabras.map((p) => 1 / Math.log2((frecuencia.get(p) ?? 1) + 2))
  bueno += (rarezas.reduce((a, b) => a + b, 0) / palabras.length) * 26

  // Concreción: sustantivos del mundo real, ni tan raros que sean
  // basura ni tan comunes que no digan nada
  const concretas = palabras.filter((p) => {
    const n = frecuencia.get(p) ?? 0
    return p.length > 3 && n >= 3 && n <= 600 && !ROMANTICO.test(p) && !PLANTILLA_CURSI.test(p)
  })
  bueno += Math.min(3, new Set(concretas).size) * 5
  if (CONCRETO.test(texto)) bueno += 7

  // Nombres propios y marcas: "Under Armour", "SALAH", "Clash Of Clans"
  const propios = texto.match(/(?<![.!?¡¿]\s|^)\b[A-ZÁÉÍÓÚÑ][a-záéíóúñü]{2,}/gu) ?? []
  bueno += Math.min(2, propios.length) * 6
  if (/\b[A-ZÁÉÍÓÚÑ]{4,}\b/.test(texto)) bueno += 5

  // Dedazos: el oro del juego
  const trabadas = palabras.filter(esTrabada)
  bueno += Math.min(2, trabadas.length) * 14

  // Alargues: "holaaaaa", "muchísiisisisisimo", "uuuuu"
  if (/(.)\1{3,}/.test(texto)) bueno += 8

  // Preguntas raras y cortas
  if (/\?/.test(texto) && texto.length < 90) bueno += 5

  // El chiste de la casa: ternura pegada a algo absurdamente mundano
  if (ROMANTICO.test(texto) && (CONCRETO.test(texto) || trabadas.length > 0)) bueno += 10

  let puntos = bueno * denso

  // ── Lo que arruinaba la lista vieja ──────────────────────────────

  // Cursilería sin nada concreto: se lo pudo haber dicho cualquiera
  const cursi = ROMANTICO.test(texto) || PLANTILLA_CURSI.test(texto)
  if (cursi && concretas.length === 0 && trabadas.length === 0 && propios.length === 0) puntos -= 22
  else if (cursi && concretas.length <= 1 && trabadas.length === 0) puntos -= 9

  // Reacción de relleno: quitale las risas y los "amor" y no queda nada
  const hueso = normalizar(texto)
    .replace(/\b(ja|je|ka|si|no|amor|mi|jaj\w*|kaj\w*|jsj\w*)\b/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length > 2 && !COMUNES.has(p))
  if (hueso.length < 2) puntos -= 16

  // Dos oraciones ya es narrar. Ni una sola de tus aprobadas lo hace.
  if (/[a-záéíóúñ][.!?]\s+[A-ZÁÉÍÓÚÑ¿¡]/.test(texto)) puntos -= 18
  if (texto.length > 95) puntos -= 12

  // Basura de exportación y ruido
  if (/https?:\/\//.test(texto)) puntos -= 40
  if (/<se editó|<se edito|reacted .* to your message|omitido|omitted|sticker|gif/i.test(texto)) puntos -= 40
  if (INSTITUCIONAL.test(texto)) puntos -= 30
  if (DUELO.test(texto)) puntos -= 60
  if ((texto.match(/\d+/g) ?? []).length >= 4) puntos -= 25 // listas, horarios, marcadores
  if (/^\d+$/.test(texto.trim())) puntos -= 30

  puntos += aprendido(texto)

  return Math.max(0, puntos)
}

// ══ Candidatas individuales ════════════════════════════════════════

const vistas = new Set()
const candidatas = []
let credencialesFiltradas = 0

for (const m of mensajes) {
  const texto = m.texto.trim()
  if (texto.length < MIN || texto.length > MAX) continue
  if (RELLENO.test(texto)) continue

  const llave = llaveDe(texto)
  if (vistas.has(llave) || vetadas.has(llave) || yaAprobadas.has(llave)) continue
  vistas.add(llave)

  if (CREDENCIAL.test(texto)) {
    credencialesFiltradas++
    continue
  }

  const puntos = puntuar(texto)
  if (puntos <= 0) continue

  candidatas.push({
    texto,
    respuesta: m.de,
    fecha: m.fecha,
    hora: `${m.hora}:${String(m.minuto).padStart(2, '0')}`,
    fuente: m.fuente,
    puntos: Math.round(puntos * 10) / 10,
    aprobada: false, // ← ponelo en true en las que te gusten
    pista: '',
  })
}

candidatas.sort((a, b) => b.puntos - a.puntos)

// ── Variedad: nada de cuarenta veces "Siempre X amor" ──────────────
// De cada arranque y de cada tema entran pocas, aunque puntúen alto.

const porArranque = new Map()
const porTema = new Map()
const elegidas = []

for (const c of candidatas) {
  const palabras = contenidoDe(c.texto)
  const arranque = llaveDe(c.texto).split(' ').slice(0, 3).join(' ')
  const tema =
    palabras.sort((a, b) => (frecuencia.get(a) ?? 0) - (frecuencia.get(b) ?? 0))[0] ?? arranque

  if ((porArranque.get(arranque) ?? 0) >= 2) continue
  if ((porTema.get(tema) ?? 0) >= 3) continue

  porArranque.set(arranque, (porArranque.get(arranque) ?? 0) + 1)
  porTema.set(tema, (porTema.get(tema) ?? 0) + 1)
  elegidas.push(c)
  if (elegidas.length >= CUANTAS) break
}

// ══ Frases que dijeron LOS DOS ═════════════════════════════════════
// Acá el criterio se da vuelta: sirve lo que ambos repiten mucho y
// parejo, porque la gracia es que la respuesta sea "los dos".

const porFrase = new Map()
for (const m of mensajes) {
  const t = m.texto.trim()
  if (t.length < MIN || t.length > 90) continue
  const llave = llaveDe(t)
  const registro = porFrase.get(llave) ?? { texto: t, osito: 0, osita: 0, fuentes: new Set() }
  registro[m.de]++
  registro.fuentes.add(m.fuente)
  porFrase.set(llave, registro)
}

const ambos = [...porFrase.values()]
  .filter((r) => {
    const llave = llaveDe(r.texto)
    return r.osito >= 2 && r.osita >= 2 && !vetadas.has(llave) && !yaAprobadas.has(llave)
  })
  .filter((r) => !CREDENCIAL.test(r.texto) && !/https?:\/\/|<se edit|reacted /i.test(r.texto))
  .map((r) => {
    const total = r.osito + r.osita
    const equilibrio = Math.min(r.osito, r.osita) / Math.max(r.osito, r.osita)
    const puntos = Math.log2(total) * 6 * equilibrio + aprendido(r.texto)
    return {
      texto: r.texto,
      respuesta: 'ambos',
      vecesOsito: r.osito,
      vecesOsita: r.osita,
      fuente: [...r.fuentes].sort().join(' + '),
      puntos: Math.round(Math.max(0, puntos) * 10) / 10,
      aprobada: false,
      pista: '',
    }
  })
  .sort((a, b) => b.puntos - a.puntos)
  .slice(0, 100)

// ══ Guardar ════════════════════════════════════════════════════════

const salida = {
  generado: new Date().toISOString(),
  instrucciones:
    'Poné "aprobada": true en las que quieras que salgan en el juego. Podés editar el texto y agregar una "pista" que se muestra tras responder. Las de arriba ya venían aprobadas de la revisión anterior: no las toqués salvo que te arrepientas. Lo que dejés en false se borra y no vuelve a proponerse. Luego decime y las paso a la web.',
  resumen: {
    aprobadas: aprobadasPrevias.individuales.length + aprobadasPrevias.ambos.length,
    nuevasParaRevisar: elegidas.length + ambos.length,
    descartadasParaSiempre: vetadas.size,
  },
  individuales: [...aprobadasPrevias.individuales, ...elegidas],
  ambos: [...aprobadasPrevias.ambos, ...ambos],
}

writeFileSync(ARCHIVO_CANDIDATAS, JSON.stringify(salida, null, 2), 'utf8')

writeFileSync(
  ARCHIVO_DESCARTADAS,
  JSON.stringify(
    {
      _leeme:
        'Frases que ya revisaste y no aprobaste. generar-frases.mjs las lee para no volver a proponértelas, y usa sus palabras para aprender qué NO te da risa. Borrá una línea si querés que vuelva a considerarse.',
      actualizado: new Date().toISOString(),
      textos: [...new Set(textosDescartados)],
    },
    null,
    2,
  ),
  'utf8',
)

const marca = (c) => (c.fuente?.includes('instagram') ? '📷' : '💬')

console.log(`
  ✓ private/frases-candidatas.json

    Ya aprobadas (intactas) ...... ${salida.resumen.aprobadas}
    Nuevas para revisar .......... ${elegidas.length} individuales + ${ambos.length} de "ambos"
    Descartadas, no vuelven ...... ${vetadas.size}${
      credencialesFiltradas > 0
        ? `\n    Credenciales bloqueadas ...... ${credencialesFiltradas}`
        : ''
    }${
      pendientes > 0
        ? `\n\n  · No tocaste el archivo desde la corrida anterior, así que las\n    ${pendientes} que quedaron en false NO las di por rechazadas.`
        : ''
    }${
      credencialesRescatadas.length > 0
        ? `\n\n  ⚠ Saqué ${credencialesRescatadas.length} frase(s) que tenías aprobadas y llevaban\n    contraseñas o correos. Eso no puede ir al juego.`
        : ''
    }
${hayGusto ? '    (el puntaje ya está aprendiendo de tu revisión)' : ''}

    Las 12 mejores nuevas, para que veas si va encaminado:
`)

for (const c of elegidas.slice(0, 12)) {
  console.log(`    ${marca(c)} [${c.respuesta}] ${c.texto.replace(/\n/g, ' ').slice(0, 88)}`)
}
console.log('')
