/**
 * Módulo: networking
 * Red base del proyecto: VPC, subnets públicas y privadas, Internet Gateway,
 * NAT Gateway (egress de las subnets privadas), tablas de rutas, gateway
 * endpoints (S3 y DynamoDB) y security groups para el ALB y ECS.
 *
 * Well-Architected:
 *   - REL: las tareas Fargate en subnets privadas necesitan el NAT Gateway para
 *     hacer pull de la imagen en ECR y llamar al LLM externo por internet.
 *   - COST/SEC: los gateway endpoints de S3 y DynamoDB (gratis) mantienen ese
 *     tráfico dentro de la red de AWS, sin pasar por el NAT ni por internet.
 */

locals {
  nombre_base = "${var.proyecto}-${var.environment}"

  tags_comunes = {
    Proyecto    = var.proyecto
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ─── VPC ──────────────────────────────────────────────────────────────────────

resource "aws_vpc" "principal" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-vpc"
  })
}

# ─── Subnets públicas (ALB + bastion) ─────────────────────────────────────────

resource "aws_subnet" "publica" {
  count = length(var.subnets_publicas_cidrs)

  vpc_id                  = aws_vpc.principal.id
  cidr_block              = var.subnets_publicas_cidrs[count.index]
  availability_zone       = var.zonas_disponibilidad[count.index]
  map_public_ip_on_launch = true

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-subnet-publica-${count.index + 1}"
    Tipo = "publica"
  })
}

# ─── Subnets privadas (ECS tasks) ─────────────────────────────────────────────

resource "aws_subnet" "privada" {
  count = length(var.subnets_privadas_cidrs)

  vpc_id            = aws_vpc.principal.id
  cidr_block        = var.subnets_privadas_cidrs[count.index]
  availability_zone = var.zonas_disponibilidad[count.index]

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-subnet-privada-${count.index + 1}"
    Tipo = "privada"
  })
}

# ─── Internet Gateway (tráfico entrante al ALB) ───────────────────────────────

resource "aws_internet_gateway" "principal" {
  vpc_id = aws_vpc.principal.id

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-igw"
  })
}

# ─── Tabla de rutas pública (subnets del ALB tienen salida a internet) ────────

resource "aws_route_table" "publica" {
  vpc_id = aws_vpc.principal.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.principal.id
  }

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-rtb-publica"
  })
}

resource "aws_route_table_association" "publica" {
  count = length(aws_subnet.publica)

  subnet_id      = aws_subnet.publica[count.index].id
  route_table_id = aws_route_table.publica.id
}

# ─── NAT Gateway (egress de las subnets privadas) ─────────────────────────────
# Las tareas Fargate en subnets privadas salen a internet a través del NAT para
# hacer pull de ECR y llamar al LLM externo. Un solo NAT en la primera subnet
# pública (suficiente para dev; en prod de alta disponibilidad, uno por AZ).

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-eip-nat"
  })
}

resource "aws_nat_gateway" "principal" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.publica[0].id

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-nat"
  })

  depends_on = [aws_internet_gateway.principal]
}

# ─── Tabla de rutas privada (salida a internet vía NAT) ───────────────────────

resource "aws_route_table" "privada" {
  vpc_id = aws_vpc.principal.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.principal.id
  }

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-rtb-privada"
  })
}

resource "aws_route_table_association" "privada" {
  count = length(aws_subnet.privada)

  subnet_id      = aws_subnet.privada[count.index].id
  route_table_id = aws_route_table.privada.id
}

# ─── Gateway endpoints (S3 y DynamoDB) ────────────────────────────────────────
# Gratis. Mantienen el tráfico a S3 y DynamoDB dentro de la red de AWS,
# sin pasar por el NAT Gateway (ahorro) ni por internet (seguridad).

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.principal.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.privada.id]

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-vpce-s3"
  })
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.principal.id
  service_name      = "com.amazonaws.${var.aws_region}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.privada.id]

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-vpce-dynamodb"
  })
}

# ─── Security Group: ALB ──────────────────────────────────────────────────────
# Solo acepta tráfico HTTP desde internet; todo lo demás está bloqueado.

resource "aws_security_group" "alb" {
  name        = "${local.nombre_base}-sg-alb"
  description = "Permite trafico HTTP entrante al ALB desde internet"
  vpc_id      = aws_vpc.principal.id

  ingress {
    description = "HTTP desde internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Todo el trafico saliente - el ALB necesita llegar a las tareas ECS"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-sg-alb"
  })
}

# ─── Security Group: ECS tasks ────────────────────────────────────────────────
# Las tareas solo aceptan tráfico en el puerto de la app y solo desde el ALB.

resource "aws_security_group" "ecs" {
  name        = "${local.nombre_base}-sg-ecs"
  description = "Permite trafico al API solo desde el ALB"
  vpc_id      = aws_vpc.principal.id

  ingress {
    description     = "Trafico al API desde el ALB unicamente"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Todo el trafico saliente - las tareas necesitan llamar al LLM externo"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-sg-ecs"
  })
}
