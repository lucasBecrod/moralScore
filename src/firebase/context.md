# Firebase Config

Inicialización de Firebase para el proyecto.

## Archivos
- `client.ts` — Firebase Client SDK (para componentes client-side)
- `admin.ts` — Firebase Admin SDK (para API routes server-side)

## Reglas
- Las credenciales vienen de .env.local
- client.ts exporta: `db` (Firestore), `app`
- admin.ts exporta: `adminDb` (Firestore Admin)
