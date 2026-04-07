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
Migrar la UI para usar candidaturas en el ranking y el registro, mientras el detalle sigue mostrando la entidad (persona) con su score lifetime.

### Criterio de éxito
- `pnpm build` pasa sin errores de tipos
- RankingPage usa `useCandidaturas()` en vez de `useEntidades()`
- EntidadCard acepta `Candidatura` como props
- EntidadDetallePage muestra partido/rol desde candidaturas (no desde entidad)
- RegistrarEntidadPage crea entidad + candidatura (partido/rol van a candidatura)
- API route `/api/entidad` ya no acepta `partido`, `cargo` en el body (esos van a candidatura)

---

## SITUACIÓN (Contexto)

### Estado actual
- `RankingPage.tsx` usa `useEntidades()` y renderiza `EntidadCard` con tipo `Entidad`
- `EntidadCard.tsx` desestructura `partido`, `logoPartido` directamente de `Entidad`
- `EntidadDetallePage.tsx` muestra `entidad.partido` y `entidad.logoPartido` directamente
- `RegistrarEntidadPage.tsx` envía `partido`, `rol`, `cargo` al API route como parte de la entidad
- API route `/api/entidad` acepta y pasa `partido`, `cargo` a `createEntidad()`

### Archivos objetivo
- `src/features/ranking/RankingPage.tsx` (EDITAR)
- `src/features/ranking/EntidadCard.tsx` (EDITAR)
- `src/features/entidad-detalle/EntidadDetallePage.tsx` (EDITAR)
- `src/features/registrar-entidad/RegistrarEntidadPage.tsx` (EDITAR)
- `src/app/api/entidad/route.ts` (EDITAR)

### Archivos de contexto (leer primero, NO editar)
- `.claude/missions/migracion-candidaturas/SMEAC-A-schema-migracion-candidaturas.md` — modelo objetivo
- `src/schemas/candidatura.schema.ts` — tipo Candidatura (creado por Agente A)
- `src/schemas/entidad.schema.ts` — tipo Entidad actualizado (modificado por Agente A, ya SIN partido/rol/cargo)
- `src/shared/hooks/useCandidaturas.ts` — hook de cache (creado por Agente B)
- `src/firebase/queries.ts` — queries disponibles (modificado por Agente B, incluye getCandidaturas, getCandidaturasByEntidad, getProcesoActivo)
- `src/shared/hooks/useEntidades.ts` — referencia de patrón de hook

### Pre-requisito
**Los Agentes A y B deben haber completado antes de ejecutar este agente.**

---

## EJECUCIÓN (Método)

### Paso 1: Editar `src/features/ranking/EntidadCard.tsx`

Cambiar el tipo de props de `Entidad` a `Candidatura`:

```typescript
import type { Candidatura } from "@/schemas/candidatura.schema";

interface EntidadCardProps {
  candidatura: Candidatura;
}

export function EntidadCard({ candidatura }: EntidadCardProps) {
  const { entidadId, nombre, partido, foto, logoPartido, scoreActual, totalEvaluaciones } = candidatura;
  // ...
  // El link va a /entidad/{entidadId} (la persona, NO el compound ID)
  <Link href={`/entidad/${entidadId}`} ...>
```

El resto de la lógica de zona/score/barra se mantiene igual.

### Paso 2: Editar `src/features/ranking/RankingPage.tsx`

Cambiar `useEntidades()` por `useCandidaturas()`:

```typescript
import { useCandidaturas } from "@/shared/hooks/useCandidaturas";
// Quitar: import { useEntidades } from "@/shared/hooks/useEntidades";

export function RankingPage() {
  const { candidaturas, loading } = useCandidaturas("presidenciales-2026");
  // ...
  // Donde antes decía entidades, ahora candidaturas
  // sorted = useMemo sobre candidaturas
  // EntidadCard recibe candidatura={c} en vez de entidad={e}
```

Los retratos del hero (`entidades.filter(e => e.foto)`) ahora usan `candidaturas.filter(c => c.foto)`.

### Paso 3: Editar `src/features/entidad-detalle/EntidadDetallePage.tsx`

La entidad ya NO tendrá `partido` ni `logoPartido`. Hay que obtenerlos de candidatura:

```typescript
import { getCandidaturasByEntidad } from "@/firebase/queries";
import type { Candidatura } from "@/schemas/candidatura.schema";

// En el state:
const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);

// En el useEffect, agregar a Promise.all:
getCandidaturasByEntidad(id)

// Determinar candidatura principal (proceso activo o la primera):
const candidaturaPrincipal = candidaturas[0] || null;

// En el header, reemplazar:
// entidad.partido → candidaturaPrincipal?.partido
// entidad.logoPartido → candidaturaPrincipal?.logoPartido
```

Si hay múltiples candidaturas (futuro), mostrar la primera como principal. No sobrediseñar timeline ahora.

**IMPORTANTE:** El score, foto y nombre siguen viniendo de `entidad` (la persona), NO de la candidatura. Solo `partido` y `logoPartido` vienen de candidatura.

### Paso 4: Editar `src/features/registrar-entidad/RegistrarEntidadPage.tsx`

El form ahora debe:
1. Crear la entidad (nombre, foto, tipo) via `/api/entidad`
2. Crear la candidatura (partido, rol) via `/api/candidatura` (o en el mismo endpoint)

**Opción simple (recomendada):** Expandir el endpoint `/api/entidad` para que también cree la candidatura. El body incluye `partido` y `rol` pero el route los separa:

- Entidad: `{ id, nombre, foto, tipo }`
- Candidatura: `{ id: slug_procesoId, entidadId: slug, procesoId, partido, rol, nombre, foto, scoreActual: null, totalEvaluaciones: 0 }`

Cambios en el form:
- Quitar el campo `cargo` del formulario (ya no existe en el schema)
- `partido` y `rol` se siguen capturando en el form, pero se envían al API como campos de candidatura

### Paso 5: Editar `src/app/api/entidad/route.ts`

El endpoint debe:
1. Crear la entidad (sin partido, rol, cargo)
2. Obtener el proceso activo
3. Si hay proceso activo, crear candidatura con partido y rol

```typescript
import { createEntidad, getProcesoActivo } from "@/firebase/queries";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/client";

// Input validation: separar campos de entidad vs candidatura
const CrearEntidadInput = z.object({
  nombre: z.string().min(1),
  foto: z.string().min(1),
  tipo: EntidadTipo.optional(),
  nombreLegal: z.string().optional(),
  dniRuc: z.string().optional(),
  region: z.string().optional(),
  bio: z.string().optional(),
  // Campos de candidatura (opcionales)
  partido: z.string().optional(),
  rol: z.string().optional(),
});

// En el handler:
// 1. Crear entidad sin partido/rol
// 2. Si hay proceso activo y hay partido o rol:
//    crear candidatura en Firestore directamente
```

**Nota:** `createEntidad` en queries.ts ya NO acepta `partido`, `rol`, `cargo` (el schema cambió). El API route debe crear la candidatura por separado usando `setDoc` directo.

---

## APOYO (Recursos)

### Rutas
- Proyecto: `c:\Users\lucas\proyectos\moralScore`

### Comandos
- Build: `pnpm build`
- Dev: `pnpm dev`

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `pnpm build` → exitoso, sin errores de tipos
2. No hay referencias a `entidad.partido`, `entidad.logoPartido`, `entidad.rol`, `entidad.cargo` en features/
3. RankingPage importa `useCandidaturas`, no `useEntidades`
4. EntidadCard recibe `Candidatura`, link va a `/entidad/{entidadId}`
5. EntidadDetallePage obtiene partido de candidaturas, no de entidad
6. RegistrarEntidadPage no envía `cargo` al API
7. Verificar que archivos protegidos no fueron modificados
8. `git diff --stat` → solo archivos dentro del scope

### Si algo falla después de 3 enfoques distintos
Reportar bloqueo con: qué intentaste, qué falló, qué propones.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto y los archivos objetivo, luego ejecuta el flujo paso a paso. Comienza.
