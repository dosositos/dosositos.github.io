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
  dedicadaPor?: 'osito 🐻' | 'osita 🎀' | 'ambos'
}

export const playlist: Cancion[] = [
  { titulo: 'Te amo', artista: 'Franco de Vita', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osita 🎀' },
  { titulo: 'Buscarte lejos', artista: 'Duki', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osito 🐻' },
  { titulo: 'Por ti me casaré', artista: 'Eros Ramazzotti', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osita 🎀' },
  { titulo: 'Especial', artista: 'Eladio Carrión', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osito 🐻' },
  { titulo: 'Motivos', artista: 'Luis Miguel', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osita 🎀' },
  { titulo: 'Alma dinamita', artista: 'WOS', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osito 🐻' },
  { titulo: 'Somos novios', artista: 'Luis Miguel', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osita 🎀' },
  { titulo: 'Soy yo', artista: 'Luis Miguel', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osita 🎀' },
  { titulo: 'Mi favorita', artista: 'Rios y Chanell', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osito 🐻' },
  { titulo: 'Ojos color sol', artista: 'Calle 13 y Silvio Rodríguez', porQue: 'Añadir nota aquí - Añadir nota aquí - Añadir nota aquí', dedicadaPor: 'osita 🎀' },
  
]
