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
 * ║  `npm run chat:parsear` y copiá aquí lo que imprime,          ║
 * ║  incluida la fecha de corte de abajo.                         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** El día hasta el que están contados estos números. */
export const CORTE = '2026-08-14'

export const numeros = {
  mensajes: 154_726,
  multimedia: 41_537,
  palabras: { osito: 392_742, osita: 376_528 },
  mensajesPor: { osito: 76_502, osita: 78_224 },
  teAmo: { osito: 2_058, osita: 2_641 },
  diasConversando: 715,
  horaPico: 22,
  desde: '2024-08-30',
}

/** Los seis emojis que más usamos, en orden. El chiste se cuenta solo. */
export const emojisDelDrama = [
  { emoji: '😔', veces: 411 },
  { emoji: '😭', veces: 382 },
  { emoji: '😞', veces: 162 },
  { emoji: '😠', veces: 49 },
  { emoji: '♾', veces: 48 },
  { emoji: '😡', veces: 31 },
]

export const chisteDelDrama = {
  titulo: 'los emojis que más usamos',
  remate: 'Tres pucheros, dos enojos y, colado en medio, el infinito.',
  explicacion:
    '955 caritas tristes en 154.726 mensajes. Nos amamos muchísimo y lo demostramos poniendo cara de puchero.',
  cierre: 'El primero de todos se lo mandé el día que le escribí. Ya se veía venir.',
}
