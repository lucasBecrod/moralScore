# Deploy a Produccion

## Pre-requisitos

### Autenticacion ADC (una sola vez)
```bash
gcloud auth application-default login --project moral-score
```
Cuenta: `lucasbecrod@gmail.com`. Se guarda en `~/.config/gcloud/application_default_credentials.json`.

### Firebase CLI autenticado
```bash
firebase login
```

## Deploy automatico (codigo)

Push a `main` dispara build automatico en Firebase App Hosting.
No requiere accion manual. Monitorear en:
https://console.firebase.google.com/project/moral-score/apphosting

## Deploy manual (rules)

Cuando cambian `firestore.rules` o `storage.rules`:
```bash
firebase deploy --only firestore:rules,storage --project moral-score
```

## Seed de datos

### Sync Firestore (candidatos + fuentes + evaluaciones + procesos + candidaturas)
```bash
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false npx tsx --env-file=.env.local scripts/sync-firestore.ts
```

### Upload imagenes a Storage
```bash
npx tsx --env-file=.env.local scripts/upload-images-to-storage.ts
```

Ambos scripts son idempotentes: si el dato ya existe y no cambio, lo salta.

## Deteccion de entorno en scripts

Los scripts Admin SDK detectan automaticamente:
- `FIRESTORE_EMULATOR_HOST` presente = emulador (sin credenciales)
- `FIREBASE_STORAGE_EMULATOR_HOST` presente = emulador Storage
- Ambos ausentes = produccion (usa ADC o service account)

El `.env.local` tiene `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` que afecta al client SDK.
Para forzar produccion en sync-firestore.ts: `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`.

## Variables de entorno en produccion

Archivo `apphosting.yaml` en la raiz del repo:
```yaml
env:
  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    value: ...
  - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
    value: moral-score
  # etc.
```

Estas son variables PUBLICAS del client SDK. Las variables ADMIN (service account) NO van aqui.

## Troubleshooting

| Problema | Causa | Solucion |
|----------|-------|----------|
| "No hay registros" en prod | Variables NEXT_PUBLIC_* no llegan al build | Verificar apphosting.yaml |
| Imagenes no cargan | Fotos no estan en Storage | Correr upload-images-to-storage.ts |
| PERMISSION_DENIED en seed | Rules bloquean escritura sin auth | Usar Admin SDK (sync-firestore.ts ya lo usa) |
| Invalid JWT Signature | Service account key rotada/invalida | Usar ADC: `gcloud auth application-default login` |
| "Cargando..." permanente | Emulador flag activo en prod | Verificar NEXT_PUBLIC_USE_FIREBASE_EMULATOR |
