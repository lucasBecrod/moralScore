# Misión: Migración de candidaturas

> Separar "persona" de "candidatura electoral" en el modelo de datos.
> Habilitar time-bounding, múltiples procesos electorales, entidades no-electorales.

## Flujo de ejecución

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
 Test     Data     Sync      UI      Emulador  Prod
 pre      +Schema  +Queries          +Build    (tras
 migr.    +Rules   +Hook             +Visual    aprobación)
```

### Fase 0 — Test pre-migración
- **Agente 0**: `SMEAC-0-test-pre-migracion.md`
- Crea `data/integrity.test.ts` — valida JSONs contra schemas Zod, integridad referencial
- Criterio: `npx tsx data/integrity.test.ts` pasa

### Fase 1 — Schemas + Data + Rules
- **Agente A**: `SMEAC-A-schemas-data-rules.md`
- Crea schemas `proceso`, `candidatura`
- Transforma JSONs (quitar campos electorales de entidades, crear candidaturas.json)
- `fechaFuente` → `fechaEvento`
- Firestore rules para 2 nuevas colecciones
- **Depende de**: Fase 0

### Fase 2 — Sync + Queries + Hook
- **Agente B**: `SMEAC-B-sync-queries-hook.md`
- Fix sync: `set()` sin merge (elimina campos huérfanos de Firestore)
- Sync 5 colecciones + recálculo time-bounded
- Queries nuevas + nombres actualizados
- Hook `useCandidaturas`
- **Depende de**: Fase 1

### Fase 3 — UI
- **Agente C**: `SMEAC-C-ui-ranking-detalle-registro.md`
- Ranking → candidaturas, Detalle → entidad + candidatura, Registro → crea ambas
- `pnpm build` debe pasar
- **Depende de**: Fases 1 y 2

### Fase 4 — Validación en emulador
Ejecutar manualmente (no es un agente):

```bash
# 1. Levantar emulador
firebase emulators:start

# 2. Seed contra emulador
FIRESTORE_EMULATOR_HOST=localhost:8080 npx tsx scripts/sync-firestore.ts

# 3. Test post-migración
npx tsx data/integrity.test.ts

# 4. Build
pnpm build

# 5. Dev — verificación visual
pnpm dev
```

Checklist visual:
- [ ] Ranking muestra candidaturas con partido, logo, scoreCandidatura
- [ ] Click en tarjeta → detalle con scoreHistorico (lifetime)
- [ ] Detalle muestra partido/logo desde candidatura
- [ ] Fuentes y evaluaciones intactas
- [ ] Registrar candidato crea entidad + candidatura

### Fase 5 — Seed a producción (tras aprobación de Lucas)

```bash
npx tsx --env-file=.env.local scripts/sync-firestore.ts
```

Idempotente: `set()` sin merge reemplaza docs completos, eliminando campos huérfanos.

## Documento de referencia

`SMEAC-A-schema-migracion-candidaturas.md` — modelo objetivo detallado con ejemplos de time-bounding. NO es una orden ejecutable, es contexto para los agentes.

## Todo va en 1 PR único a develop
