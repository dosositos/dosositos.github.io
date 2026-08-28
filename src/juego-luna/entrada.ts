/**
 * El dedo y el teclado del juego de la luna.
 *
 * Un solo gesto: mantener y soltar. Lo demás es evitar que el
 * navegador se meta — que no interprete el mantener como un arrastre
 * de la página, que no salte el menú de copiar al dejar el dedo
 * quieto, y que la barra espaciadora no baje la pantalla.
 */

export interface ManosDelJuego {
  presionar: () => void
  soltar: () => void
}

export function conectarEntrada(elemento: HTMLElement, manos: ManosDelJuego): () => void {
  /**
   * Si el dedo sale del canvas o el sistema se roba el gesto (una
   * llamada, la barra del navegador), hay que soltar igual. Si no, la
   * tortuga se queda cargando para siempre y el juego se muere en la
   * mano.
   */
  const abajo = (e: PointerEvent) => {
    e.preventDefault()
    elemento.setPointerCapture?.(e.pointerId)
    manos.presionar()
  }

  const arriba = (e: PointerEvent) => {
    e.preventDefault()
    manos.soltar()
  }

  /** La barra espaciadora repite sola mientras se mantiene: se ignora. */
  const tecla = (e: KeyboardEvent) => {
    if (e.code !== 'Space' && e.key !== ' ') return
    e.preventDefault()
    if (e.repeat) return
    manos.presionar()
  }

  const teclaArriba = (e: KeyboardEvent) => {
    if (e.code !== 'Space' && e.key !== ' ') return
    e.preventDefault()
    manos.soltar()
  }

  /** Que el teléfono no ofrezca copiar ni seleccionar al mantener. */
  const menu = (e: Event) => e.preventDefault()

  elemento.addEventListener('pointerdown', abajo)
  elemento.addEventListener('pointerup', arriba)
  elemento.addEventListener('pointercancel', arriba)
  elemento.addEventListener('contextmenu', menu)
  window.addEventListener('keydown', tecla)
  window.addEventListener('keyup', teclaArriba)
  window.addEventListener('blur', manos.soltar)

  return () => {
    elemento.removeEventListener('pointerdown', abajo)
    elemento.removeEventListener('pointerup', arriba)
    elemento.removeEventListener('pointercancel', arriba)
    elemento.removeEventListener('contextmenu', menu)
    window.removeEventListener('keydown', tecla)
    window.removeEventListener('keyup', teclaArriba)
    window.removeEventListener('blur', manos.soltar)
  }
}
