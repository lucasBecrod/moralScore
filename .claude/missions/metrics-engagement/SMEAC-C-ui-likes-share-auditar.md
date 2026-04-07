# Agente C — UI: Likes Condicionados + Botones Share + Link Auditar

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar archivos fuera de `src/features/entidad-detalle/`
- NO editar `src/schemas/`, `src/firebase/`, `src/app/`, `firestore.rules`
- NO importar de otros features/ (solo de shared/, schemas/, firebase/)
- Leer CADA archivo antes de editarlo
- Código en inglés, contenido UI en español
- Componentes max 150 LOC. Si crece, extraer sub-componente
- Dark mode only

### Archivos protegidos (NO modificar)
- `src/schemas/*`
- `src/firebase/*`
- `src/app/*`
- `src/shared/*`
- `src/features/ranking/*`
- `src/features/subir-fuente/*`
- `src/features/metodologia/*`
- `src/features/registrar-entidad/*`
- `firestore.rules`

### Límite de alcance
Componentes de UI dentro de entidad-detalle/. Nada de data layer.

---

## SITUACIÓN

MoralScore necesita engagement features en la página de detalle del candidato:
1. **Likes condicionados**: el botón se desbloquea solo después de que el usuario expande ≥1 FuenteCard (para forzar consumo de evidencia)
2. **Botones de Share**: WhatsApp (prioritario), Twitter/X, Copiar link
3. **Link "Audita el algoritmo"**: transparencia agresiva

**Dependencia**: Este agente requiere que el Agente B ya haya implementado:
- `toggleLike` y `getLikeStatus` en `@/firebase/queries`
- `trackMetric` en `@/shared/lib/track-metric`
- `totalLikes` en el tipo Entidad

**NO ejecutar este agente hasta que B esté completo.**

## MISIÓN

Modificar los componentes de entidad-detalle/ para agregar likes, share y el link de auditoría.

## EJECUCIÓN

### Tarea 1: Agregar callback onExpand a FuenteCard

Archivo: `src/features/entidad-detalle/FuenteCard.tsx`

Agregar prop `onExpand?: () => void` al componente. Cuando el usuario expande la card (click que pone `expanded = true`), llamar `onExpand?.()`.

```typescript
interface FuenteCardProps {
  // ... props existentes ...
  onExpand?: () => void;  // NUEVO
}
```

En el handler de click:
```typescript
onClick={() => {
  const willExpand = !expanded;
  setExpanded(willExpand);
  if (willExpand) onExpand?.();
}}
```

También trackear el evento de métricas:
```typescript
import { trackMetric } from "@/shared/lib/track-metric";
// Dentro del if (willExpand):
// No trackear aquí — las métricas de fuente_expanded las maneja el padre
// Solo notificar con onExpand
```

**NOTA**: No agregar tracking de métricas en FuenteCard. El padre (EntidadDetallePage) decide qué trackear. FuenteCard solo notifica.

### Tarea 2: Propagar onExpand en HistorialEvaluaciones

Archivo: `src/features/entidad-detalle/HistorialEvaluaciones.tsx`

Agregar prop `onFuenteExpanded?: () => void` y pasarla a cada FuenteCard:

```typescript
interface HistorialEvaluacionesProps {
  evaluaciones: Evaluacion[];
  onFuenteExpanded?: () => void;  // NUEVO
}

// En el render:
<FuenteCard
  key={ev.id}
  // ... props existentes ...
  onExpand={onFuenteExpanded}
/>
```

### Tarea 3: Implementar Like + Share + Auditar en EntidadDetallePage

Archivo: `src/features/entidad-detalle/EntidadDetallePage.tsx`

Este es el cambio más grande. Agregar:

#### 3a. Estado de like y desbloqueo

```typescript
import { toggleLike, getLikeStatus } from "@/firebase/queries";
import { trackMetric } from "@/shared/lib/track-metric";
import { useAuthContext } from "@/shared/providers/AuthProvider";
import { AuthModal } from "@/shared/ui/AuthModal";
import { SITE_CONFIG } from "@/shared/config/site";

// Nuevos estados:
const [hasViewedFuente, setHasViewedFuente] = useState(false);
const [liked, setLiked] = useState(false);
const [likeCount, setLikeCount] = useState(0);
const [authModalOpen, setAuthModalOpen] = useState(false);
const [copied, setCopied] = useState(false);

const { user } = useAuthContext();
```

Al cargar la entidad, setear `likeCount` desde `entidad.totalLikes ?? 0`.
Si hay usuario autenticado, verificar `getLikeStatus(user.uid, id)` y setear `liked`.

#### 3b. Handler de like

```typescript
async function handleLike() {
  if (!hasViewedFuente) return; // No debería pasar (botón disabled), pero por seguridad

  if (!user) {
    setAuthModalOpen(true);
    return;
  }

  const nowLiked = await toggleLike(user.uid, id);
  setLiked(nowLiked);
  setLikeCount((c) => c + (nowLiked ? 1 : -1));
  trackMetric(nowLiked ? "likes_dados" : "likes_quitados");
}
```

#### 3c. Handler de onFuenteExpanded

```typescript
function handleFuenteExpanded() {
  if (!hasViewedFuente) {
    setHasViewedFuente(true);
  }
}
```

Pasarlo a HistorialEvaluaciones:
```tsx
<HistorialEvaluaciones
  evaluaciones={evalsForHistorial}
  onFuenteExpanded={handleFuenteExpanded}
/>
```

#### 3d. Botones de Share

Funciones helper:
```typescript
function getShareUrl(): string {
  return `${SITE_CONFIG.url}/entidad/${id}`;
}

function shareWhatsApp() {
  const text = `${entidad.nombre} tiene un score Kohlberg de ${entidad.scoreActual?.toFixed(1) ?? "?"}/6. Audita la evidencia:`;
  const url = `${getShareUrl()}?ref=share_wa`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
  trackMetric("shares_wa");
}

function shareTwitter() {
  const text = `${entidad.nombre}: score Kohlberg ${entidad.scoreActual?.toFixed(1) ?? "?"}/6. Sin ideología, solo evidencia.`;
  const url = `${getShareUrl()}?ref=share_tw`;
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  trackMetric("shares_tw");
}

async function copyLink() {
  const url = `${getShareUrl()}?ref=share_copy`;
  await navigator.clipboard.writeText(url);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
  trackMetric("shares_copy");
}
```

#### 3e. UI — Barra de engagement

Colocar DESPUÉS del header (después del cierre del `<div className="flex gap-5 mb-10">`) y ANTES de las evaluaciones. La barra contiene: like button + share buttons + link auditar.

```tsx
{/* Barra de engagement */}
<div className="mb-8 flex flex-wrap items-center gap-3">
  {/* Like button */}
  <button
    onClick={handleLike}
    disabled={!hasViewedFuente}
    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      liked
        ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
        : hasViewedFuente
          ? "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          : "border border-zinc-800 text-zinc-600 cursor-not-allowed"
    }`}
    title={hasViewedFuente ? (liked ? "Quitar validación" : "Validar evidencia") : "Revisa al menos una fuente para opinar"}
  >
    {/* Corazón o check icon */}
    <svg className="h-4 w-4" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
    {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
  </button>

  {/* Tooltip si no ha visto fuente */}
  {!hasViewedFuente && (
    <span className="text-xs text-zinc-600">
      Revisa al menos una fuente para opinar
    </span>
  )}

  {/* Separator */}
  <div className="h-4 w-px bg-zinc-800" />

  {/* Share buttons */}
  <button
    onClick={shareWhatsApp}
    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
    title="Compartir en WhatsApp"
  >
    {/* WhatsApp icon (simple) */}
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    WhatsApp
  </button>

  <button
    onClick={shareTwitter}
    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
    title="Compartir en Twitter/X"
  >
    {/* X icon */}
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
    X
  </button>

  <button
    onClick={copyLink}
    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
    title="Copiar enlace"
  >
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
    {copied ? "Copiado" : "Copiar"}
  </button>
</div>
```

#### 3f. Link "Audita el algoritmo"

Colocar DESPUÉS de los botones de share, dentro de la misma barra o como elemento separado debajo:

```tsx
<div className="mb-8">
  <Link
    href="/metodologia"
    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
  >
    El algoritmo es ciego.
    <span className="underline">Audita el código y los prompts</span>
    &rarr;
  </Link>
</div>
```

#### 3g. AuthModal para likes

Reutilizar el AuthModal existente. Agregar después del modal de SubirFuente:

```tsx
<AuthModal
  open={authModalOpen}
  onClose={() => setAuthModalOpen(false)}
  onSuccess={() => {
    setAuthModalOpen(false);
    // Después de login, ejecutar el like automáticamente
    // El user state se actualizará vía AuthProvider
  }}
/>
```

**NOTA**: Después de autenticarse, el like no se ejecuta automáticamente porque el estado de `user` se actualiza async via el AuthProvider. Considerar un useEffect que ejecute el like cuando `user` pase de null a un valor y `authModalOpen` acabe de cerrarse. O simplemente dejar que el usuario haga click de nuevo (más simple, menos edge cases).

### Tarea 4: Actualizar context.md

Archivo: `src/features/entidad-detalle/context.md`

Agregar a las responsabilidades:
```
- Botón Like condicionado (requiere expandir ≥1 fuente + auth)
- Botones de Share (WhatsApp, Twitter/X, Copiar)
- Link "Audita el algoritmo" → /metodologia
- Tracking de métricas vía Spine Pattern (fire-and-forget)
```

Agregar a imports permitidos:
```
- `@/shared/lib/track-metric`
```

## CRITERIO DE ÉXITO

1. `pnpm build` compila sin errores
2. Botón de Like aparece deshabilitado al cargar la página
3. Después de expandir 1 FuenteCard, el botón se habilita
4. Click en Like sin auth → abre AuthModal
5. Click en Like con auth → toggle like, counter cambia
6. Botones de Share abren WhatsApp/Twitter/copian al clipboard
7. Link "Audita el algoritmo" navega a /metodologia
8. Componentes no exceden 150 LOC (extraer si es necesario)
9. No hay imports entre features/

## NOTAS ADICIONALES

- El componente EntidadDetallePage ya tiene ~140 LOC. Con los cambios va a crecer. **Extraer la barra de engagement a un sub-componente** `EngagementBar.tsx` dentro de `src/features/entidad-detalle/` para mantener el límite de 150 LOC.
- WhatsApp es el canal #1 en Perú. El botón de WhatsApp debe ser visualmente el más prominente.
- El diseño debe ser mobile-first. Los botones de share deben ser usables con el pulgar.
- `SITE_CONFIG.url` es "https://moralscore.pe" — usado para construir las URLs de share.
