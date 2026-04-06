# Criterios de Calidad de Fuente — Filtro IA

## Principio: Kohlberg y Gert consumen distinto

No todas las fuentes sirven para lo mismo. Un debate revela cómo RAZONA
el candidato (Kohlberg). Un mitin revela qué REGLAS TRANSGREDE (Gert).
La calidad de una fuente depende de PARA QUÉ se usa.

## Utilidad por tipo de fuente (bifurcada)

| Tipo | Kohlberg (razonamiento) | Gert (transgresiones) | Nota |
|------|------------------------|-----------------------|------|
| Debate | ALTA (1.0) | ALTA (1.0) | Confrontación espontánea |
| Entrevista adversarial | ALTA (0.9) | ALTA (0.9) | Periodista presiona |
| Conferencia de prensa | MEDIA (0.7) | MEDIA (0.7) | Semi-preparado |
| Artículo con citas | MEDIA (0.6) | MEDIA (0.6) | Depende de extensión |
| Entrevista amigable | BAJA (0.5) | MEDIA (0.6) | Preguntas suaves |
| **Discurso/mitin** | **BAJA (0.3)** | **ALTA (0.9)** | **Bifurcación clave** |
| Red social | BAJA (0.2) | MEDIA (0.5) | Corto, sin contexto |
| Spot/publicidad | NULA (0.0) | BAJA (0.2) | Guionizado |

**Regla clave**: un mitin no revela cómo piensa el candidato (Kohlberg),
pero SÍ revela cómo manipula (Gert). Cuando el evaluador recibe un mitin,
aplica techo Estadio 3 para Kohlberg pero analiza transgresiones Gert
sin restricción.

## Una URL es VÁLIDA si cumple TODOS:

1. **Contenido accesible**: la URL carga y tiene contenido textual o video reproducible
2. **Medio identificable**: proviene de un medio de comunicación reconocido, canal oficial del candidato, o institución verificable. NO blogs anónimos ni cuentas de fan.
3. **Candidato habla directamente**: se expresa en primera persona (entrevista, debate, conferencia, mitin). NO resúmenes de terceros.
4. **Sustancia mínima**: >2 minutos de discurso o >3 párrafos de citas directas.
5. **Fecha relevante**: contenido de la campaña 2025-2026 o historial de gestión relevante.

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
