# MoralScore — Memoria Operativa

> Plataforma web que asigna scores de razonamiento moral (Kohlberg 1-6)
> a candidatos políticos peruanos. Elecciones 2026.

## Estado

| Campo | Valor |
|-------|-------|
| Etapa | Prototipo |
| Autores | Lucas (Economista) + Lady (Psicóloga) |
| Stack | Next.js 15, TypeScript, Tailwind 4, Firebase/Firestore |
| Deploy | Vercel |
| Candidatos | 4 iniciales |

## Arquitectura

- **VSA**: features/ son slices autónomos. Cada feature = carpeta independiente.
- **app/ es thin**: solo routing, importa de features/
- **schemas/ es contrato**: Zod schemas con .describe() = tipos + validación + docs
- **firebase/**: client.ts (client SDK) y admin.ts (server SDK)
- **prompts/ es versionado**: system prompt y criterios en markdown, no en código

## Flujo del Sistema

```
Web pública → usuario ve candidatos con scores → click → fuentes evaluadas
Botón [+] → sube URL → Firestore (estado: pendiente)
Filtro IA calidad → aprueba/rechaza
Local: Lucas/Lady abren URL → analizan con Claude Code → suben score a Firestore
```

## Rutas

| Ruta | Feature |
|------|---------|
| `/` | ranking — lista candidatos + scores |
| `/candidato/[id]` | candidato-detalle — score + fuentes + botón [+] |
| `/metodologia` | metodologia — marco teórico Kohlberg |
| `/api/fuente` | POST: guardar URL en Firestore |

## Convenciones

- Idioma código: inglés. Contenido UI: español.
- Schemas: todo dato que cruza límites pasa por Zod.
- Colores Kohlberg: definidos en shared/config/kohlberg-stages.ts
- context.md: cada feature tiene uno. Leerlo antes de editar.
- Componentes: max 150 LOC. Si crece, extraer sub-componente.
- features/ NUNCA importa de otro feature/. Solo de shared/ y schemas/.

## Colecciones Firestore

- `candidatos/{id}` — datos del candidato + scoreActual
- `fuentes/{id}` — URLs subidas, estado (pendiente|aprobada|rechazada|evaluada)
- `evaluaciones/{id}` — resultados análisis Kohlberg con citas

## Comandos

```
pnpm dev          # desarrollo
pnpm build        # build producción
pnpm lint         # linter
pnpm tsc --noEmit # type check
```
