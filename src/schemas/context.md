# Schemas (Zod)

Contrato de datos del sistema. Todo dato que cruza límites (Firestore ↔ API ↔ UI) pasa por Zod.

## Archivos
- `entidad.schema.ts` — datos de la entidad evaluada (persona u organización)
- `fuente.schema.ts` — URL fuente subida por usuarios
- `evaluacion.schema.ts` — resultado del análisis Kohlberg
- `analisis-response.schema.ts` — shape del JSON que retorna Claude Code

## Reglas
- Todo schema usa `.describe()` en cada campo
- Los schemas son la fuente de verdad de tipos (`z.infer<>`)
- No importan de ningún otro módulo (leaf dependency)
