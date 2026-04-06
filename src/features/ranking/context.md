# Feature: Ranking (Landing Page)

Página principal que muestra la lista de entidades con sus scores Kohlberg.

## Responsabilidades
- Leer entidades desde Firestore
- Mostrar EntidadCard por cada entidad con score, partido, foto
- Ordenar por score (o alfabético si no hay score)
- Link a `/entidad/[id]` por cada card
- Botón para registrar nueva entidad (`/registrar`)

## Imports permitidos
- `@/schemas/*`
- `@/shared/*`
- `@/firebase/client`

## NO importar de
- Otros features (`entidad-detalle`, `subir-fuente`, `metodologia`, `registrar-entidad`)
