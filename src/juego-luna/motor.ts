import {
  CAIDA,
  CAJAS,
  CANSANCIO,
  CINTA,
  IMPULSO,
  LUNA,
  MUNDO,
  PELUCHES,
  PISTA,
  SALTO,
  TORTUGA,
} from '@/content/luna'
import { alturaDeLaCaja } from '@/juego-luna/mundos'
import type { EscenaLuna, EventoLuna, Nivel, Plataforma } from '@/types'

/**
 * El motor del juego de la luna: el bucle, la física y las colisiones.
 *
 * Vive fuera de React a propósito. React monta el canvas, le entrega
 * las plataformas y se aparta; aquí adentro no hay estado de React ni
 * un solo render por frame.
 *
 * ── Por qué paso fijo ──────────────────────────────────────────
 * La física avanza siempre de a 1/60 de segundo, cueste lo que cueste
 * el frame. Si avanzáramos "lo que haya pasado desde el frame
 * anterior", en un teléfono que baja a 40 fps la gravedad y el
 * impulso darían otro salto: el juego sería distinto según lo
 * ocupado que esté el aparato. Lo que sobra del tiempo se guarda en
 * el acumulador para el frame siguiente, y lo que se dibuja es la
 * mezcla entre el paso anterior y el actual. Sin eso, a 120 Hz se
 * vería a tirones.
 */

/** El paso de física, en segundos. 60 por segundo. */
const PASO = 1 / 60

/**
 * Cuántos pasos como mucho por frame. Si la pestaña estuvo dormida
 * cinco minutos, el acumulador trae cinco minutos de física: sin
 * este tope el navegador se cuelga tratando de alcanzarse a sí mismo.
 * Se pierde tiempo, y está bien: nadie estaba mirando.
 */
const PASOS_MAXIMOS = 5

/** Se cae de la pantalla, medio segundo de nada, y vuelve al hito. */
const MS_CAIDA = 500

/** Lo que hay que esperar antes de poder saltarse la presentación. */
const MS_ANTES_DE_SALTARLA = 450

/** Cuántos píxeles del mundo camina entre una patica y la otra. */
const PASITO = 11

/**
 * Lo que se le perdona al aterrizar justo en la punta. Sin este
 * margen, rozar la orilla es caerse, y desde el teléfono se siente
 * robado.
 */
const ORILLA = 2

/**
 * Lo que se acerca una caja a su inclinación de destino en cada paso.
 *
 * Es un acercamiento proporcional y no una velocidad fija: una caja
 * que cede arranca rápido y va frenando conforme se asienta, que es
 * como se mueve algo con peso encima. El tres de la cuenta son las
 * constantes de tiempo que hacen falta para llegar al 95%, así que
 * `msParaCeder` significa de verdad lo que dice su nombre.
 */
const ritmoDeLaCaja = (ms: number) => 1 - Math.exp((-3 * PASO * 1000) / ms)
const CEDIENDO = ritmoDeLaCaja(CAJAS.msParaCeder)
const ENDEREZANDO = ritmoDeLaCaja(CAJAS.msParaEnderezar)

interface Tortuga {
  x: number
  y: number
  vx: number
  vy: number
  mirando: 1 | -1
  enSuelo: boolean
  cargando: boolean
  carga: number
  /** Milisegundos que lleva con el dedo apretado. */
  cargaMs: number
  caminado: number
  /** Segundos desde que dejó el suelo, para el perdón del borde. */
  sinSuelo: number
  desdeSalto: number
  desdeAterrizaje: number
}

export interface OpcionesMotor {
  nivel: Nivel
  /**
   * Si el capítulo abre y cierra con la luna. Lo pide la página; el
   * probador no, que si no cada una de las veintitantas mil partidas
   * que corre empezaría esperando tres segundos y medio a que se
   * despida una luna que nadie está mirando.
   */
  conCinematica?: boolean
  /** Se llama una vez por frame con la escena ya interpolada. */
  pintar: (escena: EscenaLuna) => void
  /** Vibración, sonido y demás cosas de afuera. */
  alEvento?: (evento: EventoLuna) => void
}

export interface Motor {
  iniciar: () => void
  detener: () => void
  /**
   * Que la luna se presente y empiece el capítulo.
   *
   * El bucle arranca antes, con `iniciar`, para que detrás del cartel
   * se vean el cielo y la tortuga caminando. Lo que espera a este
   * aviso es la cinemática de la luna, que es lo único que hay que
   * mirar y que corriendo detrás del texto no se veía. Llamarlo dos
   * veces no hace nada.
   */
  empezar: () => void
  /** El dedo bajó o la barra espaciadora se hundió. */
  presionar: () => void
  /** El dedo se levantó: sale disparada. */
  soltar: () => void
  /**
   * Cuánto alto del mundo se ve en pantalla. Lo dice el pintor, que
   * es el único que sabe de qué tamaño es el teléfono, y la cámara lo
   * necesita para saber dónde dejarla parada.
   */
  medirVista: (altoEnUnidades: number) => void
  /** Los pasitos y las caídas de esta subida. */
  cuenta: () => { pasitos: number; caidas: number }
}

const gradosARadianes = (grados: number) => (grados * Math.PI) / 180

export function crearMotor({ nivel, conCinematica, pintar, alEvento }: OpcionesMotor): Motor {
  const { plataformas } = nivel

  /**
   * Lo que le queda a cada tramo antes de borrarse, de 1 a 0. En los
   * capítulos donde la pista no se desvanece se queda todo en 1 y no
   * pasa nada.
   */
  const vida: number[] = plataformas.map(() => 1)

  /**
   * Cuánto pierde de vida por paso cada tramo que ya se está yendo.
   * Se guarda al empezar a irse y no se recalcula: un tramo se borra
   * al ritmo que tenía cuando lo dejó, no al de ahora.
   */
  const ritmo: number[] = plataformas.map(() => 0)

  /**
   * Cuánto está inclinada cada caja, de -1 (se hundió la izquierda) a
   * 1 (se hundió la derecha). En los capítulos donde nada cede se
   * queda todo en cero y no cuesta nada.
   */
  const inclinacion: number[] = plataformas.map(() => 0)

  /**
   * Hasta el primer lazo no se borra nada. Los primeros saltos son
   * para aprender, y aprender con el suelo desapareciendo no se puede.
   */
  const primerLazo = nivel.hitos[0]?.indice ?? plataformas.length

  /** En qué tramo está parada. -1 es en el aire. */
  let ultimoPiso = 0

  /**
   * En qué momento del capítulo va. Durante las dos cinemáticas el
   * dedo no hace nada: la luna se está presentando o despidiendo, y
   * saltar por encima de eso rompe el cuento.
   */
  let cine: 'espera' | 'entrada' | 'jugando' | 'salida' | 'fin' = conCinematica
    ? 'espera'
    : 'jugando'
  let cineMs = 0

  /** Un tramo se puede pisar mientras no se haya borrado del todo. */
  const sigueAhi = (p: Plataforma) => vida[p.indice] > 0

  /**
   * A qué altura está el suelo de un tramo en un punto. En el capítulo
   * de Ovi la caja está inclinada y eso ya no es su `y` a secas.
   */
  const alturaEn = (p: Plataforma, x: number) => alturaDeLaCaja(p, x, inclinacion[p.indice])

  /**
   * Mover las cajas: cada una se va hacia el lado donde está parada, y
   * vuelve a quedar derecha cuando se va.
   *
   * El peso es todo suyo, así que solo se inclina una a la vez: la que
   * está pisando. Las demás se enderezan, incluida la que acaba de
   * dejar, que es la mitad del efecto — se la ve volver a su sitio
   * mientras ella vuela.
   */
  function moverLasCajas() {
    if (!nivel.cede) return

    const encima = t.enSuelo && cayendo <= 0 ? ultimoPiso : -1

    for (const p of plataformas) {
      if (!p.cede) continue

      let objetivo = 0
      if (p.indice === encima) {
        const medio = p.x + p.ancho / 2
        const brazo = Math.max(1, p.ancho / 2)
        objetivo = Math.max(-1, Math.min(1, (t.x - medio) / brazo))
      }

      const ritmo = objetivo === 0 ? ENDEREZANDO : CEDIENDO
      inclinacion[p.indice] += (objetivo - inclinacion[p.indice]) * ritmo
    }
  }

  /**
   * Cuánto aguanta hoy un tramo antes de borrarse. Cada estrella
   * pisada le quita un poco, así que el capítulo se va apurando solo
   * sin cambiar una sola plataforma.
   */
  function loQueDuraLaPista() {
    const estrellas = nivel.hitos.filter((h) => h.indice <= hitoAlcanzado).length
    return Math.max(PISTA.msMinimo, PISTA.msParaIrse - estrellas * PISTA.msMenosPorEstrella)
  }

  /**
   * Desde qué punto de su vida un tramo empieza a parpadear, de 1 a 0.
   * Cuando la pista se pone apurada, el aviso fijo se comería casi
   * toda la vida del tramo, así que se le pone tope.
   */
  function cuandoAvisa() {
    const dura = loQueDuraLaPista()
    return Math.min(PISTA.msDeAviso, dura * 0.6) / dura
  }

  /** Dónde reaparece: la salida, o el último hito que haya pisado. */
  const reaparicion = { ...nivel.salida }

  /** El hito más alto pisado. -1 es «todavía ninguno». */
  let hitoAlcanzado = -1

  /** Cuántos saltos dio y cuántas veces se cayó, en esta subida. */
  let pasitos = 0
  let caidas = 0

  /**
   * La última caja de peluches que rebotó y hace cuánto. Es solo para
   * el dibujo: la caja se aplasta al recibir y vuelve a estirarse.
   */
  let rebotoEn = -1
  let msDelRebote = 0

  /**
   * Cuántas veces seguidas rebotó en la misma caja sin tocar otra
   * cosa. Solo el primero lleva el piso garantizado; los de después
   * salen del anterior, que es lo que hace que se apaguen solos.
   */
  let rebotesSeguidos = 0

  /** Ya llegó arriba: se deja de contar y no se avisa dos veces. */
  let terminado = false

  /** Cuánto alto del mundo se ve. El pintor lo corrige al medir. */
  let altoVista = MUNDO.alto

  /** La `y` del borde de arriba de lo que se ve. */
  let camara = nivel.salida.y - MUNDO.alto * 0.62

  const t: Tortuga = {
    x: reaparicion.x,
    y: reaparicion.y,
    vx: 0,
    vy: 0,
    mirando: 1,
    enSuelo: true,
    cargando: false,
    carga: 0,
    cargaMs: 0,
    caminado: 0,
    sinSuelo: 0,
    desdeSalto: 9999,
    desdeAterrizaje: 9999,
  }

  /** Copia del paso anterior, para interpolar el dibujo. */
  let previo = { ...t }

  /** Segundos que faltan de la caída antes de reaparecer. */
  let cayendo = 0

  /** Segundos que le quedan tirada después de agotarse. */
  let tirada = 0

  /** Segundos desde que arrancó, para lo que respira y parpadea. */
  let reloj = 0

  let acumulador = 0
  let ultimoMs = 0
  let animacion = 0
  let andando = false

  const avisar = (evento: EventoLuna) => alEvento?.(evento)

  /**
   * Dónde debería estar mirando la cámara.
   *
   * La tortuga se queda a poco más de la mitad de la pantalla, con más
   * espacio arriba que abajo: lo que hace falta ver es hacia dónde se
   * va a saltar, no de dónde se viene. Y nunca baja del suelo, para
   * que no aparezca un vacío debajo del primer escalón.
   */
  function camaraObjetivo() {
    const deseada = t.y - altoVista * 0.62
    const masAbajo = nivel.suelo + 90 - altoVista
    return Math.min(deseada, masAbajo)
  }

  /**
   * La plataforma que está pisando, si es que pisa alguna.
   *
   * El margen vertical es de dos píxeles y no de medio porque en el
   * capítulo de Ovi el suelo se mueve debajo de ella: entre un paso y
   * el siguiente la caja cede y la tortuga queda unas décimas por
   * encima. Dos píxeles cubren de sobra ese desfase y siguen estando
   * muy lejos del tramo de al lado, que nunca está a menos de sesenta.
   */
  function sueloDebajo(): Plataforma | undefined {
    return plataformas.find(
      (p) =>
        sigueAhi(p) &&
        Math.abs(t.y - alturaEn(p, t.x)) < 2 &&
        t.x >= p.x - ORILLA &&
        t.x <= p.x + p.ancho + ORILLA,
    )
  }

  function volverAlHito() {
    // La pista de arriba del lazo vuelve entera. Sin esto, caerse en
    // el capítulo de Boo sería el final de la partida: el camino que
    // hay que rehacer es justo el que ella acaba de borrar.
    for (let i = Math.max(hitoAlcanzado, 0); i < plataformas.length; i += 1) {
      vida[i] = 1
      ritmo[i] = 0
    }

    // Y las cajas vuelven a quedar derechas. Reaparecer sobre una que
    // sigue torcida de antes de la caída es empezar de nuevo con una
    // trampa puesta que ella no vio ponerse.
    for (let i = 0; i < inclinacion.length; i += 1) inclinacion[i] = 0

    t.x = reaparicion.x
    t.y = reaparicion.y
    // La cámara va de un salto y no viajando: mirar el paisaje bajar
    // durante un segundo después de cada caída sería insoportable.
    camara = camaraObjetivo()
    t.vx = 0
    t.vy = 0
    t.mirando = 1
    t.enSuelo = true
    t.cargando = false
    t.carga = 0
    t.cargaMs = 0
    t.sinSuelo = 0
    tirada = 0
    rebotesSeguidos = 0
    ultimoPiso = Math.max(hitoAlcanzado, 0)
    previo = { ...t }
    avisar('reaparicion')
  }

  function paso() {
    reloj += PASO

    if (cine === 'entrada' || cine === 'salida') {
      cineMs += PASO * 1000
      const dura = cine === 'entrada' ? LUNA.msDeEntrada : LUNA.msDeSalida
      if (cineMs >= dura) {
        if (cine === 'salida') {
          cine = 'fin'
          avisar('fin')
        } else {
          cine = 'jugando'
        }
        cineMs = 0
      }
    }

    // Durante las cinemáticas la tortuga sigue viva y caminando. Lo
    // único que se le quita es el dedo, y de eso se encarga
    // "presionar". Cortarle el paso aquí la dejaba congelada en la
    // pose que tuviera puesta, casi siempre la del golpe del
    // aterrizaje, que es agachada.

    // Las cajas se mueven siempre, aunque se esté cayendo o desmayada:
    // el mundo no se para porque ella se pare.
    moverLasCajas()

    if (cayendo > 0) {
      // Mientras se cae no manda nadie: sigue bajando y no choca con
      // nada. La cámara se queda quieta a propósito, para que se la
      // vea salir por abajo de la pantalla. Que desapareciera en pleno
      // aire parecería un error del juego.
      cayendo -= PASO
      t.vy += SALTO.gravedad * PASO
      t.x += t.vx * PASO
      t.y += t.vy * PASO
      if (cayendo <= 0) volverAlHito()
      return
    }

    // La cámara persigue a la tortuga sin alcanzarla del todo: se
    // acerca un octavo de la distancia en cada paso, y eso solo ya da
    // el suavizado. Al ir a paso fijo, sale igual en cualquier
    // teléfono.
    camara += (camaraObjetivo() - camara) * 0.12

    t.desdeSalto += PASO * 1000
    t.desdeAterrizaje += PASO * 1000
    if (rebotoEn >= 0) msDelRebote += PASO * 1000

    // Los tramos que ya despegó se van borrando. Al llegar a cero
    // dejan de existir para todo: no se pisan y no se dibujan.
    if (nivel.seDesvanece) {
      for (let i = 0; i < vida.length; i += 1) {
        if (ritmo[i] > 0 && vida[i] > 0) vida[i] = Math.max(0, vida[i] - ritmo[i])
      }
    }

    if (tirada > 0) {
      // Desmayada. No camina, no salta y no oye el dedo hasta que se
      // levante sola.
      tirada -= PASO
      return
    }

    if (t.cargando) {
      // La barra sube y se queda arriba. No rebota ni se reinicia:
      // castigar dos veces el mismo error es mezquino.
      t.carga = Math.min(1, t.carga + (PASO * 1000) / SALTO.msDeCarga)
      t.cargaMs += PASO * 1000

      // Pero aguantarla para siempre esperando el momento perfecto sí
      // cuesta: se agota, se desmaya y pierde el salto.
      if (t.cargaMs >= CANSANCIO.msDeAguante) {
        t.cargando = false
        t.carga = 0
        t.cargaMs = 0
        tirada = CANSANCIO.msTirada / 1000
        avisar('agotada')
      }
    }

    if (t.enSuelo) {
      const piso = sueloDebajo()

      if (!piso) {
        // Se pasó de la orilla caminando, o resbalando. Cae, pero con
        // el perdón del borde todavía puede saltar un instante, que en
        // una caja de cinta es la mitad de la gracia: te está echando,
        // soltá ya.
        t.enSuelo = false
        t.sinSuelo = 0
      } else {
        ultimoPiso = piso.indice

        if (t.cargando) {
          // La caja forrada de cinta no agarra mientras está parada:
          // se va resbalando hacia el lado que la caja está bajando.
          //
          // Y se para en la orilla, igual que caminando. Al principio
          // no se acotaba, para que aguantar de más la tirara de la
          // caja, y era demasiado: con la carga que hace falta para
          // un salto normal ya se caía sola, así que la caja no era
          // difícil, era una trampa. Ahora el castigo es quedarse
          // donde no querías — en la punta, que además está hundida
          // por el balancín, así que el salto sale corto y del lado
          // equivocado. Descoloca, no mata.
          if (piso.resbala) {
            const margen = TORTUGA.ancho / 2
            const arrastre = CINTA.arrastre * inclinacion[piso.indice] * PASO
            t.x = Math.min(
              Math.max(t.x + arrastre, piso.x + margen),
              piso.x + piso.ancho - margen,
            )
          }
        } else {
          // Camina sola de un extremo al otro. Ese ir y venir es el
          // reloj del juego: marca hacia dónde va a salir. Caminando
          // sí agarra, hasta en la cinta: las paticas hacen su trabajo.
          t.x += t.mirando * TORTUGA.velocidad * PASO
          t.caminado += TORTUGA.velocidad * PASO

          const margen = TORTUGA.ancho / 2
          if (t.x > piso.x + piso.ancho - margen) {
            t.x = piso.x + piso.ancho - margen
            t.mirando = -1
          } else if (t.x < piso.x + margen) {
            t.x = piso.x + margen
            t.mirando = 1
          }
        }
      }

      // Y se queda pegada al suelo, esté donde esté. Con la caja
      // inclinándose debajo, quedarse en la `y` de antes la dejaría
      // flotando sobre la punta que subió o enterrada en la que bajó.
      if (piso) t.y = alturaEn(piso, t.x)
    }

    if (!t.enSuelo) {
      t.sinSuelo += PASO

      t.vy += SALTO.gravedad * PASO

      const yAntes = t.y
      t.x += t.vx * PASO
      t.y += t.vy * PASO

      // Las paredes del mundo devuelven, flojito. Perder un salto
      // por haberse pegado al borde no enseña nada.
      //
      // Al rebotar también se da la vuelta. Si no, caía mirando hacia
      // la pared, seguía caminando contra ella y el salto siguiente
      // salía para el mismo lado del que acababa de rebotar.
      if (t.x < 0) {
        t.x = 0
        t.vx = Math.abs(t.vx) * 0.4
        t.mirando = 1
      } else if (t.x > MUNDO.ancho) {
        t.x = MUNDO.ancho
        t.vx = -Math.abs(t.vx) * 0.4
        t.mirando = -1
      }

      // Se cae si baja del último lazo, aunque quede parada en una
      // plataforma buena. Se decide antes de mirar las plataformas
      // justo para eso, para que aterrizar ahí abajo no la salve.
      // Sin esta regla los lazos no se usaban nunca: errar un salto
      // la dejaba dos escalones más abajo y volvía a subir como si
      // nada. Salir de la pantalla se queda de red, por si acaso.
      if (t.y > reaparicion.y + CAIDA.margenBajoElLazo || t.y > camara + altoVista + 120) {
        caidas += 1
        cayendo = MS_CAIDA / 1000
        t.cargando = false
        t.carga = 0
        t.cargaMs = 0
        avisar('caida')
        return
      }

      // Solo se aterriza cayendo, y solo si en este paso se cruzó la
      // línea de arriba de la plataforma. Comparar el antes con el
      // después es lo que evita atravesarla en un salto rápido.
      if (t.vy > 0) {
        for (const p of plataformas) {
          if (!sigueAhi(p)) continue
          const dentro = t.x >= p.x - ORILLA && t.x <= p.x + p.ancho + ORILLA
          // Contra la superficie de verdad, que en el capítulo de Ovi
          // no es la línea de la plataforma sino la de la caja tal
          // como esté inclinada en este momento.
          const superficie = alturaEn(p, t.x)
          if (dentro && yAntes <= superficie && t.y >= superficie) {
            t.y = superficie

            // Se la mete adentro de la plataforma en el mismo frame
            // del golpe, que es donde no se nota. Aterrizando en la
            // punta se quedaba con el centro fuera del suelo: al paso
            // siguiente no había plataforma debajo para caminar, se
            // dejaba caer, el perdón de la orilla la volvía a subir y
            // ahí se quedaba, aplastada y parpadeando, hasta saltar.
            const orilla = Math.min(TORTUGA.ancho / 2, p.ancho / 2)
            t.x = Math.min(Math.max(t.x, p.x + orilla), p.x + p.ancho - orilla)
            t.y = alturaEn(p, t.x)

            t.desdeAterrizaje = 0
            ultimoPiso = p.indice

            // La caja de peluches la devuelve en vez de pararla, con
            // parte de lo que traía y hacia donde iba. Se agota sola
            // porque cada rebote sale del anterior: cuando lo que
            // devolvería ya no llega al mínimo, se queda quieta y el
            // aterrizaje sigue de largo como en cualquier plataforma.
            if (p.rebote) {
              const seguido = p.indice === rebotoEn && rebotesSeguidos > 0
              const traia = Math.abs(t.vy) * PELUCHES.devuelve
              // El piso solo la primera vez que la toca. Después, lo
              // que devuelva sale de lo que traía, y por eso se apaga.
              const devuelve = Math.min(
                seguido ? traia : Math.max(traia, PELUCHES.piso),
                PELUCHES.tope,
              )
              if (devuelve >= PELUCHES.minimo) {
                t.vy = -devuelve
                t.vx *= PELUCHES.frena

                // El montón hace de cuenco: en la mitad de afuera, un
                // bote que iba hacia la orilla sale devuelto hacia el
                // medio. Sin esto cada bote la corría hacia el mismo
                // lado y al tercero se salía de la caja, que es lo
                // contrario de lo que una red tiene que hacer.
                const medioDeLaCaja = p.x + p.ancho / 2
                const desdeElMedio = t.x - medioDeLaCaja
                const enLaOrilla = Math.abs(desdeElMedio) > (p.ancho / 2) * PELUCHES.orilla
                if (enLaOrilla && Math.sign(t.vx) === Math.sign(desdeElMedio)) t.vx = -t.vx
                t.enSuelo = false
                // Sin perdón del borde: está rebotando, no cayéndose.
                t.sinSuelo = 999
                rebotesSeguidos = p.indice === rebotoEn ? rebotesSeguidos + 1 : 1
                rebotoEn = p.indice
                msDelRebote = 0
                avisar('rebote')
                break
              }
            }

            t.vx = 0
            t.vy = 0
            t.enSuelo = true
            t.sinSuelo = 0
            // Se acabó la racha: la próxima vez que toque una caja de
            // peluches vuelve a llevar el piso entero.
            rebotesSeguidos = 0
            avisar('aterrizaje')

            // Pisar un hito guarda el avance. Solo cuenta hacia
            // arriba: volver a bajar a uno viejo no lo desanda.
            if (p.hito && p.indice > hitoAlcanzado) {
              hitoAlcanzado = p.indice
              reaparicion.x = p.x + p.ancho / 2
              reaparicion.y = p.y
              avisar('hito')
              if (p.indice === nivel.cima.indice && !terminado) {
                terminado = true
                avisar('cima')
                if (conCinematica) {
                  cine = 'salida'
                  cineMs = 0
                } else {
                  avisar('fin')
                }
              }
            }
            // Los tramos de impulso la lanzan solos, sin dedo. Se
            // centra antes de salir, así que el salto es siempre el
            // mismo y el destino se puede poner con precisión.
            if (p.impulso) {
              t.x = p.x + p.ancho / 2
              t.mirando = p.impulso
              lanzar(IMPULSO.fuerza)
              avisar('impulso')
            }

            break
          }
        }
      }
    }
  }

  /**
   * Salir volando. Lo usan el dedo y los tramos de impulso, y por eso
   * está aparte: el tramo que deja atrás empieza a borrarse aquí, sea
   * cual sea el motivo de la salida.
   */
  function lanzar(impulso: number) {
    const angulo = gradosARadianes(SALTO.angulo)
    t.vx = Math.cos(angulo) * impulso * t.mirando
    t.vy = -Math.sin(angulo) * impulso
    t.enSuelo = false
    t.cargando = false
    t.carga = 0
    t.cargaMs = 0
    t.sinSuelo = 999
    t.desdeSalto = 0

    rebotesSeguidos = 0

    if (nivel.seDesvanece && ultimoPiso > primerLazo && ritmo[ultimoPiso] === 0) {
      ritmo[ultimoPiso] = (PASO * 1000) / loQueDuraLaPista()
    }
    ultimoPiso = -1
  }

  function presionar() {
    // Un toque durante la presentación se la salta. La primera vez
    // vale la pena mirarla entera, a la quinta no.
    if (cine === 'entrada') {
      // Un toque se la salta, pero no en el primer suspiro: si no, el
      // mismo dedo que le dio al botón se come la presentación que
      // acaba de destapar, y ella no llega a ver ni el primer frame.
      if (cineMs >= MS_ANTES_DE_SALTARLA) {
        cine = 'jugando'
        cineMs = 0
      }
      return
    }
    if (cine !== 'jugando') return
    if (cayendo > 0 || tirada > 0 || t.cargando) return

    // El perdón del borde: si acaba de dejar la plataforma, se la
    // devuelve al suelo para que pueda cargar el salto.
    if (!t.enSuelo && t.sinSuelo * 1000 <= SALTO.msDePerdon) {
      const piso = plataformas.find(
        (p) =>
          sigueAhi(p) &&
          t.x >= p.x &&
          t.x <= p.x + p.ancho &&
          Math.abs(t.y - alturaEn(p, t.x)) <= 40,
      )
      if (piso) {
        t.y = alturaEn(piso, t.x)
        t.vy = 0
        t.enSuelo = true
      }
    }

    if (!t.enSuelo) return

    t.cargando = true
    t.carga = 0
    t.cargaMs = 0
  }

  function soltar() {
    if (!t.cargando) return

    lanzar(SALTO.impulsoMinimo + (SALTO.impulsoMaximo - SALTO.impulsoMinimo) * t.carga)
    // Los pasitos son los saltos suyos. Los de los tramos de impulso
    // son de regalo y no cuentan.
    if (!terminado) pasitos += 1
    avisar('salto')
  }

  /** La mezcla entre el paso anterior y el actual: el dibujo va suave. */
  function interpolar(alfa: number): EscenaLuna {
    const mezcla = (a: number, b: number) => a + (b - a) * alfa
    return {
      x: mezcla(previo.x, t.x),
      y: mezcla(previo.y, t.y),
      mirando: t.mirando,
      carga: mezcla(previo.carga, t.carga),
      cargando: t.cargando,
      enSuelo: t.enSuelo,
      caminado: mezcla(previo.caminado, t.caminado) / PASITO,
      vy: t.vy,
      reloj,
      desdeSalto: t.desdeSalto,
      desdeAterrizaje: t.desdeAterrizaje,
      cayendo: cayendo > 0,
      agobio: t.cargando
        ? Math.max(
            0,
            (t.cargaMs - (CANSANCIO.msDeAguante - CANSANCIO.msDeAviso)) / CANSANCIO.msDeAviso,
          )
        : 0,
      cansancio: Math.max(0, (tirada * 1000) / CANSANCIO.msTirada),
      camara,
      hitoAlcanzado,
      // Se pasa el mismo arreglo, sin copiar: el pintor solo lee, y
      // copiarlo treinta y dos veces por segundo no le hace falta a
      // nadie.
      vidaDeLaPista: vida,
      avisoDeLaPista: cuandoAvisa(),
      // Igual que la vida de la pista: el mismo arreglo, sin copiar.
      inclinacion,
      rebote: rebotoEn >= 0 ? { indice: rebotoEn, ms: msDelRebote } : null,
      cine,
      cineAvance:
        cine === 'entrada'
          ? Math.min(1, cineMs / LUNA.msDeEntrada)
          : cine === 'salida'
            ? Math.min(1, cineMs / LUNA.msDeSalida)
            : cine === 'fin'
              ? 1
              : 0,
      pasitos,
      caidas,
      plataformas,
    }
  }

  function bucle(ms: number) {
    animacion = requestAnimationFrame(bucle)

    const transcurrido = Math.min((ms - ultimoMs) / 1000, PASO * PASOS_MAXIMOS)
    ultimoMs = ms
    acumulador += transcurrido

    while (acumulador >= PASO) {
      previo = { ...t }
      paso()
      acumulador -= PASO
    }

    pintar(interpolar(acumulador / PASO))
  }

  return {
    iniciar() {
      if (andando) return
      andando = true
      ultimoMs = performance.now()
      acumulador = 0
      animacion = requestAnimationFrame(bucle)
    },
    detener() {
      andando = false
      cancelAnimationFrame(animacion)
    },
    presionar,
    soltar,
    empezar() {
      if (cine !== 'espera') return
      cine = 'entrada'
      cineMs = 0
    },
    medirVista(alto: number) {
      altoVista = alto
      camara = camaraObjetivo()
    },
    cuenta: () => ({ pasitos, caidas }),
  }
}
