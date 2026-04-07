# Post-Implementación: Tests + Commits + Seguridad

## Secuencia obligatoria

```
Implementación → PURGADO → Tests → Commits locales → [Checkpoint seguridad] → Push → PR
     A,B,C     → Musk P2 →  tests  →  /cicd-github  →    orquestador revisa  → push  → PR
```

> **PURGADO**: Después de implementar y antes de tests, cada agente aplica el Paso 2 del
> [Algoritmo de Musk](../references/algoritmo-musk.md) — eliminar abstracciones de 1 uso,
> estados intermedios innecesarios, código defensivo para escenarios imposibles.
> Métrica: si no tuviste que re-agregar nada, no fuiste agresivo.

El orquestador **nunca ejecuta** tests, commits ni push — genera prompts para agentes externos.

---

## Tests: reutilizar contexto del agente implementador

Si un agente ya implementó código, el prompt de tests va al **mismo agente** (contexto fresco).
No crear agente de tests desde cero.

```markdown
## Para el agente que ya implementó X:
Ahora escribe tests unitarios para la función que acabas de implementar.
Sigue el patrón de tests del mismo módulo.
```

---

## Commits: un único agente al final

Recoge el trabajo de todos los implementadores. No poner instrucciones manuales de git — el agente usa convenciones del proyecto.

```markdown
## Skills
Activa el skill `convenciones git` para los commits multi-repo.

## Misión
Hacer commits semánticos de los cambios en [repo] (repo independiente).
Un commit por tema. NO hacer push.
```

---

## Checkpoint de seguridad (orquestador) — antes del push

**Lo ejecuta el orquestador, no un agente.** Revisión de alto nivel antes de autorizar push.

```
☐ ¿Alguna función nueva expone datos de usuarios (PII) en logs o respuestas?
☐ ¿Algún cambio en reglas de acceso a Firestore (quién puede leer/escribir)?
☐ ¿Alguna función nueva puede ser invocada sin autenticación?
☐ ¿Algún batch o migración puede afectar documentos de producción si se despliega en beta?
☐ ¿Los guards nuevos pueden crear condiciones de carrera o loops infinitos?
☐ ¿Algún script nuevo tiene modo --eliminar o destructivo sin confirmación?
```

- **Todo ☑** → autorizar push: pedirle al agente de commits `git push origin develop`
- **Algún ☐** → bloquear push, describir el riesgo, esperar confirmación explícita del usuario

> El orquestador **no asume** que el push es seguro por defecto.

---

## Checklist de validación global (post todos los agentes)

```bash
# 1. Tests completos
cd [repo] && npm test

# 2. Build limpio
cd [repo] && npm run build

# 3. No imports rotos
grep -r "from.*@/lib/" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules

# 4. Git status limpio
git status
```
