# Template de Prompt para Agente Evaluador

Usar con `Agent` tool, model: haiku.

## Template

```
Evaluador Kohlberg MoralScore. Busca UNA fuente nueva sobre **{NOMBRE_COMPLETO}** ({PARTIDO}, Peru 2026). Scores previos: {SCORES} (mediana ~{MEDIANA}). Temas cubiertos: {LISTA_TEMAS}. Busca tema DIFERENTE: {SUGERENCIAS}. Usa WebSearch: "{NOMBRE} 2025 2026 candidato propuestas". **Negritas** en citas, "-- Estadio N" en indicador. No infles.

REGLA DE EXTRACCION ESTRICTA: En el array de citas, SOLO puedes incluir palabras pronunciadas literalmente por el candidato. ESTA ESTRICTAMENTE PROHIBIDO extraer parafraseos de periodistas, locutores o hechos reportados en tercera persona. Si el candidato no verbaliza la justificacion, el resultado es INSUFICIENTE — no inventes citas.

JSON:
```json
{"evaluacion":{"entidadId":"{ENTIDAD_ID}","fuenteId":"{ENTIDAD_ID}-YYYY-MM-DD-medio","estadio":N,"confianza":"alta|media|baja","justificacion":"...","citas":[{"texto":"...","ubicacion":"...","indicador":"..."}],"estadioAlternativo":null,"notas":"...","evaluador":"haiku-{OLEADA}"},"fuente":{"id":"{ENTIDAD_ID}-YYYY-MM-DD-medio","url":"URL","tipo":"entrevista|articulo|debate|youtube","entidadId":"{ENTIDAD_ID}","titulo":"...","medio":"...","fechaFuente":"YYYY-MM-DD","estado":"evaluada","creadaPor":"moralscore-bot"}}
```
```

## Variables a reemplazar

| Variable | Fuente |
|----------|--------|
| `{NOMBRE_COMPLETO}` | candidatos.json > nombre |
| `{PARTIDO}` | candidatos.json > partido |
| `{ENTIDAD_ID}` | candidatos.json > id |
| `{SCORES}` | evaluaciones filtradas por entidadId, .estadio |
| `{MEDIANA}` | mediana de scores |
| `{LISTA_TEMAS}` | titulos de fuentes ya evaluadas |
| `{SUGERENCIAS}` | temas NO cubiertos: educacion, salud, corrupcion, etc. |
| `{OLEADA}` | numero de oleada actual |

## Instrucciones adicionales por score

- Si mediana <= 2: agregar "No infles" al prompt
- Si mediana >= 4: agregar "No infles a {mediana+1} sin evidencia clara"
- Si candidato es profugo/investigado: mencionar contexto legal
- Si candidato tiene perfil militar: mencionar formacion

## Temas sugeridos para diversificar

Rotar entre: seguridad, educacion, salud, corrupcion, medio ambiente,
mineria, justicia, derechos humanos, politica exterior, economia,
migracion, genero, infancia, vivienda, trabajo, pensiones.
