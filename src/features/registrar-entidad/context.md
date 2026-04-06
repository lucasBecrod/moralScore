# Feature: Registrar Entidad

Formulario para registrar nuevas entidades (candidatos, organizaciones).

## Responsabilidades
- Form con campos: nombre, foto URL, tipo, partido (opcional), cargo (opcional)
- POST a /api/entidad con los datos
- Feedback al usuario con link a la entidad creada

## Imports permitidos
- `@/schemas/*`
- `@/shared/*`

## NO importar de
- Otros features
