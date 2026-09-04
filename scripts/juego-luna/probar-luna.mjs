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
const { construirNivel, msDeCargaEn } = await import('@/juego-luna/mundos.ts')
const { opacidadDeLaPista } = await import('@/juego-luna/dibujo.ts')
const { laLlegada } = await import('@/juego-luna/llegada.ts')
const { superficieDe } = await import('@/juego-luna/mundos.ts')
const { conCualEntra } = await import('@/juego-luna/progreso.ts')
const {
  SALTO,
  TORTUGA,
  MUNDO,
  PISTA,
  LUNA,
  LLEGADA,
  CAJAS,
  CINTA,
  PELUCHES,
  ALMOHADAS,
  COBIJAS,
  LO_QUE_CAE,
  CANSANCIO,
  CAIDA,
  CAPITULOS,
} = await import('@/content/luna.ts')

/**
 * Qué capítulo se prueba. Sin argumento, el primero.
 *
 *   npm run luna:probar -- 2
 */
const cual = Number(process.argv[2]) || 1
const capitulo = CAPITULOS.find((c) => c.numero === cual) ?? CAPITULOS[0]
const nivel = construirNivel(capitulo)

/** Arranca un motor en un nivel cualquiera y devuelve cómo pisarlo. */
function banco(nivelDePrueba) {
  const ultima = { escena: null }
  const eventos = []
  const motor = crearMotor({
    nivel: nivelDePrueba,
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
    // Las cajas sí ceden, que es la mitad del problema: el salto sale
    // desde la altura a la que la caja se haya ido, no desde la línea
    // de la plataforma.
    cede: capitulo.cede,
    // Y las almohadas se hunden, por lo mismo: en el capítulo de Nico
    // lo que decide si un tramo se pasa es cuánto tardó en salir.
    seHunde: capitulo.seHunde,
  }
}

/**
 * ¿Está parada encima de esta plataforma?
 *
 * Se mira contra la superficie de verdad y no contra la línea de la
 * plataforma, porque en el capítulo de Ovi la caja ya cedió debajo de
 * ella en los dos frames que van del aterrizaje a esta comprobación.
 * Comparando con la línea, un aterrizaje bueno en la orilla se leía
 * como fallado y el capítulo entero salía cinco puntos más difícil de
 * lo que es. El arnés mintiendo antes que el juego, otra vez.
 *
 * En el capítulo de Nico es todavía más grave: la almohada no se queda
 * a media inclinación, se va bajando 34 px enteros mientras la tortuga
 * está encima. Comparando con la línea, a los pocos segundos ningún
 * aterrizaje contaría.
 */
function estaEncima(escena, p, indiceEnLaPrueba = p.indice, margen = 1) {
  const inclinacion = escena.inclinacion?.[indiceEnLaPrueba] ?? 0
  const hundido = escena.hundido?.[indiceEnLaPrueba] ?? 0
  const suelo = superficieDe(p, escena.x, inclinacion, hundido)
  return (
    Math.abs(escena.y - suelo) < margen && escena.x >= p.x - 2 && escena.x <= p.x + p.ancho + 2
  )
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
  /**
   * Lo más tarde que se puede salir y todavía llegar, en milisegundos
   * desde que aparece en la plataforma de abajo.
   *
   * Solo dice algo en el capítulo de Nico, donde la almohada se está
   * hundiendo todo ese rato: es lo que separa un tramo que pide prisa
   * de uno que no. En los otros dos capítulos sale siempre el ciclo
   * entero, porque esperar no cuesta nada.
   */
  let esperaMaxima = 0

  for (let espera = 0; espera < framesDelCiclo; espera += paso) {
    for (let c = 0; c <= 20; c += 1) {
      const carga = c / 20
      const { motor, frame, eventos } = banco(nivelTramo)

      for (let i = 0; i < espera; i += 1) frame()
      motor.presionar()
      // Cuánto hay que aguantar para llegar a esa barra depende de
      // dónde está parada: en una cobija enredada la barra sube más
      // lento. Aguantando siempre `SALTO.msDeCarga` el arnés probaría
      // una barra al 60 % creyendo que la tiene al tope, y daría por
      // imposible un tramo que se pasa perfectamente.
      const framesDeCarga = Math.round((msDeCargaEn(desde) * carga) / FRAME)
      for (let i = 0; i < framesDeCarga; i += 1) frame()
      motor.soltar()

      intentos += 1
      for (let i = 0; i < 240; i += 1) {
        const e = frame()
        if (e.cayendo) break

        // Si el destino es un tramo de impulso o una caja de
        // peluches, aterrizar y quedarse quieta encima no pasa: la
        // lanza o la devuelve en el mismo frame. Lo que cuenta es que
        // haya llegado a tocarla.
        if ((hasta.impulso && eventos.includes('impulso')) ||
            (hasta.rebote && eventos.includes('rebote'))) {
          logrados += 1
          cargaMinima = Math.min(cargaMinima, carga)
          cargaMaxima = Math.max(cargaMaxima, carga)
          esperaMaxima = Math.max(esperaMaxima, espera * FRAME)
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
          // El destino es el índice 1 del nivel de dos plataformas.
          if (estaEncima(quieta, hasta, 1)) {
            logrados += 1
            cargaMinima = Math.min(cargaMinima, carga)
            cargaMaxima = Math.max(cargaMaxima, carga)
            esperaMaxima = Math.max(esperaMaxima, espera * FRAME)
          }
          break
        }
      }
      motor.detener()
    }
  }

  return { intentos, logrados, cargaMinima, cargaMaxima, esperaMaxima }
}

console.log(`\n  Capítulo ${capitulo.numero}: ${capitulo.id}, tramo por tramo`)
console.log(
  `  ${nivel.plataformas.length} plataformas, ${nivel.hitos.length} hitos, ${Math.round(nivel.suelo - nivel.cima.y)} px de subida`,
)

const cuantasSon = (cual) => nivel.plataformas.filter((p) => p[cual]).length
const especiales = [
  ['de impulso', cuantasSon('impulso')],
  ['forradas de cinta', cuantasSon('resbala')],
  ['de peluches', cuantasSon('rebote')],
  ['enredadas de cobija', cuantasSon('enreda')],
  ['al tope', cuantasSon('alTope')],
  ['a prisa', cuantasSon('aPrisa')],
].filter(([, cuantas]) => cuantas > 0)
console.log(
  especiales.length
    ? `  ${especiales.map(([nombre, cuantas]) => `${cuantas} ${nombre}`).join(' · ')}\n`
    : '',
)
console.log('   tramo    sube   se pasa   con la barra')
console.log('   ─────   ─────   ───────   ────────────')

let imposibles = 0
let apretados = 0
/** Huecos marcados «al tope» o «a prisa» que en realidad no lo piden. */
let flojos = 0

/**
 * Hasta cuándo puede salir un hueco marcado «a prisa» y seguir
 * llamándose así.
 *
 * Dos segundos y medio es aproximadamente lo que tarda una vuelta de
 * la caminata en una almohada de las del capítulo, que es la unidad
 * con la que se juega: o salís en la pasada en que llegaste, o ya no
 * llegás.
 */
const MS_DE_PRISA = 2500

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
  const encima = estaEncima(e, hasta, 1)

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
  } else if (hasta.alTope) {
    // Marcado en `luna.ts` como hueco de los que solo se pasan con la
    // barra al tope. Que salga apretado es el punto; lo que hay que
    // comprobar es que de verdad pida el tope y no se pase a medias.
    nota = r.cargaMinima >= 0.9 ? '  ← al tope, a propósito' : '  ⚠ NO PIDE EL TOPE'
    if (r.cargaMinima < 0.9) flojos += 1
  } else if (hasta.aPrisa) {
    // Y este es el de Nico: se pasa saliendo pronto y no se pasa
    // dejando que la almohada se hunda. Lo que hay que comprobar es
    // que de verdad se cierre a tiempo, porque un «a prisa» que se
    // pasa igual a los cuatro segundos es una plataforma normal con
    // un rótulo puesto.
    const aTiempo = r.esperaMaxima <= MS_DE_PRISA
    nota = aTiempo
      ? `  ← a prisa, a propósito (hasta ${(r.esperaMaxima / 1000).toFixed(1)}s)`
      : `  ⚠ NO PIDE PRISA (se pasa hasta a los ${(r.esperaMaxima / 1000).toFixed(1)}s)`
    if (!aTiempo) flojos += 1
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

  // Un rótulo de dos letras para saber de qué se habla sin contar
  // plataformas a mano en `luna.ts`.
  const que = hasta.rebote
    ? ' pel'
    : hasta.resbala
      ? ' cin'
      : hasta.enreda
        ? ' cob'
        : hasta.hito
          ? ' ★'
          : ''

  console.log(
    `   ${String(i + 1).padStart(2)}→${String(i + 2).padStart(2)}   ${String(sube).padStart(4)}   ${porcentaje.toFixed(1).padStart(5)}%   ${rango}${que}${nota}`,
  )
}

console.log('')
if (imposibles > 0) {
  console.log(`  ⚠ Hay ${imposibles} tramo(s) que no se pasan ni a barra llena.`)
  console.log('    Acercá esas plataformas en CAPITULOS, en src/content/luna.ts.\n')
} else if (flojos > 0) {
  console.log(`  ⚠ Hay ${flojos} hueco(s) marcados que no piden lo que dicen pedir.`)
  console.log('    O se alejan un poco, o se les quita la marca en src/content/luna.ts.\n')
} else if (apretados > 0) {
  console.log(`  ✓ Se puede pasar entero, pero ${apretados} tramo(s) salen apretadísimos.`)
  console.log('    Está bien si es a propósito; si no, acercalos un poco.\n')
} else {
  console.log('  ✓ El nivel se puede pasar entero, y ningún tramo pide milagros.\n')
}


/* ── 3. Jugarlo de punta a punta ───────────────────────────────── */

/* ── La puntería, que usan los dos robots ──────────────────────
   Estaban adentro de `jugarNivel` y el trepador de la sección 4
   tenía su propia copia, más tonta. Cada vez que el juego aprendía
   algo —la cinta que arrastra, la almohada que se hunde, la cobija
   que frena la barra— había que acordarse de enseñárselo a las dos
   copias, y las tres veces me olvidé de la segunda. La prueba de los
   hitos decía «no se pudo probar» y lo que no se podía era ella. */

const grados = (g) => (g * Math.PI) / 180

/**
 * Desde dónde va a salir de verdad, contando lo que la caja forrada
 * de cinta la va a arrastrar mientras carga.
 *
 * Sin esto el robot apuntaba desde donde estaba al empezar a cargar
 * y soltaba desde treinta píxeles más allá, así que fallaba todos
 * los saltos que salen de una caja con cinta y se quedaba dando
 * vueltas sin caerse ni llegar. Una jugadora aprende esto al
 * segundo intento; el robot tiene que saberlo para que lo que mida
 * sea el nivel y no su propia ingenuidad.
 */
function dondeSaldra(escena, donde, carga) {
  if (!donde?.resbala) return escena.x
  const medio = donde.x + donde.ancho / 2
  const lado = Math.max(-1, Math.min(1, (escena.x - medio) / (donde.ancho / 2)))
  // Entre la inclinación que la caja tiene ahora y la que va a tener
  // cuando termine de irse hacia ella. Tomar solo la segunda
  // sobrestimaba el arrastre, porque la caja tarda su cuarto de
  // segundo en asentarse y en una carga corta ni llega.
  const ahora = escena.inclinacion?.[donde.indice] ?? 0
  const media = (ahora + lado) / 2
  return escena.x + CINTA.arrastre * media * ((msDeCargaEn(donde) * carga) / 1000)
}

/**
 * Y desde qué altura va a salir de verdad, contando lo que la
 * almohada se va a hundir mientras carga.
 *
 * La misma trampa que la cinta de Ovi, en el otro eje: el robot
 * apuntaba desde la altura que tenía al empezar a cargar y soltaba
 * veinte píxeles más abajo, así que fallaba justo los saltos que el
 * capítulo entero está pidiendo y lo que quedaba medido era su
 * ingenuidad, no el nivel. Una jugadora aprende esto en el segundo
 * salto.
 */
function alturaDeSalida(escena, donde, carga) {
  if (!donde?.hunde) return escena.y
  const ahora = escena.hundido?.[donde.indice] ?? 0
  // Con `msDeCargaEn` y no con `SALTO.msDeCarga`: encima de una
  // cobija la misma barra cuesta más tiempo, y ese tiempo de más lo
  // paga la almohada hundiéndose. Es justo lo que la cobija hace.
  const alSoltar = Math.min(1, ahora + (msDeCargaEn(donde) * carga) / ALMOHADAS.msParaElFondo)
  return escena.y + (alSoltar - ahora) * ALMOHADAS.seHunde
}

/**
 * Dónde caería con esta carga, o null si ni siquiera sube lo
 * suficiente. Devuelve la x para poder elegir la carga que cae más
 * al centro y no la primera que entra por los pelos.
 */
function puntoDeCaida(escena, destino, carga, donde) {
  const v = SALTO.impulsoMinimo + (SALTO.impulsoMaximo - SALTO.impulsoMinimo) * carga
  const vx = Math.cos(grados(SALTO.angulo)) * v * escena.mirando
  const vy = -Math.sin(grados(SALTO.angulo)) * v
  const g = SALTO.gravedad
  const dy = destino.y - alturaDeSalida(escena, donde, carga)
  const salida = dondeSaldra(escena, donde, carga)

  // Que suba de sobra y no de milagro. Justo en el punto más alto
  // del salto la tortuga va parada en el aire, y el motor solo la
  // deja aterrizar mientras baja: apuntar al ápice es fallar.
  const alturaMaxima = (vy * vy) / (2 * g)
  if (alturaMaxima < -dy + 15) return null

  // y(t) = vy·t + g·t²/2 = dy, quedándose con la raíz de la bajada.
  const disc = vy * vy + 2 * g * dy
  if (disc < 0) return null
  const t = (-vy + Math.sqrt(disc)) / g
  return salida + vx * t
}

/**
 * La carga que cae más al centro del destino, o null si ninguna
 * entra. Antes se cogía la primera que entraba, y con el suelo
 * resbalando eso quería decir apuntar al borde de la plataforma con
 * una cuenta aproximada: fallaba y se quedaba dando vueltas.
 *
 * El margen de 12 px es porque la física va por pasos y el robot
 * calcula con fórmula: apuntar al borde justo es pedirle una
 * puntería que no le va a dar.
 */
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
  const { motor, frame, eventos, ver } = banco(nivel)

  let objetivo = 1
  let frames = 0
  let cargando = false
  let framesCargando = 0
  let cargaElegida = 0
  /**
   * Desde qué plataforma está cargando ahora mismo.
   *
   * Hace falta porque cuánto hay que apretar para una barra dada
   * depende de dónde está parada: en una cobija enredada la barra
   * sube más lento. Sin esto el robot soltaba a los
   * `SALTO.msDeCarga × carga` creyendo que tenía la barra que había
   * pedido, salía con el 60 % de ella, fallaba todos los saltos que
   * salen de una cobija y se quedaba dando vueltas sin caerse ni
   * llegar. El arnés mintiendo antes que el juego, van siete.
   */
  let saliendoDe = null

  /**
   * Cuántos frames pasó parado en cada plataforma. Cuando el robot no
   * llega, esto dice dónde se quedó dando vueltas, que es la única
   * pregunta que importa y la que antes costaba media hora contestar
   * a mano.
   */
  const paradoEn = new Map()

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
      const donde = nivel.plataformas.find((p) => estaEncima(e, p, p.indice, 8))
      if (!donde) continue
      paradoEn.set(donde.indice, (paradoEn.get(donde.indice) ?? 0) + 1)
      objetivo = donde.indice + 1
      if (objetivo >= nivel.plataformas.length) break

      const destino = nivel.plataformas[objetivo]

      const carga = mejorCarga(e, destino, donde)
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
  const cuenta = motor.cuenta()

  // La plataforma donde más tiempo estuvo parado. Si no llegó, es
  // casi siempre la que lo tiene atascado.
  const atasco = [...paradoEn.entries()].sort((a, b) => b[1] - a[1])[0]

  return {
    llego: eventos.includes('cima'),
    hitos: eventos.filter((x) => x === 'hito').length,
    ...cuenta,
    segundos: frames / 60,
    atasco: atasco ? { indice: atasco[0], frames: atasco[1] } : null,
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
  if (partida.atasco) {
    const p = nivel.plataformas[partida.atasco.indice]
    const siguiente = nivel.plataformas[partida.atasco.indice + 1]
    const que = [p.resbala && 'forrada', p.rebote && 'de peluches', p.hito && 'estrella']
      .filter(Boolean)
      .join(' y ')
    console.log(
      `     se quedó dando vueltas en la plataforma ${partida.atasco.indice + 1}${que ? ` (${que})` : ''}, ` +
        `x=${p.x} a ${p.x + p.ancho}, ${(partida.atasco.frames / 60).toFixed(0)} segundos`,
    )
    if (siguiente) {
      console.log(
        `     desde ahí hay que subir ${Math.round(p.y - siguiente.y)} px hasta x=${siguiente.x}-${siguiente.x + siguiente.ancho}`,
      )
    }
  }
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
  const { motor, frame, eventos } = banco(nivel)

  let hitosVistos = 0
  let cargando = false
  let framesCargando = 0
  let cargaElegida = 0
  let ultimoHito = null
  /** Desde qué plataforma carga, que decide cuánto tarda la barra. */
  let saliendoDe = null

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
      const donde = nivel.plataformas.find((p) => estaEncima(e, p, p.indice, 8))
      if (!donde) continue
      const objetivo = donde.indice + 1
      if (objetivo >= nivel.plataformas.length) break
      const destino = nivel.plataformas[objetivo]
      // La misma puntería del robot de la sección 3, no una copia más
      // tonta. Tenía la suya, con la cuenta de la balística escrita a
      // mano y sin lo que la cinta arrastra ni lo que la almohada se
      // hunde. Servía mientras los dos primeros hitos de Nico
      // estuvieran a nueve plataformas del suelo; en cuanto el
      // capítulo pasó a guardar tres veces y le entraron cobijas, este
      // se quedó dando vueltas y la prueba se declaró imposible de
      // correr. Por eso ahora la cuenta es una sola.
      const carga = mejorCarga(e, destino, donde)
      if (carga !== null) {
        cargaElegida = carga
        cargando = true
        framesCargando = 0
        saliendoDe = donde
        motor.presionar()
      }
    } else if (cargando) {
      framesCargando += 1
      // Con `msDeCargaEn`, por lo mismo que el robot de arriba: en una
      // cobija la barra tarda más, y soltando a destiempo este trepador
      // no llegaba nunca a pisar dos hitos en el capítulo de Nico. La
      // prueba decía «no se pudo probar» y lo que no se podía era esto.
      if (framesCargando * FRAME >= msDeCargaEn(saliendoDe) * cargaElegida) {
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
  const enElHito = Math.abs(caida.y - caida.hito.y) < 8 // los hitos van firmes siempre
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
    // Y sin balancín, aunque el capítulo que se esté probando lo
    // tenga: aquí se mide el desvanecimiento y nada más. Corriendo
    // esto con las cajas de Ovi cediendo, la tortuga se caía de la
    // plataforma antes de que el tramo terminara de borrarse y lo que
    // salía medido era un motor roto que no lo estaba.
    cede: false,
    plataformas: [
      { x: 30, ancho: 120, altura: 0, hito: true },
      { x: 210, ancho: 120, altura: 75 },
      { x: 30, ancho: 120, altura: 150 },
    ],
  })
}

/**
 * Salta desde donde esté con la carga que se le diga.
 *
 * `msDeCarga` es cuánto tarda la barra en llenarse **en el sitio desde
 * donde sale**: en una cobija enredada tarda más. Por omisión, lo
 * normal.
 */
function saltarCon(motor, frame, carga, msDeCarga = SALTO.msDeCarga) {
  motor.presionar()
  for (let i = 0; i < Math.round((msDeCarga * carga) / FRAME); i += 1) frame()
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
    // Y sin balancín, aunque el capítulo que se esté probando lo
    // tenga: aquí se mide el desvanecimiento y nada más. Corriendo
    // esto con las cajas de Ovi cediendo, la tortuga se caía de la
    // plataforma antes de que el tramo terminara de borrarse y lo que
    // salía medido era un motor roto que no lo estaba.
    cede: false,
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

/* ── 7. El parpadeo de la pista ────────────────────────────────
   Que el tramo se vaya en el tiempo que toca ya está probado. Lo que
   se prueba aquí es cómo se va: tiene que parpadear cada vez más
   rápido y apagarse del todo al final, no esfumarse de golpe desde
   media opacidad. Es de las cosas que pasan en un segundo y a ojo no
   se juzgan. */

console.log('  Cómo se va un tramo')

{
  const aviso = PISTA.msDeAviso / PISTA.msParaIrse
  const pasos = 400

  // Se recorre la vida del tramo de entera a cero y se anota cada vez
  // que cambia de encendido a apagado.
  const cambios = []
  let antes = null
  let ultimo = 1
  for (let i = 0; i <= pasos; i += 1) {
    const vida = 1 - i / pasos
    const alfa = opacidadDeLaPista(vida, aviso, false)
    const encendido = alfa > 0.5
    if (antes !== null && encendido !== antes) cambios.push(vida)
    antes = encendido
    ultimo = alfa
  }

  console.log(`   parpadea ${Math.floor(cambios.length / 2)} veces antes de irse`)

  // Los huecos entre cambios tienen que ir achicándose: eso es
  // «cada vez más rápido».
  const huecos = cambios.slice(1).map((v, i) => cambios[i] - v)
  const primeros = huecos.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  const ultimos = huecos.slice(-3).reduce((a, b) => a + b, 0) / 3
  console.log(
    huecos.length > 6 && ultimos < primeros * 0.6
      ? `   ✓ se acelera: los primeros parpadeos duran ${(primeros / ultimos).toFixed(1)} veces lo que los últimos`
      : '   ⚠ el parpadeo va parejo, no se acelera',
  )

  console.log(
    ultimo < 0.02
      ? '   ✓ termina apagado del todo, no se esfuma a media opacidad'
      : `   ⚠ desaparece de golpe desde ${ultimo.toFixed(2)} de opacidad`,
  )

  console.log(
    opacidadDeLaPista(aviso + 0.01, aviso, false) === 1
      ? '   ✓ antes del aviso está entero y no parpadea'
      : '   ⚠ parpadea antes de tiempo',
  )
}
console.log('')

/* ── 8. La luna, antes y durante ───────────────────────────────
   Dos cosas distintas y por eso van en dos bancos.

   La primera: la luna **no se presenta hasta que ella le da al
   botón**. Corriendo antes, su cinemática se gastaba entera detrás
   del cartel, que tapa la pantalla, y cuando por fin miraba ya se
   había ido.

   La segunda: ya van dos veces que la tortuga se queda congelada en
   la pose del golpe del aterrizaje, una por un atasco en la orilla y
   otra porque el paso de física se cortaba durante la despedida. La
   firma es siempre la misma, que el reloj de la pose deje de correr,
   y eso sí se puede medir.

   Ojo con el banco de la despedida: su tortuga sale veinte píxeles
   por encima de la cima y aterriza a los ocho frames, así que ahí no
   se puede medir nada de la espera. Se midió, y salió mal, y el roto
   era el banco. */

console.log('  La luna, antes y durante')

/** Un motor de verdad, con su reloj, sobre el nivel que se le dé. */
function bancoConCine(nivelDelBanco, esElFinal = false) {
  const eventos = []
  let ultima = null
  const motor = crearMotor({
    nivel: nivelDelBanco,
    conCinematica: true,
    esElFinal,
    pintar: (e) => {
      ultima = e
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
    return ultima
  }
  return { motor, frame, eventos }
}

/** Un mundo de dos tramos donde el de arriba es la cima. */
function mundoConCima() {
  const nivelCine = construirNivel({
    ...capitulo,
    seDesvanece: false,
    plataformas: [
      { x: 30, ancho: 140, altura: 0, hito: true },
      { x: 30, ancho: 300, altura: 90, hito: true },
    ],
  })
  const cima = nivelCine.plataformas[1]
  nivelCine.salida = { x: cima.x + cima.ancho / 2, y: cima.y - 20 }
  return nivelCine
}

{
  // (a) La espera y la entrada. Aquí la tortuga arranca abajo y sin
  // dedo no llega a ninguna parte, que es justo lo que hace falta
  // para poder mirar la luna sin que el capítulo se termine solo.
  const nivelEspera = construirNivel({
    ...capitulo,
    seDesvanece: false,
    plataformas: [
      { x: 30, ancho: 300, altura: 0 },
      { x: 30, ancho: 140, altura: 300, hito: true },
    ],
  })
  const { motor, frame } = bancoConCine(nivelEspera)

  let e = frame()
  const esperando = e.cine === 'espera'
  const caminadoAlEmpezar = e.caminado
  for (let i = 0; i < 90; i += 1) e = frame()
  const caminoEsperando = e.caminado - caminadoAlEmpezar
  const sigueEsperando = e.cine === 'espera'

  // Un toque tampoco la arranca: hasta el botón, el dedo no manda.
  motor.presionar()
  motor.soltar()
  const aguanto = frame().cine === 'espera'

  // Ahora sí.
  motor.empezar()
  e = frame()
  const arranco = e.cine === 'entrada'

  // Y en el primer suspiro no se la puede saltar: el mismo dedo que
  // le dio al botón no puede comerse lo que acaba de destapar.
  motor.presionar()
  const aguantoElToque = frame().cine === 'entrada'

  // Durante la entrada tiene que seguir caminando.
  const caminadoAlEntrar = e.caminado
  for (let i = 0; i < 60; i += 1) e = frame()
  const caminoEnLaEntrada = e.caminado - caminadoAlEntrar

  // Y la presentación tiene que terminarse sola y soltar el juego.
  const faltan = Math.ceil(LUNA.msDeEntrada / FRAME) + 30
  for (let i = 0; i < faltan && e.cine === 'entrada'; i += 1) e = frame()
  const solto = e.cine === 'jugando'

  motor.detener()

  console.log(
    esperando && sigueEsperando && aguanto
      ? '   ✓ antes del botón la luna no se presenta, y el dedo no la arranca'
      : '   ⚠ la luna se presenta sola, detrás del cartel que la tapa',
  )
  console.log(
    caminoEsperando > 0.5
      ? '   ✓ mientras espera, la tortuga ya camina detrás del cartel'
      : '   ⚠ detrás del cartel no se mueve nada',
  )
  console.log(
    arranco && aguantoElToque
      ? '   ✓ al darle al botón arranca, y no se la salta en el primer suspiro'
      : arranco
        ? '   ⚠ un toque en el primer suspiro se come la presentación'
        : '   ⚠ el botón no arranca la presentación',
  )
  console.log(
    caminoEnLaEntrada > 0.5
      ? '   ✓ mientras la luna se presenta, sigue caminando'
      : '   ⚠ se queda congelada durante la presentación',
  )
  console.log(
    solto
      ? '   ✓ la presentación se termina sola y suelta el juego'
      : '   ⚠ la presentación no termina nunca',
  )
}

{
  // (b) La despedida. Este banco deja caer a la tortuga sobre la cima
  // a los ocho frames, así que se empieza de una y lo único que se
  // mira es lo que pasa de la cima en adelante.
  const { motor, frame, eventos } = bancoConCine(mundoConCima())
  motor.empezar()

  let e = frame()
  for (let i = 0; i < 600 && !eventos.includes('cima'); i += 1) e = frame()
  const llego = eventos.includes('cima')

  // Durante la despedida, el reloj de la pose tiene que seguir.
  const aterrizajeAlLlegar = e.desdeAterrizaje
  for (let i = 0; i < 90; i += 1) e = frame()
  const corrio = e.desdeAterrizaje - aterrizajeAlLlegar

  // Y la despedida tiene que terminar sola y avisar, que es cuando
  // sale el cartel del final.
  const faltan = Math.ceil(LUNA.msDeSalida / FRAME) + 30
  for (let i = 0; i < faltan && !eventos.includes('fin'); i += 1) e = frame()
  motor.detener()

  console.log(
    llego && corrio > 1000
      ? '   ✓ mientras la luna se va, el reloj de la pose sigue corriendo'
      : llego
        ? `   ⚠ congelada en la despedida: el reloj solo avanzó ${Math.round(corrio)} ms`
        : '   ⚠ no llegó a la cima, la prueba no dice nada',
  )
  console.log(
    eventos.includes('fin')
      ? '   ✓ la despedida termina y avisa, que es cuando sale el cartel'
      : '   ⚠ la despedida no termina nunca',
  )
}

{
  // (c) La llegada, que es la otra manera de cerrar y pasa una sola
  // vez: al ganar el último capítulo escrito. Aquí la luna no se
  // escapa — ella sube y se para encima.
  //
  // Esto no se puede mirar jugando sin ganar los tres capítulos, y
  // dura nueve segundos que no se pueden parar. Lo que se mide acá es
  // lo que el banco de dibujo no puede ver: que el motor la dispare
  // en vez de la despedida, que suba de verdad, que termine posada
  // encima de la luna y no en el aire, y que avise una sola vez.
  const nivelFinal = mundoConCima()
  const { motor, frame, eventos } = bancoConCine(nivelFinal, true)
  motor.empezar()

  let e = frame()
  for (let i = 0; i < 600 && !eventos.includes('cima'); i += 1) e = frame()
  const llegoALaCima = eventos.includes('cima')
  const empezoLaLlegada = e.cine === 'llegada'
  const alturaDeLaCima = e.y

  // Tiene que subir, y bastante: si se queda donde estaba, la luna se
  // le escapó igual que en los otros capítulos.
  const faltan = Math.ceil(LLEGADA.ms / FRAME) + 60
  let masAlta = e.y
  for (let i = 0; i < faltan && !eventos.includes('fin'); i += 1) {
    e = frame()
    masAlta = Math.min(masAlta, e.y)
  }
  const subio = alturaDeLaCima - masAlta

  const avisoUnaVez = eventos.filter((v) => v === 'fin').length === 1

  // Y se queda ahí: cien frames después sigue sentada en el mismo
  // sitio, porque la carta se abre encima de este cuadro.
  const alAvisar = { x: e.x, y: e.y, cine: e.cine }
  for (let i = 0; i < 100; i += 1) e = frame()
  const seQuedo =
    Math.abs(e.y - alAvisar.y) < 0.5 && Math.abs(e.x - alAvisar.x) < 0.5 && e.cine === 'llegada'

  // Posada encima de la luna, no flotando al lado ni metida adentro.
  const l = laLlegada(1, nivelFinal)
  const enElBorde = Math.abs(e.y - (l.luna.y - l.luna.r + LLEGADA.seHunde)) < 0.5
  const enElMedio = Math.abs(e.x - l.luna.x) < 0.5

  motor.detener()

  console.log(
    llegoALaCima && empezoLaLlegada
      ? '   ✓ en el último capítulo la luna no se escapa: arranca la llegada'
      : llegoALaCima
        ? `   ⚠ al pisar la cima arrancó "${alAvisar.cine}" en vez de la llegada`
        : '   ⚠ no llegó a la cima, la prueba no dice nada',
  )
  console.log(
    subio > 1200
      ? `   ✓ sube de verdad: ${Math.round(subio)} px por encima de la cima`
      : `   ⚠ solo subió ${Math.round(subio)} px, que no es un viaje`,
  )
  console.log(
    enElBorde && enElMedio
      ? '   ✓ termina posada encima de la luna y en el medio, no flotando al lado'
      : `   ⚠ termina en (${e.x.toFixed(1)}, ${e.y.toFixed(1)}) y la luna está en (${l.luna.x.toFixed(1)}, ${(l.luna.y - l.luna.r).toFixed(1)})`,
  )
  console.log(
    avisoUnaVez && seQuedo
      ? '   ✓ avisa una sola vez y se queda quieta: la carta se abre encima'
      : avisoUnaVez
        ? '   ⚠ después de avisar se mueve, y la carta se abre encima de eso'
        : `   ⚠ avisó ${eventos.filter((v) => v === 'fin').length} veces`,
  )
}
console.log('')

/* ── 9. Las cajas que ceden ────────────────────────────────────
   La traba del capítulo de Ovi. A ojo se ve que la caja se mueve,
   pero que se mueva no es lo que importa: lo que importa es que **el
   salto salga distinto** según desde dónde se dé. Eso son unos pocos
   píxeles de altura de salida y a ojo no se juzga, así que se mide.

   Ojo con una cosa, que ya me costó una medición mentirosa: la
   tortuga camina sola y no se para nunca, así que «esperá tantos
   frames y ya estará en la orilla» no es verdad. Aquí se espera a
   que **esté** donde tiene que estar, mirándole la x frame a frame. */

console.log('  Las cajas que ceden')

/** Una caja sola y ancha, para dejarla caminar encima y medirla. */
function mundoDeCajas({ conEstrella = false } = {}) {
  const nivelCajas = construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: true,
    // Estas pruebas son del cuarto de Ovi. Aunque se corran con el
    // capítulo de Nico puesto, aquí no se hunde nada: si no, lo que
    // quedaría medido sería la almohada y no la caja.
    seHunde: false,
    plataformas: [
      { x: 30, ancho: 140, altura: 0, hito: true },
      { x: 30, ancho: 120, altura: 80, hito: conEstrella },
    ],
  })
  const caja = nivelCajas.plataformas[1]
  nivelCajas.salida = { x: caja.x + caja.ancho / 2, y: caja.y }
  return nivelCajas
}

/**
 * Deja correr el juego hasta que la tortuga esté donde se le pide, y
 * devuelve ese frame. Sin esto, cualquier medición sobre una caja es
 * una medición de dónde quedó la tortuga por casualidad.
 */
function esperarA(frame, quieroQue, tope = 900) {
  let e = frame()
  for (let i = 0; i < tope; i += 1) {
    e = frame()
    if (quieroQue(e)) return e
  }
  return null
}

{
  // (a) Cuánto se hunde en el medio y cuánto en la orilla. Se mira un
  // ciclo entero de ida y vuelta y se guarda lo mejor y lo peor: eso
  // no depende de acertarle a ningún instante.
  const nivelCajas = mundoDeCajas()
  const caja = nivelCajas.plataformas[1]
  const { motor, frame } = banco(nivelCajas)

  const ciclo = Math.ceil(((2 * (caja.ancho - TORTUGA.ancho)) / TORTUGA.velocidad) * 60) + 120
  let menos = Infinity
  let mas = -Infinity
  let masInclinada = 0
  for (let i = 0; i < ciclo; i += 1) {
    const e = frame()
    if (!e.enSuelo) continue
    menos = Math.min(menos, e.y - caja.y)
    mas = Math.max(mas, e.y - caja.y)
    masInclinada = Math.max(masInclinada, Math.abs(e.inclinacion[1]))
  }
  motor.detener()

  console.log(
    `   pasando por el medio se hunde ${menos.toFixed(1)} px; en la orilla, ${mas.toFixed(1)}`,
  )
  console.log(
    menos < 0.6 && mas > 4
      ? `   ✓ la caja cede de verdad: hasta ${mas.toFixed(1)} px menos de altura de salida, con la caja a ${masInclinada.toFixed(2)} de inclinación`
      : '   ⚠ la caja se mueve en el dibujo pero al salto no le llega nada',
  )
}

{
  // (b) Y eso tiene que verse en lo que llega el salto: misma barra
  // llena, desde el medio y desde la orilla.
  const alturaTras = (desdeLaOrilla) => {
    const nivelCajas = mundoDeCajas()
    const caja = nivelCajas.plataformas[1]
    const medio = caja.x + caja.ancho / 2
    const orilla = caja.x + caja.ancho - TORTUGA.ancho / 2
    const { motor, frame, ver } = banco(nivelCajas)

    // Se espera a que esté donde toca **y** a que la caja haya
    // terminado de irse para ese lado, que es lo que se está midiendo.
    const llego = desdeLaOrilla
      ? esperarA(frame, (e) => e.x > orilla - 1 && Math.abs(e.inclinacion[1]) > 0.6)
      : esperarA(frame, (e) => Math.abs(e.x - medio) < 1.2)
    if (!llego) {
      motor.detener()
      return null
    }

    const y0 = ver().y
    saltarCon(motor, frame, 1)
    let masAlto = y0
    for (let i = 0; i < 120; i += 1) masAlto = Math.min(masAlto, frame().y)
    motor.detener()

    // Contado desde la línea de la caja, que es lo que decide si
    // alcanza la plataforma de arriba o se queda corta.
    return caja.y - masAlto
  }

  const delMedio = alturaTras(false)
  const deLaOrilla = alturaTras(true)

  if (delMedio === null || deLaOrilla === null) {
    console.log('   ⚠ no se pudo medir el salto (la tortuga no llegó a donde se le pidió)')
  } else {
    const perdido = delMedio - deLaOrilla
    console.log(
      `   a barra llena sube ${delMedio.toFixed(0)} px desde el medio y ${deLaOrilla.toFixed(0)} desde la orilla`,
    )
    console.log(
      perdido > 3
        ? `   ✓ saltar desde la orilla cuesta ${perdido.toFixed(0)} px de altura, que es la traba del capítulo`
        : `   ⚠ desde la orilla se pierden ${perdido.toFixed(1)} px: la traba no se siente`,
    )
  }
}

{
  // (c) La estrella no cede nunca, aunque el capítulo ceda. Es el
  // sitio donde se respira: si se moviera, no habría dónde parar.
  const nivelEstrella = mundoDeCajas({ conEstrella: true })
  const estrella = nivelEstrella.plataformas[1]
  const { motor, frame } = banco(nivelEstrella)

  const orilla = estrella.x + estrella.ancho - TORTUGA.ancho / 2
  const e = esperarA(frame, (x) => x.x > orilla - 1)
  motor.detener()

  console.log(
    estrella.cede === false && e && Math.abs(e.y - estrella.y) < 0.5
      ? '   ✓ la caja de la estrella no cede ni parada en la orilla'
      : `   ⚠ la estrella cede (${e ? (e.y - estrella.y).toFixed(1) : '?'} px)`,
  )
}

{
  // (d) Al irse ella, la caja vuelve sola a quedar derecha.
  const nivelCajas = mundoDeCajas()
  const caja = nivelCajas.plataformas[1]
  const { motor, frame } = banco(nivelCajas)

  const torcida = esperarA(frame, (e) => Math.abs(e.inclinacion[1]) > 0.6)
  saltarCon(motor, frame, 1)

  const enderezando = Math.ceil(CAJAS.msParaEnderezar / FRAME) + 20
  let e = frame()
  let derecha = false
  for (let i = 0; i < enderezando; i += 1) {
    e = frame()
    if (Math.abs(e.inclinacion[1]) < 0.02) derecha = true
  }
  motor.detener()

  console.log(
    torcida && derecha
      ? '   ✓ en cuanto se va, la caja vuelve sola a quedar derecha'
      : `   ⚠ la caja se queda torcida (le quedó ${e.inclinacion[1].toFixed(2)})`,
  )
}

{
  // (e) Y al caerse y volver al hito, ninguna caja se queda torcida:
  // reaparecer con una trampa puesta que ella no vio ponerse sería
  // castigarla dos veces por la misma caída.
  const nivelCaida = construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: true,
    // Estas pruebas son del cuarto de Ovi. Aunque se corran con el
    // capítulo de Nico puesto, aquí no se hunde nada: si no, lo que
    // quedaría medido sería la almohada y no la caja.
    seHunde: false,
    plataformas: [
      { x: 30, ancho: 140, altura: 0, hito: true },
      { x: 30, ancho: 120, altura: 80 },
    ],
  })
  const caja = nivelCaida.plataformas[1]
  nivelCaida.salida = { x: caja.x + caja.ancho / 2, y: caja.y }

  const { motor, frame, eventos } = banco(nivelCaida)

  // Primero torcerla, y de ahí tirarse al vacío con saltitos flojos.
  esperarA(frame, (e) => Math.abs(e.inclinacion[1]) > 0.6)

  let e = null
  for (let i = 0; i < 900 && !eventos.includes('reaparicion'); i += 1) {
    e = frame()
    if (e.enSuelo && !e.cargando && !e.cayendo) saltarCon(motor, frame, 0)
  }
  motor.detener()

  const volvio = eventos.includes('reaparicion')
  const derechas = volvio && e.inclinacion.every((i) => Math.abs(i) < 0.02)
  console.log(
    derechas
      ? '   ✓ al volver de una caída, las cajas están otra vez derechas'
      : volvio
        ? `   ⚠ volvió con una caja torcida (${e.inclinacion.map((i) => i.toFixed(2)).join(', ')})`
        : '   ⚠ no llegó a caerse, la prueba no dice nada',
  )
}
console.log('')

/* ── 9b. La caja forrada de cinta ──────────────────────────────
   Lo que complica el capítulo de Ovi. Caminando por encima no pasa
   nada; parada cargando la barra, se va resbalando hacia el lado que
   la caja está bajando, hasta la punta. Y **se para en la punta**: la
   primera versión la dejaba salirse y caerse, y con la carga que hace
   falta para un salto normal ya se caía sola. Eso son las dos cosas
   que se miden aquí, porque las dos pasan en un segundo. */

console.log('  La caja forrada de cinta')

/** Una caja sola, forrada o no, para cargar encima y ver qué pasa. */
function mundoDeCinta(conCinta) {
  const nivelCinta = construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: true,
    // Estas pruebas son del cuarto de Ovi. Aunque se corran con el
    // capítulo de Nico puesto, aquí no se hunde nada: si no, lo que
    // quedaría medido sería la almohada y no la caja.
    seHunde: false,
    plataformas: [
      { x: 30, ancho: 140, altura: 0, hito: true },
      { x: 30, ancho: 120, altura: 80, resbala: conCinta },
    ],
  })
  const caja = nivelCinta.plataformas[1]
  nivelCinta.salida = { x: caja.x + caja.ancho / 2, y: caja.y }
  return nivelCinta
}

{
  /** Cuánto se corre mientras carga, desde donde se le diga. */
  const loQueSeCorre = (conCinta) => {
    const nivelCinta = mundoDeCinta(conCinta)
    const caja = nivelCinta.plataformas[1]
    const medio = caja.x + caja.ancho / 2
    const { motor, frame, ver } = banco(nivelCinta)

    // Se espera a que esté a media cuesta y mirando hacia adentro, que
    // es el sitio de verdad donde una se para a cargar.
    const llego = esperarA(frame, (e) => e.x > medio + 18 && e.x < medio + 26)
    if (!llego) {
      motor.detener()
      return null
    }

    const antes = ver().x
    motor.presionar()
    // Una carga entera, que son 900 ms.
    for (let i = 0; i < Math.ceil(SALTO.msDeCarga / FRAME); i += 1) frame()
    const despues = ver()
    motor.detener()
    return { corrida: despues.x - antes, x: despues.x, enSuelo: despues.enSuelo, caja }
  }

  const conCinta = loQueSeCorre(true)
  const sinCinta = loQueSeCorre(false)

  if (!conCinta || !sinCinta) {
    console.log('   ⚠ no se pudo medir (la tortuga no llegó a media cuesta)')
  } else {
    console.log(
      `   cargando una barra entera se corre ${conCinta.corrida.toFixed(1)} px en la forrada y ${sinCinta.corrida.toFixed(1)} en una normal`,
    )
    // El margen de dos píxeles en la caja normal es el pasito que la
    // escena trae interpolado del frame en que se para a cargar, no un
    // deslizamiento.
    console.log(
      conCinta.corrida > 12 && Math.abs(sinCinta.corrida) < 2
        ? '   ✓ la cinta la corre mientras carga, y solo la cinta'
        : '   ⚠ o la cinta no corre, o corren también las cajas normales',
    )

    const orilla = conCinta.caja.x + conCinta.caja.ancho - TORTUGA.ancho / 2
    console.log(
      conCinta.enSuelo && conCinta.x <= orilla + 0.5
        ? '   ✓ se para en la punta y no se cae: la cinta descoloca, no mata'
        : `   ⚠ se salió de la caja cargando (x=${conCinta.x.toFixed(1)}, la punta está en ${orilla.toFixed(1)})`,
    )
  }
}
console.log('')

/* ── 9c. La caja de peluches ───────────────────────────────────
   Lo que le da sazón. Caer ahí no la para, la devuelve. Tres cosas
   que tienen que cumplirse y que jugando no se pueden juzgar: que
   devuelva de verdad, que se apague sola en unos pocos rebotes en vez
   de quedarse botando para siempre, y que **no la saque de la caja**.
   Lo último costó dos vueltas: con el rebote conservando el avance de
   lado, cada bote la corría un poco más y al tercero se salía y se
   caía, que es lo contrario de lo que una red tiene que hacer. */

console.log('  La caja de peluches')

/**
 * Una caja de peluches para medirla, con el mundo entero de ancho.
 *
 * Anchísima a propósito: con una del ancho de las del capítulo, el
 * salto de prueba se salía por un lado y la tortuga se caía sin haber
 * llegado a rebotar, y lo que salía medido era cero rebotes. Aquí no
 * hay por dónde salirse, así que lo que se mide es el rebote y nada
 * más. Que no la saque de una caja de las de verdad se mide aparte.
 */
function mundoDePeluches(ancho = 340) {
  const suyo = construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: true,
    // Estas pruebas son del cuarto de Ovi. Aunque se corran con el
    // capítulo de Nico puesto, aquí no se hunde nada: si no, lo que
    // quedaría medido sería la almohada y no la caja.
    seHunde: false,
    plataformas: [
      { x: 30, ancho: 140, altura: 0, hito: true },
      { x: (MUNDO.ancho - ancho) / 2, ancho, altura: 90, rebote: true },
    ],
  })
  const caja = suyo.plataformas[1]
  // Y la salida en la punta de la izquierda: la tortuga arranca
  // mirando a la derecha, así que desde ahí cualquier salto cae
  // dentro en vez de irse por el borde.
  suyo.salida = { x: caja.x + 25, y: caja.y }
  return suyo
}

{
  const nivelPeluches = mundoDePeluches()
  const caja = nivelPeluches.plataformas[1]

  /** Le hace tocar la caja, de un roce o cayendo de un salto entero. */
  const tocarLaCaja = (fuerte) => {
    const { motor, frame, eventos } = banco(nivelPeluches)

    let masAlto = caja.y
    let e = frame()
    saltarCon(motor, frame, fuerte ? 1 : 0)

    for (let i = 0; i < 600; i += 1) {
      e = frame()
      if (eventos.includes('caida')) break
      // Cuando ya rebotó al menos una vez y vuelve a estar quieta en
      // el suelo, se acabó la racha.
      if (i > 20 && e.enSuelo && !e.cargando && eventos.includes('rebote')) break
      if (eventos.includes('rebote')) masAlto = Math.min(masAlto, e.y)
    }
    motor.detener()
    return {
      rebotes: eventos.filter((x) => x === 'rebote').length,
      cayo: eventos.includes('caida'),
      subio: caja.y - masAlto,
      enSuelo: e.enSuelo,
    }
  }

  const flojo = tocarLaCaja(false)
  const fuerte = tocarLaCaja(true)

  console.log(
    `   de un roce rebota ${flojo.rebotes} veces y sube ${flojo.subio.toFixed(0)} px; cayendo de un salto entero, ${fuerte.rebotes} veces y ${fuerte.subio.toFixed(0)} px`,
  )
  console.log(
    flojo.rebotes > 0 && flojo.subio > 35
      ? '   ✓ hasta un roce la devuelve para arriba: el piso del rebote hace su trabajo'
      : '   ⚠ cayendo flojo no devuelve nada, y en el camino normal se llega flojo',
  )
  console.log(
    fuerte.subio > flojo.subio + 15
      ? '   ✓ y cayendo de alto devuelve más: el rebote sale de lo que traías'
      : '   ⚠ devuelve lo mismo caiga como caiga, que es un tramo de impulso con otro traje',
  )
  console.log(
    flojo.rebotes < 9 && fuerte.rebotes < 9 && flojo.enSuelo && fuerte.enSuelo
      ? '   ✓ se apaga sola en unos pocos botes y la deja parada encima'
      : '   ⚠ no se apaga: se queda botando',
  )
}

{
  // Y ahora sobre las cajas del capítulo de verdad, entrando desde la
  // plataforma de antes como se entra jugando: de todas las veces que
  // la toca, ¿en cuántas acaba cayéndose?
  //
  // Es la pregunta que importa y la que costó dos vueltas: con el
  // rebote conservando el avance de lado, cada bote la corría un poco
  // más hacia el mismo lado y al tercero se salía. Una red que te tira
  // es peor que no tener red.
  const cajas = nivel.plataformas.filter((p) => p.rebote && p.indice > 0)

  if (cajas.length === 0) {
    console.log('   · este capítulo no tiene cajas de peluches')
  } else {
    let toques = 0
    let tiradas = 0

    for (const caja of cajas) {
      const desde = nivel.plataformas[caja.indice - 1]
      const nivelTramo = nivelDeDos(desde, caja)

      const recorrido = Math.max(1, desde.ancho - TORTUGA.ancho)
      const framesDelCiclo = Math.ceil(((2 * recorrido) / TORTUGA.velocidad) * 60)
      const paso = Math.max(4, Math.round(framesDelCiclo / 24))

      for (let espera = 0; espera < framesDelCiclo; espera += paso) {
        for (let c = 0; c <= 10; c += 1) {
          const { motor, frame, eventos } = banco(nivelTramo)
          for (let i = 0; i < espera; i += 1) frame()
          saltarCon(motor, frame, c / 10)

          for (let i = 0; i < 400; i += 1) {
            const e = frame()
            if (eventos.includes('caida')) break
            if (i > 20 && e.enSuelo && eventos.includes('rebote')) break
          }
          motor.detener()

          if (!eventos.includes('rebote')) continue
          toques += 1
          if (eventos.includes('caida')) tiradas += 1
        }
      }
    }

    const porcentaje = toques ? (tiradas / toques) * 100 : 0
    console.log(
      `   de ${toques} entradas que llegan a tocar una caja de peluches, ${tiradas} acaban en caída`,
    )
    console.log(
      porcentaje < 5
        ? '   ✓ la caja recoge: casi ninguna entrada acaba en el vacío'
        : `   ⚠ el ${porcentaje.toFixed(0)}% de las veces la caja la termina tirando`,
    )
  }
}
console.log('')

/* ── 9d. Las almohadas que se hunden ───────────────────────────
   La traba del capítulo de Nico, y la única de las tres que ataca
   la mecánica central: la barra. A ojo se ve que la almohada baja,
   pero eso no es lo que importa. Lo que importa es que **esperar
   cueste altura de verdad**, que el precio se pueda pagar (no que
   te deje encerrada) y que la estrella siga siendo el sitio donde
   se respira. Las tres cosas pasan despacio y en pantalla no se
   juzgan: se miden. */

console.log('  Las almohadas que se hunden')

/** Una almohada sola y ancha, para pararse encima y mirarla bajar. */
function mundoDeAlmohadas({ conEstrella = false } = {}) {
  const suyo = construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: false,
    seHunde: true,
    plataformas: [
      { x: 30, ancho: 140, altura: 0, hito: true },
      { x: 30, ancho: 150, altura: 80, hito: conEstrella },
    ],
  })
  const almohada = suyo.plataformas[1]
  suyo.salida = { x: almohada.x + almohada.ancho / 2, y: almohada.y }
  return suyo
}

{
  // (a) Cuánto baja y en cuánto tiempo. Se mira la altura de la
  // tortuga contra la línea de la almohada, que es lo que el salto
  // siguiente va a pagar.
  const suyo = mundoDeAlmohadas()
  const almohada = suyo.plataformas[1]
  const { motor, frame } = banco(suyo)

  const alSegundo = []
  for (let s = 1; s <= 5; s += 1) {
    for (let i = 0; i < 60; i += 1) frame()
    alSegundo.push(frame().y - almohada.y)
  }
  motor.detener()

  console.log(
    `   parada encima baja ${alSegundo.map((y) => y.toFixed(0)).join(' → ')} px al pasar los segundos`,
  )
  const fondo = alSegundo[alSegundo.length - 1]
  console.log(
    alSegundo[0] < ALMOHADAS.seHunde * 0.4 && fondo > ALMOHADAS.seHunde - 1.5
      ? `   ✓ se hunde despacio y para en el fondo, a ${fondo.toFixed(0)} px de la línea`
      : `   ⚠ o se hunde de golpe (${alSegundo[0].toFixed(0)} px al primer segundo) o no llega al fondo (${fondo.toFixed(0)} de ${ALMOHADAS.seHunde})`,
  )
}

{
  // (b) Y eso tiene que verse en el salto: la misma barra llena,
  // saliendo en seguida y saliendo tarde. Es la traba entera.
  const alturaTras = (esperarSegundos) => {
    const suyo = mundoDeAlmohadas()
    const almohada = suyo.plataformas[1]
    const { motor, frame, ver } = banco(suyo)

    for (let i = 0; i < Math.round(esperarSegundos * 60); i += 1) frame()

    saltarCon(motor, frame, 1)
    let masAlto = ver().y
    for (let i = 0; i < 120; i += 1) masAlto = Math.min(masAlto, frame().y)
    motor.detener()

    // Contado desde la línea de la almohada entera, que es lo que
    // decide si alcanza la plataforma de arriba o se queda corta.
    return almohada.y - masAlto
  }

  const enSeguida = alturaTras(0)
  const tarde = alturaTras(5)
  const perdido = enSeguida - tarde

  console.log(
    `   a barra llena sube ${enSeguida.toFixed(0)} px saliendo en seguida y ${tarde.toFixed(0)} px tras cinco segundos encima`,
  )
  console.log(
    perdido > 20
      ? `   ✓ demorarse cuesta ${perdido.toFixed(0)} px de altura, que es la traba del capítulo`
      : `   ⚠ demorarse cuesta ${perdido.toFixed(1)} px: la traba no se siente`,
  )

  // Y lo que cuesta la barra por su cuenta, que es la otra mitad de
  // la decisión: cargar entero paga 900 ms de hundimiento.
  const conBarra = (carga) => {
    const suyo = mundoDeAlmohadas()
    const almohada = suyo.plataformas[1]
    const { motor, frame, ver } = banco(suyo)
    frame()
    saltarCon(motor, frame, carga)
    let masAlto = ver().y
    for (let i = 0; i < 120; i += 1) masAlto = Math.min(masAlto, frame().y)
    motor.detener()
    return almohada.y - masAlto
  }
  console.log(
    `   la barra sola: media sube ${conBarra(0.5).toFixed(0)} px y llena ${conBarra(1).toFixed(0)}, ya descontado lo que se hunde cargando`,
  )
}

{
  // (c) Que el precio se pueda pagar. Una almohada en el fondo no
  // puede dejarla encerrada: si desde ahí ya no se llega a ninguna
  // parte, no es una traba, es una trampa con espera. Se mide sobre
  // los tramos del capítulo de verdad: cuántos se siguen pasando
  // desde la almohada del todo hundida.
  const desdeElFondo = []
  for (let i = 0; i < nivel.plataformas.length - 1; i += 1) {
    const desde = nivel.plataformas[i]
    const hasta = nivel.plataformas[i + 1]
    if (!desde.hunde || desde.impulso) continue

    const nivelTramo = nivelDeDos(desde, hasta)
    let logrado = false

    // Cinco segundos encima antes de empezar a probar: en el fondo.
    const recorrido = Math.max(1, desde.ancho - TORTUGA.ancho)
    const framesDelCiclo = Math.ceil(((2 * recorrido) / TORTUGA.velocidad) * 60)
    const paso = Math.max(4, Math.round(framesDelCiclo / 20))

    for (let espera = 300; espera < 300 + framesDelCiclo && !logrado; espera += paso) {
      for (let c = 0; c <= 10 && !logrado; c += 1) {
        const { motor, frame, eventos } = banco(nivelTramo)
        for (let f = 0; f < espera; f += 1) frame()
        saltarCon(motor, frame, c / 10, msDeCargaEn(desde))
        for (let f = 0; f < 240; f += 1) {
          const e = frame()
          if (e.cayendo) break
          if (hasta.rebote && eventos.includes('rebote')) {
            logrado = true
            break
          }
          if (f > 3 && e.enSuelo) {
            frame()
            if (estaEncima(frame(), hasta, 1)) logrado = true
            break
          }
        }
        motor.detener()
      }
    }

    desdeElFondo.push({ indice: i, logrado, aPrisa: hasta.aPrisa === true })
  }

  if (desdeElFondo.length === 0) {
    console.log('   · este capítulo no tiene almohadas')
  } else {
    const encerrada = desdeElFondo.filter((t) => !t.logrado && !t.aPrisa)
    const cerrados = desdeElFondo.filter((t) => !t.logrado && t.aPrisa)
    console.log(
      `   de ${desdeElFondo.length} tramos que salen de una almohada, ${desdeElFondo.length - encerrada.length - cerrados.length} se siguen pasando desde el fondo`,
    )
    console.log(
      encerrada.length === 0
        ? `   ✓ ninguno la deja encerrada: los ${cerrados.length} que se cierran son los marcados «a prisa»`
        : `   ⚠ ${encerrada.length} tramo(s) sin marcar se vuelven imposibles desde el fondo: ${encerrada.map((t) => `${t.indice + 1}→${t.indice + 2}`).join(', ')}`,
    )
  }
}

{
  // (d) La estrella no se hunde nunca, aunque el capítulo se hunda.
  // Es lo mismo que la caja de la estrella en el cuarto de Ovi, y por
  // lo mismo: tiene que haber un sitio donde el suelo se quede quieto
  // mientras una piensa.
  const suyo = mundoDeAlmohadas({ conEstrella: true })
  const estrella = suyo.plataformas[1]
  const { motor, frame } = banco(suyo)

  let e = null
  for (let i = 0; i < 300; i += 1) e = frame()
  motor.detener()

  console.log(
    estrella.hunde === false && e && Math.abs(e.y - estrella.y) < 0.5
      ? '   ✓ la estrella no se hunde ni tras cinco segundos parada encima'
      : `   ⚠ la estrella se hunde (${e ? (e.y - estrella.y).toFixed(1) : '?'} px)`,
  )
}

{
  // (e) Al irse, la almohada vuelve a inflarse sola; y al caerse y
  // volver al hito, están todas enteras. Reaparecer sobre una hundida
  // de antes de la caída es empezar con la altura ya gastada.
  //
  // La almohada va **al lado** del hito y no encima, y eso no es un
  // detalle: la primera versión de esta prueba la ponía encima, así
  // que el salto de irse volvía a caer en la misma almohada y la
  // hundía de nuevo antes de que nadie mirara. Decía que el motor no
  // la inflaba y el motor la inflaba perfectamente. El arnés mintiendo
  // antes que el juego, van cinco.
  //
  // Y van seis: **hacia arriba y no hacia el lado**. Saltar a una
  // plataforma de al lado, aunque estuviera a la misma altura,
  // contaba como caerse: la caída se mide contra el sitio donde
  // reapareció, que era la almohada sin hundir, y para entonces
  // estaba 34 px más abajo. Que es justamente el aviso de la prueba
  // (f), aquí abajo, en el nivel de verdad.
  const nivelVecina = construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: false,
    seHunde: true,
    plataformas: [
      { x: 30, ancho: 100, altura: 0 },
      { x: 180, ancho: 150, altura: 0 },
      // Un techo de pared a pared: lo único que se le pide es que sea
      // imposible fallarlo, para que lo que quede medido sea la
      // almohada quedándose sola y no la puntería.
      { x: 0, ancho: 360, altura: 90, hito: true },
    ],
  })
  const almohada = nivelVecina.plataformas[1]
  nivelVecina.salida = { x: almohada.x + almohada.ancho / 2, y: almohada.y }

  const { motor, frame, ver } = banco(nivelVecina)

  const hundida = esperarA(frame, (e) => (e.hundido?.[1] ?? 0) > 0.9, 400)
  saltarCon(motor, frame, 1)
  esperarA(frame, (e) => e.enSuelo && e.y < almohada.y - 40, 300)

  let inflada = false
  for (let i = 0; i < Math.ceil(ALMOHADAS.msParaInflarse / FRAME) + 120; i += 1) {
    const e = frame()
    if ((e.hundido?.[1] ?? 0) < 0.02) inflada = true
  }
  motor.detener()

  console.log(
    hundida && inflada
      ? '   ✓ en cuanto se va, la almohada vuelve a inflarse sola'
      : `   ⚠ la almohada se queda hundida (le quedó ${(ver()?.hundido?.[1] ?? 0).toFixed(2)})`,
  )

  // Y ahora la caída, con saltitos flojos desde la almohada de arriba.
  const nivelCaida = mundoDeAlmohadas()
  const caida = banco(nivelCaida)
  esperarA(caida.frame, (x) => (x.hundido?.[1] ?? 0) > 0.5, 400)

  let ultima = null
  for (let i = 0; i < 900 && !caida.eventos.includes('reaparicion'); i += 1) {
    ultima = caida.frame()
    if (ultima.enSuelo && !ultima.cargando && !ultima.cayendo) {
      saltarCon(caida.motor, caida.frame, 0)
    }
  }
  caida.motor.detener()

  const volvio = caida.eventos.includes('reaparicion')
  const enteras = volvio && ultima.hundido.every((h) => h < 0.02)
  console.log(
    enteras
      ? '   ✓ al volver de una caída, las almohadas están otra vez enteras'
      : volvio
        ? `   ⚠ volvió con una almohada hundida (${ultima.hundido.map((h) => h.toFixed(2)).join(', ')})`
        : '   ⚠ no llegó a caerse, la prueba no dice nada',
  )
}

{
  // (f) Y la regla que salió de escribir la prueba de arriba, que es
  // de las que no se ven jugando hasta el día que pasan.
  //
  // Caerse es bajar del último hito más de `margenBajoElLazo`. Una
  // almohada hundida baja 34 px sola, sin que nadie se equivoque en
  // nada. Así que una almohada que esté a menos de 34 + 24 de su
  // estrella deja a la tortuga por debajo del umbral **estando
  // parada encima**, y el primer salto que dé desde ahí se cuenta
  // como caída aunque llegue perfecto a la plataforma de arriba.
  //
  // No es un caso raro de laboratorio: pasó a la primera, escribiendo
  // el mundo de dos plataformas de la prueba de al lado.
  const seguro = ALMOHADAS.seHunde + CAIDA.margenBajoElLazo
  const cerca = []

  let estrella = null
  for (const p of nivel.plataformas) {
    if (p.hito) {
      estrella = p
      continue
    }
    if (!p.hunde || !estrella) continue
    const sobreLaEstrella = estrella.y - p.y
    if (sobreLaEstrella < seguro) {
      cerca.push({ indice: p.indice, sobreLaEstrella })
    }
  }

  console.log(
    cerca.length === 0
      ? `   ✓ ninguna almohada está a menos de ${seguro} px de su estrella, así que hundirse nunca cuenta como caerse`
      : `   ⚠ ${cerca.length} almohada(s) demasiado cerca de su estrella (hace falta ${seguro} px): ${cerca
          .map((c) => `${c.indice + 1} a ${Math.round(c.sobreLaEstrella)}`)
          .join(', ')}`,
  )
}
console.log('')

/* ── 9e. Las cobijas enredadas ─────────────────────────────────
   La segunda traba del capítulo de Nico, y la única de todo el juego
   que le mete mano a la barra en vez de al suelo. La almohada cobra
   por esperar; la cobija cobra por apurarse.

   Nada de esto se juzga mirando: la barra sube igual de lisa en los
   dos sitios, solo que más despacio en uno. Lo único que se ve es que
   el dedo lleva más rato apretado, y eso a ojo no se mide. */

console.log('  Las cobijas enredadas')

/** Una cobija sola y ancha, o la misma almohada sin enredar. */
function mundoDeCobijas({ enreda = true } = {}) {
  const suyo = construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: false,
    seHunde: true,
    plataformas: [
      { x: 30, ancho: 140, altura: 0, hito: true },
      { x: 30, ancho: 150, altura: 80, enreda },
    ],
  })
  const encima = suyo.plataformas[1]
  suyo.salida = { x: encima.x + encima.ancho / 2, y: encima.y }
  return suyo
}

{
  // (a) Lo primero y lo único que hace: la barra sube más lento. Se
  // aprieta el mismo tiempo en las dos y se mira dónde quedó.
  const cargaTras = (ms, enreda) => {
    const { motor, frame, ver } = banco(mundoDeCobijas({ enreda }))
    frame()
    motor.presionar()
    for (let i = 0; i < Math.round(ms / FRAME); i += 1) frame()
    const donde = ver().carga
    motor.detener()
    return donde
  }

  const normal = cargaTras(SALTO.msDeCarga, false)
  const cobija = cargaTras(SALTO.msDeCarga, true)
  console.log(
    `   apretando ${SALTO.msDeCarga} ms la barra llega al ${(normal * 100).toFixed(0)} % en una almohada y al ${(cobija * 100).toFixed(0)} % en una cobija`,
  )
  console.log(
    normal > 0.98 && cobija < 0.75
      ? '   ✓ encima de la cobija la barra se arrastra, y solo encima de la cobija'
      : `   ⚠ la cobija no frena la barra como debe (${(cobija * 100).toFixed(0)} % contra ${(normal * 100).toFixed(0)} %)`,
  )
}

{
  // (b) El precio tiene que poder pagarse. Si el tope no llega nunca
  // sin desmayarse, la cobija deja de ser una decisión y pasa a ser
  // una prohibición: sería una plataforma desde la que no se puede
  // dar un salto entero, y eso no es una traba, es una pared.
  //
  // Se mide de verdad, apretando hasta que la barra se llene o hasta
  // que se desmaye, lo que pase primero.
  const { motor, frame, ver, eventos } = banco(mundoDeCobijas())
  frame()
  motor.presionar()
  let ms = 0
  for (let i = 0; i < 300 && ver().carga < 0.999 && !eventos.includes('agotada'); i += 1) {
    frame()
    ms += FRAME
  }
  const llena = ver().carga >= 0.999
  const desmayada = eventos.includes('agotada')
  motor.detener()

  const margen = CANSANCIO.msDeAguante - COBIJAS.msDeCarga
  const margenNormal = CANSANCIO.msDeAguante - SALTO.msDeCarga
  console.log(
    `   el tope llega a los ${Math.round(ms)} ms y el desmayo a los ${CANSANCIO.msDeAguante}: quedan ${margen} ms de aguante contra los ${margenNormal} de siempre`,
  )
  console.log(
    llena && !desmayada && margen > 0 && margen <= margenNormal / 2
      ? '   ✓ el salto entero desde una cobija se puede pagar, y cuesta la mitad del aguante o más'
      : !llena || desmayada
        ? '   ⚠ el tope no llega desde una cobija: eso no es una traba, es una pared'
        : `   ⚠ la cobija sale barata: deja ${margen} ms de los ${margenNormal} normales`,
  )

  // Y el aviso rojo, que es lo que la hace justa: empieza a los
  // msDeAguante − msDeAviso. Desde una cobija tiene que llegar
  // pegado al tope, no mucho después, o el castigo no se ve venir.
  const empiezaElRojo = CANSANCIO.msDeAguante - CANSANCIO.msDeAviso
  const desdeElTope = empiezaElRojo - COBIJAS.msDeCarga
  console.log(
    Math.abs(desdeElTope) < 400
      ? `   ✓ la barra llena y el aviso rojo llegan casi juntos (${Math.round(desdeElTope)} ms de diferencia): el castigo se ve venir`
      : `   ⚠ el aviso rojo llega ${Math.round(desdeElTope)} ms del tope, que es demasiado lejos para avisar de algo`,
  )
}

{
  // (c) La cobija se hunde como cualquier almohada. Si no se hundiera
  // sería un descanso con la barra lenta, o sea lo contrario de lo
  // que se quiso: se cobra en tiempo **y** en altura, no en una sola
  // de las dos.
  const suyo = mundoDeCobijas()
  const cobija = suyo.plataformas[1]
  const { motor, frame } = banco(suyo)
  let e = null
  for (let i = 0; i < 300; i += 1) e = frame()
  motor.detener()
  const bajo = e ? e.y - cobija.y : 0
  console.log(
    cobija.hunde === true && bajo > ALMOHADAS.seHunde - 1.5
      ? `   ✓ la cobija también se hunde: ${bajo.toFixed(0)} px, igual que una almohada`
      : `   ⚠ la cobija no se hunde (${bajo.toFixed(1)} px): sería un descanso con la barra lenta`,
  )
}

{
  // (d) La regla de las cobijas, comprobada en los tres capítulos:
  // ninguna va justo antes de un hueco marcado «a prisa». El hueco
  // pide salir en la pasada en que se llegó y la cobija pide cargar
  // largo; juntas piden dos cosas que se contradicen. Es la misma
  // lección que dejaron las forradas y los huecos al tope en el
  // cuarto de Ovi, y por eso se comprueba en vez de recordarse.
  const contraLaRegla = []
  for (const c of CAPITULOS) {
    const suyo = construirNivel(c)
    for (let i = 0; i < suyo.plataformas.length - 1; i += 1) {
      if (suyo.plataformas[i].enreda && suyo.plataformas[i + 1].aPrisa) {
        contraLaRegla.push(`${c.id} ${i + 1}→${i + 2}`)
      }
    }
  }
  console.log(
    contraLaRegla.length === 0
      ? '   ✓ ninguna cobija va justo antes de un hueco a prisa, en ningún capítulo'
      : `   ⚠ ${contraLaRegla.length} cobija(s) justo antes de un hueco a prisa: ${contraLaRegla.join(', ')}`,
  )
}
console.log('')

/* ── 10. Con qué capítulo se entra ─────────────────────────────
   El juego entra siempre por el primero que ella no haya ganado. Si
   esta cuenta se equivoca no se rompe nada en pantalla: simplemente
   nunca llega a ver un capítulo, o repite uno que ya pasó. Es de las
   cosas que no se notan jugando y por eso se miden. */

console.log('  Con qué capítulo entra')

{
  const ultimo = CAPITULOS.reduce((mayor, c) => Math.max(mayor, c.numero), 1)
  const con = (ganados) => conCualEntra({ capitulo: ganados, pasitos: 0, caidas: 0, nombre: '' }, ultimo)

  const primeraVez = con(0) === 1
  const trasGanarUno = con(1) === Math.min(2, ultimo)
  const ganadosTodos = con(ultimo) === ultimo

  console.log(`   hay ${CAPITULOS.length} capítulos escritos, el último es el ${ultimo}`)
  console.log(
    primeraVez && trasGanarUno && ganadosTodos
      ? '   ✓ la primera vez entra por el uno, después por el siguiente, y ganados todos repite el último'
      : `   ⚠ entra mal: sin ganar nada va al ${con(0)}, con uno ganado al ${con(1)}, con todos al ${con(ultimo)}`,
  )

  // Y cada capítulo escrito tiene que construirse con las estrellas
  // que le tocan: cinco el primero y una menos por capítulo, con la
  // cima siempre marcada. Escribir uno nuevo y olvidarse una es fácil,
  // y quitar una de más deja un trecho impasable sin que se note.
  const lasQueTocan = (c) => 6 - c.numero
  const flojos = CAPITULOS.filter((c) => {
    const suyo = construirNivel(c)
    return suyo.hitos.length !== lasQueTocan(c) || suyo.cima.hito !== true
  })
  console.log(
    flojos.length === 0
      ? `   ✓ los ${CAPITULOS.length} se construyen, con ${CAPITULOS.map(lasQueTocan).join(', ')} estrellas y la cima marcada`
      : `   ⚠ mal armados: ${flojos
          .map((c) => `${c.id} (${construirNivel(c).hitos.length} estrellas, tocan ${lasQueTocan(c)})`)
          .join('; ')}`,
  )
}

console.log('')
console.log('  Lo que cae')

/**
 * El mundo para mirar lo que cae: dos plataformas anchas, la de arriba
 * con estrella y corrida a un lado.
 *
 * Corrida a propósito: la plataforma de arriba **para lo que cae**, así
 * que puesta encima de la otra sería un techo y no caería nada sobre la
 * tortuga. Y con estrella porque hasta pasar la primera no cae nada,
 * que es la regla que hace falta cumplir para poder probar el resto.
 */
function mundoDeLoQueCae() {
  return construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: false,
    seHunde: false,
    plataformas: [
      { x: 20, ancho: 150, altura: 0 },
      { x: 190, ancho: 150, altura: 60, hito: true },
    ],
  })
}

/** Saltar a la estrella de arriba, que es lo que abre la veda. */
function pisarLaEstrella(motor, frame, ver) {
  // El primer frame es el que llena la escena: antes de él `ver()` no
  // devuelve nada todavía.
  frame()
  for (let i = 0; i < 900; i += 1) {
    if (ver().hitoAlcanzado >= 1) return true
    // Se salta solo mirando a la derecha, que es hacia donde está.
    if (ver().enSuelo && ver().mirando === 1 && !ver().cargando) {
      saltarCon(motor, frame, 0.62)
    }
    frame()
  }
  return false
}

/** Jugar hasta que le pegue algo, o hasta cansarse de esperar. */
function hastaQueLePegue(motor, frame, ver, tope = 9000) {
  frame()
  for (let i = 0; i < tope && !ver().efecto; i += 1) frame()
  return ver().efecto
}

{
  // (a) Antes de la primera estrella no cae nada. Es la misma regla
  // que la pista que se borra en el capítulo de Boo: los primeros
  // saltos son para aprender.
  const { motor, frame, ver } = banco(mundoDeLoQueCae())
  let cayoAlgo = false
  // Bastante más que el intervalo más largo, para que no sea que
  // simplemente no le dio tiempo.
  for (let i = 0; i < Math.round((LO_QUE_CAE.cadaHasta * 3 * 1000) / FRAME); i += 1) {
    frame()
    if (ver().loQueCae.length > 0) cayoAlgo = true
  }
  motor.detener()
  console.log(
    !cayoAlgo
      ? '   ✓ antes de la primera estrella no cae nada, ni en ' +
          LO_QUE_CAE.cadaHasta * 3 +
          ' segundos'
      : '   ⚠ está cayendo cosas antes de la primera estrella, que es cuando todavía se aprende',
  )
}

{
  // (b) Y pasada la estrella sí cae, y **se ve venir**: lo que se está
  // prometiendo es que da tiempo a reaccionar, y eso es un número que
  // se puede medir. Se mira cuánto tarda desde que asoma hasta que
  // llega a la altura de las paticas.
  const { motor, frame, ver } = banco(mundoDeLoQueCae())
  const listo = pisarLaEstrella(motor, frame, ver)

  let asomo = -1
  let llegada = -1
  for (let i = 0; i < 5000 && llegada < 0; i += 1) {
    const e = frame()
    const algo = e.loQueCae.find((x) => x.puf === 0)
    if (algo && asomo < 0) asomo = i
    if (algo && asomo >= 0 && algo.y >= e.y) llegada = i
    // Si se deshizo contra algo antes de llegar, se espera al siguiente.
    if (asomo >= 0 && !algo) asomo = -1
  }
  motor.detener()

  const segundos = ((llegada - asomo) * FRAME) / 1000
  console.log(
    '   asoma por arriba y tarda ' +
      segundos.toFixed(1) +
      ' s en llegar a la altura de la tortuga',
  )
  console.log(
    listo && llegada > 0 && segundos >= 2
      ? '   ✓ da tiempo de sobra a quitarse, que es lo único que esta traba promete'
      : '   ⚠ llega en ' +
          segundos.toFixed(1) +
          ' s: no se ve venir, y una traba que no se ve venir es una trampa',
  )
}

{
  // (c) El apurón desboca la barra de verdad: va más rápido **y no se
  // queda en el tope**. Lo segundo es lo importante — si se quedara
  // arriba, sería la barra de siempre con prisa y no habría traba.
  const { motor, frame, ver, eventos } = banco(mundoDeLoQueCae())
  pisarLaEstrella(motor, frame, ver)

  // Se busca un apurón de verdad: se juega hasta que le pegue uno, que
  // es de paso la prueba de que la franja donde caen amenaza a alguien.
  let puesto = null
  for (let i = 0; i < 4 && !puesto; i += 1) {
    const cual = hastaQueLePegue(motor, frame, ver)
    if (cual?.cual === 'apuron') puesto = cual
    else if (cual) {
      // Era el otro: se gastan sus saltos y se sigue esperando.
      for (let s = 0; s < LO_QUE_CAE.saltosDeEfecto + 1; s += 1) {
        while (!ver().enSuelo) frame()
        saltarCon(motor, frame, 0.3)
        frame()
      }
    }
  }
  const golpes = eventos.filter((e) => e === 'apuron' || e === 'apagon').length

  let seDesboco = false
  let tope = 0
  if (puesto) {
    while (!ver().enSuelo || ver().cargando) frame()
    motor.presionar()
    let antes = 0
    for (let i = 0; i < 120; i += 1) {
      frame()
      const ahora = ver().carga
      tope = Math.max(tope, ahora)
      // La vuelta a cero: la barra estaba arriba y de pronto está
      // abajo sin que nadie la haya soltado.
      if (antes > 0.8 && ahora < 0.2) seDesboco = true
      antes = ahora
    }
    motor.soltar()
  }
  motor.detener()

  console.log('   ' + golpes + ' golpe(s) en la partida de prueba')
  console.log(
    golpes > 0
      ? '   ✓ lo que cae acierta alguna vez: la franja donde asoma amenaza de verdad'
      : '   ⚠ no le pegó nada en toda la prueba: está cayendo donde no le estorba a nadie',
  )
  if (puesto) {
    console.log(
      seDesboco && tope > 0.95
        ? '   ✓ con el apurón la barra llega al tope y se pasa: hay que agarrarla al vuelo'
        : '   ⚠ el apurón no desboca la barra (llegó al ' +
            (tope * 100).toFixed(0) +
            ' % y ' +
            (seDesboco ? 'volvió' : 'no volvió') +
            ' a cero)',
    )
  } else {
    console.log('   · esta vez no le pegó ningún apurón; se mira en la próxima pasada')
  }
}

{
  // (d) El apagón no toca ni un número: lo único que hace es que la
  // barra no se dibuje. Si tocara la carga sería dos castigos en uno, y
  // el juego ya aprendió que una regla que castiga no puede castigar
  // dos veces.
  const cargaTrasMedioSegundo = (conApagon) => {
    const { motor, frame, ver } = banco(mundoDeLoQueCae())
    frame()
    if (conApagon) {
      pisarLaEstrella(motor, frame, ver)
      let cual = null
      for (let i = 0; i < 4 && cual?.cual !== 'apagon'; i += 1) {
        cual = hastaQueLePegue(motor, frame, ver)
        if (cual && cual.cual !== 'apagon') {
          for (let s = 0; s < LO_QUE_CAE.saltosDeEfecto + 1; s += 1) {
            while (!ver().enSuelo) frame()
            saltarCon(motor, frame, 0.3)
            frame()
          }
        }
      }
      if (ver().efecto?.cual !== 'apagon') {
        motor.detener()
        return null
      }
    }
    while (!ver().enSuelo || ver().cargando) frame()
    motor.presionar()
    for (let i = 0; i < Math.round(SALTO.msDeCarga / 2 / FRAME); i += 1) frame()
    const donde = ver().carga
    motor.detener()
    return donde
  }

  const sinNada = cargaTrasMedioSegundo(false)
  const conApagon = cargaTrasMedioSegundo(true)
  if (conApagon === null) {
    console.log('   · esta vez no le pegó ningún apagón; se mira en la próxima pasada')
  } else {
    console.log(
      Math.abs(sinNada - conApagon) < 0.03
        ? '   ✓ el apagón no toca la carga: lo único que quita es poder verla'
        : '   ⚠ el apagón está cambiando la barra (' +
            (sinNada * 100).toFixed(0) +
            ' % contra ' +
            (conApagon * 100).toFixed(0) +
            ' %)',
    )
  }
}

{
  // (e) El efecto se gasta en los saltos prometidos, ni uno más.
  //
  // Va en una plataforma sola de pared a pared, y los saltos son
  // saltitos: la primera versión usaba el mundo de dos plataformas y
  // se caía a mitad de la cuenta, con lo cual el efecto se iba —bien
  // ido, por la regla de más abajo— y la prueba decía que duraba dos
  // saltos. El arnés mintiendo antes que el juego, van ocho.
  const suelta = construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: false,
    seHunde: false,
    plataformas: [{ x: 0, ancho: 360, altura: 0, hito: true }],
  })
  const { motor, frame, ver } = banco(suelta)
  frame()
  // La estrella es la de abajo: un saltito y al volver a pisarla se
  // abre la veda.
  for (let i = 0; i < 600 && ver().hitoAlcanzado < 0; i += 1) {
    if (ver().enSuelo && !ver().cargando) saltarCon(motor, frame, 0.1)
    frame()
  }
  const puesto = hastaQueLePegue(motor, frame, ver)

  const alEmpezar = puesto?.saltos ?? 0
  let saltosDados = 0
  for (let i = 0; i < 40 && ver().efecto; i += 1) {
    while (!ver().enSuelo) frame()
    saltarCon(motor, frame, 0.1)
    saltosDados += 1
    frame()
  }
  const quedaAlgo = ver().efecto !== null
  const seCayo = ver().caidas > 0
  motor.detener()
  if (seCayo) console.log('   · se cayó a mitad de la cuenta; el número de abajo no vale')

  console.log('   el efecto entra con ' + alEmpezar + ' saltos y se fue tras ' + saltosDados)
  console.log(
    alEmpezar === LO_QUE_CAE.saltosDeEfecto &&
      saltosDados === LO_QUE_CAE.saltosDeEfecto &&
      !quedaAlgo
      ? '   ✓ dura exactamente los ' + LO_QUE_CAE.saltosDeEfecto + ' saltos que promete'
      : '   ⚠ dura ' + saltosDados + ' saltos y tendría que durar ' + LO_QUE_CAE.saltosDeEfecto,
  )
}

{
  // (f) Al caerse **el efecto se queda** y lo que estuviera bajando se
  // va. Son las dos mitades de la misma decisión:
  //
  // El efecto se queda porque los tres saltos hay que gastarlos. Si la
  // caída lo limpiara, tirarse al vacío sería la forma barata de
  // quitárselo, y el juego estaría premiando lo único que castiga.
  //
  // Y lo que estuviera bajando se va porque reaparecer con algo ya
  // encima que ella no vio caer sí es una trampa puesta mientras no
  // miraba, igual que las cajas torcidas y las almohadas hundidas.
  const { motor, frame, ver } = banco(mundoDeLoQueCae())
  pisarLaEstrella(motor, frame, ver)
  const tenia = hastaQueLePegue(motor, frame, ver) !== null

  // A tirarse al vacío: se salta a lo loco hacia la izquierda hasta
  // que se cae de verdad.
  for (let i = 0; i < 1200 && !ver().cayendo; i += 1) {
    if (ver().enSuelo && ver().mirando === -1) saltarCon(motor, frame, 1)
    frame()
  }
  for (let i = 0; i < 300 && ver().cayendo; i += 1) frame()
  frame()

  const despues = ver().efecto
  const bajando = ver().loQueCae.length
  motor.detener()
  console.log(
    !tenia
      ? '   · esta vez no le pegó nada antes de caerse'
      : despues !== null && bajando === 0
        ? '   ✓ al caerse el efecto sigue puesto y el cielo queda limpio'
        : despues === null
          ? '   ⚠ la caída le quitó el efecto: así tirarse al vacío es la forma barata de limpiárselo'
          : '   ⚠ reaparece con algo ya cayéndole encima que no vio caer',
  )
}

{
  // (g) **Una plataforma NO lo para**, y esta prueba está aquí para que
  // no vuelva a pararlo.
  //
  // La primera versión sí: se deshacía contra cualquier tramo, con el
  // argumento de que así el nivel protegía. Medido jugando los tres
  // capítulos, el techo paraba seis de cada seis y le pegaba cero
  // veces en toda la subida. Con treinta y dos plataformas en zigzag
  // casi cualquier sitio donde ella pueda estar tiene algo encima, así
  // que «el nivel protege» y «lo que cae amenaza» no pueden ser verdad
  // las dos. Una traba que el nivel anula no es una traba.
  const bajoTecho = construirNivel({
    ...capitulo,
    seDesvanece: false,
    cede: false,
    seHunde: false,
    plataformas: [
      { x: 20, ancho: 320, altura: 0, hito: true },
      // El techo, justo encima y de pared a pared.
      { x: 0, ancho: 360, altura: 150 },
    ],
  })
  const { motor, frame, ver } = banco(bajoTecho)
  frame()
  // Aquí la estrella es la de abajo, donde ya está parada: un saltito
  // y al volver a pisarla se abre la veda.
  for (let i = 0; i < 600 && ver().hitoAlcanzado < 0; i += 1) {
    if (ver().enSuelo && !ver().cargando) saltarCon(motor, frame, 0.15)
    frame()
  }

  let lePego = false
  let sePararon = 0
  for (let i = 0; i < 9000; i += 1) {
    const e = frame()
    if (e.efecto) lePego = true
    for (const algo of e.loQueCae) {
      // Deshecho bastante por encima de la tortuga: lo paró el techo.
      //
      // Noventa y no sesenta: la tortuga mide 50 de alto y el objeto
      // 13 de medio, así que un golpe en plena cabeza deja el puf a 63
      // por encima de las paticas. Con el umbral en 60, cada golpe en
      // la cabeza se contaba como un techo y la prueba avisaba de algo
      // que no estaba pasando.
      if (algo.puf > 0 && algo.y < e.y - 90) sePararon += 1
    }
  }
  motor.detener()
  console.log(
    lePego && sePararon === 0
      ? '   ✓ un techo de pared a pared no lo para: pasa por delante y le llega igual'
      : sePararon > 0
        ? '   ⚠ las plataformas están frenando lo que cae otra vez, y con eso la traba se anula sola'
        : '   · esta vez no le pegó nada bajo el techo; se mira en la próxima pasada',
  )
}

{
  // (h) Y lo último, que es lo que decide si esto es difícil o
  // injusto: con el apurón puesto **el salto que se quiere sigue
  // estando**. La barra da vueltas, así que lo que hay que mirar es
  // cuántas veces pasa por el punto bueno antes de que se desmaye.
  const vueltas = CANSANCIO.msDeAguante / LO_QUE_CAE.msDeCargaDesbocada
  console.log(
    '   con la barra desbocada da ' +
      vueltas.toFixed(1) +
      ' vueltas enteras antes de desmayarse',
  )
  console.log(
    vueltas >= 4
      ? '   ✓ la carga que hace falta pasa varias veces: hay que agarrarla, no adivinarla'
      : '   ⚠ solo pasa ' + vueltas.toFixed(1) + ' veces por el punto bueno, y eso ya es azar',
  )
}


console.log('')
console.log('  Lo que cae, jugando el capítulo de verdad')

/**
 * El mismo robot de más arriba, pero contando lo que le cae encima.
 *
 * Es la única forma de contestar la pregunta que importa: **cuántas
 * veces le pega de verdad en una subida entera**. En un banco caen
 * sobre una plataforma pelada y le pegan casi siempre; en el capítulo
 * hay treinta y dos plataformas haciendo de techo, así que la mitad se
 * deshacen antes de llegar. Los números del banco no valen aquí.
 */
function lluviaJugando() {
  const { motor, frame, eventos, ver } = banco(nivel)

  let objetivo = 1
  let frames = 0
  let cargando = false
  let framesCargando = 0
  let cargaElegida = 0
  let saliendoDe = null

  /** Los que ya se contaron, por identidad: la lista es la misma. */
  const vistos = new Set()
  let soltados = 0
  let parados = 0
  let framesHastaLaPrimera = -1

  while (frames < 60 * 60 * 6 && objetivo < nivel.plataformas.length) {
    const e = frame()
    frames += 1
    if (!e) continue

    if (framesHastaLaPrimera < 0 && e.hitoAlcanzado >= 0) framesHastaLaPrimera = frames

    for (const algo of e.loQueCae) {
      if (!vistos.has(algo)) {
        vistos.add(algo)
        soltados += 1
      }
      // Deshecho bastante por encima de la tortuga: lo paró un techo.
      if (algo.puf > 0 && algo.puf < 0.05 && algo.y < e.y - 55) parados += 1
    }

    if (e.enSuelo && !cargando && !e.cayendo) {
      const donde = nivel.plataformas.find((p) => estaEncima(e, p, p.indice, 8))
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
  const golpes = eventos.filter((x) => x === 'apuron' || x === 'apagon').length

  return {
    soltados,
    parados,
    golpes,
    segundos: frames / 60,
    hastaLaPrimera: framesHastaLaPrimera / 60,
    llego: eventos.includes('cima'),
  }
}

{
  const l = lluviaJugando()
  const jugables = Math.max(0, l.segundos - l.hastaLaPrimera)
  console.log(
    '   la subida entera dura ' +
      l.segundos.toFixed(0) +
      ' s, y la primera estrella llega a los ' +
      l.hastaLaPrimera.toFixed(0) +
      ' s: quedan ' +
      jugables.toFixed(0) +
      ' s en los que puede caer algo',
  )
  console.log(
    '   cayeron ' +
      l.soltados +
      ', los paró un techo ' +
      l.parados +
      ' y le pegaron ' +
      l.golpes,
  )

  // **Se mide por minuto, no por subida.** El robot termina el
  // capítulo en poco más de un minuto porque juega perfecto y no se
  // demora nunca; ella va a tardar varios, entre lo que piensa cada
  // salto y lo que se cae. Contar por subida calibra el juego para un
  // jugador que no existe.
  //
  // Uno o dos por minuto es lo que se busca: cada golpe le descompone
  // tres saltos, así que a tres por minuto ya estaría jugando con la
  // barra rota más tiempo que con la barra buena, y el capítulo
  // dejaría de ser el capítulo para pasar a ser esquivar.
  const porMinuto = (l.golpes / Math.max(1, jugables)) * 60
  const caenPorMinuto = (l.soltados / Math.max(1, jugables)) * 60
  console.log(
    '   o sea ' +
      caenPorMinuto.toFixed(1) +
      ' que caen y ' +
      porMinuto.toFixed(1) +
      ' golpes por minuto de juego',
  )
  console.log(
    porMinuto >= 0.8 && porMinuto <= 3
      ? '   ✓ le pega ' + porMinuto.toFixed(1) + ' veces por minuto, que es lo que se buscaba'
      : porMinuto < 0.8
        ? '   ⚠ solo ' + porMinuto.toFixed(1) + ' golpes por minuto: así puede terminar el capítulo sin enterarse de que esto existe'
        : '   ⚠ ' + porMinuto.toFixed(1) + ' golpes por minuto: pasaría más tiempo con la barra rota que con la barra buena',
  )
}

console.log('')

console.log(
  `  El salto más largo avanza ${Math.round(masLargo.alcance)} px y sube ${Math.round(masLargo.altura)}.`,
)
console.log(`  La tortuga mide ${TORTUGA.ancho} de ancho y camina a ${TORTUGA.velocidad} px/s.\n`)
