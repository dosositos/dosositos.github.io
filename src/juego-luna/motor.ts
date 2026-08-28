import { MUNDO, SALTO, TORTUGA } from '@/content/luna'
import type { EscenaLuna, EventoLuna, Plataforma } from '@/types'

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

interface Tortuga {
  x: number
  y: number
  vx: number
  vy: number
  mirando: 1 | -1
  enSuelo: boolean
  cargando: boolean
  carga: number
  caminado: number
  /** Segundos desde que dejó el suelo, para el perdón del borde. */
  sinSuelo: number
  desdeSalto: number
  desdeAterrizaje: number
}

export interface OpcionesMotor {
  plataformas: Plataforma[]
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
}

const gradosARadianes = (grados: number) => (grados * Math.PI) / 180

export function crearMotor({ plataformas, pintar, alEvento }: OpcionesMotor): Motor {
  const primera = plataformas[0]

  /** Dónde reaparece. En la fase 1 es el centro de la única plataforma. */
  const reaparicion = {
    x: primera ? primera.x + primera.ancho / 2 : MUNDO.ancho / 2,
    y: primera ? primera.y : MUNDO.alto / 2,
  }

  const t: Tortuga = {
    x: reaparicion.x,
    y: reaparicion.y,
    vx: 0,
    vy: 0,
    mirando: 1,
    enSuelo: true,
    cargando: false,
    carga: 0,
    caminado: 0,
    sinSuelo: 0,
    desdeSalto: 9999,
    desdeAterrizaje: 9999,
  }

  /** Copia del paso anterior, para interpolar el dibujo. */
  let previo = { ...t }

  /** Segundos que faltan de la caída antes de reaparecer. */
  let cayendo = 0

  let acumulador = 0
  let ultimoMs = 0
  let animacion = 0
  let andando = false

  const avisar = (evento: EventoLuna) => alEvento?.(evento)

  /** La plataforma que está pisando, si es que pisa alguna. */
  function sueloDebajo(): Plataforma | undefined {
    return plataformas.find(
      (p) => Math.abs(t.y - p.y) < 0.5 && t.x >= p.x && t.x <= p.x + p.ancho,
    )
  }

  function volverAlHito() {
    t.x = reaparicion.x
    t.y = reaparicion.y
    t.vx = 0
    t.vy = 0
    t.mirando = 1
    t.enSuelo = true
    t.cargando = false
    t.carga = 0
    t.sinSuelo = 0
    previo = { ...t }
    avisar('reaparicion')
  }

  function paso() {
    if (cayendo > 0) {
      cayendo -= PASO
      if (cayendo <= 0) volverAlHito()
      return
    }

    t.desdeSalto += PASO * 1000
    t.desdeAterrizaje += PASO * 1000

    if (t.cargando) {
      // La barra sube y se queda arriba. No rebota ni se reinicia:
      // castigar dos veces el mismo error es mezquino.
      t.carga = Math.min(1, t.carga + (PASO * 1000) / SALTO.msDeCarga)
    }

    if (t.enSuelo) {
      const piso = sueloDebajo()

      if (!piso) {
        // Se pasó de la orilla caminando. Cae, pero con el perdón
        // del borde todavía puede saltar un instante.
        t.enSuelo = false
        t.sinSuelo = 0
      } else if (!t.cargando) {
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
      if (t.x < 0) {
        t.x = 0
        t.vx = Math.abs(t.vx) * 0.4
      } else if (t.x > MUNDO.ancho) {
        t.x = MUNDO.ancho
        t.vx = -Math.abs(t.vx) * 0.4
      }

      // Solo se aterriza cayendo, y solo si en este paso se cruzó la
      // línea de arriba de la plataforma. Comparar el antes con el
      // después es lo que evita atravesarla en un salto rápido.
      if (t.vy > 0) {
        for (const p of plataformas) {
          const dentro = t.x >= p.x - 2 && t.x <= p.x + p.ancho + 2
          if (dentro && yAntes <= p.y && t.y >= p.y) {
            t.y = p.y
            t.vx = 0
            t.vy = 0
            t.enSuelo = true
            t.sinSuelo = 0
            t.desdeAterrizaje = 0
            avisar('aterrizaje')
            break
          }
        }
      }

      if (t.y > MUNDO.alto + 120) {
        cayendo = MS_CAIDA / 1000
        t.cargando = false
        t.carga = 0
        avisar('caida')
      }
    }
  }

  function presionar() {
    if (cayendo > 0 || t.cargando) return

    // El perdón del borde: si acaba de dejar la plataforma, se la
    // devuelve al suelo para que pueda cargar el salto.
    if (!t.enSuelo && t.sinSuelo * 1000 <= SALTO.msDePerdon) {
      const piso = plataformas.find(
        (p) => t.x >= p.x && t.x <= p.x + p.ancho && t.y <= p.y + 40 && t.y >= p.y - 40,
      )
      if (piso) {
        t.y = piso.y
        t.vy = 0
        t.enSuelo = true
      }
    }

    if (!t.enSuelo) return

    t.cargando = true
    t.carga = 0
  }

  function soltar() {
    if (!t.cargando) return

    const impulso = SALTO.impulsoMinimo + (SALTO.impulsoMaximo - SALTO.impulsoMinimo) * t.carga
    const angulo = gradosARadianes(SALTO.angulo)

    t.vx = Math.cos(angulo) * impulso * t.mirando
    t.vy = -Math.sin(angulo) * impulso
    t.enSuelo = false
    t.cargando = false
    t.carga = 0
    t.sinSuelo = 999
    t.desdeSalto = 0
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
      desdeSalto: t.desdeSalto,
      desdeAterrizaje: t.desdeAterrizaje,
      cayendo: cayendo > 0,
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
  }
}
