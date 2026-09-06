import { useState } from 'react'
import { SONIDO } from '@/content/luna'
import { apagarMusica, arrancarMusica } from '@/juego-luna/musica'
import { cambiarSonido, sonar, sonidoEncendido } from '@/juego-luna/sonidos'

/**
 * EL INTERRUPTOR DEL SONIDO
 *
 * Una pastillita chiquita que dice cómo está y se toca para cambiarlo.
 * Sale donde hay algo que leer y no encima del juego: en la portada de
 * la escuelita y en el cartel de cada capítulo. Mientras la tortuga
 * camina no hay ni un botón en la pantalla, y este no va a ser el
 * primero.
 *
 * **Manda sobre las dos cosas**, los pops y la música de fondo. Un
 * botón solo, no dos: cuando alguien quiere que se calle, quiere que se
 * calle todo, y no elegir cuál de las dos mitades.
 *
 * Al encenderlo suena el pop del salto, una vez. Es la única manera de
 * que se entere de qué acaba de encender sin tener que saltar a
 * ciegas — y de paso comprueba, ahí mismo, que el teléfono no está en
 * silencio.
 */
export function InterruptorDeSonido({ className = '' }: { className?: string }) {
  const [encendido, setEncendido] = useState(sonidoEncendido)

  const cambiar = () => {
    const ahora = !encendido
    cambiarSonido(ahora)
    setEncendido(ahora)

    if (ahora) {
      sonar('salto')
      // Este clic es un toque suyo, que es justo lo que el navegador
      // estaba esperando para dejar sonar algo.
      void arrancarMusica()
    } else {
      apagarMusica()
    }
  }

  return (
    <button
      type="button"
      onClick={cambiar}
      aria-pressed={encendido}
      aria-label={SONIDO.etiqueta}
      className={`self-center rounded-full border px-4 py-1.5 text-xs transition-colors ${
        encendido
          ? 'border-tulipan-amarillo/50 text-tulipan-amarillo/85'
          : 'border-margarita/20 text-margarita/45 hover:border-tulipan-amarillo/50 hover:text-tulipan-amarillo/85'
      } ${className}`}
    >
      {encendido ? SONIDO.encendido : SONIDO.apagado}
    </button>
  )
}
