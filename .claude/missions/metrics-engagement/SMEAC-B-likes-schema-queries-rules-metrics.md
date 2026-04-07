# Agente B — Likes Data Layer + Spine Metrics + Firestore Rules

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar archivos fuera de `src/schemas/`, `src/firebase/`, `src/shared/lib/`, `firestore.rules`
- NO editar `src/features/`, `src/app/`, `scripts/`
- Leer CADA archivo antes de editarlo
- Código en inglés
- Usar `zod/v4` (import de "zod/v4", NO "zod")
- No agregar dependencias npm

### Archivos protegidos (NO modificar)
- `src/schemas/fuente.schema.ts`
- `src/schemas/evaluacion.schema.ts`
- `src/schemas/analisis-response.schema.ts`
- `src/features/*` (todos)
- `src/app/*` (todos)
- `scripts/*`

### Límite de alcance
Schemas Zod, queries Firestore, helper de métricas, y reglas de seguridad. Nada de UI.

---

## SITUACIÓN

MoralScore necesita un sistema de likes para candidatos y un registro ligero de métricas. Los likes son condicionados: 1 por usuario por entidad, requieren autenticación. Las métricas usan el "Spine Pattern": un documento por día con counters atómicos (sin un doc por evento).

Colecciones actuales en Firestore:
- `entidades/{id}` — candidatos con scoreActual, totalEvaluaciones
- `fuentes/{id}` — URLs subidas
- `evaluaciones/{id}` — análisis Kohlberg

Colecciones nuevas:
- `likes/{userId_entidadId}` — un doc por like, ID compuesto como candado de unicidad
- `metricas/diaria-YYYYMMDD` — un doc por día con counters incrementales

## MISIÓN

Crear los schemas, queries, helper de métricas y reglas de Firestore para likes y métricas.

## EJECUCIÓN

### Tarea 1: Schema de Like — `src/schemas/like.schema.ts`

```typescript
import { z } from "zod/v4";

export const LikeSchema = z.object({
  userId: z.string().describe("Firebase Auth UID del usuario"),
  entidadId: z.string().describe("ID de la entidad que recibe el like"),
  createdAt: z.string().describe("ISO 8601 timestamp"),
});

export type Like = z.infer<typeof LikeSchema>;
```

El doc ID en Firestore será `{userId}_{entidadId}` — esto garantiza unicidad sin índices compuestos.

### Tarea 2: Agregar totalLikes a entidad schema — `src/schemas/entidad.schema.ts`

Agregar al EntidadSchema:
```typescript
totalLikes: z.number().int().min(0).optional().describe("Total de likes ciudadanos (denormalizado)"),
```

Usar `.optional()` para backward compatibility con los 35 candidatos existentes que no tienen el campo.

### Tarea 3: Queries de likes — `src/firebase/queries.ts`

Agregar estas funciones al archivo existente. Leer el archivo completo antes de editar.

**Imports adicionales necesarios** (agregar a los existentes):
```typescript
import { deleteDoc, increment } from "firebase/firestore";
```

**Funciones a agregar**:

```typescript
// --- Likes ---

/** Genera el doc ID compuesto para likes */
function likeDocId(userId: string, entidadId: string): string {
  return `${userId}_${entidadId}`;
}

/** Verifica si el usuario ya dio like a una entidad */
export async function getLikeStatus(userId: string, entidadId: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  const ref = doc(db, "likes", likeDocId(userId, entidadId));
  const snap = await getDoc(ref);
  return snap.exists();
}

/** Da o quita like (toggle). Retorna el nuevo estado (true = liked) */
export async function toggleLike(userId: string, entidadId: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  const id = likeDocId(userId, entidadId);
  const ref = doc(db, "likes", id);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Unlike
    await deleteDoc(ref);
    await updateDoc(doc(db, "entidades", entidadId), { totalLikes: increment(-1) });
    return false;
  } else {
    // Like
    await setDoc(ref, {
      userId,
      entidadId,
      createdAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, "entidades", entidadId), { totalLikes: increment(1) });
    return true;
  }
}
```

**NOTA sobre `increment`**: Firestore's `increment()` es atómico. No necesita leer el valor actual. Si `totalLikes` no existe en el doc, increment(1) lo crea con valor 1. increment(-1) lo pone en -1 si no existía, pero esto no debería pasar porque solo se llama en unlike.

### Tarea 4: Helper de métricas Spine Pattern — `src/shared/lib/track-metric.ts`

Crear archivo nuevo:

```typescript
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/firebase/client";

type MetricField =
  | "shares_wa"
  | "shares_tw"
  | "shares_copy"
  | "likes_dados"
  | "likes_quitados"
  | "fuentes_subidas";

function todayDocId(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `diaria-${yyyy}${mm}${dd}`;
}

/**
 * Incrementa un counter en el doc de métricas del día.
 * Usa setDoc con merge para crear el doc si no existe.
 * Fire-and-forget: no espera ni lanza errores al caller.
 */
export function trackMetric(field: MetricField): void {
  try {
    const ref = doc(db, "metricas", todayDocId());
    setDoc(ref, { [field]: increment(1) }, { merge: true });
  } catch {
    // Fire-and-forget: métricas no deben romper UX
  }
}
```

**IMPORTANTE**: `trackMetric` es fire-and-forget. No retorna promesa, no bloquea UI. Si Firestore falla, se traga el error silenciosamente. Las métricas son nice-to-have, no críticas.

### Tarea 5: Actualizar Firestore Rules — `firestore.rules`

El archivo actual tiene reglas para `entidades`, `fuentes`, y `evaluaciones`. Agregar reglas para `likes` y `metricas`.

**Reglas para likes/**:
```
match /likes/{likeId} {
  allow read: if true;
  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid
    && likeId.matches(request.auth.uid + '_.*');
  allow delete: if request.auth != null
    && resource.data.userId == request.auth.uid;
  allow update: if false;
}
```

Explicación:
- Read público: necesitamos contar likes y verificar estado desde el cliente
- Create: solo autenticado, userId debe coincidir con auth.uid, doc ID debe empezar con el uid del usuario
- Delete: solo el autor del like puede quitarlo
- Update: prohibido (un like no se modifica, se crea o se borra)

**Reglas para metricas/**:
```
match /metricas/{docId} {
  allow read: if false;
  allow create, update: if request.auth != null;
  allow delete: if false;
}
```

Explicación:
- Read prohibido públicamente (solo admin/scripts acceden)
- Create/update: cualquier usuario autenticado puede incrementar counters
- Delete: prohibido

**NOTA**: También necesitamos permitir el update de `totalLikes` en entidades. La regla actual de entidades ya permite update con `request.auth != null`, así que no necesita cambio.

## CRITERIO DE ÉXITO

1. `pnpm build` compila sin errores
2. `like.schema.ts` exporta LikeSchema y tipo Like
3. `entidad.schema.ts` tiene campo totalLikes optional
4. `queries.ts` exporta getLikeStatus y toggleLike
5. `track-metric.ts` exporta trackMetric con tipo MetricField
6. `firestore.rules` tiene reglas para likes/ y metricas/
7. No hay imports rotos ni tipos faltantes

## NOTAS ADICIONALES

- El proyecto usa `zod/v4`, no `zod`. Verificar el import.
- `increment` viene de `firebase/firestore`, no de un paquete separado.
- `setDoc` con `{ merge: true }` crea el doc si no existe y solo actualiza los campos especificados.
- No agregar funciones innecesarias (como getLikeCount). El count se lee desde `entidades/{id}.totalLikes` que ya está denormalizado.
