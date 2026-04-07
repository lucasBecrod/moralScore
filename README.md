# MoralScore

> Razonamiento moral verificable. Democracia basada en evidencia.

Plataforma web pública que asigna un **score de razonamiento moral** (estadios 1-6 de Kohlberg) a candidatos políticos peruanos. Cada puntuación es verificable: el usuario clickea el score y accede a las fuentes originales con las citas exactas que lo sustentan.

**Contexto:** Elecciones Generales del Perú 2026.

## Qué evalúa

Se evalúa la **justificación** que da el candidato, no su posición ideológica. Dos candidatos pueden defender la misma política pero uno razona en estadio 2 (transaccional) y otro en estadio 5 (contrato social).

| Nivel | Estadios | Ejemplo |
|-------|----------|---------|
| Pre-convencional | 1-2 | "Si me apoyas, te doy obras para tu distrito" |
| Convencional | 3-4 | "Debemos respetar la Constitución y fortalecer las instituciones" |
| Post-convencional | 5-6 | "Los derechos fundamentales están por encima de cualquier mayoría coyuntural" |

## Stack

- **Next.js 15** + TypeScript + Tailwind CSS 4
- **Firebase** (Firestore + App Hosting)
- **Arquitectura VSA** (features/ como slices autónomos)

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Scripts útiles

```bash
npx tsx scripts/sync-firestore.ts                          # sincronizar data/*.json → Firestore
npx tsx --env-file=.env.local scripts/reconcile-scores.ts   # recalcular scores
npx tsx scripts/seed-candidatos.ts                          # seed candidatos desde JNE
npx tsx scripts/cache-images.ts                             # descargar fotos del JNE
```

## Metodología

La metodología completa, prompts de evaluación y criterios de calidad de fuentes están publicados en `/metodologia` y `/docs/*` dentro de la app.

## Autores

- **Lucas Becerra** (Economista) — arquitectura, desarrollo, IA
- **Lady** (Psicóloga) — marco teórico Kohlberg, calibración de rúbricas
