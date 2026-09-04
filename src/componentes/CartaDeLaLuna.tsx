import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type SobreCartaDeLaLuna, TEXTOS } from '@/content/luna'
import { abrirSobreUnaVez, claveRecordada } from '@/lib/cripto'

/**
 * LA CARTA DE LA LUNA
 *
 * Lo que el juego promete desde su primera línea: «arriba hay una
 * carta que no está en ninguna otra parte de la web». Sale una sola
 * vez, después de ganar los tres capítulos, y no hay otra manera de
 * llegar a ella que subiendo.
 *
 * Va cifrada por lo mismo que los chats: son palabras de verdad y
 * este repositorio es público. El texto vive en
 * `private/publicable/carta-luna.json` y el hook lo cifra solo.
 *
 * Se abre **encima de la llegada, no en vez de ella**. El canvas
 * queda congelado en su último cuadro —la luna quieta y ella sentada
 * arriba— y el papel sube desde abajo dejando ver ese cuadro por
 * arriba. Tapar la llegada con una pantalla opaca sería quitarle el
 * premio justo al llegar.
 */

/** El respiro entre que la cinemática termina y el papel empieza a subir. */
const MS_DE_RESPIRO = 1400

export function CartaDeLaLuna({
  pasitos,
  caidas,
  antesala,
}: {
  pasitos: number
  caidas: number
  /**
   * El cierre del último capítulo, que en los otros dos sale como
   * cartel y acá no puede: taparía la llegada. Se queda arriba, sobre
   * la luna quieta, y el papel sube por debajo. Es lo que cuenta que
   * los tres peluches iban en el caparazón, o sea que subieron los
   * cuatro.
   */
  antesala: string
}) {
  const [carta, setCarta] = useState<SobreCartaDeLaLuna | null>(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    const clave = claveRecordada()
    if (!clave) {
      setFallo(true)
      return
    }

    let vigente = true
    abrirSobreUnaVez<SobreCartaDeLaLuna>('carta-luna', clave)
      .then((s) => {
        if (vigente) setCarta(s)
      })
      .catch(() => {
        if (vigente) setFallo(true)
      })

    return () => {
      vigente = false
    }
  }, [])

  if (fallo) {
    return (
      <div className="pointer-events-none absolute inset-x-0 bottom-16 px-6 text-center">
        <p className="text-sm text-margarita/60">{TEXTOS.cartaNoAbre}</p>
      </div>
    )
  }

  // Mientras se descifra no sale nada. Son unas décimas y ella está
  // mirando la luna: un «cargando…» encima de esto sería peor que la
  // espera.
  if (!carta) return null

  return <HojaDeLaCarta carta={carta} pasitos={pasitos} caidas={caidas} antesala={antesala} />
}

/**
 * La hoja, sin saber de dónde salió el texto.
 *
 * Va aparte del descifrado para poder mirarla sin la clave: el banco
 * (`npm run luna:carta`) la pinta con relleno de los mismos largos
 * que la carta de verdad. Lo que hay que juzgar acá es cómo se lee
 * en un teléfono —cuánto hay que bajar, si el papel se come la luna
 * demasiado pronto— y eso no necesita las palabras de verdad, que
 * además no pueden andar sueltas por un banco.
 */
export function HojaDeLaCarta({
  carta,
  pasitos,
  caidas,
  antesala,
}: {
  carta: SobreCartaDeLaLuna
  pasitos: number
  caidas: number
  antesala: string
}) {
  const conLosNumeros = (texto: string) =>
    texto.replaceAll('{pasitos}', String(pasitos)).replaceAll('{caidas}', String(caidas))

  // Una apertura que hable de caídas a quien no se cayó ni una vez le
  // está contando la subida de otra.
  const apertura = conLosNumeros(caidas > 0 ? carta.apertura : carta.aperturaSinCaidas)

  return (
    <div className="absolute inset-0 overflow-y-auto">
      {/* Arriba se deja ver la luna entera con ella sentada encima, y
          ahí va lo que en los otros dos capítulos sería el cartel de
          cierre. Al bajar a leer, el papel se lo come, y está bien:
          para entonces ya lo leyó.

          El texto va pegado al borde de arriba y no al de abajo: el
          cuadro congelado tiene la luna justo debajo de la tortuga, y
          un párrafo blanco encima de la luna no se lee. Arriba el
          cielo está limpio. */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.5 }}
        className="mx-auto h-[44dvh] max-w-sm px-8 pt-7 text-center text-sm leading-relaxed text-margarita/70"
      >
        {antesala}
      </motion.p>

      <motion.article
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: MS_DE_RESPIRO / 1000, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto min-h-[56dvh] max-w-md rounded-t-2xl bg-[#f8f4e8] px-7 pt-9 pb-14 text-[#141a33] shadow-[0_-18px_60px_rgba(0,0,0,0.5)]"
      >
        <h2 className="font-display text-center text-3xl">{carta.titulo}</h2>

        <p className="fuente-mano mt-6 text-lg leading-relaxed text-[#2b3358]">{apertura}</p>

        {carta.parrafos.map((parrafo, i) => (
          // Por el índice a propósito: los párrafos de una carta no se
          // reordenan ni se filtran, y dos que empiecen igual son dos.
          // eslint-disable-next-line react/no-array-index-key
          <p key={i} className="mt-5 text-[0.98rem] leading-relaxed">
            {conLosNumeros(parrafo)}
          </p>
        ))}

        <p className="fuente-mano mt-9 text-center text-xl leading-relaxed">{carta.cierre}</p>

        <p className="mt-6 text-center text-sm text-[#141a33]/65">{carta.posdata}</p>

        <p className="fuente-mano mt-2 text-center text-lg">{carta.firma}</p>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-block rounded-full border border-[#141a33]/20 px-5 py-2 text-sm text-[#141a33]/60 transition-colors hover:border-[#141a33]/50 hover:text-[#141a33]"
          >
            {TEXTOS.volver}
          </Link>
        </div>
      </motion.article>
    </div>
  )
}
