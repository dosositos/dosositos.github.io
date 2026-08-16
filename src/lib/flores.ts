import type { Flor } from '@/types'

/**
 * Cada flor con su color y su emoji.
 *
 * Los colores no se eligieron por bonitos: son las flores de lego que
 * armamos y los ramos de verdad. Están definidos en index.css; aquí
 * solo se les pone nombre para poder usarlos desde el código.
 */
export const FLORES: Record<Flor, { color: string; emoji: string; nombre: string }> = {
  girasol: { color: 'var(--color-girasol)', emoji: '🌻', nombre: 'girasol' },
  'rosa-roja': { color: 'var(--color-rosa-roja)', emoji: '🌹', nombre: 'rosa roja' },
  'rosa-amarilla': { color: 'var(--color-rosa-amarilla)', emoji: '🌼', nombre: 'rosa amarilla' },
  'rosa-pastel': { color: 'var(--color-rosa-pastel)', emoji: '🌸', nombre: 'rosa pastel' },
  'tulipan-amarillo': { color: 'var(--color-tulipan-amarillo)', emoji: '🌷', nombre: 'tulipán amarillo' },
  'tulipan-violeta': { color: 'var(--color-tulipan-violeta)', emoji: '🌷', nombre: 'tulipán violeta' },
  hibisco: { color: 'var(--color-hibisco)', emoji: '🌺', nombre: 'hibisco' },
  gerbera: { color: 'var(--color-gerbera)', emoji: '🌼', nombre: 'gerbera' },
  margarita: { color: 'var(--color-margarita)', emoji: '🌼', nombre: 'margarita' },
  nube: { color: 'var(--color-nube)', emoji: '🤍', nombre: 'nube' },
  cipres: { color: 'var(--color-cipres)', emoji: '🌿', nombre: 'ciprés' },
}

/** El color de una flor, listo para meter en un style. */
export const colorDeFlor = (flor: Flor) => FLORES[flor].color
