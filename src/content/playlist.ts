/**
 * Nuestra playlist. Cada canción con la razón de por qué está aquí.
 *
 * IMPORTANTE (te lo explico en el plan): no podemos subir los MP3 al
 * repositorio — son canciones con derechos de autor y además pesarían
 * más que toda la web junta. Lo que sí podemos: incrustar el reproductor
 * de Spotify (buscá la canción, Compartir → Copiar enlace, y pegalo aquí).
 * Como música de fondo suave usaremos una pieza instrumental libre.
 */
/** La playlist de Spotify que armaste. Solo el id, no la URL completa. */
export const PLAYLIST_SPOTIFY = '3EzASNGuqCMeUW6ggep6IW'

export interface Cancion {
  titulo: string
  artista: string
  /** Enlace de Spotify: https://open.spotify.com/track/XXXX */
  spotify?: string
  /** Por qué es nuestra. Esto es lo que más importa. */
  porQue: string
  dedicadaPor?: 'osito' | 'osita' | 'ambos'
}

export const playlist: Cancion[] = [
  { titulo: 'Te amo', artista: 'Franco de Vita', porQue: 'FALTA: contame por qué esta.', dedicadaPor: 'osito' },
  { titulo: 'Por ti me casaré', artista: 'Eros Ramazzotti', porQue: 'FALTA', dedicadaPor: 'osito' },
  { titulo: 'Motivos', artista: 'Luis Miguel', porQue: 'FALTA' },
  { titulo: 'Somos novios', artista: 'Luis Miguel', porQue: 'FALTA' },
  { titulo: 'Soy yo', artista: 'Luis Miguel', porQue: 'FALTA' },
  { titulo: 'Ojos color sol', artista: 'Calle 13 ft. Silvio Rodríguez', porQue: 'FALTA' },
  { titulo: 'Buscarte lejos', artista: 'Duki', porQue: 'FALTA' },
  { titulo: 'Especial', artista: 'Eladio Carrión', porQue: 'FALTA' },
  { titulo: 'Alma dinamita', artista: 'WOS', porQue: 'FALTA' },
]
