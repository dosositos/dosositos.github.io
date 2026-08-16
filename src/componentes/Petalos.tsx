import { useMemo } from 'react'

const FLORES = [
  'var(--color-rosa-pastel)',
  'var(--color-tulipan-amarillo)',
  'var(--color-tulipan-violeta)',
  'var(--color-hibisco)',
  'var(--color-rosa-roja)',
  'var(--color-nube)',
]

/**
 * Lluvia lenta de pétalos con los colores de nuestras flores.
 * Puramente CSS: no cuesta batería ni bloquea el scroll.
 */
export function Petalos({ cantidad = 14 }: { cantidad?: number }) {
  const petalos = useMemo(() => {
    let semilla = 24_08_2024
    const aleatorio = () => {
      semilla = (semilla * 1103515245 + 12345) % 2147483648
      return semilla / 2147483648
    }

    return Array.from({ length: cantidad }, () => ({
      izquierda: aleatorio() * 100,
      duracion: 14 + aleatorio() * 16,
      retraso: -aleatorio() * 25,
      tamanio: 7 + aleatorio() * 9,
      deriva: (aleatorio() - 0.5) * 220,
      color: FLORES[Math.floor(aleatorio() * FLORES.length)],
      // Bajos a propósito: los pétalos son el fondo, no el contenido. Con
      // más opacidad se llevaban la atención de las fotos y los relatos.
      opacidad: 0.12 + aleatorio() * 0.16,
    }))
  }, [cantidad])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
      {petalos.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{
            left: `${p.izquierda}%`,
            width: p.tamanio,
            height: p.tamanio * 0.72,
            background: p.color,
            opacity: p.opacidad,
            // Forma de pétalo: una esquina redonda y la opuesta en punta
            borderRadius: '80% 10% 80% 10%',
            filter: 'blur(0.3px)',
            ['--deriva' as string]: `${p.deriva}px`,
            animation: `caer-petalo ${p.duracion}s linear ${p.retraso}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
