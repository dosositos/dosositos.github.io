import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Al cambiar de página, volver arriba.
 *
 * React Router conserva la posición del scroll cuando cambia la ruta, así
 * que al entrar en un momento desde la mitad de la portada, la cápsula se
 * abría por la mitad y las animaciones de entrada ya habían pasado.
 *
 * Salta solo cuando cambia la ruta, no cuando cambia el hash: así los
 * enlaces a una sección concreta siguen funcionando.
 */
export function ScrollAlInicio() {
  const { pathname } = useLocation()

  useEffect(() => {
    // 'instant' a propósito: con scroll-behavior: smooth en el html, un salto
    // animado desde el pie de una página larga se ve como un tirón.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
