#!/usr/bin/env bash
# validate.sh — Verifica que la infraestructura desplegada cumple la spec de arquitectura
# y que no hay drift entre el código y lo desplegado.
#
# Uso (desde cualquier carpeta):
#   bash scripts/validate.sh local   → LocalStack  (workspace "local", providers-local.tfvars)
#   bash scripts/validate.sh aws     → AWS real    (workspace "aws",   providers-aws.tfvars)
#
# Descubre los recursos por sus tags (Proyecto + Environment), nunca por IDs hardcodeados.

set -uo pipefail

MODO="${1:-local}"
case "$MODO" in
  local|aws) ;;
  *) echo "Uso: bash scripts/validate.sh [local|aws]"; exit 64 ;;
esac

cd "$(dirname "$0")/.."   # raíz del repo iac-infra

TFVARS="providers-${MODO}.tfvars"
PROYECTO="asistente-ia"
# El entorno y la región se leen del mismo .tfvars que usa Terraform: una sola fuente de verdad
ENVIRONMENT=$(sed -n 's/^environment *= *"\(.*\)".*/\1/p' "infra/$TFVARS")
AWS_REGION=$(sed -n 's/^aws_region *= *"\(.*\)".*/\1/p' "infra/$TFVARS")
NOMBRE_BASE="${PROYECTO}-${ENVIRONMENT}"

if [ "$MODO" = "local" ]; then
  # Credenciales ficticias: LocalStack las acepta y evita depender del perfil del usuario
  export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test
  CLI="aws --endpoint-url=${LOCALSTACK_ENDPOINT:-http://localhost:4566} --region $AWS_REGION"
else
  CLI="aws --region $AWS_REGION"
fi
FILTRO_TAGS="Name=tag:Proyecto,Values=$PROYECTO Name=tag:Environment,Values=$ENVIRONMENT"

ERRORES=0
log_ok()   { echo "  ✅  $1"; }
log_fail() { echo "  ❌  $1"; ERRORES=$((ERRORES + 1)); }
log_info() { echo ""; echo "── $1 ──────────────────────────────"; }
consulta() { $CLI "$@" --output text 2>/dev/null || echo "ERROR"; }

echo ""
echo "🔍  Validando [ $NOMBRE_BASE ] en $AWS_REGION — modo: $MODO"

# ─── Networking ───────────────────────────────────────────────────────────────
log_info "Networking"

VPCS=$(consulta ec2 describe-vpcs --filters $FILTRO_TAGS --query 'length(Vpcs)')
[ "$VPCS" = "1" ] && log_ok "VPC encontrada" || log_fail "VPC no encontrada (resultado: $VPCS) — ¿corriste el apply?"

SUBNETS=$(consulta ec2 describe-subnets --filters $FILTRO_TAGS --query 'length(Subnets)')
[ "$SUBNETS" = "4" ] && log_ok "4 subnets (2 públicas + 2 privadas)" || log_fail "Se esperaban 4 subnets, hay: $SUBNETS"

NATS=$(consulta ec2 describe-nat-gateways --filter $FILTRO_TAGS "Name=state,Values=available" --query 'length(NatGateways)')
[ "$NATS" = "1" ] && log_ok "NAT Gateway disponible (egress de las subnets privadas)" || log_fail "NAT Gateway no disponible (resultado: $NATS)"

SG_ECS_ABIERTO=$(consulta ec2 describe-security-groups --filters $FILTRO_TAGS "Name=group-name,Values=${NOMBRE_BASE}-sg-ecs" \
  --query "length(SecurityGroups[].IpPermissions[].IpRanges[?CidrIp=='0.0.0.0/0'][])")
[ "$SG_ECS_ABIERTO" = "0" ] && log_ok "SG de ECS no acepta tráfico desde 0.0.0.0/0" || log_fail "SG de ECS abierto a internet (resultado: $SG_ECS_ABIERTO)"

# ─── Compute ──────────────────────────────────────────────────────────────────
log_info "Compute"

CLUSTER=$(consulta ecs describe-clusters --clusters "${NOMBRE_BASE}-cluster" --query 'clusters[0].status')
[ "$CLUSTER" = "ACTIVE" ] && log_ok "ECS cluster ACTIVE" || log_fail "ECS cluster no activo (status: $CLUSTER)"

SERVICIO=$(consulta ecs describe-services --cluster "${NOMBRE_BASE}-cluster" --services "${NOMBRE_BASE}-servicio-api" --query 'services[0].status')
[ "$SERVICIO" = "ACTIVE" ] && log_ok "ECS service ACTIVE" || log_fail "ECS service no activo (status: $SERVICIO)"

ALB=$(consulta elbv2 describe-load-balancers --names "${NOMBRE_BASE}-alb" --query 'LoadBalancers[0].State.Code')
[ "$ALB" = "active" ] && log_ok "ALB activo" || log_fail "ALB no encontrado o no activo (estado: $ALB)"

SECRETO=$(consulta secretsmanager describe-secret --secret-id "${NOMBRE_BASE}-llm-api-key" --query 'Name')
[ "$SECRETO" = "${NOMBRE_BASE}-llm-api-key" ] && log_ok "Secreto del LLM en Secrets Manager" || log_fail "Secreto del LLM no encontrado"

# ─── Storage ──────────────────────────────────────────────────────────────────
log_info "Storage"

TABLA=$(consulta dynamodb describe-table --table-name "conversaciones-${ENVIRONMENT}" --query 'Table.TableStatus')
[ "$TABLA" = "ACTIVE" ] && log_ok "DynamoDB 'conversaciones-${ENVIRONMENT}' ACTIVE" || log_fail "Tabla DynamoDB no activa (status: $TABLA)"

BUCKET=$(consulta s3api list-buckets --query "Buckets[?starts_with(Name, '${NOMBRE_BASE}-assets-')].Name | [0]")
if [ -n "$BUCKET" ] && [ "$BUCKET" != "None" ] && [ "$BUCKET" != "ERROR" ]; then
  PAB=$(consulta s3api get-public-access-block --bucket "$BUCKET" \
    --query 'PublicAccessBlockConfiguration.[BlockPublicAcls,BlockPublicPolicy,IgnorePublicAcls,RestrictPublicBuckets]')
  [ "$(echo "$PAB" | tr -s '[:space:]' ' ' | xargs)" = "True True True True" ] \
    && log_ok "Bucket S3 privado (Block Public Access completo)" \
    || log_fail "Bucket S3 sin Block Public Access completo ($PAB)"
else
  log_fail "Bucket S3 de assets no encontrado"
fi

# ─── Drift detection ──────────────────────────────────────────────────────────
log_info "Drift (terraform plan)"

if ! terraform -chdir=infra workspace select "$MODO" >/dev/null 2>&1; then
  log_fail "No existe el workspace '$MODO' — ejecuta primero npm run infra:apply:$MODO"
  PLAN_RC=-1
else
  # -detailed-exitcode: 0 = sin cambios · 1 = error · 2 = hay cambios pendientes (drift)
  PLAN_FILE="validate-$$.tfplan"
  terraform -chdir=infra plan -var-file="$TFVARS" -detailed-exitcode -input=false -no-color \
    -out="$PLAN_FILE" >/tmp/validate-plan-$$.log 2>&1
  PLAN_RC=$?
fi

# LocalStack no emula tres atributos y el plan nunca llega a "No changes" en local.
# Solo en modo local se toleran esas diferencias conocidas; en AWS real cualquier cambio es drift.
diferencias_reales() {
  terraform -chdir=infra show -json "$PLAN_FILE" | python3 -c '
import json, sys
TOLERADAS = {
    "aws_lb_listener": {"port"},
    "aws_ecs_service": {"health_check_grace_period_seconds", "availability_zone_rebalancing"},
    "aws_instance": {"vpc_security_group_ids"},
}
plan = json.load(sys.stdin)
for rc in plan.get("resource_changes", []):
    ch = rc["change"]
    if ch["actions"] == ["no-op"]:
        continue
    antes, despues = ch.get("before") or {}, ch.get("after") or {}
    cambiadas = {k for k in set(antes) | set(despues) if antes.get(k) != despues.get(k) and k not in (ch.get("after_unknown") or {})}
    if ch["actions"] != ["update"] or not cambiadas <= TOLERADAS.get(rc["type"], set()):
        print(rc["address"], ch["actions"], sorted(cambiadas))
'
}

case $PLAN_RC in
  -1) ;;
  0) log_ok "Sin drift — lo desplegado coincide con el código" ;;
  2) if [ "$MODO" = "local" ] && [ -z "$(diferencias_reales)" ]; then
       log_ok "Sin drift real — solo diferencias conocidas del emulador (listener, grace period, SG del bastion)"
     else
       log_fail "Drift detectado — revisa: terraform -chdir=infra plan -var-file=$TFVARS"
       grep -E "^  # " /tmp/validate-plan-$$.log | head -5 | sed 's/^/        /'
     fi ;;
  *) log_fail "terraform plan falló (código $PLAN_RC)"; tail -5 /tmp/validate-plan-$$.log | sed 's/^/        /' ;;
esac
rm -f /tmp/validate-plan-$$.log "infra/${PLAN_FILE:-none}"

# ─── Resumen ──────────────────────────────────────────────────────────────────
echo ""
echo "─────────────────────────────────────────────"
if [ "$ERRORES" -eq 0 ]; then
  echo "✅  Validación exitosa — la infraestructura cumple la spec de arquitectura"
  echo ""
else
  echo "❌  Validación fallida — $ERRORES error(es)"
  echo ""
  exit 1
fi
