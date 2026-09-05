import { TEXTOS } from '@/content/luna'

/**
 * El marcador contra él, al cerrar un capítulo.
 *
 * Es el chiste que el juego venía prometiendo: no se sube contra un
 * reloj, se sube contra alguien. Sale debajo de los pasitos de esta
 * subida y solo cuando el capítulo tiene récord puesto — sin récord
 * no aparece nada y el capítulo se cierra igual, que es lo que pasó
 * durante todo el tiempo en que él no los había jugado.
 *
 * Compara los pasitos de **esta** subida y no el mejor guardado. El
 * mejor sale aparte y solo si es de antes: lo que ella quiere saber
 * al terminar es cómo le fue ahora.
 */
export function MarcadorDeLaLuna({
  record,
  pasitos,
  mejor,
}: {
  /** En cuántos pasitos lo subió él, si es que ya lo subió. */
  record?: number
  /** Los de esta subida. */
  pasitos: number
  /** Lo mejor que ella ha hecho acá, ya contando esta subida. */
  mejor?: { pasitos: number; caidas: number }
}) {
  if (!record) return null

  const diferencia = pasitos - record
  const remate =
    diferencia < 0
      ? TEXTOS.leGanaste
      : diferencia === 0
        ? TEXTOS.loEmpataste
        : diferencia === 1
          ? TEXTOS.teSobroUno
          : TEXTOS.teSobraron.replace('{cuantos}', `${diferencia} pasitos`)

  // Solo cuando viene de otra vez. Repetir el número que ya está
  // arriba no le dice nada a nadie.
  const deAntes = mejor && mejor.pasitos < pasitos ? mejor.pasitos : null

  return (
    <div className="mt-4">
      <p className="text-xs text-margarita/45">
        {TEXTOS.recordDeEl.replace('{pasitos}', String(record))}
      </p>
      <p
        className={`fuente-mano mt-1 text-lg ${
          diferencia <= 0 ? 'text-tulipan-amarillo' : 'text-margarita/60'
        }`}
      >
        {remate}
      </p>
      {deAntes ? (
        <p className="mt-1 text-xs text-margarita/40">
          {TEXTOS.tuMejor.replace('{pasitos}', String(deAntes))}
        </p>
      ) : null}
    </div>
  )
}
