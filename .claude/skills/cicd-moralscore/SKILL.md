---
name: cicd-moralscore
description: >
  Flujo CI/CD para MoralScore. Activar cuando se necesite: hacer commit, crear PR, merge a main,
  deployar a produccion, seedear datos, deployar rules de Firebase, o iniciar entorno de desarrollo.
  Tambien activar con "deploy", "commit", "push", "pr", "seed prod", "init dev".
---

# CI/CD MoralScore

## Entorno

- **Hosting:** Firebase App Hosting (auto-deploy en push a main)
- **BD:** Firestore (prod: moral-score, emulador: localhost:8080)
- **Storage:** Firebase Storage (moral-score.firebasestorage.app)
- **Auth:** Firebase Auth con Google
- **Branch principal:** main
- **Branch de trabajo:** feature branches

## Flujo de trabajo

### 1. Desarrollo local

Iniciar todo con un solo comando:
```bash
./init.sh
```
Levanta: emuladores (Auth 9099 + Firestore 8080 + Storage 9199) + seed datos + Next.js dev (3000).

### 2. Commits

Formato: `tipo(scope): descripcion en espanol`

Tipos: `feat`, `fix`, `chore`, `docs`, `perf`, `refactor`

Co-author obligatorio:
```
Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

Usar HEREDOC para el mensaje. Ver [references/commit-conventions.md](references/commit-conventions.md).

### 3. Branch + PR + Merge

```
feature branch --> PR (squash merge) --> main --> auto-deploy
```

1. `git checkout -b tipo/nombre-descriptivo`
2. Commit + push con `-u origin`
3. `gh pr create --title "..." --body "$(cat <<'EOF' ... EOF)"`
4. `gh pr merge N --squash --subject "..."`
5. `git checkout main && git pull`

### 4. Deploy a produccion

Push a main dispara auto-deploy en App Hosting. Las **rules** y **datos** requieren deploy manual.

Ver [references/deploy-produccion.md](references/deploy-produccion.md) para comandos completos.

### 5. Checklist pre-deploy

1. `pnpm build` pasa sin errores
2. Variables en `apphosting.yaml` actualizadas
3. Rules desplegadas si cambiaron
4. Datos sincronizados si cambiaron data/*.json
5. Imagenes en Storage si hubo candidatos nuevos

## Archivos clave

| Archivo | Proposito |
|---------|-----------|
| `apphosting.yaml` | Variables de entorno para deploy |
| `firebase.json` | Config emuladores + rules paths |
| `firestore.rules` | Reglas de seguridad Firestore |
| `storage.rules` | Reglas de seguridad Storage |
| `init.sh` | Script maestro de dev local |
| `scripts/sync-firestore.ts` | Seed idempotente (Admin SDK) |
| `scripts/upload-images-to-storage.ts` | Upload imagenes a Storage |
