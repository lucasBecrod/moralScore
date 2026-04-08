# Agente A — Fundación de Datos: Schemas V2 + Purgado + Gert + Fricción

> **Modelo**: sonnet
>
> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura de código, nombres internos, orden de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar lógica de negocio (no modificar `sync-firestore.ts`, no tocar `queries.ts`)
- NO crear archivos nuevos excepto si un archivo supera 150 LOC y necesita split
- NO agregar dependencias/librerías
- NO modificar data/*.json (la migración de datos es otra misión)
- NO tocar el prompt del evaluador (`prompt-agente.md`)
- NO usar media aritmética en ningún sitio — solo mediana

### Archivos protegidos (NO modificar)
- `scripts/sync-firestore.ts`
- `scripts/reconcile-scores.ts`
- `src/firebase/queries.ts`
- `.claude/skills/evaluador-kohlberg/references/prompt-agente.md`
- `data/*.json`

### Límite de alcance
Solo schemas Zod (`src/schemas/`) y configuración compartida (`src/shared/config/`). Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
**A**: Purgar campos muertos de los schemas de evaluación/análisis, agregar soporte para reglas de Gert, y crear el diccionario de pesos de fricción por tipo de fuente.

### Criterio de éxito
1. `pnpm build` exitoso (cero errores de TypeScript)
2. `AnalisisResponseSchema` tiene exactamente 4 campos: `estadio`, `justificacion`, `citas`, `reglaGert`, `gertCumplida` (5 campos, no más)
3. `EvaluacionSchema` refleja los mismos cambios (sin `confianza`, `estadioAlternativo`, `notas`)
4. `FuenteTipo` incluye los 4 nuevos tipos de evidencia material
5. Existe un `PESO_FRICCION` exportado como Record determinista
6. Existe un `TECHO_GERT` exportado como Record determinista
7. Ningún archivo supera 150 LOC

---

## SITUACIÓN (Contexto)

### Archivos objetivo (los que VAS a modificar)
- `src/schemas/analisis-response.schema.ts` — purgar + agregar Gert
- `src/schemas/evaluacion.schema.ts` — purgar + agregar Gert
- `src/schemas/fuente.schema.ts` — agregar nuevos tipos de fuente material
- `src/shared/config/kohlberg-stages.ts` — agregar `PESO_FRICCION` y `TECHO_GERT` aquí (o en un nuevo archivo `scoring-config.ts` en la misma carpeta si supera 150 LOC)

### Archivos de contexto (leer primero, NO editar)
- `.claude/CLAUDE.md` — convenciones del proyecto
- `src/schemas/candidatura.schema.ts` — referencia de cómo se estructura un schema
- `scripts/sync-firestore.ts` — para entender cómo se consumen los schemas (NO modificar)

### Estado actual del problema

**`AnalisisResponseSchema`** tiene 6 campos. 3 son basura:
- `confianza`: enum "alta/media/baja" — si no es alta, no debería guardarse. Eliminarlo.
- `estadioAlternativo`: number nullable — crea lógica condicional inútil. Eliminarlo.
- `notas`: string nullable — nadie las lee en producción. Eliminarlo.

**`EvaluacionSchema`** replica los mismos 3 campos basura. Purgarlos también.

**`FuenteTipo`** solo tiene tipos discursivos (youtube, articulo, entrevista, debate, mitin, conferencia, columna). Falta evidencia material: voto-congreso, ejecucion-presupuestal, sentencia-judicial, declaracion-jurada.

**No existe** un diccionario de pesos de fricción ni de techos de Gert.

---

## EJECUCIÓN (Método)

Flujo: **Refactor** — Verificar build pasa → Purgar → Agregar → Verificar build sigue pasando.

### Paso 1: Purgar `AnalisisResponseSchema`
Eliminar `confianza`, `estadioAlternativo`, `notas`. Debe quedar:
```typescript
export const AnalisisResponseSchema = z.object({
  estadio: z.number().int().min(1).max(6),
  justificacion: z.string(),
  citas: z.array(CitaSchema).min(1),
  reglaGert: z.enum([...]),    // nuevo
  gertCumplida: z.boolean(),   // nuevo
});
```

### Paso 2: Agregar `ReglaGert` enum
Crear el enum Zod con estos valores exactos:
```typescript
export const ReglaGert = z.enum([
  "cumplir-deber",       // Regla 10: ejecución presupuestal, asistencia
  "no-engañar",          // Regla 6: DJHV, transparencia
  "no-hacer-trampa",     // Regla 8: conflicto de interés
  "no-privar-libertad",  // Regla 4: leyes procrimen, impunidad
  "no-causar-dolor",     // Regla 3: negligencia con consecuencias
  "ninguna",             // Sin transgresión material detectada
]);
```
Ubicarlo en `evaluacion.schema.ts` junto a `CitaSchema` (ambos son tipos compartidos entre evaluación y análisis).

### Paso 3: Purgar `EvaluacionSchema`
Eliminar `confianza`, `estadioAlternativo`, `notas`. Agregar:
```typescript
reglaGert: ReglaGert.describe("Regla de Gert más relevante"),
gertCumplida: z.boolean().describe("true = cumplió, false = transgredió"),
```

### Paso 4: Extender `FuenteTipo`
Agregar 4 tipos de evidencia material:
```typescript
export const FuenteTipo = z.enum([
  // Discursivas (existentes)
  "youtube", "articulo", "entrevista", "debate", "mitin", "conferencia", "columna",
  // Materiales (nuevas)
  "voto-congreso", "ejecucion-presupuestal", "sentencia-judicial", "declaracion-jurada",
]);
```

### Paso 5: Crear diccionarios de scoring
En `src/shared/config/` (en `kohlberg-stages.ts` si cabe, o en `scoring-config.ts` si no):

```typescript
/** Peso de fricción por tipo de fuente. Determinista — nunca lo asigna el LLM. */
export const PESO_FRICCION: Record<string, number> = {
  "voto-congreso":          1.0,
  "ejecucion-presupuestal": 0.9,
  "sentencia-judicial":     0.9,
  "declaracion-jurada":     0.8,
  "debate":                 0.7,
  "entrevista":             0.4,
  "conferencia":            0.4,
  "youtube":                0.3,
  "articulo":               0.3,
  "columna":                0.3,
  "mitin":                  0.2,
};

/** Techo máximo de score si se transgrede una regla de Gert con evidencia dura. */
export const TECHO_GERT: Record<string, number> = {
  "no-privar-libertad": 1.5,
  "no-engañar":         2.0,
  "no-hacer-trampa":    2.0,
  "no-causar-dolor":    2.0,
  "cumplir-deber":      3.0,
  "ninguna":            6.0,
};

/** Solo fuentes con peso >= este umbral pueden activar el colapso de techo Gert. */
export const UMBRAL_EVIDENCIA_MATERIAL = 0.7;
```

### Principios del proyecto
- Schemas Zod con `.describe()` = tipos + validación + docs
- Código en inglés, comentarios solo cuando aportan valor
- Max 150 LOC por archivo .tsx, 200 LOC por archivo .ts
- No sobreingeniería: si un Record plano resuelve, no crear una clase

---

## APOYO (Recursos)

### Rutas
- Proyecto: `c:\Users\lucas\proyectos\moralScore`

### Comandos
- Build: `pnpm build`
- Dev (verificar tipos): `pnpm dev` (verificar que arranca sin errores de tipo)

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar, aplica el Paso 2 (Eliminar):
1. Revisa lo que escribiste. Identifica:
   - ¿Quedó algún `.describe()` redundante que repite el nombre del campo?
   - ¿Hay algún `.optional()` o `.nullable()` en los campos nuevos que no sea estrictamente necesario?
   - ¿Se creó algún type alias que solo se usa 1 vez?
2. Elimina al menos 1 elemento concreto
3. Si algún archivo supera 200 LOC, divídelo ahora
4. Verifica que `pnpm build` sigue pasando después de podar

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `pnpm build` → exitoso, cero errores TypeScript
2. Verificar que `AnalisisResponseSchema` tiene exactamente 5 campos (estadio, justificacion, citas, reglaGert, gertCumplida)
3. Verificar que `EvaluacionSchema` NO contiene `confianza`, `estadioAlternativo`, ni `notas`
4. Verificar que `FuenteTipo` incluye los 4 nuevos tipos materiales
5. Verificar que `PESO_FRICCION`, `TECHO_GERT` y `UMBRAL_EVIDENCIA_MATERIAL` están exportados
6. Verificar que archivos protegidos NO fueron modificados
7. `git diff --stat` → solo archivos dentro del scope (schemas + shared/config)

### Si algo falla después de 3 enfoques distintos
Reportar bloqueo con: qué intentaste, qué falló, qué propones.

### Errores de build esperables
- **Imports rotos**: Si algún componente en `src/features/` importa `confianza`, `estadioAlternativo` o `notas` de los schemas, el build fallará. En ese caso, busca con `grep` todos los consumidores, y elimina las referencias a esos campos. Esto está dentro del scope porque es consecuencia directa de la purga.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo. Comienza.
