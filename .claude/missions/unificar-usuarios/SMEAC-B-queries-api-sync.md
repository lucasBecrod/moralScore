# Agente B — Queries + API route + sync-firestore

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar archivos fuera de `src/firebase/queries.ts`, `src/app/api/fuente/route.ts`, `scripts/sync-firestore.ts`
- NO editar schemas, data JSONs, features, firestore.rules
- Leer CADA archivo antes de editarlo
- Código en inglés, comentarios mínimos

### Archivos protegidos (NO modificar)
- `src/schemas/*`
- `data/*`
- `src/features/*`
- `firestore.rules`

### Límite de alcance
Queries Firestore (client), API route de fuente, y script de sync. Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
Actualizar queries, API route y sync para usar `userId` en vez de `creadaPor`/`evaluador`. Agregar sync de colección `usuarios/`. Proteger `/api/fuente` con autenticación.

### Criterio de éxito
- `queries.ts`: `createFuente` usa `userId` en vez de `creadaPor: "publico"`
- `queries.ts`: nueva función `getOrCreateUsuario(uid, nombre, email, foto)` para registrar usuarios al autenticarse
- `/api/fuente/route.ts`: requiere auth token, guarda `userId` del usuario autenticado
- `sync-firestore.ts`: sincroniza 6 colecciones (agrega `usuarios`)
- No hay referencias a `creadaPor` ni `evaluador` en los archivos tocados

---

## SITUACIÓN (Contexto)

### Estado actual
- `queries.ts` línea 103: `creadaPor: "publico"` hardcodeado en `createFuente`
- `/api/fuente/route.ts`: POST público sin auth, usa rate limit por IP
- `sync-firestore.ts`: sincroniza 5 colecciones, no incluye usuarios
- Los schemas ya fueron migrados por Agente A (userId en vez de creadaPor/evaluador)

### Pre-requisito
**El Agente A debe haber completado antes.**

### Archivos objetivo
- `src/firebase/queries.ts` (EDITAR)
- `src/app/api/fuente/route.ts` (EDITAR)
- `scripts/sync-firestore.ts` (EDITAR)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/unificar-usuarios/README.md` — modelo objetivo
- `src/schemas/usuario.schema.ts` — tipo Usuario (creado por Agente A)
- `src/schemas/fuente.schema.ts` — ahora tiene `userId` en vez de `creadaPor`

---

## EJECUCIÓN (Método)

### Paso 1: Editar `src/firebase/queries.ts`

#### 1a. Actualizar `createFuente`
Cambiar `creadaPor: "publico"` por recibir `userId` como parámetro:

```typescript
export async function createFuente(input: CreateFuenteInput & { userId: string }): Promise<string> {
  // ...
  // Reemplazar creadaPor: "publico" por userId: input.userId
}
```

#### 1b. Agregar `getOrCreateUsuario`

```typescript
import type { Usuario } from "@/schemas/usuario.schema";

export async function getOrCreateUsuario(
  uid: string,
  nombre: string,
  email: string | null,
  foto: string | null,
): Promise<void> {
  if (!isFirebaseConfigured()) return;
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      nombre,
      email,
      tipo: "humano",
      foto,
      createdAt: new Date().toISOString(),
    });
  }
}
```

Esta función se llama cuando un usuario se autentica por primera vez (desde AuthProvider o al subir fuente).

### Paso 2: Editar `/api/fuente/route.ts`

El endpoint ahora requiere autenticación. Pero como usa Client SDK (no Admin), no puede verificar tokens server-side directamente. Dos opciones:

**Opción simple (recomendada para prototipo)**: Recibir `userId` en el body. La protección real está en Firestore rules (que ya exigen `request.auth != null`).

```typescript
// Agregar userId al body esperado
const body = await request.json();
if (!body.userId) {
  return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
}

const id = await createFuente({
  ...parsed.data,
  titulo: body.titulo,
  medio: body.medio,
  userId: body.userId,
});
```

**Eliminar** el rate limit por IP (redundante con auth).

### Paso 3: Editar `scripts/sync-firestore.ts`

Agregar sync de usuarios ANTES de las demás colecciones:

```typescript
console.log("👤 Usuarios...");
const usuarios = loadJson<Record<string, unknown>>("usuarios.json");
const userResult = await syncCollection("usuarios", usuarios, "id");
console.log(`   ${userResult.created} nuevos, ${userResult.updated} actualizados, ${userResult.skipped} sin cambios`);
```

NOTA: El `idField` para usuarios es `"id"`, no `"id"`.

---

## APOYO (Recursos)

### Comandos
- Build: `pnpm build` — NO ejecutar, la UI aún puede referenciar campos viejos (Agente C)

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `createFuente` recibe y guarda `userId`, NO usa `creadaPor`
2. `getOrCreateUsuario` existe y funciona
3. `/api/fuente` requiere `userId` en el body, devuelve 401 si falta
4. Rate limit por IP eliminado de `/api/fuente`
5. `sync-firestore.ts` sincroniza 6 colecciones (incluye usuarios)
6. No hay referencias a `creadaPor` como valor hardcodeado
7. `git diff --stat` → solo archivos dentro del scope

---

## PURGADO — Algoritmo de Musk, Paso 2

1. ¿`getOrCreateUsuario` se puede simplificar? Si solo se usa en un lugar, evaluar si inline es mejor.
2. ¿El rate limit se puede eliminar completamente o solo de este endpoint?
3. Si algún archivo supera 200 LOC, simplificar.

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo. Comienza.
