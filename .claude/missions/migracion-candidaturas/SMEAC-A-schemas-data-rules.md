# Agente A — Schemas + Data JSONs + Firestore Rules

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar archivos fuera de `src/schemas/`, `data/`, `firestore.rules`
- NO editar `src/firebase/`, `src/features/`, `src/shared/`, `scripts/`
- NO borrar archivos — solo crear nuevos o editar existentes
- Leer CADA archivo antes de editarlo
- Código en inglés, comentarios mínimos
- Usar `zod/v4` (import de "zod/v4", NO "zod")

### Archivos protegidos (NO modificar)
- `src/schemas/fuente.schema.ts`
- `src/schemas/evaluacion.schema.ts`
- `src/schemas/analisis-response.schema.ts`
- `scripts/*`
- `src/firebase/*`
- `src/features/*`

### Límite de alcance
Schemas de datos (Zod), JSONs de seed, y reglas de Firestore. Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
Separar el concepto de "persona" del concepto de "candidatura electoral" en el modelo de datos. Crear schemas y datos para las nuevas colecciones `candidaturas` y `procesos`. Limpiar datos electorales de `entidades`.

### Criterio de éxito
- `proceso.schema.ts` y `candidatura.schema.ts` existen y exportan tipos
- `entidad.schema.ts` ya NO tiene `partido`, `logoPartido`, `rol`, `cargo`
- `data/procesos.json` existe con 1 proceso
- `data/candidaturas.json` existe con ~35 candidaturas (1 por candidato actual)
- `data/candidatos.json` ya NO tiene `partido`, `logoPartido`, `rol`
- `firestore.rules` incluye rules para `candidaturas` y `procesos`
- Los tipos exportados son consistentes entre sí

---

## SITUACIÓN (Contexto)

### Estado actual del problema
La colección `entidades` mezcla datos de persona (nombre, foto, score) con datos electorales (partido, rol, logoPartido). Esto impide mostrar un candidato en múltiples procesos electorales y mantener historial de partidos.

### Archivos objetivo
- `src/schemas/proceso.schema.ts` (CREAR)
- `src/schemas/candidatura.schema.ts` (CREAR)
- `src/schemas/entidad.schema.ts` (EDITAR — quitar campos electorales)
- `data/procesos.json` (CREAR)
- `data/candidaturas.json` (CREAR)
- `data/candidatos.json` (EDITAR — quitar campos electorales)
- `firestore.rules` (EDITAR — agregar 2 colecciones)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/migracion-candidaturas/SMEAC-A-schema-migracion-candidaturas.md` — modelo objetivo detallado
- `src/schemas/fuente.schema.ts` — referencia de estilo Zod del proyecto
- `src/schemas/evaluacion.schema.ts` — referencia de estilo Zod del proyecto

---

## EJECUCIÓN (Método)

### Paso 1: Crear `src/schemas/proceso.schema.ts`

```typescript
import { z } from "zod/v4";

export const ProcesoSchema = z.object({
  id: z.string().describe("Slug del proceso: presidenciales-2026"),
  nombre: z.string().describe("Nombre oficial del proceso electoral"),
  tipo: z.enum(["nacional", "regional", "municipal"]).describe("Alcance del proceso"),
  activa: z.boolean().describe("Si el proceso está vigente (true = scores se recalculan)"),
});
export type Proceso = z.infer<typeof ProcesoSchema>;
```

### Paso 2: Crear `src/schemas/candidatura.schema.ts`

```typescript
import { z } from "zod/v4";

export const CandidaturaRol = z.enum([
  "presidente",
  "vicepresidente-1",
  "vicepresidente-2",
  "congresista",
  "alcalde",
  "gobernador",
  "otro",
]);
export type CandidaturaRol = z.infer<typeof CandidaturaRol>;

export const CandidaturaSchema = z.object({
  // Identidad
  id: z.string().describe("Compound: {entidadId}_{procesoId}"),
  entidadId: z.string().describe("FK a entidades/{id}"),
  procesoId: z.string().describe("FK a procesos/{id}"),

  // Datos electorales
  partido: z.string().optional().describe("Nombre del partido político"),
  logoPartido: z.string().optional().describe("URL del logo del partido"),
  rol: CandidaturaRol.optional().describe("Rol en la fórmula electoral"),

  // Desnormalización (para renderizar tarjeta en 1 lectura)
  nombre: z.string().describe("Desnormalizado de entidad.nombre"),
  foto: z.string().describe("Desnormalizado de entidad.foto"),
  scoreActual: z.number().min(1).max(6).nullable().describe("Snapshot del score al momento del proceso"),
  totalEvaluaciones: z.number().int().min(0).describe("Snapshot del total de evaluaciones"),
});
export type Candidatura = z.infer<typeof CandidaturaSchema>;
```

### Paso 3: Editar `src/schemas/entidad.schema.ts`

Quitar:
- El enum `EntidadRol` y su export de tipo
- Los campos: `rol`, `partido`, `logoPartido`, `cargo`

Mantener todo lo demás intacto. El tipo `EntidadTipo` se queda.

**IMPORTANTE**: El API route `src/app/api/entidad/route.ts` importa `EntidadTipo` de este schema. NO quitar `EntidadTipo`.

### Paso 4: Crear `data/procesos.json`

```json
[
  {
    "id": "presidenciales-2026",
    "nombre": "Elecciones Generales 2026",
    "tipo": "nacional",
    "activa": true
  }
]
```

### Paso 5: Crear `data/candidaturas.json`

Leer `data/candidatos.json`. Por cada candidato, generar:

```json
{
  "id": "{candidato.id}_presidenciales-2026",
  "entidadId": "{candidato.id}",
  "procesoId": "presidenciales-2026",
  "partido": "{candidato.partido}",
  "logoPartido": "{candidato.logoPartido}",
  "rol": "{candidato.rol}",
  "nombre": "{candidato.nombre}",
  "foto": "{candidato.foto}",
  "scoreActual": null,
  "totalEvaluaciones": 0
}
```

- `scoreActual` y `totalEvaluaciones` se ponen en null/0 porque el script de sync los calculará
- Si un campo es undefined en el candidato original, omitirlo

### Paso 6: Editar `data/candidatos.json`

Quitar de cada objeto: `partido`, `logoPartido`, `rol`.
Mantener: `id`, `nombre`, `foto`, `tipo`.

### Paso 7: Editar `firestore.rules`

Agregar DENTRO del bloque `match /databases/{database}/documents`:

```
// Candidaturas: lectura publica, escritura solo autenticados
match /candidaturas/{candidaturaId} {
  allow read: if true;
  allow create, update: if request.auth != null;
  allow delete: if false;
}

// Procesos electorales: solo lectura (gestion via scripts)
match /procesos/{procesoId} {
  allow read: if true;
  allow write: if false;
}
```

---

## APOYO (Recursos)

### Rutas
- Proyecto: `c:\Users\lucas\proyectos\moralScore`

### Comandos
- Build: `pnpm build` (NO ejecutar — el build fallará porque queries.ts y UI aún usan campos viejos. Eso lo arreglan otros agentes)

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. Los 3 schemas compilan (no errores de sintaxis Zod)
2. `data/candidaturas.json` tiene ~35 entries (una por candidato)
3. `data/candidatos.json` NO tiene campos `partido`, `logoPartido`, `rol`
4. `data/procesos.json` tiene 1 entry
5. `firestore.rules` tiene las 2 nuevas reglas
6. `entidad.schema.ts` NO exporta `EntidadRol`, NO tiene campos `partido`, `logoPartido`, `rol`, `cargo`
7. Verificar que archivos protegidos no fueron modificados
8. `git diff --stat` → solo archivos dentro del scope

### Si algo falla después de 3 enfoques distintos
Reportar bloqueo con: qué intentaste, qué falló, qué propones.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo paso a paso. Comienza.
