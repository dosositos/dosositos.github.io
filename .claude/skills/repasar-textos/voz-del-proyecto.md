# La voz de este proyecto (capa en español)

El `SKILL.md` de al lado está en inglés y su lista de palabras delatoras también.
Esta hoja es la parte que sí aplica a *dos ositos*. Leela junto con el skill
antes de repasar cualquier texto del regalo.

## Qué se repasa y qué no se toca nunca

**Se repasa** (todo esto lo escribió Claude o lo dictó Armando y lo pasé yo a
prosa):

- `src/content/momentos.ts` → `resumen`, `relato`, `nota.texto`, pies de foto y `alt`
- `src/content/diccionario.ts` → definiciones y ejemplos redactados
- `src/content/peluches.ts`, `playlist.ts`, `regalo.ts` y los textos de pantalla
- `src/content/mensajitos.ts` → solo `POR_DIA` y los textos de la pantalla
- Los textos de interfaz sueltos en `src/paginas/` y `src/componentes/`
- `PLAN.md`, `README.md`, `CLAUDE.md`

**No se toca, por ningún motivo:**

- Nada de `private/publicable/` ni de `public/cifrado/`: los chats, las frases
  del juego, las citas del diccionario y los 20 mensajitos textuales **son
  palabras de verdad de ellos dos**. Reescribirlas no es humanizar, es falsificar
  el recuerdo. Los dedazos, las risas y los alargues son lo gracioso.
- Los mensajitos armados con sus fórmulas: imitan su manera de escribir a
  propósito.
- Lo que está mal escrito aposta y ya quedó documentado: `testraño`, `abriba`,
  `gashas` con sh (ella) y con ch (él).

## Cómo suena bien aquí

- **Español de Nicaragua, con vos.** «contame», «acordate», «tenés», «mirá». La
  segunda persona en tú o en usted se cuela sola cuando el texto se reescribe:
  revisá cada verbo.
- **Es Armando contando, no un narrador.** Primera persona, sin distancia. Si
  una frase la podría haber escrito cualquiera sobre cualquier pareja, está mal.
- **Concreto antes que tierno.** «Un tulipán amarillo, uno violeta, una rosa
  roja y un hibisco rosa» dice más que «armamos flores llenas de amor». Los
  detalles verificables son el cariño; los adjetivos son relleno.
- **Sin solemnidad de tarjeta.** Nada de «un testimonio de», «para siempre
  jamás», «el destino quiso». Nada de moraleja al final del relato: contá lo que
  pasó y callate.
- **Frase corta.** Si una oración necesita dos comas para respirar, partila.

## Delatores en español, además de los del skill

Rachas de tres («risas, silencio y ternura»), el «no solo… sino también», los
gerundios que resumen sin decir nada («marcando un antes y un después»),
«en el mundo de», «sumergirse», «un abrazo que lo dice todo», los signos de
admiración de más, los emojis puestos para llenar y la raya larga usada como
comodín cuando bastaba un punto.

## Cuándo corre

Antes de publicar: cuando termine de redactar texto nuevo o de editar el ya
escrito, se pasa el skill sobre los archivos tocados, y recién después se hace
`npm run revisar` y el commit.
