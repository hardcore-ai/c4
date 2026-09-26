/**
 * Módulo: compute
 * Cluster ECS Fargate con su servicio, task definition y Application Load
 * Balancer. El servicio corre el API del asistente IA.
 *
 * Well-Architected:
 *   - OPS: Container Insights (enhanced) en el cluster.
 *   - REL: deployment circuit breaker con rollback automático en el servicio.
 *   - SEC: la API key del LLM se inyecta desde Secrets Manager (ver secrets.tf),
 *     no como variable de entorno en claro; IAM de mínimo privilegio.
 */

locals {
  nombre_base = "${var.proyecto}-${var.environment}"

  tags_comunes = {
    Proyecto    = var.proyecto
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# ─── IAM: Rol de ejecución de tareas ECS ──────────────────────────────────────
# ECS usa este rol para pull de la imagen en ECR, escribir logs en CloudWatch y
# leer el secreto del LLM en el arranque de la tarea.

resource "aws_iam_role" "ejecucion_tarea_ecs" {
  name = "${local.nombre_base}-rol-ejecucion-ecs"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = local.tags_comunes
}

resource "aws_iam_role_policy_attachment" "ejecucion_tarea_ecs_politica_base" {
  role       = aws_iam_role.ejecucion_tarea_ecs.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Permiso para leer SOLO el secreto del LLM (mínimo privilegio)
resource "aws_iam_role_policy" "ejecucion_lee_secreto_llm" {
  name = "${local.nombre_base}-politica-secreto-llm"
  role = aws_iam_role.ejecucion_tarea_ecs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = aws_secretsmanager_secret.llm_api_key.arn
    }]
  })
}

# ─── IAM: Rol de la tarea (permisos que necesita la app en runtime) ───────────

resource "aws_iam_role" "rol_tarea_ecs" {
  name = "${local.nombre_base}-rol-tarea-ecs"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = local.tags_comunes
}

resource "aws_iam_role_policy" "acceso_dynamodb" {
  name = "${local.nombre_base}-politica-dynamodb"
  role = aws_iam_role.rol_tarea_ecs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ]
      # Restringido al ARN exacto de la tabla de este entorno — mínimo privilegio
      Resource = var.arn_tabla_dynamodb
    }]
  })
}

# ─── CloudWatch: Grupo de logs para el API ────────────────────────────────────

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${local.nombre_base}-api"
  retention_in_days = 30

  tags = local.tags_comunes
}

# ─── ECS Cluster (con Container Insights) ─────────────────────────────────────

resource "aws_ecs_cluster" "principal" {
  name = "${local.nombre_base}-cluster"

  # WA · OPS: telemetría detallada del cluster hasta nivel de contenedor
  setting {
    name  = "containerInsights"
    value = "enhanced"
  }

  tags = local.tags_comunes
}

# ─── ECS Task Definition ──────────────────────────────────────────────────────

resource "aws_ecs_task_definition" "api" {
  family                   = "${local.nombre_base}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu_tarea
  memory                   = var.memoria_tarea
  execution_role_arn       = aws_iam_role.ejecucion_tarea_ecs.arn
  task_role_arn            = aws_iam_role.rol_tarea_ecs.arn

  container_definitions = jsonencode([{
    name      = "asistente-api"
    image     = var.imagen_contenedor
    essential = true

    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]

    # Config no sensible como variables de entorno
    environment = [
      { name = "PORT", value = "3000" },
      { name = "AWS_REGION", value = var.aws_region },
      { name = "DYNAMODB_TABLE", value = var.nombre_tabla_dynamodb }
    ]

    # Secreto del LLM inyectado desde Secrets Manager (no en claro)
    secrets = [
      { name = "LLM_API_KEY", valueFrom = aws_secretsmanager_secret.llm_api_key.arn }
    ]

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = local.tags_comunes
}

# ─── Application Load Balancer ────────────────────────────────────────────────

resource "aws_lb" "principal" {
  name               = "${local.nombre_base}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.id_security_group_alb]
  subnets            = var.ids_subnets_publicas

  tags = local.tags_comunes
}

resource "aws_lb_target_group" "api" {
  name        = "${local.nombre_base}-tg-api"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # requerido por Fargate awsvpc

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }

  tags = local.tags_comunes
}

# NOTA (WA · SEC · prod): en producción, añadir un listener HTTPS :443 con
# certificado ACM y redirigir 80 → 443. Se omite aquí porque requiere un dominio.
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.principal.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

# ─── ECS Service ──────────────────────────────────────────────────────────────

resource "aws_ecs_service" "api" {
  name            = "${local.nombre_base}-servicio-api"
  cluster         = aws_ecs_cluster.principal.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.tareas_deseadas
  launch_type     = "FARGATE"

  # Ignora health checks del LB durante el arranque de tareas nuevas
  health_check_grace_period_seconds = 60

  network_configuration {
    subnets          = var.ids_subnets_privadas
    security_groups  = [var.id_security_group_ecs]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "asistente-api"
    container_port   = 3000
  }

  # WA · REL: rollback automático si un deploy no alcanza estado estable
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  # No revertir el escalado manual/autoscaling
  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [aws_lb_listener.http]

  tags = local.tags_comunes
}
