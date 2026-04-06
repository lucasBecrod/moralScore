# Criterios de Calidad de Fuente — Filtro IA

## Una URL es VÁLIDA si cumple TODOS:

1. **Contenido accesible**: la URL carga y tiene contenido textual o video reproducible
2. **Medio identificable**: proviene de un medio de comunicación reconocido, canal oficial del candidato, o institución verificable. NO blogs anónimos ni cuentas de fan.
3. **Candidato habla directamente**: es una entrevista, debate, conferencia de prensa, o declaración donde el candidato se expresa en primera persona. NO resúmenes de terceros ni interpretaciones de periodistas.
4. **Interacción presente**: el candidato responde preguntas o argumenta ante un dilema/tema. NO es un spot publicitario, comunicado de prensa del equipo, ni discurso preparado sin interacción.
5. **Fecha relevante**: contenido de la campaña 2025-2026. NO archivo histórico de otras elecciones (salvo que el usuario justifique).

## Una URL es RECHAZADA si cumple ALGUNO:

- Es spam, meme, contenido satírico, o parodia
- No contiene discurso directo del candidato (solo opinión de periodista/analista)
- Es contenido duplicado de una fuente ya registrada para el mismo candidato
- URL no carga, está detrás de paywall inaccesible, o es contenido privado
- Video sin audio o sin posibilidad de obtener transcripción

## Formato de respuesta del filtro:

```json
{
  "aprobada": true,
  "razon": "Entrevista en RPP del 15/03/2026 donde el candidato responde preguntas directas sobre política económica."
}
```

```json
{
  "aprobada": false,
  "razon": "El contenido es un spot publicitario de 30 segundos sin interacción ni argumentación moral."
}
```
