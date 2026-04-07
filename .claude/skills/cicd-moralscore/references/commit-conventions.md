# Convenciones de Commit

## Formato
```
tipo(scope): descripcion en espanol

Cuerpo opcional con mas detalle.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

## Tipos

| Tipo | Cuando |
|------|--------|
| `feat` | Nueva funcionalidad |
| `fix` | Correccion de bug |
| `chore` | Mantenimiento, limpieza, deps |
| `docs` | Documentacion, README |
| `perf` | Mejoras de rendimiento |
| `refactor` | Reestructura sin cambio funcional |

## Scope (opcional)

Usar el modulo afectado: `deploy`, `storage`, `auth`, `ranking`, `readme`, `claude`, `data`

## Ejemplo con HEREDOC

```bash
git commit -m "$(cat <<'EOF'
feat(auth): proteger formulario de registro con Google Auth

- Modal reutilizable AuthModal en shared/ui
- Firestore rules requieren auth para escritura
- Rate limiting en endpoints API

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

## Reglas

- NO usar `--amend` a menos que el usuario lo pida
- NO usar `--no-verify`
- Agregar archivos especificos, no `git add .`
- Verificar `pnpm build` antes de commit de features
