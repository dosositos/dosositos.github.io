/**
 * Para que node pueda importar los archivos del juego tal como están.
 *
 * El proyecto escribe `@/juego-luna/motor`, que entiende Vite y no
 * entiende node. Esto le enseña la equivalencia y ya: así el probador
 * corre el motor de verdad, el mismo que corre en el teléfono, y no
 * una copia de la física que se iría desincronizando sola.
 *
 * Se usa con:  node --import ./scripts/juego-luna/alias-luna.mjs ...
 */
import { existsSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'
import { resolve as resolverRuta } from 'node:path'

const raiz = resolverRuta(import.meta.dirname, '..', '..', 'src')

/** En el proyecto los imports van sin extensión: se la ponemos aquí. */
function conExtension(ruta) {
  if (existsSync(ruta)) return ruta
  for (const cola of ['.ts', '.tsx', '/index.ts']) {
    if (existsSync(ruta + cola)) return ruta + cola
  }
  return ruta
}

registerHooks({
  resolve(especificador, contexto, siguiente) {
    if (especificador.startsWith('@/')) {
      return {
        url: pathToFileURL(conExtension(resolverRuta(raiz, especificador.slice(2)))).href,
        shortCircuit: true,
      }
    }
    return siguiente(especificador, contexto)
  },
})
