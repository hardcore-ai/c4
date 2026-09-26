output "nombre_cluster_ecs" {
  description = "Nombre del cluster ECS donde corre el servicio"
  value       = aws_ecs_cluster.principal.name
}

output "dns_load_balancer" {
  description = "DNS público del ALB — URL base del API en este entorno"
  value       = aws_lb.principal.dns_name
}

output "arn_load_balancer" {
  description = "ARN del ALB — útil para configurar registros DNS en Route 53"
  value       = aws_lb.principal.arn
}

output "nombre_servicio_ecs" {
  description = "Nombre del servicio ECS que gestiona las tareas del API"
  value       = aws_ecs_service.api.name
}

output "nombre_log_group" {
  description = "Nombre del grupo de logs en CloudWatch para el API"
  value       = aws_cloudwatch_log_group.api.name
}

output "arn_secreto_llm" {
  description = "ARN del secreto de Secrets Manager para la API key del LLM"
  value       = aws_secretsmanager_secret.llm_api_key.arn
}

# ─── Outputs EC2 dev (bastion) ────────────────────────────────────────────────

output "ec2_dev_id" {
  description = "ID de la instancia EC2 de desarrollo"
  value       = aws_instance.dev.id
}

output "ec2_dev_public_ip" {
  description = "IP pública de la instancia EC2 — punto de SSH"
  value       = aws_instance.dev.public_ip
}

output "ec2_dev_key_name" {
  description = "Nombre del key pair registrado en AWS"
  value       = aws_key_pair.instancia_dev.key_name
}

output "ec2_dev_ssh_command" {
  description = "Comando listo para conectarse por SSH a la instancia"
  value       = "ssh -i keys/asistente-ia-dev ec2-user@${aws_instance.dev.public_ip}"
}
