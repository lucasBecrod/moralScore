# SMEAC-B: Modal Auth + Upload Imagen + Rate Limiting

## Situación
MoralScore ya tiene Firebase Auth configurado (SMEAC-A completado): client.ts exporta `auth`, existe `useAuth` hook, `AuthProvider` en layout, y reglas de seguridad actualizadas. Pero la UX de auth NO es correcta — actualmente `/registrar` muestra un botón de login inline. Necesitamos un modal reutilizable y agregar upload de imagen + rate limiting.

## Misión
1. Crear modal de auth reutilizable
2. Integrar auth modal en flujo de registro (botón + Registrar y página /registrar)
3. Agregar upload de imagen de candidato a Storage
4. Agregar rate limiting a endpoints API

## Ejecución

### PARTE 1: Modal de Auth (prioridad máxima)

#### 1.1 Componente AuthModal
- Crear: `src/shared/ui/AuthModal.tsx`
- Modal overlay oscuro centrado (dark mode, Tailwind)
- Contenido: logo/título MoralScore + texto "Inicia sesión para continuar" + botón "Continuar con Google" (con ícono SVG de Google) + botón "Cancelar"
- Props: `{ open: boolean, onClose: () => void, onSuccess: () => void }`
- Al hacer click en "Continuar con Google": llama `signInWithGoogle` del hook `useAuthContext()`
- Si login exitoso: llama `onSuccess` (que puede redirigir o cerrar)
- Si cancela: llama `onClose`
- Max 100 LOC. Dark mode. UI en español.

#### 1.2 Modificar botón "+ Registrar" en RankingPage
- Archivo: `src/features/ranking/RankingPage.tsx`
- El link `<Link href="/registrar">` actual → cambiar a botón que:
  - Si `user` existe (del `useAuthContext()`) → navegar a `/registrar` con `router.push`
  - Si `!user` → abrir `<AuthModal>` → si auth exitoso → navegar a `/registrar`

#### 1.3 Modificar RegistrarEntidadPage
- Archivo: `src/features/registrar-entidad/RegistrarEntidadPage.tsx`
- QUITAR el botón de login inline que puso SMEAC-A
- En su lugar: si `!user` y `!loading` → abrir `<AuthModal>` automáticamente
- Si el usuario cancela el modal → redirigir a `/` con `router.push`
- Si `user` → mostrar el form normal

### PARTE 2: Upload de Imagen

#### 2.1 Utilidades de Storage
- Crear: `src/firebase/storage-utils.ts`
- Función `uploadEntidadImage(file: File, entidadId: string): Promise<string>`
  - Ruta en Storage: `img/entidades/{entidadId}.{ext}`
  - Metadata: contentType del file, cacheControl "public, max-age=31536000"
  - Retorna URL pública: `https://storage.googleapis.com/moral-score.firebasestorage.app/img/entidades/{entidadId}.{ext}`
- Usar `uploadBytes` + `getDownloadURL` del client SDK de Firebase Storage
- Validar en cliente: max 2 MB, solo JPEG/PNG/WebP

#### 2.2 Componente ImageUpload
- Crear: `src/shared/ui/ImageUpload.tsx`
- Input `type="file"` con accept `image/jpeg,image/png,image/webp`
- Preview de la imagen (URL.createObjectURL) en un cuadrado 96x96
- Si no hay imagen: mostrar ícono de cámara/placeholder
- Click para seleccionar, o drag & drop
- Estados: idle → selected (preview) → uploading (spinner) → done (check)
- Props: `{ onFileSelected: (file: File | null) => void, previewUrl?: string }`
- El upload en sí lo maneja el padre (RegistrarEntidadPage) al submit
- Max 120 LOC

#### 2.3 Integrar en RegistrarEntidadPage
- Reemplazar input text de "foto" por `<ImageUpload>`
- Flujo al submit:
  1. Generar ID (slug del nombre) — ya existe esta lógica
  2. Si hay archivo de imagen → llamar `uploadEntidadImage(file, id)` → obtener URL
  3. Si no hay imagen → usar placeholder
  4. POST a `/api/entidad` con la URL de Storage en campo `foto`

### PARTE 3: Rate Limiting

#### 3.1 Utilidad de rate limiting
- Crear: `src/shared/lib/rate-limit.ts`
- Rate limiter en memoria por IP (como Finangher)
- Función `checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean`
- Default: 10 requests por minuto por IP
- Retorna true si permitido, false si excede

#### 3.2 Aplicar en endpoints
- Archivo: `src/app/api/entidad/route.ts`
  - Al inicio del POST: extraer IP de headers (`x-forwarded-for` o `x-real-ip`)
  - Si excede rate limit → retornar 429 con mensaje "Demasiadas solicitudes. Intenta en un minuto."
- Archivo: `src/app/api/fuente/route.ts`
  - Mismo patrón

## Admin e intención
- El modal de auth es REUTILIZABLE — cualquier feature que necesite auth lo importa de `shared/ui/`
- NO agregar login en header, navbar, ni en ningún otro lugar
- El upload es solo para foto del candidato. Logo del partido se carga vía seed.
- Rate limiting es simple, en memoria. No necesita Redis ni persistencia.
- Dark mode only. Código en inglés. UI en español.

## Criterio de éxito
1. Click en "+ Registrar" sin sesión → se abre modal de auth → login con Google → redirige a form
2. Navegar directo a `/registrar` sin sesión → se abre modal → cancelar → vuelve a `/`
3. En el form: se puede seleccionar imagen → preview visible → al submit sube a Storage
4. Si no se selecciona imagen → usa placeholder
5. POST a `/api/entidad` más de 10 veces en 1 minuto → retorna 429
6. `pnpm build` pasa sin errores

## Restricciones
- NO tocar: ranking (excepto el botón Registrar), detalle, metodología, scripts de seed
- NO agregar dependencias nuevas
- Máximo 2 MB por imagen, solo JPEG/PNG/WebP
- Componentes max 150 LOC
- Dark mode only. Código en inglés. UI en español.
- Lee CADA archivo antes de editarlo.

## Archivos que modifica
- `src/features/ranking/RankingPage.tsx` (botón Registrar con auth check)
- `src/features/registrar-entidad/RegistrarEntidadPage.tsx` (modal + upload)
- `src/app/api/entidad/route.ts` (rate limit)
- `src/app/api/fuente/route.ts` (rate limit)

## Archivos que crea
- `src/shared/ui/AuthModal.tsx`
- `src/shared/ui/ImageUpload.tsx`
- `src/firebase/storage-utils.ts`
- `src/shared/lib/rate-limit.ts`
