terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ─── Provider AWS ─────────────────────────────────────────────────────────────
#
# Un solo provider que funciona en dos modos:
#
#   LocalStack  →  terraform apply -var-file=providers-local.tfvars
#   AWS real    →  terraform apply -var-file=providers-aws.tfvars
#
# La diferencia entre los dos modos son solo unas pocas variables:
#   localstack_endpoint, aws_access_key, aws_secret_key, y los flags de skip.
#
# ─────────────────────────────────────────────────────────────────────────────

provider "aws" {
  region = var.aws_region

  # En LocalStack: credenciales ficticias requeridas por el emulador.
  # En AWS real: vacías — el provider usa el perfil de AWS CLI configurado.
  access_key = var.aws_access_key != "" ? var.aws_access_key : null
  secret_key = var.aws_secret_key != "" ? var.aws_secret_key : null

  # Estos tres flags son true en LocalStack, false en AWS real.
  skip_credentials_validation = var.localstack_endpoint != ""
  skip_requesting_account_id  = var.localstack_endpoint != ""
  skip_metadata_api_check     = var.localstack_endpoint != ""

  # S3 path-style requerido para LocalStack (evita resolución DNS virtual-hosted)
  s3_use_path_style = var.localstack_endpoint != ""

  # Redirigir llamadas al emulador local. En AWS real, localstack_endpoint = ""
  # y el provider ignora estos valores usando los endpoints por defecto de AWS.
  endpoints {
    s3             = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    dynamodb       = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    ecs            = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    ecr            = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    iam            = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    logs           = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    elbv2          = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    ec2            = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    sts            = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    cloudwatch     = var.localstack_endpoint != "" ? var.localstack_endpoint : null
    secretsmanager = var.localstack_endpoint != "" ? var.localstack_endpoint : null
  }
}

# Data source para obtener el account_id actual (real en AWS, "000000000000" en LocalStack)
data "aws_caller_identity" "actual" {}
