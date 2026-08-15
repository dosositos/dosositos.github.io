import { useMemo } from 'react'

interface Props {
  /** Cuántas estrellas. En móvil conviene bajarlo. */
  cantidad?: number
  className?: string
}

/**
 * Fondo nocturno con estrellas. Se genera una sola vez con posiciones
 * pseudoaleatorias estables (semilla fija) para que no bailen en cada
 * render ni cambien entre visitas.
 */
export function CieloEstrellado({ cantidad = 90, className = '' }: Props) {
  const estrellas = useMemo(() => {
    let semilla = 24_11_2024 // nuestra fecha, de semilla
    const aleatorio = () => {
      semilla = (semilla * 1664525 + 1013904223) % 4294967296
      return semilla / 4294967296
    }

    return Array.from({ length: cantidad }, () => ({
      x: aleatorio() * 100,
      y: aleatorio() * 100,
      tamanio: 1 + aleatorio() * 2.2,
      retraso: aleatorio() * 6,
      duracion: 3 + aleatorio() * 4,
      opacidad: 0.3 + aleatorio() * 0.6,
    }))
  }, [cantidad])

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* Degradado de fondo: más claro arriba, noche cerrada abajo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--t-fondo-2),var(--t-fondo)_60%)]" />

      {estrellas.map((e, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-acento-2"
          style={{
            left: `${e.x}%`,
            top: `${e.y}%`,
            width: e.tamanio,
            height: e.tamanio,
            opacity: e.opacidad,
            animation: `parpadeo-estrella ${e.duracion}s ease-in-out ${e.retraso}s infinite`,
          }}
        />
      ))}

      {/* Un par de nebulosas suaves con los colores de las flores */}
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-rosa-pastel/5 blur-[120px]" />
      <div className="absolute -right-32 top-2/3 h-96 w-96 rounded-full bg-girasol/5 blur-[120px]" />
    </div>
  )
}
