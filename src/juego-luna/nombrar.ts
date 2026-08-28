/**
 * El nombre que ella le puso a la tortuga, metido en los textos.
 *
 * En `luna.ts` los textos se escriben con dos huecos, `{tortuga}` y
 * `{Tortuga}`, y aquí se rellenan. Son dos y no uno porque sin nombre
 * el hueco se llena con un artículo —«la tortuga»— y en español eso
 * cambia de forma según dónde caiga: «{Tortuga} camina sola» tiene que
 * dar «La tortuga camina sola», y «esperá a {tortuga}» tiene que dar
 * «esperá a la tortuga». Con nombre propio los dos dan lo mismo, que
 * es justamente lo que se busca.
 *
 * Se hace aquí y no en el contenido para que `luna.ts` siga siendo lo
 * que dice ser: textos y números, sin una sola línea de lógica.
 */

/** Cómo se la llama mientras no tenga nombre. */
const SIN_NOMBRE = 'la tortuga'
const SIN_NOMBRE_MAYUSCULA = 'La tortuga'

/** Rellena los huecos de un texto con el nombre, si es que hay. */
export function conNombre(texto: string, nombre: string): string {
  const puesto = nombre.trim()
  return texto
    .replaceAll('{Tortuga}', puesto || SIN_NOMBRE_MAYUSCULA)
    .replaceAll('{tortuga}', puesto || SIN_NOMBRE)
}
