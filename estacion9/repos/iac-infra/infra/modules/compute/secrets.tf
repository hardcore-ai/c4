/**
 * Secrets Manager — API key del LLM
 *
 * Well-Architected (SEC): las credenciales del LLM NO van en variables de entorno
 * del contenedor. Terraform crea el secreto (contenedor vacío/placeholder); el
 * equipo de la aplicación le pone el valor real fuera de Terraform. Por eso el
 * lifecycle ignora cambios en secret_string — el valor real nunca vive en el
 * state ni en el código.
 *
 * La task definition inyecta este secreto vía `secrets` (valueFrom = ARN), y el
 * rol de EJECUCIÓN de ECS tiene permiso GetSecretValue solo sobre este ARN.
 */

resource "aws_secretsmanager_secret" "llm_api_key" {
  name        = "${local.nombre_base}-llm-api-key"
  description = "API key del proveedor de LLM para el asistente IA (${var.environment})"

  tags = merge(local.tags_comunes, {
    Name = "${local.nombre_base}-llm-api-key"
  })
}

resource "aws_secretsmanager_secret_version" "llm_api_key" {
  secret_id     = aws_secretsmanager_secret.llm_api_key.id
  secret_string = "REEMPLAZAR_CON_LA_API_KEY_REAL" # Placeholder — lo sobrescribe el equipo de la app

  lifecycle {
    # No revertir el valor real que ponga el equipo de la app fuera de Terraform
    ignore_changes = [secret_string]
  }
}
