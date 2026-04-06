# Feature: Ranking (Landing Page)

Página principal que muestra la lista de candidatos con sus scores Kohlberg.

## Responsabilidades
- Leer candidatos desde Firestore
- Mostrar CandidatoCard por cada candidato con score, partido, foto
- Ordenar por score (o alfabético si no hay score)
- Link a `/candidato/[id]` por cada card

## Imports permitidos
- `@/schemas/*`
- `@/shared/*`
- `@/firebase/client`

## NO importar de
- Otros features (`candidato-detalle`, `subir-fuente`, `metodologia`)
