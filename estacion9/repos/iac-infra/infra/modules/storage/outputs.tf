output "nombre_tabla_conversaciones" {
  description = "Nombre de la tabla DynamoDB de conversaciones — se pasa como variable de entorno al contenedor ECS"
  value       = aws_dynamodb_table.conversaciones.name
}

output "arn_tabla_conversaciones" {
  description = "ARN de la tabla DynamoDB — necesario para configurar la política IAM de mínimo privilegio del rol de tarea"
  value       = aws_dynamodb_table.conversaciones.arn
}

output "nombre_bucket_assets" {
  description = "Nombre del bucket S3 de assets y logs"
  value       = aws_s3_bucket.assets.bucket
}

output "arn_bucket_assets" {
  description = "ARN del bucket S3"
  value       = aws_s3_bucket.assets.arn
}
