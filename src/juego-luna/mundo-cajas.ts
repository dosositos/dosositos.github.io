import { CAJAS, MUNDO } from '@/content/luna'
import { dibujarEstrellaDePapel } from '@/juego-luna/estrella'
import type { Nivel, Plataforma } from '@/types'

/**
 * El mundo del capítulo de Ovi: el cuarto de las cajas.
 *
 * Ovi apareció en una caja de peluches viejos, así que su capítulo se
 * sube por encima de esas cajas. Cartón, cinta de embalaje, rótulos
 * que nadie volvió a leer y peluches asomando por las tapas abiertas.
 *
 * **Una plataforma no es una caja, son varias juntas.** Fue lo primero
 * que hubo que rehacer: una plataforma mide 100 de ancho y no puede
 * medir 100 de alto, así que dibujada de una sola pieza salía una
 * tabla marrón de cinco a uno, que no es la forma de ninguna caja de
 * mudanza. Partida en dos, tres o cuatro cajas de hombro con hombro,
 * cada una queda casi cuadrada y el cartón se lee de una. Y de paso
 * explica sola por qué la cosa cede: es un montón mal apilado.
 *
 * Vive en su propio archivo y no dentro de `dibujo.ts` por tamaño: la
 * pista de Boo ya llenaba ese archivo. `dibujo.ts` se queda con lo que
 * es de los tres capítulos —el cielo, la luna, la cámara, la tortuga—
 * y cada mundo trae lo suyo.
 *
 * Todo se siembra con una cuenta de semilla fija: el cuarto tiene que
 * ser el mismo en cada partida. Con `Math.random` las cajas cambiarían
 * de sitio entre un frame y el siguiente.
 *
 * **El alfa viaja como parámetro** y no como estado del canvas, que es
 * la lección que costó el desvanecimiento de la pista: un
 * `globalAlpha` puesto adentro de una función de dibujo se lleva
 * puesto todo lo que venga después.
 */

/* Cartón bajo luz de luna: cálido pero apagado, que el cielo es
   #0b1026 y un marrón de día encima sale de barro. Van tres tonos
   porque las cajas de un cuarto no son todas del mismo cartón, y con
   uno solo una fila de cuatro se leía como una pared. La cinta de
   embalaje es lo único que brilla, porque es lo único plastificado. */
const CARTON = [
  { luz: '#ac8760', cara: '#87664a', canto: '#977252', sombra: '#57422e' },
  { luz: '#9c7852', cara: '#7a5a3e', canto: '#8a6845', sombra: '#4e3a28' },
  { luz: '#8d6b48', cara: '#6b4e35', canto: '#7a5c3d', sombra: '#452f1f' },
]

const COLOR = {
  junta: '#33261a',
  hueco: '#241a11',
  golpe: '#5f4630',

  /* La cinta y los rótulos se apagaron un punto entero: puestos al
     brillo del papel de verdad, en una pantalla de noche eran lo más
     claro de todo después de la luna, y lo que hay que mirar son las
     cajas y la tortuga. */
  cinta: '#a08f6c',
  cintaBrillo: '#bfb090',

  /* La caja forrada va un punto más clara que una con su banda
     suelta: es cinta encima de cinta y tiene que leerse de lejos,
     porque es la que castiga aguantar la barra. */
  forro: '#b5a37c',
  forroBrillo: '#d6c8a4',

  etiqueta: '#b7ae9c',
  etiquetaTinta: '#5d5445',

  /* Las torres del fondo van casi de silueta y tirando al violeta de
     la noche: son cartón, pero cartón a diez metros y sin luz. Y van
     bien apagadas: al primer intento se leían como una pared de
     ladrillos a los dos lados de la pantalla y le comían el sitio a
     lo que hay que mirar. */
  torreLejos: '#221c2c',
  torreCerca: '#2e2739',
  torreCanto: '#3a3147',
  torreJunta: '#191521',

  /* El polvo del cuarto, flotando en la luz. Lleva el rosa de Ovi
     porque es su capítulo y porque un cuarto cerrado sí tiene el aire
     de un color. */
  polvo: '#f8f4e8',
  polvoOvi: '#f4b6c9',
}

/* Los peluches viejos que asoman por las tapas: uno rosa como Ovi,
   uno de felpa crema y uno gris. Descoloridos, que llevan años ahí. */
const COLORES_DE_PELUCHE = [
  { pelo: '#e3a9bb', oreja: '#c2879a' },
  { pelo: '#d6c7ab', oreja: '#b3a58c' },
  { pelo: '#b1aabb', oreja: '#8f8899' },
]

/** El alto de la caja más baja de una fila. Las demás bajan más. */
const ALTO_MINIMO = 24

/** Lo ancha que quiere ser una caja. La fila se parte por aquí. */
const ANCHO_DE_UNA_CAJA = 48

/** Cuánto se hunde una caja de peluches en el golpe del rebote. */
const HUNDIDO = 10

/** Lo que dura ese hundido, en milisegundos. */
const MS_DEL_HUNDIDO = 340

/**
 * Cuánto está aplastada una caja de peluches ahora mismo, de 1 (justo
 * en el golpe) a 0 (ya se estiró).
 *
 * No es una bajada recta: se hunde de golpe y vuelve pasándose, como
 * algo blando de verdad. Sale de una cuenta y no de un estado
 * guardado, así que se dibuja igual aunque la pestaña haya estado
 * dormida.
 */
export function loAplastada(ms: number) {
  if (ms >= MS_DEL_HUNDIDO) return 0
  const t = ms / MS_DEL_HUNDIDO
  return (1 - t) * Math.cos(t * Math.PI * 2.4)
}

/* ── Lo que se siembra una sola vez ──────────────────────────────── */

interface Pieza {
  /** Desde la izquierda de la plataforma. */
  dx: number
  ancho: number
  /** Lo que baja desde la línea que se pisa. Todas empiezan arriba. */
  alto: number
  /** Cuál de los tres cartones. */
  tono: number
  /** La tapa abierta, con un peluche asomando. */
  abierta: boolean
  cualPeluche: number
  /** Por dónde le baja la cinta, de 0 a 1, o nada. */
  cinta: number | null
  /** Envuelta entera en cinta: es la caja que no agarra. */
  forrada: boolean
  etiqueta: { dx: number; renglones: number } | null
  /** Una esquina golpeada: 0 ninguna, 1 la izquierda, 2 la derecha. */
  golpe: 0 | 1 | 2
}

export interface Caja {
  piezas: Pieza[]
  /** Una caja más chica apoyada encima, hacia una punta. */
  encima: { dx: number; ancho: number; alto: number; tono: number; conCinta: boolean } | null
  /**
   * Las cajas de abajo, las que sostienen. Bajan y se pierden en lo
   * oscuro en vez de terminar en el aire: es lo mismo que hacen las
   * cañas de bambú debajo de la pista de Boo, y por el mismo motivo.
   * Sin ellas la fila entera se lee como un estante flotando.
   */
  debajo: { dx: number; ancho: number }[]
}

/**
 * De qué cajas está hecha cada plataforma del capítulo, y qué lleva
 * cada una: la cinta, el rótulo, el golpe y lo que asoma.
 *
 * Se reparte con la cuenta y no a mano porque son treinta y dos
 * plataformas de dos a cuatro cajas cada una, y ninguna de estas
 * decisiones cambia cómo se juega. Lo único que sí se decide es que
 * **las estrellas van cerradas y sin nada encima**: la plataforma
 * donde se guarda tiene que leerse limpia de un vistazo.
 */
export function sembrarCajas(nivel: Nivel) {
  const cajas = new Map<number, Caja>()

  let semilla = 20240418
  const siguiente = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }

  for (const p of nivel.plataformas) {
    const limpia = Boolean(p.hito)

    // Las dos cajas que hacen algo tienen que leerse de lejos y de un
    // vistazo, así que no se les reparte nada al azar: la forrada va
    // envuelta entera y sin rótulos, y la de peluches va abierta de
    // punta a punta y rebosando. Una caja normal, en cambio, lleva
    // como mucho una banda de cinta y una tapa abierta.
    const forrada = Boolean(p.resbala)
    const rebosando = Boolean(p.rebote)

    const cuantas = Math.max(2, Math.round(p.ancho / ANCHO_DE_UNA_CAJA))
    const anchoDeCada = p.ancho / cuantas

    // Una caja de cada cuatro está abierta, y como mucho una por
    // plataforma. Más que eso y dejan de ser una sorpresa para ser el
    // decorado.
    const cualAbierta =
      limpia || forrada || rebosando || siguiente() > 0.24
        ? -1
        : Math.floor(siguiente() * cuantas)

    const piezas: Pieza[] = []
    for (let i = 0; i < cuantas; i += 1) {
      piezas.push({
        dx: i * anchoDeCada,
        ancho: anchoDeCada,
        // Todas arrancan en la línea que se pisa y bajan lo suyo: es
        // lo que hace que la fila se lea como cajas de tamaños
        // distintos y no como un listón partido con rayas.
        alto: ALTO_MINIMO + Math.round(siguiente() * 12),
        tono: Math.floor(siguiente() * CARTON.length),
        abierta: rebosando || i === cualAbierta,
        cualPeluche: Math.floor(siguiente() * COLORES_DE_PELUCHE.length),
        cinta: forrada || rebosando ? null : siguiente() < 0.55 ? 0.28 + siguiente() * 0.44 : null,
        forrada,
        etiqueta:
          !forrada && !rebosando && siguiente() < 0.34
            ? { dx: 0.15 + siguiente() * 0.5, renglones: siguiente() < 0.5 ? 2 : 3 }
            : null,
        golpe: (siguiente() < 0.3 ? 1 + Math.floor(siguiente() * 2) : 0) as 0 | 1 | 2,
      })
    }

    const anchoDeEncima = Math.min(p.ancho * 0.4, 30 + siguiente() * 14)

    // Dos cajas de abajo, más estrechas que la fila y corridas hacia
    // dentro, para que se lea que la fila apoya en algo y que ese algo
    // sigue bajando.
    const debajo = [0, 1].map((i) => {
      const ancho = p.ancho * (0.26 + siguiente() * 0.16)
      const desde = i === 0 ? p.ancho * 0.08 : p.ancho * 0.52
      return { dx: desde + siguiente() * p.ancho * 0.08, ancho }
    })

    cajas.set(p.indice, {
      piezas,
      debajo,
      encima:
        limpia || forrada || rebosando || cualAbierta >= 0 || siguiente() > 0.4
          ? null
          : {
              // Hacia una punta y nunca en el medio, que es por donde
              // camina: una caja plantada en la mitad del camino se
              // lee como un obstáculo, y no lo es.
              dx: siguiente() < 0.5 ? 6 : p.ancho - anchoDeEncima - 6,
              ancho: anchoDeEncima,
              alto: 16 + Math.round(siguiente() * 8),
              tono: Math.floor(siguiente() * CARTON.length),
              conCinta: siguiente() < 0.6,
            },
    })
  }

  return cajas
}

interface CajaDeTorre {
  y: number
  alto: number
  ancho: number
  dx: number
}

export interface Torre {
  x: number
  /** 0 la de más atrás, 1 la de más adelante. Decide color y nitidez. */
  profundidad: number
  cajas: CajaDeTorre[]
}

/**
 * Las torres de cajas del fondo, apiladas contra las dos paredes del
 * cuarto y de punta a punta del capítulo.
 *
 * Son el equivalente del bambú de Boo y cumplen lo mismo: decir de qué
 * mundo hablamos cuando en pantalla no queda más que cielo. Empiezan
 * más abajo del suelo y terminan más arriba de la cima, así que no se
 * les ve ni el principio ni el final — una torre con las dos puntas a
 * la vista se lee como un montoncito y no como un cuarto lleno.
 */
export function sembrarTorres(desde: number, hasta: number): Torre[] {
  const torres: Torre[] = []

  let semilla = 20260824
  const siguiente = () => {
    semilla = (semilla * 1103515245 + 12345) % 2147483648
    return semilla / 2147483648
  }

  for (const orilla of [0, 1]) {
    // Hacia el medio de la pantalla, como las matas de bambú: la de la
    // derecha es la de la izquierda en espejo, con la torre nítida por
    // dentro y las apagadas contra el borde.
    const haciaAdentro = orilla === 0 ? 1 : -1

    for (let t = 0; t < 2; t += 1) {
      const profundidad = t
      const ancho = 30 + profundidad * 14
      const base = orilla === 0 ? -9 + profundidad * 13 : MUNDO.ancho - ancho + 9 - profundidad * 13

      // Se apilan de abajo hacia arriba hasta pasarse del techo. Cada
      // caja con su alto y corrida un poco: una torre a plomo parece
      // una pared, y estas son cajas que alguien apiló a la carrera.
      const cajas: CajaDeTorre[] = []
      let y = hasta
      while (y > desde) {
        const alto = 30 + Math.round(siguiente() * 26)
        y -= alto
        cajas.push({
          y,
          alto,
          ancho: ancho - Math.round(siguiente() * 14),
          dx: Math.round((siguiente() - 0.5) * 14) * haciaAdentro,
        })
      }

      torres.push({ x: base, profundidad, cajas })
    }
  }

  return torres
}

export interface Mota {
  x: number
  /** Su sitio en el ciclo de subida, de 0 a 1. */
  fase: number
  r: number
  /** Ciclos por segundo. Lentísimos: es polvo, no nieve. */
  velocidad: number
  brillo: number
  /** Una de cada tantas lleva el rosa de Ovi. */
  deOvi: boolean
}

/**
 * El polvo del cuarto, flotando.
 *
 * Es lo que hace que el mundo respire cuando la tortuga está quieta,
 * igual que los carros de las vías en el capítulo de Boo. Sube
 * despacísimo y vuelve a entrar por abajo, así que no se acaba nunca y
 * no hay que guardar nada entre frames: dónde está cada mota sale del
 * reloj y de un resto de división.
 */
export function sembrarPolvo(cuantas: number): Mota[] {
  const motas: Mota[] = []

  let semilla = 20250104
  const siguiente = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }

  for (let i = 0; i < cuantas; i += 1) {
    motas.push({
      x: siguiente() * MUNDO.ancho,
      fase: siguiente(),
      r: 1.4 + siguiente() * 2.2,
      velocidad: 0.012 + siguiente() * 0.02,
      brillo: 0.12 + siguiente() * 0.2,
      deOvi: siguiente() < 0.35,
    })
  }

  return motas
}

/* ── Y lo que se dibuja cada frame ───────────────────────────────── */

/** Cada cuántos píxeles de mundo se repite el patrón del polvo. */
const CICLO_DEL_POLVO = 700

export function dibujarPolvo(
  ctx: CanvasRenderingContext2D,
  motas: Mota[],
  arriba: number,
  abajo: number,
  reloj: number,
) {
  ctx.save()

  for (const mota of motas) {
    // El patrón se repite cada `CICLO_DEL_POLVO` y va subiendo entero
    // con el reloj. Se dibujan las copias que caigan en pantalla, que
    // son una o dos: así el polvo es infinito y no cuesta memoria.
    const subido = ((mota.fase + reloj * mota.velocidad) % 1) * CICLO_DEL_POLVO
    const primera = Math.ceil((arriba - 4 + subido) / CICLO_DEL_POLVO) * CICLO_DEL_POLVO - subido

    // Se mece de lado mientras sube, que es lo que separa una mota de
    // polvo de un puntito subiendo en línea recta.
    const x = mota.x + Math.sin(reloj * 0.5 + mota.fase * 9) * 5
    const brillo = mota.brillo * (0.55 + 0.45 * Math.sin(reloj * 1.1 + mota.fase * 12))
    ctx.fillStyle = mota.deOvi ? COLOR.polvoOvi : COLOR.polvo

    for (let y = primera; y <= abajo + 4; y += CICLO_DEL_POLVO) {
      // Dos círculos, uno gordo y casi transparente y otro chico
      // adentro: cuesta dos trazos y con eso la mota queda difusa, que
      // es lo que la separa de una estrella. Con un solo círculo
      // nítido, el cuarto se llenaba de estrellas de más.
      ctx.globalAlpha = brillo * 0.35
      ctx.beginPath()
      ctx.arc(x, y, mota.r, 0, Math.PI * 2)
      ctx.fill()

      ctx.globalAlpha = brillo
      ctx.beginPath()
      ctx.arc(x, y, mota.r * 0.42, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.restore()
}

export function dibujarTorre(
  ctx: CanvasRenderingContext2D,
  torre: Torre,
  arriba: number,
  abajo: number,
) {
  const cuerpo = torre.profundidad > 0 ? COLOR.torreCerca : COLOR.torreLejos

  ctx.save()
  ctx.globalAlpha = 0.4 + torre.profundidad * 0.2

  for (const caja of torre.cajas) {
    if (caja.y + caja.alto < arriba || caja.y > abajo) continue

    const x = torre.x + caja.dx

    ctx.fillStyle = cuerpo
    ctx.beginPath()
    ctx.roundRect(x, caja.y, caja.ancho, caja.alto, 2)
    ctx.fill()

    // El canto de la tapa, que es lo único que separa una caja de la
    // de abajo cuando todo es silueta.
    ctx.fillStyle = COLOR.torreCanto
    ctx.fillRect(x, caja.y, caja.ancho, 2.4)

    // Y la junta de las solapas, una raya vertical corta en el medio.
    ctx.fillStyle = COLOR.torreJunta
    ctx.fillRect(x + caja.ancho / 2 - 0.5, caja.y + 2.4, 1, Math.min(9, caja.alto - 2.4))
  }

  ctx.restore()
}

/**
 * Una plataforma del capítulo de Ovi: la fila de cajas que se pisa.
 *
 * Se dibuja rotada sobre su punto medio, que es donde pivota el
 * balancín: la misma cuenta que `alturaDeLaCaja` hace para el motor,
 * pero con la matriz del canvas para que se inclinen también las
 * líneas de adentro. Moviendo solo el filo, la fila se leería como una
 * tabla doblada.
 */
export function dibujarPilaDeCajas(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  caja: Caja,
  inclinacion: number,
  hitoAlcanzado: number,
  reloj: number,
  alfa: number,
  /** Cuánto lleva aplastada de un rebote, de 1 (recién) a 0. */
  aplaste = 0,
) {
  const medio = p.x + p.ancho / 2
  const angulo = Math.atan2(inclinacion * CAJAS.cede, p.ancho / 2)

  ctx.save()
  ctx.translate(medio, p.y)
  ctx.rotate(angulo)
  // El hundido del rebote: la caja se traga el golpe y vuelve. Se
  // mueve solo el dibujo, no el suelo, y no se nota porque mientras
  // dura la tortuga va por el aire.
  ctx.translate(-medio, -p.y + aplaste * HUNDIDO)

  dibujarLasDeAbajo(ctx, p, caja, alfa)
  if (caja.encima) dibujarCajaDeEncima(ctx, p, caja.encima, inclinacion, alfa)

  // Los peluches primero, todos: van detrás del cartón y tienen que
  // asomar por encima del filo, no delante de él.
  for (const pieza of caja.piezas) {
    if (pieza.abierta) dibujarPelucheAsomando(ctx, p, pieza, reloj, alfa, p.rebote === true, aplaste)
  }

  for (const pieza of caja.piezas) dibujarUnaCaja(ctx, p, pieza, alfa)

  ctx.restore()

  // La estrella va fuera de la rotación a propósito: es de papel y
  // está flotando, no pegada a la caja. Y donde hay estrella nada
  // cede, así que el ángulo es cero de todas formas.
  if (p.hito) dibujarEstrellaDePapel(ctx, p, hitoAlcanzado >= p.indice, reloj)
}

/**
 * Las cajas de abajo, las que sostienen la fila.
 *
 * Bajan desde la base y se van apagando en lo oscuro en vez de
 * terminar en el aire, que es lo que hacía que la fila pareciera
 * flotar. Van más apagadas que las torres del fondo porque están en
 * la sombra de la plataforma, igual que los soportes de bambú de Boo.
 */
function dibujarLasDeAbajo(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  caja: Caja,
  alfa: number,
) {
  // El alto de la fila es el de su caja más baja: por debajo de ahí ya
  // no hay cartón dibujado y es donde tienen que empezar estas.
  const arriba = p.y + Math.min(...caja.piezas.map((z) => z.alto)) - 3
  const largo = 34

  const desvanecido = ctx.createLinearGradient(0, arriba, 0, arriba + largo)
  desvanecido.addColorStop(0, '#4a3625')
  desvanecido.addColorStop(0.35, '#3b2b1d')
  desvanecido.addColorStop(1, 'rgba(59, 43, 29, 0)')

  ctx.globalAlpha = alfa * 0.9
  for (const soporte of caja.debajo) {
    const x = p.x + soporte.dx
    ctx.fillStyle = desvanecido
    ctx.fillRect(x, arriba, soporte.ancho, largo)

    // Un canto, uno solo: en treinta píxeles más de uno es ruido, y
    // es lo que dice que ahí abajo también hay cajas.
    ctx.fillStyle = 'rgba(122, 92, 61, 0.5)'
    ctx.fillRect(x, arriba + 15, soporte.ancho, 1.6)
  }

  ctx.globalAlpha = alfa
}

/** Una caja de la fila, con todo lo suyo. */
function dibujarUnaCaja(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  pieza: Pieza,
  alfa: number,
) {
  const carton = CARTON[pieza.tono % CARTON.length]
  const izq = p.x + pieza.dx
  const der = izq + pieza.ancho
  const abajo = p.y + pieza.alto

  // La cara, con la luz cayendo de arriba. El degradado es lo que la
  // saca de ser un rectángulo marrón.
  const cara = ctx.createLinearGradient(0, p.y, 0, abajo)
  cara.addColorStop(0, carton.luz)
  cara.addColorStop(0.3, carton.cara)
  cara.addColorStop(1, carton.sombra)

  ctx.globalAlpha = alfa
  ctx.fillStyle = cara
  ctx.beginPath()
  ctx.roundRect(izq, p.y, pieza.ancho, pieza.alto, 2)
  ctx.fill()

  if (pieza.abierta) dibujarSolapasAbiertas(ctx, p, pieza, carton, alfa)
  else dibujarTapaCerrada(ctx, p, pieza, carton, alfa)

  // La caja forrada: envuelta entera en cinta, de arriba abajo y de
  // punta a punta. Es la que no agarra, y tiene que decirlo de lejos.
  if (pieza.forrada) dibujarForro(ctx, p, pieza, alfa)

  // La acanaladura del filo: el cartón corrugado visto de canto. Son
  // unos puntitos de un píxel y es lo que convierte el material en
  // cartón; sin esto podría ser madera o plástico.
  ctx.globalAlpha = alfa * 0.5
  ctx.fillStyle = carton.sombra
  for (let x = izq + 4; x < der - 3; x += 3.2) {
    ctx.fillRect(x, p.y + 3.6, 1.2, 1.1)
  }

  // La cinta que baja por la cara, cerrando la junta de las solapas.
  // En la forrada no: allí la cinta es el forro entero.
  if (pieza.cinta !== null && !pieza.forrada) {
    const cintaX = izq + pieza.ancho * pieza.cinta
    ctx.globalAlpha = alfa * 0.6
    ctx.fillStyle = COLOR.cinta
    ctx.fillRect(cintaX - 3, p.y + 2, 6, pieza.alto - 3)
    ctx.fillStyle = COLOR.cintaBrillo
    ctx.fillRect(cintaX - 3, p.y + 2, 1.3, pieza.alto - 3)
  }

  if (pieza.etiqueta) dibujarEtiqueta(ctx, p, pieza, alfa)

  // La esquina golpeada, que es lo que las hace viejas y no recién
  // compradas. Una raya doblada y nada más.
  if (pieza.golpe > 0) {
    const x = pieza.golpe === 1 ? izq + 5 : der - 5
    const hacia = pieza.golpe === 1 ? 1 : -1
    ctx.globalAlpha = alfa * 0.8
    ctx.strokeStyle = COLOR.golpe
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(x, abajo - 2)
    ctx.lineTo(x + hacia * 5, abajo - 8)
    ctx.lineTo(x + hacia * 3, abajo - 14)
    ctx.stroke()
  }

  // La junta con la caja de al lado, y la sombra de la base: apoya en
  // algo y toca a alguien, no flota sola.
  ctx.globalAlpha = alfa * 0.75
  ctx.fillStyle = COLOR.junta
  ctx.fillRect(der - 0.9, p.y + 1, 0.9, pieza.alto - 1)
  ctx.fillRect(izq + 1, abajo - 1.6, pieza.ancho - 2, 1.6)

  ctx.globalAlpha = alfa
}

/**
 * La tapa cerrada: el canto de las solapas y la cinta que las sella,
 * corriendo a lo largo del filo que se pisa.
 */
function dibujarTapaCerrada(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  pieza: Pieza,
  carton: (typeof CARTON)[number],
  alfa: number,
) {
  const izq = p.x + pieza.dx

  // El canto, que es la línea que se pisa. Va claro para que no haya
  // duda de dónde está el suelo, igual que el filo de la pista.
  ctx.globalAlpha = alfa
  ctx.fillStyle = carton.canto
  ctx.beginPath()
  ctx.roundRect(izq, p.y, pieza.ancho, 3.6, 1.5)
  ctx.fill()

  // La cinta de sellar, encima del canto y algo más ancha, con su
  // brillo arriba. Es lo único plastificado del mundo de Ovi.
  ctx.globalAlpha = alfa * 0.62
  ctx.fillStyle = COLOR.cinta
  ctx.fillRect(izq + 1.5, p.y - 1.4, pieza.ancho - 3, 2.8)
  ctx.fillStyle = COLOR.cintaBrillo
  ctx.fillRect(izq + 1.5, p.y - 1.4, pieza.ancho - 3, 0.8)

  // Y la junta de las dos solapas, que asoma por debajo de la cinta.
  ctx.globalAlpha = alfa
  ctx.fillStyle = carton.sombra
  ctx.fillRect(izq + pieza.ancho / 2 - 0.5, p.y + 2.2, 1, 2.6)
}

/**
 * El forro de cinta: la caja envuelta entera, que es la que no agarra.
 *
 * Va con bandas de arriba abajo bien juntas y una vuelta a lo largo
 * del filo, todas con su brillo. Es lo único liso del capítulo, y
 * tiene que verse liso: si esta caja no se distingue de una normal a
 * la primera ojeada, resbalarse encima se lee como que el juego falló.
 */
function dibujarForro(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  pieza: Pieza,
  alfa: number,
) {
  const izq = p.x + pieza.dx
  const der = izq + pieza.ancho

  // Las vueltas de arriba abajo. Van separadas y no pegadas: al
  // primer intento iban cada once píxeles y la caja se leía como una
  // reja, no como algo envuelto.
  ctx.globalAlpha = alfa * 0.7
  for (let x = izq + 5; x < der - 8; x += 16) {
    ctx.fillStyle = COLOR.forro
    ctx.fillRect(x, p.y + 1.5, 8, pieza.alto - 2.5)
    ctx.fillStyle = COLOR.forroBrillo
    ctx.fillRect(x, p.y + 1.5, 1.6, pieza.alto - 2.5)
  }

  // Y las dos vueltas de lado a lado: una por el filo, que es por
  // donde ella pisa, y otra a media altura. Cruzadas con las de
  // arriba abajo es como se envuelve una caja de verdad.
  ctx.globalAlpha = alfa * 0.82
  for (const y of [p.y - 0.6, p.y + pieza.alto * 0.48]) {
    ctx.fillStyle = COLOR.forro
    ctx.fillRect(izq, y, pieza.ancho, 4.4)
    ctx.fillStyle = COLOR.forroBrillo
    ctx.fillRect(izq, y, pieza.ancho, 1.2)
  }

  ctx.globalAlpha = alfa
}

/**
 * Las solapas abiertas de una caja que alguien dejó destapada, con el
 * hueco en sombra por donde asoma el peluche.
 */
function dibujarSolapasAbiertas(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  pieza: Pieza,
  carton: (typeof CARTON)[number],
  alfa: number,
) {
  const izq = p.x + pieza.dx
  const der = izq + pieza.ancho
  const centro = izq + pieza.ancho / 2
  const hueco = pieza.ancho * 0.56

  ctx.globalAlpha = alfa

  // El hueco: una franja oscura bajo el filo, solo en el trozo abierto.
  ctx.fillStyle = COLOR.hueco
  ctx.beginPath()
  ctx.roundRect(centro - hueco / 2, p.y, hueco, 5, 1)
  ctx.fill()

  // Las dos solapas, caídas hacia afuera. Son trapecios cortos: una
  // solapa levantada del todo taparía media pantalla, y esto es
  // decorado y no un obstáculo.
  ctx.fillStyle = carton.canto
  for (const hacia of [-1, 1]) {
    const raiz = centro + (hacia * hueco) / 2
    const punta = raiz + hacia * 9
    ctx.beginPath()
    ctx.moveTo(raiz, p.y + 0.5)
    ctx.lineTo(punta, p.y - 4.5)
    ctx.lineTo(punta + hacia * 1.6, p.y - 3)
    ctx.lineTo(raiz, p.y + 3.6)
    ctx.closePath()
    ctx.fill()
  }

  // El resto del filo sigue siendo canto, que es lo que se pisa.
  ctx.fillRect(izq, p.y, Math.max(0, centro - hueco / 2 - izq), 3.6)
  ctx.fillRect(centro + hueco / 2, p.y, Math.max(0, der - (centro + hueco / 2)), 3.6)
}

/**
 * El peluche viejo que asoma por la tapa abierta.
 *
 * Es el corazón del capítulo: de una caja así salió Ovi. Se le ve la
 * cabeza con dos orejas y dos ojitos de botón, y nada más — al tamaño
 * al que se ve en el teléfono, una cara entera se vuelve una mancha.
 */
function dibujarPelucheAsomando(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  pieza: Pieza,
  reloj: number,
  alfa: number,
  /** En la caja que rebota asoman de cuerpo entero, no de media cara. */
  rebosando = false,
  aplaste = 0,
) {
  const color = COLORES_DE_PELUCHE[pieza.cualPeluche % COLORES_DE_PELUCHE.length]
  const x = p.x + pieza.dx + pieza.ancho / 2
  // Se mece apenas, muy despacio y desfasado de caja en caja. Quieto
  // del todo parece pegado; a esta velocidad parece que respira.
  const meneo = Math.sin(reloj * 0.7 + pieza.dx * 0.13) * 1.1

  // En la caja que rebota cada uno asoma lo suyo y es de su tamaño:
  // todos iguales y a la misma altura se leían como una fila de
  // sellos pegados, y lo que tiene que verse es un montón.
  const suyo = Math.sin(pieza.dx * 0.41 + 1.7)
  const asoma = rebosando ? 13 + suyo * 5 : 9
  const tamano = rebosando ? 1 + suyo * 0.16 : 1
  const y = p.y - asoma + meneo * 0.4

  ctx.save()
  ctx.globalAlpha = alfa
  ctx.translate(x + meneo, y)
  ctx.rotate(meneo * 0.035 + (rebosando ? suyo * 0.14 : 0))
  ctx.scale(tamano, tamano)
  // En el golpe del rebote se achatan y se ensanchan, que es lo que
  // hace que la caja se lea como blanda y no como un trampolín.
  if (aplaste !== 0) ctx.scale(1 + aplaste * 0.18, 1 - aplaste * 0.32)

  // Las orejas primero, que van detrás de la cabeza.
  ctx.fillStyle = color.oreja
  for (const lado of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(lado * 7, -4.6, 4.4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = color.pelo
  ctx.beginPath()
  ctx.arc(0, 0, 9, 0, Math.PI * 2)
  ctx.fill()

  // A los de la caja que rebota se les ven también los bracitos
  // abiertos por encima del borde, apretados unos contra otros.
  if (rebosando) {
    ctx.fillStyle = color.oreja
    for (const lado of [-1, 1]) {
      ctx.beginPath()
      ctx.ellipse(lado * 9.5, 6, 3.4, 4.6, lado * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Dos ojitos de botón y el hocico. Tres puntos, y ya hay peluche.
  ctx.fillStyle = COLOR.hueco
  for (const lado of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(lado * 3.3, -1, 1.4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.beginPath()
  ctx.ellipse(0, 2.8, 2.2, 1.6, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/** La caja chiquita apoyada encima, hacia una punta. */
function dibujarCajaDeEncima(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  encima: NonNullable<Caja['encima']>,
  inclinacion: number,
  alfa: number,
) {
  const carton = CARTON[encima.tono % CARTON.length]
  // Se desliza hacia el lado que baja. Son tres píxeles, pero es lo
  // que hace que la pila se lea como algo que se está moviendo y no
  // como un dibujo torcido.
  const izq = p.x + encima.dx + inclinacion * 3
  const y = p.y - encima.alto

  const cara = ctx.createLinearGradient(0, y, 0, y + encima.alto)
  cara.addColorStop(0, carton.cara)
  cara.addColorStop(1, carton.sombra)

  ctx.globalAlpha = alfa
  ctx.fillStyle = cara
  ctx.beginPath()
  ctx.roundRect(izq, y, encima.ancho, encima.alto, 2)
  ctx.fill()

  ctx.fillStyle = carton.canto
  ctx.fillRect(izq, y, encima.ancho, 2.6)

  if (encima.conCinta) {
    ctx.globalAlpha = alfa * 0.7
    ctx.fillStyle = COLOR.cinta
    ctx.fillRect(izq + encima.ancho * 0.42, y + 1.5, 6, encima.alto - 1.5)
  }

  // La sombra que tira sobre las cajas de abajo.
  ctx.globalAlpha = alfa * 0.4
  ctx.fillStyle = COLOR.hueco
  ctx.fillRect(izq, p.y, encima.ancho, 2.6)

  ctx.globalAlpha = alfa
}

/** Un rótulo escrito a mano, de los que nadie vuelve a leer. */
function dibujarEtiqueta(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  pieza: Pieza,
  alfa: number,
) {
  const etiqueta = pieza.etiqueta
  if (!etiqueta) return

  const ancho = Math.min(18, pieza.ancho - 12)
  const alto = etiqueta.renglones === 2 ? 8 : 11
  const x = p.x + pieza.dx + (pieza.ancho - ancho) * etiqueta.dx
  const y = p.y + Math.min(9, pieza.alto - alto - 4)

  ctx.globalAlpha = alfa * 0.7
  ctx.fillStyle = COLOR.etiqueta
  ctx.beginPath()
  ctx.roundRect(x, y, ancho, alto, 1)
  ctx.fill()

  // Los renglones son rayas y no letras: a este tamaño una palabra de
  // verdad sale ilegible, y una raya sí se lee como «algo escrito».
  ctx.globalAlpha = alfa
  ctx.fillStyle = COLOR.etiquetaTinta
  for (let i = 0; i < etiqueta.renglones; i += 1) {
    const largo = ancho - 6 - (i % 2) * 5
    ctx.fillRect(x + 3, y + 2.8 + i * 3.2, Math.max(3, largo), 1)
  }
}
