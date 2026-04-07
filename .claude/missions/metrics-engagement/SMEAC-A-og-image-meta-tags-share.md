# Agente A — OG Image Dinámica + Meta Tags + Share

> Eres un agente autónomo. Cumples la misión usando tu juicio dentro de las restricciones.
> Tu autonomía: elegir estructura, nombres, patrones de implementación.
> Tu límite: no salir del alcance de la misión ni violar restricciones.

---

## RESTRICCIONES (Reglas de Engagement)

### No negociables
- NO tocar archivos fuera de `src/app/api/og/`, `src/app/entidad/[id]/`
- NO editar `src/features/`, `src/firebase/`, `src/schemas/`, `src/shared/`
- Leer CADA archivo antes de editarlo
- Código en inglés, contenido UI en español
- Usar `zod/v4` si se necesita validación (import de "zod/v4", NO "zod")
- Dark mode only (fondos oscuros en la OG image)

### Archivos protegidos (NO modificar)
- `src/features/*` (todos)
- `src/firebase/*`
- `src/schemas/*`
- `src/shared/*`
- `firestore.rules`

### Límite de alcance
OG Image endpoint, meta tags dinámicos en la page de entidad, y nada más.

---

## SITUACIÓN

MoralScore es una plataforma que asigna scores de razonamiento moral (Kohlberg 1-6) a candidatos políticos peruanos. El mercado validó que el JTBD emocional es "ganar debates políticos con datos empíricos". El Growth Loop principal es: usuario comparte tarjeta en WhatsApp → receptor siente disonancia → entra a la plataforma → sube evidencia para "corregir" el score.

Actualmente NO hay forma de compartir el score de un candidato con una tarjeta visual atractiva. La página `/entidad/[id]` no tiene meta tags dinámicos, así que al compartir en WhatsApp/Twitter se ve genérico.

## MISIÓN

Implementar el endpoint de generación de OG Image dinámica y los meta tags en la página de detalle del candidato.

## EJECUCIÓN

### Tarea 1: Instalar @vercel/og

```bash
pnpm add @vercel/og
```

NOTA IMPORTANTE: Actualmente el deploy es Firebase App Hosting, NO Vercel. La migración a Vercel es una misión separada. Por ahora implementamos el código compatible. Satori (que usa @vercel/og) funciona en cualquier entorno Node.js, pero las Edge Functions de Vercel lo optimizan. El código debe funcionar también como una API route estándar de Next.js.

### Tarea 2: Crear /api/og/route.tsx

Crear `src/app/api/og/route.tsx`

**Funcionalidad**:
- GET endpoint que recibe `?id={entidadId}`
- Lee de Firestore: entidad (nombre, foto, scoreHistorico, totalEvaluacionesHistoricas) + candidatura del proceso activo (partido, logoPartido, scoreCandidatura)
- Genera imagen 1200x630 (estándar OG) usando ImageResponse de @vercel/og

**Diseño de la tarjeta** (dark mode, alto contraste para mobile):
```
┌─────────────────────────────────────────────────────────────┐
│ (fondo oscuro zinc-950)                                     │
│                                                             │
│  [Foto candidato]   NOMBRE COMPLETO                         │
│  (retrato 200x260)  Partido político                        │
│                                                             │
│                     Score: X.X / 6.0                        │
│                     ████████░░░░ (barra segmentada)         │
│                     "Etiqueta ciudadana"                    │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Basado en N fuentes verificables                           │
│  moralscore.pe · Audita la evidencia completa →             │
│                                                             │
│                                    [Logo MoralScore]        │
└─────────────────────────────────────────────────────────────┘
```

**Datos que necesitas del candidato** (leer de Firestore):
```typescript
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
// Leer entidad por ID → nombre, foto, scoreHistorico, totalEvaluacionesHistoricas
// Leer candidatura por entidadId (getCandidaturasByEntidad) → partido, scoreCandidatura
```

**Etiqueta ciudadana**: Usar el mapeo de `getPublicLabel()` de `@/shared/config/kohlberg-stages.ts`. Las etiquetas son:
- 1: "Autoritario / Punitivo"
- 2: "Transaccional / Clientelista"
- 3: "Busca aprobación popular"
- 4: "Institucionalista"
- 5: "Defiende derechos universales"
- 6: "Principios éticos absolutos"

**Colores por zona** (mismos que usa la UI):
- Score 1-2.4 (Pre-convencional): rojo (#DC2626)
- Score 2.5-4.4 (Convencional): azul (#2563EB)
- Score 4.5-6 (Post-convencional): violeta (#7C3AED)

**Fallback**: Si no hay score (null), mostrar "Sin evaluar" con barra gris.
**Fallback**: Si no hay foto, usar placeholder gris con "?" (no romper la imagen).
**Fallback**: Si el id no existe, devolver 404.

**Cache**: Setear headers `Cache-Control: public, max-age=3600` (1 hora). Los scores no cambian cada minuto.

### Tarea 3: Meta tags dinámicos en /entidad/[id]/page.tsx

El archivo actual es:
```typescript
import EntidadDetallePage from "@/features/entidad-detalle/EntidadDetallePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EntidadDetallePage id={id} />;
}
```

Agregar `generateMetadata` siguiendo el patrón existente en el proyecto (ver `src/app/docs/[slug]/page.tsx`):

```typescript
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // Leer entidad de Firestore (nombre, scoreHistorico, totalEvaluacionesHistoricas)
  // Leer candidatura del proceso activo (partido, scoreCandidatura)
  // Construir metadata dinámica
  return {
    title: `${nombre} — MoralScore`,
    description: `Score Kohlberg: ${score}/6. ${etiqueta}. Basado en ${totalEvaluacionesHistoricas} fuentes verificables.`,
    openGraph: {
      title: `${nombre} — Score Kohlberg ${score}/6`,
      description: `${etiqueta}. Audita la evidencia completa.`,
      images: [`${SITE_CONFIG.url}/api/og?id=${id}`],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${nombre} — Score Kohlberg ${score}/6`,
      description: `${etiqueta}. Basado en ${totalEvaluacionesHistoricas} fuentes verificables.`,
      images: [`${SITE_CONFIG.url}/api/og?id=${id}`],
    },
  };
}
```

Importar `SITE_CONFIG` de `@/shared/config/site` para la URL base (moralscore.pe).
Importar `getPublicLabel` de `@/shared/config/kohlberg-stages` para la etiqueta.

**IMPORTANTE**: La función `generateMetadata` es async y server-side. Puede importar directamente de `@/firebase/queries` (getEntidadById). Si la entidad no existe, no crashear — devolver metadata genérica.

## CRITERIO DE ÉXITO

1. `pnpm build` compila sin errores
2. `/api/og?id=keiko-fujimori` devuelve una imagen PNG de 1200x630
3. `/api/og?id=id-inexistente` devuelve 404
4. La página `/entidad/[id]` tiene meta tags og:image y twitter:image apuntando al endpoint
5. Al pegar un link de entidad en WhatsApp Web / Twitter, se muestra preview con imagen

## NOTAS ADICIONALES

- `@vercel/og` usa Satori internamente. En Next.js App Router, se usa `ImageResponse` del paquete.
- La foto del candidato viene como URL externa (del JNE). Para incluirla en Satori, necesitas hacer fetch de la imagen y pasarla como ArrayBuffer o base64 al JSX de Satori.
- Satori soporta un subset de CSS. No usar Tailwind directamente — usar inline styles.
- El texto debe ser legible en móvil (compartido por WhatsApp). Font sizes generosos.
- **Modelo post-migración**: `partido` y `logoPartido` viven en `candidaturas`, NO en `entidades`. Usar `getCandidaturasByEntidad()` de `@/firebase/queries`. El score para la tarjeta puede ser `scoreCandidatura` (del proceso activo) o `scoreHistorico` (lifetime) — preferir `scoreCandidatura` si existe.

---

## PURGADO — Algoritmo de Musk, Paso 2

Antes de validar, aplica el Paso 2 (Eliminar):
1. Revisa lo que escribiste. Identifica:
   - Código defensivo para escenarios imposibles
   - Abstracciones de 1 uso
   - Imports que no se usan
2. Elimina al menos 1 elemento concreto
3. Si algún archivo supera 200 LOC, simplificar
4. Verifica que sigue funcionando después de podar

> Métrica del 10%: si no tuviste que re-agregar nada, no fuiste agresivo.
