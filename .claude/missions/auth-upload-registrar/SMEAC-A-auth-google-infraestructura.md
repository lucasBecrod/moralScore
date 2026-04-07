# SMEAC-A: Autenticación Google + Reglas de Seguridad

## Situación
MoralScore es una plataforma pública de auditoría ética de candidatos políticos peruanos.
El formulario `/registrar` (crear candidatos) está completamente abierto — cualquier bot o usuario anónimo puede crear entidades en Firestore. Se necesita proteger con Google Auth.

## Misión
Implementar autenticación con Google (Firebase Auth) como puerta de acceso al formulario de registro. Solo usuarios autenticados pueden crear candidatos y subir fuentes.

## Ejecución

### 1. Firebase Auth en client.ts
- Archivo: `src/firebase/client.ts`
- Ya exporta `app`, `db`, `storage`
- Agregar: `import { getAuth } from "firebase/auth"` → `export const auth = getAuth(app);`
- Conectar emulador de Auth si `useEmulators` es true: `connectAuthEmulator(auth, "http://localhost:9099")`

### 2. Hook useAuth
- Crear: `src/shared/hooks/useAuth.ts`
- Usar `onAuthStateChanged` para mantener estado del usuario
- Exportar: `{ user, loading, signInWithGoogle, signOut }`
- `signInWithGoogle`: usa `GoogleAuthProvider` + `signInWithPopup`

### 3. AuthProvider
- Crear: `src/shared/providers/AuthProvider.tsx`
- Context provider que wrappea la app con el estado de auth
- Children solo se renderizan cuando `loading` es false

### 4. Montar AuthProvider en layout
- Archivo: `src/app/layout.tsx`
- Wrappear children con `<AuthProvider>`

### 5. Proteger página /registrar
- Archivo: `src/features/registrar-entidad/RegistrarEntidadPage.tsx`
- Si `!user` → mostrar botón "Iniciar sesión con Google" en lugar del form
- Si `user` → mostrar el form normal

### 6. Proteger endpoint /api/entidad
- Archivo: `src/app/api/entidad/route.ts`
- Por ahora: confiar en que el frontend protege. La validación server-side con Firebase Admin token verification es opcional para esta fase.

### 7. Agregar emulador de Auth en firebase.json
- Agregar `"auth": { "port": 9099 }` en la sección emulators

### 8. Actualizar storage.rules
- Archivo: `storage.rules`
- Lectura: pública (ya está)
- Escritura en `img/`: solo usuarios autenticados
```
match /img/{allPaths=**} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

### 9. Actualizar firestore.rules
- Archivo: `firestore.rules`
- Lectura de entidades, fuentes, evaluaciones: pública
- Escritura de entidades: solo autenticados
- Escritura de fuentes: solo autenticados

## Admin e intención
- NO agregar roles ni admin por ahora. Solo autenticado vs no autenticado.
- NO usar next-auth ni clerk. Solo Firebase Auth nativo.
- NO agregar header/navbar de login. Solo en la página de registrar.
- Dark mode only. Tailwind. Componentes max 150 LOC.
- Código en inglés. UI en español.

## Criterio de éxito
1. `firebase emulators:start` levanta Firestore + Storage + Auth
2. `/registrar` muestra botón "Iniciar sesión con Google" si no hay sesión
3. Después de login, se ve el formulario
4. `storage.rules` y `firestore.rules` desplegadas con auth
5. `pnpm build` pasa sin errores

## Restricciones
- NO tocar: ranking, detalle, metodología, scripts de seed
- NO agregar dependencias nuevas (Firebase SDK ya tiene todo)
- NO crear archivos en features/ que no sean registrar-entidad
- Shared hooks y providers van en `src/shared/`

## Archivos que modifica
- `src/firebase/client.ts` (agregar auth)
- `src/app/layout.tsx` (agregar AuthProvider)
- `src/features/registrar-entidad/RegistrarEntidadPage.tsx` (gate de auth)
- `firebase.json` (agregar emulador auth)
- `storage.rules` (auth en write)
- `firestore.rules` (auth en write)

## Archivos que crea
- `src/shared/hooks/useAuth.ts`
- `src/shared/providers/AuthProvider.tsx`
