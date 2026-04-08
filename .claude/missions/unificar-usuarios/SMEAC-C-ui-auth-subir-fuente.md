# Agente C — UI: auth gate en SubirFuenteModal

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar schemas, data JSONs, scripts, firestore.rules, queries.ts
- Leer CADA archivo antes de editarlo
- Código en inglés, contenido UI en español
- Dark mode only, Tailwind
- Componentes max 150 LOC
- features/ NUNCA importa de otro feature/

### Archivos protegidos (NO modificar)
- `src/schemas/*`
- `data/*`
- `scripts/*`
- `firestore.rules`
- `src/firebase/queries.ts`

### Límite de alcance
SubirFuenteModal, EntidadDetallePage (integración del auth gate). Nada más.

---

## MISIÓN (Objetivo)

### Tarea asignada
Proteger el flujo de subir fuente con Google Auth. Mover el botón "Sugerir fuente" arriba (debajo del score). Ordenar evaluaciones por validaciones desc + fechaEvento desc.

### Criterio de éxito
- `pnpm build` pasa sin errores
- Botón "Sugerir fuente" está debajo del score, antes de las evaluaciones
- Click en "Sugerir fuente" sin auth → abre AuthModal
- Después de login → se abre SubirFuenteModal
- Al enviar fuente, el body incluye `userId` del usuario autenticado
- Evaluaciones ordenadas: validacionesCiudadanas desc, luego fechaEvento desc
- El usuario queda registrado en `usuarios/{id}` automáticamente

---

## SITUACIÓN (Contexto)

### Estado actual
- `SubirFuenteModal.tsx` no tiene acceso al usuario autenticado
- `EntidadDetallePage.tsx` ya importa AuthModal y useAuthContext (del refactor de validaciones)
- `getOrCreateUsuario` ya existe en queries.ts (creado por Agente B)
- El API route ya requiere `userId` en el body (Agente B)

### Pre-requisito
**Los Agentes A y B deben haber completado.**

### Archivos objetivo
- `src/features/subir-fuente/SubirFuenteModal.tsx` (EDITAR)
- `src/features/entidad-detalle/EntidadDetallePage.tsx` (EDITAR — pasar userId al modal)

### Archivos de contexto (leer primero, NO editar)
- `src/shared/hooks/useAuth.ts` — hook de autenticación
- `src/shared/providers/AuthProvider.tsx` — context de auth
- `src/shared/ui/AuthModal.tsx` — modal de login Google
- `src/firebase/queries.ts` — getOrCreateUsuario (Agente B)

---

## EJECUCIÓN (Método)

### Paso 0: Reorganizar layout de EntidadDetallePage

En `EntidadDetallePage.tsx`, el orden de renderizado debe ser:

```
[Header + Score + Logo partido]
[Botón "Sugerir fuente" + Share buttons]    ← CTA arriba, antes de todo
[Fuentes PENDIENTES]                         ← gratificación inmediata
[Evaluaciones completas]                     ← sort compuesto
[Fuentes rechazadas (colapsado)]             ← cementerio al fondo
```

**Botón arriba**: Mover "Sugerir fuente" de abajo de todo a debajo del score, junto a los share buttons. Es el CTA del Growth Loop.

**Pendientes arriba**: Las fuentes sin evaluar (`estado === "pendiente" || "aprobada"`) van SIEMPRE antes de las evaluaciones completas. Ordenadas por `createdAt` desc (la más reciente primero — el usuario que acaba de subir la ve de inmediato).

**Evaluaciones**: Sort compuesto:
```typescript
const sortedEvals = [...evalsForHistorial].sort((a, b) => {
  // Primario: validaciones ciudadanas desc
  const vDiff = (b.validacionesCiudadanas ?? 0) - (a.validacionesCiudadanas ?? 0);
  if (vDiff !== 0) return vDiff;
  // Fallback: fechaEvento desc (más reciente primero)
  return (b.fuente.fechaFuente ?? "").localeCompare(a.fuente.fechaFuente ?? "");
});
```
Hoy todas tienen 0 validaciones → se verán por fecha desc. Cuando la comunidad valide, las más verificadas suben.

### Paso 1: Editar `SubirFuenteModal.tsx`

Agregar prop `userId` y enviarlo en el body al POST:

```typescript
interface SubirFuenteModalProps {
  entidadId: string;
  userId: string;  // NUEVO
  onClose: () => void;
}
```

En el fetch al API:
```typescript
body: JSON.stringify({
  ...parsed,
  titulo: urlMeta?.title,
  medio: urlMeta?.domain,
  userId,  // NUEVO
}),
```

### Paso 2: Editar `EntidadDetallePage.tsx`

El componente ya tiene `useAuthContext` y `AuthModal`. La lógica:

1. Click en "Sugerir fuente":
   - Si `!user` → abrir AuthModal
   - Si `user` → abrir SubirFuenteModal con `userId={user.uid}`
2. Cuando AuthModal completa login → registrar usuario con `getOrCreateUsuario`
3. Pasar `userId={user.uid}` al SubirFuenteModal

```typescript
async function handleSugerirFuente() {
  if (!user) {
    setAuthModalOpen(true);
    return;
  }
  // Registrar usuario si es primera vez
  await getOrCreateUsuario(user.uid, user.displayName || "Ciudadano", user.email, user.photoURL);
  setShowModal(true);
}
```

Actualizar el render del modal:
```typescript
{showModal && user && (
  <SubirFuenteModal
    entidadId={id}
    userId={user.uid}
    onClose={() => setShowModal(false)}
  />
)}
```

---

## APOYO (Recursos)

### Comandos
- Build: `pnpm build`
- Dev: `pnpm dev`

---

## VALIDACIÓN (Verificar antes de reportar completado)

1. `pnpm build` → exitoso
2. SubirFuenteModal recibe `userId` como prop y lo envía en el body
3. Click "Sugerir fuente" sin auth → AuthModal
4. Click "Sugerir fuente" con auth → SubirFuenteModal
5. No hay imports cruzados entre features/
6. Componentes no exceden 150 LOC
7. `git diff --stat` → solo archivos dentro del scope

---

## PURGADO — Algoritmo de Musk, Paso 2

1. ¿`getOrCreateUsuario` se llama en el lugar correcto? Si ya se llama en AuthProvider, no duplicar.
2. ¿El prop `userId` en SubirFuenteModal es necesario o puede leer de useAuthContext directamente? Evaluar.
3. Si algún componente supera 150 LOC, extraer.

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.

---

**ACCIÓN INMEDIATA**: Lee los archivos de contexto, luego ejecuta el flujo. Comienza.
