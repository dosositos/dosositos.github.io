/**
 * La huella de todo lo que entra al juego: las frases aprobadas, las
 * inventadas y la tabla de normalización.
 *
 * Vive aparte porque la usan dos scripts: preparar-juego.mjs la escribe
 * dentro de juego.json, y revisar-publicacion.mjs la recalcula antes de
 * compilar. Si no coinciden es que aprobaste frases nuevas (o cambiaste
 * la tabla) y nadie volvió a preparar el juego: la web se publicaría con
 * las frases viejas y sin avisar.
 */
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')
const PRIVADO = path.join(RAIZ, 'private')

const leerJson = (ruta) => (existsSync(ruta) ? JSON.parse(readFileSync(ruta, 'utf8')) : null)

/**
 * @returns {string|null} la huella, o null si no está el material en
 * claro (en GitHub Actions no existe private/, y ahí no hay nada que
 * comparar).
 */
export function huellaDelJuego() {
  const candidatas = leerJson(path.join(PRIVADO, 'frases-candidatas.json'))
  if (!candidatas) return null

  const aprobadas = [...(candidatas.individuales ?? []), ...(candidatas.ambos ?? [])]
    .filter((f) => f.aprobada)
    .map((f) => f.texto)

  const inventadas = (leerJson(path.join(PRIVADO, 'frases-inventadas.json'))?.frases ?? []).map(
    (f) => f.texto,
  )
  const tabla = leerJson(path.join(PRIVADO, 'juego-normalizacion.json')) ?? {}

  return createHash('sha256')
    .update(JSON.stringify([aprobadas, inventadas, tabla]), 'utf8')
    .digest('hex')
    .slice(0, 16)
}
