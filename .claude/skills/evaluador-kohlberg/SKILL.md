---
name: evaluador-kohlberg
description: >
  Flujo metodologico para evaluar candidatos politicos peruanos con el marco de
  desarrollo moral de Kohlberg (estadios 1-6). Buscar fuentes, evaluar razonamiento
  moral, aplicar correcciones anti-ventriloquismo, persistir en JSON y sincronizar
  a Firestore. Usar cuando: (1) se pida "oleada N", "evaluar candidato", "agregar
  evaluacion", "buscar fuente"; (2) se quiera conocer el estado de evaluaciones
  pendientes; (3) se necesite sincronizar datos a produccion.
---

# Evaluador Kohlberg — MoralScore

Flujo de 5 etapas para agregar evaluaciones de razonamiento moral a candidatos.

## Etapa 1: RECONOCIMIENTO

Obtener estado actual de evaluaciones:

```bash
cd /c/Users/lucas/proyectos/moralScore && node -e "
const e=require('./data/evaluaciones.json'), f=require('./data/fuentes.json'), c=require('./data/candidatos.json');
const counts={}; e.forEach(x=>{counts[x.entidadId]=(counts[x.entidadId]||0)+1});
c.map(x=>({id:x.id,name:x.nombre,n:counts[x.id]||0,scores:e.filter(v=>v.entidadId===x.id).map(v=>v.estadio).join(',')}))
 .filter(x=>x.n<10).sort((a,b)=>a.n-b.n)
 .forEach(x=>console.log(x.n+' | '+x.scores+' | '+x.id));
console.log('Total evals:', e.length, '| Total fuentes:', f.length);
"
```

Para ver temas cubiertos de un candidato:
```bash
node -e "
const e=require('./data/evaluaciones.json'), f=require('./data/fuentes.json');
const id='CANDIDATO-ID-AQUI';
e.filter(x=>x.entidadId===id).forEach(x=>{
  const fu=f.find(y=>y.id===x.fuenteId);
  console.log('E'+x.estadio, '|', fu?.titulo || x.fuenteId);
});
"
```

Priorizar candidatos con menos evaluaciones.

## Etapa 2: BUSQUEDA

Lanzar agente haiku (model: haiku) por candidato para buscar UNA fuente nueva.

Ver [references/prompt-agente.md](references/prompt-agente.md) para el template completo del prompt.

Instrucciones clave para el agente:
- WebSearch con nombre del candidato + 2025/2026
- NO repetir temas ya cubiertos
- Resaltado inline: `**negritas**` en citas.texto y justificacion
- Indicador con formato: "Descripcion del mecanismo -- Estadio N"
- Incluir scores previos para calibracion

**Modo progresivo**: un agente a la vez si tokens limitados. Max 4 en paralelo si hay holgura.

## Etapa 3: EVALUACION

Revisar JSON devuelto. Verificar:
- entidadId correcto (slug completo, no abreviado)
- fuenteId con formato: `{entidadId}-{YYYY-MM-DD}-{medio}`
- Citas en espanol (no traducidas al ingles)
- Estadio coherente con scores previos
- Negritas solo en frases que revelan mecanismo retorico

## Etapa 4: SUPERVISION ANTI-VENTRILOQUISMO

Leer [references/anti-ventriloquismo.md](references/anti-ventriloquismo.md) para patrones.

Regla de oro: **ante la duda, asignar el estadio MAS BAJO**.

Correcciones frecuentes (haiku infla ~25% de los scores):
- "Cadena perpetua" / "pena de muerte" / "expulsion 48h" = E1-2, nunca 4
- "Muerte civil" sin justificacion etica = E2-3
- "Zar anticorrupcion" (solucion personalista) = E3, no 4
- Propuestas presupuestarias sin equidad = E2
- Defensa de instituciones por utilidad, no principio = E4, no 5
- Perdones performativos en debate = no elevan estadio

Registrar correcciones: `haiku asigno X, corregido a Y porque [razon]`.

## Etapa 5: PERSISTENCIA

### 5a. Agregar a JSONs

Ver [references/formato-evaluacion.md](references/formato-evaluacion.md) para schemas completos.

Agregar evaluacion a `data/evaluaciones.json` y fuente a `data/fuentes.json`.

Para batches grandes, crear script temporal `scripts/add-oleadaN.js` que pushee al array. Eliminar despues.

### 5b. Commit y push

```bash
git add data/evaluaciones.json data/fuentes.json
git commit -m "feat(data): oleada N -- M evaluaciones, K candidatos"
git push origin main
```

### 5c. Sincronizar Firestore

```bash
npx tsx scripts/sync-firestore.ts
```

Recalcula scores (mediana decimal) y solo escribe cambios.

### 5d. Reconciliar (si se hizo seed directo)

```bash
npx tsx --env-file=.env.local scripts/reconcile-scores.ts
```

## Convenciones

- 1 oleada = 1 evaluacion nueva por candidato pendiente
- Meta: 10 evaluaciones por candidato
- Candidatos estables (mismo score en 7+ evals) pueden cerrarse antes
- Commits: `feat(data): oleada N -- descripcion`
- Codigo en ingles, contenido evaluaciones en espanol
