import { ALMOHADAS, MUNDO, TORTUGA } from '@/content/luna'
import { dibujarEstrellaDePapel } from '@/juego-luna/estrella'
import type { Nivel, Plataforma } from '@/types'

/**
 * El mundo del capítulo de Nico: la cama a las cuatro de la mañana.
 *
 * Nico durmió con ella desde antes que ninguno, así que su capítulo se
 * sube por la cama deshecha: el colchón, las almohadas amontonadas, las
 * cobijas enredadas y las sábanas colgando hacia lo oscuro. Y las
 * cortinas del cuarto a los dos lados, que es lo único que se mueve.
 *
 * **Una plataforma no es una almohada, son varias.** Es la misma
 * lección que dejó el cuarto de Ovi: una plataforma mide de 100 a 155
 * de ancho y no puede medir 20 de alto, así que dibujada de una pieza
 * salía un colchoncito de siete a uno que no es la forma de ninguna
 * almohada. Partida en dos o tres, hombro con hombro y cada una con su
 * grosor, se lee de una que es un montón de almohadas mal puestas — que
 * es justo lo que explica que la cosa se hunda.
 *
 * **La cobija no se parte.** Una cobija enredada es un solo bulto, y
 * eso además la separa más todavía de una almohada de un vistazo: las
 * almohadas ahora tienen juntas verticales y ella no. La cobija hay que
 * reconocerla antes de pisarla, porque lo que cambia encima de ella es
 * el ritmo de la barra y eso no se ve hasta que ya se está cargando.
 *
 * Todo se siembra con una cuenta de semilla fija: el cuarto tiene que
 * ser el mismo en cada partida. Con `Math.random` las almohadas
 * cambiarían de forma entre un frame y el siguiente.
 *
 * El **alfa viaja como parámetro** y no como estado del canvas, igual
 * que en los otros dos mundos. Es la lección del desvanecimiento de la
 * pista: un `globalAlpha` puesto adentro de una función de dibujo se
 * lleva puesto todo lo que venga después.
 */

/* Tela de noche: el lila apagado de una funda de almohada con la luna
   entrando por la ventana. Va oscuro a propósito — lo blanco pesa, y
   una almohada pintada al brillo del algodón de verdad sería lo más
   claro de la pantalla después de la luna.

   Van tres fundas y no una porque las almohadas de una cama no son
   todas iguales, y con un solo tono una fila de tres se leía como un
   listón partido con rayas. Es lo mismo que les pasó a los cartones
   del cuarto de Ovi. */
const FUNDA = [
  { luz: '#7b7290', cara: '#5d5570', sombra: '#3d3750', fondo: '#4a4359' },
  { luz: '#726b88', cara: '#564f68', sombra: '#383249', fondo: '#453f53' },
  { luz: '#847a97', cara: '#655c78', sombra: '#433c55', fondo: '#4f4860' },
]

const COLOR = {
  costura: '#8d84a4',
  junta: '#2c2739',

  /* El colchón de la primera plataforma, que es la salida y es la
     cama. Más apagado que las almohadas: es lo que está debajo de
     todo y no es a donde hay que mirar. */
  colchon: '#4a4459',
  colchonLuz: '#635b78',
  colchonSombra: '#332e42',

  /* Las sábanas que cuelgan debajo de cada almohada, y los pliegues
     largos que cruzan el fondo. Son lo mismo hecho de dos maneras:
     tela revuelta que sigue más allá de donde se ve. */
  sabana: '#4c465e',
  sabanaSombra: '#332e42',
  sabanaLuz: '#6d6486',

  /* Las cortinas de los dos lados, casi siluetas y tirando al violeta
     de la noche. Van bien apagadas: al primer intento eran dos muros
     lilas comiéndose los bordes de la pantalla, que es exactamente lo
     que les pasó a las torres del cuarto de Ovi. */
  cortinaLejos: '#211b2d',
  cortinaCerca: '#2d2639',
  cortinaFilo: '#453c56',

  /* El hoyo que dejan las paticas donde está parada. Es sombra, no
     tela: la almohada se hunde entera y pareja, y el hoyo es dibujo. */
  hoyo: '#2a2536',

  /* La luz de la madrugada, que baja de la luna y se va poniendo más
     fuerte cuanto más arriba. El rosa pálido es el de Nico
     (`--color-nico` en index.css), que es su capítulo. */
  madrugada: '#fbe1e6',
}

/* La cobija enredada: lana en la penumbra, más caliente y más pesada
   que la funda de la almohada. Se separa de la almohada **por el
   color antes que por la forma**, que a mitad de un salto no hay
   tiempo de contarle los pliegues a nada. */
const COLOR_COBIJA = {
  tela: '#6b5560',
  telaLuz: '#8a7280',
  telaSombra: '#463a45',
  costura: '#a08a97',
  fondo: '#544453',
}

/** Lo que mide de alto una almohada entera, sin peso encima. */
const ALTO = 20

/** Y lo que le queda de alto tirada en el fondo, ya aplastada. */
const ALTO_HUNDIDA = 11

/** Lo ancha que quiere ser una almohada. La fila se parte por aquí. */
const ANCHO_DE_UNA_ALMOHADA = 62

/** El hueco entre dos almohadas de la misma fila. */
const JUNTA = 2

/** El alto del colchón de la primera plataforma, que es la cama. */
const ALTO_DEL_COLCHON = 30

/* ── Lo que se siembra una sola vez ──────────────────────────────── */

interface Pieza {
  /** Desde la izquierda de la plataforma. */
  dx: number
  ancho: number
  /** Lo que baja desde la línea que se pisa, sin peso encima. */
  alto: number
  /** Cuál de las tres fundas. */
  tono: number
  /** Cuánto se le arruga la cara, de 0 a 1. */
  arrugada: number
  /** Ladeada un pelo, que es como queda una almohada tirada. */
  ladeo: number
}

export interface Almohada {
  piezas: Pieza[]
  /**
   * Las sábanas que cuelgan por debajo. Bajan y se pierden en lo
   * oscuro en vez de terminar en el aire: es lo mismo que hacen las
   * cajas de abajo en el cuarto de Ovi y las cañas debajo de la pista
   * de Boo, y por el mismo motivo. Sin ellas la fila entera se lee
   * como un estante flotando.
   */
  sabanas: { dx: number; ancho: number; largo: number }[]
}

/**
 * De cuántas almohadas está hecha cada plataforma del capítulo, y cómo
 * es cada una.
 *
 * Se reparte con la cuenta y no a mano porque son treinta y dos
 * plataformas de dos o tres almohadas cada una, y ninguna de estas
 * decisiones cambia cómo se juega. Lo único que sí se decide es que
 * **la cobija va de una pieza** —es un bulto, no un montón— y que la
 * primera plataforma es la cama y no lleva almohadas encima.
 */
export function sembrarAlmohadas(nivel: Nivel) {
  const camas = new Map<number, Almohada>()

  let semilla = 20240824
  const siguiente = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }

  for (const p of nivel.plataformas) {
    // La cama de abajo y las cobijas se dibujan de una pieza, pero
    // igual pasan por aquí: las sábanas que cuelgan las llevan todas,
    // que son lo que sostiene la fila.
    const deUnaPieza = p.indice === 0 || p.enreda === true

    const cuantas = deUnaPieza
      ? 1
      : Math.max(2, Math.round(p.ancho / ANCHO_DE_UNA_ALMOHADA))
    const anchoDeCada = (p.ancho - JUNTA * (cuantas - 1)) / cuantas

    const piezas: Pieza[] = []
    for (let i = 0; i < cuantas; i += 1) {
      piezas.push({
        dx: i * (anchoDeCada + JUNTA),
        ancho: anchoDeCada,
        // Todas arrancan en la línea que se pisa y bajan lo suyo, igual
        // que las cajas de Ovi: es lo que hace que la fila se lea como
        // almohadas de distinto grosor y no como una tabla con rayas.
        alto: ALTO + Math.round(siguiente() * 7),
        tono: Math.floor(siguiente() * FUNDA.length),
        arrugada: siguiente(),
        // Poquito. Una almohada muy ladeada deja de leerse como suelo,
        // y en este capítulo el suelo ya se está moviendo solo.
        ladeo: (siguiente() - 0.5) * 0.06,
      })
    }

    // Dos paños de sábana colgando, anchos y solapados, para que se lea
    // que la almohada apoya en tela revuelta y que esa tela sigue
    // bajando. **Anchos, no en punta**: en el primer intento colgaban
    // afilándose y de lejos no eran sábanas, eran estalactitas. Una
    // sábana pesa parejo y cuelga con el borde de abajo ondulado.
    // Y no se salen de la plataforma: un paño asomando por la derecha
    // termina en un corte recto y vertical que no es de tela, es de
    // cartulina. Debajo de la almohada, la tela se lee sola.
    const sabanas = [0, 1].map((i) => ({
      dx: (i === 0 ? 0.03 : 0.46) * p.ancho + siguiente() * p.ancho * 0.04,
      ancho: p.ancho * (0.4 + siguiente() * 0.1),
      largo: 22 + Math.round(siguiente() * 20),
    }))

    camas.set(p.indice, { piezas, sabanas })
  }

  return camas
}

export interface Cortina {
  x: number
  /** 0 la de más atrás, 1 la de más adelante. Decide color y nitidez. */
  profundidad: number
  ancho: number
  /** Cada pliegue, con su ancho y lo que se mece. */
  pliegues: { dx: number; ancho: number; vaiven: number; fase: number }[]
}

/**
 * Las cortinas del cuarto, colgando a los dos lados y de punta a punta
 * del capítulo.
 *
 * Son el equivalente del bambú de Boo y de las torres de Ovi, y cumplen
 * lo mismo: decir de qué mundo hablamos cuando en pantalla no queda más
 * que cielo. Empiezan más abajo del suelo y terminan más arriba de la
 * cima, así que no se les ve ni el principio ni el final — una cortina
 * con las dos puntas a la vista se lee como un trapo colgado, no como
 * la ventana de un cuarto.
 *
 * Y son además **lo único vivo del capítulo**. En Boo hay carros
 * corriendo por las vías y en Ovi polvo flotando en la luz; aquí es el
 * aire de la madrugada moviendo la tela, que es lo que hace que el
 * mundo respire mientras la tortuga está quieta pensando el salto. Otra
 * lluvia de motas hubiera sido el polvo de Ovi con otro nombre.
 */
export function sembrarCortinas(): Cortina[] {
  const cortinas: Cortina[] = []

  let semilla = 20260824
  const siguiente = () => {
    semilla = (semilla * 1103515245 + 12345) % 2147483648
    return semilla / 2147483648
  }

  for (const orilla of [0, 1]) {
    // Hacia el medio de la pantalla, como el bambú y las torres: la de
    // la derecha es la de la izquierda en espejo, con la cortina nítida
    // por dentro y la apagada contra el borde.
    const haciaAdentro = orilla === 0 ? 1 : -1

    for (let c = 0; c < 2; c += 1) {
      const profundidad = c
      const ancho = 26 + profundidad * 16
      const base = orilla === 0 ? -8 + profundidad * 10 : MUNDO.ancho - ancho + 8 - profundidad * 10

      const pliegues = []
      const cuantos = 3 + Math.floor(siguiente() * 2)
      for (let i = 0; i < cuantos; i += 1) {
        pliegues.push({
          dx: (i / cuantos) * ancho,
          ancho: (ancho / cuantos) * (0.75 + siguiente() * 0.5),
          // El de más adentro se mece más, que es donde le pega el
          // aire. Contra la pared la tela casi no se mueve.
          vaiven: (1.5 + siguiente() * 3) * (orilla === 0 ? i / cuantos : 1 - i / cuantos),
          fase: siguiente() * Math.PI * 2,
        })
      }

      cortinas.push({ x: base, profundidad, ancho, pliegues: pliegues.map((p) => ({
        ...p,
        vaiven: p.vaiven * haciaAdentro,
      })) })
    }
  }

  return cortinas
}

export interface Pliegue {
  y: number
  amplitud: number
  fase: number
  grosor: number
  brillo: number
}

/**
 * Los pliegues largos de la sábana revuelta: ondas que cruzan el mundo
 * de lado a lado, detrás de todo.
 *
 * Es el sitio que en Boo ocupan las vías de pista, y por la misma
 * razón: una cama vista de cerca no es un fondo liso, y sin esto la
 * subida entera pasaba sobre cielo pelado. Van quietas y muy apagadas
 * —lo que se mueve son las cortinas— porque el fondo tiene que estar
 * vivo sin pelearse con las almohadas, que son lo que hay que mirar.
 */
export function sembrarPliegues(desde: number, hasta: number): Pliegue[] {
  const pliegues: Pliegue[] = []

  let semilla = 20250901
  const siguiente = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }

  const cuantos = Math.max(3, Math.round((hasta - desde) / 420))
  for (let i = 0; i < cuantos; i += 1) {
    pliegues.push({
      y: hasta - ((i + 0.5) / cuantos) * (hasta - desde),
      amplitud: 16 + siguiente() * 30,
      fase: siguiente() * Math.PI * 2,
      grosor: 5 + siguiente() * 9,
      brillo: 0.1 + siguiente() * 0.12,
    })
  }

  return pliegues
}

/* ── Y lo que se dibuja cada frame ───────────────────────────────── */

/**
 * La luz de la madrugada, que baja de la luna.
 *
 * Va en el mundo y no pegada a la pantalla, así que se pone más fuerte
 * conforme se sube: es la única señal de que se está llegando, en un
 * capítulo donde la luna no se vuelve a ver hasta el final. Es la hora
 * del capítulo, dibujada.
 */
export function dibujarLuzDeMadrugada(
  ctx: CanvasRenderingContext2D,
  arriba: number,
  abajo: number,
  cima: number,
  suelo: number,
  alfa = 1,
) {
  // Lo alto que se va: 0 abajo del todo, 1 en la cima. Se toma del
  // borde de arriba de la vista y no de la tortuga — la luz es del
  // cuarto, no de ella.
  const alto = Math.max(0, Math.min(1, (suelo - arriba) / Math.max(1, suelo - cima)))

  const luz = ctx.createLinearGradient(0, arriba, 0, abajo)
  luz.addColorStop(0, `rgba(251, 225, 230, ${((0.05 + alto * 0.09) * alfa).toFixed(3)})`)
  luz.addColorStop(1, 'rgba(251, 225, 230, 0)')
  ctx.fillStyle = luz
  ctx.fillRect(0, arriba, MUNDO.ancho, abajo - arriba)
}

export function dibujarPliegue(ctx: CanvasRenderingContext2D, pliegue: Pliegue, alfa = 1) {
  ctx.save()
  ctx.globalAlpha = pliegue.brillo * alfa
  ctx.strokeStyle = COLOR.sabanaLuz
  ctx.lineWidth = pliegue.grosor
  ctx.lineCap = 'round'

  // Una onda de lado a lado, con los dos extremos fuera de pantalla:
  // el pliegue de una sábana no empieza ni termina a la vista.
  ctx.beginPath()
  for (let x = -20; x <= MUNDO.ancho + 20; x += 12) {
    const y = pliegue.y + Math.sin((x / MUNDO.ancho) * Math.PI * 2 + pliegue.fase) * pliegue.amplitud
    if (x === -20) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Y su sombra justo debajo, que es lo que le da el bulto. Sin ella
  // el pliegue se lee como un cable cruzando el cuarto.
  ctx.globalAlpha = pliegue.brillo * 0.9 * alfa
  ctx.strokeStyle = COLOR.sabanaSombra
  ctx.lineWidth = pliegue.grosor * 0.7
  ctx.beginPath()
  for (let x = -20; x <= MUNDO.ancho + 20; x += 12) {
    const y =
      pliegue.y +
      pliegue.grosor * 0.8 +
      Math.sin((x / MUNDO.ancho) * Math.PI * 2 + pliegue.fase) * pliegue.amplitud
    if (x === -20) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  ctx.restore()
}

export function dibujarCortina(
  ctx: CanvasRenderingContext2D,
  cortina: Cortina,
  arriba: number,
  abajo: number,
  reloj: number,
  quieta: boolean,
  alfa = 1,
) {
  const cuerpo = cortina.profundidad > 0 ? COLOR.cortinaCerca : COLOR.cortinaLejos

  ctx.save()
  ctx.globalAlpha = (0.55 + cortina.profundidad * 0.2) * alfa

  for (const pliegue of cortina.pliegues) {
    const x = cortina.x + pliegue.dx

    // Un pliegue de tela **no es una banda recta**: se ensancha y se
    // angosta mientras baja. Al primer intento eran rectángulos
    // verticales con el filo marcado y a los lados de la pantalla no
    // había una cortina, había una reja. La ondulación va por la
    // altura del mundo, así que la cortina es la misma siempre y no
    // se va acomodando conforme sube la cámara.
    const ondula = (y: number) => Math.sin(y * 0.011 + pliegue.fase) * pliegue.ancho * 0.28

    // El vaivén va por lo alto que esté cada trozo: la tela se mece
    // más abajo que arriba, que es donde está colgada. Con «menos
    // movimiento» la cortina se queda quieta y no pasa nada — sigue
    // siendo una cortina.
    const mecido = (y: number) =>
      quieta ? 0 : Math.sin(reloj * 0.55 + pliegue.fase + y * 0.006) * pliegue.vaiven

    const paso = 22
    const puntos: { x: number; y: number; ancho: number }[] = []
    for (let y = arriba - 12; y <= abajo + 12; y += paso) {
      puntos.push({ x: x + mecido(y), y, ancho: pliegue.ancho + ondula(y) })
    }

    // El relleno va de sombra a filo iluminado de un lado al otro: es
    // lo que da el bulto de la tela sin una sola línea dura.
    const luz = ctx.createLinearGradient(x, 0, x + pliegue.ancho * 1.4, 0)
    luz.addColorStop(0, cuerpo)
    luz.addColorStop(0.72, cuerpo)
    luz.addColorStop(1, COLOR.cortinaFilo)
    ctx.fillStyle = luz

    ctx.beginPath()
    for (const [i, punto] of puntos.entries()) {
      if (i === 0) ctx.moveTo(punto.x, punto.y)
      else ctx.lineTo(punto.x, punto.y)
    }
    for (let i = puntos.length - 1; i >= 0; i -= 1) {
      ctx.lineTo(puntos[i].x + puntos[i].ancho, puntos[i].y)
    }
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Una almohada o una cobija, con lo hundida que esté.
 *
 * Baja `hundido × ALMOHADAS.seHunde` —la misma cuenta que hace la
 * física en `superficieDe`, que si aquí se dibujara otra cosa la
 * tortuga caminaría por el aire— y de paso se aplasta, que es lo que
 * hace una almohada con alguien encima.
 *
 * `pisada` es dónde están las paticas ahora mismo, o `null` si la
 * tortuga no está apoyada aquí. Solo sirve para marcarle el hoyo.
 */
export function dibujarAlmohada(
  ctx: CanvasRenderingContext2D,
  p: Plataforma,
  forma: Almohada | undefined,
  hundido: number,
  hitoAlcanzado: number,
  reloj: number,
  alfa: number,
  pisada: number | null,
) {
  const baja = p.hunde ? hundido * ALMOHADAS.seHunde : 0
  // Lo que la almohada se aplasta por arriba se reparte a los lados:
  // la tela no desaparece, se corre. La cobija no se ensancha — la
  // lana no se corre para los lados, se apelmaza.
  const ancha = p.enreda ? 0 : hundido * 5

  const x = p.x - ancha
  const y = p.y + baja
  const ancho = p.ancho + ancha * 2

  // Las sábanas van primero, que están detrás y por debajo.
  if (forma) dibujarSabanasColgando(ctx, x, y, ancho, forma, alfa, hundido, reloj)

  if (p.enreda) {
    dibujarCobija(ctx, x, y, ancho, altoAhora(ALTO, hundido), hundido, alfa)
  } else if (p.indice === 0) {
    dibujarColchon(ctx, x, y, ancho, alfa)
  } else {
    dibujarFila(ctx, x, y, ancho, forma, hundido, alfa)
  }

  // El hoyo de las paticas, encima de todo y debajo de la tortuga.
  if (pisada !== null && p.hunde && hundido > 0.02) {
    dibujarHoyo(ctx, pisada, y, hundido, alfa)
  }

  // La estrella va encima y sin hundirse: las estrellas nunca se
  // hunden, y por eso son el sitio donde se respira.
  if (p.hito) dibujarEstrellaDePapel(ctx, p, hitoAlcanzado >= p.indice, reloj)
}

/** Lo que le queda de alto a una almohada de grosor `entera`. */
function altoAhora(entera: number, hundido: number) {
  return entera - (entera - (entera * ALTO_HUNDIDA) / ALTO) * hundido
}

/**
 * La fila de almohadas de una plataforma.
 *
 * La línea de arriba —la que se pisa— se dibuja **entera y de un
 * trazo**, por encima de las juntas. Es la decisión que hizo posible
 * partir la almohada: la forma puede estar rota en tres, pero en un
 * capítulo donde el suelo se está moviendo mientras una lo mira, a qué
 * altura se pisa no puede tener ni una interrupción.
 */
function dibujarFila(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  forma: Almohada | undefined,
  hundido: number,
  alfa: number,
) {
  const piezas = forma?.piezas ?? [
    { dx: 0, ancho, alto: ALTO, tono: 0, arrugada: 0.5, ladeo: 0 },
  ]
  // La fila sembrada mide lo que medía la plataforma entera; al
  // hundirse, la fila se ensancha y hay que repartir ese ensanche.
  const estira = ancho / Math.max(1, piezas[piezas.length - 1].dx + piezas[piezas.length - 1].ancho)

  ctx.save()
  ctx.globalAlpha = alfa

  for (const pieza of piezas) {
    dibujarFunda(ctx, x + pieza.dx * estira, y, pieza.ancho * estira, pieza, hundido, alfa)
  }

  // Y ahora sí, la línea que se pisa, continua de punta a punta. Entra
  // catorce píxeles por cada lado y no cinco: las esquinas de una
  // almohada son redondas, y una línea que llegara hasta el borde se
  // quedaba flotando en el aire en las dos puntas.
  ctx.strokeStyle = COLOR.costura
  ctx.lineWidth = 1.5
  ctx.globalAlpha = alfa * 0.9
  ctx.beginPath()
  ctx.moveTo(x + 14, y + 1.5)
  ctx.lineTo(x + ancho - 14, y + 1.5)
  ctx.stroke()

  ctx.restore()
}

/** Una almohada de la fila. */
function dibujarFunda(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  pieza: Pieza,
  hundido: number,
  alfa: number,
) {
  const funda = FUNDA[pieza.tono % FUNDA.length]
  const suAlto = altoAhora(pieza.alto, hundido)
  const enElFondo = hundido > 0.9

  ctx.save()
  ctx.globalAlpha = alfa

  // Ladeada sobre su propio medio, poquito. Una almohada tirada nunca
  // queda a escuadra.
  ctx.translate(x + ancho / 2, y)
  ctx.rotate(pieza.ladeo * (1 - hundido * 0.6))
  ctx.translate(-(x + ancho / 2), -y)

  // La junta con la de al lado: una sombra en el arranque, que es lo
  // que dice que son dos almohadas y no una con una raya.
  ctx.fillStyle = COLOR.junta
  ctx.globalAlpha = alfa * 0.7
  ctx.beginPath()
  ctx.roundRect(x - JUNTA, y + 1, ancho + JUNTA * 2, suAlto, Math.min(suAlto / 2, 10))
  ctx.fill()
  ctx.globalAlpha = alfa

  // El cuerpo. Radio generoso: una almohada no tiene esquinas.
  const relleno = ctx.createLinearGradient(0, y, 0, y + suAlto)
  relleno.addColorStop(0, enElFondo ? funda.fondo : funda.luz)
  relleno.addColorStop(0.55, funda.cara)
  relleno.addColorStop(1, funda.sombra)
  ctx.fillStyle = relleno
  ctx.beginPath()
  ctx.roundRect(x, y, ancho, suAlto, Math.min(suAlto / 2, 10))
  ctx.fill()

  // El pespunte del borde, que es lo único que la separa de ser un
  // rectángulo redondeado.
  ctx.strokeStyle = COLOR.costura
  ctx.lineWidth = 1
  ctx.globalAlpha = alfa * 0.35
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.roundRect(x + 4, y + 3.5, ancho - 8, suAlto - 7, Math.min(suAlto / 2 - 3, 7))
  ctx.stroke()
  ctx.setLineDash([])

  // Las arrugas de la cara, dos rayitas curvas que salen de la junta.
  // Se marcan más cuanto más hundida está: la tela sobrante tiene que
  // irse a algún lado, y va ahí.
  ctx.globalAlpha = alfa * (0.14 + hundido * 0.2) * (0.5 + pieza.arrugada * 0.5)
  ctx.strokeStyle = funda.sombra
  ctx.lineWidth = 1.2
  for (let i = 0; i < 2; i += 1) {
    const desde = x + ancho * (0.2 + i * 0.4 + pieza.arrugada * 0.08)
    ctx.beginPath()
    ctx.moveTo(desde, y + suAlto - 2)
    ctx.quadraticCurveTo(desde + 6, y + suAlto / 2, desde + 2, y + 3)
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * El colchón de la primera plataforma, que es la cama.
 *
 * No lleva almohadas encima a propósito: es de donde se sale, tiene que
 * leerse como el sitio firme del capítulo, y es lo único de aquí que no
 * se hunde. Una cama con almohadas dibujadas sería una plataforma más.
 */
function dibujarColchon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  alfa: number,
) {
  ctx.save()
  ctx.globalAlpha = alfa

  const relleno = ctx.createLinearGradient(0, y, 0, y + ALTO_DEL_COLCHON)
  relleno.addColorStop(0, COLOR.colchonLuz)
  relleno.addColorStop(0.4, COLOR.colchon)
  relleno.addColorStop(1, COLOR.colchonSombra)
  ctx.fillStyle = relleno
  ctx.beginPath()
  ctx.roundRect(x, y, ancho, ALTO_DEL_COLCHON, 7)
  ctx.fill()

  // La línea que se pisa.
  ctx.strokeStyle = COLOR.costura
  ctx.lineWidth = 1.5
  ctx.globalAlpha = alfa * 0.75
  ctx.beginPath()
  ctx.moveTo(x + 10, y + 1)
  ctx.lineTo(x + ancho - 10, y + 1)
  ctx.stroke()

  // Los botones del colchón, en fila y bien espaciados: es lo que dice
  // «colchón» sin escribirlo.
  ctx.globalAlpha = alfa * 0.3
  ctx.fillStyle = COLOR.sabanaLuz
  for (let i = 1; i <= 4; i += 1) {
    ctx.beginPath()
    ctx.arc(x + (ancho * i) / 5, y + 11, 1.6, 0, Math.PI * 2)
    ctx.fill()
  }

  // Y la sábana bajera arremangada en una punta, que es lo que lo hace
  // una cama deshecha y no un banco.
  ctx.globalAlpha = alfa * 0.55
  ctx.fillStyle = COLOR.sabana
  ctx.beginPath()
  ctx.moveTo(x + ancho - 68, y + 2)
  ctx.quadraticCurveTo(x + ancho - 34, y - 6, x + ancho - 6, y + 3)
  ctx.lineTo(x + ancho - 6, y + 13)
  ctx.quadraticCurveTo(x + ancho - 36, y + 6, x + ancho - 68, y + 12)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

/** Las sábanas que cuelgan por debajo y se pierden en lo oscuro. */
function dibujarSabanasColgando(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  forma: Almohada,
  alfa: number,
  hundido: number,
  reloj: number,
) {
  // Arrancan un poco por debajo de la línea que se pisa: la tela sale
  // de debajo de la almohada, no de encima.
  const arriba = y + 12

  /**
   * Lo que se mece la punta de abajo mientras hay peso encima.
   *
   * Con la almohada entera van quietas. En cuanto se para encima y
   * empieza a hundirse, la tela de abajo se pone a temblar, y cuanto
   * más hundida más. Es dibujo y nada más: no toca ni la altura ni el
   * tiempo de carga.
   *
   * Hace falta porque la traba de este capítulo es un suelo que se va
   * moviendo mientras una lo mira, y hasta ahora eso solo lo contaba
   * la almohada bajando. Con la tela de abajo quieta, el hundimiento
   * se leía como que la plataforma cambia de sitio, no como que hay
   * algo cediendo bajo el peso.
   */
  const tiembla = hundido * hundido * 7

  ctx.save()

  for (const sabana of forma.sabanas) {
    const desde = x + sabana.dx
    const hasta = desde + sabana.ancho

    // Arranca ya translúcida y termina en nada. Opaca no servía: en la
    // presentación la luna pasa por detrás y cada paño se recortaba
    // contra ella como un ladrillo gris. Una sábana colgando en la
    // penumbra es una sombra con forma, no un objeto.
    const desvanecido = ctx.createLinearGradient(0, arriba, 0, arriba + sabana.largo)
    desvanecido.addColorStop(0, 'rgba(76, 70, 94, 0.72)')
    desvanecido.addColorStop(0.45, 'rgba(51, 46, 66, 0.5)')
    desvanecido.addColorStop(1, 'rgba(51, 46, 66, 0)')
    ctx.fillStyle = desvanecido
    ctx.globalAlpha = alfa

    // El paño: los lados se meten hacia adentro con una curva y el
    // borde de abajo va en tres ondas. Los lados rectos eran lo que
    // hacía que de lejos se leyera un rectángulo y no tela.
    ctx.beginPath()
    ctx.moveTo(desde, arriba)
    ctx.lineTo(hasta, arriba)
    // El vaivén va solo en la punta de abajo: arriba la tela está
    // sujeta por la almohada y ahí no se mueve nada.
    const mece = tiembla === 0 ? 0 : Math.sin(reloj * 4.6 + sabana.dx * 0.21) * tiembla
    const cuelga = sabana.largo + tiembla * 1.6

    ctx.quadraticCurveTo(
      hasta - sabana.ancho * 0.06 + mece * 0.4,
      arriba + cuelga * 0.45,
      hasta - sabana.ancho * 0.14 + mece,
      arriba + cuelga * 0.78,
    )
    for (let i = 3; i > 0; i -= 1) {
      const px = desde + sabana.ancho * 0.14 + (sabana.ancho * 0.72 * (i - 1)) / 3 + mece
      ctx.quadraticCurveTo(
        desde + sabana.ancho * 0.14 + (sabana.ancho * 0.72 * (i - 0.5)) / 3 + mece,
        arriba + cuelga * (i % 2 === 0 ? 1 : 0.62),
        px,
        arriba + cuelga * 0.78,
      )
    }
    ctx.quadraticCurveTo(
      desde + sabana.ancho * 0.06 + mece * 0.4,
      arriba + cuelga * 0.45,
      desde,
      arriba,
    )
    ctx.closePath()
    ctx.fill()

    // Un pliegue vertical, uno solo: en cuarenta píxeles más de uno es
    // ruido, y es lo que dice que la tela está revuelta y no estirada.
    ctx.strokeStyle = COLOR.sabanaLuz
    ctx.globalAlpha = alfa * 0.12
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(desde + sabana.ancho * 0.38, arriba + 2)
    ctx.lineTo(desde + sabana.ancho * 0.3, arriba + sabana.largo * 0.6)
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * El hoyo de las paticas.
 *
 * Es **solo dibujo**: la almohada se hunde entera y pareja, sin cuenco,
 * y eso no se toca. Hundir distinto según dónde se pare ya es la traba
 * del cuarto de Ovi, y dos capítulos con la misma traba no son dos
 * capítulos. Lo que hace el hoyo es contar por qué está bajando —hay
 * alguien parado ahí— en un capítulo donde el castigo es lento y pasa
 * mientras una está mirando el salto siguiente.
 */
function dibujarHoyo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  hundido: number,
  alfa: number,
) {
  ctx.save()

  // Va más ancho que la tortuga a propósito: debajo de ella no se ve
  // nada, y lo que tiene que leerse es el hundido asomando por los dos
  // lados de las paticas.
  ctx.globalAlpha = alfa * hundido * 0.55
  ctx.fillStyle = COLOR.hoyo
  ctx.beginPath()
  ctx.ellipse(x, y + 3.5, TORTUGA.ancho * 0.78, 3 + hundido * 2, 0, 0, Math.PI * 2)
  ctx.fill()

  // Y su filo de arriba, apenas: es el labio de tela que se levanta
  // alrededor del peso.
  ctx.globalAlpha = alfa * hundido * 0.3
  ctx.strokeStyle = COLOR.costura
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(x, y + 3.5, TORTUGA.ancho * 0.78, 3 + hundido * 2, 0, Math.PI, Math.PI * 2)
  ctx.stroke()

  ctx.restore()
}

/**
 * La cobija enredada.
 *
 * Tiene que leerse distinta de una almohada **de un vistazo y de
 * lejos**, porque lo que cambia encima de ella es el ritmo de la barra
 * y eso no se ve hasta que ya se está cargando. Cuatro cosas la
 * separan, en este orden de importancia: el color más caliente, que va
 * de una sola pieza mientras las almohadas van partidas en dos o tres,
 * las esquinas duras —una almohada no tiene esquinas y una cobija
 * doblada sí— y los pliegues cruzados.
 *
 * Los pliegues van **adentro del cuerpo** y no asomando por arriba. Un
 * bulto dibujado por encima de la línea que se pisa se lee como suelo,
 * y no lo es: en un capítulo donde el suelo se está moviendo, esa
 * confusión se paga con un salto.
 */
function dibujarCobija(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ancho: number,
  alto: number,
  hundido: number,
  alfa: number,
) {
  ctx.save()
  ctx.globalAlpha = alfa

  const relleno = ctx.createLinearGradient(0, y, 0, y + alto)
  relleno.addColorStop(0, hundido > 0.9 ? COLOR_COBIJA.fondo : COLOR_COBIJA.telaLuz)
  relleno.addColorStop(0.55, COLOR_COBIJA.tela)
  relleno.addColorStop(1, COLOR_COBIJA.telaSombra)
  ctx.fillStyle = relleno
  ctx.beginPath()
  ctx.roundRect(x, y, ancho, alto, 4)
  ctx.fill()

  // La línea que se pisa, igual de clara que en la almohada y por lo
  // mismo: acá el suelo se mueve y no puede haber duda de dónde está.
  ctx.strokeStyle = COLOR_COBIJA.costura
  ctx.lineWidth = 1.5
  ctx.globalAlpha = alfa * 0.9
  ctx.beginPath()
  ctx.moveTo(x + 4, y + 1)
  ctx.lineTo(x + ancho - 4, y + 1)
  ctx.stroke()

  // El enredo.
  ctx.globalAlpha = alfa * 0.45
  ctx.lineWidth = 1
  for (let i = 1; i <= 3; i += 1) {
    const px = x + (ancho * i) / 4
    ctx.beginPath()
    ctx.moveTo(px - 7, y + alto - 2)
    ctx.lineTo(px + 5, y + 3)
    ctx.stroke()
  }

  // Y la punta suelta que cuelga, que es lo que la hace una cobija y
  // no un ladrillo. Cuelga para abajo, donde no se pisa, y cuelga más
  // cuanto más hundida está: es la tela que se descuelga al apelmazarse.
  ctx.globalAlpha = alfa * 0.75
  ctx.fillStyle = COLOR_COBIJA.telaSombra
  ctx.beginPath()
  ctx.moveTo(x + ancho - 26, y + alto - 1)
  ctx.lineTo(x + ancho - 6, y + alto - 1)
  ctx.lineTo(x + ancho - 13, y + alto + 8 + hundido * 5)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

/* ══════════════════════════════════════════════════════════════
   LAS PLUMAS

   Lo que sueltan las almohadas cuando ella cae encima y cuando sale
   disparada. Es lo único del capítulo que reacciona a lo que ella
   hace, y por eso se puso: el cuarto estaba bien dibujado y aun así
   se leía quieto.

   **No tocan la física.** Ni una. Salen del golpe, flotan un rato
   por delante de la tortuga y se apagan. Lo que hacen es que la
   almohada se sienta de plumas en vez de ser una forma de color, y
   que el capítulo parezca más complicado de lo que es, que es
   exactamente lo que se buscaba.

   Van en este archivo y no en el pintor porque son del mundo de
   Nico. En el de Boo y en el de Ovi no sale ninguna: de una pista de
   Hot Wheels y de una caja de cartón no salen plumas.
   ══════════════════════════════════════════════════════════════ */

/** Los tonos de la pluma, del más claro al más apagado. */
const COLOR_PLUMA = ['#f6f1e4', '#e4dcd0', '#cfc6be']

export interface Pluma {
  x: number
  y: number
  vx: number
  vy: number
  giro: number
  /** Vueltas por segundo, con su signo. */
  vueltas: number
  largo: number
  /** El vaivén de caer: fase y cuánto se mece. */
  fase: number
  mecida: number
  color: string
  /** De 1 (recién salida) a 0 (ya no está). */
  vida: number
  /** Cuánta vida pierde por segundo. */
  gasta: number
}

let semillaDePluma = 24112024
const alAzar = () => {
  semillaDePluma = (semillaDePluma * 1664525 + 1013904223) % 4294967296
  return semillaDePluma / 4294967296
}

/**
 * Un puñado de plumas saliendo de un punto.
 *
 * `fuerza` es cuánto las avienta: el porrazo de aterrizar las
 * levanta más que el empujón de despegar. Salen para arriba y
 * abiertas, porque es lo que hace un golpe sobre algo blando.
 */
export function soltarPlumas(x: number, y: number, cuantas: number, fuerza: number): Pluma[] {
  const plumas: Pluma[] = []
  for (let i = 0; i < cuantas; i += 1) {
    const abierta = (alAzar() - 0.5) * 2
    plumas.push({
      x: x + abierta * 13,
      y: y - 2 - alAzar() * 5,
      vx: abierta * fuerza * (0.5 + alAzar() * 0.6),
      vy: -fuerza * (0.5 + alAzar() * 0.8),
      giro: alAzar() * Math.PI * 2,
      vueltas: (0.5 + alAzar()) * (alAzar() < 0.5 ? -1 : 1),
      largo: 6 + alAzar() * 5,
      fase: alAzar() * Math.PI * 2,
      mecida: 14 + alAzar() * 16,
      color: COLOR_PLUMA[Math.floor(alAzar() * COLOR_PLUMA.length)] ?? COLOR_PLUMA[0],
      vida: 1,
      gasta: 0.34 + alAzar() * 0.22,
    })
  }
  return plumas
}

/**
 * Las mueve un ratito y devuelve las que siguen vivas.
 *
 * Una pluma no cae, se deja caer: la gravedad es floja y hay una
 * velocidad de bajada que no pasa nunca, más el vaivén de lado.
 * Con la gravedad del juego caían como piedritas blancas.
 */
export function moverPlumas(plumas: Pluma[], dt: number, reloj: number): Pluma[] {
  const vivas: Pluma[] = []
  for (const p of plumas) {
    p.vida -= p.gasta * dt
    if (p.vida <= 0) continue

    p.vy = Math.min(p.vy + 190 * dt, 26)
    p.vx *= 1 - Math.min(1, 2.4 * dt)
    p.x += (p.vx + Math.sin(reloj * 1.7 + p.fase) * p.mecida) * dt
    p.y += p.vy * dt
    p.giro += p.vueltas * dt
    vivas.push(p)
  }
  return vivas
}

/** Una pluma: el raquis y las dos barbas, que es toda la silueta. */
export function dibujarPluma(ctx: CanvasRenderingContext2D, p: Pluma) {
  // Entra de golpe y se va apagando, que es como se apaga algo que
  // cae: no parpadea, se pierde de vista.
  const alfa = Math.min(1, p.vida * 2.2) * 0.85

  ctx.save()
  ctx.globalAlpha = alfa
  ctx.translate(p.x, p.y)
  ctx.rotate(p.giro)

  const medio = p.largo / 2
  const ancho = p.largo * 0.3

  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.moveTo(0, -medio)
  ctx.quadraticCurveTo(ancho, 0, 0, medio)
  ctx.quadraticCurveTo(-ancho, 0, 0, -medio)
  ctx.fill()

  // El canuto, que es lo que la separa de una hojita.
  ctx.globalAlpha = alfa * 0.45
  ctx.strokeStyle = COLOR.costura
  ctx.lineWidth = 0.7
  ctx.beginPath()
  ctx.moveTo(0, -medio)
  ctx.lineTo(0, medio)
  ctx.stroke()

  ctx.restore()
}
