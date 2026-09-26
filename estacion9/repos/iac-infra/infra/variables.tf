variable "proyecto" {
  description = "Nombre del proyecto — prefijo de todos los recursos AWS"
  type        = string
  default     = "asistente-ia"
}

variable "environment" {
  description = "Entorno de despliegue: local, dev, prod"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "Región de AWS para el despliegue"
  type        = string
  default     = "us-east-1"
}

# ─── Variables de LocalStack ──────────────────────────────────────────────────

variable "localstack_endpoint" {
  description = "URL del endpoint de LocalStack. Vacío en despliegues reales de AWS."
  type        = string
  default     = ""
}

variable "aws_access_key" {
  description = "Access key para autenticación. Solo se usa con LocalStack (valor 'test'). En AWS real, usar el perfil de AWS CLI."
  type        = string
  default     = ""
  sensitive   = true
}

variable "aws_secret_key" {
  description = "Secret key para autenticación. Solo se usa con LocalStack (valor 'test'). En AWS real, usar el perfil de AWS CLI."
  type        = string
  default     = ""
  sensitive   = true
}

# ─── Variables de la aplicación ───────────────────────────────────────────────

variable "imagen_contenedor" {
  description = "URI completo de la imagen Docker del API en ECR"
  type        = string
  default     = "public.ecr.aws/nginx/nginx:latest" # Placeholder — reemplazar con la imagen real del asistente
}

variable "tareas_deseadas" {
  description = "Número de réplicas del servicio ECS"
  type        = number
  default     = 2
}

# ─── Variables EC2 dev (bastion) ──────────────────────────────────────────────

variable "ssh_public_key_path" {
  description = "Ruta al archivo .pub de la llave SSH (relativa a infra/)"
  type        = string
  default     = "keys/asistente-ia-dev.pub"
}

variable "ssh_allowed_cidr" {
  description = "CIDR autorizado para SSH al bastion EC2. En AWS real restringir a la IP propia."
  type        = string
  default     = "0.0.0.0/0"
}

variable "ec2_instance_type" {
  description = "Tipo de instancia EC2 para el bastion"
  type        = string
  default     = "t3.micro"
}
