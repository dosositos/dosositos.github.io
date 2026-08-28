import { MUNDO, PISTA, TORTUGA } from '@/content/luna'
import { cabezaDe, dibujarTortuga } from '@/juego-luna/tortuga'
import type { EscenaLuna, Nivel, Plataforma } from '@/types'

/**
 * Pintar el mundo de la luna en un canvas 2D.
 *
 * Todo es vectorial: no hay una sola imagen. El mundo se dibuja aquí
 * y la tortuga en `tortuga.ts`, que es un archivo aparte porque el
 * personaje solo ya tiene bastante adentro.
 *
 * El mundo mide 360 de ancho y lo que mida el capítulo de alto. La
 * cámara decide qué trozo se ve, y aquí solo se dibuja lo que entra
 * en pantalla.
 */

/* Los colores salen de la paleta de la web (ver index.css): la luna
   es el blanco hueso de la margarita y el lazo de los hitos es el
   dorado del tulipán. Están escritos a mano y no leídos del CSS
   porque esto corre sesenta veces por segundo. Los de la tortuga
   viven en `tortuga.ts`. */
const COLOR = {
  cieloArriba: '#0b1026',
  cieloAbajo: '#1b2148',
  estrella: '#f8f4e8',
  luna: '#f8f4e8',
  lunaHalo: 'rgba(248, 244, 232, 0.14)',
  plataforma: '#2a3157',
  plataformaLuz: '#8a93c9',
  hito: '#f5c451',
  hitoApagado: '#6b6a5c',
  barra: '#f5c451',
  barraAviso: '#c33b52',
  barraFondo: 'rgba(11, 16, 38, 0.55)',
  sombra: 'rgba(11, 16, 38, 0.35)',

  /* Las estrellitas de papel de los puntos de guardado. Son las
     mismas del frasco: papel doblado a mano, con un pliegue de cada
     dos en sombra. Van en los tres capítulos, por eso no son de
     ningún peluche. */
  estrellaPapel: '#f8f4e8',
  estrellaPliegue: '#cfc7b4',
  estrellaPapelApagada: '#5d6488',
  estrellaPliegueApagado: '#4a5070',

  /* El capítulo de Boo: la pista naranja del arreglo de Hot Wheels y
     el bambú, que es de donde le viene el nombre. La pista de verdad
     es un canal, así que lleva tres naranjas: la pared de adelante,
     su filo iluminado y el hueco en sombra por donde correría el
     carro. */
  pista: '#c2521c',
  pistaLuz: '#f79340',
  pistaFondo: '#9c400f',
  pistaCanal: '#4a1c07',
  pistaSombra: '#7d3210',
  impulso: '#f5c451',
  bambu: '#376243',
  bambuNudo: '#5c8e64',
  bambuHoja: '#3f6e49',
  /* Las cañas que sostienen la pista van más apagadas que las del
     fondo: están detrás del tramo y en su sombra, y con el mismo
     verde competían con la pista por la mirada. */
  bambuSoporte: '#25422e',
  bambuSoporteNudo: '#3c6444',
}

/** Cuánto dura el fogonazo del despegue, en milisegundos. */
const MS_FOGONAZO = 160

/** Cuánto dura el golpe de cámara al aterrizar. */
const MS_GOLPE = 130

export interface Pintor {
  /** Vuelve a medir el canvas. Se llama al montar y al cambiar la ventana. */
  medir: (anchoCss: number, altoCss: number) => void
  pintar: (escena: EscenaLuna) => void
  /** Cuánto alto del mundo entra en pantalla. Lo necesita la cámara. */
  altoDeLaVista: () => number
  /** Sin movimiento de más: se apagan el parallax, el polvo y el golpe. */
  movimientoReducido: boolean
}

/**
 * Estrellas fijas, sembradas una sola vez con una cuenta y no con
 * `Math.random`: así el cielo es el mismo en cada partida y no
 * parpadea de un frame a otro. Se siembran por todo el alto del
 * capítulo y un poco más.
 */
function sembrarEstrellas(cantidad: number, desde: number, hasta: number) {
  const estrellas: { x: number; y: number; r: number; brillo: number }[] = []
  let semilla = 20260824
  const siguiente = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }
  for (let i = 0; i < cantidad; i += 1) {
    estrellas.push({
      x: siguiente() * MUNDO.ancho,
      y: desde + siguiente() * (hasta - desde),
      r: 0.5 + siguiente() * 1.1,
      brillo: 0.25 + siguiente() * 0.55,
    })
  }
  return estrellas
}

/**
 * Las matas de bambú del capítulo de Boo, sembradas de una vez con la
 * misma cuenta que las estrellas: el bambú no puede cambiar de sitio
 * entre un frame y el siguiente.
 *
 * Van pegadas a los dos bordes y **de punta a punta del capítulo**, de
 * más abajo del suelo hasta más arriba de la cima. Una caña que
 * empieza y termina a la vista parece un palo colgado del aire: estas
 * entran y salen de la pantalla, como un bambusal de verdad.
 */
function sembrarBambu(desde: number, hasta: number) {
  const matas: {
    x: number
    desde: number
    hasta: number
    canas: { dx: number; grosor: number; inclinacion: number; hojaCada: number }[]
  }[] = []
  let semilla = 20241223
  const siguiente = () => {
    semilla = (semilla * 1103515245 + 12345) % 2147483648
    return semilla / 2147483648
  }

  for (const orilla of [0, 1]) {
    for (let i = 0; i < 2; i += 1) {
      const cuantas = 3 + Math.floor(siguiente() * 3)
      const canas = []
      for (let c = 0; c < cuantas; c += 1) {
        canas.push({
          dx: (siguiente() - 0.5) * 26,
          grosor: 4.5 + siguiente() * 4,
          inclinacion: (siguiente() - 0.5) * 30,
          hojaCada: 2 + Math.floor(siguiente() * 3),
        })
      }
      matas.push({
        x: orilla === 0 ? 10 + siguiente() * 22 : MUNDO.ancho - 10 - siguiente() * 22,
        desde: desde - siguiente() * 200,
        hasta: hasta + siguiente() * 200,
        canas,
      })
    }
  }
  return matas
}

/**
 * En qué tramos hay un carrito parqueado y de qué color. Cada tres o
 * cuatro, y nunca en los de impulso ni en los de estrella, que ya
 * tienen algo encima.
 */
function sembrarCarritos(nivel: Nivel) {
  const colores = ['#c9455a', '#3f7fc4', '#e0a63a', '#5aa86a', '#8a6bc4']
  const donde = new Map<number, { x: number; color: string }>()
  for (const p of nivel.plataformas) {
    if (p.hito || p.impulso || p.indice === 0) continue
    if (p.indice % 3 !== 1) continue
    donde.set(p.indice, {
      // Parqueado hacia una punta, no en el medio, que es donde
      // aterriza la tortuga.
      x: p.indice % 2 === 0 ? p.x + 18 : p.x + p.ancho - 18,
      color: colores[p.indice % colores.length],
    })
  }
  return donde
}

/** Un par de loopings de pista al fondo, de adorno. */
function sembrarLoopings(desde: number, hasta: number) {
  const loopings: { x: number; y: number; r: number }[] = []
  const cuantos = Math.max(1, Math.round((hasta - desde) / 900))
  for (let i = 0; i < cuantos; i += 1) {
    const t = (i + 0.5) / cuantos
    loopings.push({
      x: i % 2 === 0 ? MUNDO.ancho * 0.24 : MUNDO.ancho * 0.76,
      y: hasta - (hasta - desde) * t,
      r: 52 + (i % 3) * 12,
    })
  }
  return loopings
}

export function crearPintor(canvas: HTMLCanvasElement, nivel: Nivel): Pintor {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('sin canvas 2d')

  /** Cuánto hay que subir en este capítulo, de abajo del todo a arriba. */
  const subidaTotal = Math.max(1, nivel.suelo - nivel.cima.y)

  // Las estrellas se siembran en un sitio fijo del mundo y se dibujan
  // corridas: eso es lo que da la sensación de altura.
  const estrellas = sembrarEstrellas(150, nivel.cima.y - 400, nivel.suelo + 250)

  // El decorado del capítulo. En los mundos que no son de pista se
  // queda vacío y no se dibuja nada.
  const esDePista = nivel.material === 'pista'
  const matas = esDePista ? sembrarBambu(nivel.cima.y - 200, nivel.suelo + 200) : []
  const loopings = esDePista ? sembrarLoopings(nivel.cima.y, nivel.suelo) : []
  const carritos = esDePista ? sembrarCarritos(nivel) : new Map()

  let anchoCss = 0
  let altoCss = 0
  let escala = 1
  let margen = 0

  /** Dónde despegó la última vez, para dejar ahí el fogonazo. */
  let despegue = { x: 0, y: 0 }
  let ultimoDesdeSalto = 99999

  const pintor: Pintor = {
    movimientoReducido: false,

    altoDeLaVista: () => (escala > 0 ? altoCss / escala : MUNDO.alto),

    medir(ancho: number, alto: number) {
      anchoCss = ancho
      altoCss = alto

      // El canvas se dibuja en píxeles de verdad y se muestra en
      // píxeles CSS. Sin esto, en el teléfono se ve borroso. El tope
      // de 3 es por los aparatos de pantalla muy densa: más allá de
      // ahí no se nota y sí se siente en el rendimiento.
      const densidad = Math.min(window.devicePixelRatio || 1, 3)
      canvas.width = Math.round(ancho * densidad)
      canvas.height = Math.round(alto * densidad)
      canvas.style.width = `${ancho}px`
      canvas.style.height = `${alto}px`

      // El mundo tiene que verse entero de ancho: escalando solo por
      // el alto, en un teléfono largo se salía por los costados y una
      // plataforma pegada al borde quedaba fuera de la pantalla.
      escala = Math.min(alto / MUNDO.alto, ancho / MUNDO.ancho)
      margen = (ancho - MUNDO.ancho * escala) / 2
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0)
    },

    pintar(escena: EscenaLuna) {
      if (!anchoCss || !altoCss) return

      const densidad = Math.min(window.devicePixelRatio || 1, 3)
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0)

      // El cielo llena todo el ancho, aunque el mundo quede centrado.
      const cielo = ctx.createLinearGradient(0, 0, 0, altoCss)
      cielo.addColorStop(0, COLOR.cieloArriba)
      cielo.addColorStop(1, COLOR.cieloAbajo)
      ctx.fillStyle = cielo
      ctx.fillRect(0, 0, anchoCss, altoCss)

      // El golpe de cámara del aterrizaje: la pantalla acusa el
      // porrazo y vuelve. Es corto a propósito.
      let golpe = 0
      if (!pintor.movimientoReducido && escena.desdeAterrizaje < MS_GOLPE) {
        const resto = 1 - escena.desdeAterrizaje / MS_GOLPE
        golpe = Math.sin(resto * Math.PI * 2) * 3 * resto
      }

      const altoVista = pintor.altoDeLaVista()

      // Las estrellas van en su propia capa, corridas más despacio que
      // el mundo: eso hace sentir que se sube de verdad, en vez de que
      // las plataformas bajen. Con «menos movimiento» viajan pegadas
      // al mundo y no hay parallax.
      const arrastre = pintor.movimientoReducido ? 1 : 0.45
      ctx.save()
      ctx.translate(margen, -escena.camara * arrastre * escala + golpe)
      ctx.scale(escala, escala)
      dibujarEstrellas(ctx, estrellas, escena.camara * arrastre, altoVista)
      ctx.restore()

      // La luna se dibuja pegada a la pantalla y no al mundo, y va
      // creciendo conforme se sube. Puesta en el mundo, a mil y pico
      // de altura, no se veía hasta el último salto: justo la que
      // tiene que estar ahí desde el principio, porque es a donde se
      // va. Así se acerca de verdad.
      const subido = Math.min(1, Math.max(0, (nivel.suelo - escena.camara) / subidaTotal))
      ctx.save()
      ctx.translate(margen, golpe)
      ctx.scale(escala, escala)
      dibujarLuna(ctx, {
        x: MUNDO.ancho * 0.66,
        y: 78 + subido * 34,
        r: 20 + subido * 34,
      })
      ctx.restore()

      ctx.save()
      ctx.translate(margen, -escena.camara * escala + golpe)
      ctx.scale(escala, escala)

      const arriba = escena.camara - 40
      const abajo = escena.camara + altoVista + 40

      // El decorado va detrás de la pista y no se toca: es lo que
      // dice de qué mundo estamos hablando cuando la pista ya se
      // borró y no queda nada.
      for (const l of loopings) {
        if (l.y + l.r < arriba || l.y - l.r > abajo) continue
        dibujarLooping(ctx, l)
      }
      for (const m of matas) {
        if (m.desde > abajo || m.hasta < arriba) continue
        dibujarMata(ctx, m, arriba, abajo)
      }

      for (const p of escena.plataformas) {
        if (p.y < arriba || p.y > abajo) continue

        // Lo que le queda a este tramo antes de borrarse. En los
        // capítulos sin desvanecimiento son todos 1 y no pasa nada.
        const vida = escena.vidaDeLaPista[p.indice] ?? 1
        if (vida <= 0) continue

        ctx.globalAlpha = opacidadDeLaPista(
          vida,
          escena.avisoDeLaPista,
          escena.reloj,
          pintor.movimientoReducido,
        )
        if (esDePista) dibujarPistaNaranja(ctx, p, escena.hitoAlcanzado, escena.reloj)
        else dibujarPlataforma(ctx, p, escena.hitoAlcanzado, escena.reloj)

        const carrito = carritos.get(p.indice)
        if (carrito) dibujarCarrito(ctx, carrito.x, p.y, carrito.color)

        ctx.globalAlpha = 1
      }

      // Se dibuja siempre que entre en pantalla, cayéndose incluida:
      // la caída se ve entera hasta que sale por abajo. Desaparecer en
      // pleno aire parecería un error del juego.
      if (escena.y < escena.camara + altoVista + 60) {
        dibujarSombra(ctx, escena)
        dibujarTortuga(ctx, escena)
        if (escena.cargando) dibujarBarra(ctx, escena)
        if (escena.cansancio > 0) dibujarEstrellitas(ctx, escena)
      }

      // El fogonazo se queda donde despegó, no donde va la tortuga.
      if (escena.desdeSalto < ultimoDesdeSalto) despegue = { x: escena.x, y: escena.y }
      ultimoDesdeSalto = escena.desdeSalto

      if (escena.desdeSalto < MS_FOGONAZO) {
        dibujarFogonazo(ctx, despegue, escena.desdeSalto)
        if (!pintor.movimientoReducido) dibujarPolvo(ctx, despegue, escena.desdeSalto)
      }

      ctx.restore()
    },
  }

  return pintor
}

function dibujarEstrellas(
  ctx: CanvasRenderingContext2D,
  estrellas: ReturnType<typeof sembrarEstrellas>,
  camara: number,
  altoVista: number,
) {
  ctx.fillStyle = COLOR.estrella
  for (const e of estrellas) {
    if (e.y < camara - 20 || e.y > camara + altoVista + 20) continue
    ctx.globalAlpha = e.brillo
    ctx.beginPath()
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/** La luna, esperando arriba. Es a donde se va. */
function dibujarLuna(ctx: CanvasRenderingContext2D, luna: { x: number; y: number; r: number }) {
  const halo = ctx.createRadialGradient(luna.x, luna.y, luna.r * 0.6, luna.x, luna.y, luna.r * 3.4)
  halo.addColorStop(0, COLOR.lunaHalo)
  halo.addColorStop(1, 'rgba(248, 244, 232, 0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(luna.x, luna.y, luna.r * 3.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLOR.luna
  ctx.beginPath()
  ctx.arc(luna.x, luna.y, luna.r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(180, 176, 166, 0.5)'
  for (const c of [
    { x: -0.3, y: -0.24, r: 0.19 },
    { x: 0.24, y: 0.16, r: 0.27 },
    { x: 0.38, y: -0.38, r: 0.12 },
  ]) {
    ctx.beginPath()
    ctx.arc(luna.x + c.x * luna.r, luna.y + c.y * luna.r, c.r * luna.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function dibujarPlataforma(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  hitoAlcanzado: number,
  reloj: number,
) {
  const alto = 16
  ctx.fillStyle = COLOR.plataforma
  ctx.beginPath()
  ctx.roundRect(p.x, p.y, p.ancho, alto, 6)
  ctx.fill()

  // La línea de arriba es la que se pisa: se marca clara para que no
  // haya duda de dónde está el suelo.
  ctx.strokeStyle = p.hito ? COLOR.estrellaPapel : COLOR.plataformaLuz
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(p.x + 2, p.y + 1)
  ctx.lineTo(p.x + p.ancho - 2, p.y + 1)
  ctx.stroke()

  if (p.hito) dibujarEstrellaDePapel(ctx, p, hitoAlcanzado >= p.indice, reloj)
}

/* ── El capítulo de Boo ──────────────────────────────────────────── */

/**
 * Lo transparente que va un tramo según lo que le queda de vida.
 *
 * Se mantiene entero hasta que entra en el aviso, y ahí parpadea cada
 * vez más rápido mientras se va. El parpadeo es lo que avisa: un suelo
 * que desaparece sin decir nada no es una traba, es una trampa. Con
 * «menos movimiento» no parpadea y solo se apaga.
 */
function opacidadDeLaPista(
  vida: number,
  aviso: number,
  reloj: number,
  movimientoReducido: boolean,
) {
  if (vida >= aviso) return 1

  const resto = vida / aviso
  if (movimientoReducido) return 0.2 + 0.8 * resto

  const prisa = 14 + (1 - resto) * 30
  const parpadeo = 0.5 + 0.5 * Math.sin(reloj * prisa)
  return 0.22 + 0.78 * resto * (0.4 + 0.6 * parpadeo)
}

/**
 * Un tramo de pista naranja de Hot Wheels.
 *
 * La pista de verdad es un canal: un piso plano por donde corre el
 * carro y dos paredes levantadas a los lados. De perfil se ven las
 * dos, la de atrás asomando por encima del canal y la de adelante
 * tapándolo, y es esa doble línea lo que la hace leerse como pista y
 * no como una tabla. Encima van las costillas del refuerzo y en las
 * puntas las lengüetas con las que se enganchan los tramos.
 *
 * Se sostiene en cañas de bambú que bajan y se pierden en lo oscuro,
 * que es el otro material del capítulo.
 */
function dibujarPistaNaranja(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  hitoAlcanzado: number,
  reloj: number,
) {
  const alto = 15
  const izq = p.x
  const der = p.x + p.ancho

  dibujarSoportesDeBambu(ctx, p, alto)

  // La pared de atrás, que asoma por encima del canal.
  ctx.fillStyle = COLOR.pistaFondo
  ctx.beginPath()
  ctx.roundRect(izq + 2, p.y - 4, p.ancho - 4, 7, 2)
  ctx.fill()

  // El canal, en sombra: es el hueco por donde correría el carro.
  ctx.fillStyle = COLOR.pistaCanal
  ctx.fillRect(izq + 3, p.y - 1, p.ancho - 6, 4)

  // La pared de adelante, que es la que ocupa casi todo.
  ctx.fillStyle = COLOR.pista
  ctx.beginPath()
  ctx.roundRect(izq, p.y + 1, p.ancho, alto - 1, 3)
  ctx.fill()

  // El filo de arriba de esa pared: la línea que se pisa. Va clara
  // para que no haya duda de dónde está el suelo.
  ctx.fillStyle = COLOR.pistaLuz
  ctx.beginPath()
  ctx.roundRect(izq, p.y + 1, p.ancho, 2.5, 1.5)
  ctx.fill()

  // Las costillas del refuerzo, por debajo.
  ctx.fillStyle = COLOR.pistaSombra
  for (let x = izq + 7; x < der - 5; x += 12) {
    ctx.fillRect(x, p.y + alto - 5, 6, 3.5)
  }
  ctx.fillRect(izq, p.y + alto - 1.5, p.ancho, 1.5)

  // Las lengüetas de enganche de las puntas, que es el detalle que
  // termina de decir «esto es un tramo de pista de juguete».
  ctx.fillStyle = COLOR.pista
  ctx.fillRect(izq - 3, p.y + 4, 3, 6)
  ctx.fillRect(der, p.y + 4, 3, 6)

  if (p.impulso) dibujarGalones(ctx, p, reloj)
  if (p.hito) dibujarEstrellaDePapel(ctx, p, hitoAlcanzado >= p.indice, reloj)
}

/**
 * Las cañas que sostienen un tramo. Bajan y se van apagando en lo
 * oscuro en vez de terminar en el aire, que es lo que hacía que la
 * pista pareciera flotar.
 */
function dibujarSoportesDeBambu(ctx: CanvasRenderingContext2D, p: Plataforma, alto: number) {
  const largo = 74
  const arriba = p.y + alto - 2

  for (const donde of [0.26, 0.74]) {
    const x = p.x + p.ancho * donde
    const desvanecido = ctx.createLinearGradient(0, arriba, 0, arriba + largo)
    desvanecido.addColorStop(0, COLOR.bambuSoporte)
    desvanecido.addColorStop(0.55, COLOR.bambuSoporte)
    desvanecido.addColorStop(1, 'rgba(37, 66, 46, 0)')

    ctx.fillStyle = desvanecido
    ctx.fillRect(x - 2.6, arriba, 5.2, largo)

    // Los nudos, que son lo que la hace caña y no palo.
    ctx.fillStyle = COLOR.bambuSoporteNudo
    for (let y = arriba + 16; y < arriba + largo * 0.7; y += 22) {
      ctx.globalAlpha = 1 - (y - arriba) / largo
      ctx.fillRect(x - 3.4, y, 6.8, 2)
    }
    ctx.globalAlpha = 1

    // La abrazadera con la que la caña agarra la pista.
    ctx.fillStyle = COLOR.pistaSombra
    ctx.fillRect(x - 4.4, arriba - 2, 8.8, 3)
  }
}

/**
 * La estrellita de papel que marca un punto de guardado.
 *
 * Es la misma que se dobla a mano y se guarda en el frasco, con sus
 * pliegues alternos oscurecidos. Va aquí y no un lazo porque el lazo
 * amarillo es de Boo y estos puntos son de los tres capítulos: la
 * estrellita ya es de ellos dos y no de ninguno de los peluches.
 *
 * Apagada hasta que la pisa, encendida y latiendo después.
 */
function dibujarEstrellaDePapel(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  ganada: boolean,
  reloj: number,
) {
  const x = p.x + p.ancho / 2
  const y = p.y - 14
  const r = 10
  const latido = ganada ? 1 + Math.sin(reloj * 2.2) * 0.07 : 1

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(latido, latido)

  if (ganada) {
    const halo = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 3)
    halo.addColorStop(0, 'rgba(248, 244, 232, 0.3)')
    halo.addColorStop(1, 'rgba(248, 244, 232, 0)')
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(0, 0, r * 3, 0, Math.PI * 2)
    ctx.fill()
  }

  // La silueta gordita de cinco puntas: el valle a poco más de la
  // mitad del radio es lo que la hace de papel doblado y no de dibujo
  // animado.
  const punta = (i: number, radio: number) => {
    const a = ((i * 36 - 90) * Math.PI) / 180
    return [Math.cos(a) * radio, Math.sin(a) * radio] as const
  }

  ctx.fillStyle = ganada ? COLOR.estrellaPapel : COLOR.estrellaPapelApagada
  ctx.beginPath()
  for (let i = 0; i < 10; i += 1) {
    const [px, py] = punta(i, i % 2 === 0 ? r : r * 0.55)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()

  // Los pliegues: uno de cada dos triángulos, sombreado.
  ctx.fillStyle = ganada ? COLOR.estrellaPliegue : COLOR.estrellaPliegueApagado
  for (let i = 0; i < 5; i += 1) {
    const [vx, vy] = punta(i * 2 + 1, r * 0.55)
    const [px, py] = punta(i * 2 + 2, r)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(vx, vy)
    ctx.lineTo(px, py)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Los galones de un tramo de impulso, corriendo hacia el lado que
 * lanza. Se mueven solos: quieta, la flecha no dice que empuja.
 */
function dibujarGalones(ctx: CanvasRenderingContext2D, p: Plataforma, reloj: number) {
  const hacia = p.impulso ?? 1
  const paso = 16
  const corrida = (reloj * 46) % paso
  const medio = p.y + 8.5

  ctx.save()
  ctx.strokeStyle = COLOR.impulso
  ctx.lineWidth = 2.4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 0; i * paso < p.ancho - 10; i += 1) {
    const avance = i * paso + corrida
    const x = hacia > 0 ? p.x + 5 + avance : p.x + p.ancho - 5 - avance
    if (x < p.x + 4 || x > p.x + p.ancho - 4) continue

    // Los de los extremos entran y salen apagándose, para que no
    // aparezcan de la nada en la orilla del tramo.
    const alOrilla = Math.min(x - p.x, p.x + p.ancho - x) / 18
    ctx.globalAlpha = Math.min(1, alOrilla) * 0.9

    ctx.beginPath()
    ctx.moveTo(x - 4 * hacia, medio - 4)
    ctx.lineTo(x, medio)
    ctx.lineTo(x - 4 * hacia, medio + 4)
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * Un carrito parqueado de adorno, del arreglo del que salió Boo.
 *
 * No hace nada y no estorba: está para que el mundo se parezca a una
 * pista de Hot Wheels de verdad y no a unas barras naranjas.
 */
function dibujarCarrito(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const largo = 22
  const izq = x - largo / 2

  ctx.save()

  // La carrocería, con el morro más bajo que la cola.
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(izq, y - 3)
  ctx.lineTo(izq + 4, y - 7)
  ctx.lineTo(izq + 13, y - 8)
  ctx.lineTo(izq + largo, y - 4)
  ctx.lineTo(izq + largo, y)
  ctx.lineTo(izq, y)
  ctx.closePath()
  ctx.fill()

  // El parabrisas.
  ctx.fillStyle = 'rgba(220, 235, 255, 0.75)'
  ctx.beginPath()
  ctx.moveTo(izq + 5.5, y - 6.6)
  ctx.lineTo(izq + 12, y - 7.4)
  ctx.lineTo(izq + 12, y - 4)
  ctx.lineTo(izq + 5, y - 4)
  ctx.closePath()
  ctx.fill()

  // Las ruedas.
  ctx.fillStyle = '#171a24'
  for (const rx of [izq + 5.5, izq + largo - 5.5]) {
    ctx.beginPath()
    ctx.arc(rx, y - 0.4, 3.2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#c9c9c9'
  for (const rx of [izq + 5.5, izq + largo - 5.5]) {
    ctx.beginPath()
    ctx.arc(rx, y - 0.4, 1.3, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Una mata de bambú: varias cañas saliendo de la misma base, de
 * distinto alto y grosor.
 *
 * Van de punta a punta del capítulo, de abajo del todo hasta arriba,
 * y por eso no se ve dónde empiezan ni dónde acaban: un bambú con las
 * dos puntas a la vista parece un palo flotando.
 */
function dibujarMata(
  ctx: CanvasRenderingContext2D,
  mata: {
    x: number
    desde: number
    hasta: number
    canas: { dx: number; grosor: number; inclinacion: number; hojaCada: number }[]
  },
  arriba: number,
  abajo: number,
) {
  ctx.save()

  for (const cana of mata.canas) {
    const base = mata.x + cana.dx
    const punta = base + cana.inclinacion

    ctx.globalAlpha = 0.38

    // La caña, apenas inclinada. Se dibuja como un trapecio para que
    // se afine hacia arriba, como el bambú de verdad.
    ctx.fillStyle = COLOR.bambu
    ctx.beginPath()
    ctx.moveTo(base - cana.grosor / 2, mata.hasta)
    ctx.lineTo(base + cana.grosor / 2, mata.hasta)
    ctx.lineTo(punta + cana.grosor * 0.32, mata.desde)
    ctx.lineTo(punta - cana.grosor * 0.32, mata.desde)
    ctx.closePath()
    ctx.fill()

    // Los nudos y las hojas, solo en el trozo que se ve.
    const paso = 46
    const primero = Math.ceil((arriba - mata.desde) / paso) * paso + mata.desde
    for (let y = Math.max(mata.desde, primero - paso); y < Math.min(mata.hasta, abajo + paso); y += paso) {
      const t = (y - mata.desde) / (mata.hasta - mata.desde)
      const x = punta + (base - punta) * t
      const grosor = cana.grosor * (0.32 + 0.68 * t)

      ctx.fillStyle = COLOR.bambuNudo
      ctx.fillRect(x - grosor / 2 - 1, y, grosor + 2, 2.2)

      if (Math.round(y / paso) % cana.hojaCada !== 0) continue

      // Las hojas salen hacia el medio del mundo, nunca hacia afuera:
      // hacia afuera se salen de la pantalla y no se ven.
      const hacia = mata.x < MUNDO.ancho / 2 ? 1 : -1
      ctx.fillStyle = COLOR.bambuHoja
      for (const [largo, caida] of [
        [23, -10],
        [16, 4],
      ] as const) {
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.quadraticCurveTo(x + hacia * largo * 0.6, y + caida - 5, x + hacia * largo, y + caida)
        ctx.quadraticCurveTo(x + hacia * largo * 0.55, y + caida + 3, x, y + 3)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  ctx.restore()
}

/**
 * Un looping de pista al fondo. Dos rieles y sus travesaños, con las
 * rampas de entrada y salida: con una sola raya parecía un aro suelto.
 */
function dibujarLooping(ctx: CanvasRenderingContext2D, l: { x: number; y: number; r: number }) {
  ctx.save()
  ctx.globalAlpha = 0.2
  ctx.strokeStyle = COLOR.pistaLuz
  ctx.lineCap = 'round'

  // Los travesaños, primero, que van por debajo de los rieles.
  ctx.lineWidth = 1.6
  for (let i = 0; i < 26; i += 1) {
    const a = (i / 26) * Math.PI * 2
    const cx = Math.cos(a)
    const cy = Math.sin(a)
    ctx.beginPath()
    ctx.moveTo(l.x + cx * (l.r - 5), l.y + cy * (l.r - 5))
    ctx.lineTo(l.x + cx * (l.r + 5), l.y + cy * (l.r + 5))
    ctx.stroke()
  }

  ctx.lineWidth = 3
  for (const radio of [l.r - 5, l.r + 5]) {
    ctx.beginPath()
    ctx.arc(l.x, l.y, radio, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Las rampas, que es lo que lo convierte en looping y no en aro.
  // Se van apagando en la punta: cortadas en seco parecían un trazo
  // olvidado a media pantalla.
  ctx.lineWidth = 4
  for (const lado of [-1, 1]) {
    const puntaX = l.x + lado * (l.r + 62)
    const rampa = ctx.createLinearGradient(puntaX, 0, l.x + lado * (l.r - 2), 0)
    rampa.addColorStop(0, 'rgba(247, 147, 64, 0)')
    rampa.addColorStop(0.45, COLOR.pistaLuz)
    rampa.addColorStop(1, COLOR.pistaLuz)
    ctx.strokeStyle = rampa

    ctx.beginPath()
    ctx.moveTo(puntaX, l.y + l.r + 26)
    ctx.quadraticCurveTo(
      l.x + lado * (l.r + 8),
      l.y + l.r + 18,
      l.x + lado * (l.r - 2),
      l.y + l.r * 0.45,
    )
    ctx.stroke()
  }

  ctx.restore()
}

/** La sombra dice dónde va a caer. Es media ayuda del juego. */
function dibujarSombra(ctx: CanvasRenderingContext2D, escena: EscenaLuna) {
  const debajo = escena.plataformas
    .filter(
      (p) =>
        (escena.vidaDeLaPista[p.indice] ?? 1) > 0 &&
        escena.x >= p.x - 4 &&
        escena.x <= p.x + p.ancho + 4 &&
        p.y >= escena.y - 1,
    )
    .sort((a, b) => a.y - b.y)[0]
  if (!debajo) return

  const caida = debajo.y - escena.y
  const cerca = Math.max(0, 1 - caida / 320)
  ctx.globalAlpha = 0.15 + cerca * 0.3
  ctx.fillStyle = COLOR.sombra
  ctx.beginPath()
  ctx.ellipse(escena.x, debajo.y + 2, 10 * (0.5 + cerca * 0.5), 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

/**
 * La barra de fuerza, pegada a ella y no en una esquina de la
 * pantalla: lo que hay que mirar es la tortuga.
 */
function dibujarBarra(ctx: CanvasRenderingContext2D, escena: EscenaLuna) {
  const ancho = 42
  const alto = 5
  const x = escena.x - ancho / 2
  // Baja con ella mientras se agacha, o queda flotando en el aire.
  const y = escena.y - TORTUGA.alto - 10 + escena.carga * 7

  ctx.fillStyle = COLOR.barraFondo
  ctx.beginPath()
  ctx.roundRect(x - 1, y - 1, ancho + 2, alto + 2, 4)
  ctx.fill()

  // Cuando se está pasando de tiempo, la barra se pone roja y
  // parpadea. El desmayo tiene que verse venir.
  const parpadeo = escena.agobio > 0 ? 0.5 + 0.5 * Math.sin(escena.reloj * 34) : 0
  ctx.fillStyle = escena.agobio > 0 && parpadeo > 0.45 ? COLOR.barraAviso : COLOR.barra
  ctx.beginPath()
  ctx.roundRect(x, y, Math.max(2, ancho * escena.carga), alto, 3)
  ctx.fill()
}

/**
 * Las estrellitas del mareo, dando vueltas sobre la cabeza. Es el
 * chiste que compensa haber perdido el salto.
 */
function dibujarEstrellitas(ctx: CanvasRenderingContext2D, escena: EscenaLuna) {
  // Le giran sobre la cabeza, esté como esté: tirada boca arriba, la
  // cabeza no está donde estaría de pie.
  const cabeza = cabezaDe(escena)
  const cx = cabeza.x
  const cy = cabeza.y - 11 * cabeza.escala
  const vuelta = escena.reloj * 4.4

  // Se asoman al principio y se van al final, para que no aparezcan
  // ni desaparezcan de golpe.
  const entrada = Math.min(1, (1 - escena.cansancio) * 6)
  const salida = Math.min(1, escena.cansancio * 5)
  ctx.globalAlpha = Math.min(entrada, salida)

  for (let i = 0; i < 3; i += 1) {
    const a = vuelta + (i / 3) * Math.PI * 2
    const x = cx + Math.cos(a) * 11 * cabeza.escala
    const y = cy + Math.sin(a) * 4 * cabeza.escala
    dibujarEstrella(ctx, x, y, (2.8 + Math.sin(a) * 0.6) * cabeza.escala)
  }
  ctx.globalAlpha = 1
}

function dibujarEstrella(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = COLOR.barra
  ctx.beginPath()
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    const radio = i % 2 === 0 ? r : r * 0.44
    const px = x + Math.cos(a) * radio
    const py = y + Math.sin(a) * radio
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

/** El fogonazo del despegue: corto, blanco y siempre, aun con menos movimiento. */
function dibujarFogonazo(ctx: CanvasRenderingContext2D, donde: { x: number; y: number }, ms: number) {
  const resto = 1 - ms / MS_FOGONAZO
  const r = 10 + (1 - resto) * 26
  const luz = ctx.createRadialGradient(donde.x, donde.y - 8, 0, donde.x, donde.y - 8, r)
  luz.addColorStop(0, `rgba(248, 244, 232, ${0.5 * resto})`)
  luz.addColorStop(1, 'rgba(248, 244, 232, 0)')
  ctx.fillStyle = luz
  ctx.beginPath()
  ctx.arc(donde.x, donde.y - 8, r, 0, Math.PI * 2)
  ctx.fill()
}

/** Polvito que se abre desde donde despegó. Sin estado: sale del reloj. */
function dibujarPolvo(ctx: CanvasRenderingContext2D, donde: { x: number; y: number }, ms: number) {
  const avance = ms / MS_FOGONAZO
  ctx.fillStyle = COLOR.estrella
  for (let i = 0; i < 5; i += 1) {
    const angulo = Math.PI + (i / 4) * Math.PI
    const d = 6 + avance * 22
    ctx.globalAlpha = 0.5 * (1 - avance)
    ctx.beginPath()
    ctx.arc(donde.x + Math.cos(angulo) * d, donde.y - 2 + Math.sin(angulo) * d * 0.4, 1.6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}
