import { useEffect, useState } from 'react'
import { abrirMedio, claveRecordada, indiceDeMedios, type FichaMedio } from '@/lib/cripto'
import type { Foto } from '@/types'

/**
 * Una foto que vive cifrada en el repositorio.
 *
 * Ninguna foto del regalo se publica en claro: en GitHub hay archivos
 * binarios con nombres que no dicen nada, y es acá, en el teléfono de
 * ella, donde se convierten en una imagen. Como la frase ya se escribió
 * en la puerta, ella no ve ningún candado: la foto aparece y ya.
 *
 * Mientras descifra se pinta el hueco del tamaño exacto y con el color
 * promedio de la foto — así la página no da saltos y el momento se
 * arma solo, como si la foto se estuviera revelando.
 */
export function FotoCifrada({
  foto,
  cual = 'grande',
  className = '',
  proporcion: proporcionPedida,
  ajuste = 'cover',
}: {
  foto: Foto
  cual?: 'grande' | 'mini'
  className?: string
  /**
   * Forma del hueco: '1 / 1' para la ventana de una polaroid. Sin esto
   * se usa la de la foto, que es lo que quiere el visor a pantalla
   * completa pero no el álbum, donde todas tienen que medir igual.
   */
  proporcion?: string
  ajuste?: 'cover' | 'contain'
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [ficha, setFicha] = useState<FichaMedio | null>(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    const clave = claveRecordada()
    if (!clave) {
      setFallo(true)
      return
    }

    let vigente = true

    indiceDeMedios(clave)
      .then((indice) => {
        if (vigente) setFicha(indice[foto.src] ?? null)
      })
      .catch(() => {})

    abrirMedio(foto.src, clave, cual)
      .then((u) => {
        if (vigente) setUrl(u)
      })
      .catch(() => {
        if (vigente) setFallo(true)
      })

    return () => {
      vigente = false
    }
  }, [foto.src, cual])

  const proporcion =
    proporcionPedida ?? (ficha?.ancho && ficha?.alto ? `${ficha.ancho} / ${ficha.alto}` : '3 / 4')

  if (fallo) {
    if (!import.meta.env.DEV) return null
    return (
      <div
        className="grid place-items-center rounded-sm border border-dashed border-hibisco/60 p-4 text-center text-xs text-hibisco"
        style={{ aspectRatio: proporcion }}
      >
        No pude abrir «{foto.src}». ¿Corriste <code>npm run fotos:optimizar</code>?
      </div>
    )
  }

  if (ficha?.tipo === 'video' && url) {
    return (
      <video
        src={url}
        className={className}
        style={{ aspectRatio: proporcion }}
        controls
        playsInline
        preload="metadata"
      />
    )
  }

  return (
    <img
      src={url ?? undefined}
      alt={foto.alt}
      loading="lazy"
      decoding="async"
      className={`${className} transition-opacity duration-700 ${url ? 'opacity-100' : 'opacity-0'}`}
      style={{
        aspectRatio: proporcion,
        backgroundColor: ficha?.color ?? 'var(--t-borde)',
        objectFit: ajuste,
        objectPosition: ajuste === 'cover' ? (foto.encuadre ?? 'center') : undefined,
      }}
    />
  )
}
