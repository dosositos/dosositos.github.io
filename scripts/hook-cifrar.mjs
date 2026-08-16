/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  EL HOOK QUE CIFRA SOLO                                          ║
 * ║                                                                  ║
 * ║  Claude Code lo ejecuta después de cada Write o Edit. Si lo que  ║
 * ║  se tocó estaba en private/publicable/, vuelve a cifrar.         ║
 * ║                                                                  ║
 * ║  Existe porque el 15 de agosto la web se publicó sin una sola    ║
 * ║  conversación: el cifrado era un paso manual y nadie lo corrió.  ║
 * ║                                                                  ║
 * ║  Está en Node y no en shell a propósito: las rutas de Windows    ║
 * ║  llevan barras invertidas y espacios ("C:\Carpeta vacia\..."),   ║
 * ║  que en bash hay que escapar de tres maneras distintas.          ║
 * ║                                                                  ║
 * ║  Se configura en .claude/settings.json. Para verlo o apagarlo:   ║
 * ║  /hooks                                                          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const RAIZ = path.resolve(import.meta.dirname, '..')

/** Lo que Claude Code manda por la entrada estándar. */
async function leerEntrada() {
  const trozos = []
  for await (const t of process.stdin) trozos.push(t)
  try {
    return JSON.parse(Buffer.concat(trozos).toString('utf8') || '{}')
  } catch {
    return {}
  }
}

const entrada = await leerEntrada()
const archivo = entrada.tool_input?.file_path ?? entrada.tool_response?.filePath ?? ''

// Normalizamos las barras: en Windows llegan invertidas.
const esPublicable = /private[/\\]publicable[/\\]/i.test(archivo.replace(/\\/g, '/'))
if (!esPublicable) process.exit(0)

// El script decide solo si hace falta: si el contenido no cambió, no cifra.
const resultado = spawnSync(
  process.execPath,
  [path.join(RAIZ, 'scripts', 'cifrar-contenido.mjs')],
  { cwd: RAIZ, encoding: 'utf8' },
)

const salida = `${resultado.stdout ?? ''}${resultado.stderr ?? ''}`.trim()

// Falló: casi siempre es que falta la frase en .env, o que los conteos
// de momentos.ts y chats.json no cuadran. Hay que enterarse, así que
// se devuelve como aviso visible y como contexto para Claude.
if (resultado.status !== 0) {
  console.log(
    JSON.stringify({
      systemMessage: `⚠ No pude cifrar ${path.basename(archivo)}. Lo que dijo el script:\n${salida}`,
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `El cifrado automático falló al tocar ${archivo}. Salida del script:\n${salida}\n\nHay que arreglarlo antes de hacer commit: si no, se publica sin conversaciones.`,
      },
    }),
  )
  process.exit(0)
}

// Cifró de verdad (cuando no hay nada que hacer dice "Nada que cifrar").
if (!salida.includes('Nada que cifrar')) {
  console.log(
    JSON.stringify({
      systemMessage: '🔒 Contenido privado cifrado de nuevo — acordate de incluir public/cifrado/ en el commit.',
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          'Se volvió a cifrar el contenido privado. public/cifrado/ tiene cambios sin confirmar: van en el mismo commit que el contenido.',
      },
    }),
  )
}
