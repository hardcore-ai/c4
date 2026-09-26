/**
 * Módulo: storage
 * Capa de persistencia del asistente IA:
 * DynamoDB para el historial de conversaciones y S3 para assets y logs.
 */

locals {
  nombre_base = "${var.proyecto}-${var.environment}"

  tags_comunes = {
    Proyecto    = var.proyecto
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ─── DynamoDB: Tabla de conversaciones ────────────────────────────────────────

resource "aws_dynamodb_table" "conversaciones" {
  name         = "conversaciones-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "conversacion_id"
  range_key    = "timestamp"

  attribute {
    name = "conversacion_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  # TTL: DynamoDB elimina automáticamente las conversaciones expiradas.
  # La aplicación escribe expires_at = now + ttl_conversaciones_dias.
  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  # Point-in-time recovery: activo solo en prod (WA · fiabilidad vs. costo).
  point_in_time_recovery {
    enabled = var.environment == "prod"
  }

  tags = merge(local.tags_comunes, {
    Name = "conversaciones-${var.environment}"
  })
}

# ─── S3: Bucket de assets y logs ──────────────────────────────────────────────

resource "aws_s3_bucket" "assets" {
  # El account_id en el nombre garantiza unicidad global del bucket
  bucket = "${local.nombre_base}-assets-${var.account_id}"

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-assets"
    Uso  = "assets-y-logs"
  })
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Bloquear todo acceso público — el bucket nunca debe ser accesible desde internet
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
