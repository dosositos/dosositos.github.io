import type { Instante } from '@/types'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  FOTOS SIN MOMENTO EXACTO                                    ║
 * ║                                                              ║
 * ║  Días de los que quedaron fotos pero no una historia entera.  ║
 * ║  Salen en la misma línea del tiempo, entre los momentos,      ║
 * ║  como un punto pequeño con una línea escrita a mano. No       ║
 * ║  tienen cápsula ni chat: se ven ahí mismo y siguen.           ║
 * ║                                                               ║
 * ║  Si a uno le empiezan a salir párrafos, ya no es un instante: ║
 * ║  pasalo a momentos.ts.                                        ║
 * ║                                                               ║
 * ║  ⚠  ESTE ARCHIVO SE PUBLICA EN CLARO, igual que momentos.ts.  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
export const instantes: Instante[] = [
  {
    id: 'parqueo-de-metrocentro',
    fecha: '2024-09-22',
    lugar: 'Metrocentro',
    texto:
      'Un domingo cualquiera en el parqueo, de esos que se supone que son aburridos. Ese no lo fue.',
    flor: 'rosa-pastel',
    fotos: [{ src: 'fotox1', alt: 'Nosotros, un domingo en el parqueo' }],
  },
  {
    id: 'el-hoodie-de-los-bucks',
    fecha: '2024-10-17',
    lugar: 'La universidad',
    texto:
      'Llegó el hoodie de los Bucks, una semana tarde por culpa de un huracán. Me cumpliste un sueño que ni sabías que tenía.',
    flor: 'girasol',
    fotos: [
      { src: 'fotox22', alt: 'Yo con el hoodie de los Bucks recién puesto' },
      { src: 'fotox2', alt: 'Ese jueves, en el parqueo de la universidad' },
      { src: 'fotox3', alt: 'Ese jueves, en el parqueo de la universidad' },
    ],
  },
]
