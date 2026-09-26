---
name: iac
description: Convenciones de infraestructura como código del proyecto — Terraform con módulos networking/storage/compute, naming y tags obligatorios, reglas de seguridad, despliegue en LocalStack y AWS con workspaces separados, validación y drift. Usar al crear o modificar cualquier archivo .tf, .tfvars, el docker-compose de LocalStack o scripts/validate.sh.
---

# IaC — convenciones del proyecto

> Steering file por defecto del programa AI for Developers | 30X. Cópialo a `.claude/skills/iac/SKILL.md` en tu proyecto y ajusta nombres, región y módulos a tu producto.

## 1. Dónde va cada cosa

```
specs/architecture.md        → contrato: leer ANTES de generar cualquier módulo
infra/provider.tf            → un solo provider; LocalStack o AWS según variables
infra/main.tf                → cablea los módulos: networking → storage → compute
infra/providers-local.tfvars → valores para LocalStack
infra/providers-aws.tfvars   → valores para AWS real
infra/modules/<dominio>/     → main.tf · variables.tf · outputs.tf
scripts/validate.sh          → verifica recursos por tags + drift
```

## 2. Naming y tags (obligatorios)

- Nombre de recurso: `{proyecto}-{environment}-{componente}` vía `locals { nombre_base = "${var.proyecto}-${var.environment}" }`.
- Tags en **todos** los recursos: `Proyecto`, `Environment`, `ManagedBy = "terraform"`. `validate.sh` encuentra los recursos con ellos.
- Variables y outputs con `description` en español que explique para qué sirven, no qué tipo son.

## 3. Seguridad (no negociable)

1. IAM de mínimo privilegio: `Resource` con el ARN exacto, nunca `"*"`.
2. Cómputo en subnets privadas, sin IP pública. Solo el ALB recibe tráfico de internet.
3. El SG de la app acepta tráfico solo desde el SG del ALB, nunca desde `0.0.0.0/0`.
4. S3 siempre privado: los cuatro flags de Block Public Access en `true` y cifrado por defecto.
5. Secretos en Secrets Manager, inyectados vía `secrets`/`valueFrom`. Nunca en variables de entorno en claro ni en el state.
6. Sin account IDs hardcodeados: usar `data.aws_caller_identity`.

## 4. Un código, dos destinos

- La diferencia entre LocalStack y AWS vive **solo** en los `.tfvars`. Los módulos no cambian.
- Cada destino tiene su **workspace** (`local`, `aws`) y por lo tanto su propio state. Nunca aplicar AWS sobre el state de LocalStack.
- Usar siempre los scripts npm: ya seleccionan el workspace correcto.

```bash
npm run infra:init
npm run infra:plan:local   · npm run infra:apply:local   · npm run validate
npm run infra:plan:aws     · npm run infra:apply:aws     · npm run validate:aws
npm run infra:destroy:aws  # al terminar una demo en AWS: NAT, ALB y Fargate cobran por hora
```

## 5. Cómo trabaja el agente en este repo

1. Leer `specs/architecture.md` y este skill antes de escribir HCL.
2. Consultar el **Terraform MCP** para el schema real de cada recurso. No escribir atributos de memoria.
3. Validar límites y buenas prácticas con el **AWS Documentation MCP** cuando haya dudas.
4. Después de cada cambio: `terraform fmt -recursive` → `terraform validate` → `plan`. Mostrar el plan antes de cualquier `apply`.
5. Al cambiar un módulo, revisar que sus outputs y el cableado en `infra/main.tf` sigan correctos.
6. En LocalStack, `plan` después de `apply` muestra 2–3 cambios en listener, ECS service y bastion: son límites del emulador, no drift. `validate.sh` ya los distingue.
