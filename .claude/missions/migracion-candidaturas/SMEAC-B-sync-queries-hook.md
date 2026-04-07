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
Actualizar el script de sync y las queries para soportar las nuevas colecciones `candidaturas` y `procesos`. Implementar time-bounding para calcular snapshots de score por candidatura. Crear hook `useCandidaturas` para la UI.

### Criterio de éxito
- `sync-firestore.ts` sincroniza 5 colecciones: entidades, fuentes, evaluaciones, **procesos**, **candidaturas**
- El recálculo de scores actualiza entidades (`scoreHistorico` = mediana lifetime) Y candidaturas de procesos activos (`scoreCandidatura` = mediana filtrada por `fechaEvento <= proceso.fechaCorte`)
- `queries.ts` tiene: `getCandidaturas()`, `getCandidaturaById()`, `getCandidaturasByEntidad()`, `getProcesoActivo()`
- `queries.ts` usa los nombres de campo nuevos: `scoreHistorico`, `totalEvaluacionesHistoricas`
- `useCandidaturas.ts` existe con cache stale-while-revalidate
- Queries existentes (`getEntidades`, `getFuentesByEntidad`, etc.) se actualizan para los nombres de campo nuevos

---

## SITUACIÓN (Contexto)

### Principios de diseño (consenso equipo + arquitecto)

1. **Time-bounding para snapshots.** El `scoreCandidatura` NO es un mirror del lifetime score. Se calcula: `mediana(evaluaciones WHERE entidadId == X AND fechaEvento <= proceso.fechaCorte)`. Esto congela matemáticamente el score sin mutar datos.
2. **scoreHistorico en entidad.** Es la mediana de TODAS las evaluaciones de esa entidad, sin filtro de fecha. Representa el lifetime score.
3. **Cuando un proceso deja de ser activo**, sus candidaturas conservan el último `scoreCandidatura` calculado — no se recalcula más.
4. **Fuentes y evaluaciones siguen apuntando a entidadId.** NUNCA a candidaturaId.

### Estado actual
- `sync-firestore.ts` sincroniza 3 colecciones (entidades, fuentes, evaluaciones) y recalcula scores solo en entidades usando `scoreActual` y `totalEvaluaciones`
- `queries.ts` tiene queries solo para entidades, fuentes, evaluaciones; usa `scoreActual` y `totalEvaluaciones`
- `useEntidades.ts` es el único hook de cache

### Archivos objetivo
- `scripts/sync-firestore.ts` (EDITAR)
- `src/firebase/queries.ts` (EDITAR)
- `src/shared/hooks/useCandidaturas.ts` (CREAR)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/migracion-candidaturas/SMEAC-A-schema-migracion-candidaturas.md` — modelo objetivo
- `src/schemas/candidatura.schema.ts` — tipo Candidatura (ya creado por Agente A)
- `src/schemas/proceso.schema.ts` — tipo Proceso (ya creado por Agente A)
- `src/schemas/entidad.schema.ts` — tipo Entidad actualizado (usa `scoreHistorico`, `totalEvaluacionesHistoricas`)
- `src/schemas/evaluacion.schema.ts` — tiene `fechaEvento`
- `src/shared/hooks/useEntidades.ts` — patrón de hook a replicar

### Pre-requisito
**El Agente A debe haber completado antes de ejecutar este agente.** Los schemas actualizados deben existir.

---

## EJECUCIÓN (Método)

### Paso 1: Editar `scripts/sync-firestore.ts`

#### 1a. Agregar sync de procesos y candidaturas

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

#### 1b. Actualizar nombres de campo en recálculo de entidades

Donde el script actual escribe `scoreActual` y `totalEvaluaciones` a la entidad, cambiar a:
- `scoreHistorico` (mediana de TODAS las evaluaciones de esa entidad)
- `totalEvaluacionesHistoricas` (count total)

#### 1c. Agregar recálculo de candidaturas con time-bounding

**DESPUÉS** de recalcular el scoreHistorico de la entidad, agregar recálculo de candidaturas:

```typescript
// Cargar procesos activos
const activeProcesos = await db.collection("procesos").where("activa", "==", true).get();
const activeProcesoMap = new Map<string, string>(); // procesoId -> fechaCorte
activeProcesos.docs.forEach(d => {
  const data = d.data();
  activeProcesoMap.set(d.id, data.fechaCorte);
});

// Cargar candidaturas de procesos activos
const activeProcesoIds = [...activeProcesoMap.keys()];
// (iterar en chunks si > 30 por límite de Firestore 'in')
const activeCandidaturas = await db.collection("candidaturas")
  .where("procesoId", "in", activeProcesoIds).get();

// Para cada candidatura activa, calcular scoreCandidatura con time-bounding
for (const candDoc of activeCandidaturas.docs) {
  const cand = candDoc.data();
  const fechaCorte = activeProcesoMap.get(cand.procesoId);
  
  // Obtener evaluaciones de esta entidad con fechaEvento <= fechaCorte
  const evals = allEvaluaciones.filter(e => 
    e.entidadId === cand.entidadId && 
    e.fechaEvento <= fechaCorte  // string comparison works for ISO dates
  );
  
  const estadios = evals.map(e => e.estadio).sort((a, b) => a - b);
  const score = estadios.length > 0 ? median(estadios) : null;
  
  await db.collection("candidaturas").doc(candDoc.id).update({
    scoreCandidatura: score,
    evaluacionesCandidatura: estadios.length,
  });
}
```

**PRINCIPIO CLAVE:** El snapshot de la candidatura incluye TODAS las evaluaciones de esa persona cuyo `fechaEvento <= proceso.fechaCorte`. No es solo "durante la campaña" — es todo lo que se sabe de esa persona hasta el momento del proceso.

### Paso 2: Editar `src/firebase/queries.ts`

#### 2a. Actualizar nombres de campo en funciones existentes

- `createEntidad()`: cambiar `scoreActual: null, totalEvaluaciones: 0` → `scoreHistorico: null, totalEvaluacionesHistoricas: 0`
- `reconcileEntidad()`: cambiar campos que escribe a `scoreHistorico` y `totalEvaluacionesHistoricas`
- `reconcileAll()`: igual

#### 2b. Agregar nuevas queries

```typescript
import type { Candidatura } from "@/schemas/candidatura.schema";
import type { Proceso } from "@/schemas/proceso.schema";

// --- Candidaturas ---

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
  const q = query(
    collection(db, "candidaturas"),
    where("entidadId", "==", entidadId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Candidatura);
}

// --- Procesos ---

export async function getProcesoActivo(): Promise<Proceso | null> {
  if (!isFirebaseConfigured()) return null;
  const q = query(
    collection(db, "procesos"),
    where("activa", "==", true)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Proceso;
}
```

### Paso 3: Crear `src/shared/hooks/useCandidaturas.ts`

Seguir exactamente el patrón de `useEntidades.ts`:

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

      if (Date.now() - lastFetchTime > STALE_MS) {
        refresh();
      }
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
- Build: `pnpm build` (NO ejecutar — la UI aún usa tipos viejos, eso lo arregla Agente C)

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `sync-firestore.ts` sincroniza 5 colecciones
2. El recálculo de entidades usa `scoreHistorico` y `totalEvaluacionesHistoricas`
3. El recálculo de candidaturas filtra evaluaciones por `fechaEvento <= proceso.fechaCorte` (time-bounding)
4. Solo candidaturas de procesos activos se recalculan
5. `queries.ts` exporta `getCandidaturas`, `getCandidaturaById`, `getCandidaturasByEntidad`, `getProcesoActivo`
6. `queries.ts` usa `scoreHistorico` y `totalEvaluacionesHistoricas` (no los nombres viejos)
7. `useCandidaturas.ts` compila y sigue el patrón stale-while-revalidate
8. Queries existentes fueron actualizadas con nombres de campo nuevos
9. Verificar que archivos protegidos no fueron modificados
10. `git diff --stat` → solo archivos dentro del scope

### Si algo falla después de 3 enfoques distintos
Reportar bloqueo con: qué intentaste, qué falló, qué propones.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo paso a paso. Comienza.
