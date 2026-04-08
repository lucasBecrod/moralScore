# Agente B — Motor Matemático: Colapso de Techo en sync-firestore.ts

> **Modelo**: sonnet
>
> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura interna, nombres de helpers, orden de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar schemas (`src/schemas/`) — ya fueron actualizados por otro agente
- NO tocar el prompt del evaluador (`prompt-agente.md`)
- NO tocar componentes de UI (`src/features/`)
- NO tocar `data/*.json`
- NO usar media aritmética — solo mediana
- NO crear colecciones nuevas en Firestore
- NO agregar dependencias/librerías

### Archivos protegidos (NO modificar)
- `src/schemas/*.ts`
- `src/features/**/*`
- `.claude/skills/**/*`
- `data/*.json`

### Límite de alcance
Solo `scripts/sync-firestore.ts` y opcionalmente `src/shared/config/` (solo imports, no modificar los valores).

---

## MISIÓN (Objetivo)

### Tarea asignada
**B**: Reemplazar el cálculo plano de scores (mediana cruda) por el algoritmo V2 "Colapso de Techo": mediana simple de estadios + techo material infranqueable basado en transgresiones de Gert.

### Criterio de éxito
1. `pnpm build` exitoso
2. La función `scoreV2()` existe como función pura (testeable sin Firestore)
3. `scoreHistorico` se calcula con el nuevo algoritmo
4. `scoreCandidatura` (time-bounded) se calcula con el nuevo algoritmo
5. El script sigue siendo idempotente (safe to re-run)
6. Archivo no supera 250 LOC

---

## SITUACIÓN (Contexto)

### Archivos objetivo
- `scripts/sync-firestore.ts` — reescribir sección de cálculo de scores (líneas ~157-210)

### Archivos de contexto (leer primero, NO editar)
- `src/shared/config/kohlberg-stages.ts` — contiene `PESO_FRICCION`, `TECHO_GERT`, `UMBRAL_EVIDENCIA_MATERIAL` (ya creados por Agente A)
- `src/schemas/evaluacion.schema.ts` — contiene `ReglaGert` enum y campos `reglaGert`, `gertCumplida`
- `src/schemas/fuente.schema.ts` — contiene `FuenteTipo` con tipos materiales

### Estado actual del problema

El script `sync-firestore.ts` hoy calcula scores así:
1. Lee todas las evaluaciones de Firestore
2. Agrupa estadios por `entidadId`
3. Calcula `median(estadios)` — mediana plana, todas las evaluaciones pesan igual
4. Para candidaturas: filtra por `fechaEvento <= fechaCorte`, misma mediana plana

**Problema**: Un tuit pesa lo mismo que un voto en el Congreso. No existe penalización por hipocresía.

### Algoritmo V2: Colapso de Techo

El nuevo cálculo tiene 2 componentes:

**1. Mediana retórica** = mediana simple de todos los `estadio`. Cada evaluación cuenta 1 vez. Sin repeticiones, sin ponderación artificial.

**2. Techo material** = el mínimo entre los techos de Gert activados. Una transgresión solo activa el colapso si:
- `eval.reglaGert !== "ninguna"` AND `eval.gertCumplida === false`
- La fuente asociada tiene `PESO_FRICCION[fuente.tipo] >= UMBRAL_EVIDENCIA_MATERIAL` (0.7)

**3. Score final** = `Math.min(medianaRetórica, techoMaterial)`

Tabla de techos (ya definida en `TECHO_GERT`):
| Regla | Techo |
|-------|-------|
| no-privar-libertad | 1.5 |
| no-engañar | 2.0 |
| no-hacer-trampa | 2.0 |
| no-causar-dolor | 2.0 |
| cumplir-deber | 3.0 |
| ninguna | 6.0 |

---

## EJECUCIÓN (Método)

Flujo: **Refactor** — Verificar build → Implementar → Verificar build.

### Paso 1: Importar configs de scoring
Al inicio de `sync-firestore.ts`, agregar:
```typescript
import { PESO_FRICCION, TECHO_GERT, UMBRAL_EVIDENCIA_MATERIAL } from "../src/shared/config/kohlberg-stages";
```

### Paso 2: Crear función pura `scoreV2`
Agregar ANTES de `main()`:
```typescript
function scoreV2(
  evaluaciones: Array<{ estadio: number; reglaGert?: string; gertCumplida?: boolean; fuenteId: string }>,
  fuentes: Array<{ id: string; tipo: string }>
): number | null {
  if (evaluaciones.length === 0) return null;

  const fuenteMap = Object.fromEntries(fuentes.map(f => [f.id, f]));

  // 1. Mediana retórica: mediana simple, cada eval cuenta 1 vez
  const estadios = evaluaciones.map(e => e.estadio);
  const medianaRetorica = median(estadios);

  // 2. Techo material: transgresiones Gert en evidencia dura
  let techoMaterial = 6.0;
  for (const eval_ of evaluaciones) {
    if (!eval_.reglaGert || eval_.reglaGert === "ninguna" || eval_.gertCumplida !== false) continue;

    const tipo = fuenteMap[eval_.fuenteId]?.tipo;
    const peso = PESO_FRICCION[tipo ?? ""] ?? 0.3;

    if (peso >= UMBRAL_EVIDENCIA_MATERIAL) {
      const techo = TECHO_GERT[eval_.reglaGert] ?? 6.0;
      techoMaterial = Math.min(techoMaterial, techo);
    }
  }

  // 3. Score final: el mínimo entre retórica y realidad
  return Number(Math.min(medianaRetorica, techoMaterial).toFixed(2));
}
```

**IMPORTANTE sobre backwards compatibility**: Los datos existentes (272 evaluaciones) NO tienen `reglaGert` ni `gertCumplida`. La función debe tolerar campos undefined/ausentes — en ese caso, el techo no se activa (comportamiento V1 = mediana pura). Esto es correcto: sin evidencia material, no hay colapso.

### Paso 3: Reemplazar cálculo de scoreHistorico
En la sección "Recalcular scores" (~línea 158), reemplazar:
```typescript
// ANTES:
const score = median(estadios);

// DESPUÉS: usar scoreV2 con evaluaciones completas + fuentes
```

Necesitarás cargar las fuentes también. El script ya tiene `fuentes` cargado desde `data/fuentes.json` más arriba. Reutiliza esa variable.

**Cuidado**: la sección actual lee evaluaciones desde Firestore (`db.collection("evaluaciones").get()`), no desde el JSON local. Mantén esa fuente — lee las fuentes también desde Firestore para consistencia:
```typescript
const fuenteSnap = await db.collection("fuentes").get();
const allFuentes = fuenteSnap.docs.map(d => ({ id: d.id, ...d.data() }));
```

### Paso 4: Reemplazar cálculo de scoreCandidatura
En la sección de candidaturas (~línea 186), aplicar la misma lógica `scoreV2` pero con evaluaciones filtradas por `fechaEvento <= fechaCorte`.

### Paso 5: Log del colapso
Cuando un techo material se activa (techoMaterial < medianaRetorica), loguear:
```
   keiko-fujimori → 2.0 (mediana: 3.5, techo Gert: 2.0 — no-hacer-trampa) (8 evals)
```
Esto es crítico para auditoría. Si no hay colapso, log normal:
```
   lopez-aliaga → 1.5 (8 evals)
```

---

## APOYO (Recursos)

### Rutas
- Proyecto: `c:\Users\lucas\proyectos\moralScore`

### Comandos
- Build: `pnpm build`

### Función `median()` existente
Ya existe en el script (línea ~53). Reutilizarla, no duplicar.

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar:
1. ¿Quedó algún `console.log` de debug que no aporta valor en producción?
2. ¿Se duplicó alguna lectura de Firestore que podría reutilizar una variable existente?
3. ¿Hay algún `if` defensivo para un escenario imposible?
4. Elimina al menos 1 elemento concreto
5. Verifica que `pnpm build` sigue pasando

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `pnpm build` → exitoso
2. `grep -n "scoreV2" scripts/sync-firestore.ts` → función existe y se usa
3. `grep -n "TECHO_GERT\|PESO_FRICCION\|UMBRAL_EVIDENCIA" scripts/sync-firestore.ts` → imports presentes
4. `grep -n "Math.min" scripts/sync-firestore.ts` → colapso de techo implementado
5. Verificar que archivos protegidos NO fueron modificados
6. `git diff --stat` → solo `scripts/sync-firestore.ts`
7. `wc -l scripts/sync-firestore.ts` → no supera 250 LOC

### Si algo falla después de 3 enfoques distintos
Reportar bloqueo con: qué intentaste, qué falló, qué propones.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto (kohlberg-stages.ts, evaluacion.schema.ts, fuente.schema.ts), luego lee sync-firestore.ts completo, luego implementa. Comienza.
