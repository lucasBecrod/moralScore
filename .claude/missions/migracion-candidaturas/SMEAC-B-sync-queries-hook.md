# Agente B — sync-firestore + queries + hook candidaturas

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar archivos fuera de `scripts/sync-firestore.ts`, `src/firebase/queries.ts`, `src/shared/hooks/`
- NO editar schemas, data JSONs, features, firestore.rules, API routes
- Leer CADA archivo antes de editarlo
- Código en inglés, comentarios mínimos
- Las queries usan Firebase client SDK (NO admin SDK). El sync usa admin SDK.

### Archivos protegidos (NO modificar)
- `src/schemas/*`
- `data/*`
- `src/features/*`
- `firestore.rules`
- `src/app/*`

### Límite de alcance
Script de sync, queries de Firestore (client), y hook de cache. Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
Actualizar el script de sync y las queries para soportar las nuevas colecciones `candidaturas` y `procesos`. Implementar time-bounding para calcular snapshots de score por candidatura. **Corregir el sync para que use `set()` sin merge — los campos que ya no existen en el JSON deben desaparecer de Firestore (sin huérfanos).**

### Criterio de éxito
- `sync-firestore.ts` sincroniza 5 colecciones: entidades, fuentes, evaluaciones, procesos, candidaturas
- **El sync usa `set(data)` SIN merge** — reemplaza el doc completo, preservando `createdAt` manualmente
- El recálculo actualiza `scoreHistorico` en entidades Y `scoreCandidatura` en candidaturas activas (time-bounded)
- `queries.ts` tiene: `getCandidaturas()`, `getCandidaturaById()`, `getCandidaturasByEntidad()`, `getProcesoActivo()`
- `queries.ts` usa los nombres nuevos: `scoreHistorico`, `totalEvaluacionesHistoricas`
- `useCandidaturas.ts` existe con cache stale-while-revalidate

---

## SITUACIÓN (Contexto)

### Principios de diseño

1. **Time-bounding para snapshots.** `scoreCandidatura = mediana(evaluaciones WHERE entidadId == X AND fechaEvento <= proceso.fechaCorte)`. Congela score sin mutar datos.
2. **scoreHistorico en entidad.** Mediana de TODAS las evaluaciones, sin filtro de fecha. Lifetime score.
3. **Cuando un proceso deja de ser activo**, sus candidaturas conservan el último `scoreCandidatura` — no se recalcula.
4. **Fuentes y evaluaciones apuntan a entidadId.** NUNCA a candidaturaId.
5. **Sin huérfanos.** Si un campo se elimina del JSON, el sync debe eliminarlo de Firestore. `set()` sin merge logra esto al reemplazar el doc completo.

### Bug actual del sync
La línea `await ref.set(data, { merge: true })` (sync-firestore.ts:99) hace que campos eliminados del JSON persistan como huérfanos en Firestore. Ejemplo: si `candidatos.json` ya no tiene `partido`, el doc en Firestore seguirá teniendo `partido` después del sync.

**Fix**: Cambiar a `set(data)` sin merge. Pero `createdAt` se genera solo en docs nuevos y no existe en los JSONs — hay que leerlo del doc existente y preservarlo.

### Estado actual
- `sync-firestore.ts` sincroniza 3 colecciones y recalcula scores con `scoreActual`/`totalEvaluaciones`
- `queries.ts` tiene queries para entidades, fuentes, evaluaciones con nombres viejos
- `useEntidades.ts` es el único hook de cache

### Archivos objetivo
- `scripts/sync-firestore.ts` (EDITAR)
- `src/firebase/queries.ts` (EDITAR)
- `src/shared/hooks/useCandidaturas.ts` (CREAR)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/migracion-candidaturas/SMEAC-A-schema-migracion-candidaturas.md` — modelo objetivo
- `src/schemas/candidatura.schema.ts` — tipo Candidatura (creado por Agente A)
- `src/schemas/proceso.schema.ts` — tipo Proceso (creado por Agente A)
- `src/schemas/entidad.schema.ts` — tipo Entidad actualizado (usa `scoreHistorico`)
- `src/schemas/evaluacion.schema.ts` — tiene `fechaEvento`
- `src/shared/hooks/useEntidades.ts` — patrón de hook a replicar

### Pre-requisito
**El Agente A debe haber completado antes de ejecutar este agente.**

---

## EJECUCIÓN (Método)

### Paso 1: Fix `syncCollection` — set sin merge, preservar createdAt

Cambiar la función `syncCollection` en `scripts/sync-firestore.ts`:

```typescript
async function syncCollection(
  collectionName: string,
  items: Record<string, unknown>[],
  idField: string = "id",
  ignoreFieldsOnCompare: string[] = [],
) {
  let created = 0, updated = 0, skipped = 0;

  for (const item of items) {
    const id = item[idField] as string;
    if (!id) continue;

    const ref = db.collection(collectionName).doc(id);
    const snap = await ref.get();

    const data = { ...item };
    delete data[idField];

    if (snap.exists) {
      const existing = snap.data() || {};

      // Preservar createdAt del doc existente
      const createdAt = existing.createdAt;

      const compareKeys = Object.keys(data).filter(k => !ignoreFieldsOnCompare.includes(k));
      const relevantExisting: Record<string, unknown> = {};
      const relevantNew: Record<string, unknown> = {};
      for (const key of compareKeys) {
        relevantExisting[key] = existing[key];
        relevantNew[key] = (data as Record<string, unknown>)[key];
      }

      if (hash(relevantExisting) === hash(relevantNew)) {
        skipped++;
        continue;
      }

      // set() SIN merge — reemplaza el doc completo, eliminando campos huérfanos
      await ref.set({ ...data, ...(createdAt ? { createdAt } : {}) });
      updated++;
    } else {
      await ref.set({ ...data, createdAt: new Date().toISOString() });
      created++;
    }
  }

  return { created, updated, skipped };
}
```

**Cambio clave**: `ref.set(data, { merge: true })` → `ref.set({ ...data, ...(createdAt ? { createdAt } : {}) })` sin merge. Esto reemplaza el doc completo, pero preserva `createdAt` del original.

### Paso 2: Agregar sync de procesos y candidaturas

Después del sync de evaluaciones (paso 3 actual), agregar:

```typescript
console.log("🗳️ Procesos...");
const procesos = loadJson<Record<string, unknown>>("procesos.json");
const procResult = await syncCollection("procesos", procesos);
console.log(`   ${procResult.created} nuevos, ${procResult.updated} actualizados, ${procResult.skipped} sin cambios`);

console.log("🎯 Candidaturas...");
const candidaturas = loadJson<Record<string, unknown>>("candidaturas.json");
const candResult = await syncCollection("candidaturas", candidaturas, "id", ["scoreCandidatura", "evaluacionesCandidatura"]);
console.log(`   ${candResult.created} nuevas, ${candResult.updated} actualizadas, ${candResult.skipped} sin cambios`);
```

### Paso 3: Actualizar recálculo de scores

Renombrar campos en el recálculo de entidades:
- `scoreActual` → `scoreHistorico`
- `totalEvaluaciones` → `totalEvaluacionesHistoricas`

Agregar recálculo de candidaturas con time-bounding DESPUÉS del recálculo de entidades:

```typescript
// Recálculo de candidaturas con time-bounding
console.log("\n🎯 Recalculando scores de candidaturas...");
const activeProcesos = await db.collection("procesos").where("activa", "==", true).get();
const activeProcesoMap = new Map<string, string>(); // procesoId -> fechaCorte
activeProcesos.docs.forEach(d => {
  activeProcesoMap.set(d.id, d.data().fechaCorte);
});

for (const procesoId of activeProcesoMap.keys()) {
  const fechaCorte = activeProcesoMap.get(procesoId)!;
  const candSnap = await db.collection("candidaturas")
    .where("procesoId", "==", procesoId).get();

  for (const candDoc of candSnap.docs) {
    const cand = candDoc.data();
    // Filtrar evaluaciones por fechaEvento <= fechaCorte
    const evals = allEvaluaciones.filter(e =>
      e.entidadId === cand.entidadId &&
      e.fechaEvento && e.fechaEvento <= fechaCorte
    );
    const estadios = evals.map(e => e.estadio).sort((a, b) => a - b);
    const score = estadios.length > 0 ? median(estadios) : null;

    if (cand.scoreCandidatura !== score || cand.evaluacionesCandidatura !== estadios.length) {
      await db.collection("candidaturas").doc(candDoc.id).update({
        scoreCandidatura: score,
        evaluacionesCandidatura: estadios.length,
      });
      console.log(`   ${candDoc.id} → ${score} (${estadios.length} evals, corte: ${fechaCorte})`);
    }
  }
}
```

**NOTA**: `allEvaluaciones` debe estar disponible — leerlas del snapshot de Firestore (ya se hace para el recálculo de entidades). Asegurar que los datos incluyen `fechaEvento`.

### Paso 4: Editar `src/firebase/queries.ts`

#### 4a. Actualizar nombres en funciones existentes
- `createEntidad()`: `scoreActual: null, totalEvaluaciones: 0` → `scoreHistorico: null, totalEvaluacionesHistoricas: 0`
- `reconcileEntidad()`: cambiar campos a `scoreHistorico` y `totalEvaluacionesHistoricas`
- `reconcileAll()`: igual

#### 4b. Agregar nuevas queries

```typescript
import type { Candidatura } from "@/schemas/candidatura.schema";
import type { Proceso } from "@/schemas/proceso.schema";

export async function getCandidaturas(procesoId?: string): Promise<Candidatura[]> {
  if (!isFirebaseConfigured()) return [];
  const ref = collection(db, "candidaturas");
  const q = procesoId
    ? query(ref, where("procesoId", "==", procesoId))
    : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Candidatura);
}

export async function getCandidaturaById(id: string): Promise<Candidatura | null> {
  if (!isFirebaseConfigured()) return null;
  const ref = doc(db, "candidaturas", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Candidatura;
}

export async function getCandidaturasByEntidad(entidadId: string): Promise<Candidatura[]> {
  if (!isFirebaseConfigured()) return [];
  const q = query(collection(db, "candidaturas"), where("entidadId", "==", entidadId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Candidatura);
}

export async function getProcesoActivo(): Promise<Proceso | null> {
  if (!isFirebaseConfigured()) return null;
  const q = query(collection(db, "procesos"), where("activa", "==", true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Proceso;
}
```

### Paso 5: Crear `src/shared/hooks/useCandidaturas.ts`

Seguir exactamente el patrón de `useEntidades.ts` (stale-while-revalidate):

```typescript
"use client";

import { useEffect, useState, useCallback } from "react";
import { getCandidaturas } from "@/firebase/queries";
import type { Candidatura } from "@/schemas/candidatura.schema";

let cachedCandidaturas: Candidatura[] | null = null;
let lastFetchTime = 0;
const STALE_MS = 60_000;

export function useCandidaturas(procesoId?: string) {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>(cachedCandidaturas || []);
  const [loading, setLoading] = useState(cachedCandidaturas === null);

  const refresh = useCallback(async () => {
    try {
      const data = await getCandidaturas(procesoId);
      cachedCandidaturas = data;
      lastFetchTime = Date.now();
      setCandidaturas(data);
    } finally {
      setLoading(false);
    }
  }, [procesoId]);

  useEffect(() => {
    if (cachedCandidaturas !== null) {
      setCandidaturas(cachedCandidaturas);
      setLoading(false);
      if (Date.now() - lastFetchTime > STALE_MS) refresh();
    } else {
      refresh();
    }
  }, [refresh]);

  return { candidaturas, loading, refresh };
}
```

---

## APOYO (Recursos)

### Comandos
- Build: `pnpm build` — NO ejecutar, la UI aún usa tipos viejos (Agente C lo arregla)

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `sync-firestore.ts` sincroniza 5 colecciones
2. **`syncCollection` usa `set()` SIN merge** — campos eliminados del JSON se borran de Firestore
3. `createdAt` se preserva en docs existentes
4. El recálculo de entidades usa `scoreHistorico` y `totalEvaluacionesHistoricas`
5. El recálculo de candidaturas filtra por `fechaEvento <= proceso.fechaCorte`
6. Solo candidaturas de procesos activos se recalculan
7. `queries.ts` exporta las 4 nuevas queries y usa nombres nuevos
8. `useCandidaturas.ts` sigue el patrón stale-while-revalidate
9. Archivos protegidos no fueron modificados
10. `git diff --stat` → solo archivos dentro del scope

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar, aplica el Paso 2 (Eliminar):
1. Revisa lo que escribiste. Identifica:
   - Queries que duplican lógica existente
   - Código defensivo para escenarios imposibles en el sync
   - Abstracciones de 1 uso
2. Elimina al menos 1 elemento concreto
3. Si algún archivo supera 200 LOC, dividir o simplificar
4. Verifica que sigue funcionando después de podar

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo paso a paso. Comienza.
