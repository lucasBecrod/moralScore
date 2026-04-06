# Feature: Subir Fuente

Modal/formulario para que cualquier usuario suba una URL de fuente para un candidato.

## Responsabilidades
- Form con input de URL + selector de tipo (youtube, artículo, entrevista, debate)
- Validar URL con Zod
- Guardar en Firestore como fuente con estado "pendiente"
- Feedback al usuario: "Fuente enviada, será revisada"

## Imports permitidos
- `@/schemas/fuente.schema`
- `@/shared/*`
- `@/firebase/client`

## NO importar de
- Otros features
