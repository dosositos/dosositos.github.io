/**
 * El probador de la escuelita: juega las siete clases con un robot.
 *
 *   node --import ./scripts/juego-luna/alias-luna.mjs scripts/juego-luna/probar-escuelita.mjs
 *   npm run luna:escuelita
 *
 * Una clase de la escuelita que no se pueda pasar es lo peor que
 * podría tener este juego. Los capítulos se pueden atascar y siempre
 * queda la estrellita de más abajo; acá no hay estrellita ni hay
 * salida, y quedarse trabada en la pantalla que se llama «así se
 * juega» es no llegar nunca a jugar.
 *
 * Lo que comprueba, clase por clase:
 *
 *  1. Que se pueda **cumplir el objetivo**. Cinco se pasan llegando
 *     arriba, y esas las juega el mismo robot que prueba los
 *     capítulos. La del cansancio se pasa aguantando la barra sin
 *     soltar, y la de la estrellita, pisándola y tirándose después:
 *     esas dos se juegan a mano, porque el robot que apunta saltos no
 *     sabe hacer ninguna de las dos cosas.
 *  2. Que la del cansancio **no tenga por dónde caerse**. Es una sola
 *     plataforma y tiene que ir de pared a pared: si dejara un hueco,
 *     la clase se pasaría cayéndose y la lección no aparecería.
 *  3. Que en la de la estrellita **la cima no sea la estrellita**.
 *     Siéndolo, pisarla daría la clase por terminada antes de la
 *     caída, que es la mitad que importa.
 *  4. Que ninguna sea **larga**. Son clases, no capítulos: pasan de
 *     ocho plataformas y ya son un capítulo mal escrito.
 *
 * El reloj falso y el arranque son los mismos de `probar-luna.mjs`, y
 * por lo mismo: la física es de paso fijo, así que darle los frames de
 * a uno lo más rápido que se pueda da exactamente el mismo resultado
 * que el teléfono.
 */

/* ── El reloj falso, antes de importar el motor ────────────────── */

let ahora = 0
const FRAME = 1000 / 60
let pendiente = null

globalThis.performance = { now: () => ahora }
globalThis.requestAnimationFrame = (cb) => {
  pendiente = cb
  return 1
}
globalThis.cancelAnimationFrame = () => {
  pendiente = null
}

const { crearMotor } = await import('@/juego-luna/motor.ts')
const { construirNivel, msDeCargaEn, superficieDe } = await import('@/juego-luna/mundos.ts')
const { CLASES, MUNDO, SALTO, CANSANCIO, ALMOHADAS, CINTA } = await import('@/content/luna.ts')

/** Lo más que se le deja penar a una clase antes de darla por trabada. */
const TOPE_DE_SEGUNDOS = 90

/** Lo que puede medir una clase antes de dejar de ser una clase. */
const TOPE_DE_PLATAFORMAS = 8

const grados = (g) => (g * Math.PI) / 180

let fallos = 0
const mal = (linea) => {
  fallos += 1
  console.log('   ⚠ ' + linea)
}

/**
 * Arranca un motor en una clase y devuelve cómo pisarla.
 *
 * Con `nadaCae` puesto, igual que en el juego: en la escuelita se
 * enseña una cosa por pantalla, y un rayo cayendo mientras aprende a
 * soltar la barra enseñaría dos a la vez y ninguna bien. Sin esto el
 * probador mediría una escuelita que no existe.
 */
function banco(nivelDePrueba) {
  const ultima = { escena: null }
  const eventos = []
  const motor = crearMotor({
    nivel: nivelDePrueba,
    conCinematica: false,
    nadaCae: true,
    pintar: (escena) => {
      ultima.escena = escena
    },
    alEvento: (e) => eventos.push(e),
  })
  motor.medirVista(MUNDO.alto)
  motor.iniciar()

  const frame = () => {
    ahora += FRAME
    const cb = pendiente
    pendiente = null
    if (cb) cb(ahora)
    return ultima.escena
  }

  return { motor, frame, eventos, ver: () => ultima.escena }
}

/* ── El robot que apunta, igual que el de los capítulos ─────────── */

function dondeSaldra(escena, donde, carga) {
  if (!donde?.resbala) return escena.x
  const medio = donde.x + donde.ancho / 2
  const lado = Math.max(-1, Math.min(1, (escena.x - medio) / (donde.ancho / 2)))
  const ahoraInclinada = escena.inclinacion?.[donde.indice] ?? 0
  const media = (ahoraInclinada + lado) / 2
  return escena.x + CINTA.arrastre * media * ((msDeCargaEn(donde) * carga) / 1000)
}

function alturaDeSalida(escena, donde, carga) {
  if (!donde?.hunde) return escena.y
  const hundida = escena.hundido?.[donde.indice] ?? 0
  const alSoltar = Math.min(1, hundida + (msDeCargaEn(donde) * carga) / ALMOHADAS.msParaElFondo)
  return escena.y + (alSoltar - hundida) * ALMOHADAS.seHunde
}

function puntoDeCaida(escena, destino, carga, donde) {
  const v = SALTO.impulsoMinimo + (SALTO.impulsoMaximo - SALTO.impulsoMinimo) * carga
  const vx = Math.cos(grados(SALTO.angulo)) * v * escena.mirando
  const vy = -Math.sin(grados(SALTO.angulo)) * v
  const g = SALTO.gravedad
  const dy = destino.y - alturaDeSalida(escena, donde, carga)
  const salida = dondeSaldra(escena, donde, carga)

  // Que suba de sobra y no de milagro: en el punto más alto va parada
  // en el aire, y el motor solo la deja aterrizar mientras baja.
  const alturaMaxima = (vy * vy) / (2 * g)
  if (alturaMaxima < -dy + 15) return null

  const disc = vy * vy + 2 * g * dy
  if (disc < 0) return null
  const t = (-vy + Math.sqrt(disc)) / g
  return salida + vx * t
}

function mejorCarga(escena, destino, donde) {
  const centro = destino.x + destino.ancho / 2
  let mejor = null
  let masCerca = Infinity
  for (let c = 0; c <= 40; c += 1) {
    const carga = c / 40
    const x = puntoDeCaida(escena, destino, carga, donde)
    if (x === null) continue
    if (x <= destino.x + 12 || x >= destino.x + destino.ancho - 12) continue
    const lejos = Math.abs(x - centro)
    if (lejos < masCerca) {
      masCerca = lejos
      mejor = carga
    }
  }
  return mejor
}

function estaEncima(escena, p, margen = 8) {
  const inclinacion = escena.inclinacion?.[p.indice] ?? 0
  const hundido = escena.hundido?.[p.indice] ?? 0
  const suelo = superficieDe(p, escena.x, inclinacion, hundido)
  return Math.abs(escena.y - suelo) < margen && escena.x >= p.x - 2 && escena.x <= p.x + p.ancho + 2
}

/** Sube la clase saltando de tramo en tramo, hasta la cima o hasta rendirse. */
function subirla(nivel) {
  const { motor, frame, eventos } = banco(nivel)

  let objetivo = 1
  let frames = 0
  let cargando = false
  let framesCargando = 0
  let cargaElegida = 0
  let saliendoDe = null

  while (frames < 60 * TOPE_DE_SEGUNDOS && !eventos.includes('cima')) {
    const e = frame()
    frames += 1
    if (!e) continue

    if (e.enSuelo && !cargando && !e.cayendo) {
      const donde = nivel.plataformas.find((p) => estaEncima(e, p))
      if (!donde) continue
      objetivo = donde.indice + 1
      if (objetivo >= nivel.plataformas.length) break

      const carga = mejorCarga(e, nivel.plataformas[objetivo], donde)
      if (carga !== null) {
        cargaElegida = carga
        cargando = true
        framesCargando = 0
        saliendoDe = donde
        motor.presionar()
      }
    } else if (cargando) {
      framesCargando += 1
      if (framesCargando * FRAME >= msDeCargaEn(saliendoDe) * cargaElegida) {
        motor.soltar()
        cargando = false
      }
    }
  }

  motor.detener()
  return { eventos, segundos: frames / 60, ...motor.cuenta() }
}

/**
 * La clase del cansancio: apretar y no soltar.
 *
 * Es lo único que se puede hacer ahí, así que el robot hace justo eso.
 * Se aguanta el doble de lo que dice `msDeAguante` por si algún día ese
 * número sube: lo que se comprueba es que se desmaye, no cuándo.
 */
function aguantarla(nivel) {
  const { motor, frame, eventos } = banco(nivel)
  motor.presionar()
  const tope = Math.ceil(((CANSANCIO.msDeAguante * 2) / FRAME) | 0)
  for (let i = 0; i < tope && !eventos.includes('agotada'); i += 1) frame()
  motor.detener()
  return { eventos }
}

/**
 * La clase de la estrellita: subir a pisarla y después tirarse.
 *
 * Primero sube como en cualquier otra, y en cuanto el motor avisa del
 * hito se deja caminar hasta la orilla y se salta con la barra al
 * mínimo hacia el suelo de abajo. Bajar del último lazo cuenta como
 * caída aunque quede parada en una plataforma buena, que es
 * exactamente la regla que la clase enseña.
 */
function tirarseDeLaEstrella(nivel) {
  const { motor, frame, eventos } = banco(nivel)
  const estrella = nivel.hitos[0]

  let frames = 0
  let cargando = false
  let framesCargando = 0
  let cargaElegida = 0
  let saliendoDe = null

  while (frames < 60 * TOPE_DE_SEGUNDOS && !eventos.includes('reaparicion')) {
    const e = frame()
    frames += 1
    if (!e) continue
    if (!e.enSuelo || cargando || e.cayendo) {
      if (cargando) {
        framesCargando += 1
        if (framesCargando * FRAME >= msDeCargaEn(saliendoDe) * cargaElegida) {
          motor.soltar()
          cargando = false
        }
      }
      continue
    }

    const donde = nivel.plataformas.find((p) => estaEncima(e, p))
    if (!donde) continue

    // Ya pisó la estrellita: ahora hay que tirarse. Con la barra al
    // mínimo y desde donde esté: lo que se busca es bajar de la
    // estrellita, y cualquier salto flojo desde aquí baja.
    const destino = donde.indice >= estrella.indice ? null : nivel.plataformas[donde.indice + 1]

    if (destino === null) {
      cargaElegida = 0
      cargando = true
      framesCargando = 0
      saliendoDe = donde
      motor.presionar()
      continue
    }

    const carga = mejorCarga(e, destino, donde)
    if (carga !== null) {
      cargaElegida = carga
      cargando = true
      framesCargando = 0
      saliendoDe = donde
      motor.presionar()
    }
  }

  motor.detener()
  return { eventos, segundos: frames / 60 }
}

/* ── Y a probarlas ─────────────────────────────────────────────── */

console.log('\n  La escuelita — ' + CLASES.length + ' clases\n')

for (const clase of CLASES) {
  const nivel = construirNivel(clase)
  console.log(`  ${clase.id} · ${clase.titulo} (${clase.objetivo})`)

  if (clase.plataformas.length > TOPE_DE_PLATAFORMAS) {
    mal(
      `${clase.plataformas.length} plataformas: eso ya no es una clase, es un capítulo corto`,
    )
  }

  if (clase.objetivo === 'agotada') {
    // De pared a pared, o la clase se pasa cayéndose.
    const unica = clase.plataformas[0]
    if (clase.plataformas.length !== 1) {
      mal('la clase del cansancio tiene más de una plataforma: hay a dónde ir y no debería')
    } else if (unica.x > 0 || unica.x + unica.ancho < MUNDO.ancho) {
      mal(
        `el suelo va de ${unica.x} a ${unica.x + unica.ancho} y el mundo mide ${MUNDO.ancho}: ` +
          'queda hueco por donde caerse y la lección no llega a pasar',
      )
    }

    const r = aguantarla(nivel)
    if (r.eventos.includes('agotada')) {
      console.log('   ✓ se marea aguantando la barra, que es lo que la clase pide')
    } else {
      mal('aguantando la barra sin soltar no se marea: la clase no se puede pasar')
    }
  } else if (clase.objetivo === 'reaparicion') {
    if (nivel.hitos.length === 0) {
      mal('la clase de la estrellita no tiene estrellita')
    } else if (nivel.cima.hito) {
      mal(
        'la estrellita es la cima: pisarla termina la clase antes de la caída, ' +
          'que es la mitad que enseña',
      )
    }

    const r = tirarseDeLaEstrella(nivel)
    if (r.eventos.includes('hito') && r.eventos.includes('reaparicion')) {
      console.log(
        `   ✓ pisa la estrellita, se cae y vuelve a ella, en ${r.segundos.toFixed(0)} s`,
      )
    } else if (!r.eventos.includes('hito')) {
      mal('no llega a pisar la estrellita')
    } else {
      mal('pisa la estrellita pero no consigue caerse: la clase no se puede pasar')
    }
  } else {
    const r = subirla(nivel)
    if (r.eventos.includes('cima')) {
      console.log(
        `   ✓ llega arriba en ${r.pasitos} pasitos y ${r.segundos.toFixed(0)} s ` +
          `(se cayó ${r.caidas} ${r.caidas === 1 ? 'vez' : 'veces'})`,
      )
      // Una clase no puede costar caídas: es donde se aprende, y
      // aprender no puede doler. Que el robot se caiga no es prueba de
      // que ella se vaya a caer, pero sí de que el tramo está apretado.
      if (r.caidas > 0) {
        console.log('     ⚠ el robot se cayó: para una clase, eso ya está apretado')
      }
    } else {
      mal(`no llega arriba: se quedó en ${r.pasitos} pasitos`)
    }
  }

  console.log('')
}

console.log(
  fallos === 0
    ? '  ✓ las ' + CLASES.length + ' clases se pueden pasar\n'
    : `  ⚠ ${fallos} ${fallos === 1 ? 'problema' : 'problemas'} en la escuelita\n`,
)

process.exit(fallos === 0 ? 0 : 1)
