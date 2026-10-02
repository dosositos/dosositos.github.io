import { useEffect, useLayoutEffect } from 'react'

/**
 * Al cambiar de página, volver arriba; al volver atrás, volver a donde estaba.
 *
 * React Router conserva la posición del scroll cuando cambia la ruta, así
 * que al entrar en un momento desde la mitad de la portada, la cápsula se
 * abría por la mitad y las animaciones de entrada ya habían pasado. Pero
 * subir siempre también estaba mal: al salir de un momento con «atrás», la
 * línea del tiempo (unos 7000 px) se le reabría arriba de todo.
 *
 * Por eso: al avanzar (`PUSH`/`REPLACE`) se sube; al volver (`POP`) se
 * restaura lo que se guardó para esa entrada del historial (`location.key`).
 *
 * Se monta una vez por página, DENTRO de la hoja que se anima: con
 * `AnimatePresence mode="wait"` la página nueva recién aparece cuando la
 * vieja terminó de irse, y es entonces —no antes— cuando hay que mover el
 * scroll. La clave y si se está volviendo llegan por props y no por `useLocation`: la
 * hoja que se está yendo tiene que seguir guardando con SU clave.
 *
 * Los cambios de solo hash no remontan la hoja, así que los enlaces a una
 * sección concreta siguen funcionando.
 */
export function ScrollAlInicio({ clave, vuelve }: { clave: string; vuelve: boolean }) {
  // Arriba, antes de pintar: si no, la página nueva se asoma un cuadro
  // a la altura donde estaba la vieja.
  useLayoutEffect(() => {
    if (!vuelve) irA(0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cuadro = 0

    // Al volver, la página puede tardar en tener su alto de verdad (lo
    // cifrado se abre después). Se reintenta cuadro a cuadro hasta que el
    // documento dé para llegar, un segundo como mucho, y ahí se salta igual.
    const objetivo = vuelve ? (posiciones().get(clave) ?? 0) : 0
    if (objetivo > 0) {
      const inicio = performance.now()
      const intentar = () => {
        const alcanza = document.documentElement.scrollHeight - window.innerHeight >= objetivo
        if (alcanza || performance.now() - inicio > 1000) {
          irA(objetivo)
          return
        }
        cuadro = requestAnimationFrame(intentar)
      }
      intentar()
    }

    // Se va anotando dónde está, un cuadro como mucho por evento.
    let pendiente = 0
    const anotar = () => {
      if (pendiente) return
      pendiente = requestAnimationFrame(() => {
        pendiente = 0
        // borrar antes de poner la deja al final: la más reciente
        posiciones().delete(clave)
        posiciones().set(clave, window.scrollY)
      })
    }
    window.addEventListener('scroll', anotar, { passive: true })
    window.addEventListener('pagehide', guardar)

    return () => {
      cancelAnimationFrame(cuadro)
      cancelAnimationFrame(pendiente)
      window.removeEventListener('scroll', anotar)
      window.removeEventListener('pagehide', guardar)
      guardar()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// 'instant' a propósito: con scroll-behavior: smooth en el html, un salto
// animado desde el pie de una página larga se ve como un tirón.
function irA(top: number) {
  window.scrollTo({ top, left: 0, behavior: 'instant' })
}

/* Las posiciones viven en memoria y se copian a sessionStorage al salir de
   cada página: las claves de React Router van en history.state, así que
   sobreviven a una recarga, y las posiciones también tienen que hacerlo. */
const LLAVE = 'dosositos:scroll'
let memoria: Map<string, number> | null = null

function posiciones() {
  if (!memoria) {
    memoria = new Map()
    try {
      const guardadas = JSON.parse(sessionStorage.getItem(LLAVE) ?? '[]') as [string, number][]
      memoria = new Map(guardadas)
    } catch {
      // sin sessionStorage (navegación privada vieja) se queda en memoria
    }
    // Con la restauración del navegador encendida, él y nosotros nos
    // peleamos el scroll al volver.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }
  return memoria
}

function guardar() {
  try {
    // Solo las últimas cincuenta: nadie vuelve atrás cincuenta páginas.
    sessionStorage.setItem(LLAVE, JSON.stringify([...posiciones()].slice(-50)))
  } catch {
    // lleno o bloqueado: da igual, lo de memoria sigue sirviendo
  }
}
