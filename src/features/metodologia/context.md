# Feature: Metodologia

Pagina de transparencia completa que explica la metodologia de MoralScore.

## Secciones
1. Por que MoralScore (argumento de volumen de informacion)
2. Dos marcos teoricos: Kohlberg (6 estadios) + Gert (10 reglas)
3. Como funciona (flujo visual de 6 pasos)
4. Criterios de calidad de fuentes (tabla con pesos)
5. Transparencia total (documentos descargables con vista inline)
6. Quien esta detras (equipo + GitHub)
7. Limitaciones

## Componentes
- MetodologiaPage.tsx — server component, lee docs con fs, compone secciones
- Accordion.tsx — "use client", expandible con chevron y accent color
- DocumentCard.tsx — "use client", card con "Ver" inline y "Descargar"
- EscalaKohlberg.tsx — renderiza 6 estadios con colores
- SectionWhyMoralScore.tsx — seccion 1
- SectionGertRules.tsx — 10 reglas de Gert
- SectionHowItWorks.tsx — flujo de 6 pasos
- SectionSourceQuality.tsx — tabla de tipos de fuente
- SectionTransparency.tsx — cards de documentos descargables
- SectionTeam.tsx — equipo y contacto
- SectionLimitations.tsx — limitaciones declaradas

## Imports permitidos
- `@/shared/*`

## NO importar de
- Otros features
- Firebase (es contenido estatico)
