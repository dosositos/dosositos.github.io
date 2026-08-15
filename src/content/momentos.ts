import type { Momento } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  LA LÍNEA DEL TIEMPO                                         ║
 * ║  Agregá momentos aquí, en cualquier orden: la web los         ║
 * ║  ordena sola por fecha. Con copiar uno y cambiarle los datos  ║
 * ║  ya está.                                                     ║
 * ║                                                               ║
 * ║  Las fotos van en /public/media/ y aquí se referencian solo   ║
 * ║  con el nombre: '2024/primera-foto.webp'                      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
export const momentos: Momento[] = [
  {
    id: 'nos-conocimos',
    fecha: '2024-08-24',
    titulo: 'El día que nos conocimos',
    resumen: 'El principio de todo. Ninguno de los dos sabía lo que empezaba ese día.',
    relato:
      'AQUÍ VA EL RELATO — contame cómo fue y yo escribo el borrador. Por ahora este texto es un recordatorio de que falta.',
    flor: 'girasol',
    destacado: true,
    icono: '🌻',
    // fotos: [{ src: '2024/nos-conocimos.webp', alt: 'La primera foto que nos tomamos', pie: 'la primera' }],
    // chat: [
    //   { de: 'osito', texto: 'Hola', hora: '9:12 p. m.' },
    //   { de: 'osita', texto: 'Holaa', hora: '9:14 p. m.' },
    // ],
  },
  {
    id: 'somos-novios',
    fecha: '2024-11-24',
    titulo: 'El día que dijiste que sí',
    resumen:
      'Con un ramo de rosas amarillas, rosadas y rojas, nubes blancas y ciprés. Y vos dijiste que sí.',
    relato: 'AQUÍ VA EL RELATO — cómo fue la pedida, qué sentiste, qué dijo ella.',
    flor: 'rosa-roja',
    destacado: true,
    icono: '🌹',
    nota: {
      autor: 'osito',
      texto: 'Todavía me tiembla la mano de acordarme.',
    },
  },
  {
    id: 'flores-de-lego',
    fecha: '2025-01-01',
    fechaTexto: 'FALTA LA FECHA REAL',
    titulo: 'Las flores que armamos juntos',
    resumen:
      'Un tulipán amarillo, uno violeta, una rosa roja y un hibisco rosa. Pieza por pieza, los dos.',
    relato: 'AQUÍ VA EL RELATO — cuándo fue, dónde las armaron, cuánto tardaron, qué se dijeron.',
    flor: 'tulipan-violeta',
    icono: '🌷',
  },
]
