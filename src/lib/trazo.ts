import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { annotate } from 'rough-notation'

type Configuracion = Parameters<typeof annotate>[1]
type RoughAnnotation = ReturnType<typeof annotate>

/**
 * Los trazos a mano: subrayados, círculos, resaltados y corchetes que
 * parecen hechos con marcador encima del papel.
 *
 * Se dibujan una sola vez, cuando el elemento entra en pantalla, y con un
 * color de los que ya existen: se pide por el nombre de su variable
 * (`--t-acento`, `--color-girasol`) y se lee del tema activo, así que al
 * pasar de osito a osita el trazo cambia de tinta solo. Con movimiento
 * reducido aparece de una, sin que se vea la mano trazando.
 *
 * Ojo con lo que se escala o se gira al entrar: la librería mide en la
 * pantalla y dibuja en el papel, y un elemento a medio crecer deja el
 * trazo corrido. Para eso está `retraso`: que espere a que todo se quede
 * quieto. Mover de arriba a abajo no importa.
 */
export interface OpcionesTrazo {
  tipo: Configuracion['type']
  /** La variable del color: `--t-acento` o `var(--color-girasol)`. */
  color?: string
  /** Para los resaltados: casi transparente, que el texto se siga leyendo. */
  opacidad?: number
  grosor?: number
  vueltas?: number
  relleno?: Configuracion['padding']
  corchetes?: Configuracion['brackets']
  /** Milisegundos que tarda en trazarse. */
  duracion?: number
  /** Milisegundos de espera después de entrar en pantalla. */
  retraso?: number
  /** Para los textos que ocupan varias líneas. */
  multilinea?: boolean
  /** Con `false` no se dibuja nada (para trazar solo al ganador, por ejemplo). */
  activo?: boolean
}

/**
 * El color de una variable, ya resuelto en el tema de ahora. Se lee en el
 * propio elemento y no en la raíz: así alcanza también las tintas que
 * solo existen dentro del libro del diccionario.
 */
function leerColor(el: HTMLElement, variable: string, opacidad: number): string {
  const nombre = variable.replace(/^var\(\s*/, '').replace(/\s*\)$/, '')
  const estilo = getComputedStyle(el)
  const valor = estilo.getPropertyValue(nombre).trim() || estilo.getPropertyValue('--t-acento').trim()
  if (opacidad >= 1) return valor
  const hex = /^#([0-9a-f]{6})$/i.exec(valor)
  if (!hex) return valor
  const n = parseInt(hex[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacidad})`
}

export function useTrazo<T extends HTMLElement>({
  tipo,
  color = '--t-acento',
  opacidad = 1,
  grosor = 1.5,
  vueltas = 1,
  relleno,
  corchetes,
  duracion = 800,
  retraso = 300,
  multilinea = false,
  activo = true,
}: OpcionesTrazo) {
  const ref = useRef<T>(null)
  const reducido = useReducedMotion()
  // Los arreglos llegan nuevos en cada render; comparados como texto no
  // vuelven a dibujar el trazo cada vez que la página se repinta.
  const clave = JSON.stringify([tipo, color, opacidad, grosor, vueltas, relleno, corchetes, duracion, multilinea])

  useEffect(() => {
    const el = ref.current
    if (!el || !activo) return

    let trazo: RoughAnnotation | null = null
    let espera = 0
    let vivo = true

    const dibujar = () => {
      if (!vivo || !el.isConnected) return
      trazo = annotate(el, {
        type: tipo,
        color: leerColor(el, color, opacidad),
        strokeWidth: grosor,
        iterations: vueltas,
        padding: relleno,
        brackets: corchetes,
        animate: !reducido,
        animationDuration: duracion,
        multiline: multilinea,
      })
      trazo.show()
      // Si las letras llegan tarde, el texto cambia de ancho debajo del
      // trazo: se vuelve a calcular dónde va cuando ya estén todas.
      if (document.fonts.status !== 'loaded') {
        const antes = el.getBoundingClientRect()
        void document.fonts.ready.then(() => {
          const ahora = el.getBoundingClientRect()
          if (vivo && trazo?.isShowing() && (ahora.width !== antes.width || ahora.height !== antes.height)) {
            trazo.show()
          }
        })
      }
    }

    const mirador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return
        mirador.disconnect()
        espera = window.setTimeout(dibujar, retraso)
      },
      { threshold: 0.5 },
    )
    mirador.observe(el)

    // Al cambiar de osito a osita cambia la tinta. La librería repinta
    // sola al tocarle el color, y sin animar: no se vuelve a trazar.
    const tema = new MutationObserver(() => {
      if (trazo) trazo.color = leerColor(el, color, opacidad)
    })
    tema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] })

    return () => {
      vivo = false
      mirador.disconnect()
      tema.disconnect()
      window.clearTimeout(espera)
      trazo?.remove()
    }
    // `retraso` y `reducido` solo cuentan para el primer trazo.
  }, [clave, activo])

  return ref
}
