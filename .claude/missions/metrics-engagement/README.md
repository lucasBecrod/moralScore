# Misión: Metrics & Engagement

> Sistema de métricas, likes condicionados y share viral para MoralScore.

## Brief

### Origen
Sesión de debate con 3 mentores (Growth, Sparring, Arquitecto) + validación
con usuarios reales del mercado peruano.

### Problema
MoralScore es read-only para el 99% de usuarios. No hay forma de:
- Saber si la gente consume la evidencia (no solo ve el score)
- Que los usuarios validen la evidencia con un like
- Compartir el score de un candidato con una tarjeta visual atractiva
- Trackear métricas básicas sin quemar presupuesto

### Descubrimiento del mercado
El JTBD emocional NO es "informarse". Es **ganar debates políticos con datos
empíricos**. Los usuarios quieren:
- Mandar la tarjeta de un candidato a WhatsApp para "humillar con datos"
- Subir videos de su candidato para "corregir" un score que consideran injusto
- Cuestionar si la IA tiene sesgo (señal de PMF, no problema a resolver)

### Growth Loop validado
```
Detractor comparte tarjeta OG en WhatsApp
  → Simpatizante ve score bajo de su candidato
  → Disonancia cognitiva: "eso está mal"
  → Entra a auditar la evidencia
  → Descubre que faltan fuentes
  → Sube nuevas fuentes para "arreglar" el score
  → Score se recalcula con más evidencia
  → Ciclo se repite
```

### NSM
**"Share-to-Upload Conversion Rate"**: % de shares que generan una nueva fuente
subida. Se mide con UTM params (?ref=share_wa|tw|copy) cruzado con fuentes
creadas por esos usuarios.

### Decisiones tomadas (Algoritmo de Musk aplicado)

| Eliminado | Por qué |
|-----------|---------|
| PostHog / GA4 / Mixpanel | Dependencia externa innecesaria en prototipo |
| Colección eventos/ por evento | Anti-patrón: Firestore cobra por write, un viral quema presupuesto |
| Comentarios | Riesgo de trolleo político >>> valor |
| Reportes estructurados | No crítico para validar PMF |
| Trust Score numérico | Fatiga cognitiva, score Kohlberg es protagonista |
| Sort por likes en ranking | Prematuro, nadie tiene likes aún |
| Dashboards de analytics | Script ad-hoc a fin de mes es suficiente |
| Distributed counters | Complejidad prematura, asumimos riesgo de contención |
| API routes para likes | Firebase SDK directo desde cliente |

| Sobrevivió | Por qué |
|------------|---------|
| OG Image dinámica (@vercel/og) | Growth loop principal, costo $0 |
| Likes condicionados | Engagement con fricción deliberada |
| Spine Pattern métricas | 1 doc/día, costo ~$0, sin SDK externo |
| Botones Share (WA, X, Copy) | Motor de adquisición viral |
| Link "Audita el algoritmo" | Transparencia agresiva contra acusaciones de sesgo |

### Riesgo arquitectónico abierto
El Arquitecto recomienda migrar deploy de Firebase App Hosting a Vercel para
que Satori (OG Image) corra en Edge Functions (ms) en vez de Cloud Functions
(cold start 3-5s). Si los crawlers de WhatsApp hacen timeout, el growth loop
muere. **La migración a Vercel es misión separada.**

---

## Dependencia

> **BLOQUEANTE**: Esta misión depende de que la misión `migracion-candidaturas`
> (reestructuración de colecciones Firestore) se complete primero.
> Los schemas y reglas de esta misión se construyen sobre la estructura
> resultante de esa migración.

---

## Agentes y orden de ejecución

```
┌─────────────────────────┐  ┌──────────────────────────────────┐
│ Agente A                │  │ Agente B                         │
│ OG Image + Meta Tags    │  │ Likes Data Layer + Spine Metrics │
│                         │  │ + Firestore Rules                │
│ Archivos:               │  │                                  │
│  /api/og/route.tsx (new)│  │ Archivos:                        │
│  /entidad/[id]/page.tsx │  │  like.schema.ts (new)            │
│                         │  │  track-metric.ts (new)           │
│ Dependencias: ninguna   │  │  entidad.schema.ts (mod)         │
│                         │  │  queries.ts (mod)                │
│                         │  │  firestore.rules (mod)           │
│                         │  │                                  │
│                         │  │ Dependencias: ninguna            │
└────────────┬────────────┘  └───────────────┬──────────────────┘
             │                               │
             │         PARALELOS             │
             └───────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │ Agente C                     │
              │ UI: Likes + Share + Auditar  │
              │                              │
              │ Archivos:                    │
              │  EntidadDetallePage.tsx (mod) │
              │  FuenteCard.tsx (mod)         │
              │  HistorialEvaluaciones.tsx    │
              │  EngagementBar.tsx (new)      │
              │  context.md (mod)             │
              │                              │
              │ Depende de: B                │
              └──────────────────────────────┘
```

**Independencia verificada**: A y B no comparten archivos → paralelos.
C depende de B (queries, schema, track-metric) → secuencial después de B.

## Archivos de misión

| Archivo | Agente | Alcance |
|---------|--------|---------|
| `SMEAC-A-og-image-meta-tags-share.md` | A | OG Image endpoint + meta tags dinámicos |
| `SMEAC-B-likes-schema-queries-rules-metrics.md` | B | Schemas + queries + rules + Spine metrics |
| `SMEAC-C-ui-likes-share-auditar.md` | C | UI de likes, share, auditar en entidad-detalle |

## Post-implementación

1. `pnpm build` debe compilar sin errores
2. Verificar OG image: `curl /api/og?id=keiko-fujimori` devuelve PNG
3. Verificar meta tags: inspeccionar HTML de /entidad/[id]
4. Verificar likes: toggle funciona, counter se actualiza
5. Verificar share: botones abren WhatsApp/Twitter, copian link
6. Deploy de firestore.rules actualizado
7. Commit + push a rama del feature
