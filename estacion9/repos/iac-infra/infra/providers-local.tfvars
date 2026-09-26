# ─── Configuración LocalStack ─────────────────────────────────────────────────
# Usar con: terraform apply -var-file=providers-local.tfvars
#
# Requiere LocalStack Pro corriendo en Docker (ECS, ELBv2, EC2 son features Pro):
#   docker compose up -d    (desde la raíz del repo)
# ─────────────────────────────────────────────────────────────────────────────

localstack_endpoint = "http://localhost:4566"
aws_access_key      = "test"
aws_secret_key      = "test"
aws_region          = "us-east-1"
environment         = "local"
tareas_deseadas     = 1 # Una sola tarea en local es suficiente para la demo
