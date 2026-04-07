# Agente 0 — Test pre-migración: snapshot de integridad

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO editar data JSONs, schemas, features, firebase, firestore.rules
- NO instalar dependencias (usar `assert` nativo de Node)
- Tests co-ubicados: el test vive junto a lo que valida
- Leer CADA archivo antes de editarlo
- Código en inglés, comentarios mínimos

### Archivos protegidos (NO modificar)
- `src/*` (todo)
- `data/*` (todo — solo lectura)
- `firestore.rules`

### Límite de alcance
Tests de validación co-ubicados junto a los datos que verifican. Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
Crear `data/integrity.test.ts` (co-ubicado junto a los JSONs que valida) que verifica la integridad referencial y estructura de los datos ANTES de la migración. Este test es el safety net: si pasa, los datos están sanos para migrar. Si falla, hay corrupción que resolver primero.

### Criterio de éxito
- `npx tsx data/integrity.test.ts` ejecuta sin errores
- Valida estructura, conteos y relaciones entre las 3 colecciones
- Output claro: `✅ Pre-migración: N checks passed` o `❌ FALLÓ: [detalle]`

---

## SITUACIÓN (Contexto)

### Estado actual
- `data/candidatos.json` — 35 entidades con campos: id, nombre, foto, partido, logoPartido, tipo, rol
- `data/fuentes.json` — 276 fuentes con campo `fechaFuente` y FK `entidadId`
- `data/evaluaciones.json` — 272 evaluaciones con FK `entidadId` y `fuenteId`

### Archivos objetivo
- `data/integrity.test.ts` (CREAR — co-ubicado junto a los JSONs)

### Archivos de contexto (leer primero, NO editar)
- `data/candidatos.json` — estructura actual
- `data/fuentes.json` — estructura actual
- `data/evaluaciones.json` — estructura actual

---

## EJECUCIÓN (Método)

### Crear `scripts/test-integrity.ts`

Usar `node:assert/strict` para assertions. Cargar JSONs con `readFileSync`.

#### Checks obligatorios:

**Validación contra schemas Zod (fuente de verdad):**
- Importar `EntidadSchema` de `@/schemas/entidad.schema`
- Importar `FuenteSchema` de `@/schemas/fuente.schema`
- Importar `EvaluacionSchema` de `@/schemas/evaluacion.schema`
- Parsear CADA objeto del JSON con `Schema.safeParse()`. Si falla, reportar qué objeto y qué campo.
- Esto valida tipos, enums, campos requeridos/opcionales automáticamente — si el schema dice que `partido` es required, el test lo captura.

**Conteos (snapshot numérico):**
- Candidatos: exactamente 35
- Fuentes: exactamente 276
- Evaluaciones: exactamente 272

**Unicidad:**
- Cada colección tiene IDs únicos (sin duplicados)

**Integridad referencial:**
- Cada `fuente.entidadId` apunta a un candidato existente
- Cada `evaluacion.entidadId` apunta a un candidato existente
- Cada `evaluacion.fuenteId` apunta a una fuente existente

**Resumen de campos electorales (info, no assertion):**
- Contar cuántos candidatos tienen `partido`, `logoPartido`, `rol`
- Contar cuántas fuentes tienen `fechaFuente`
- Esto sirve como snapshot pre-migración para comparar después

#### Output esperado:

```
🔍 Test pre-migración — snapshot de integridad

📋 Candidatos: 35
   ✅ Estructura válida (id, nombre, foto, tipo, partido, rol)
   ✅ IDs únicos
   ✅ Todos tipo "persona"

📰 Fuentes: 276
   ✅ Estructura válida
   ✅ IDs únicos
   ✅ Integridad referencial: todas las entidadId existen
   ℹ️  N fuentes con fechaFuente, M sin fechaFuente

🧠 Evaluaciones: 272
   ✅ Estructura válida
   ✅ IDs únicos
   ✅ Integridad referencial: entidadId y fuenteId existen
   ✅ Estadios en rango [1, 6]

✅ Pre-migración: todos los checks pasaron
```

Si algo falla, usar `assert.strict` para que el error sea explícito con archivo y línea.

---

## APOYO (Recursos)

### Comandos
- Ejecutar: `npx tsx data/integrity.test.ts`

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `npx tsx data/integrity.test.ts` ejecuta y pasa todos los checks
2. El test NO modifica ningún archivo
3. El output es claro y legible
4. `git diff --stat` → solo `data/integrity.test.ts` como archivo nuevo

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar, aplica el Paso 2 (Eliminar):
1. Revisa lo que escribiste. Identifica:
   - Checks redundantes o que validan lo mismo dos veces
   - Abstracciones innecesarias (es un script simple, no un framework de testing)
   - Código defensivo para escenarios imposibles
2. Elimina al menos 1 elemento concreto
3. Si el script supera 200 LOC, simplificarlo
4. Verifica que sigue funcionando después de podar

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

**ACCIÓN INMEDIATA**: Lee los 3 JSONs para entender su estructura, luego crea el script. Comienza.
