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
    id: 'el-jueves-que-andabas-enferma',
    fecha: '2024-10-24',
    lugar: 'Camino a tu casa',
    texto:
      'Un jueves con calentura y sin ánimos. Te grabé de camino a dejarte, solo por sacarte una sonrisa antes de despedirnos.',
    flor: 'nube',
    fotos: [{ src: 'videox1', alt: 'Vos en el carro, camino a tu casa' }],
  },
  {
    id: 'un-rato-en-el-parqueo',
    fecha: '2024-10-30',
    lugar: 'Metrocentro',
    texto:
      'Un miércoles corto en el parqueo, de esos que uno arma solo porque ya hacía falta verse.',
    flor: 'tulipan-violeta',
    fotos: [{ src: 'videox2', alt: 'Vos, esa tarde en el parqueo' }],
  },
  {
    id: 'esperandome-en-galerias',
    fecha: '2024-10-31',
    lugar: 'Galerías',
    texto: 'Salí del baño y ahí estabas esperándome. Así de simple, y así lo guardé.',
    flor: 'margarita',
    fotos: [{ src: 'videox3', alt: 'Vos esperándome afuera del baño' }],
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
