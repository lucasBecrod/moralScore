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
- `src/schemas/analisis-response.schema.ts`
- `scripts/*`
- `src/firebase/*`
- `src/features/*`

### Límite de alcance
Schemas de datos (Zod), JSONs de seed, y reglas de Firestore. Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
Separar el concepto de "persona/organización" del concepto de "candidatura electoral" en el modelo de datos. Crear schemas y datos para las nuevas colecciones `candidaturas` y `procesos`. Limpiar datos electorales de `entidades`. Agregar `fechaEvento` a fuentes y evaluaciones para habilitar time-bounding de snapshots.

### Criterio de éxito
- `proceso.schema.ts` y `candidatura.schema.ts` existen y exportan tipos
- `entidad.schema.ts` ya NO tiene `partido`, `logoPartido`, `rol`, `cargo`; renombra `scoreActual` → `scoreHistorico`
- `fuente.schema.ts` tiene campo `fechaEvento` (reemplaza `fechaFuente`)
- `evaluacion.schema.ts` tiene campo `fechaEvento`
- `data/procesos.json` existe con 1 proceso (incluye `fechaCorte`)
- `data/candidaturas.json` existe con ~35 candidaturas (1 por candidato actual)
- `data/candidatos.json` ya NO tiene `partido`, `logoPartido`, `rol`; renombra `scoreActual` → `scoreHistorico`
- `firestore.rules` incluye rules para `candidaturas` y `procesos`
- Los tipos exportados son consistentes entre sí

---

## SITUACIÓN (Contexto)

### Principios de diseño (consenso equipo + arquitecto)

1. **El score es de la PERSONA, no de la candidatura.** MoralScore evalúa razonamiento moral según Kohlberg, que es evolutivo y de por vida. El score vive en la entidad.
2. **Entidad es agnóstica.** Puede ser persona (candidato, Bukele, el Papa) u organización (empresa, partido). No toda entidad participa en un proceso electoral.
3. **Fuentes y evaluaciones apuntan a entidadId.** NUNCA a candidaturaId. Esto permite evaluar entidades sin candidatura.
4. **Time-bounding para snapshots.** El `scoreCandidatura` se calcula filtrando evaluaciones por `fechaEvento <= proceso.fechaCorte`. Esto congela matemáticamente el score de una candidatura sin mutar datos históricos (Principio P3: Inmutabilidad Histórica).
5. **fechaEvento ≠ createdAt.** `fechaEvento` es cuándo ocurrió el acto/declaración. `createdAt` es cuándo se guardó en BD.
6. **Growth (likes, shares, métricas) es misión separada.** NO mezclar en estos schemas.

### Estado actual del problema
La colección `entidades` mezcla datos de persona (nombre, foto, score) con datos electorales (partido, rol, logoPartido). Esto impide mostrar un candidato en múltiples procesos electorales y mantener historial de partidos. Además, no existe un vector temporal para calcular snapshots inmutables.

### Archivos objetivo
- `src/schemas/proceso.schema.ts` (CREAR)
- `src/schemas/candidatura.schema.ts` (CREAR)
- `src/schemas/entidad.schema.ts` (EDITAR — quitar campos electorales, renombrar score)
- `src/schemas/fuente.schema.ts` (EDITAR — agregar fechaEvento, deprecar fechaFuente)
- `src/schemas/evaluacion.schema.ts` (EDITAR — agregar fechaEvento)
- `data/procesos.json` (CREAR)
- `data/candidaturas.json` (CREAR)
- `data/candidatos.json` (EDITAR — quitar campos electorales)
- `firestore.rules` (EDITAR — agregar 2 colecciones)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/migracion-candidaturas/SMEAC-A-schema-migracion-candidaturas.md` — modelo objetivo detallado
- `src/schemas/analisis-response.schema.ts` — referencia de estilo Zod del proyecto

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
  fechaCorte: z.string().describe("ISO 8601 date. Evaluaciones con fechaEvento <= este valor se incluyen en el snapshot del scoreCandidatura"),
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

  // Score snapshot (congelado por time-bounding)
  scoreCandidatura: z.number().min(1).max(6).nullable().describe("Mediana de evaluaciones donde fechaEvento <= proceso.fechaCorte"),
  evaluacionesCandidatura: z.number().int().min(0).describe("Total evaluaciones incluidas en el snapshot"),
});
export type Candidatura = z.infer<typeof CandidaturaSchema>;
```

### Paso 3: Editar `src/schemas/entidad.schema.ts`

Cambios:
- QUITAR: `EntidadRol` enum y su export de tipo
- QUITAR campos: `rol`, `partido`, `logoPartido`, `cargo`
- RENOMBRAR: `scoreActual` → `scoreHistorico` (mediana lifetime de TODAS las evaluaciones)
- RENOMBRAR: `totalEvaluaciones` → `totalEvaluacionesHistoricas`
- MANTENER: `id`, `nombre`, `foto`, `tipo` (enum "persona"|"organizacion"), `nombreLegal`, `dniRuc`, `region`, `bio`

**IMPORTANTE**: `EntidadTipo` se MANTIENE como `z.enum(["persona", "organizacion"])` — NO cambiar a literal.

Resultado esperado:
```typescript
import { z } from "zod/v4";

export const EntidadTipo = z.enum(["persona", "organizacion"]);
export type EntidadTipo = z.infer<typeof EntidadTipo>;

export const EntidadSchema = z.object({
  // Obligatorios
  id: z.string().describe("URL-safe slug: keiko-fujimori"),
  nombre: z.string().describe("Nombre público / comercial"),
  foto: z.string().describe("URL de foto o ruta local"),

  // Clasificación
  tipo: EntidadTipo.optional().describe("persona u organización"),

  // Opcionales
  nombreLegal: z.string().optional().describe("Nombre legal completo"),
  dniRuc: z.string().optional().describe("DNI o RUC"),
  region: z.string().optional().describe("Región de origen"),
  bio: z.string().optional().describe("Descripción breve"),

  // Score lifetime (calculado — mediana de TODAS las evaluaciones históricas)
  scoreHistorico: z.number().min(1).max(6).nullable().describe("Mediana Kohlberg de todas las evaluaciones, null si no hay"),
  totalEvaluacionesHistoricas: z.number().int().min(0).describe("Total de evaluaciones completadas en toda su historia"),
});

export type Entidad = z.infer<typeof EntidadSchema>;
```

### Paso 4: Editar `src/schemas/fuente.schema.ts`

Cambios:
- RENOMBRAR: `fechaFuente` → `fechaEvento` con `.describe()` actualizado
- Hacer `fechaEvento` required (no optional) — es necesario para el time-bounding
- MANTENER todo lo demás intacto (entidadId, url, tipo, etc.)

El campo `fechaEvento` representa **cuándo ocurrió el acto/declaración evaluado**, NO cuándo se guardó en BD (eso es `createdAt`).

### Paso 5: Editar `src/schemas/evaluacion.schema.ts`

Cambios:
- AGREGAR campo: `fechaEvento: z.string().describe("ISO 8601 date del acto evaluado — heredado de la fuente")`
- MANTENER todo lo demás intacto (entidadId, fuenteId, estadio, etc.)

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

La `fechaCorte` es el día de la primera vuelta (13 abril 2026). Todas las evaluaciones con `fechaEvento <= 2026-04-13` se incluyen en el snapshot.

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

- `scoreCandidatura` y `evaluacionesCandidatura` se ponen en null/0 porque sync-firestore los calculará
- Si un campo es undefined en el candidato original, omitirlo

### Paso 8: Editar `data/candidatos.json`

Quitar de cada objeto: `partido`, `logoPartido`, `rol`.
Mantener: `id`, `nombre`, `foto`, `tipo`.

**Nota:** NO agregar `scoreHistorico` ni `totalEvaluacionesHistoricas` al JSON — esos se calculan en sync-firestore.

### Paso 9: Actualizar `data/fuentes.json`

Renombrar `fechaFuente` → `fechaEvento` en todos los objetos.
Para fuentes que no tengan fecha: usar la fecha más temprana razonable (revisar si el título o ID contiene una fecha, ej: "2026-03-25").

### Paso 10: Actualizar `data/evaluaciones.json`

Agregar `fechaEvento` a cada evaluación. Lógica:
- Buscar la fuente correspondiente (por `fuenteId`) y copiar su `fechaEvento`
- Si la fuente no tiene fecha, usar el `createdAt` de la evaluación como fallback

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
- Build: `pnpm build` (NO ejecutar — el build fallará porque queries.ts y UI aún usan campos viejos. Eso lo arreglan otros agentes)

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. Los schemas compilan sin errores de sintaxis Zod
2. `data/candidaturas.json` tiene ~35 entries (una por candidato)
3. `data/candidatos.json` NO tiene campos `partido`, `logoPartido`, `rol`
4. `data/procesos.json` tiene 1 entry con `fechaCorte`
5. `data/fuentes.json` usa `fechaEvento` en vez de `fechaFuente`
6. `data/evaluaciones.json` tiene `fechaEvento` en cada entry
7. `firestore.rules` tiene las 2 nuevas reglas
8. `entidad.schema.ts` NO exporta `EntidadRol`, NO tiene campos `partido`, `logoPartido`, `rol`, `cargo`; usa `scoreHistorico` y `totalEvaluacionesHistoricas`
9. `fuente.schema.ts` tiene `fechaEvento` (required), no `fechaFuente`
10. `evaluacion.schema.ts` tiene `fechaEvento`
11. `candidatura.schema.ts` usa `scoreCandidatura` y `evaluacionesCandidatura` (NO `scoreActual`)
12. `proceso.schema.ts` tiene `fechaCorte`
13. `analisis-response.schema.ts` NO fue modificado
14. `git diff --stat` → solo archivos dentro del scope

### Si algo falla después de 3 enfoques distintos
Reportar bloqueo con: qué intentaste, qué falló, qué propones.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo paso a paso. Comienza.
