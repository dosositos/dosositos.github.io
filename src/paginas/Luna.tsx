import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { PLATAFORMAS_DE_PRUEBA, TEXTOS } from '@/content/luna'
import { crearPintor } from '@/juego-luna/dibujo'
import { conectarEntrada } from '@/juego-luna/entrada'
import { crearMotor } from '@/juego-luna/motor'
import type { EventoLuna } from '@/types'

/**
 * A la luna, a pasitos de tortuga.
 *
 * De la frase de siempre: «de aquí a la luna a pasitos de tortuga».
 * Una tortuga sube saltando hasta la luna y arriba hay una carta que
 * no está en ninguna otra parte de la web.
 *
 * Esta ruta no se enlaza desde ningún lado y no aparece en el menú.
 * Hasta que la luna de la portada se vuelva tocable (la última fase),
 * el juego no existe para ella y se puede dejar a medias sin que se
 * note nada raro en la web.
 *
 * Acá adentro React solo monta el canvas y se aparta: el bucle, la
 * física y el dibujo viven en `src/juego-luna/`, fuera de React. No
 * hay un solo render por frame.
 */
export function Luna() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cajaRef = useRef<HTMLDivElement>(null)
  const menosMovimiento = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const caja = cajaRef.current
    if (!canvas || !caja) return

    const pintor = crearPintor(canvas)
    pintor.movimientoReducido = menosMovimiento ?? false

    /**
     * La vibración es lo que hace que el salto se sienta en la mano.
     * Anda en el Android de ella, que es el teléfono que manda; en el
     * iPhone la API no existe y no pasa nada, que está bien.
     */
    const vibrar = (ms: number | number[]) => {
      try {
        navigator.vibrate?.(ms)
      } catch {
        /* algunos navegadores la tienen pero prohibida: da igual */
      }
    }

    const alEvento = (evento: EventoLuna) => {
      if (evento === 'salto') vibrar(12)
      else if (evento === 'caida') vibrar([0, 30])
      // Agotada: tres toquecitos, que se sienten como un tropiezo.
      else if (evento === 'agotada') vibrar([0, 14, 60, 14, 60, 26])
    }

    const motor = crearMotor({
      plataformas: PLATAFORMAS_DE_PRUEBA,
      pintar: (escena) => pintor.pintar(escena),
      alEvento,
    })

    /**
     * Medir con `visualViewport` y no con `innerHeight`: en Safari la
     * barra del navegador aparece y desaparece sola, y con
     * `innerHeight` el canvas queda más alto que lo que se ve. Además
     * hay que volver a medir cada vez que cambia.
     */
    const medir = () => {
      const vv = window.visualViewport
      const ancho = Math.round(vv?.width ?? window.innerWidth)
      const alto = Math.round(vv?.height ?? window.innerHeight)
      caja.style.height = `${alto}px`
      pintor.medir(ancho, alto)
    }

    medir()
    motor.iniciar()

    const desconectar = conectarEntrada(canvas, {
      presionar: motor.presionar,
      soltar: motor.soltar,
    })

    window.visualViewport?.addEventListener('resize', medir)
    window.visualViewport?.addEventListener('scroll', medir)
    window.addEventListener('orientationchange', medir)

    return () => {
      motor.detener()
      desconectar()
      window.visualViewport?.removeEventListener('resize', medir)
      window.visualViewport?.removeEventListener('scroll', medir)
      window.removeEventListener('orientationchange', medir)
    }
  }, [menosMovimiento])

  return (
    <div
      ref={cajaRef}
      className="fixed inset-0 z-30 overflow-hidden bg-[#0b1026] overscroll-none select-none"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label="A la luna, a pasitos de tortuga"
      />

      <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-xs text-margarita/50">
        {TEXTOS.ayudaTocar}
        <span className="hidden sm:inline"> · {TEXTOS.ayudaTeclado}</span>
      </p>
    </div>
  )
}
