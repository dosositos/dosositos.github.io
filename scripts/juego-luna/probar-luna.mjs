/**
 * El probador del juego de la luna: corre el motor sin dibujar nada.
 *
 *   node --import ./scripts/juego-luna/alias-luna.mjs scripts/juego-luna/probar-luna.mjs
 *
 * Contesta dos preguntas sin abrir el navegador:
 *
 *   1. Cómo salta hoy la tortuga (cuánto avanza y cuánto sube con
 *      cada punto de la barra).
 *   2. Si el nivel entero se puede pasar: prueba cada tramo desde
 *      todas las posiciones y con todas las fuerzas, y avisa si hay
 *      alguno imposible o que salga por los pelos.
 *
 * Cómo funciona: le cambia el reloj al motor. En vez de esperar al
 * navegador para cada frame, le da los frames de a uno lo más rápido
 * que puede, y como la física es de paso fijo el resultado es
 * exactamente el mismo que en el teléfono.
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
const { construirNivel } = await import('@/juego-luna/mundos.ts')
const { SALTO, TORTUGA, MUNDO, PISTA, CAPITULOS } = await import('@/content/luna.ts')

/**
 * Qué capítulo se prueba. Sin argumento, el primero.
 *
 *   npm run luna:probar -- 2
 */
const cual = Number(process.argv[2]) || 1
const capitulo = CAPITULOS.find((c) => c.numero === cual) ?? CAPITULOS[0]
const nivel = construirNivel(capitulo)

/** Arranca un motor en un nivel cualquiera y devuelve cómo pisarlo. */
function banco(nivelDePrueba, conEmpujon) {
  const ultima = { escena: null }
  const eventos = []
  const motor = crearMotor({
    nivel: nivelDePrueba,
    conEmpujon,
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

/** Un nivel de mentira con una sola plataforma larguísima. */
function nivelLlano(y = 500) {
  const suelo = { x: 0, y, ancho: 6000, indice: 0 }
  return { plataformas: [suelo], hitos: [], suelo: y, cima: suelo, salida: { x: 3000, y } }
}

/* ── 1. Cómo salta ─────────────────────────────────────────────── */

function medirSalto(carga) {
  // El mundo se ensancha de mentira mientras dura la medición: si no,
  // el salto largo rebota contra la pared de los 360 y el número que
  // sale no es el alcance sino el rebote.
  const anchoReal = MUNDO.ancho
  MUNDO.ancho = 9000
  const { motor, frame, ver } = banco(nivelLlano())

  frame()
  const x0 = ver().x
  const y0 = ver().y

  motor.presionar()
  const framesDeCarga = Math.round((SALTO.msDeCarga * carga) / FRAME)
  for (let i = 0; i < framesDeCarga; i += 1) frame()
  motor.soltar()

  let masAlto = y0
  let ultimoX = x0
  let frames = 0
  while (frames < 600) {
    const escena = frame()
    frames += 1
    masAlto = Math.min(masAlto, escena.y)
    ultimoX = escena.x
    if (frames > 3 && escena.enSuelo) break
  }
  motor.detener()
  MUNDO.ancho = anchoReal

  return { carga, alcance: Math.abs(ultimoX - x0), altura: y0 - masAlto, segundos: frames / 60 }
}

console.log('\n  A la luna, a pasitos de tortuga — cómo salta hoy')
console.log(`  mundo ${MUNDO.ancho} de ancho · gravedad ${SALTO.gravedad} · ángulo ${SALTO.angulo}°`)
console.log(
  `  impulso ${SALTO.impulsoMinimo} a ${SALTO.impulsoMaximo} · carga llena en ${SALTO.msDeCarga} ms\n`,
)
console.log('   barra   avanza    sube   dura')
console.log('   ─────   ──────   ─────   ────')

for (const carga of [0, 0.25, 0.5, 0.75, 1]) {
  const r = medirSalto(carga)
  console.log(
    `   ${String(Math.round(carga * 100)).padStart(3)}%   ${String(Math.round(r.alcance)).padStart(4)} px   ${String(Math.round(r.altura)).padStart(3)} px   ${r.segundos.toFixed(2)}s`,
  )
}

const masLargo = medirSalto(1)

/* ── 2. ¿Se puede pasar el nivel? ──────────────────────────────── */

/**
 * Prueba un tramo de verdad: deja caminar a la tortuga por la
 * plataforma de abajo y va probando saltos desde cada sitio del
 * recorrido y con cada fuerza de la barra. Devuelve cuántos de esos
 * intentos llegan a la de arriba.
 *
 * Es a lo bruto a propósito. Un cálculo de balística diría si el
 * salto llega, pero no si la tortuga puede *estar* ahí mirando para
 * ese lado: camina sola, y eso es la mitad del problema.
 */
function nivelDeDos(desde, hasta, salida) {
  // Reindexados a 0 y 1: el motor guarda la vida de cada tramo por su
  // índice, y con los del capítulo entero se saldría del arreglo y la
  // tortuga se quedaría sin suelo que pisar.
  const a = { ...desde, indice: 0 }
  const b = { ...hasta, indice: 1 }
  return {
    plataformas: [a, b],
    hitos: [],
    suelo: a.y,
    cima: b,
    salida: salida ?? { x: a.x + a.ancho / 2, y: a.y },
    material: capitulo.material,
    // Con dos plataformas sueltas no tiene sentido borrar nada.
    seDesvanece: false,
  }
}

function probarTramo(desde, hasta) {
  const nivelTramo = nivelDeDos(desde, hasta)

  // Un ciclo entero de ida y vuelta cubre todas las posiciones y las
  // dos direcciones.
  const recorrido = Math.max(1, desde.ancho - TORTUGA.ancho)
  const framesDelCiclo = Math.ceil(((2 * recorrido) / TORTUGA.velocidad) * 60)
  const paso = Math.max(4, Math.round(framesDelCiclo / 40))

  let intentos = 0
  let logrados = 0
  let cargaMinima = 1
  let cargaMaxima = 0

  for (let espera = 0; espera < framesDelCiclo; espera += paso) {
    for (let c = 0; c <= 20; c += 1) {
      const carga = c / 20
      const { motor, frame, eventos } = banco(nivelTramo)

      for (let i = 0; i < espera; i += 1) frame()
      motor.presionar()
      const framesDeCarga = Math.round((SALTO.msDeCarga * carga) / FRAME)
      for (let i = 0; i < framesDeCarga; i += 1) frame()
      motor.soltar()

      intentos += 1
      for (let i = 0; i < 240; i += 1) {
        const e = frame()
        if (e.cayendo) break

        // Si el destino es un tramo de impulso, aterrizar y quedarse
        // quieta encima no pasa nunca: la lanza en el mismo frame. Lo
        // que cuenta es que el impulso se haya disparado.
        if (hasta.impulso && eventos.includes('impulso')) {
          logrados += 1
          cargaMinima = Math.min(cargaMinima, carga)
          cargaMaxima = Math.max(cargaMaxima, carga)
          break
        }

        if (i > 3 && e.enSuelo) {
          // Dos frames más antes de mirar dónde cayó: la escena trae
          // la posición interpolada para dibujar, y en el frame justo
          // del aterrizaje todavía va unos píxeles por encima de la
          // plataforma. Sin esperar, un aterrizaje bueno se lee como
          // fallado.
          frame()
          const quieta = frame()
          const encima =
            Math.abs(quieta.y - hasta.y) < 1 &&
            quieta.x >= hasta.x - 2 &&
            quieta.x <= hasta.x + hasta.ancho + 2
          if (encima) {
            logrados += 1
            cargaMinima = Math.min(cargaMinima, carga)
            cargaMaxima = Math.max(cargaMaxima, carga)
          }
          break
        }
      }
      motor.detener()
    }
  }

  return { intentos, logrados, cargaMinima, cargaMaxima }
}

console.log(`\n  Capítulo ${capitulo.numero}: ${capitulo.id}, tramo por tramo`)
console.log(
  `  ${nivel.plataformas.length} plataformas, ${nivel.hitos.length} hitos, ${Math.round(nivel.suelo - nivel.cima.y)} px de subida\n`,
)
console.log('   tramo    sube   se pasa   con la barra')
console.log('   ─────   ─────   ───────   ────────────')

let imposibles = 0
let apretados = 0

/**
 * Un tramo de impulso no se salta: se cae en él y lanza solo, siempre
 * con la misma fuerza y desde su centro. Lo único que hay que saber es
 * si el destino está donde cae.
 *
 * Se la deja caer veinte píxeles por encima del tramo, que es menos de
 * lo que perdona la caída, así que aterriza y el motor hace el resto.
 */
function probarImpulso(desde, hasta) {
  const nivelTramo = nivelDeDos(desde, hasta, {
    x: desde.x + desde.ancho / 2,
    y: desde.y - 20,
  })
  const { motor, frame, eventos } = banco(nivelTramo)

  let e = frame()
  for (let i = 0; i < 300; i += 1) {
    e = frame()
    if (eventos.includes('caida')) break
    if (i > 30 && e.enSuelo) {
      frame()
      e = frame()
      break
    }
  }
  motor.detener()

  const lanzo = eventos.includes('impulso')
  const encima =
    Math.abs(e.y - hasta.y) < 1 && e.x >= hasta.x - 2 && e.x <= hasta.x + hasta.ancho + 2

  return { lanzo, encima, x: e.x }
}

for (let i = 0; i < nivel.plataformas.length - 1; i += 1) {
  const desde = nivel.plataformas[i]
  const hasta = nivel.plataformas[i + 1]
  const sube = Math.round(desde.y - hasta.y)

  if (desde.impulso) {
    const r = probarImpulso(desde, hasta)
    const bien = r.lanzo && r.encima
    if (!bien) imposibles += 1
    console.log(
      `   ${String(i + 1).padStart(2)}→${String(i + 2).padStart(2)}   ${String(sube).padStart(4)}   impulso   cae en x=${r.x.toFixed(0)}${
        bien ? '' : '  ⚠ NO CAE EN LA PLATAFORMA'
      }`,
    )
    continue
  }

  const r = probarTramo(desde, hasta)
  const porcentaje = (r.logrados / r.intentos) * 100

  let nota = ''
  if (r.logrados === 0) {
    nota = '  ⚠ NO SE PASA'
    imposibles += 1
  } else if (porcentaje < 4) {
    nota = '  ← apretadísimo'
    apretados += 1
  } else if (porcentaje < 9) {
    nota = '  ← justo'
  }

  const rango =
    r.logrados === 0
      ? '     —'
      : `${String(Math.round(r.cargaMinima * 100)).padStart(3)}% a ${String(Math.round(r.cargaMaxima * 100)).padStart(3)}%`

  console.log(
    `   ${String(i + 1).padStart(2)}→${String(i + 2).padStart(2)}   ${String(sube).padStart(4)}   ${porcentaje.toFixed(1).padStart(5)}%   ${rango}${nota}`,
  )
}

console.log('')
if (imposibles > 0) {
  console.log(`  ⚠ Hay ${imposibles} tramo(s) que no se pasan ni a barra llena.`)
  console.log('    Acercá esas plataformas en CAPITULOS, en src/content/luna.ts.\n')
} else if (apretados > 0) {
  console.log(`  ✓ Se puede pasar entero, pero ${apretados} tramo(s) salen apretadísimos.`)
  console.log('    Está bien si es a propósito; si no, acercalos un poco.\n')
} else {
  console.log('  ✓ El nivel se puede pasar entero, y ningún tramo pide milagros.\n')
}


/* ── 3. Jugarlo de punta a punta ───────────────────────────────── */

/**
 * Un robot que juega el nivel entero.
 *
 * En cada plataforma calcula, para su posición y hacia donde está
 * mirando, con cuánta barra caería dentro de la siguiente, y salta.
 * La cuenta es aproximada (la física del motor va por pasos, no por
 * fórmula), así que a veces se equivoca y se cae. Eso está bien: se
 * cae, vuelve al hito y sigue, que es exactamente lo que hay que
 * comprobar.
 *
 * Contesta lo que ningún tramo suelto contesta: si el capítulo se
 * puede terminar, cuántos pasitos cuesta y si los hitos devuelven a
 * donde tienen que devolver.
 */
function jugarNivel() {
  const grados = (g) => (g * Math.PI) / 180
  const { motor, frame, eventos, ver } = banco(nivel)

  /** ¿Con esta carga caería dentro de la plataforma de destino? */
  function caeDentro(escena, destino, carga) {
    const v = SALTO.impulsoMinimo + (SALTO.impulsoMaximo - SALTO.impulsoMinimo) * carga
    const vx = Math.cos(grados(SALTO.angulo)) * v * escena.mirando
    const vy = -Math.sin(grados(SALTO.angulo)) * v
    const g = SALTO.gravedad
    const dy = destino.y - escena.y

    // Que suba de sobra y no de milagro. Justo en el punto más alto
    // del salto la tortuga va parada en el aire, y el motor solo la
    // deja aterrizar mientras baja: apuntar al ápice es fallar.
    const alturaMaxima = (vy * vy) / (2 * g)
    if (alturaMaxima < -dy + 15) return false

    // y(t) = vy·t + g·t²/2 = dy, quedándose con la raíz de la bajada.
    const disc = vy * vy + 2 * g * dy
    if (disc < 0) return false
    const t = (-vy + Math.sqrt(disc)) / g
    const x = escena.x + vx * t

    // Con margen: apuntar al borde justo es pedirle al robot una
    // puntería que la física por pasos no le va a dar.
    return x > destino.x + 12 && x < destino.x + destino.ancho - 12
  }

  let objetivo = 1
  let frames = 0
  let cargando = false
  let framesCargando = 0
  let cargaElegida = 0

  while (frames < 60 * 60 * 6 && objetivo < nivel.plataformas.length) {
    const e = frame()
    frames += 1
    if (!e) continue

    if (e.enSuelo && !cargando && !e.cayendo) {
      // En qué plataforma está parada. Se mira con holgura porque la
      // escena trae la posición interpolada para dibujar, que en el
      // frame del aterrizaje va unos píxeles por encima. Y se mira de
      // verdad, en vez de dar por hecho que el salto salió bien: tras
      // una caída puede estar en un hito de mucho más abajo.
      const donde = nivel.plataformas.find(
        (p) => Math.abs(e.y - p.y) < 8 && e.x >= p.x - 4 && e.x <= p.x + p.ancho + 4,
      )
      if (!donde) continue
      objetivo = donde.indice + 1
      if (objetivo >= nivel.plataformas.length) break

      const destino = nivel.plataformas[objetivo]

      for (let c = 0; c <= 40; c += 1) {
        const carga = c / 40
        if (caeDentro(e, destino, carga)) {
          cargaElegida = carga
          cargando = true
          framesCargando = 0
          motor.presionar()
          break
        }
      }
    } else if (cargando) {
      framesCargando += 1
      if (framesCargando * FRAME >= SALTO.msDeCarga * cargaElegida) {
        motor.soltar()
        cargando = false
      }
    }
  }

  motor.detener()
  const cuenta = motor.cuenta()
  return {
    llego: eventos.includes('cima'),
    hitos: eventos.filter((x) => x === 'hito').length,
    ...cuenta,
    segundos: frames / 60,
  }
}

console.log('')
console.log('  Jugado de punta a punta por un robot')
const partida = jugarNivel()
if (partida.llego) {
  console.log(`   ✓ llegó a la cima en ${partida.pasitos} pasitos y ${partida.segundos.toFixed(0)} segundos`)
  console.log(`     se cayó ${partida.caidas} ${partida.caidas === 1 ? 'vez' : 'veces'} y pisó ${partida.hitos} hitos`)
  if (partida.caidas > 0) {
    console.log('     (cada caída lo devolvió a su hito y siguió desde ahí)')
  }
} else {
  console.log(`   ⚠ no llegó: se quedó en ${partida.pasitos} pasitos con ${partida.caidas} caídas`)
  console.log('     Puede ser el nivel o puede ser el robot, que apunta con una cuenta aproximada.')
}
console.log('')


/* ── 4. ¿Los hitos devuelven a donde deben? ────────────────────── */

/**
 * Sube con el robot hasta pisar dos hitos, se tira al vacío a
 * propósito y comprueba dónde reaparece. Es lo que la fase 2 agrega y
 * lo único que no se puede ver en una foto.
 */
function probarCaida() {
  const grados = (g) => (g * Math.PI) / 180
  const { motor, frame, eventos } = banco(nivel)

  let hitosVistos = 0
  let cargando = false
  let framesCargando = 0
  let cargaElegida = 0
  let ultimoHito = null

  for (let f = 0; f < 60 * 60 * 4; f += 1) {
    const e = frame()
    if (!e) continue

    hitosVistos = eventos.filter((x) => x === 'hito').length

    // Con dos hitos pisados ya se puede probar la caída: se tira al
    // vacío dando saltitos flojos desde la orilla.
    if (hitosVistos >= 2) {
      if (!ultimoHito) {
        const hito = nivel.hitos.filter((h) => h.hito).find((h, i, todos) => i === hitosVistos - 1)
        ultimoHito = hito ?? null
      }
      if (e.enSuelo && !cargando && !e.cayendo) {
        motor.presionar()
        cargando = true
        framesCargando = 0
        cargaElegida = 0
      } else if (cargando) {
        motor.soltar()
        cargando = false
      }
      if (e.cayendo) {
        // Se dejan pasar la caída y la reaparición.
        for (let i = 0; i < 60; i += 1) frame()
        const vuelta = frame()
        motor.detener()
        return { hito: ultimoHito, x: vuelta.x, y: vuelta.y, caidas: motor.cuenta().caidas }
      }
      continue
    }

    if (e.enSuelo && !cargando && !e.cayendo) {
      const donde = nivel.plataformas.find(
        (p) => Math.abs(e.y - p.y) < 8 && e.x >= p.x - 4 && e.x <= p.x + p.ancho + 4,
      )
      if (!donde) continue
      const objetivo = donde.indice + 1
      if (objetivo >= nivel.plataformas.length) break
      const destino = nivel.plataformas[objetivo]
      for (let c = 0; c <= 40; c += 1) {
        const carga = c / 40
        const v = SALTO.impulsoMinimo + (SALTO.impulsoMaximo - SALTO.impulsoMinimo) * carga
        const vx = Math.cos(grados(SALTO.angulo)) * v * e.mirando
        const vy = -Math.sin(grados(SALTO.angulo)) * v
        const g = SALTO.gravedad
        const dy = destino.y - e.y
        if ((vy * vy) / (2 * g) < -dy + 15) continue
        const disc = vy * vy + 2 * g * dy
        if (disc < 0) continue
        const x = e.x + vx * ((-vy + Math.sqrt(disc)) / g)
        if (x > destino.x + 12 && x < destino.x + destino.ancho - 12) {
          cargaElegida = carga
          cargando = true
          framesCargando = 0
          motor.presionar()
          break
        }
      }
    } else if (cargando) {
      framesCargando += 1
      if (framesCargando * FRAME >= SALTO.msDeCarga * cargaElegida) {
        motor.soltar()
        cargando = false
      }
    }
  }

  motor.detener()
  return null
}

console.log('  Y al caerse')
const caida = probarCaida()
if (!caida || !caida.hito) {
  console.log('   ⚠ no se pudo probar (el robot no llegó a caerse con dos hitos pisados)')
} else {
  // Reaparece en el centro del hito, pero enseguida echa a caminar:
  // lo que se comprueba es que esté en esa plataforma, no clavada en
  // el punto exacto.
  const enElHito = Math.abs(caida.y - caida.hito.y) < 8
  const cerca = caida.x >= caida.hito.x - 4 && caida.x <= caida.hito.x + caida.hito.ancho + 4
  console.log(
    `   se cayó y reapareció en x=${caida.x.toFixed(0)} y=${caida.y.toFixed(0)}; el hito va de x=${caida.hito.x} a ${caida.hito.x + caida.hito.ancho}, y=${caida.hito.y}`,
  )
  console.log(
    enElHito && cerca
      ? '   ✓ volvió al último hito que había pisado, no al principio'
      : '   ⚠ no volvió al hito',
  )
}
console.log('')

/* ── 5. Aterrizar en la punta ──────────────────────────────────
   Aterrizar con el centro justo fuera de la orilla es un sitio malo:
   la comprobación del aterrizaje perdona unos píxeles de más, y si la
   de «¿tengo suelo debajo para caminar?» no perdona lo mismo, la
   tortuga queda en tierra de nadie. No camina, se deja caer, el
   aterrizaje la vuelve a subir, y así sesenta veces por segundo,
   plantada en la pose del golpe hasta que salte.

   Barre la punta de una plataforma por todo el sitio donde puede
   caer, medio píxel a la vez, y comprueba que en ninguno se planta.
   Ahí es donde hay que mirar: el rango bueno son tres o cuatro
   píxeles y a ojo no se encuentra. */

console.log('  Aterrizando en la punta de una plataforma')

/** Un salto desde el sitio, sin caminar antes: sale siempre igual. */
function saltoQuieto(anchoDeLaSegunda) {
  const nivelPunta = construirNivel({
    ...capitulo,
    seDesvanece: false,
    plataformas: [
      { x: 150, ancho: 100, altura: 0 },
      { x: 300, ancho: anchoDeLaSegunda, altura: 0 },
    ],
  })
  const { motor, frame, eventos } = banco(nivelPunta)
  const cuantos = (cual) => eventos.filter((e) => e === cual).length

  frame()
  motor.presionar()
  for (let i = 0; i < Math.round((SALTO.msDeCarga * 0.6) / FRAME); i += 1) frame()
  motor.soltar()

  let e = frame()
  for (let i = 0; i < 400 && cuantos('aterrizaje') === 0 && cuantos('caida') === 0; i += 1) {
    e = frame()
  }
  const xAlCaer = e.x
  const caminadoAlCaer = e.caminado
  for (let i = 0; i < 90; i += 1) e = frame()
  motor.detener()

  return {
    cayo: cuantos('caida') > 0,
    // La x del aterrizaje, no la de después: con la de después el
    // barrido se corre unos píxeles y pasa de largo por el sitio malo.
    x: xAlCaer,
    // Aterrizar una vez es lo normal. Noventa es el atasco.
    aterrizajes: cuantos('aterrizaje'),
    // En unidades de patica, no en píxeles: caminando 1,5 segundos
    // da algo más de 7 y plantada da 0.
    camino: e.caminado - caminadoAlCaer,
  }
}

/** Con la plataforma infinita se ve dónde cae de verdad. */
const dondeCae = saltoQuieto(5000).x
const plantadas = []

for (let d = -3; d <= 5; d += 0.5) {
  const punta = Math.round(dondeCae) + d
  const r = saltoQuieto(punta - 300)
  if (!r.cayo && r.camino < 0.5) plantadas.push({ punta, aterrizajes: r.aterrizajes })
}

console.log(`   cae cerca de x=${dondeCae.toFixed(1)}, y se probaron 17 puntas alrededor`)
console.log(
  plantadas.length === 0
    ? '   ✓ en ninguna se quedó plantada'
    : `   ⚠ se planta con la punta en ${plantadas.map((p) => p.punta.toFixed(1)).join(', ')}`,
)
console.log('')

/* ── 6. La pista que se borra ──────────────────────────────────
   La traba del capítulo de Boo. Tres cosas que tienen que pasar y
   que a ojo cuestan de comprobar, porque hay que llegar hasta el
   primer lazo para verlas: que hasta ese lazo no se borre nada, que
   después sí, y que al volver al lazo la pista de arriba vuelva
   entera. Sin lo último, caerse sería el final de la partida. */

console.log('  La pista que se borra')

/** Un mundo chiquito con su lazo abajo y dos tramos encima. */
function mundoQueSeBorra() {
  return construirNivel({
    ...capitulo,
    seDesvanece: true,
    plataformas: [
      { x: 30, ancho: 120, altura: 0, hito: true },
      { x: 210, ancho: 120, altura: 75 },
      { x: 30, ancho: 120, altura: 150 },
    ],
  })
}

/** Salta desde donde esté con la carga que se le diga. */
function saltarCon(motor, frame, carga) {
  motor.presionar()
  for (let i = 0; i < Math.round((SALTO.msDeCarga * carga) / FRAME); i += 1) frame()
  motor.soltar()
}

{
  // (a) El lazo no se borra nunca, por mucho que despegue de él.
  const nivelLazo = mundoQueSeBorra()
  const { motor, frame } = banco(nivelLazo)
  frame()
  saltarCon(motor, frame, 0.5)
  let e = frame()
  for (let i = 0; i < 240; i += 1) e = frame()
  motor.detener()
  console.log(
    e.vidaDeLaPista[0] === 1
      ? '   ✓ el lazo de abajo sigue entero después de despegar de él'
      : `   ⚠ el lazo se borró (le quedó ${e.vidaDeLaPista[0].toFixed(2)})`,
  )
}

{
  // (b) y (c) El tramo de arriba del lazo sí se borra, y vuelve
  // entero al caerse. Arranca parada en ese tramo, que va ancho a
  // propósito: así el saltito de prueba cae otra vez encima y lo que
  // se mide es el borrado y no la puntería.
  const nivelBorrado = construirNivel({
    ...capitulo,
    seDesvanece: true,
    plataformas: [
      { x: 30, ancho: 120, altura: 0, hito: true },
      { x: 30, ancho: 300, altura: 75 },
    ],
  })
  const arriba = nivelBorrado.plataformas[1]
  nivelBorrado.salida = { x: arriba.x + arriba.ancho / 2, y: arriba.y }

  const { motor, frame, eventos } = banco(nivelBorrado)

  // Unos pasos caminando, que es lo que le dice al motor en qué tramo
  // está parada antes de despegar.
  let e = frame()
  for (let i = 0; i < 10; i += 1) e = frame()
  saltarCon(motor, frame, 0.15)

  const framesHastaIrse = Math.ceil(PISTA.msParaIrse / FRAME) + 40
  let seBorro = false
  for (let i = 0; i < framesHastaIrse && !seBorro; i += 1) {
    e = frame()
    if (e.vidaDeLaPista[1] === 0) seBorro = true
  }
  console.log(
    seBorro
      ? '   ✓ el tramo del que despegó se borró solo, y volver a pisarlo no lo salva'
      : `   ⚠ no se borró (le queda ${e.vidaDeLaPista[1].toFixed(2)})`,
  )

  // Sin ese tramo se queda sin suelo, se cae y vuelve al lazo.
  for (let i = 0; i < 600 && !eventos.includes('reaparicion'); i += 1) e = frame()
  motor.detener()

  const volvio = eventos.includes('reaparicion')
  const enteras = volvio && e.vidaDeLaPista.every((v) => v === 1)
  console.log(
    enteras
      ? '   ✓ al volver, la pista de arriba está otra vez entera'
      : volvio
        ? `   ⚠ volvió pero la pista sigue borrada (${e.vidaDeLaPista.join(', ')})`
        : '   ⚠ no llegó a caerse, la prueba no dice nada',
  )
}
console.log('')

/* ── 7. El empujón ─────────────────────────────────────────────
   El poder que se gana con Boo: un toque en el aire, mientras cae, y
   llega más lejos. Se mide contra el mismo salto sin gastarlo. */

// Cuánto aguanta la pista según cuántas estrellas lleve pisadas: el
// capítulo se va apurando solo, sin mover una plataforma.
if (capitulo.seDesvanece) {
  const cuantas = capitulo.plataformas.filter((p) => p.hito).length
  const duras = []
  for (let i = 0; i <= cuantas; i += 1) {
    const ms = Math.max(PISTA.msMinimo, PISTA.msParaIrse - i * PISTA.msMenosPorEstrella)
    duras.push((ms / 1000).toFixed(1) + 's')
  }
  console.log(`   la pista aguanta ${duras.join(' → ')} según las estrellas pisadas`)
}
console.log('')
console.log('  El empujón')

/** El mismo salto flojo, con y sin gastar el empujón en la bajada. */
function saltoLargo(conEmpujon, gastarlo) {
  const anchoReal = MUNDO.ancho
  MUNDO.ancho = 9000
  const { motor, frame, eventos } = banco(nivelLlano(), conEmpujon)

  frame()
  const x0 = frame().x
  saltarCon(motor, frame, 0.5)

  let e = frame()
  let usado = false
  for (let i = 0; i < 400; i += 1) {
    e = frame()
    // En cuanto empieza a bajar, el toque.
    if (gastarlo && !usado && e.vy > 0) {
      motor.presionar()
      motor.soltar()
      usado = true
    }
    if (i > 3 && e.enSuelo) break
  }
  motor.detener()
  MUNDO.ancho = anchoReal

  return { alcance: e.x - x0, gastado: eventos.includes('empujon') }
}

{
  const normal = saltoLargo(false, true)
  const conPoder = saltoLargo(true, true)
  const guardado = saltoLargo(true, false)

  console.log(
    `   sin el poder avanza ${Math.round(normal.alcance)} px, gastándolo ${Math.round(conPoder.alcance)} px`,
  )
  console.log(
    conPoder.gastado && conPoder.alcance > normal.alcance + 20
      ? `   ✓ el empujón suma ${Math.round(conPoder.alcance - normal.alcance)} px`
      : '   ⚠ el empujón no hizo nada',
  )
  console.log(
    !normal.gastado
      ? '   ✓ sin haberlo ganado, tocar en el aire no hace nada'
      : '   ⚠ lo gastó sin haberlo ganado',
  )
  console.log(
    !guardado.gastado && Math.abs(guardado.alcance - normal.alcance) < 1
      ? '   ✓ sin tocar, el salto sale igual que siempre'
      : '   ⚠ el empujón se gastó solo',
  )
}
console.log('')

console.log(
  `  El salto más largo avanza ${Math.round(masLargo.alcance)} px y sube ${Math.round(masLargo.altura)}.`,
)
console.log(`  La tortuga mide ${TORTUGA.ancho} de ancho y camina a ${TORTUGA.velocidad} px/s.\n`)
