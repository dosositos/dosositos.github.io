import { useEffect, useState } from 'react'
import { Chat } from '@/componentes/Chat'
import { abrirSobreUnaVez, claveRecordada } from '@/lib/cripto'
import type { ChatGuardado, Mensaje } from '@/types'

/**
 * Una conversación real, sacada del archivo cifrado.
 *
 * Ninguna frase de estas viaja en claro dentro del código: viven en
 * public/cifrado/chats.enc y se abren aquí, en el teléfono, con la
 * misma frase que abrió la puerta. Como para llegar hasta acá ya hubo
 * que escribirla, ella no ve ningún candado extra: el chat aparece y ya.
 */

/** Todos los chats juntos, con el id del momento como llave. */
type Sobre = Record<string, Mensaje[]>

export function ChatCifrado({ id, ficha }: { id: string; ficha: ChatGuardado }) {
  const [mensajes, setMensajes] = useState<Mensaje[] | null>(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    const clave = claveRecordada()
    if (!clave) {
      setFallo(true)
      return
    }

    let vigente = true

    abrirSobreUnaVez<Sobre>('chats', clave)
      .then((sobre) => {
        if (!vigente) return
        const encontrados = sobre[id]
        if (encontrados) setMensajes(encontrados)
        else setFallo(true)
      })
      .catch(() => {
        if (vigente) setFallo(true)
      })

    // Si ella cambia de momento antes de que termine, no tocamos el estado.
    return () => {
      vigente = false
    }
  }, [id])

  if (mensajes) {
    return <Chat mensajes={mensajes} titulo={ficha.titulo ?? 'lo que nos dijimos'} fuente={ficha.fuente} />
  }

  // Falta el archivo o no abrió. En la web publicada no decimos nada —
  // no vale la pena mostrarle a ella un hueco. En desarrollo sí, fuerte,
  // porque casi siempre significa que falta correr `secretos:cifrar`.
  if (fallo) {
    if (!import.meta.env.DEV) return null
    return (
      <p className="rounded-xl border border-dashed border-hibisco/60 px-5 py-4 text-center text-sm text-hibisco">
        No pude abrir el chat de «{id}». ¿Corriste
        <code className="mx-1">npm run secretos:cifrar</code>
        después del último cambio en <code>private/publicable/chats.json</code>?
      </p>
    )
  }

  // Mientras descifra: un hueco de la altura aproximada, para que no salte
  // la página cuando aparezcan las burbujas.
  return (
    <div
      className="papel animate-pulse rounded-2xl opacity-40"
      style={{ height: Math.min(ficha.mensajes, 12) * 52 + 80 }}
      aria-hidden
    />
  )
}
