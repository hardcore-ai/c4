# LocalStack — Entorno AWS local

Emulador de servicios AWS que corre completamente en tu máquina. Sin cuentas, sin costos, sin credenciales reales.

---

## Qué incluye este setup

| Servicio | Puerto | Para qué |
|---------|--------|---------|
| **LocalStack Core** | `4566` | API Gateway unificado — todos los servicios AWS |
| **DynamoDB Admin** | `8001` | Web UI para explorar y editar tablas DynamoDB |
| **S3 Console** | `8002` | Web UI para navegar buckets y objetos S3 |

### Servicios AWS emulados

`S3` · `DynamoDB` · `ECS` · `ECR` · `IAM` · `ELBv2` · `CloudWatch` · `Logs` · `SecretsManager` · `SSM` · `SQS` · `SNS` · `Lambda` · `STS` · `Route53` · `ACM`

---

## Requisitos previos

| Herramienta | Versión mínima | Instalación |
|------------|---------------|-------------|
| Docker | 24+ | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Docker Compose | v2 (`docker compose`) | Incluido con Docker Desktop |
| `awslocal` | cualquiera | `pip install awscli-local` |
| `tflocal` (opcional) | cualquiera | `pip install terraform-local` |

Verificar instalación:

```bash
docker --version          # Docker version 24.x.x
docker compose version    # Docker Compose version v2.x.x
awslocal --version        # aws-cli/x.x.x
```

---

## Instalación desde cero

### 1. Clonar / posicionarse en este directorio

```bash
cd clase9/repos/localstack
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env si necesitas cambiar algún valor (DEBUG, PERSISTENCE, etc.)
```

### 3. Levantar los servicios

```bash
docker compose up -d
```

La primera vez descarga las imágenes (~500 MB). Esperar hasta ver el healthcheck verde:

```bash
docker compose ps
# NAME                        STATUS
# localstack-core             Up (healthy)
# localstack-dynamodb-admin   Up
# localstack-s3-console       Up
```

### 4. Verificar que LocalStack responde

```bash
curl http://localhost:4566/_localstack/health | jq .
```

Respuesta esperada: todos los servicios en estado `"available"` o `"running"`.

---

## Acceso a las interfaces web

### DynamoDB Admin — `http://localhost:8001`

Explorar, crear, editar y eliminar ítems en cualquier tabla DynamoDB local. Útil para verificar los datos persistidos por la aplicación o por Terraform.

### S3 Console — `http://localhost:8002`

Navegar la estructura de buckets y objetos S3. Permite subir, descargar y eliminar objetos desde el navegador.

### LocalStack Web Application (complemento, browser)

Para gestionar el resto de servicios (Lambda, SQS, ECS, CloudWatch, Secrets Manager, etc.) sin usar la CLI, usa la aplicación web oficial de LocalStack — gratuita con cuenta community:

1. Crear cuenta gratuita en [app.localstack.cloud](https://app.localstack.cloud)
2. Ir a **Resource Browser → Connect to LocalStack**
3. Configurar endpoint: `http://localhost:4566`
4. Explorar todos los recursos con el Resource Browser integrado

---

## Comandos básicos

### Gestión del entorno

```bash
# Levantar
docker compose up -d

# Ver logs en tiempo real
docker compose logs -f localstack

# Ver estado de servicios
docker compose ps

# Detener (preserva datos con PERSISTENCE=1)
docker compose stop

# Detener y eliminar contenedores (preserva volumen)
docker compose down

# Destruir todo incluyendo datos persistidos
docker compose down -v
```

### Verificar servicios disponibles

```bash
curl -s http://localhost:4566/_localstack/health | jq '.services'
```

---

## Uso con `awslocal`

`awslocal` es un wrapper de la AWS CLI que apunta automáticamente a `localhost:4566`. No requiere credenciales reales.

```bash
# Configurar credenciales dummy (solo necesario la primera vez)
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set region us-east-1
```

### Ejemplos de operaciones

```bash
# ── S3 ────────────────────────────────────────────────────────────────────────
awslocal s3 mb s3://mi-bucket
awslocal s3 ls
awslocal s3 cp archivo.txt s3://mi-bucket/
awslocal s3 ls s3://mi-bucket/

# ── DynamoDB ──────────────────────────────────────────────────────────────────
awslocal dynamodb list-tables

awslocal dynamodb create-table \
  --table-name conversaciones-dev \
  --attribute-definitions AttributeName=conversacion_id,AttributeType=S \
  --key-schema AttributeName=conversacion_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

awslocal dynamodb scan --table-name conversaciones-dev

# ── ECS ───────────────────────────────────────────────────────────────────────
awslocal ecs list-clusters
awslocal ecs list-services --cluster mi-cluster

# ── Lambda ────────────────────────────────────────────────────────────────────
awslocal lambda list-functions

# ── Secrets Manager ───────────────────────────────────────────────────────────
awslocal secretsmanager create-secret \
  --name /app/api-key \
  --secret-string "mi-clave-secreta"

awslocal secretsmanager get-secret-value --secret-id /app/api-key

# ── SSM Parameter Store ───────────────────────────────────────────────────────
awslocal ssm put-parameter \
  --name /app/config/env \
  --value "development" \
  --type String

awslocal ssm get-parameter --name /app/config/env
```

---

## Uso con Terraform (`tflocal`)

`tflocal` configura automáticamente el provider de AWS para que apunte a LocalStack.

```bash
# Estructura de un módulo Terraform para LocalStack
cd mi-modulo-terraform

# En lugar de:  terraform init / plan / apply
# Usar:         tflocal init / plan / apply
tflocal init
tflocal plan
tflocal apply
```

### Provider manual (sin tflocal)

Si prefieres configurar el provider directamente, usa este bloque en `providers.tf`:

```hcl
provider "aws" {
  region                      = "us-east-1"
  access_key                  = "test"
  secret_key                  = "test"
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    s3             = "http://localhost:4566"
    dynamodb       = "http://localhost:4566"
    ecs            = "http://localhost:4566"
    ecr            = "http://localhost:4566"
    iam            = "http://localhost:4566"
    elbv2          = "http://localhost:4566"
    logs           = "http://localhost:4566"
    cloudwatch     = "http://localhost:4566"
    secretsmanager = "http://localhost:4566"
    ssm            = "http://localhost:4566"
    sqs            = "http://localhost:4566"
    sns            = "http://localhost:4566"
    lambda         = "http://localhost:4566"
    sts            = "http://localhost:4566"
  }
}
```

---

## Persistencia de datos

Con `PERSISTENCE=1` (valor por defecto en `.env`), todos los recursos sobreviven reinicios del contenedor:

```bash
# Levantar → crear recursos → detener
docker compose up -d
awslocal s3 mb s3://prueba
docker compose stop

# Al volver a levantar, el bucket sigue ahí
docker compose up -d
awslocal s3 ls   # → s3://prueba ✓
```

Los datos se almacenan en el volumen Docker `localstack_data`. Para ver la ruta física:

```bash
docker volume inspect localstack_data
```

Para borrar los datos persistidos y empezar desde cero:

```bash
docker compose down -v
```

---

## Solución de problemas

### LocalStack no responde en `:4566`

```bash
# Ver logs detallados
docker compose logs localstack --tail 50

# Verificar healthcheck
docker inspect localstack-core | jq '.[0].State.Health'
```

### Error: `port is already allocated`

Otro proceso usa el puerto 4566:

```bash
# Identificar el proceso
lsof -i :4566

# O cambiar el puerto en docker-compose.yml:
# "127.0.0.1:4567:4566"  ← exponer en 4567 localmente
```

### Lambda no ejecuta / error de Docker socket

```bash
# Verificar que el socket Docker está montado correctamente
docker exec localstack-core ls -la /var/run/docker.sock

# En Linux, puede requerir permisos
sudo chmod 666 /var/run/docker.sock
```

### DynamoDB Admin o S3 Console no cargan

```bash
# Ver logs del servicio específico
docker compose logs dynamodb-admin --tail 30
docker compose logs s3-console --tail 30

# Verificar que localstack-core está healthy antes de que arranquen
docker compose ps localstack

# Reiniciar solo las UIs (sin reiniciar LocalStack)
docker compose restart dynamodb-admin s3-console
```

Para el resto de servicios (Lambda, SQS, ECS, etc.) usar la app oficial en el navegador:
- Ir a [app.localstack.cloud](https://app.localstack.cloud)
- Conectar a `http://localhost:4566`

### Recursos no persisten entre reinicios

Verificar que `PERSISTENCE=1` está configurado en `.env` y que el volumen existe:

```bash
docker volume ls | grep localstack
```

---

## Referencia rápida

| Tarea | Comando |
|-------|---------|
| Ver todos los recursos S3 | `awslocal s3 ls` |
| Ver tablas DynamoDB | `awslocal dynamodb list-tables` |
| Ver colas SQS | `awslocal sqs list-queues` |
| Ver funciones Lambda | `awslocal lambda list-functions` |
| Ver clusters ECS | `awslocal ecs list-clusters` |
| Ver secretos | `awslocal secretsmanager list-secrets` |
| Ver parámetros SSM | `awslocal ssm describe-parameters` |
| Health check | `curl localhost:4566/_localstack/health \| jq .` |
| Logs del contenedor | `docker compose logs -f localstack` |
| Reiniciar sin borrar datos | `docker compose restart` |
| Borrar todo | `docker compose down -v` |
