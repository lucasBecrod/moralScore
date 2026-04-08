# Formato de Evaluacion y Fuente

## Schema Evaluacion (data/evaluaciones.json)

```json
{
  "id": "eval-{slug-descriptivo}",
  "entidadId": "nombre-completo-del-candidato-slug",
  "fuenteId": "nombre-completo-YYYY-MM-DD-medio",
  "estadio": 3,
  "justificacion": "Texto con **resaltado inline** en frases clave...",
  "citas": [
    {
      "texto": "Cita textual con **negritas en mecanismo retorico**",
      "ubicacion": "Medio, fecha, contexto (debate JNE, entrevista RPP, etc.)",
      "indicador": "Descripcion del mecanismo en lenguaje ciudadano -- Estadio N"
    }
  ],
  "reglaGert": "ninguna",
  "gertCumplida": true,
  "evaluador": "haiku-{oleada}"
}
```

## Schema Fuente (data/fuentes.json)

```json
{
  "id": "nombre-completo-YYYY-MM-DD-medio",
  "url": "https://url-real-verificada.com/articulo",
  "tipo": "entrevista|articulo|debate|youtube|mitin|conferencia|columna|voto-congreso|ejecucion-presupuestal|sentencia-judicial|declaracion-jurada",
  "entidadId": "nombre-completo-del-candidato-slug",
  "titulo": "Titulo descriptivo de la fuente",
  "medio": "Nombre del medio (Infobae, La Republica, etc.)",
  "fechaEvento": "YYYY-MM-DD",
  "estado": "evaluada",
  "userId": "bot-moralscore"
}
```

## Ejemplo completo con resaltado inline

```json
{
  "id": "eval-luna-galvez-mineria-reinfo",
  "entidadId": "jose-leon-luna-galvez",
  "fuenteId": "jose-leon-luna-galvez-2025-12-17-correo",
  "estadio": 2,
  "justificacion": "Luna Galvez reconoce que **REINFO es un engana muchachos**, pero su conducta revela transaccionalismo: propone extender REINFO y coloca al minero ilegal Torrealva en Comision de Energia. Justifica con amenaza: **si no ampliamos, un millon de ciudadanos van a incendiar el Peru**.",
  "citas": [
    {
      "texto": "**Es un engana muchachos**, no va a solucionar nada",
      "ubicacion": "Diario Correo, sobre REINFO, 2025",
      "indicador": "Reconoce falsedad del instrumento pero promueve su extension -- Estadio 2"
    },
    {
      "texto": "Si no se amplia tienes **un millon de ciudadanos que van a incendiar todo el Peru**",
      "ubicacion": "Diario Correo, Exitosa Noticias, 2025",
      "indicador": "Usa amenaza de violencia colectiva para justificar beneficios a mineria ilegal -- Estadio 2"
    }
  ],
  "reglaGert": "no-hacer-trampa",
  "gertCumplida": false,
  "evaluador": "haiku-7"
}
```

## Convenciones de IDs

- **entidadId**: slug completo del candidato en candidatos.json (ej: `jose-leon-luna-galvez`)
- **fuenteId**: `{entidadId}-{YYYY-MM-DD}-{medio-corto}` (ej: `jose-leon-luna-galvez-2025-12-17-correo`)
- **eval id**: `eval-{apellido}-{tema-corto}` (ej: `eval-luna-galvez-mineria-reinfo`)
- **evaluador**: `haiku-{numero-oleada}` (ej: `haiku-8`)

## Resaltado inline

El campo `citas.texto` y `justificacion` soportan markdown `**negritas**`.
La UI renderiza negritas con color semitransparente del estadio Kohlberg.

Reglas:
- Resaltar SOLO frases que evidencian mecanismo retorico
- No resaltar toda la cita, solo las partes clave
- En indicador: describir mecanismo en lenguaje ciudadano, terminar con "-- Estadio N"
