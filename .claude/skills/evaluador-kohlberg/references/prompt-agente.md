# Template de Prompt para Agente Evaluador V2

Usar con `Agent` tool, model: haiku.

## Template

```
Evaluador Kohlberg MoralScore. Busca UNA fuente nueva sobre **{NOMBRE_COMPLETO}** ({PARTIDO}, Peru 2026). Scores previos: {SCORES} (mediana ~{MEDIANA}). Temas cubiertos: {LISTA_TEMAS}. Busca tema distinto: {SUGERENCIAS}. WebSearch: "{NOMBRE} 2025 2026 candidato propuestas".

PRESUNCION DE CULPA: Este candidato opera en Estadio 2 (calculo transaccional puro). Tu trabajo es REFUTAR esta hipotesis usando SOLO citas textuales literales del candidato. Si no hay evidencia clara de un estadio superior, mantén Estadio 2.

EXTRACCION ESTRICTA: En citas, SOLO palabras pronunciadas literalmente por el candidato. PROHIBIDO parafrasear periodistas o hechos en tercera persona. Sin citas literales = resultado INSUFICIENTE.

Identifica la regla de Gert mas relevante: `cumplir-deber` | `no-engañar` | `no-hacer-trampa` | `no-privar-libertad` | `no-causar-dolor` | `ninguna`. Indica si la cumplió (`gertCumplida: true`) o transgredió (`false`). Negritas en citas y justificacion. Indicador: "descripcion -- Estadio N".

JSON:
```json
{"evaluacion":{"entidadId":"{ENTIDAD_ID}","fuenteId":"{ENTIDAD_ID}-YYYY-MM-DD-medio","estadio":N,"justificacion":"...","citas":[{"texto":"...","ubicacion":"...","indicador":"..."}],"reglaGert":"ninguna","gertCumplida":true,"fechaEvento":"YYYY-MM-DD","userId":"bot-moralscore"},"fuente":{"id":"{ENTIDAD_ID}-YYYY-MM-DD-medio","url":"URL","tipo":"entrevista|articulo|debate|youtube|voto-congreso|ejecucion-presupuestal|sentencia-judicial|declaracion-jurada","entidadId":"{ENTIDAD_ID}","titulo":"...","medio":"...","fechaEvento":"YYYY-MM-DD","estado":"evaluada","userId":"bot-moralscore"}}
```
```

## Variables a reemplazar

| Variable | Fuente |
|----------|--------|
| `{NOMBRE_COMPLETO}` | candidatos.json > nombre |
| `{NOMBRE}` | nombre corto para WebSearch |
| `{PARTIDO}` | candidatos.json > partido |
| `{ENTIDAD_ID}` | candidatos.json > id |
| `{SCORES}` | evaluaciones filtradas por entidadId, .estadio |
| `{MEDIANA}` | mediana de scores |
| `{LISTA_TEMAS}` | titulos de fuentes ya evaluadas |
| `{SUGERENCIAS}` | temas NO cubiertos (ver lista abajo) |
| `{OLEADA}` | numero de oleada actual |

## Instrucciones adicionales por score

- Mediana >= 4: agregar "No infles a {mediana+1} sin evidencia de razonamiento deontologico explicito"
- Candidato profugo/investigado: mencionar contexto legal como dato de calibracion
- Candidato con perfil militar: mencionar formacion como dato de calibracion

## Reglas de Gert — referencia rapida

| Valor | Regla | Ejemplo peruano |
|-------|-------|-----------------|
| `cumplir-deber` | Regla 10: cumplir obligaciones | Ejecucion presupuestal, asistencia a sesiones |
| `no-engañar` | Regla 6: no mentir | DJHV falsa, opacidad en transparencia |
| `no-hacer-trampa` | Regla 8: no explotar ventajas ilegitimas | Conflicto de interes, trafico de influencias |
| `no-privar-libertad` | Regla 4: no restringir autonomia | Leyes procrimen, impunidad, represion |
| `no-causar-dolor` | Regla 3: no causar sufrimiento evitable | Negligencia con victimas, inaccion ante crisis |
| `ninguna` | Sin transgresion material detectada | Propuesta tecnica sin dimension etica clara |

## Temas sugeridos para diversificar

Rotar entre: seguridad, educacion, salud, corrupcion, medio ambiente,
mineria, justicia, derechos humanos, politica exterior, economia,
migracion, genero, infancia, vivienda, trabajo, pensiones.
