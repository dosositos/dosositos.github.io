/**
 * Descifrado en el navegador del contenido privado.
 * El complemento de scripts/cifrar-contenido.mjs.
 *
 * La frase-contraseña no viaja a ningún servidor ni se guarda cifrada
 * en el código: se escribe, se deriva la llave en el propio teléfono,
 * y si abre el archivo es que era la correcta.
 */

interface Sobre {
  v: number
  alg: string
  kdf: string
  sal: string
  iv: string
  datos: string
}

const ITERACIONES = 250_000

/** Base64 → bytes. El tipo explícito hace falta para Web Crypto. */
function deBase64(s: string): Uint8Array<ArrayBuffer> {
  const binario = atob(s)
  const bytes = new Uint8Array(new ArrayBuffer(binario.length))
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return bytes
}

const bytesDeTexto = (t: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(new TextEncoder().encode(t))

async function derivarLlave(clave: string, sal: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    bytesDeTexto(clave),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: sal, iterations: ITERACIONES, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
}

export class ClaveIncorrecta extends Error {
  constructor() {
    super('clave-incorrecta')
  }
}

/**
 * Descarga y descifra un archivo de /public/cifrado.
 * @param nombre  sin extensión: 'frases' busca /cifrado/frases.enc
 */
export async function abrirSobre<T>(nombre: string, clave: string): Promise<T> {
  const url = `${import.meta.env.BASE_URL}cifrado/${nombre}.enc`
  const respuesta = await fetch(url)
  if (!respuesta.ok) throw new Error(`No encontré ${nombre}.enc`)

  const sobre: Sobre = await respuesta.json()
  const llave = await derivarLlave(clave, deBase64(sobre.sal))

  try {
    const claro = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: deBase64(sobre.iv) },
      llave,
      deBase64(sobre.datos),
    )
    return JSON.parse(new TextDecoder().decode(claro)) as T
  } catch {
    // AES-GCM falla la verificación de integridad si la clave no es la correcta
    throw new ClaveIncorrecta()
  }
}

const LLAVE_SESION = 'dosositos:abierto'

/** Guarda la frase en la sesión para no pedirla en cada pantalla. */
export function recordarClave(clave: string) {
  sessionStorage.setItem(LLAVE_SESION, clave)
}

export function claveRecordada(): string | null {
  return sessionStorage.getItem(LLAVE_SESION)
}

export function olvidarClave() {
  sessionStorage.removeItem(LLAVE_SESION)
}
