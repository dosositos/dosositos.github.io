import { CAIDA, CANSANCIO, EMPUJON, IMPULSO, MUNDO, PISTA, SALTO, TORTUGA } from '@/content/luna'
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

/** Cuántos píxeles del mundo camina entre una patica y la otra. */
const PASITO = 11

/**
 * Lo que se le perdona al aterrizar justo en la punta. Sin este
 * margen, rozar la orilla es caerse, y desde el teléfono se siente
 * robado.
 */
const ORILLA = 2

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
  /** Si ya se ganó el empujón, se puede gastar una vez este capítulo. */
  conEmpujon?: boolean
  /** Se llama una vez por frame con la escena ya interpolada. */
  pintar: (escena: EscenaLuna) => void
  /** Vibración, sonido y demás cosas de afuera. */
  alEvento?: (evento: EventoLuna) => void
}

export interface Motor {
  iniciar: () => void
  detener: () => void
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

export function crearMotor({ nivel, conEmpujon, pintar, alEvento }: OpcionesMotor): Motor {
  const { plataformas } = nivel

  /**
   * Lo que le queda a cada tramo antes de borrarse, de 1 a 0. En los
   * capítulos donde la pista no se desvanece se queda todo en 1 y no
   * pasa nada.
   */
  const vida: number[] = plataformas.map(() => 1)

  /** Los tramos que ya empezaron a irse. */
  const yendose: boolean[] = plataformas.map(() => false)

  /**
   * Hasta el primer lazo no se borra nada. Los primeros saltos son
   * para aprender, y aprender con el suelo desapareciendo no se puede.
   */
  const primerLazo = nivel.hitos[0]?.indice ?? plataformas.length

  /** En qué tramo está parada. -1 es en el aire. */
  let ultimoPiso = 0

  /** ¿Le queda el empujón por gastar en este capítulo? */
  let empujon = conEmpujon === true

  /** Un tramo se puede pisar mientras no se haya borrado del todo. */
  const sigueAhi = (p: Plataforma) => vida[p.indice] > 0

  /** Dónde reaparece: la salida, o el último hito que haya pisado. */
  const reaparicion = { ...nivel.salida }

  /** El hito más alto pisado. -1 es «todavía ninguno». */
  let hitoAlcanzado = -1

  /** Cuántos saltos dio y cuántas veces se cayó, en esta subida. */
  let pasitos = 0
  let caidas = 0

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

  /** La plataforma que está pisando, si es que pisa alguna. */
  function sueloDebajo(): Plataforma | undefined {
    return plataformas.find(
      (p) =>
        sigueAhi(p) &&
        Math.abs(t.y - p.y) < 0.5 &&
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
      yendose[i] = false
    }

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
    ultimoPiso = Math.max(hitoAlcanzado, 0)
    previo = { ...t }
    avisar('reaparicion')
  }

  function paso() {
    reloj += PASO

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

    // Los tramos que ya despegó se van borrando. Al llegar a cero
    // dejan de existir para todo: no se pisan y no se dibujan.
    if (nivel.seDesvanece) {
      for (let i = 0; i < vida.length; i += 1) {
        if (yendose[i] && vida[i] > 0) {
          vida[i] = Math.max(0, vida[i] - (PASO * 1000) / PISTA.msParaIrse)
        }
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
        // Se pasó de la orilla caminando. Cae, pero con el perdón
        // del borde todavía puede saltar un instante.
        t.enSuelo = false
        t.sinSuelo = 0
      } else if (!t.cargando) {
        ultimoPiso = piso.indice

        // Camina sola de un extremo al otro. Ese ir y venir es el
        // reloj del juego: marca hacia dónde va a salir.
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
          if (dentro && yAntes <= p.y && t.y >= p.y) {
            t.y = p.y

            // Se la mete adentro de la plataforma en el mismo frame
            // del golpe, que es donde no se nota. Aterrizando en la
            // punta se quedaba con el centro fuera del suelo: al paso
            // siguiente no había plataforma debajo para caminar, se
            // dejaba caer, el perdón de la orilla la volvía a subir y
            // ahí se quedaba, aplastada y parpadeando, hasta saltar.
            const orilla = Math.min(TORTUGA.ancho / 2, p.ancho / 2)
            t.x = Math.min(Math.max(t.x, p.x + orilla), p.x + p.ancho - orilla)

            t.vx = 0
            t.vy = 0
            t.enSuelo = true
            t.sinSuelo = 0
            t.desdeAterrizaje = 0
            ultimoPiso = p.indice
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

    if (nivel.seDesvanece && ultimoPiso > primerLazo) yendose[ultimoPiso] = true
    ultimoPiso = -1
  }

  function presionar() {
    if (cayendo > 0 || tirada > 0 || t.cargando) return

    // El perdón del borde: si acaba de dejar la plataforma, se la
    // devuelve al suelo para que pueda cargar el salto.
    if (!t.enSuelo && t.sinSuelo * 1000 <= SALTO.msDePerdon) {
      const piso = plataformas.find(
        (p) =>
          sigueAhi(p) && t.x >= p.x && t.x <= p.x + p.ancho && t.y <= p.y + 40 && t.y >= p.y - 40,
      )
      if (piso) {
        t.y = piso.y
        t.vy = 0
        t.enSuelo = true
      }
    }

    if (!t.enSuelo) {
      // El empujón: un toque más en el aire y sale un poco más para
      // adelante. Solo mientras cae, que es cuando se ve venir que el
      // salto salió corto, y así tampoco se gasta sin querer tocando
      // de más al despegar.
      if (empujon && t.vy > 0) {
        empujon = false
        t.vx += t.mirando * EMPUJON.fuerza
        avisar('empujon')
      }
      return
    }

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
      tieneEmpujon: empujon,
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
    medirVista(alto: number) {
      altoVista = alto
      camara = camaraObjetivo()
    },
    cuenta: () => ({ pasitos, caidas }),
  }
}
