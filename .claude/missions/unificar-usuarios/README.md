# Misión: Unificar concepto de usuario/creador

> Todo actor que interactúa con MoralScore (bot, Lucas, Lady, ciudadano)
> es un "usuario" en la misma colección. Sin castas, sin enums rígidos.

## Problema

El campo `creadaPor` en fuentes es un enum rígido (`"publico" | "lucas" | "lady"`).
El bot usa `"bot-moralscore"` que ni está en el enum. El campo `evaluador` en
evaluaciones es un string libre. No hay colección de usuarios. No hay trazabilidad
de quién subió qué.

## Decisiones (Algoritmo de Musk aplicado)

| Eliminado | Por qué |
|-----------|---------|
| Enum `creadaPor` en FuenteSchema | Reemplazado por `userId` string FK |
| Rate limit por IP en `/api/fuente` | Redundante con auth obligatoria |
| Campo `evaluador` string libre | Unificar: `userId` FK a usuarios/ |

| Sobrevivió | Por qué |
|------------|---------|
| Colección `usuarios/{uid}` | Registro unificado de actores |
| `userId` como FK universal | Trazabilidad sin enums |
| Auth obligatoria para subir fuente | Seguridad + identidad |
| Bot como doc manual en usuarios/ | Mismo modelo, ID fijo |

## Modelo objetivo

```
usuarios/{id}
  id: "firebase-auth-uid" | "bot-moralscore"
  email: "lucasbecrod@gmail.com" | null
  nombre: "Lucas Becrod" | "MoralScore Bot"
  foto: string | null
  createdAt: ISO timestamp

fuentes/{id}
  ...campos existentes...
  userId: "firebase-auth-uid"    ← reemplaza creadaPor
  (creadaPor eliminado)

evaluaciones/{id}
  ...campos existentes...
  userId: "bot-moralscore"       ← reemplaza evaluador
  (evaluador eliminado)
```

## Agentes y orden de ejecución

```
A (Schema + Data + Rules) → B (Queries + API + Sync) → C (UI: auth gate)
```

Secuenciales — B depende de A, C depende de B.

## Archivos de misión

| Archivo | Agente | Alcance |
|---------|--------|---------|
| `SMEAC-A-schema-usuarios-data-rules.md` | A | Schema Zod, data JSON, Firestore rules |
| `SMEAC-B-queries-api-sync.md` | B | Queries, API route, sync-firestore |
| `SMEAC-C-ui-auth-subir-fuente.md` | C | SubirFuenteModal con auth gate |

## Post-implementación

1. `npx tsx data/integrity.test.ts` — actualizar test para incluir usuarios
2. `pnpm build` sin errores
3. Seed en emulador: 5 colecciones + usuarios
4. Verificar que subir fuente requiere login
5. Verificar que el bot aparece como usuario
