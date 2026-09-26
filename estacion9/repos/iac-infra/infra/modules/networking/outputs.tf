output "vpc_id" {
  description = "ID de la VPC principal"
  value       = aws_vpc.principal.id
}

output "ids_subnets_publicas" {
  description = "IDs de las subnets públicas donde vive el ALB"
  value       = aws_subnet.publica[*].id
}

output "ids_subnets_privadas" {
  description = "IDs de las subnets privadas donde corren las tareas ECS"
  value       = aws_subnet.privada[*].id
}

output "id_security_group_alb" {
  description = "ID del security group del Application Load Balancer"
  value       = aws_security_group.alb.id
}

output "id_security_group_ecs" {
  description = "ID del security group de las tareas ECS"
  value       = aws_security_group.ecs.id
}

output "ip_publica_nat" {
  description = "IP pública del NAT Gateway — IP de salida de las tareas hacia el LLM externo"
  value       = aws_eip.nat.public_ip
}
