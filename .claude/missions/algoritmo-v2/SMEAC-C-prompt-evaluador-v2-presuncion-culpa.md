# Agente C — Prompt Evaluador V2: Presunción de Culpa + Gert

> **Modelo**: sonnet
>
> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir redacción del prompt, estructura interna, orden de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar schemas (`src/schemas/`) — ya fueron actualizados
- NO tocar lógica de backend (`scripts/`, `src/firebase/`)
- NO tocar componentes de UI (`src/features/`)
- NO tocar `data/*.json`
- NO cambiar el modelo del agente evaluador (sigue siendo haiku)

### Archivos protegidos (NO modificar)
- `src/schemas/*.ts`
- `scripts/*.ts`
- `src/firebase/*.ts`
- `src/features/**/*`
- `data/*.json`

### Límite de alcance
Solo archivos dentro de `.claude/skills/evaluador-kohlberg/`. Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
**C**: Reescribir el prompt del agente evaluador para implementar la "presunción de culpa" (asumir Estadio 2 y forzar refutación) y exigir la extracción de la regla de Gert transgredida/cumplida.

### Criterio de éxito
1. El prompt incluye la instrucción de presunción de culpa (Estadio 2)
2. El JSON de respuesta exige `reglaGert` y `gertCumplida`
3. El JSON de respuesta NO incluye `confianza`, `estadioAlternativo`, ni `notas`
4. La regla de extracción estricta (solo citas literales) se mantiene
5. El template de variables ({NOMBRE_COMPLETO}, etc.) sigue funcional
6. El prompt es conciso — máximo 400 tokens (el LLM es haiku, tokens caros en volumen)

---

## SITUACIÓN (Contexto)

### Archivos objetivo
- `.claude/skills/evaluador-kohlberg/references/prompt-agente.md` — reescribir el template

### Archivos de contexto (leer primero, NO editar)
- `.claude/skills/evaluador-kohlberg/SKILL.md` — flujo completo del skill, para entender cómo se usa el prompt
- `src/schemas/analisis-response.schema.ts` — el nuevo schema V2 que el JSON debe cumplir
- `src/schemas/evaluacion.schema.ts` — contiene `ReglaGert` enum con los 6 valores válidos

### Estado actual del prompt

El prompt V1 dice:
```
Evaluador Kohlberg MoralScore. Busca UNA fuente nueva sobre {NOMBRE}...
```

Problemas:
1. **Sin presunción de culpa**: le pide al LLM que "asigne un estadio", lo cual invita a inflar
2. **Sin Gert**: no extrae reglas de Gert transgredidas
3. **Campos muertos**: el JSON de respuesta pide `confianza`, `estadioAlternativo`, `notas`
4. **El agente busca la fuente**: en V2, la fuente se le dará al agente (pero mantener compatibilidad con el flujo actual donde el agente busca)

### Diseño del prompt V2

El nuevo prompt debe:

1. **Presunción de culpa**: "Asume que este candidato opera en Estadio 2 (cálculo transaccional puro). Tu trabajo es REFUTAR esta hipótesis usando SOLO citas textuales literales."

2. **Extracción Gert**: "Identifica la regla de Gert más relevante" con los 6 valores del enum: `cumplir-deber`, `no-engañar`, `no-hacer-trampa`, `no-privar-libertad`, `no-causar-dolor`, `ninguna`.

3. **JSON limpio**: Solo 5 campos en evaluación: `estadio`, `justificacion`, `citas[]`, `reglaGert`, `gertCumplida`.

4. **Mantener**: la regla de extracción estricta (solo citas literales del candidato, prohibido parafrasear periodistas).

---

## EJECUCIÓN (Método)

### Paso 1: Leer el SKILL.md completo
Entender cómo se inyectan las variables y cómo se usa el prompt en el flujo de oleadas.

### Paso 2: Leer el schema V2
Verificar los campos exactos de `AnalisisResponseSchema` y `ReglaGert` para que el JSON del prompt coincida exactamente.

### Paso 3: Reescribir prompt-agente.md
Reemplazar el template completo. El nuevo prompt debe seguir esta estructura:

```markdown
# Template de Prompt para Agente Evaluador V2

Usar con `Agent` tool, model: haiku.

## Template

[El prompt con presunción de culpa + Gert + JSON limpio]

## Variables a reemplazar
[Misma tabla de variables — no cambiar]

## Instrucciones adicionales por score
[Actualizar para reflejar la presunción de culpa]

## Reglas de Gert — referencia para el evaluador
[Tabla breve de las 6 reglas con ejemplo peruano de cada una]

## Temas sugeridos para diversificar
[Mantener la lista existente]
```

### Paso 4: Actualizar el JSON de ejemplo
El JSON de respuesta en el template debe coincidir exactamente con el schema V2:
```json
{
  "evaluacion": {
    "entidadId": "{ENTIDAD_ID}",
    "fuenteId": "{ENTIDAD_ID}-YYYY-MM-DD-medio",
    "estadio": N,
    "justificacion": "...",
    "citas": [{"texto": "...", "ubicacion": "...", "indicador": "..."}],
    "reglaGert": "ninguna|cumplir-deber|no-engañar|no-hacer-trampa|no-privar-libertad|no-causar-dolor",
    "gertCumplida": true,
    "fechaEvento": "YYYY-MM-DD",
    "userId": "bot-moralscore"
  },
  "fuente": {
    "id": "{ENTIDAD_ID}-YYYY-MM-DD-medio",
    "url": "URL",
    "tipo": "entrevista|articulo|debate|youtube|voto-congreso|ejecucion-presupuestal|sentencia-judicial|declaracion-jurada",
    "entidadId": "{ENTIDAD_ID}",
    "titulo": "...",
    "medio": "...",
    "fechaEvento": "YYYY-MM-DD",
    "estado": "evaluada",
    "userId": "bot-moralscore"
  }
}
```

### Paso 5: Actualizar SKILL.md si tiene referencias al JSON viejo
Buscar en SKILL.md si hay menciones a `confianza`, `estadioAlternativo` o `notas` y eliminarlas. Buscar si hay instrucciones sobre el formato de respuesta que contradigan V2.

---

## APOYO (Recursos)

### Rutas
- Proyecto: `c:\Users\lucas\proyectos\moralScore`
- Skill: `.claude/skills/evaluador-kohlberg/`

### Valores válidos de ReglaGert (del enum Zod)
```
cumplir-deber        — Regla 10: ejecución presupuestal, asistencia a sesiones
no-engañar           — Regla 6: DJHV falsa, opacidad en transparencia
no-hacer-trampa      — Regla 8: conflicto de interés, tráfico de influencias
no-privar-libertad   — Regla 4: leyes procrimen, impunidad, represión
no-causar-dolor      — Regla 3: negligencia con víctimas, inacción ante crisis
ninguna              — Sin transgresión material detectada
```

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar:
1. ¿El prompt tiene instrucciones redundantes o que se repiten?
2. ¿Hay alguna sección del prompt que el LLM haiku ignorará por exceso de tokens?
3. ¿Se puede decir lo mismo con menos palabras sin perder precisión?
4. Elimina al menos 1 sección o instrucción que no aporte
5. Cuenta tokens aproximados — target: máximo 400 tokens el template base

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. El prompt contiene "presunción de culpa" o "Estadio 2" como default
2. El JSON de respuesta tiene exactamente: `estadio`, `justificacion`, `citas`, `reglaGert`, `gertCumplida` (+ campos de metadata)
3. El JSON NO contiene `confianza`, `estadioAlternativo`, `notas`
4. Los 6 valores de `ReglaGert` aparecen documentados en el prompt
5. La regla de extracción estricta (solo citas literales) está presente
6. Las variables {NOMBRE_COMPLETO}, {PARTIDO}, etc. siguen en el template
7. `git diff --stat` → solo archivos dentro de `.claude/skills/evaluador-kohlberg/`
8. Verificar que archivos protegidos NO fueron modificados

### Si algo falla después de 3 enfoques distintos
Reportar bloqueo con: qué intentaste, qué falló, qué propones.

---

**ACCIÓN INMEDIATA**: Lee SKILL.md y el schema V2 (analisis-response.schema.ts + evaluacion.schema.ts), luego reescribe el prompt. Comienza.
