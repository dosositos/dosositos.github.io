# dos ositos

Web-regalo de osito (Armando) para osita (Jennifer). Se publica en GitHub Pages
el **24 de agosto de 2026**, dos años de haberse conocido. Ver `PLAN.md`.

## Stack

Vite 8 · React 19 · TypeScript 7 · Tailwind 4 (config en CSS, no en JS) ·
Motion · React Router 7 en modo hash.

## Reglas del proyecto

**Idioma.** Todo en español de Nicaragua, con *vos* («contame», «acordate»,
«tenés»). Los nombres de variables, funciones y archivos también van en español;
es el idioma del proyecto, no una traducción.

**Privacidad — lo más importante.** Nada de `private/` llega jamás al
repositorio. El material sensible (chats, frases del juego, cartas) se publica
cifrado con AES-GCM vía `scripts/cifrar-contenido.mjs` y se abre en el navegador
con `src/lib/cripto.ts`. Antes de cualquier commit, verificar que no se coló
contenido del chat en claro dentro de `src/`.

**Ninguna frase real de la conversación vive en `src/`.** Las conversaciones de
los momentos están en `private/publicable/chats.json`, con el id del momento como
llave; en `src/content/momentos.ts` solo queda la ficha (`chat: { mensajes, fuente }`)
y `ChatCifrado` las descifra en el teléfono. Lo que sí va en claro son los
relatos y las notas: son la voz de Armando contando, no citas de ella.

**Separación contenido / código.** Armando toca `src/content/*` y nada más.
Esos archivos son datos con comentarios explicativos, sin lógica. Si algo
necesita que él edite código de verdad, está mal diseñado.

**Fechas.** Siempre a través de `src/lib/tiempo.ts`, que calcula en horario de
Nicaragua (UTC-6). Nunca `new Date().getMonth()` directo: en el teléfono de
alguien con otra zona horaria los contadores se descuadran un día.

**Estética.** Nocturna y sobria de fondo (modo osito azul/dorado, modo osita
ciruela/rosa) para que las flores y las fotos, que sí tienen mucho color, se
lleven el protagonismo. Scrapbook: papel, cinta adhesiva, polaroids torcidas,
letra manuscrita (`fuente-mano`) para lo íntimo y serif (`font-display`) para
los títulos.

**Los colores son personas y cosas.** `--color-girasol`, `--color-rosa-roja`,
`--color-tulipan-violeta`, `--color-hibisco` son las flores de lego y los ramos
reales. `--color-ovi`, `--color-boo-*`, `--color-nico` son sus peluches. No
inventar colores nuevos sin motivo: cada uno significa algo.

**Movimiento.** Generoso pero fluido, y siempre respetando
`prefers-reduced-motion` (ya está resuelto en `index.css`).

**Móvil primero.** Se va a ver sobre todo en el teléfono de ella. Nada se prueba
solo en escritorio.

## Comandos

```bash
npm run dev              # servidor local
npm run build            # compilar
npm run typecheck        # revisar tipos

npm run chat:parsear     # private/chat.txt → datos utilizables
npm run chat:instagram   # private/instagram_export.json → datos utilizables
npm run chat:dia -- 2024-08-25   # la conversación de un día (las dos fuentes)
npm run chat:frases      # genera candidatas para el juego
npm run fotos:optimizar  # fotos-originales/ → public/media/ en AVIF
npm run secretos:cifrar  # private/publicable/ → public/cifrado/
```

## Estructura

```
src/content/    ← lo que edita Armando (momentos, playlist, peluches, config)
src/componentes/
src/paginas/
src/lib/        ← tiempo, celebraciones, cripto
scripts/        ← herramientas de línea de comandos
private/        ← IGNORADO POR GIT: material crudo
public/media/   ← fotos ya optimizadas
public/cifrado/ ← contenido privado cifrado
```
