/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  NÚMEROS DEL CHAT                                            ║
 * ║                                                              ║
 * ║  Son una foto fija, no un dato en vivo: exportar el chat es   ║
 * ║  un rollo y no vale la pena hacerlo seguido. Por eso la web   ║
 * ║  dice siempre "hasta el [fecha]" en vez de fingir que está    ║
 * ║  al día.                                                      ║
 * ║                                                               ║
 * ║  Para actualizarlos: exportá el chat otra vez, corré          ║
 * ║  `npm run chat:parsear` (WhatsApp) y                          ║
 * ║  `npm run chat:instagram` (Instagram), y copiá aquí lo que    ║
 * ║  imprimen, incluida la fecha de corte de abajo.               ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** El día hasta el que están contados estos números. */
export const CORTE = '2026-08-14'

export const numeros = {
  mensajes: 154_726,
  multimedia: 41_537,
  palabras: { osito: 392_742, osita: 376_528 },
  mensajesPor: { osito: 76_502, osita: 78_224 },
  teAmo: { osito: 2_158, osita: 2_641 },
  diasConversando: 715,
  horaPico: 22,
  desde: '2024-08-30',
}

/**
 * Instagram, la otra mitad de la historia.
 *
 * Importa por dos razones: fue donde empezó todo — el "heey" del 25 de
 * agosto, cinco días antes del primer mensaje de WhatsApp — y es donde
 * seguimos mandándonos reels hasta hoy.
 */
export const instagram = {
  mensajes: 6_077,
  mensajesPor: { osito: 2_737, osita: 3_340 },
  palabras: { osito: 12_208, osita: 15_124 },
  reels: 1_171,
  reelsPor: { osito: 492, osita: 679 },
  /** Corazones puestos sobre los mensajes del otro. */
  corazones: 594,
  diasConversando: 429,
  /** Los que se escribieron antes de que WhatsApp existiera entre nosotros. */
  antesDeWhatsapp: 1_322,
  desde: '2024-08-25',
  primerMensaje: { de: 'osito', texto: 'heey', hora: '7:02 p. m.' },
  /** El día que más hablamos por ahí: el 28 de agosto de 2024, recién conocidos. */
  diaMasHablador: { fecha: '2024-08-28', mensajes: 475 },
}

/** WhatsApp + Instagram, que es lo que de verdad nos hemos escrito. */
export const totales = {
  mensajes: numeros.mensajes + instagram.mensajes,
  palabras:
    numeros.palabras.osito +
    numeros.palabras.osita +
    instagram.palabras.osito +
    instagram.palabras.osita,
  desde: instagram.desde,
}

/** Los seis emojis que más usamos, en orden. El chiste se cuenta solo. */
export const emojisDelDrama = [
  { emoji: '😔', veces: 411 },
  { emoji: '😭', veces: 382 },
  { emoji: '😞', veces: 162 },
  { emoji: '😠', veces: 49 },
  { emoji: '♾', veces: 48 },
  { emoji: '😡', veces: 31 },
  { emoji: '🤞', veces: 26 },
  { emoji: '💪', veces: 21 },
  { emoji: '🥳', veces: 19 },
  { emoji: '😏', veces: 13 },
]

export const chisteDelDrama = {
  titulo: 'top 10 emojis que más usamos',
  explicacion:
    '955 caritas tristes en 154.726 mensajes. Nos amamos muchísisimo y lo demostramos haciendo pucheros 😔 😭 😞',
}
