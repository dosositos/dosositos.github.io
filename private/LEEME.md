# 🔒 Carpeta privada

**Nada de lo que esté aquí se sube a GitHub.** Está bloqueado en `.gitignore`.

Esta es la zona de trabajo: aquí vive el material crudo del que sacamos
el contenido de la web, y aquí se queda.

## Qué va aquí

| Archivo | Qué es | Cómo aparece |
|---|---|---|
| `chat.txt` | El export de WhatsApp, tal cual | **lo ponés vos** |
| `chat.json` | Todos los mensajes ya ordenados | `npm run chat:parsear` |
| `por-dia.json` | Los mensajes agrupados por día | `npm run chat:parsear` |
| `estadisticas.json` | Cuentas del chat (quién habla más, etc.) | `npm run chat:parsear` |
| `frases-candidatas.json` | Candidatas para el juego, para que las revisés | `npm run chat:frases` |
| `publicable/*.json` | Lo ya curado que sí va a la web, **pero cifrado** | lo armás vos o yo |

## Cómo exportar el chat

En WhatsApp, abrí la conversación → ⋮ (arriba a la derecha) → **Más** →
**Exportar chat** → **Sin archivos**. Te da un `.txt`.
Guardalo aquí como `chat.txt`.

> Elegí *Sin archivos*: con archivos pesa gigas y no lo necesitamos, las
> fotos las vas a elegir vos a mano.

## La regla de oro

Del chat crudo **nunca** sale nada directo a la web. El camino siempre es:

```
private/chat.txt  →  private/frases-candidatas.json  →  vos aprobás a mano
                  →  private/publicable/frases.json  →  cifrado  →  web
```

Así, si alguien encuentra el enlace de la página, se topa con una puerta
cerrada, no con nuestra vida.
