---
name: orquestar
description: Planificar trabajo complejo y coordinar agentes especializados. Flujo de 5 etapas — ORIENTACIÓN (leer el terreno) → AUDITORÍA (hipótesis → agente explorador) → INTERPRETACIÓN (análisis estratégico del reporte) → EJECUCIÓN (N órdenes SMEAC paralelas). Usar cuando una tarea tiene impacto sistémico o puede dividirse en unidades independientes para agentes.
---

# /orquestar — CTO Planificación y Delegación Paralela

> Flujo de 5 etapas (cada una es opcional según claridad del terreno):
> 1. **Orientación**: leer el terreno antes de hipótesis
> 2. **Auditoría**: hipótesis → agente explorador → reporte
> 3. **Interpretación**: análisis estratégico del reporte (capas, riesgo, orden)
> 4. **Ejecución**: N órdenes SMEAC → agentes en paralelo
> 5. **Post-impl**: tests + checkpoint seguridad + commits + push

## Principio rector: Espejo mental del CTO, no ejecutor

Claude como orquestador es el **reflejo mental global** de lo que el usuario quiere lograr: mantiene el objetivo estratégico, detecta dependencias, prioriza por riesgo, y genera las órdenes que los agentes ejecutan.

**SÍ hace**: Lee archivos índice (máx 3-5) · Redacta prompts de misión · Interpreta reportes · Define orden estratégico · Mantiene visión global entre misiones fragmentadas

**NO hace**: Ejecuta comandos · Hace commits · Hace push · Edita docs masivamente · Guarda detalles de implementación en contexto

### Gestión de contexto (memoria limpia)
- **Retiene**: objetivo, mapa de gaps, estado de agentes (completo/pendiente/bloqueado)
- **Delega**: detalles de implementación viven en archivos y agentes
- Cuando un agente regresa: extraer solo **estado** y **gap accionable**, no el código
- Si el contexto se satura: resumir en tabla y continuar

---

## Etapa 0 — Orientación

Siempre que la tarea toque múltiples módulos/colecciones. Leer 2-3 archivos índice antes de hipótesis:
1. Índice del subsistema (`31.51-firestore-indice.md`, `context.md`, `ARCHITECTURE.md`)
2. El archivo más mencionado en el problema
3. Glob rápido de la carpeta afectada

**Límite**: 5 min de lectura. Si se necesita más → Auditoría con agente.
**Output**: diagnóstico en 3-5 líneas + preguntas concretas a validar.

---

## Etapa 1 — Auditoría

Usar cuando hay gaps de conocimiento o se necesita validar el estado antes de construir.

**Flujo**: leer mínimo → hipótesis explícita → prompt para agente → usuario lanza → reporte → Etapa 2

| Tipo de prompt | Cuándo | El agente hace |
|---------------|--------|---------------|
| **Auditoría técnica P1-PN** | Validar estado de código vs hipótesis | Lee, analiza, reporta por pregunta |
| **Exploración libre** | Gaps de conocimiento, inventarios | Lee, analiza, reporta |
| **Ejecución puntual** | Tarea clara, dominio específico | Lee + ejecuta + commit |

→ Templates completos en [`references/templates.md`](./references/templates.md)

---

## Etapa 2 — Interpretación

**Esta etapa la hace el orquestador, no el agente.**

Cuando regresa el reporte del agente auditor:

1. **Clasificar gaps por severidad**
   - 🔴 Crítico — corrupción de datos o fallo silencioso
   - 🟡 Medio — funcionalidad incompleta, workaround posible
   - 🟢 Menor — mejora, deuda técnica

2. **Detectar dependencias estratégicas** — agentes técnicamente paralelos pueden ser secuenciales por riesgo
   > Regla: si el output de A cambia el riesgo de ejecutar B → son estratégicamente dependientes aunque no compartan archivos

3. **Output al usuario**: mapa de gaps por severidad + orden recomendado + cuáles son paralelos vs faseados

---

## Etapa 3 — Ejecución (SMEAC Paralelo)

### Doctrina: Auftragstaktik
- **Comandante** define QUÉ y POR QUÉ
- **Agente** decide CÓMO dentro de las restricciones
- Cada orden es autónoma: el agente tiene todo lo necesario

### Cuándo usar / no usar

| Usar | No usar |
|------|---------|
| 3+ módulos independientes | Tareas secuencialmente dependientes |
| Refactorizaciones paralelizables | Cambios en un solo archivo |
| Delegación a sesiones separadas | Solo exploración |

### Nomenclatura Screaming

Los nombres de archivos deben gritar su contenido. Test: un humano o IA que lee un `ls` entiende en <2 segundos qué contiene, sin abrirlo.

**Fórmula**: `[tipo]-[ID]-[módulo]-[acción].md`

| ❌ Genérico | ✅ Screaming |
|---|---|
| `SMEAC-A-backend.md` | `SMEAC-A-registrador-cobros-mixtos.md` |
| `SMEAC-B-frontend.md` | `SMEAC-B-modal-pago-seleccion-metodo.md` |
| `00-auditoria.md` | `00-auditoria-schema-cobros-backend.md` |

> Ref: Screaming Architecture (`cortex/30-producto/31-arquitectura/31.10-ai-first/31.17-fundamentos-arquitectura-agentica-vsa-solid.md`), Nombres Descriptivos (`cortex/30-producto/34-codigo/34.99-principios-codigo-finangher.md`)

### Protocolo de descomposición

1. Leer archivos/módulos involucrados + arquitectura relevante
2. Para cada unidad: objetivo · tipo · archivos · contexto · criterio de éxito · restricciones
3. **Validar independencia**: ningún par modifica el mismo archivo → si hay solapamiento, fusionar o secuenciar
4. Generar órdenes SMEAC con **nombres screaming** → guardar en `.claude/missions/[nombre-tarea]/`

### Mapa de skills — activar según dominio

| Dominio de la misión | Skill a activar |
|----------------------|-----------------|
| Componentes React, páginas, Tailwind, hooks | `/frontend-design` |
| API de Anthropic, scoring, system prompt | skill propio de MoralScore (TBD) |
| Tests unitarios/integración | `/webapp-testing` |
| Commits, deploys, CI/CD | convenciones git del proyecto |

**En el prompt del agente**: `Activa el skill /[nombre] antes de cualquier cambio en [dominio].`
NO pedir que lea el archivo del skill — pedirle que lo **active** con `/`.

→ Template SMEAC completo en [`references/templates.md`](./references/templates.md)

---

## Etapa 4 — Post-implementación

Secuencia obligatoria: `Implementación → Tests → Commits → [Checkpoint seguridad] → Push → PR`

El orquestador **nunca ejecuta ninguno** — genera los prompts.

- **Tests**: prompt al mismo agente que implementó (contexto fresco)
- **Commits**: un agente único al final + `/cicd-github-expert`, sin instrucciones manuales de git
- **Checkpoint seguridad**: lo ejecuta el orquestador antes de autorizar el push

→ Detalle completo en [`references/post-impl.md`](./references/post-impl.md)

---

## Entrega al usuario

Al terminar la orquestación, mostrar:
1. **Tabla resumen**: ID · archivo · tipo · independencia verificada
2. **Orden recomendado** con justificación de riesgo
3. **Archivos `.md`** con nombres screaming en `.claude/missions/[nombre-tarea]/` (uno por agente)
4. **Instrucción**: el usuario abre N sesiones de Claude Code y pega cada prompt

> **IMPORTANTE**: Este skill solo produce archivos y prompts. NO ejecuta agentes, NO lanza subprocesos, NO usa la herramienta Agent.

---

## Ejemplo de uso

```
Usuario: /orquestar migrar IDs de entidades a predecibles
Claude: [Etapa 0: lee 31.51 + estructura subsistema-entidades]
Claude: [Etapa 1: genera prompt de auditoría P1-P4]
Usuario: [lanza agente auditor]
Claude: [Etapa 2: clasifica gaps, detecta dependencias estratégicas]
Claude: [Etapa 3: genera SMEAC-A-guardian-auto-puntero.md, SMEAC-B-schema-id-predecible.md, SMEAC-C-migration-docs-puntero.md]
Usuario: [lanza 3 agentes en paralelo]
Claude: [Etapa 4: genera prompt tests + checkpoint seguridad + prompt commits]
```
