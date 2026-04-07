# Checklist Frontend

Reglas para MoralScore: Next.js 15, TypeScript, Tailwind 4, VSA.

| # | Check | Umbral | Severidad |
|---|-------|--------|-----------|
| F1 | Componente > 150 LOC | Extraer sub-componentes | CRITICO |
| F2 | Archivo > 200 LOC | Dividir | CRITICO |
| F3 | Colores hardcodeados: hex (`#xxx`), tailwind palette (`text-red-400`, `bg-blue-500`, `text-gray-*`) | Usar Kohlberg tokens de shared/config/ | CRITICO |
| F4 | Import viola VSA: feature importa otra feature | Mover a shared/ o schemas/ | CRITICO |
| F5 | `style={{}}` inline | Prohibido, usar Tailwind | CRITICO |
| F6 | Z-index arbitrario (`z-50`, `z-[100]`) | Usar z-token si existe | CRITICO |
| F7 | Spacing arbitrario sin justificacion | Verificar coherencia | MEDIO |
| F8 | Props > 7 en un componente | Extraer a tipo/hook | MEDIO |
| F9 | Crea modal/boton/input desde cero | Usar shared/ui/ si existe | MEDIO |
| F10 | console.log olvidado | Eliminar | MENOR |
| F11 | Comentarios obvios que repiten el codigo | Eliminar | MENOR |

## Como verificar

**Colores hardcodeados**:
```bash
grep -nE "(#[0-9a-fA-F]{3,8}|text-(red|green|blue|gray|yellow|orange|purple|pink|indigo|emerald|amber|slate|zinc|neutral|stone)-[0-9]+|bg-(red|green|blue|gray|yellow|orange|purple|pink|indigo|emerald|amber|slate|zinc|neutral|stone)-[0-9]+)" <archivos>
```

**Excepcion**: hex dentro de `<path fill="...">` o `<svg>` de terceros es aceptable. Colores Kohlberg definidos en `shared/config/kohlberg-stages.ts` son aceptables.

**Imports VSA**: Buscar `from "@/features/` dentro de archivos en `features/`. Una feature NO puede importar de otra feature. Solo de `shared/`, `schemas/`, `firebase/`.
