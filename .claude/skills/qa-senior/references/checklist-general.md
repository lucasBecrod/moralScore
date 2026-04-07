# Checklist General

Reglas compartidas para MoralScore.

| # | Check | Umbral | Severidad |
|---|-------|--------|-----------|
| G1 | Dato cruza limites sin schema Zod | Agregar validacion Zod | CRITICO |
| G2 | Codigo duplicado (>10 lineas identicas en 2+ lugares) | Extraer helper | MEDIO |
| G3 | Abstraccion prematura (helper/hook usado 1 sola vez, <10 LOC) | Inline | MENOR |
| G4 | Errores silenciosos (catch vacio, sin log ni re-throw) | Agregar manejo | MEDIO |
| G5 | console.log olvidado | Eliminar | MEDIO |
| G6 | TODO/FIXME/HACK sin issue asociado | Documentar o resolver | MENOR |
| G7 | Secretos o API keys hardcodeadas | Mover a env vars | CRITICO |
