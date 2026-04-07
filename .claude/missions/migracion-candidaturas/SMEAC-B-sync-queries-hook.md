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
Actualizar el script de sync y las queries para soportar las nuevas colecciones `candidaturas` y `procesos`. Crear hook `useCandidaturas` para la UI.

### Criterio de éxito
- `sync-firestore.ts` sincroniza 5 colecciones: entidades, fuentes, evaluaciones, **procesos**, **candidaturas**
- El recálculo de scores actualiza entidades (lifetime) Y candidaturas de procesos activos (snapshot)
- `queries.ts` tiene: `getCandidaturas()`, `getCandidaturaById()`, `getCandidaturasByEntidad()`, `getProcesoActivo()`
- `useCandidaturas.ts` existe con cache stale-while-revalidate
- Queries existentes (`getEntidades`, `getFuentesByEntidad`, etc.) siguen intactas

---

## SITUACIÓN (Contexto)

### Estado actual
- `sync-firestore.ts` sincroniza 3 colecciones (entidades, fuentes, evaluaciones) y recalcula scores solo en entidades
- `queries.ts` tiene queries solo para entidades, fuentes, evaluaciones
- `useEntidades.ts` es el único hook de cache

### Archivos objetivo
- `scripts/sync-firestore.ts` (EDITAR)
- `src/firebase/queries.ts` (EDITAR)
- `src/shared/hooks/useCandidaturas.ts` (CREAR)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/migracion-candidaturas/SMEAC-A-schema-migracion-candidaturas.md` — modelo objetivo
- `src/schemas/candidatura.schema.ts` — tipo Candidatura (ya creado por Agente A)
- `src/schemas/proceso.schema.ts` — tipo Proceso (ya creado por Agente A)
- `src/shared/hooks/useEntidades.ts` — patrón de hook a replicar

### Pre-requisito
**El Agente A debe haber completado antes de ejecutar este agente.** Los schemas `Candidatura` y `Proceso` deben existir.

---

## EJECUCIÓN (Método)

### Paso 1: Editar `scripts/sync-firestore.ts`

Agregar después del sync de evaluaciones (paso 3 actual):

**3b. Sync procesos:**
```typescript
console.log("🗳️ Procesos...");
const procesos = loadJson<Record<string, unknown>>("procesos.json");
const procResult = await syncCollection("procesos", procesos);
console.log(`   ${procResult.created} nuevos, ${procResult.updated} actualizados, ${procResult.skipped} sin cambios`);
```

**3c. Sync candidaturas:**
```typescript
console.log("🎯 Candidaturas...");
const candidaturas = loadJson<Record<string, unknown>>("candidaturas.json");
const candResult = await syncCollection("candidaturas", candidaturas, "id", ["scoreActual", "totalEvaluaciones"]);
console.log(`   ${candResult.created} nuevas, ${candResult.updated} actualizadas, ${candResult.skipped} sin cambios`);
```

**Modificar paso 4 (recálculo de scores):**

El recálculo actual solo actualiza `entidades/{id}`. Debe TAMBIÉN actualizar candidaturas, pero **solo de procesos activos**.

Lógica:
1. Cargar procesos activos: `db.collection("procesos").where("activa", "==", true).get()`
2. Cargar todas las candidaturas de esos procesos: `db.collection("candidaturas").where("procesoId", "in", activeProcesoIds).get()`
3. En el loop de recálculo, después de actualizar la entidad, buscar candidaturas que tengan ese `entidadId` y actualizar su `scoreActual` y `totalEvaluaciones`

```typescript
// Después de actualizar entidad:
const relatedCandidaturas = activeCandidaturas.filter(c => c.entidadId === id);
for (const cand of relatedCandidaturas) {
  await db.collection("candidaturas").doc(cand.id).set(
    { scoreActual: score, totalEvaluaciones: estadios.length },
    { merge: true }
  );
}
```

**PRINCIPIO CLAVE:** Cuando un proceso deja de ser `activa: true`, sus candidaturas conservan el último score calculado (snapshot congelado).

### Paso 2: Editar `src/firebase/queries.ts`

Agregar imports:
```typescript
import type { Candidatura } from "@/schemas/candidatura.schema";
import type { Proceso } from "@/schemas/proceso.schema";
```

Agregar queries (después de las de evaluaciones, antes de reconciliación):

```typescript
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

**NO modificar** queries existentes (getEntidades, getEntidadById, etc.).

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

### Rutas
- Proyecto: `c:\Users\lucas\proyectos\moralScore`

### Comandos
- Build: `pnpm build` (NO ejecutar — la UI aún usa tipos viejos, eso lo arregla Agente C)

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `sync-firestore.ts` tiene sync de 5 colecciones
2. El recálculo de scores filtra por procesos activos antes de propagar a candidaturas
3. `queries.ts` exporta `getCandidaturas`, `getCandidaturaById`, `getCandidaturasByEntidad`, `getProcesoActivo`
4. `useCandidaturas.ts` compila y sigue el patrón stale-while-revalidate
5. Queries existentes no fueron modificadas
6. Verificar que archivos protegidos no fueron modificados
7. `git diff --stat` → solo archivos dentro del scope

### Si algo falla después de 3 enfoques distintos
Reportar bloqueo con: qué intentaste, qué falló, qué propones.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo paso a paso. Comienza.
