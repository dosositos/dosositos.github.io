import { useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ASOMO, fotoDelAsomo, fotoQuieta, pintarAsomo } from '@/juego-luna/asomo'
import { asomoDelDia } from '@/lib/asomo-del-dia'
import { numeroDelDia } from '@/lib/tiempo'

/**
 * El adelanto del juego de la luna, al final de la página.
 *
 * Debajo de la firma, en una sola página por día, la tortuga del
 * juego pasa caminando. Cuando ya está entera dentro del cuadro se
 * da cuenta de que la miran, le sale un «!» encima de la cabeza,
 * pega el brinco y se va corriendo por donde vino. Menos de tres
 * segundos, y el susto y la huida son uno.
 *
 * Tres decisiones que valen más que el código:
 *
 *  1. **Arranca cuando ella llega, no cuando carga la página.** Si
 *     empezara al abrir, la tortuga ya se habría ido para cuando
 *     terminara de bajar. Espera a que la franja esté a la vista.
 *  2. **Va debajo del pie, no encima.** Es lo último de todo: hay
 *     que llegar al final del scroll y todavía mirar un poco más
 *     abajo. Ahí es donde vive un asomo.
 *  3. **No se anuncia y no se puede tocar.** Ni botón, ni sombra, ni
 *     texto para el lector de pantalla. Si se pudiera tocar sería
 *     una sección más; lo que tiene que pasar es que ella lo vea de
 *     reojo y no sepa qué era.
 *
 * Con `prefers-reduced-motion` la tortuga no camina ni brinca: se
 * asoma quieta, aparece y se va con la opacidad. El guiño se
 * mantiene y no se sacude nada.
 */

/** Lo que espera después de asomar la franja, para que no arranque a media bajada. */
const MS_DE_ESPERA = 420

/** Lo que el alto de la página tiene que quedarse quieto antes de empezar a mirar. */
const MS_DE_ASENTARSE = 1400

/** Con el movimiento apagado: aparece, se queda y se va. */
const QUIETA = { entrada: 500, quedada: 2600, salida: 700 }
const MS_QUIETA = QUIETA.entrada + QUIETA.quedada + QUIETA.salida

export function AsomoDeLaTortuga() {
  const { pathname } = useLocation()
  const sinMovimiento = useReducedMotion()
  const dia = numeroDelDia()

  // Se recalcula solo al cambiar el día: ir y volver de una página
  // dentro de la misma visita no la manda a otro lado.
  const hoy = useMemo(() => asomoDelDia(dia), [dia])
  const aqui = hoy.ruta === pathname

  const cajaRef = useRef<HTMLDivElement>(null)
  const lienzoRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!aqui) return
    const caja = cajaRef.current
    const lienzo = lienzoRef.current
    if (!caja || !lienzo) return

    const ctx = lienzo.getContext('2d')
    if (!ctx) return

    let ancho = 0
    let cuadro = 0
    let arranque = 0
    let espera: ReturnType<typeof setTimeout> | undefined
    let andando = false

    /* El lienzo va a escala 1 a 1 con el mundo del juego: la tortuga
       mide lo mismo aquí que allá, que es todo el punto de un
       adelanto. La densidad de pantalla se pone aparte, para que en
       el teléfono no salga con los bordes dentados. */
    const medir = () => {
      const densidad = Math.min(window.devicePixelRatio || 1, 2.5)
      ancho = Math.max(1, Math.round(caja.clientWidth))
      lienzo.width = Math.round(ancho * densidad)
      lienzo.height = Math.round(ASOMO.alto * densidad)
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0)
    }

    const limpiar = () => {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, lienzo.width, lienzo.height)
      ctx.restore()
    }

    /** De 0 a 1, para la versión sin movimiento: entra, se queda, se va. */
    const opacidadQuieta = (ms: number) => {
      if (ms < QUIETA.entrada) return ms / QUIETA.entrada
      if (ms < QUIETA.entrada + QUIETA.quedada) return 1
      return Math.max(0, 1 - (ms - QUIETA.entrada - QUIETA.quedada) / QUIETA.salida)
    }

    const pintar = (ahora: number): void => {
      const ms = ahora - arranque
      limpiar()

      if (sinMovimiento) {
        ctx.save()
        ctx.globalAlpha = opacidadQuieta(ms)
        pintarAsomo(ctx, fotoQuieta(ancho, hoy.lado))
        ctx.restore()

        if (ms >= MS_QUIETA) {
          limpiar()
          andando = false
          return
        }
      } else {
        const foto = fotoDelAsomo(ms, ancho, hoy.lado)
        pintarAsomo(ctx, foto)
        if (foto.terminado) {
          andando = false
          return
        }
      }

      cuadro = requestAnimationFrame(pintar)
    }

    const empezar = () => {
      if (andando) return
      andando = true
      medir()
      arranque = performance.now()
      cuadro = requestAnimationFrame(pintar)
    }

    medir()

    /* Mientras no está andando, un cambio de ancho solo hay que
       apuntarlo. Si estuviera a media carrera, remedir le movería el
       punto del susto debajo de los pies, así que se la deja
       terminar: dura tres segundos. */
    const alRedimensionar = () => {
      if (!andando) medir()
    }
    window.addEventListener('resize', alRedimensionar)

    /* ── Cuándo arranca ──────────────────────────────────────────
       Tres condiciones, y las tres hacen falta:

        1. Que la franja esté a la vista.
        2. Que ella haya bajado (`scrollY > 0`). La franja es lo
           último de la página, así que verla sin haber bajado nada
           solo pasa cuando la página todavía no terminó de cargar:
           media web llega cifrada y en el primer pintado las
           estadísticas miden una pantalla. Sin esta condición la
           tortuga entra y se va mientras ella todavía mira el
           cargando, que es exactamente perderse el guiño.
        3. Que el alto de la página lleve un rato quieto, por lo
           mismo.

       Y una sola vez por visita: si se reiniciara cada vez que sube
       y baja, dejaría de ser algo que hay que alcanzar a ver. */
    let aLaVista = false

    const revisar = () => {
      if (andando || !aLaVista || window.scrollY <= 0) return
      mirilla.disconnect()
      window.removeEventListener('scroll', revisar)
      espera = setTimeout(empezar, MS_DE_ESPERA)
    }

    const mirilla = new IntersectionObserver(
      (entradas) => {
        aLaVista = entradas.some((e) => e.isIntersecting)
        revisar()
      },
      { threshold: 0.55 },
    )

    // La franja puede quedarse a la vista sin que la mirilla vuelva a
    // avisar —no hay transición que contar— así que el scroll también
    // pregunta.
    window.addEventListener('scroll', revisar, { passive: true })

    let asentando: ReturnType<typeof setTimeout> | undefined
    const armar = () => {
      crecimiento.disconnect()
      mirilla.observe(caja)
    }

    const crecimiento = new ResizeObserver(() => {
      clearTimeout(asentando)
      asentando = setTimeout(armar, MS_DE_ASENTARSE)
    })

    crecimiento.observe(document.body)
    asentando = setTimeout(armar, MS_DE_ASENTARSE)

    return () => {
      crecimiento.disconnect()
      mirilla.disconnect()
      window.removeEventListener('scroll', revisar)
      window.removeEventListener('resize', alRedimensionar)
      window.clearTimeout(asentando)
      window.clearTimeout(espera)
      cancelAnimationFrame(cuadro)
    }
  }, [aqui, hoy.lado, sinMovimiento])

  if (!aqui) return null

  return (
    <div
      ref={cajaRef}
      aria-hidden
      className="pointer-events-none relative w-full overflow-hidden"
      style={{ height: ASOMO.alto }}
    >
      <canvas ref={lienzoRef} className="block h-full w-full" />
    </div>
  )
}
