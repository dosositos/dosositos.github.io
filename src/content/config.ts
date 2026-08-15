/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  CONFIGURACIÓN GENERAL — el archivo que más vas a tocar.     ║
 * ║  Todo lo de aquí es texto plano: cámbialo sin miedo.         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export const ZONA_HORARIA = 'America/Managua' // UTC-6, sin horario de verano

export const OSITO = {
  apodo: 'osito',
  nombre: 'Armando',
  cumple: { mes: 10, dia: 8 },
  color: 'var(--color-oso)',
} as const

export const OSITA = {
  apodo: 'osita',
  nombre: 'Jennifer',
  cumple: { mes: 1, dia: 22 },
  color: 'var(--color-rosa-pastel)',
} as const

/**
 * Las dos fechas que mandan en los contadores.
 *
 * Van a medianoche (T00:00) a propósito: como no sabemos la hora exacta,
 * lo que cuenta es el DÍA. Así, el 24 de agosto a las 8 de la mañana la
 * web ya dice "2 años" y no "1 año, 11 meses y 30 días", que sería
 * técnicamente cierto y emocionalmente absurdo.
 *
 * El -06:00 es la hora de Nicaragua. Si algún día recuerdan la hora
 * exacta, cámbienla aquí y pongan horaExacta: true.
 */
export const FECHAS = {
  nosConocimos: {
    fecha: '2024-08-24T00:00:00-06:00',
    horaExacta: false,
    titulo: 'desde que nos conocimos',
    subtitulo: 'el día que el mundo se puso en su sitio',
  },
  novios: {
    fecha: '2024-11-24T00:00:00-06:00',
    horaExacta: false,
    titulo: 'desde que somos novios',
    subtitulo: 'el día que dijiste que sí',
  },
} as const

/**
 * "Hoy quién ama más" — se turnan cada día.
 * Con esta fecha ancla la web calcula de quién es el turno:
 * el día ancla le toca a quien diga `turnoDelAncla`, y a partir
 * de ahí alterna solo, para siempre, sin necesidad de guardar nada.
 */
export const AMA_MAS = {
  fechaAncla: '2026-08-14', // hoy
  turnoDelAncla: 'osito' as 'osito' | 'osita',
}

/** Textos que se muestran cuando llega una fecha especial. */
export const CELEBRACIONES = {
  aniversarioConocernos: {
    titulo: '¡Hoy hace años que nos conocimos!',
    mensaje: 'Un 24 de agosto empezó todo. Y mira dónde estamos.',
    flor: 'girasol',
  },
  aniversarioNovios: {
    titulo: '¡Feliz aniversario, osita!',
    mensaje: 'Un año más de decirte que sí a todo.',
    flor: 'rosa-roja',
  },
  mesiversario: {
    titulo: 'Hoy es 24. Otro mes contigo.',
    mensaje: 'Ya perdí la cuenta de las veces que me has salvado el día.',
    flor: 'rosa-pastel',
  },
  cumpleOsito: {
    titulo: '¡Feliz cumpleaños, osito!',
    mensaje: 'El 8 de octubre el mundo ganó al mejor.',
    flor: 'tulipan-amarillo',
  },
  cumpleOsita: {
    titulo: '¡Feliz cumpleaños, osita!',
    mensaje: 'El 22 de enero nació la razón de todo esto.',
    flor: 'hibisco',
  },
} as const

/**
 * La frase-contraseña que desbloquea el contenido privado
 * (chats, el juego de frases, las cartas). NO se guarda aquí:
 * aquí solo va la pista que se le muestra a quien entra.
 */
export const CANDADO = {
  pista:
    'Escribí el nombre de tu hermana, un punto, y el nombre de mi hermana. Todo en minúsculas.',
  ejemplo: 'algo.algo',
  mensajeError: 'Esa no es, osita. Acordate: primero la tuya, después la mía.',
}

/*
 * La respuesta NO está en ningún archivo de este proyecto, ni acá ni
 * escondida en el código. Vive únicamente en la cabeza de ustedes dos:
 * se usa al cifrar (npm run secretos:cifrar -- --clave "...") y se vuelve
 * a escribir al entrar. Quien clone el repositorio completo no encuentra
 * ni la clave ni forma de deducirla.
 */
