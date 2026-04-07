# Agente A — Schemas + Data JSONs + Firestore Rules

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar archivos fuera de `src/schemas/`, `data/`, `firestore.rules`
- NO editar `src/firebase/`, `src/features/`, `src/shared/`, `scripts/`, `src/app/`
- NO borrar archivos — solo crear nuevos o editar existentes
- Leer CADA archivo antes de editarlo
- Código en inglés, comentarios mínimos
- Usar `zod/v4` (import de "zod/v4", NO "zod")

### Archivos protegidos (NO modificar)
- `src/schemas/analisis-response.schema.ts`
- `scripts/*`
- `src/firebase/*`
- `src/features/*`
- `src/app/*`

### Límite de alcance
Schemas de datos (Zod), JSONs de seed, y reglas de Firestore. Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
Separar el concepto de "persona/organización" del concepto de "candidatura electoral" en el modelo de datos. Crear schemas y datos para las nuevas colecciones `candidaturas` y `procesos`. Limpiar datos electorales de `entidades`. Agregar `fechaEvento` a fuentes y evaluaciones para habilitar time-bounding de snapshots.

### Criterio de éxito
- Schemas nuevos (`proceso.schema.ts`, `candidatura.schema.ts`) existen y exportan tipos
- `entidad.schema.ts` NO tiene `partido`, `logoPartido`, `rol`, `cargo`; usa `scoreHistorico` y `totalEvaluacionesHistoricas`
- `fuente.schema.ts` tiene `fechaEvento` (required), no `fechaFuente`
- `evaluacion.schema.ts` tiene `fechaEvento`
- `data/procesos.json` existe con 1 proceso (incluye `fechaCorte`)
- `data/candidaturas.json` existe con ~35 candidaturas
- `data/candidatos.json` NO tiene `partido`, `logoPartido`, `rol` — solo `id`, `nombre`, `foto`, `tipo`
- `data/fuentes.json` usa `fechaEvento` en vez de `fechaFuente`
- `data/evaluaciones.json` tiene `fechaEvento` en cada entry
- `firestore.rules` incluye rules para `candidaturas` y `procesos`
- Los tipos exportados son consistentes entre sí

---

## SITUACIÓN (Contexto)

### Principios de diseño (consenso equipo + arquitecto)

1. **El score es de la PERSONA, no de la candidatura.** Kohlberg mide desarrollo moral a lo largo de la vida. El score vive en la entidad.
2. **Entidad es agnóstica.** Puede ser persona u organización. No toda entidad participa en un proceso electoral.
3. **Fuentes y evaluaciones apuntan a entidadId.** NUNCA a candidaturaId. Permite evaluar entidades sin candidatura.
4. **Time-bounding para snapshots.** `scoreCandidatura = mediana(evaluaciones WHERE fechaEvento <= proceso.fechaCorte)`. Congela score sin mutar datos.
5. **fechaEvento ≠ createdAt.** `fechaEvento` = cuándo ocurrió el acto. `createdAt` = cuándo se guardó en BD.
6. **Growth (likes, shares) es misión separada.** NO mezclar.

### Modelo objetivo

```
entidades/{id}          ← persona u organización + lifetime score
  id, nombre, foto, tipo
  scoreHistorico (mediana lifetime), totalEvaluacionesHistoricas
  SIN partido, SIN rol, SIN logoPartido, SIN cargo

candidaturas/{id}       ← relación entidad-proceso (compound ID)
  id: "{entidadId}_{procesoId}"
  entidadId, procesoId, partido, logoPartido, rol
  nombre, foto (desnormalizados para render en 1 lectura)
  scoreCandidatura (snapshot time-bounded), evaluacionesCandidatura

procesos/{id}           ← tipo de elección
  id, nombre, tipo, activa, fechaCorte

fuentes/{id}            ← apuntan a entidadId (SIN CAMBIO de FK)
  fechaEvento (renombrado de fechaFuente, required)

evaluaciones/{id}       ← apuntan a entidadId (SIN CAMBIO de FK)
  fechaEvento (NUEVO, heredado de la fuente)
```

### Archivos objetivo
- `src/schemas/proceso.schema.ts` (CREAR)
- `src/schemas/candidatura.schema.ts` (CREAR)
- `src/schemas/entidad.schema.ts` (EDITAR)
- `src/schemas/fuente.schema.ts` (EDITAR)
- `src/schemas/evaluacion.schema.ts` (EDITAR)
- `data/procesos.json` (CREAR)
- `data/candidaturas.json` (CREAR)
- `data/candidatos.json` (EDITAR)
- `data/fuentes.json` (EDITAR)
- `data/evaluaciones.json` (EDITAR)
- `firestore.rules` (EDITAR)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/migracion-candidaturas/SMEAC-A-schema-migracion-candidaturas.md` — modelo detallado con ejemplos de time-bounding
- `src/schemas/analisis-response.schema.ts` — referencia de estilo Zod

---

## EJECUCIÓN (Método)

### Paso 1: Crear `src/schemas/proceso.schema.ts`

```typescript
import { z } from "zod/v4";

export const ProcesoTipo = z.enum(["nacional", "regional", "municipal"]);
export type ProcesoTipo = z.infer<typeof ProcesoTipo>;

export const ProcesoSchema = z.object({
  id: z.string().describe("Slug del proceso: presidenciales-2026"),
  nombre: z.string().describe("Nombre oficial del proceso electoral"),
  tipo: ProcesoTipo.describe("Alcance del proceso"),
  activa: z.boolean().describe("Si el proceso está vigente"),
  fechaCorte: z.string().describe("ISO 8601 date. Evaluaciones con fechaEvento <= este valor se incluyen en el snapshot"),
});
export type Proceso = z.infer<typeof ProcesoSchema>;
```

### Paso 2: Crear `src/schemas/candidatura.schema.ts`

```typescript
import { z } from "zod/v4";

export const CandidaturaRol = z.enum([
  "presidente", "vicepresidente-1", "vicepresidente-2",
  "congresista", "alcalde", "gobernador", "otro",
]);
export type CandidaturaRol = z.infer<typeof CandidaturaRol>;

export const CandidaturaSchema = z.object({
  id: z.string().describe("Compound: {entidadId}_{procesoId}"),
  entidadId: z.string().describe("FK a entidades/{id}"),
  procesoId: z.string().describe("FK a procesos/{id}"),
  partido: z.string().optional().describe("Nombre del partido político"),
  logoPartido: z.string().optional().describe("URL del logo del partido"),
  rol: CandidaturaRol.optional().describe("Rol en la fórmula electoral"),
  nombre: z.string().describe("Desnormalizado de entidad.nombre"),
  foto: z.string().describe("Desnormalizado de entidad.foto"),
  scoreCandidatura: z.number().min(1).max(6).nullable().describe("Mediana time-bounded"),
  evaluacionesCandidatura: z.number().int().min(0).describe("Total evaluaciones en snapshot"),
});
export type Candidatura = z.infer<typeof CandidaturaSchema>;
```

### Paso 3: Editar `src/schemas/entidad.schema.ts`

- QUITAR: `EntidadRol` enum y su export de tipo
- QUITAR campos: `rol`, `partido`, `logoPartido`, `cargo`
- RENOMBRAR: `scoreActual` → `scoreHistorico`
- RENOMBRAR: `totalEvaluaciones` → `totalEvaluacionesHistoricas`
- MANTENER: `id`, `nombre`, `foto`, `tipo`, `nombreLegal`, `dniRuc`, `region`, `bio`
- `EntidadTipo` se MANTIENE como `z.enum(["persona", "organizacion"])`

### Paso 4: Editar `src/schemas/fuente.schema.ts`

- RENOMBRAR: `fechaFuente` → `fechaEvento`
- Hacer `fechaEvento` **required** (no optional) — necesario para time-bounding
- Actualizar `.describe()`: "Fecha del acto/declaración evaluado (ISO 8601)"
- MANTENER todo lo demás intacto

### Paso 5: Editar `src/schemas/evaluacion.schema.ts`

- AGREGAR: `fechaEvento: z.string().describe("ISO 8601 date del acto evaluado — heredado de la fuente")`
- MANTENER todo lo demás intacto

### Paso 6: Crear `data/procesos.json`

```json
[
  {
    "id": "presidenciales-2026",
    "nombre": "Elecciones Generales 2026",
    "tipo": "nacional",
    "activa": true,
    "fechaCorte": "2026-04-13"
  }
]
```

### Paso 7: Crear `data/candidaturas.json`

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
  "scoreCandidatura": null,
  "evaluacionesCandidatura": 0
}
```

- Si un campo es undefined en el candidato original, omitirlo del JSON
- `scoreCandidatura` y `evaluacionesCandidatura` en null/0 — sync-firestore los calculará

### Paso 8: Editar `data/candidatos.json`

Quitar de cada objeto: `partido`, `logoPartido`, `rol`.
Mantener solo: `id`, `nombre`, `foto`, `tipo`.

NO agregar `scoreHistorico` ni `totalEvaluacionesHistoricas` — esos se calculan en sync-firestore.

### Paso 9: Editar `data/fuentes.json`

Renombrar `fechaFuente` → `fechaEvento` en TODOS los objetos.
Para fuentes que no tenían `fechaFuente`: inferir del ID o título si contiene fecha. Si no es posible, usar `"1970-01-01"` como sentinel y dejar un comentario.

### Paso 10: Editar `data/evaluaciones.json`

Agregar `fechaEvento` a cada evaluación:
- Buscar la fuente correspondiente (por `fuenteId`) en `data/fuentes.json` y copiar su `fechaEvento`
- Si la fuente no tiene fecha, usar el sentinel `"1970-01-01"`

### Paso 11: Editar `firestore.rules`

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

### Comandos
- Build: `pnpm build` — NO ejecutar, fallará porque queries.ts y UI usan campos viejos. Eso lo arreglan otros agentes.

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. Los schemas compilan sin errores de sintaxis Zod
2. `data/candidaturas.json` tiene ~35 entries
3. `data/candidatos.json` NO tiene campos `partido`, `logoPartido`, `rol`
4. `data/procesos.json` tiene 1 entry con `fechaCorte`
5. `data/fuentes.json` usa `fechaEvento`, no `fechaFuente`
6. `data/evaluaciones.json` tiene `fechaEvento` en cada entry
7. `firestore.rules` tiene las 2 nuevas reglas
8. `entidad.schema.ts` NO exporta `EntidadRol`, NO tiene `partido`, `logoPartido`, `rol`, `cargo`
9. `fuente.schema.ts` tiene `fechaEvento` (required)
10. `evaluacion.schema.ts` tiene `fechaEvento`
11. `analisis-response.schema.ts` NO fue modificado
12. `git diff --stat` → solo archivos dentro del scope

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar, aplica el Paso 2 (Eliminar):
1. Revisa lo que escribiste. Identifica:
   - Campos en schemas que no se usan en ningún flujo
   - Datos en JSONs que son redundantes
   - Reglas de Firestore que duplican lógica
2. Elimina al menos 1 elemento concreto
3. Si algún archivo supera 200 LOC (150 .tsx), divídelo ahora
4. Verifica que sigue funcionando después de podar

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo paso a paso. Comienza.
