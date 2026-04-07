# Feature: Entidad Detalle

Página de perfil de la entidad: score desglosado, fuentes evaluadas, botón [+] para subir URL.

## Responsabilidades
- Leer entidad + sus evaluaciones + fuentes desde Firestore
- Mostrar score general (mediana) con ScoreGauge
- Listar fuentes evaluadas como FuenteCard (cita + link + estadio)
- Botón [+] que abre el modal de subir-fuente
- Mostrar fuentes pendientes/aprobadas sin score aún
- Likes: toggle like (requires viewing at least one fuente first, auth-gated)
- Share: WhatsApp, X (Twitter), copy link with tracking refs
- Auditar: link to /metodologia for algorithm transparency
- Metric tracking: likes_dados, likes_quitados, shares_wa, shares_tw, shares_copy

## Imports permitidos
- `@/schemas/*`
- `@/shared/*`
- `@/firebase/client`
- `@/features/subir-fuente` (solo el modal SubirFuenteModal)

## NO importar de
- `ranking`, `metodologia`, `registrar-entidad`
