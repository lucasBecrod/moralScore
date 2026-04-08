# Templates de Prompts — /orquestar

## Template: Auditoría técnica (P1-PN)

Usar cuando se necesita validar el estado real del código antes de construir.

```markdown
# Auditoría — [Qué se está auditando]

> **Modelo**: haiku

Eres un agente explorador. Tu misión es auditar el estado actual del código para
responder N preguntas concretas. NO modifiques nada. Solo lees y reportas.

## Contexto
[2-3 líneas del problema y la estrategia que se está siguiendo]

## Archivos a leer (en este orden)
1. `[ruta exacta]` → [qué buscar]
2. `[ruta exacta]` → [qué verificar]
3. `[subsistema/]` → busca [patrón o función específica]

## Las N preguntas que debes responder

### P1 — [Pregunta concreta]
Lee [archivo]. Reporta:
- [punto a verificar 1]
- [punto a verificar 2]
- [qué colecciones/módulos NO cubre que deberían cubrirse]

### P2 — [Pregunta concreta]
Lee [archivos]. Reporta:
- [evidencia de que existe o no existe]
- [comportamiento esperado vs encontrado]

[...repetir para cada pregunta]

## Formato de respuesta
Responde con N secciones numeradas (P1-PN). Para cada una:
- **Estado**: ✅ Completo / ⚠️ Parcial / ❌ Faltante
- **Evidencia**: cita el fragmento de código relevante (máx 5 líneas)
- **Gap**: qué falta exactamente si no está completo

Sé preciso y conciso. El orquestador usará tu reporte para planificar los agentes de construcción.
```

---

## Template: Exploración libre

```markdown
# Exploración — [Pregunta concreta]

> **Modelo**: haiku

## Objetivo
[Una pregunta específica que debe quedar respondida]

## Hipótesis a validar
- H1: [lo que creemos que encontrará]
- H2: [alternativa posible]

## Archivos/rutas a explorar
- [ruta 1] — buscar [qué exactamente]
- [ruta 2] — verificar [qué]

## Skills disponibles
Usar `/[skill-name]` si aplica para el dominio explorado.

## Formato de reporte esperado
- Lista de hallazgos por hipótesis (confirmada/refutada/parcial)
- Gaps encontrados
- Recomendación de siguiente paso
```

---

## Template: Ejecución puntual

```markdown
# Agente — [Título descriptivo]

> **Modelo**: sonnet | haiku  ← (sonnet si requiere juicio/diseño, haiku si scope < 3 archivos y patrón claro)

## Skills
Activa el skill `/[nombre]` antes de cualquier cambio en [dominio].

## Misión
[Qué debe lograr exactamente, con criterio de éxito medible]

## Contexto (leer primero, NO editar)
- [archivos de referencia — NO el archivo del skill, ese se activa arriba]

## Archivos objetivo
- [ruta exacta a modificar]

## Restricciones
- NO tocar [archivos fuera del scope]

## Entregable
[Qué debe reportar al terminar: archivos modificados, commit hecho, resumen de cambios]
```

---

## Template: Orden de Misión SMEAC

Estructura optimizada para LLMs (Lost in the Middle — info crítica al inicio y final).

```
┌─────────────────────────────────────┐
│ RESTRICCIONES  ← Alta atención      │  INICIO
│ MISIÓN         ← Alta atención      │
├─────────────────────────────────────┤
│ situación      ← Baja atención      │  CENTRO
│ ejecución                           │
│ apoyo                               │
├─────────────────────────────────────┤
│ VALIDACIÓN     ← Alta atención      │  FINAL
│ ACCIÓN         ← Alta atención      │
└─────────────────────────────────────┘
```

```markdown
# Agente N — [Título descriptivo]

> **Modelo**: sonnet  ← (sonnet por defecto para SMEAC; haiku solo si scope < 3 archivos y patrón mecánico)
>
> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO [restricción dura 1]
- NO [restricción dura 2]
- NO tocar archivos fuera de [scope]

### Archivos protegidos (NO modificar)
- `[ruta/archivo]`

### Límite de alcance
[1 línea definiendo el perímetro exacto de la misión]

---

## MISIÓN (Objetivo)

### Tarea asignada
**[ID]**: [Descripción concisa del problema y qué lograr]

### Criterio de éxito
- [Medible 1: ej. "Tests pasan >97%"]
- [Medible 2: ej. "Max ~250 LOC por archivo"]
- [Medible 3: ej. "Build exitoso"]

---

## SITUACIÓN (Contexto)

### Archivos objetivo
- `[ruta exacta]`

### Archivos de contexto (leer primero, NO editar)
- `[doc normativo]`
- `[test existente como referencia]`
- `[config relevante]`

### Estado actual del problema
[Descripción breve del estado actual y por qué necesita intervención]

---

## EJECUCIÓN (Método)

### Flujo según tipo de tarea:

**Feature (TDD)**: Test primero → Verificar fallo → Implementar → Verificar éxito
**Refactor**: Verificar tests pasan → Refactorizar → Verificar tests siguen pasando
**Migration**: Verificar origen → Mover → Verificar destino → Limpiar
**Bug fix**: Reproducir → Test regresión → Fix → Verificar

### Principios del proyecto
[Extraídos de docs normativos — ARCHITECTURE.md, principios-codigo, etc.]

---

## APOYO (Recursos)

### Rutas
- Proyecto: `[ruta raíz]`
- Workspace: `[ruta de trabajo]`

### Comandos
- Test: `[comando exacto]`
- Build: `[comando exacto]`
- Lint: `[comando exacto]`

### Referencia de tests existentes
[Archivo de test hermano que sirve de modelo para mocks, estructura, etc.]

### Skill a activar
```
## Skills
Activa el skill `/[nombre]` antes de cualquier cambio en [dominio].
```

Ver mapa completo de skills en SKILL.md → sección "Mapa de skills".

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar, aplica el Paso 2 (Eliminar):
1. Revisa lo que escribiste. Identifica:
   - Abstracciones que solo se usan 1 vez
   - Estados intermedios que pueden eliminarse
   - Validaciones redundantes con lo que ya existe
   - Código defensivo para escenarios imposibles
2. Elimina al menos 1 elemento concreto
3. Si algún archivo supera 200 LOC (150 .tsx), divídelo ahora
4. Verifica que sigue funcionando después de podar

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `[comando test]` → todos pasan
2. `[comando build]` → exitoso
3. `[comando lint]` → sin errores
4. Verificar que archivos protegidos no fueron modificados
5. `git diff --stat` → solo archivos dentro del scope

### Si algo falla después de 3 enfoques distintos
Reportar bloqueo con: qué intentaste, qué falló, qué propones.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo. Comienza.
```

---

## Principios de diseño de prompts

### Auftragstaktik: Define QUÉ, delega CÓMO
```
❌ "Crea un hook useLocationCascade con useState para department, province, district"
✅ "Extraer la lógica de cascada de ubicación a un custom hook — tú decides nombre y estructura"
```

### Dar contexto, no comandos
```
❌ "Ejecuta vi.mock('@shared/lib/metrics')"
✅ "Referencia de test existente: 03-ShippingStep.test.tsx — sigue el mismo patrón"
```

### Restricciones explícitas (qué NO hacer)
```
✅ "NO cambiar lógica de negocio. Solo mover y reorganizar."
✅ "NO agregar features nuevas ni mejoras."
✅ "NO tocar archivos fuera de features/lector-dnie/"
```

### Criterio de éxito medible
```
✅ ">97% de tests pasan + build exitoso"
✅ "Max ~250 LOC por archivo"
✅ "Todos los imports del componente padre siguen funcionando"
```
