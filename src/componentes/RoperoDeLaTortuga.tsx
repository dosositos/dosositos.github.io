import { useEffect, useRef, useState } from 'react'
import { ROPERO, TEXTOS_DEL_ROPERO, TORTUGA } from '@/content/luna'
import { conNombre } from '@/juego-luna/nombrar'
import { escenaDeVitrina, estaGanado, loQueLeFalta, RANURAS } from '@/juego-luna/ropero'
import { dibujarTortuga } from '@/juego-luna/tortuga'
import type { ProgresoLuna, PuestoEnLaTortuga, RanuraDeLaTortuga } from '@/types'

/**
 * El ropero: donde ella le pone y le quita cosas a la tortuga.
 *
 * Sale del cartel de cada capítulo, con un botón, y se puede saltar
 * entera. Vestirla no puede ser un peaje antes de jugar.
 *
 * Lo que la hace funcionar es **la tortuga de arriba**. Una lista de
 * nombres no dice nada: hay que verla puesta, y hay que verla en el
 * momento de tocarla, no después de cerrar y empezar el capítulo. Por
 * eso el retrato es el dibujo de verdad, el mismo del juego, andando en
 * su propio bucle.
 *
 * Lo bloqueado se enseña igual, apagado y con lo que falta escrito
 * debajo. Esconderlo dejaría el ropero medio vacío el primer día y sin
 * nada que perseguir.
 */

/**
 * Lo que se ve de mundo en el retrato.
 *
 * Sale del alto de la tortuga y no de un número suelto: el día que se
 * la agrande o se la achique en `luna.ts`, el retrato la sigue en vez
 * de dejarla cortada por la cabeza.
 */
const VITRINA = { ancho: TORTUGA.alto * 2.4, alto: TORTUGA.alto * 1.55 }

function Vitrina({ puesto }: { puesto: PuestoEnLaTortuga }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  /*
   * Lo puesto entra por una referencia además de por la propiedad: el
   * bucle de dibujo se monta una sola vez y no vuelve a nacer al
   * cambiarle el gorro. Sin esto, cada toque tiraba el bucle y montaba
   * otro, y el reloj volvía a cero: las antenitas pegaban un salto en
   * cada elección.
   */
  const puestoRef = useRef(puesto)
  puestoRef.current = puesto

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const densidad = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = VITRINA.ancho * densidad
    canvas.height = VITRINA.alto * densidad

    let cuadro = 0
    const nacio = performance.now()

    const pintar = (ahora: number) => {
      ctx.setTransform(densidad, 0, 0, densidad, 0, 0)
      ctx.clearRect(0, 0, VITRINA.ancho, VITRINA.alto)

      const escena = escenaDeVitrina((ahora - nacio) / 1000)
      escena.x = VITRINA.ancho / 2
      // Los pies un poco por encima del borde de abajo, para que quepa
      // la sombra.
      escena.y = VITRINA.alto - 9

      // La sombra. Es una elipse y nada más, pero sin ella la tortuga
      // se ve flotando en un cuadro negro en vez de parada en algún
      // sitio, y una tortuga flotando no invita a vestirla.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)'
      ctx.beginPath()
      ctx.ellipse(escena.x, escena.y + 1.5, 16, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      dibujarTortuga(ctx, escena, undefined, puestoRef.current)
      cuadro = requestAnimationFrame(pintar)
    }

    cuadro = requestAnimationFrame(pintar)
    return () => cancelAnimationFrame(cuadro)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      // Se dibuja en las unidades del mundo y se estira con CSS: así el
      // tamaño del retrato no cambia el tamaño de la tortuga.
      style={{ width: VITRINA.ancho * 1.6, height: VITRINA.alto * 1.6 }}
      aria-hidden
      className="block"
    />
  )
}

/** Una cosa del ropero, ganada o todavía no. */
function Ficha({
  nombre,
  nota,
  falta,
  elegida,
  alTocar,
}: {
  nombre: string
  nota: string
  /** Lo que le falta para ganárselo, o vacío si ya es suyo. */
  falta: string
  elegida: boolean
  alTocar: () => void
}) {
  const ganada = falta === ''

  return (
    <button
      type="button"
      onClick={ganada ? alTocar : undefined}
      disabled={!ganada}
      aria-pressed={ganada ? elegida : undefined}
      className={`h-full rounded-2xl border px-4 py-3 text-left transition-colors ${
        elegida
          ? 'border-tulipan-amarillo bg-tulipan-amarillo/15'
          : ganada
            ? 'border-margarita/20 hover:border-margarita/45'
            : 'border-margarita/10 opacity-50'
      }`}
    >
      <span className="fuente-mano block text-lg leading-tight text-margarita">{nombre}</span>
      {ganada ? (
        <span className="mt-1 block text-[0.72rem] leading-snug text-margarita/45">{nota}</span>
      ) : (
        // Lo que hay que hacer, en imperativo y sin nada delante. Va en
        // el color del juego y no en gris: es lo que hay que perseguir,
        // no una advertencia.
        <span className="mt-1 block text-[0.72rem] leading-snug text-tulipan-amarillo/70">
          {falta}
        </span>
      )}
    </button>
  )
}

export function RoperoDeLaTortuga({
  progreso,
  nombre,
  alPonerse,
  alCerrar,
}: {
  progreso: ProgresoLuna
  /** Como ella le puso, o vacío si todavía no le puso ninguno. */
  nombre: string
  /** Poner o quitar. `id` vacío es quitarle lo de esa ranura. */
  alPonerse: (ranura: RanuraDeLaTortuga, id: string) => void
  alCerrar: () => void
}) {
  /*
   * Lo que se ve puesto sale del progreso que llega de fuera, no de un
   * estado de aquí. Es lo mismo que ya está guardado, así que copiarlo
   * a un estado local sería tener dos verdades y elegir mal una de las
   * dos el día que algo más lo cambie.
   */
  const puesto = progreso.puesto

  const [ganadas] = useState(() => ROPERO.filter((a) => estaGanado(a, progreso)).length)

  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => e.key === 'Escape' && alCerrar()
    window.addEventListener('keydown', alTecla)
    return () => window.removeEventListener('keydown', alTecla)
  }, [alCerrar])

  return (
    <div className="absolute inset-0 overflow-y-auto bg-[#0b1026] px-5 pt-20 pb-10">
      <div className="anima-aparecer mx-auto flex w-full max-w-md flex-col">
        <h2 className="fuente-mano text-center text-3xl text-tulipan-amarillo">
          {TEXTOS_DEL_ROPERO.titulo}
        </h2>
        <p className="mt-2 text-center text-[0.95rem] leading-relaxed text-margarita/70">
          {conNombre(TEXTOS_DEL_ROPERO.bajada, nombre)}
        </p>

        {/* Ella, con lo que lleve puesto ahora mismo. */}
        <div className="mt-4 flex justify-center">
          <Vitrina puesto={puesto} />
        </div>

        <p className="text-center text-xs tracking-wide text-margarita/35">
          {TEXTOS_DEL_ROPERO.cuenta
            .replace('{cuantos}', String(ganadas))
            .replace('{total}', String(ROPERO.length))}
        </p>

        {RANURAS.map((ranura) => {
          const deAqui = ROPERO.filter((a) => a.ranura === ranura)
          if (deAqui.length === 0) return null

          return (
            <section key={ranura} className="mt-7">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[0.68rem] uppercase tracking-[0.24em] text-margarita/45">
                  {TEXTOS_DEL_ROPERO.ranuras[ranura]}
                </h3>

                {/* Quitarse lo de esta ranura. Sale solo si trae algo
                    puesto: un «quitar» apagado en las cuatro ranuras
                    desde el primer día es cuatro botones que no hacen
                    nada. Y va aquí y no como una ficha más, porque de
                    ficha eran cuatro cuadros vacíos ocupando media
                    pantalla en el sitio donde tiene que estar la ropa. */}
                {puesto[ranura] ? (
                  <button
                    type="button"
                    onClick={() => alPonerse(ranura, '')}
                    className="text-xs text-margarita/50 underline decoration-margarita/20 underline-offset-4 transition-colors hover:text-tulipan-amarillo"
                  >
                    {TEXTOS_DEL_ROPERO.quitar}
                  </button>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-2 items-stretch gap-2">
                {deAqui.map((a) => (
                  <Ficha
                    key={a.id}
                    nombre={a.nombre}
                    nota={a.nota}
                    falta={
                      estaGanado(a, progreso)
                        ? ''
                        : loQueLeFalta(a, TEXTOS_DEL_ROPERO.llaves)
                    }
                    elegida={puesto[ranura] === a.id}
                    alTocar={() => alPonerse(ranura, a.id)}
                  />
                ))}
              </div>
            </section>
          )
        })}

        <button
          type="button"
          onClick={alCerrar}
          className="mt-9 w-full rounded-full bg-tulipan-amarillo px-8 py-4 font-display text-lg text-[#0b1026] transition-transform hover:-translate-y-0.5"
        >
          {TEXTOS_DEL_ROPERO.cerrar}
        </button>
      </div>
    </div>
  )
}
