/**
 * Una estrellita de papel de las que se doblan a mano, esas gorditas de
 * cinco puntas que se guardan en un frasco.
 *
 * Está dibujada, no es un emoji: el emoji de estrella es amarillo y
 * plano en todos lados, y aquí cada estrellita tiene el color del
 * mensajito que lleva doblado adentro. Los pliegues son triángulos
 * alternos oscurecidos — es lo que hace que se lea como papel y no
 * como una calcomanía.
 */

const CENTRO = 50
const R_PUNTA = 47
const R_VALLE = 26 // ~0,55 del externo: así queda gordita, como la de papel

function punto(radio: number, grados: number): [number, number] {
  const rad = ((grados - 90) * Math.PI) / 180
  return [CENTRO + radio * Math.cos(rad), CENTRO + radio * Math.sin(rad)]
}

const PUNTAS = Array.from({ length: 5 }, (_, i) => punto(R_PUNTA, i * 72))
const VALLES = Array.from({ length: 5 }, (_, i) => punto(R_VALLE, i * 72 + 36))

const coords = (ps: [number, number][]) =>
  ps.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')

/** La silueta: punta, valle, punta, valle… */
const SILUETA = coords(PUNTAS.flatMap((p, i) => [p, VALLES[i]]))

/** Los pliegues sombreados: uno de cada dos triángulos del papel. */
const PLIEGUES = PUNTAS.map((_, i) =>
  coords([[CENTRO, CENTRO], VALLES[i], PUNTAS[(i + 1) % 5]]),
)

export function EstrellaDePapel({
  color = 'var(--color-rosa-pastel)',
  tamanio = 28,
  giro = 0,
  className = '',
}: {
  color?: string
  /** Lado en píxeles. */
  tamanio?: number
  /** Inclinación en grados, para que no queden todas iguales. */
  giro?: number
  className?: string
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      width={tamanio}
      height={tamanio}
      className={className}
      style={{ overflow: 'visible' }}
    >
      {/* El giro va dentro del SVG y no en un transform del elemento:
          así el de afuera queda libre para que motion lo anime. */}
      <g transform={`rotate(${giro} 50 50)`}>
        <polygon points={SILUETA} fill={color} />

        {PLIEGUES.map((p, i) => (
          <polygon key={i} points={p} fill="#000" opacity={0.16} />
        ))}

        {/* Las líneas del doblez, del centro a cada punta */}
        {PUNTAS.map(([x, y], i) => (
          <line
            key={i}
            x1={CENTRO}
            y1={CENTRO}
            x2={x}
            y2={y}
            stroke="#fff"
            strokeOpacity={0.28}
            strokeWidth={1.1}
          />
        ))}
      </g>
    </svg>
  )
}
