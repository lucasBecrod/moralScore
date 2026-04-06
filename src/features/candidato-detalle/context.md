# Feature: Candidato Detalle

Página de perfil del candidato: score desglosado, fuentes evaluadas, botón [+] para subir URL.

## Responsabilidades
- Leer candidato + sus evaluaciones + fuentes desde Firestore
- Mostrar score general (mediana) con ScoreGauge
- Listar fuentes evaluadas como FuenteCard (cita + link + estadio)
- Botón [+] que abre el modal de subir-fuente
- Mostrar fuentes pendientes/aprobadas sin score aún

## Imports permitidos
- `@/schemas/*`
- `@/shared/*`
- `@/firebase/client`
- `@/features/subir-fuente` (solo el modal SubirFuenteModal)

## NO importar de
- `ranking`, `metodologia`
