variable "proyecto" {
  description = "Nombre del proyecto — se usa en el naming de todos los recursos"
  type        = string
}

variable "environment" {
  description = "Entorno de despliegue: local, dev, prod"
  type        = string
}

variable "aws_region" {
  description = "Región de AWS — se usa para construir los service_name de los gateway endpoints"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "Bloque CIDR de la VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnets_publicas_cidrs" {
  description = "CIDRs de las subnets públicas — una por zona de disponibilidad"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "subnets_privadas_cidrs" {
  description = "CIDRs de las subnets privadas — una por zona de disponibilidad"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "zonas_disponibilidad" {
  description = "Zonas de disponibilidad donde desplegar las subnets"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}
