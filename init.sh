#!/bin/bash
# ============================================================
# MoralScore — Script de inicialización del entorno de desarrollo
# Levanta emuladores Firebase + seedea datos + inicia Next.js
# ============================================================

set -e

# --- Colores ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${CYAN}[init]${NC} $1"; }
ok()    { echo -e "${GREEN}[✔]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
fail()  { echo -e "${RED}[✘]${NC} $1"; exit 1; }

# --- Config ---
EMULATOR_FIRESTORE_PORT=8080
EMULATOR_AUTH_PORT=9099
EMULATOR_STORAGE_PORT=9199
EMULATOR_UI_PORT=4000
NEXT_PORT=3000
HEALTH_TIMEOUT=60

# --- Dependencias ---
check_dependencies() {
  log "Verificando dependencias..."
  command -v node >/dev/null 2>&1 || fail "Node.js no encontrado"
  command -v firebase >/dev/null 2>&1 || fail "Firebase CLI no encontrado (npm i -g firebase-tools)"
  command -v pnpm >/dev/null 2>&1 || fail "pnpm no encontrado (npm i -g pnpm)"
  ok "Dependencias OK"
}

# --- Liberar puertos ---
free_port() {
  local port=$1
  if command -v lsof >/dev/null 2>&1; then
    local pid=$(lsof -ti :$port 2>/dev/null)
    if [ -n "$pid" ]; then
      warn "Puerto $port ocupado (PID $pid) — liberando..."
      kill -9 $pid 2>/dev/null || true
    fi
  elif command -v netstat >/dev/null 2>&1; then
    # Windows (Git Bash)
    local pid=$(netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING | awk '{print $5}' | head -1)
    if [ -n "$pid" ] && [ "$pid" != "0" ]; then
      warn "Puerto $port ocupado (PID $pid) — liberando..."
      taskkill //F //PID $pid 2>/dev/null || true
    fi
  fi
}

free_ports() {
  log "Liberando puertos..."
  free_port $EMULATOR_FIRESTORE_PORT
  free_port $EMULATOR_AUTH_PORT
  free_port $EMULATOR_STORAGE_PORT
  free_port $EMULATOR_UI_PORT
  free_port $NEXT_PORT
  sleep 2
  ok "Puertos libres"
}

# --- Health check ---
wait_for_service() {
  local name=$1
  local url=$2
  local timeout=$HEALTH_TIMEOUT
  local elapsed=0

  printf "  Esperando %s " "$name"
  while [ $elapsed -lt $timeout ]; do
    if curl -s "$url" >/dev/null 2>&1; then
      printf "\n"
      ok "$name listo"
      return 0
    fi
    printf "."
    sleep 2
    elapsed=$((elapsed + 2))
  done
  printf "\n"
  fail "$name no respondió en ${timeout}s"
}

# --- Emuladores ---
start_emulators() {
  log "Iniciando emuladores Firebase..."
  firebase emulators:start &
  EMULATOR_PID=$!

  wait_for_service "Firestore" "http://127.0.0.1:$EMULATOR_FIRESTORE_PORT"
  wait_for_service "Auth" "http://127.0.0.1:$EMULATOR_AUTH_PORT"
  wait_for_service "Storage" "http://127.0.0.1:$EMULATOR_STORAGE_PORT"
  wait_for_service "Emulator UI" "http://127.0.0.1:$EMULATOR_UI_PORT"
}

# --- Seed ---
seed_data() {
  log "Sedeando datos en emulador..."

  # Sync candidatos + fuentes + evaluaciones
  FIRESTORE_EMULATOR_HOST=127.0.0.1:$EMULATOR_FIRESTORE_PORT \
  NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true \
    npx tsx --env-file=.env.local scripts/sync-firestore.ts

  # Upload imágenes a Storage
  FIRESTORE_EMULATOR_HOST=127.0.0.1:$EMULATOR_FIRESTORE_PORT \
  FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:$EMULATOR_STORAGE_PORT \
    npx tsx --env-file=.env.local scripts/upload-images-to-storage.ts

  ok "Datos sedeados"
}

# --- Next.js ---
start_nextjs() {
  log "Iniciando Next.js dev server..."

  # Instalar dependencias si faltan
  if [ ! -d "node_modules" ]; then
    warn "node_modules no encontrado — instalando..."
    pnpm install
  fi

  pnpm dev &
  NEXT_PID=$!

  wait_for_service "Next.js" "http://127.0.0.1:$NEXT_PORT"
}

# --- Resumen ---
show_summary() {
  echo ""
  echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  MoralScore — Entorno de desarrollo listo${NC}"
  echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
  echo ""
  echo -e "  ${CYAN}App:${NC}          http://localhost:$NEXT_PORT"
  echo -e "  ${CYAN}Emulator UI:${NC}  http://127.0.0.1:$EMULATOR_UI_PORT"
  echo -e "  ${CYAN}Firestore:${NC}    http://127.0.0.1:$EMULATOR_FIRESTORE_PORT"
  echo -e "  ${CYAN}Auth:${NC}         http://127.0.0.1:$EMULATOR_AUTH_PORT"
  echo -e "  ${CYAN}Storage:${NC}      http://127.0.0.1:$EMULATOR_STORAGE_PORT"
  echo ""
  echo -e "  ${YELLOW}Ctrl+C para detener todo${NC}"
  echo ""
}

# --- Cleanup al salir ---
cleanup() {
  echo ""
  log "Deteniendo servicios..."
  kill $EMULATOR_PID 2>/dev/null || true
  kill $NEXT_PID 2>/dev/null || true
  ok "Servicios detenidos"
  exit 0
}

trap cleanup SIGINT SIGTERM

# --- Main ---
main() {
  echo ""
  echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║   MoralScore — Init Dev Environment  ║${NC}"
  echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
  echo ""

  check_dependencies
  free_ports
  start_emulators
  seed_data
  start_nextjs
  show_summary

  # Mantener vivo
  wait
}

main "$@"
