import type { Quien } from '@/types'

/** Nuestros hijos. Aparecen escondidos por toda la web como easter eggs. */
export interface Peluche {
  nombre: string
  especie: string
  color: string
  regaladoPor: Quien
  descripcion: string
  emoji: string
}

export const peluches: Peluche[] = [
  {
    nombre: 'Ovi',
    especie: 'gorila',
    color: 'var(--color-ovi)',
    regaladoPor: 'osito',
    descripcion: 'Todo rosa pastel. FALTA: contame su historia y qué personalidad le inventaron.',
    emoji: '🦍',
  },
  {
    nombre: 'Boo',
    especie: 'oso panda',
    color: 'var(--color-boo-claro)',
    regaladoPor: 'osito',
    descripcion: 'FALTA: quién se lo regaló a quién y cuándo.',
    emoji: '🐼',
  },
  {
    nombre: 'Nico',
    especie: 'osito',
    color: 'var(--color-nico)',
    regaladoPor: 'osito',
    descripcion: 'Blanco con rosa pastel. FALTA: su historia.',
    emoji: '🧸',
  },
]
