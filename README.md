# MoralScore

> El fin de la amnesia política.

Cada elección los políticos se reinventan: promesas nuevas, pasado borrado. Y ningún ciudadano tiene tiempo de revisar cientos de entrevistas y debates para saber quién dice la verdad y quién manipula.

**MoralScore hace ese trabajo por ti.** Usamos inteligencia artificial para analizar lo que los candidatos dicen en entrevistas, debates y declaraciones públicas. No evaluamos si son de izquierda o derecha — evaluamos *cómo justifican sus decisiones*: si razonan con principios o con clientelismo, si respetan las reglas básicas de convivencia o las rompen cuando les conviene.

Para eso usamos dos marcos científicos con décadas de investigación:

- **Kohlberg** (psicología moral) — clasifica el nivel de razonamiento del candidato, desde el más básico ("te doy obras si me apoyas") hasta el más elevado ("defiendo este derecho aunque me cueste votos").
- **Gert** (filosofía moral) — detecta si el candidato viola reglas éticas fundamentales: no engañar, cumplir promesas, respetar la ley, proteger la vida.

Cada puntaje viene con las citas exactas del candidato que lo respaldan. Nada se inventa. Todo se puede verificar.

**Contexto:** Elecciones Generales del Perú 2026.

---

## Cómo funciona

1. **Tú subes la evidencia** — Cualquier ciudadano puede enviar un link a una entrevista, debate o nota de prensa.
2. **La IA analiza** — El sistema lee el contenido y aplica los marcos Kohlberg y Gert de forma imparcial, sin importar el partido político.
3. **El resultado es público** — Se publica un puntaje con las frases exactas del candidato que lo justifican. Cualquiera puede auditarlo.

## La escala (simplificada)

| Puntaje | Qué significa | Ejemplo |
|---------|--------------|---------|
| 1-2 | Opera por interés propio, intercambia favores | "Si me apoyas, te doy obras para tu distrito." |
| 3-4 | Sigue normas y busca aprobación popular | "Es lo que el pueblo me pide que haga." |
| 5-6 | Se guía por principios, aunque le cueste | "Asumo el costo político porque es lo correcto." |

---

## Stack técnico

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS 4
- **Firebase** (Firestore + App Hosting)
- **Motor IA** — LLMs con rúbrica Kohlberg/Gert (prompts públicos en `/docs`)
- **Arquitectura VSA** — features/ como slices autónomos
- **Zod** — contratos de datos estrictos

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Scripts

```bash
npx tsx scripts/seed-candidatos.ts                          # seed candidatos desde JNE
npx tsx scripts/cache-images.ts                             # descargar fotos del JNE
npx tsx scripts/sync-firestore.ts                          # sincronizar data/*.json → Firestore
npx tsx --env-file=.env.local scripts/reconcile-scores.ts   # recalcular scores
```

## Transparencia

Todo es auditable: la metodología, los prompts de la IA, los criterios para aceptar o rechazar fuentes, y las rúbricas de evaluación están publicados en `/metodologia` y `/docs/*` dentro de la app. Código fuente abierto.

## Autores

- **Lucas Becrod** (Economista) — arquitectura, desarrollo, IA
- **Leidi Becrod** (Psicóloga) — marco teórico Kohlberg/Gert, calibración de rúbricas
