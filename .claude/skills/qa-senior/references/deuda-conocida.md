# Deuda Tecnica Conocida

Archivos con deuda tecnica documentada. El QA Senior NO debe reportar hallazgos sobre estos archivos a menos que el PR introduzca problemas NUEVOS en ellos.

Si un archivo de esta lista aparece en el diff, solo auditar las lineas que cambiaron (+), no el archivo completo.

## API (`src/app/api/`)

- **`fuente/route.ts`** — `userId` se recibe del body sin verificación server-side (no hay admin SDK en prod). Riesgo bajo: las fuentes quedan en estado "pendiente" y hay rate limit por IP. Resolver cuando se implemente flujo de identidad real.

## Frontend (`src/`)

- **`entidad-detalle/EntidadDetallePage.tsx`** — 358 LOC (límite: 150). Lógica de `transgresionDominante`, `redeemed`, sorting de evals es extraíble a un hook.

## Scripts (`scripts/`)

Sin deuda documentada actualmente.

---

> Actualizar esta lista cuando se documente nueva deuda tecnica.
> Cuando se resuelva deuda (refactor), eliminar de esta lista.
