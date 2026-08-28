/**
 * Los retratos bordados de los peluches.
 *
 * Son lo único visual que viaja en claro en el bundle, y va explicado
 * en `CLAUDE.md`: son ellos y no ustedes dos, de un panda nadie deduce
 * nada, y el guiño necesita que se asomen al instante. Descifrarlos
 * antes de aparecer mataría la gracia.
 *
 * Se recogen solos de la carpeta en vez de importarse uno por uno: el
 * día que aparezca uno nuevo queda cableado sin tocar este archivo, y
 * mientras no esté, quien lo pida se las arregla con el emoji de la
 * ficha y no se rompe nada. La llave es el nombre del archivo sin
 * extensión, que tiene que coincidir con el `id` de la ficha.
 *
 * Lo usan los peluches escondidos por las esquinas y los carteles de
 * presentación de cada capítulo del juego de la luna.
 */
export const RETRATOS: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/peluches/*.webp', {
      eager: true,
      query: '?url',
      import: 'default',
    }) as Record<string, string>,
  ).map(([ruta, url]) => [ruta.split('/').pop()!.replace('.webp', ''), url]),
)
