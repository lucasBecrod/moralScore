# SMEAC-A: Migración de modelo de datos — separar entidad de candidatura

## Situación

MoralScore evalúa el razonamiento moral de ENTIDADES (personas u organizaciones) usando Kohlberg (estadios 1-6). El score es de la **entidad**, no de una candidatura. Actualmente la colección `entidades` mezcla datos de la persona (nombre, foto, score) con datos electorales (partido, rol, logoPartido). Esto impide:

- Mostrar un candidato en múltiples procesos electorales
- Filtrar por tipo de elección (presidenciales, regionales, municipales)
- Mantener historial cuando un candidato cambia de partido
- Evaluar entidades no-electorales (Bukele, el Papa, organizaciones)

**Datos actuales:** 35 entidades, 276 fuentes, 272 evaluaciones, 70 imágenes en Storage.

### Principios de diseño (consenso equipo + arquitecto)

1. **El score es de la ENTIDAD.** Kohlberg mide desarrollo moral a lo largo de la vida. Una candidatura es un rol temporal.
2. **Entidad es agnóstica.** `tipo: "persona" | "organizacion"`. No toda entidad participa en procesos electorales.
3. **Fuentes y evaluaciones → entidadId.** NUNCA a candidaturaId. Permite evaluar cualquier entidad sin hacks.
4. **Time-bounding para snapshots (P3: Inmutabilidad Histórica).** `scoreCandidatura = mediana(evaluaciones WHERE fechaEvento <= proceso.fechaCorte)`. Congela el score sin mutar datos.
5. **fechaEvento ≠ createdAt.** `fechaEvento` = cuándo ocurrió el acto. `createdAt` = cuándo se guardó en BD.
6. **Growth (likes, shares) es misión separada.** No mezclar aquí.

## Modelo objetivo

```
entidades/{id}          ← persona u organización + lifetime score
  id: "keiko-sofia-fujimori-higuchi"
  nombre: "Keiko Sofía Fujimori Higuchi"
  foto: "https://storage.googleapis.com/..."
  tipo: "persona"
  scoreHistorico: 3          // mediana de TODAS sus evaluaciones (lifetime)
  totalEvaluacionesHistoricas: 10
  // SIN partido, SIN rol, SIN logoPartido, SIN cargo

candidaturas/{id}       ← relación entidad-proceso (compound ID)
  id: "keiko-sofia-fujimori-higuchi_presidenciales-2026"
  entidadId: "keiko-sofia-fujimori-higuchi"
  procesoId: "presidenciales-2026"
  partido: "Fuerza Popular"
  logoPartido: "https://storage.googleapis.com/..."
  rol: "presidente"
  // Desnormalización para renderizar tarjeta en 1 lectura:
  nombre: "Keiko Sofía Fujimori Higuchi"
  foto: "https://storage.googleapis.com/..."
  // Snapshot congelado por time-bounding:
  scoreCandidatura: 3        // mediana(evals WHERE fechaEvento <= proceso.fechaCorte)
  evaluacionesCandidatura: 8

procesos/{id}           ← tipo de elección
  id: "presidenciales-2026"
  nombre: "Elecciones Generales 2026"
  tipo: "nacional"      // nacional | regional | municipal
  activa: true
  fechaCorte: "2026-04-13"  // fecha de la primera vuelta

fuentes/{id}            ← apuntan a entidadId (SIN CAMBIO de FK)
  entidadId: "keiko-sofia-fujimori-higuchi"
  fechaEvento: "2026-03-25"  // NUEVO — cuándo ocurrió el acto (renombrado de fechaFuente)
  // ... resto igual

evaluaciones/{id}       ← apuntan a entidadId (SIN CAMBIO de FK)
  entidadId: "keiko-sofia-fujimori-higuchi"
  fechaEvento: "2026-03-25"  // NUEVO — heredado de la fuente
  // ... resto igual
```

### Cómo funciona el time-bounding

```
Keiko tiene 10 evaluaciones totales:
  - 8 con fechaEvento <= 2026-04-13 (antes de primera vuelta)
  - 2 con fechaEvento > 2026-04-13 (después)

scoreHistorico (entidad) = mediana(10 evaluaciones) = 3.0
scoreCandidatura (presidenciales-2026) = mediana(8 evaluaciones) = 3.0

En 2030, si tiene 5 evaluaciones nuevas:
scoreHistorico = mediana(15 evaluaciones) = 3.2 (cambia)
scoreCandidatura 2026 = mediana(8 evaluaciones) = 3.0 (CONGELADO — no recalcula procesos inactivos)
```

## Misión

Migrar el modelo de datos, actualizar JSONs, scripts, queries y UI. Dividida en 3 agentes:

## Ejecución

### Fase 1 (Agente A): Schemas + Data JSONs + Firestore Rules

**Crear:**
- `src/schemas/proceso.schema.ts` — con `fechaCorte`
- `src/schemas/candidatura.schema.ts` — con `scoreCandidatura`, `evaluacionesCandidatura`
- `data/procesos.json` — 1 proceso (presidenciales-2026, fechaCorte: 2026-04-13)
- `data/candidaturas.json` — ~35 candidaturas generadas de candidatos.json

**Editar:**
- `src/schemas/entidad.schema.ts` — quitar partido/logoPartido/rol/cargo, renombrar scoreActual→scoreHistorico, totalEvaluaciones→totalEvaluacionesHistoricas
- `src/schemas/fuente.schema.ts` — renombrar fechaFuente→fechaEvento (required)
- `src/schemas/evaluacion.schema.ts` — agregar fechaEvento
- `data/candidatos.json` — quitar partido/logoPartido/rol
- `data/fuentes.json` — renombrar fechaFuente→fechaEvento
- `data/evaluaciones.json` — agregar fechaEvento (copiar de fuente correspondiente)
- `firestore.rules` — agregar candidaturas y procesos

### Fase 2 (Agente B): sync-firestore + queries + hook

**Editar:**
- `scripts/sync-firestore.ts` — sync 5 colecciones, recálculo con time-bounding
- `src/firebase/queries.ts` — agregar getCandidaturas, getCandidaturaById, getCandidaturasByEntidad, getProcesoActivo; actualizar nombres de campo

**Crear:**
- `src/shared/hooks/useCandidaturas.ts` — cache stale-while-revalidate

### Fase 3 (Agente C): UI

**Editar:**
- `RankingPage.tsx` — useCandidaturas() en vez de useEntidades()
- `EntidadCard.tsx` — recibe Candidatura, usa scoreCandidatura
- `EntidadDetallePage.tsx` — partido de candidatura, score de entidad.scoreHistorico
- `RegistrarEntidadPage.tsx` — crea entidad + candidatura
- `src/app/api/entidad/route.ts` — separa campos entidad vs candidatura

## Criterio de éxito
1. `pnpm build` pasa sin errores
2. Ranking muestra candidaturas (con partido, logo, scoreCandidatura desnormalizados)
3. Detalle muestra scoreHistorico (lifetime) + fuentes + evaluaciones (vía entidadId)
4. Crear candidato desde form crea entidad + candidatura
5. `./init.sh` seedea las 5 colecciones correctamente
6. Datos de fuentes/evaluaciones NO fueron migrados (solo se agregó fechaEvento)

## Restricciones
- NO romper fuentes ni evaluaciones — siguen apuntando a entidadId
- El score es de la ENTIDAD (persona u organización), no de la candidatura
- La candidatura desnormaliza score como snapshot congelado (time-bounded)
- Código en inglés, UI en español
- Dark mode only, Tailwind, componentes max 150 LOC
- Lee CADA archivo antes de editarlo
- Growth (likes, shares) = misión separada, NO mezclar

## Orden de ejecución
1. **Agente A**: Schemas + Data JSONs + Rules (sin dependencias)
2. **Agente B**: Sync + Queries + Hook (depende de A)
3. **Agente C**: UI (depende de A y B)
4. `pnpm build` → test → commit
