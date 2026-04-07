# SMEAC-A: Migración de modelo de datos — separar entidad de candidatura

## Situación

MoralScore evalúa el razonamiento moral de PERSONAS (score Kohlberg 1-6). El score es de la persona, no de una candidatura. Actualmente la colección `entidades` mezcla datos de la persona (nombre, foto, score) con datos electorales (partido, rol, logoPartido). Esto impide:

- Mostrar un candidato en múltiples procesos electorales
- Filtrar por tipo de elección (presidenciales, regionales, municipales)
- Mantener historial cuando un candidato cambia de partido

**Datos actuales:** 35 entidades, 276 fuentes, 272 evaluaciones, 70 imágenes en Storage.

> **⚠ Corrección post-revisión:** El score desnormalizado en candidatura NO debe ser un mirror en tiempo real del lifetime score. Debe ser un **snapshot congelado** del momento electoral. Ver detalles en Fase 3.

## Modelo objetivo

```
entidades/{id}          ← persona + score (inmutable por proceso)
  id: "keiko-sofia-fujimori-higuchi"
  nombre: "Keiko Sofía Fujimori Higuchi"
  foto: "https://storage.googleapis.com/..."
  tipo: "persona"
  scoreActual: 3          // mediana de TODAS sus evaluaciones
  totalEvaluaciones: 10
  // SIN partido, SIN rol, SIN logoPartido

candidaturas/{id}       ← relación persona-proceso (compound ID)
  id: "keiko-sofia-fujimori-higuchi_presidenciales-2026"
  entidadId: "keiko-sofia-fujimori-higuchi"
  procesoId: "presidenciales-2026"
  partido: "Fuerza Popular"
  logoPartido: "https://storage.googleapis.com/..."
  rol: "presidente"
  // Desnormalización para renderizar tarjeta en 1 lectura:
  nombre: "Keiko Sofía Fujimori Higuchi"
  foto: "https://storage.googleapis.com/..."
  scoreActual: 3
  totalEvaluaciones: 10

procesos/{id}           ← tipo de elección
  id: "presidenciales-2026"
  nombre: "Elecciones Generales 2026"
  tipo: "nacional"      // nacional | regional | municipal
  activa: true

fuentes/{id}            ← SIN CAMBIO (apunta a entidadId)
evaluaciones/{id}       ← SIN CAMBIO (apunta a entidadId)
```

**Principio clave:** El score vive en la ENTIDAD (persona). La candidatura desnormaliza score para renderizar tarjetas sin joins. Fuentes y evaluaciones apuntan a entidadId (la persona), NO a candidatura.

## Misión

Migrar el modelo de datos, actualizar JSONs, scripts, queries y UI.

## Ejecución

### Fase 1: Schemas

**Crear `src/schemas/proceso.schema.ts`:**
```typescript
import { z } from "zod/v4";

export const ProcesoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  tipo: z.enum(["nacional", "regional", "municipal"]),
  activa: z.boolean(),
});
export type Proceso = z.infer<typeof ProcesoSchema>;
```

**Crear `src/schemas/candidatura.schema.ts`:**
```typescript
import { z } from "zod/v4";

export const CandidaturaSchema = z.object({
  id: z.string().describe("Compound: {entidadId}_{procesoId}"),
  entidadId: z.string(),
  procesoId: z.string(),
  partido: z.string().optional(),
  logoPartido: z.string().optional(),
  rol: z.enum(["presidente", "vicepresidente-1", "vicepresidente-2", "congresista", "alcalde", "gobernador", "otro"]).optional(),
  // Desnormalización:
  nombre: z.string(),
  foto: z.string(),
  scoreActual: z.number().min(1).max(6).nullable(),
  totalEvaluaciones: z.number().int().min(0),
});
export type Candidatura = z.infer<typeof CandidaturaSchema>;
```

**Modificar `src/schemas/entidad.schema.ts`:**
- QUITAR: partido, logoPartido, rol, cargo
- MANTENER: id, nombre, foto, tipo, scoreActual, totalEvaluaciones, bio, dniRuc, region, nombreLegal

### Fase 2: Data JSONs

**Crear `data/procesos.json`:**
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

**Crear `data/candidaturas.json`:**
- Iterar `data/candidatos.json` actual
- Por cada candidato: crear objeto con id compuesto, entidadId, procesoId, partido, logoPartido, rol + nombre, foto desnormalizados
- scoreActual y totalEvaluaciones se calcularán en sync

**Modificar `data/candidatos.json`:**
- QUITAR: partido, logoPartido, rol
- MANTENER: id, nombre, foto, tipo

### Fase 3: sync-firestore.ts

Agregar sync de:
1. `procesos.json` → colección `procesos` (read-only, sin ignore)
2. `candidaturas.json` → colección `candidaturas` (ignorar scoreActual, totalEvaluaciones en compare)

En el recálculo de scores (paso 4 del script):
- Actualizar `scoreActual` y `totalEvaluaciones` en `entidades/{id}` (lifetime score — mediana de TODAS las evaluaciones)
- Actualizar `scoreActual` y `totalEvaluaciones` en candidaturas **SOLO si el proceso está activo** (`activa: true`). Cuando un proceso deja de estar activo, su score se congela y no se recalcula más.
- Lógica: cargar `procesos`, filtrar los activos, y solo propagar scores a candidaturas de esos procesos.

### Fase 4: queries.ts

**Agregar:**
- `getCandidaturas(procesoId?: string): Promise<Candidatura[]>` — si procesoId, filtrar con where
- `getCandidaturaById(id: string): Promise<Candidatura | null>`
- `getCandidaturasByEntidad(entidadId: string): Promise<Candidatura[]>`

**Mantener sin cambio:**
- `getEntidades()`, `getEntidadById()`
- `getFuentesByEntidad()`, `getEvaluacionesByEntidad()`
- `createFuente()`, `reconcileEntidad()`, `reconcileAll()`

### Fase 5: Cache hook

**Crear `src/shared/hooks/useCandidaturas.ts`:**
- Mismo patrón que `useEntidades.ts` (cache en memoria + stale-while-revalidate)
- Usa `getCandidaturas("presidenciales-2026")` por defecto

### Fase 6: UI

**`RankingPage.tsx`:**
- Cambiar `useEntidades()` → `useCandidaturas()`
- Las tarjetas reciben candidatura (tiene nombre, foto, partido, score, logo)

**`EntidadCard.tsx`:**
- Ajustar tipo de props para aceptar Candidatura
- El link sigue yendo a `/entidad/{entidadId}` (la persona)

**`EntidadDetallePage.tsx`:**
- Sigue leyendo entidad por ID (persona + score)
- Para mostrar partido/rol: consultar candidaturas con `getCandidaturasByEntidad(id)`
- Si hay 1 candidatura → mostrar partido/rol directamente
- Si hay múltiples → mostrar la del proceso activo como principal, y listar las demás como historial simple (no sobrediseñar timeline)
- Fuentes y evaluaciones: sin cambio (usan entidadId)

**`RegistrarEntidadPage.tsx`:**
- Al crear entidad, también crear candidatura asociada al proceso activo
- Campos partido y rol van a la candidatura, no a la entidad
- **Proceso activo:** query `procesos` where `activa == true`, tomar el primero. Si no hay proceso activo, crear solo la entidad (sin candidatura) y mostrar aviso al usuario.

### Fase 7: Firestore rules

Agregar:
```
match /candidaturas/{candidaturaId} {
  allow read: if true;
  allow create, update: if request.auth != null;
  allow delete: if false;
}

match /procesos/{procesoId} {
  allow read: if true;
  allow write: if false;
}
```

### Fase 8: Script de migración (opcional, para BD ya en producción)

**Crear `scripts/migrate-candidaturas.ts`:**
- Admin SDK con detección de entorno
- Lee todas las entidades actuales
- Crea `procesos/presidenciales-2026`
- Por cada entidad con partido/rol: crea candidatura con ID compuesto
- Limpia partido, logoPartido, rol de la entidad (FieldValue.delete)
- Idempotente: si candidatura ya existe, skip

## Criterio de éxito
1. `pnpm build` pasa sin errores
2. Ranking muestra candidaturas (con partido, logo, score desnormalizados)
3. Detalle de candidato muestra score + fuentes + evaluaciones (vía entidadId)
4. Crear candidato desde form crea entidad + candidatura
5. `./init.sh` seedea las 5 colecciones correctamente
6. Script de migración funciona contra prod sin perder datos

## Restricciones
- NO romper fuentes ni evaluaciones — siguen apuntando a entidadId
- El score es de la PERSONA, no de la candidatura
- Código en inglés, UI en español
- Dark mode only, Tailwind, componentes max 150 LOC
- Lee CADA archivo antes de editarlo

## Orden de ejecución recomendado
1. Schemas (Fase 1)
2. Data JSONs (Fase 2)
3. sync-firestore.ts (Fase 3)
4. queries.ts (Fase 4)
5. Cache hook (Fase 5)
6. UI (Fase 6)
7. Firestore rules (Fase 7)
8. Migración prod (Fase 8)
9. `pnpm build` → test → commit
