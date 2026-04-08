# MoralScore — Memoria Operativa

> Plataforma web que asigna scores de razonamiento moral (Kohlberg 1-6)
> a candidatos políticos peruanos. Elecciones 2026.

## Estado

| Campo | Valor |
|-------|-------|
| Etapa | Prototipo |
| Stack | Next.js 15, TypeScript, Tailwind 4, Firebase/Firestore |
| Deploy | Firebase App Hosting |
| Candidatos | 35 presidenciales (seed del JNE) |

## Arquitectura

- **VSA**: features/ son slices autónomos. Cada feature = carpeta independiente.
- **app/ es thin**: solo routing, importa de features/
- **schemas/ es contrato**: Zod schemas con .describe() = tipos + validación + docs
- **firebase/**: client.ts (client SDK). Sin admin SDK en prod.
- **docs/transparencia/**: prompts y criterios en markdown, publicados como páginas web
- **docs/fundacional/**: investigaciones y documento maestro del proyecto
- **scripts/**: seed, cache de imágenes, scraping JNE

## Flujo del Sistema

```
Web pública → usuario ve candidatos con scores → click → fuentes evaluadas
Botón [+] → sube URL → Firestore (estado: pendiente)
Filtro IA calidad → aprueba/rechaza
Validación humana → score publicado con evidencia
```

## Rutas

| Ruta | Feature |
|------|---------|
| `/` | ranking — lista candidatos + scores |
| `/entidad/[id]` | entidad-detalle — score + fuentes + botón [+] |
| `/registrar` | registrar-entidad — form para agregar candidato |
| `/metodologia` | metodologia — marco teórico + transparencia |
| `/docs/[slug]` | docs estáticos — prompts y criterios (SSG) |
| `/api/fuente` | POST: guardar URL en Firestore |
| `/api/entidad` | POST: registrar nueva entidad |

## Estructura de Archivos

```
docs/
  fundacional/     — proyecto.md, investigaciones
  transparencia/   — prompts, rúbricas, criterios (fuente de verdad)
public/docs/       — copia de transparencia/ para servir estáticamente
scripts/           — seed-candidatos.ts, cache-images.ts, scrape-jne-urls.ts
src/features/      — VSA slices
src/schemas/       — Zod schemas
src/firebase/      — client SDK + queries
```

## Convenciones

- Idioma código: inglés. Contenido UI: español (decir "candidato", no "entidad").
- Schemas: todo dato que cruza límites pasa por Zod.
- Colores Kohlberg: definidos en shared/config/kohlberg-stages.ts
- context.md: cada feature tiene uno. Leerlo antes de editar.
- Componentes: max 150 LOC. Si crece, extraer sub-componente.
- features/ NUNCA importa de otro feature/. Solo de shared/ y schemas/.
- Dark mode only. Sin modo claro.

## Colecciones Firestore

- `entidades/{id}` — datos del candidato + scoreActual + logoPartido
- `fuentes/{id}` — URLs subidas, estado (pendiente|aprobada|rechazada|evaluada)
- `evaluaciones/{id}` — resultados análisis Kohlberg con citas

## Comandos

```
pnpm dev                                                    # desarrollo
pnpm build                                                  # build producción
npx tsx scripts/seed-candidatos.ts                          # seed/actualizar candidatos
npx tsx scripts/cache-images.ts                             # descargar fotos del JNE
npx tsx --env-file=.env.local scripts/sync-firestore.ts      # sync data/*.json → Firestore + recalcular scores
```
