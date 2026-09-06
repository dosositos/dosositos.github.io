import { abrirMedio, claveRecordada, indiceDeMedios } from '@/lib/cripto'
import { despertarElAudio, sonidoEncendido } from '@/juego-luna/sonidos'

/**
 * LA MÚSICA DE FONDO DEL JUEGO
 *
 * Cuatro canciones en bucle, en orden al azar y bajitas. Existen para
 * que el juego no sea trece minutos de silencio con un pop cada tanto.
 *
 * Van cifradas como las fotos, en el mismo lote, y se abren con
 * `abrirMedio`: llegan como un blob del propio navegador y nunca
 * existen descifradas en ningún servidor. Eso tiene un precio y hay que
 * saberlo: una canción se baja y se descifra **entera** antes de sonar,
 * no de a pedacitos como haría un `<audio>` normal. Por eso la primera
 * tarda un segundo o dos en arrancar, y por eso la siguiente se va
 * bajando mientras suena la de ahora.
 *
 * El mismo interruptor que los sonidos. Un botón para todo: dos —uno
 * para la música y otro para los pops— sería pedirle que entienda una
 * diferencia que no le importa cuando lo que quiere es que se calle.
 *
 * **El volumen no se pone con `audio.volume`.** En iOS esa propiedad es
 * de solo lectura: allá el volumen lo manda el botón del teléfono y
 * ponerla desde el código no hace nada, sin avisar y sin error. Con eso,
 * en el iPhone las canciones sonaban al volumen del archivo, o sea a
 * todo lo que dieran, mientras acá el número decía 0,08. Así que el
 * `<audio>` se cuelga de un `GainNode` del mismo contexto que los pops,
 * y ahí el volumen se controla igual en los dos teléfonos.
 */

/**
 * Qué tan bajo suena.
 *
 * Es el fondo, no la canción. Tiene que quedar por debajo del pop del
 * salto sin desaparecer del todo.
 */
const VOLUMEN = 0.04

/** Lo que tarda en entrar y en irse, en milisegundos. */
const FUNDIDO = 1400

let audio: HTMLAudioElement | null = null

/**
 * Por dónde sale el sonido de verdad, cuando hay Web Audio.
 *
 * `fuente` no se puede armar dos veces sobre el mismo `<audio>` —el
 * navegador tira si se intenta—, así que se arma una sola vez al
 * encender y se tira entera al apagar.
 */
let fuente: MediaElementAudioSourceNode | null = null
let ganancia: GainNode | null = null

/** El orden en que van sonando. Se vuelve a barajar al terminarse. */
let vuelta: string[] = []
let cual = 0

/** La última que sonó, para no repetirla al empezar la vuelta siguiente. */
let ultima = ''

/** Para no arrancar dos veces si llegan dos toques juntos. */
let arrancando = false
let sonando = false

/** Si el navegador o la falta de clave lo hacen imposible, no se insiste. */
let imposible = false

let relojDelFundido = 0

function barajar(nombres: string[]): string[] {
  const orden = [...nombres]
  for (let i = orden.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[orden[i], orden[j]] = [orden[j], orden[i]]
  }
  // Que no salga la misma dos veces seguidas al cambiar de vuelta. Con
  // cuatro canciones eso pasa una de cada cuatro veces, y sonaría a que
  // el azar está roto aunque no lo esté.
  if (orden.length > 1 && orden[0] === ultima) [orden[0], orden[1]] = [orden[1], orden[0]]
  return orden
}

/**
 * Pone el volumen.
 *
 * Por el `GainNode` si lo hay, que es lo único que funciona en los dos
 * teléfonos, y por `audio.volume` si no — que en un navegador viejo sin
 * Web Audio es mejor que nada, y en iOS ese caso no existe.
 */
function ponerVolumen(v: number) {
  const acotado = Math.max(0, Math.min(1, v))
  if (ganancia) ganancia.gain.value = acotado
  else if (audio) audio.volume = acotado
}

/** Cuánto está sonando ahora mismo. */
function volumenDeAhora(): number {
  if (ganancia) return ganancia.gain.value
  return audio ? audio.volume : 0
}

/** Sube o baja el volumen de a poquito, para que no entre de golpe. */
function fundir(hasta: number, alTerminar?: () => void) {
  window.clearInterval(relojDelFundido)
  if (!audio) return

  const desde = volumenDeAhora()
  const empezo = performance.now()

  relojDelFundido = window.setInterval(() => {
    if (!audio) return window.clearInterval(relojDelFundido)

    const parte = Math.min(1, (performance.now() - empezo) / FUNDIDO)
    ponerVolumen(desde + (hasta - desde) * parte)

    if (parte === 1) {
      window.clearInterval(relojDelFundido)
      alTerminar?.()
    }
  }, 60)
}

/**
 * Pone la que toca y deja bajando la siguiente.
 *
 * El adelanto no se espera a propósito: `abrirMedio` se acuerda de lo
 * que ya abrió, así que cuando termine esta, la que sigue va a estar
 * lista y el cambio no se oye.
 */
async function ponerLaQueToca(clave: string) {
  if (!audio || vuelta.length === 0) return

  if (cual >= vuelta.length) {
    vuelta = barajar(vuelta)
    cual = 0
  }

  const nombre = vuelta[cual]
  ultima = nombre

  audio.src = await abrirMedio(nombre, clave)
  ponerVolumen(0)
  await audio.play()
  fundir(VOLUMEN)

  const siguiente = vuelta[cual + 1] ?? vuelta[0]
  if (siguiente && siguiente !== nombre) void abrirMedio(siguiente, clave).catch(() => {})
}

/**
 * Arranca la música, si el interruptor está encendido.
 *
 * Se puede llamar cuantas veces se quiera: si ya está sonando no hace
 * nada. **Tiene que llamarse desde un toque de ella**, porque el
 * navegador no deja que una página empiece a sonar sola; en el juego
 * eso pasa solo, porque para llegar a cualquier parte hay que tocar
 * algo.
 */
export async function arrancarMusica(): Promise<void> {
  if (imposible || sonando || arrancando) return
  if (!sonidoEncendido()) return

  const clave = claveRecordada()
  if (!clave) return

  arrancando = true
  try {
    const indice = await indiceDeMedios(clave)
    const nombres = Object.entries(indice)
      .filter(([, ficha]) => ficha.tipo === 'musica')
      .map(([nombre]) => nombre)
      .sort()

    if (nombres.length === 0) {
      imposible = true
      return
    }

    audio = new Audio()
    audio.preload = 'auto'

    // Colgado del mismo contexto que los pops. Si el navegador no
    // tiene Web Audio, o si se niega, la música suena igual: se cae a
    // `audio.volume`, que funciona en todos lados menos en iOS.
    const ctx = despertarElAudio()
    if (ctx) {
      try {
        fuente = ctx.createMediaElementSource(audio)
        ganancia = ctx.createGain()
        ganancia.gain.value = 0
        fuente.connect(ganancia).connect(ctx.destination)
      } catch {
        fuente = null
        ganancia = null
      }
    }

    audio.addEventListener('ended', () => {
      cual += 1
      void ponerLaQueToca(clave).catch(() => {})
    })

    vuelta = barajar(nombres)
    cual = 0
    await ponerLaQueToca(clave)
    sonando = true
  } catch {
    // Sin música el juego se juega igual. Puede ser que el navegador no
    // dejara sonar todavía, y entonces el toque siguiente lo reintenta;
    // o que algo del cifrado falle, y ahí ya no hay nada que hacer.
    pararMusica()
  } finally {
    arrancando = false
  }
}

/** La calla y la olvida. Se llama al salir del juego y al apagar. */
export function pararMusica(): void {
  window.clearInterval(relojDelFundido)
  const quien = audio
  audio = null
  sonando = false
  vuelta = []
  cual = 0

  // El cableado se suelta entero. Un `MediaElementAudioSourceNode` se
  // arma una sola vez por elemento, así que la próxima vez que se
  // encienda hay que empezar por un `<audio>` nuevo y por un cable
  // nuevo, y dejar el viejo colgando sería dejarlo sonando.
  try {
    fuente?.disconnect()
    ganancia?.disconnect()
  } catch {
    /* ya estaba suelto: da igual */
  }
  fuente = null
  ganancia = null

  if (quien) {
    quien.pause()
    quien.src = ''
  }
}

/**
 * La baja hasta callarla y recién ahí la para.
 *
 * Para apagar con el interruptor. Cortar en seco una canción a mitad
 * suena a que algo se rompió; que se vaya bajando suena a que se apagó.
 */
export function apagarMusica(): void {
  if (!audio) return pararMusica()
  fundir(0, pararMusica)
}

/**
 * Se calla mientras la página no se ve, y vuelve al volver.
 *
 * Si deja el juego abierto y se va a contestar un mensaje, la música no
 * tiene por qué seguir sonando en su bolsillo.
 */
export function atenderElCambioDePestana(): () => void {
  const alCambiar = () => {
    if (!audio) return
    if (document.hidden) audio.pause()
    else void audio.play().catch(() => {})
  }

  document.addEventListener('visibilitychange', alCambiar)
  return () => document.removeEventListener('visibilitychange', alCambiar)
}
