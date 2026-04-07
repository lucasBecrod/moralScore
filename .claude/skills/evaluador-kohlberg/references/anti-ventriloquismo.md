# Anti-Ventriloquismo — Patrones de Correccion

## El problema

Los LLMs (especialmente haiku) inflan scores morales ~25% del tiempo porque:
- RLHF entrena a generar respuestas "sofisticadas" y "eticas"
- Confunden sofisticacion linguistica con desarrollo moral
- Premian respuestas diplomaticas o politicamente correctas
- Asignan E4-5 a quien simplemente menciona "instituciones" o "derechos"

## Regla de oro

**Ante la duda, asignar el estadio MAS BAJO que la evidencia soporte.**

## Patrones de inflacion frecuentes

### Haiku asigna E4, deberia ser E2
- Propuestas de "cadena perpetua" o "pena de muerte" = castigo puro, E1-2
- "Muerte civil" sin justificacion etica = retribucion, E2
- "Expulsion en 48 horas" sin proceso = autoritarismo, E1
- Propuestas presupuestarias ("mayor presupuesto historia") = transaccional, E2
- "Recompensas economicas por reportes" = intercambio, E2

### Haiku asigna E4, deberia ser E3
- "Zar anticorrupcion" = solucion personalista, E3
- "50,000 camaras IA" sin mencion de privacidad = enforcement puro, E3
- "Cadena perpetua para sicarios" sin proporcionalidad = E3
- Justificar represion como "defensa del orden" = lealtad, E3
- Llamar "violentistas" a manifestantes = conformismo grupal, E3

### Haiku asigna E5, deberia ser E4
- Defender instituciones por utilidad ("es una garantia") no por principio = E4
- Rechazar pena de muerte por ineficacia, no por dignidad = E4
- "Consensos en el Congreso" = pragmatismo politico, E4
- Autonomia institucional como eficiencia, no como derecho = E4

### Haiku asigna E3-4, deberia ser E1-2
- Perdon performativo en debate = no eleva (contexto electoralista)
- "La etica no se firma, se practica" dicho por familiar de profugo = defleccion
- Indultar a hermano "porque es inocente" = lealtad familiar, E2

## Historial de correcciones (oleadas 1-8)

| Oleada | Candidato | Haiku | Correccion | Razon |
|--------|-----------|-------|------------|-------|
| 6 | Carrasco | 4 | 2 | "Mano dura" es E2 |
| 6 | Sanchez P. | 4 | 3 | Promesas sin estructura |
| 6 | Gonzales | 4 | 3 | Enforcement sin derechos |
| 6 | Chirinos | 2 | 1 | Amenazas veladas |
| 6 | Espa | 4 | 3 | Solucion personalista |
| 6 | Caller | 3 | 2 | Pragmatismo sin etica |
| 6 | Grozo | 1 | 3 | Subestimacion corregida |
| 7 | Sanchez P. | 3 | 2 | Cadena perpetua = punitivo |
| 7 | Valderrama | 4 | 3 | Enforcement sin derechos |
| 7 | Grozo | 4 | 3 | Justificar represion = E3 |
| 7 | Vizcarra | 4 | 2 | Indultar hermano = E2 |
| 7 | Espa | 4 | 3 | Zar anticorrupcion = E3 |
| 7 | Fernandez | 4 | 2 | Defleccion, hermano profugo |
| 7 | Guevara | 4 | 3 | Enforcement sin derechos |
| 8 | Masse | 3 | 2 | Recompensas = transaccional |
| 8 | Belmont | 4 | 2 | Pena de muerte = E1-2 |
| 8 | Carrasco | 4 | 2 | Megacarceles = E1-2 |
| 8 | Paz de la Barra | 3 | 1 | Perdon performativo |

Tasa de correccion: ~25% de evaluaciones haiku requieren ajuste a la baja.
