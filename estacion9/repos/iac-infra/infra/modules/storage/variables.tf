variable "proyecto" {
  description = "Nombre del proyecto — se usa en el naming de todos los recursos"
  type        = string
}

variable "environment" {
  description = "Entorno de despliegue: local, dev, prod"
  type        = string
}

variable "account_id" {
  description = "ID de la cuenta AWS — se incluye en el nombre del bucket para garantizar unicidad global"
  type        = string
}

variable "ttl_conversaciones_dias" {
  description = "Días antes de que expire una conversación en DynamoDB (TTL). La aplicación calcula expires_at con este valor."
  type        = number
  default     = 30
}
