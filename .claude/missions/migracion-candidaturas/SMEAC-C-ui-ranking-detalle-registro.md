# Agente C — UI: ranking, detalle, registro, API route

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar schemas, data JSONs, scripts, firestore.rules
- NO tocar `src/firebase/queries.ts`, `src/shared/hooks/useEntidades.ts`
- Leer CADA archivo antes de editarlo
- Código en inglés, contenido UI en español
- Dark mode only, Tailwind
- Componentes max 150 LOC — si crece, extraer sub-componente
- features/ NUNCA importa de otro feature/. Solo de shared/ y schemas/

### Archivos protegidos (NO modificar)
- `src/schemas/*`
- `data/*`
- `scripts/*`
- `firestore.rules`
- `src/firebase/queries.ts`
- `src/shared/hooks/useEntidades.ts`
- `src/features/subir-fuente/*`
- `src/features/metodologia/*`
- `src/features/entidad-detalle/FuenteCard.tsx`
- `src/features/entidad-detalle/HistorialEvaluaciones.tsx`

### Límite de alcance
Componentes UI de ranking, detalle, registro, y el API route de entidad. Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
Migrar la UI para usar candidaturas en el ranking y el registro, mientras el detalle sigue mostrando la entidad (persona) con su score lifetime. Adaptar a los nuevos nombres de campo. **Al final, `pnpm build` debe pasar sin errores.**

### Criterio de éxito
- `pnpm build` pasa sin errores de tipos
- RankingPage usa `useCandidaturas()` en vez de `useEntidades()`
- EntidadCard acepta `Candidatura` y usa `scoreCandidatura`/`evaluacionesCandidatura`
- EntidadDetallePage muestra partido desde candidaturas, score desde `entidad.scoreHistorico`
- RegistrarEntidadPage crea entidad + candidatura
- API route `/api/entidad` separa campos entidad vs candidatura
- No quedan referencias a `scoreActual`, `totalEvaluaciones`, `entidad.partido`, `entidad.logoPartido` en features/
- `fechaFuente` → `fechaEvento` en componentes que lo renderizan

---

## SITUACIÓN (Contexto)

### Principios de diseño

1. **Ranking muestra candidaturas.** Cada tarjeta es una candidatura (partido, logo, scoreCandidatura desnormalizados). Link va a `/entidad/{entidadId}`.
2. **Detalle muestra la entidad (persona).** Score principal = `scoreHistorico` (lifetime). Partido/rol de candidatura.
3. **Nombres de campo nuevos:**
   - Entidad: `scoreHistorico`, `totalEvaluacionesHistoricas`
   - Candidatura: `scoreCandidatura`, `evaluacionesCandidatura`
   - Fuente: `fechaEvento` (no `fechaFuente`)

### Estado actual
- `RankingPage.tsx` usa `useEntidades()` y renderiza `EntidadCard` con tipo `Entidad`
- `EntidadCard.tsx` desestructura `partido`, `logoPartido`, `scoreActual`, `totalEvaluaciones`
- `EntidadDetallePage.tsx` muestra `entidad.partido`, `entidad.logoPartido`, `entidad.scoreActual`
- `RegistrarEntidadPage.tsx` envía `partido`, `rol`, `cargo` como parte de la entidad
- `HistorialEvaluaciones.tsx` y `FuenteCard.tsx` usan `fechaFuente`

### Archivos objetivo
- `src/features/ranking/RankingPage.tsx` (EDITAR)
- `src/features/ranking/EntidadCard.tsx` (EDITAR)
- `src/features/entidad-detalle/EntidadDetallePage.tsx` (EDITAR)
- `src/features/registrar-entidad/RegistrarEntidadPage.tsx` (EDITAR)
- `src/app/api/entidad/route.ts` (EDITAR)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/migracion-candidaturas/SMEAC-A-schema-migracion-candidaturas.md` — modelo objetivo
- `src/schemas/candidatura.schema.ts` — tipo Candidatura (Agente A)
- `src/schemas/entidad.schema.ts` — tipo Entidad actualizado (Agente A)
- `src/shared/hooks/useCandidaturas.ts` — hook de cache (Agente B)
- `src/firebase/queries.ts` — queries disponibles (Agente B)

### Pre-requisito
**Los Agentes A y B deben haber completado.**

---

## EJECUCIÓN (Método)

### Paso 1: Editar `src/features/ranking/EntidadCard.tsx`

Cambiar tipo de props de `Entidad` a `Candidatura`:

```typescript
import type { Candidatura } from "@/schemas/candidatura.schema";

interface EntidadCardProps {
  candidatura: Candidatura;
}

export function EntidadCard({ candidatura }: EntidadCardProps) {
  const { entidadId, nombre, partido, foto, logoPartido, scoreCandidatura, evaluacionesCandidatura } = candidatura;
  // scoreActual → scoreCandidatura
  // totalEvaluaciones → evaluacionesCandidatura
  // Link: /entidad/${entidadId} (la persona, NO el compound ID)
```

### Paso 2: Editar `src/features/ranking/RankingPage.tsx`

```typescript
import { useCandidaturas } from "@/shared/hooks/useCandidaturas";
// Quitar: import { useEntidades }

export function RankingPage() {
  const { candidaturas, loading } = useCandidaturas("presidenciales-2026");
  // sorted = useMemo sobre candidaturas
  // Sort "evidencia": evaluacionesCandidatura desc
  // Sort "score": scoreCandidatura desc (nulls al final)
  // EntidadCard recibe candidatura={c}
```

### Paso 3: Editar `src/features/entidad-detalle/EntidadDetallePage.tsx`

La entidad ya NO tiene `partido` ni `logoPartido`. Obtenerlos de candidatura:

```typescript
import { getCandidaturasByEntidad } from "@/firebase/queries";
import type { Candidatura } from "@/schemas/candidatura.schema";

// State:
const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);

// En Promise.all agregar: getCandidaturasByEntidad(id)

// Candidatura principal:
const candidaturaPrincipal = candidaturas[0] || null;

// Header:
// entidad.partido → candidaturaPrincipal?.partido
// entidad.logoPartido → candidaturaPrincipal?.logoPartido
// entidad.scoreActual → entidad.scoreHistorico
// entidad.totalEvaluaciones → entidad.totalEvaluacionesHistoricas
```

**IMPORTANTE**: Score, foto y nombre del detalle vienen de `entidad`, NO de candidatura. Solo partido y logoPartido vienen de candidatura.

**TAMBIÉN**: Donde se mapean evaluaciones para HistorialEvaluaciones y se referencia `fechaFuente`, cambiar a `fechaEvento`. Verificar las interfaces de los sub-componentes.

**ATENCIÓN**: `HistorialEvaluaciones.tsx` y `FuenteCard.tsx` están protegidos (NO modificar). Si la interface que usan espera `fechaFuente`, el mapeo en EntidadDetallePage debe adaptar el nombre:

```typescript
// Si HistorialEvaluaciones espera fechaFuente, mapear:
fuente: { ...fuente, fechaFuente: fuente.fechaEvento }
// O si puedes cambiar la interface del tipo local en EntidadDetallePage, hazlo ahí.
```

Lee los componentes protegidos para entender qué interfaz esperan y adapta el mapeo.

### Paso 4: Editar `src/features/registrar-entidad/RegistrarEntidadPage.tsx`

- Quitar campo `cargo` del formulario (ya no existe en schema)
- `partido` y `rol` se capturan en el form pero se envían al API que los separa
- El tipo `FormData` ya no necesita `cargo`

### Paso 5: Editar `src/app/api/entidad/route.ts`

El endpoint debe:
1. Crear la entidad (sin partido, rol, cargo) con `scoreHistorico: null, totalEvaluacionesHistoricas: 0`
2. Si hay partido o rol, obtener proceso activo y crear candidatura

```typescript
import { getProcesoActivo } from "@/firebase/queries";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/client";

// En el handler, después de crear entidad:
if (partido || rol) {
  const procesoActivo = await getProcesoActivo();
  if (procesoActivo) {
    const candidaturaId = `${slug}_${procesoActivo.id}`;
    await setDoc(doc(db, "candidaturas", candidaturaId), {
      id: candidaturaId,
      entidadId: slug,
      procesoId: procesoActivo.id,
      partido, logoPartido: undefined, rol,
      nombre, foto,
      scoreCandidatura: null,
      evaluacionesCandidatura: 0,
    });
  }
}
```

### Paso 6: Verificar que no quedan referencias viejas

Buscar en `src/features/` y `src/app/`:
```bash
grep -rn "scoreActual\|totalEvaluaciones\|fechaFuente\|entidad\.partido\|entidad\.logoPartido\|entidad\.rol\|entidad\.cargo" src/features/ src/app/
```

Si hay hits fuera de archivos protegidos, corregirlos.

---

## APOYO (Recursos)

### Comandos
- Build: `pnpm build`
- Dev: `pnpm dev`

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `pnpm build` → exitoso, sin errores de tipos
2. No hay referencias a `scoreActual`, `totalEvaluaciones` (nombres viejos) en features/ ni app/
3. No hay `entidad.partido`, `entidad.logoPartido`, `entidad.rol`, `entidad.cargo` en features/
4. RankingPage importa `useCandidaturas`, no `useEntidades`
5. EntidadCard recibe `Candidatura`, link va a `/entidad/{entidadId}`
6. EntidadDetallePage obtiene partido de candidaturas, score de `entidad.scoreHistorico`
7. RegistrarEntidadPage no envía `cargo`
8. API route crea candidatura si hay partido/rol
9. Archivos protegidos no fueron modificados
10. `git diff --stat` → solo archivos dentro del scope

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar, aplica el Paso 2 (Eliminar):
1. Revisa lo que escribiste. Identifica:
   - Props que se pasan pero no se usan
   - Estados intermedios innecesarios
   - Código defensivo para escenarios imposibles
2. Elimina al menos 1 elemento concreto
3. Si algún componente supera 150 LOC, extraer sub-componente
4. Verifica que `pnpm build` sigue pasando después de podar

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto y los archivos objetivo, luego ejecuta el flujo paso a paso. Comienza.
