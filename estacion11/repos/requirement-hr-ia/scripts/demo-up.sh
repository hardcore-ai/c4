#!/usr/bin/env bash
# ============================================================
# demo-up.sh — Deja TODO corriendo para la demo de la Clase 11
#
# Idempotente: se puede ejecutar varias veces; solo arranca lo
# que falta. Orden:
#   1. Docker Desktop (si el daemon no responde)
#   2. LocalStack (docker-compose de iac-infra, Estación 9: clase9/ o estacion9/)
#   3. Tablas y secretos de la app (scripts/localstack-init.sh)
#   4. Stack de observabilidad (../otel-stack)
#   5. Webapp Next.js con OpenTelemetry (npm run dev en background)
#   6. Campaña de demo creada y ACTIVA + rutas precalentadas
#   7. Bot de Telegram en long polling, instrumentado con OTel
#      (se omite si .env.local no tiene TELEGRAM_BOT_TOKEN)
#
# Uso:
#   scripts/demo-up.sh            # levanta todo
#   scripts/demo-up.sh status     # solo verifica, no arranca nada
#
# Variables opcionales:
#   LOCALSTACK_DIR   carpeta con el docker-compose de LocalStack
#   DEMO_LOG         log de la webapp (default /tmp/webapp-clase11.log)
#   BOT_LOG          log del bot de Telegram (default /tmp/telegram-clase11.log)
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"          # requirement-hr-ia/
WEBAPP="$ROOT/webapp"
OTEL="$(cd "$ROOT/../otel-stack" && pwd)"
# LocalStack: el docker-compose de iac-infra (Estación 9). Se busca en el monorepo
# del programa (clase9/) y en el repo de la cohorte (estacion9/); LOCALSTACK_DIR lo fuerza.
if [ -z "${LOCALSTACK_DIR:-}" ]; then
  for d in "$ROOT/../../../clase9/repos/iac-infra" "$ROOT/../../../estacion9/repos/iac-infra"; do
    [ -f "$d/docker-compose.yml" ] && LOCALSTACK_DIR="$(cd "$d" && pwd)" && break
  done
fi
LOCALSTACK_DIR="${LOCALSTACK_DIR:-}"
DEMO_LOG="${DEMO_LOG:-/tmp/webapp-clase11.log}"
BOT_LOG="${BOT_LOG:-/tmp/telegram-clase11.log}"
CAMPAIGN_NAME="Demo Clase 11 — Agente de Servicio"
MODE="${1:-up}"

ok()   { printf "  \033[32m✓\033[0m %s\n" "$*"; }
warn() { printf "  \033[33m⚠\033[0m %s\n" "$*"; }
fail() { printf "  \033[31m✗\033[0m %s\n" "$*"; exit 1; }
step() { printf "\n\033[1m%s\033[0m\n" "$*"; }
wait_for() { # wait_for "descripción" segundos comando...  (cuenta segundos reales, no iteraciones)
  local what="$1" secs="$2"; shift 2
  local start=$SECONDS
  while (( SECONDS - start < secs )); do "$@" >/dev/null 2>&1 && return 0; sleep 3; done
  return 1
}

# ── 1. Docker ────────────────────────────────────────────────
step "1/7 Docker"
if docker info >/dev/null 2>&1; then
  ok "daemon activo ($(docker info --format '{{.ServerVersion}}'))"
else
  [ "$MODE" = "status" ] && fail "Docker no responde"
  systemctl --user start docker-desktop 2>/dev/null || true
  wait_for "docker" 120 docker info || fail "Docker Desktop no arrancó en 120 s"
  ok "Docker Desktop arrancado"
fi

# ── 2. LocalStack ─────────────────────────────────────────────
step "2/7 LocalStack (DynamoDB de la app)"
ls_health() { curl -sf --max-time 3 http://localhost:4566/_localstack/health; }
if ls_health >/dev/null; then
  ok "LocalStack responde en :4566"
else
  [ "$MODE" = "status" ] && fail "LocalStack no responde en :4566"
  [ -f "$LOCALSTACK_DIR/docker-compose.yml" ] || fail "No encuentro el docker-compose de LocalStack en '$LOCALSTACK_DIR' (exporta LOCALSTACK_DIR)"
  [ -n "${LOCALSTACK_AUTH_TOKEN:-}" ] || warn "LOCALSTACK_AUTH_TOKEN no está exportado; si el compose es Pro, fallará"
  docker compose -f "$LOCALSTACK_DIR/docker-compose.yml" up -d >/dev/null
  wait_for "localstack" 120 ls_health || fail "LocalStack no quedó sano en 120 s"
  ok "LocalStack arrancado"
fi

# ── 3. Tablas y secretos ──────────────────────────────────────
step "3/7 Tablas DynamoDB y secretos"
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}" AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}" AWS_DEFAULT_REGION=us-east-1
count_tables() { # el CLI de aws a veces muere con segfault al salir: reintenta y valida que sea un número
  local out i
  for i in 1 2 3; do
    out=$(aws --endpoint-url=http://localhost:4566 dynamodb list-tables --query 'length(TableNames)' --output text 2>/dev/null | head -1 || true)
    [[ "$out" =~ ^[0-9]+$ ]] && { echo "$out"; return 0; }
    sleep 1
  done
  echo 0
}
TABLES=$(count_tables)
if [ "$TABLES" -ge 6 ]; then
  ok "$TABLES tablas presentes"
else
  [ "$MODE" = "status" ] && fail "faltan tablas ($TABLES/6): ejecuta scripts/localstack-init.sh"
  bash "$ROOT/scripts/localstack-init.sh" >/dev/null 2>&1 || true
  TABLES=$(count_tables)
  [ "$TABLES" -ge 6 ] && ok "$TABLES tablas creadas" || fail "localstack-init.sh no creó las tablas"
fi

# ── 4. Stack de observabilidad ────────────────────────────────
step "4/7 Stack de observabilidad (otel-stack)"
gf_health() { curl -sf --max-time 3 http://localhost:3001/api/health; }
if [ "$MODE" != "status" ]; then
  docker compose -f "$OTEL/docker-compose.yml" up -d >/dev/null
fi
wait_for "grafana" 90 gf_health || fail "Grafana no responde en :3001"
wait_for "tempo" 60 sh -c 'curl -s --max-time 3 http://localhost:3200/ready | grep -q ready' || warn "Tempo aún calentando"
wait_for "loki" 60 sh -c 'curl -s --max-time 3 http://localhost:3100/ready | grep -q ready' || warn "Loki aún calentando"
curl -sf --max-time 3 -o /dev/null http://localhost:8888/metrics && ok "Collector, Tempo, Loki, Prometheus y Grafana $(gf_health | python3 -c 'import json,sys;print(json.load(sys.stdin)["version"])') arriba" || warn "Collector sin métricas internas en :8888"
DASH=$(curl -s -u admin:admin 'http://localhost:3001/api/search?type=dash-db' | python3 -c 'import json,sys;print(len(json.load(sys.stdin)))' 2>/dev/null || echo 0)
[ "$DASH" -ge 4 ] && ok "$DASH dashboards provisionados" || warn "solo $DASH dashboards provisionados (¿DASHBOARDS_DIR?)"

# ── 5. Webapp ─────────────────────────────────────────────────
step "5/7 Webapp EntreVista AI (Next.js + OTel)"
[ -f "$WEBAPP/.env.local" ] || fail "falta $WEBAPP/.env.local (cp .env.example .env.local y pon la OPENAI_API_KEY)"
grep -q '^OPENAI_API_KEY=sk-' "$WEBAPP/.env.local" || warn "OPENAI_API_KEY en .env.local no parece real: el chat no responderá"
grep -q '^NEXT_PUBLIC_DEV_MODE=true' "$WEBAPP/.env.local" || warn "NEXT_PUBLIC_DEV_MODE=true no está en .env.local: el login no mostrará usuario/contraseña"
[ -d "$WEBAPP/node_modules" ] || { [ "$MODE" = "status" ] && fail "falta node_modules"; (cd "$WEBAPP" && npm ci --no-audit --no-fund >/dev/null); ok "dependencias instaladas"; }
app_health() { curl -sf --max-time 20 http://localhost:3000/api/health | grep -q '"healthy"'; }
if ss -ltn 2>/dev/null | grep -q ':3000 '; then
  ok "algo escucha en :3000"
else
  [ "$MODE" = "status" ] && fail "la webapp no está corriendo en :3000"
  # setsid -f: sesión propia y sin esperar al hijo; sobrevive al cierre de esta terminal
  ( cd "$WEBAPP" && setsid -f npm run dev > "$DEMO_LOG" 2>&1 < /dev/null )
  ok "npm run dev lanzado en background (log: $DEMO_LOG)"
fi
wait_for "webapp" 150 app_health || fail "la webapp no responde healthy en :3000 (mira $DEMO_LOG)"
grep -q "\[OTel\] Instrumentation started" "$DEMO_LOG" 2>/dev/null && ok "OpenTelemetry activo → Collector" || warn "no veo la línea [OTel] en el log (¿proceso previo?)"
# Precalentar rutas para que la primera navegación en clase no compile en vivo
for p in /login /campaigns /review /settings; do curl -s -o /dev/null --max-time 60 "http://localhost:3000$p"; done
ok "rutas precalentadas (/login /campaigns /review /settings)"

# ── 6. Campaña de demo activa ─────────────────────────────────
step "6/7 Campaña de demo"
CJ=$(mktemp)
CSRF=$(curl -s -c "$CJ" -b "$CJ" http://localhost:3000/api/auth/csrf | python3 -c 'import json,sys;print(json.load(sys.stdin)["csrfToken"])')
curl -s -c "$CJ" -b "$CJ" -o /dev/null -X POST http://localhost:3000/api/auth/callback/credentials \
  --data-urlencode "csrfToken=$CSRF" --data-urlencode "username=test" --data-urlencode "password=test" --data-urlencode "json=true"
LIST=$(curl -s -b "$CJ" http://localhost:3000/api/campaigns)
CID=$(echo "$LIST" | python3 -c "import json,sys;cs=json.load(sys.stdin).get('campaigns',[]);m=[c for c in cs if c.get('name')=='$CAMPAIGN_NAME'];print(m[0]['campaignId'] if m else '')" 2>/dev/null || echo "")
if [ -z "$CID" ] && [ "$MODE" = "status" ]; then
  rm -f "$CJ"; fail "no existe la campaña de demo: ejecuta scripts/demo-up.sh sin argumentos"
elif [ -z "$CID" ]; then
  CID=$(curl -s -b "$CJ" -X POST http://localhost:3000/api/campaigns -H 'Content-Type: application/json' -d "{
    \"name\": \"$CAMPAIGN_NAME\",
    \"roleDescription\": \"Agente de servicio al cliente para soporte por chat. Responsable de resolver consultas, escalar casos complejos y mantener un tono empático. Requisitos: comunicación clara, manejo de objeciones y experiencia con herramientas de tickets.\",
    \"rubricTemplate\": \"bpo\",
    \"knowledgeBaseContent\": \"La empresa es una fintech LATAM con atención 24/7. Turnos rotativos. Beneficios: trabajo remoto y bono trimestral.\"
  }" | python3 -c 'import json,sys;print(json.load(sys.stdin)["campaign"]["campaignId"])')
  ok "campaña creada: $CID"
else
  ok "campaña ya existía: $CID"
fi
if [ "$MODE" = "status" ]; then
  STATUS=$(curl -s -b "$CJ" "http://localhost:3000/api/campaigns/$CID" | python3 -c 'import json,sys;print(json.load(sys.stdin)["campaign"]["status"])')
else
  STATUS=$(curl -s -b "$CJ" -X PUT "http://localhost:3000/api/campaigns/$CID" -H 'Content-Type: application/json' -d '{"status":"active"}' | python3 -c 'import json,sys;print(json.load(sys.stdin)["campaign"]["status"])')
fi
[ "$STATUS" = "active" ] && ok "campaña ACTIVA" || fail "la campaña no está activa (status=$STATUS)"
rm -f "$CJ"

# ── 7. Bot de Telegram ────────────────────────────────────────
# En local Telegram no puede llamar a un webhook en localhost: el bot corre
# como proceso aparte (long polling) con su propio arranque de OpenTelemetry.
step "7/7 Bot de Telegram (long polling + OTel)"
BOT_USER=$(grep -E '^TELEGRAM_BOT_USERNAME=' "$WEBAPP/.env.local" | cut -d= -f2- | tr -d "\"' \r" || true)
bot_pid() { pgrep -f "[s]cripts/telegram-polling.ts" | head -1 || true; }
# Un token real tiene la forma 123456:ABC...; el placeholder de .env.example no cuenta
if ! grep -qE '^TELEGRAM_BOT_TOKEN="?[0-9]+:[A-Za-z0-9_-]{30,}' "$WEBAPP/.env.local"; then
  BOT_USER=""
  warn "sin TELEGRAM_BOT_TOKEN real en .env.local: bot omitido (la demo funciona igual con /api/simulator)"
elif [ -n "$(bot_pid)" ]; then
  ok "bot @$BOT_USER ya estaba corriendo (pid $(bot_pid))"
else
  [ "$MODE" = "status" ] && fail "el bot de Telegram no está corriendo: ejecuta scripts/demo-up.sh sin argumentos"
  [ -x "$WEBAPP/node_modules/.bin/tsx" ] || fail "falta tsx: ejecuta 'npm install' en webapp/"
  ( cd "$WEBAPP" && setsid -f npm run telegram > "$BOT_LOG" 2>&1 < /dev/null )
  if ! wait_for "bot" 60 grep -q "is running" "$BOT_LOG"; then
    grep -q "409" "$BOT_LOG" && fail "Telegram respondió 409: otro proceso ya usa este bot (mira $BOT_LOG)"
    fail "el bot no arrancó en 60 s (mira $BOT_LOG)"
  fi
  grep -q "\[OTel\] Instrumentation started" "$BOT_LOG" && ok "bot @$BOT_USER escuchando con OpenTelemetry (log: $BOT_LOG)" || warn "bot arriba pero sin la línea [OTel] en $BOT_LOG"
fi
BOT_LINE=""; BOT_LOG_LINE=""
if [ -n "$BOT_USER" ]; then
  BOT_LINE=" Telegram   https://t.me/$BOT_USER?start=$CID"
  BOT_LOG_LINE=" Log del bot:      $BOT_LOG"
fi

# ── Resumen ───────────────────────────────────────────────────
cat <<EOF

────────────────────────────────────────────────────────────
 Todo listo para la demo
────────────────────────────────────────────────────────────
 App        http://localhost:3000        login test / test
 Grafana    http://localhost:3001        admin / admin (Skip al cambio de clave)
 Prometheus http://localhost:9090
 Campaña    $CID  (activa)
$BOT_LINE

 Simular un candidato (cada mensaje = una llamada al LLM):
   curl -s -X POST http://localhost:3000/api/simulator -H 'Content-Type: application/json' \\
     -d '{"action":"start","campaignId":"$CID","simulatedUserId":"demo-1"}'
   curl -s -X POST http://localhost:3000/api/simulator -H 'Content-Type: application/json' \\
     -d '{"action":"message","conversationId":"<CONVERSATION_ID>","message":"Sí, acepto continuar."}'

 Log de la webapp: $DEMO_LOG
$BOT_LOG_LINE
────────────────────────────────────────────────────────────
EOF
