/**
 * ¿En cuántos saltos se puede subir cada capítulo, jugando perfecto?
 *
 *   npm run luna:minimos
 *   npm run luna:minimos -- 2      (solo el capítulo 2, con la ruta)
 *
 * Hace falta para poner los récords de él. Un récord tiene que ser un
 * número de verdad y no una estimación: el de Ovi es el mínimo exacto
 * —empatable y no superable— y el de Nico es el mínimo más uno, para
 * que ella pueda ganarle por un pasito.
 *
 * ── Cómo lo busca ─────────────────────────────────────────────
 * Es una anchura primero sobre el grafo de «desde qué tramo se llega
 * a qué tramo de un salto». Las aristas se sacan simulando el vuelo
 * con la misma física del motor, paso fijo de 1/60, incluidos los
 * rebotes contra las paredes del mundo, que es justo el truco con el
 * que él pasó el primer capítulo en 24: rebotar y subirse a un tramo
 * de arriba en vez de seguir el zigzag.
 *
 * El estado no es solo el tramo, es **el tramo y la última estrella
 * pisada**. La regla de caída mide contra la estrella, no contra el
 * suelo, así que hasta dónde se puede bajar depende de por dónde se
 * pasó. Con el estado solo en el tramo, la búsqueda se inventaba
 * rutas que en el juego cuentan como caída.
 *
 * ── Lo que este buscador no sabe ──────────────────────────────
 * - **La pista que se borra** (Boo). Es un límite de tiempo, no de
 *   camino: solo puede hacer que una ruta no dé, nunca dar una que
 *   aquí no salga.
 * - **La inclinación y el hundimiento**, que se mueven mientras
 *   carga. Son unos píxeles y la rejilla de cargas los cubre.
 *
 * Las cajas de peluches sí las sabe, y hacen falta: devuelven medio
 * salto gratis y sin gastar pasito, así que sin ellas el mínimo de
 * Ovi salía más alto del que es y el récord habría quedado
 * superable, que es justo lo contrario de lo que se pidió.
 */
import { CAIDA, CAPITULOS, IMPULSO, MUNDO, PELUCHES, SALTO, TORTUGA } from '@/content/luna'
import { construirNivel } from '@/juego-luna/mundos'

const PASO = 1 / 60
const ORILLA = 2
const grados = (g) => (g * Math.PI) / 180

/** Cuántos sitios de salida se prueban a lo largo de cada tramo. */
const SALIDAS = 15
/** Y cuántas cargas, de la más floja a la barra llena. */
const CARGAS = 26

/**
 * El vuelo, desde que suelta hasta que se para o se cae.
 *
 * Devuelve el índice del tramo donde acabó, o null si se cayó. Los
 * tramos de impulso la relanzan solos y no cuentan como paso, así que
 * el vuelo sigue de largo: lo que devuelve es donde acabó de verdad.
 */
function volar(nivel, desde, x, mirando, carga, yDeLaEstrella) {
  const v = SALTO.impulsoMinimo + (SALTO.impulsoMaximo - SALTO.impulsoMinimo) * carga
  let vx = Math.cos(grados(SALTO.angulo)) * v * mirando
  let vy = -Math.sin(grados(SALTO.angulo)) * v
  let px = x
  let py = desde.y
  let relanzada = 0
  /** En qué caja y cuántas veces seguidas viene rebotando. */
  let rebotoEn = -1
  let rebotesSeguidos = 0

  for (let paso = 0; paso < 600; paso += 1) {
    vy += SALTO.gravedad * PASO
    const yAntes = py
    px += vx * PASO
    py += vy * PASO

    // Las paredes del mundo devuelven, flojito, y la dan la vuelta.
    if (px < 0) {
      px = 0
      vx = Math.abs(vx) * 0.4
      mirando = 1
    } else if (px > MUNDO.ancho) {
      px = MUNDO.ancho
      vx = -Math.abs(vx) * 0.4
      mirando = -1
    }

    // Se cae si baja de la última estrella, aunque quede parada en un
    // tramo bueno. Se mira antes que las plataformas, igual que el
    // motor, para que aterrizar ahí abajo no la salve.
    if (py > yDeLaEstrella + CAIDA.margenBajoElLazo) return null

    if (vy <= 0) continue

    for (const p of nivel.plataformas) {
      if (px < p.x - ORILLA || px > p.x + p.ancho + ORILLA) continue
      if (yAntes > p.y || py < p.y) continue

      // Aterrizó. Se la mete adentro del tramo, como hace el motor.
      const orilla = Math.min(TORTUGA.ancho / 2, p.ancho / 2)
      px = Math.min(Math.max(px, p.x + orilla), p.x + p.ancho - orilla)
      py = p.y

      // El montón de peluches la devuelve en vez de pararla, con
      // parte de lo que traía. Se agota solo porque cada rebote sale
      // del anterior, y es medio salto que no cuesta ni barra ni
      // pasito: sin esto, el mínimo de Ovi sale más alto del que es.
      if (p.rebote) {
        const seguido = p.indice === rebotoEn && rebotesSeguidos > 0
        const traia = Math.abs(vy) * PELUCHES.devuelve
        const devuelve = Math.min(
          seguido ? traia : Math.max(traia, PELUCHES.piso),
          PELUCHES.tope,
        )
        if (devuelve >= PELUCHES.minimo) {
          vy = -devuelve
          vx *= PELUCHES.frena
          // El montón hace de cuenco: en la mitad de afuera devuelve
          // hacia el medio, que es lo que lo hace una red y no una
          // rampa que te tira.
          const desdeElMedio = px - (p.x + p.ancho / 2)
          const enLaOrilla = Math.abs(desdeElMedio) > (p.ancho / 2) * PELUCHES.orilla
          if (enLaOrilla && Math.sign(vx) === Math.sign(desdeElMedio)) vx = -vx
          rebotesSeguidos = p.indice === rebotoEn ? rebotesSeguidos + 1 : 1
          rebotoEn = p.indice
          break
        }
      }

      if (!p.impulso) return p.indice

      // Un tramo de impulso la lanza solo, desde el centro y sin
      // dedo. Es un salto gratis y por eso el vuelo sigue.
      relanzada += 1
      if (relanzada > 6) return p.indice
      px = p.x + p.ancho / 2
      mirando = p.impulso
      vx = Math.cos(grados(SALTO.angulo)) * IMPULSO.fuerza * mirando
      vy = -Math.sin(grados(SALTO.angulo)) * IMPULSO.fuerza
      break
    }
  }
  return null
}

/** Todo lo que se alcanza de un salto desde un tramo. */
function saltosDesde(nivel, indice, yDeLaEstrella) {
  const p = nivel.plataformas[indice]
  const orilla = Math.min(TORTUGA.ancho / 2, p.ancho / 2)
  const desde = p.x + orilla
  const hasta = p.x + p.ancho - orilla
  const llega = new Set()

  for (let i = 0; i < SALIDAS; i += 1) {
    const x = SALIDAS === 1 ? (desde + hasta) / 2 : desde + ((hasta - desde) * i) / (SALIDAS - 1)
    for (const mirando of [1, -1]) {
      for (let c = 0; c < CARGAS; c += 1) {
        const carga = c / (CARGAS - 1)
        const donde = volar(nivel, p, x, mirando, carga, yDeLaEstrella)
        if (donde !== null && donde !== indice) llega.add(donde)
      }
    }
  }
  return llega
}

/** La última estrella pisada al llegar a un tramo, viniendo de otra. */
function estrellaTras(nivel, indice, estrellaAntes) {
  const p = nivel.plataformas[indice]
  if (!p.hito) return estrellaAntes
  // Solo cuenta hacia arriba: volver a una vieja no desanda nada.
  return p.indice > estrellaAntes ? p.indice : estrellaAntes
}

/** El camino más corto hasta la cima, en saltos. */
function buscar(nivel) {
  const salida = nivel.plataformas.reduce((mejor, p) =>
    Math.abs(p.y - nivel.salida.y) < Math.abs(mejor.y - nivel.salida.y) ? p : mejor,
  )
  const primera = estrellaTras(nivel, salida.indice, 0)
  const inicio = `${salida.indice}:${primera}`
  const visto = new Map([[inicio, null]])
  let frente = [{ tramo: salida.indice, estrella: primera, clave: inicio }]
  let saltos = 0

  while (frente.length) {
    saltos += 1
    const siguiente = []
    for (const donde of frente) {
      const yDeLaEstrella = nivel.plataformas[donde.estrella].y
      for (const llega of saltosDesde(nivel, donde.tramo, yDeLaEstrella)) {
        const estrella = estrellaTras(nivel, llega, donde.estrella)
        const clave = `${llega}:${estrella}`
        if (visto.has(clave)) continue
        visto.set(clave, donde.clave)
        if (llega === nivel.cima.indice) {
          const ruta = [llega]
          let atras = donde.clave
          while (atras) {
            ruta.unshift(Number(atras.split(':')[0]))
            atras = visto.get(atras)
          }
          return { saltos, ruta }
        }
        siguiente.push({ tramo: llega, estrella, clave })
      }
    }
    frente = siguiente
    if (saltos > 60) break
  }
  return { saltos: null, ruta: [] }
}

const soloEste = Number(process.argv[2]) || null

console.log('')
for (const capitulo of CAPITULOS) {
  if (soloEste && capitulo.numero !== soloEste) continue
  const nivel = construirNivel(capitulo)
  const { saltos, ruta } = buscar(nivel)

  if (saltos === null) {
    console.log(`  ${capitulo.numero} · ${capitulo.nombre}: no se encontró camino`)
    continue
  }

  console.log(
    `  ${capitulo.numero} · ${capitulo.nombre}: ${saltos} pasitos, sobre ${nivel.plataformas.length} tramos`,
  )
  if (soloEste) {
    console.log(`     la ruta, por índice de tramo: ${ruta.join(' -> ')}`)
    console.log(
      `     alturas: ${ruta.map((i) => Math.round(nivel.suelo - nivel.plataformas[i].y)).join(' -> ')}`,
    )
  }
}
console.log('')
