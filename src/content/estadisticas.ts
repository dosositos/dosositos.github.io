/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  NÚMEROS DEL CHAT                                            ║
 * ║                                                              ║
 * ║  Salen de correr `npm run chat:parsear`. Son solo cuentas —   ║
 * ║  ni una frase, ni un nombre — así que pueden ir a la vista    ║
 * ║  sin cifrar. Actualizalos cuando vuelvas a correr el script.  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
export const numeros = {
  mensajes: 154_726,
  multimedia: 41_537,
  palabras: { osito: 392_742, osita: 376_528 },
  mensajesPor: { osito: 76_502, osita: 78_224 },
  teAmo: { osito: 2_058, osita: 2_641 },
  diasConversando: 715,
  rachaMasLarga: 715,
  horaPico: 22,
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
  titulo: 'nuestros emojis más usados',
  remate: 'Tres pucheros, dos enojos y, colado en medio, el infinito.',
  explicacion:
    '955 caritas tristes en 154.726 mensajes. Nos amamos muchísimo y lo demostramos poniendo cara de puchero.',
  /** El dato que le da la vuelta al chiste y lo vuelve otra cosa. */
  cierre: 'Y con todo y pucheros, no hemos fallado un solo día en 715.',
}
