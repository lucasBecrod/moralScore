# Agente A — Schema usuarios + Data JSONs + Firestore Rules

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar archivos fuera de `src/schemas/`, `data/`, `firestore.rules`
- NO editar `src/firebase/`, `src/features/`, `src/shared/`, `scripts/`, `src/app/`
- Leer CADA archivo antes de editarlo
- Código en inglés, comentarios mínimos
- Usar `zod/v4` (import de "zod/v4", NO "zod")

### Archivos protegidos (NO modificar)
- `src/schemas/analisis-response.schema.ts`
- `src/schemas/candidatura.schema.ts`
- `src/schemas/proceso.schema.ts`
- `src/schemas/validacion.schema.ts`
- `scripts/*`
- `src/firebase/*`
- `src/features/*`
- `src/app/*`

### Archivos adicionales en scope
- `.claude/skills/evaluador-kohlberg/references/prompt-agente.md` (EDITAR — actualizar JSON template)

### Límite de alcance
Schema de usuarios, JSONs de seed, migración de campos en fuentes/evaluaciones, reglas de Firestore. Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
Crear el schema `usuario.schema.ts`, generar `data/usuarios.json` con los actores conocidos, migrar `creadaPor` → `userId` en fuentes y `evaluador` → `userId` en evaluaciones, y agregar rules de Firestore para la colección `usuarios/`.

### Criterio de éxito
- `usuario.schema.ts` existe y exporta UsuarioSchema y tipo Usuario
- `data/usuarios.json` contiene al menos 3 docs: bot-moralscore, lucas, lady
- `fuente.schema.ts` tiene `userId` (string FK) en vez de `creadaPor` (enum)
- `evaluacion.schema.ts` tiene `userId` en vez de `evaluador`
- `data/fuentes.json` usa `userId` en vez de `creadaPor`
- `data/evaluaciones.json` usa `userId` en vez de `evaluador`
- `firestore.rules` incluye rules para `usuarios/`

---

## SITUACIÓN (Contexto)

### Principio de diseño
**Todo actor es un usuario.** No hay castas. Bot, fundadores, ciudadanos — todos viven en `usuarios/{uid}`. El UID es:
- Para humanos con Google Auth: su Firebase Auth UID
- Para el bot: `"bot-moralscore"` (ID fijo manual)
- Para fundadores sin auth: IDs semánticos (`"lucas"`, `"lady"`)

### Estado actual
- `fuente.schema.ts` línea 25: `creadaPor: z.enum(["publico", "lucas", "lady"])`
- `evaluacion.schema.ts` línea 28: `evaluador: z.string()` (libre: "lucas", "lady", "haiku-8")
- `data/fuentes.json`: usa `"creadaPor": "bot-moralscore"` (que ni está en el enum del schema)
- `data/evaluaciones.json`: usa `"evaluador": "lucas"` o `"evaluador": "haiku-8"`
- No existe colección `usuarios/` ni schema

### Archivos objetivo
- `src/schemas/usuario.schema.ts` (CREAR)
- `src/schemas/fuente.schema.ts` (EDITAR — creadaPor → userId)
- `src/schemas/evaluacion.schema.ts` (EDITAR — evaluador → userId)
- `data/usuarios.json` (CREAR)
- `data/fuentes.json` (EDITAR — creadaPor → userId)
- `data/evaluaciones.json` (EDITAR — evaluador → userId)
- `firestore.rules` (EDITAR — agregar usuarios/)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/unificar-usuarios/README.md` — modelo objetivo
- `src/schemas/entidad.schema.ts` — referencia de estilo Zod

---

## EJECUCIÓN (Método)

### Paso 1: Crear `src/schemas/usuario.schema.ts`

```typescript
import { z } from "zod/v4";

export const UsuarioSchema = z.object({
  id: z.string().describe("Firebase Auth UID o slug fijo (ej: bot-moralscore)"),
  email: z.string().email().nullable().describe("Email de Google Auth, null para bots"),
  nombre: z.string().describe("displayName de Google Auth o nombre manual"),
  foto: z.string().nullable().optional().describe("photoURL de Google Auth"),
  createdAt: z.string().describe("ISO 8601 timestamp"),
});
export type Usuario = z.infer<typeof UsuarioSchema>;
```

Solo 4 campos + createdAt. Lo mínimo que Google Auth da gratis sin pedir permisos extra. El bot se distingue por su ID predecible (`bot-moralscore`), no por un campo de tipo.

### Paso 2: Crear `data/usuarios.json`

```json
[
  {
    "id": "bot-moralscore",
    "nombre": "MoralScore Bot",
    "email": null,
    "foto": null
  },
  {
    "id": "lucasbecrod",
    "nombre": "Lucas Becrod",
    "email": "lucasbecrod@gmail.com",
    "foto": null
  },
  {
    "id": "leidibecrod",
    "nombre": "Leidi Becrod",
    "email": "leydibecrod@gmail.com",
    "foto": null
  }
]
```

NOTA: No incluir `createdAt` — sync-firestore lo genera automáticamente en docs nuevos.

### Paso 3: Editar `src/schemas/fuente.schema.ts`

- QUITAR: `creadaPor: z.enum(["publico", "lucas", "lady"])`
- AGREGAR: `userId: z.string().describe("FK a usuarios/{uid} — quién subió la fuente")`
- MANTENER todo lo demás intacto

### Paso 4: Editar `src/schemas/evaluacion.schema.ts`

- QUITAR: `evaluador: z.string()`
- AGREGAR: `userId: z.string().describe("FK a usuarios/{uid} — quién realizó la evaluación")`
- QUITAR: `validadoPor: z.enum(["lucas", "lady"]).nullable()`
- AGREGAR: `validadoPor: z.string().nullable().describe("UID del usuario que validó, null si no validada")`
- MANTENER todo lo demás intacto

### Paso 5: Editar `data/fuentes.json`

Reemplazar el campo `creadaPor` por `userId` en TODOS los objetos:
- `"creadaPor": "bot-moralscore"` → `"userId": "bot-moralscore"`
- `"creadaPor": "publico"` → `"userId": "publico"` (usuario anónimo legacy, se mantiene como sentinel)
- `"creadaPor": "lucas"` → `"userId": "lucasbecrod"`
- `"creadaPor": "lady"` → `"userId": "leidibecrod"`

### Paso 6: Editar `data/evaluaciones.json`

Reemplazar `evaluador` por `userId` en TODOS los objetos:
- `"evaluador": "lucas"` → `"userId": "lucasbecrod"`
- `"evaluador": "lady"` → `"userId": "leidibecrod"`
- `"evaluador": "haiku-8"` → `"userId": "bot-moralscore"` (todos los agentes IA son el bot)
- Cualquier otro evaluador de agente (haiku-*, claude-*, etc.) → `"userId": "bot-moralscore"`

También actualizar `validadoPor`:
- `"validadoPor": "lucas"` → `"validadoPor": "lucasbecrod"`
- `"validadoPor": null` → mantener null

### Paso 7: Editar `.claude/skills/evaluador-kohlberg/references/prompt-agente.md`

En el JSON template del prompt del agente evaluador:
- `"evaluador":"haiku-{OLEADA}"` → `"userId":"bot-moralscore"`
- `"creadaPor":"moralscore-bot"` → `"userId":"bot-moralscore"`
- `"fechaFuente"` → `"fechaEvento"` (alinear con migración anterior)

El bot siempre se identifica como `bot-moralscore` — sin variantes por oleada ni por modelo.

### Paso 8: Editar `firestore.rules`

Agregar DENTRO del bloque `match /databases/{database}/documents`:

```
// Usuarios: lectura publica, creacion solo el propio usuario o scripts
match /usuarios/{userId} {
  allow read: if true;
  allow create: if request.auth != null && request.auth.uid == userId;
  allow update: if request.auth != null && request.auth.uid == userId;
  allow delete: if false;
}
```

---

## APOYO (Recursos)

### Comandos
- Build: `pnpm build` — NO ejecutar, queries.ts y sync aún usan campos viejos (Agente B)

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `usuario.schema.ts` exporta UsuarioSchema y tipo Usuario
2. `data/usuarios.json` tiene al menos 3 entries (bot, lucas, lady)
3. `fuente.schema.ts` tiene `userId`, NO tiene `creadaPor`
4. `evaluacion.schema.ts` tiene `userId`, NO tiene `evaluador`
5. `data/fuentes.json` usa `userId`, NO tiene `creadaPor`
6. `data/evaluaciones.json` usa `userId`, NO tiene `evaluador`
7. `firestore.rules` tiene rules para `usuarios/`
8. Prompt evaluador usa `"userId":"bot-moralscore"` (no `evaluador` ni `creadaPor`)
9. Prompt evaluador usa `"fechaEvento"` (no `fechaFuente`)
10. Los schemas compilan sin errores Zod
11. `git diff --stat` → solo archivos dentro del scope

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar, aplica el Paso 2 (Eliminar):
1. ¿Hay campos en UsuarioSchema que no se usan en ningún flujo? Eliminar.
2. Si algún archivo supera 200 LOC, simplificar.

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo paso a paso. Comienza.
