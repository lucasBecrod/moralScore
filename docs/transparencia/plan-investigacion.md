# Plan de Investigación — MoralScore

## Hipótesis a validar

### H1 — La gente SÍ quiere publicar fuentes
- **Riesgo**: que nadie suba nada
- **Test**: landing con botón "Evaluar una fuente" + contador
- **Métrica**: >50 fuentes en la primera semana sin pagar ads

### H2 — El score de la IA es creíble para el usuario
- **Riesgo**: "eso lo inventó la IA"
- **Test**: mostrar citas textuales al lado del score
- **Métrica**: tiempo en página detalle >30s (leen las citas)

### H3 — Las fuentes que sube la gente son de calidad suficiente
- **Riesgo**: memes, TikToks editados, discursos sin valor
- **Test**: clasificar las primeras 100 fuentes manualmente
- **Métrica**: >40% de fuentes pasan el filtro de calidad

### H4 — El score diferencia genuinamente entre candidatos
- **Riesgo**: todos salen en estadio 3-4
- **Test**: evaluar 5 fuentes por candidato, ver distribución
- **Métrica**: desviación estándar >1 estadio entre candidatos

### H5 — La gente comparte los resultados
- **Riesgo**: interesante pero no viral
- **Test**: botón de compartir + tracking
- **Métrica**: ratio fuente subida → share >0.3

---

## Taxonomía de Fuentes (por utilidad para Kohlberg)

| Tipo | Utilidad | Peso | Criterio |
|------|----------|------|----------|
| Debate | ALTA | 1.0 | Candidato argumenta ante dilemas |
| Entrevista adversarial | ALTA | 0.9 | Periodista presiona, se ve justificación |
| Conferencia de prensa | MEDIA | 0.7 | Respuestas semi-espontáneas |
| Entrevista amigable | MEDIA-BAJA | 0.5 | Preguntas suaves, respuestas preparadas |
| Discurso/mitin | BAJA | 0.3 | Preparado, busca aplausos |
| Artículo con citas directas | DEPENDE | 0.6 | Solo si tiene citas extensas del candidato |
| Red social (tweet, post) | BAJA | 0.2 | Corto, editado, sin contexto |
| Spot/publicidad | NULA | 0.0 | Rechazado automáticamente |

**Regla de oro**: la fuente es útil si el candidato responde a un dilema o pregunta difícil con su propia justificación. Cuanto más espontáneo, mejor.

---

## Algoritmo de Calidad

```
SCORE_CALIDAD = peso_tipo × confianza_ia × frescura × credibilidad_fuente

peso_tipo: según tabla arriba
confianza_ia: alta=1.0, media=0.7, baja=0.4
frescura: <3m=1.0, <6m=0.8, <1a=0.5, >1a=0.3
credibilidad_fuente: nacional=1.0, regional=0.8, canal_oficial=0.6, blog=0.4, anónimo=0.2
```

---

## Modelo de Incentivos

| Actor | Quiere | Le damos |
|-------|--------|----------|
| Simpatizante | Demostrar que su candidato razona bien | Score inmediato + compartir |
| Opositor | Evidenciar razonamiento pobre | Score inmediato + compartir |
| Periodista | Herramienta de análisis objetiva | Embed del score |
| Ciudadano neutro | Comparar con criterio | Ranking con evidencia |

## Loop Viral

```
Ve score → "¿será cierto?" → click → ve citas →
"yo tengo mejor fuente" → publica → score inmediato →
comparte → otro lo ve → repite
```

---

## Actores del Sistema (publicadores de fuentes)

### Humanos
- Usuarios registrados (email/Google)
- Cada publicación tiene autor visible
- Reputación basada en fuentes validadas

### Agente IA Autónomo
- Actúa como un usuario más en el sistema
- Busca fuentes automáticamente (YouTube, medios, etc.)
- Publica a través del mismo pipeline
- Sus publicaciones se identifican como "MoralScore Bot"
- Pasan por el mismo proceso de evaluación
- Objetivo: bootstrapear contenido antes de que lleguen usuarios reales

---

## Fases de Construcción

### Fase actual — Prototipo funcional
- [x] Landing con candidatos + scores
- [x] Página de detalle con fuentes
- [x] Formulario para subir fuentes
- [ ] Análisis automático con Claude API
- [ ] Login con Google (Firebase Auth)
- [ ] Panel de validación para Lucas/Lady

### Fase 2 — Social mínima
- [ ] Perfil público del publicador
- [ ] Feed de últimas fuentes evaluadas
- [ ] Botón compartir (Twitter, WhatsApp)
- [ ] Agente IA buscador de fuentes
- [ ] Contador de fuentes en landing (social proof)

### Fase 3 — Red social
- [ ] Comentarios en evaluaciones
- [ ] Sistema de verificación (otros usuarios confirman)
- [ ] Reputación del publicador
- [ ] Trending / más verificadas
- [ ] Embed para periodistas
