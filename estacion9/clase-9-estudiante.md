# Clase 9: Producción y Operación — Infraestructura en Nube con IaC e IA Generativa

**Programa:** AI for Developers | 30X · **Instructor:** Andres Caicedo · **Duración:** 2h

## 👋 Bienvenida

En la Clase 8 cerraste el pipeline de calidad: tu producto está implementado, revisado, documentado y testeado (E2E web, API y agentes con Persona + Juez). Hoy resuelves la pregunta que sigue de manera natural: **¿cómo llega esto a producción de forma reproducible?** Esta sesión cubre los fundamentos de computación en nube y el flujo completo de **Infraestructura como Código con Terraform** — desde la spec de arquitectura hasta el despliegue en AWS — todo acelerado con coding agents y MCPs (Terraform Registry, AWS Docs, LocalStack). Trabajamos sobre el repositorio `iac-infra` que despliega el mismo producto de Clase 8, primero en LocalStack y luego en AWS real con un cambio mínimo de provider.

## 🎯 De qué se trata

El producto está implementado, testeado y validado. Ahora la pregunta que el equipo enfrenta es: ¿cómo lo llevas a producción de forma confiable, reproducible y segura, sin depender de configuración manual? Esta sesión cubre los fundamentos de computación en nube — modelos de servicio, proveedores, democratización — y el flujo completo de infraestructura como código con Terraform: desde la spec de arquitectura hasta el despliegue, pasando por emulación local con LocalStack. Todo el proceso se acelera con coding agents que leen las specs del producto, consultan el Terraform Registry en tiempo real a través del Terraform MCP, y despliegan infraestructura desde el IDE sin salir del entorno de desarrollo.

## 📚 Qué vas a aprender

- Diferenciar **modelos de servicio cloud** (IaaS, PaaS, FaaS, AIaaS) y elegir el nivel correcto según cuánta responsabilidad operacional quieras asumir.
- Aplicar **IaC declarativa con Terraform** — flujo `init → plan → apply`, idempotencia, state management y composición de módulos reutilizables.
- Validar infraestructura sin costo ni credenciales reales con **LocalStack**, y migrar a **AWS** cambiando solo el provider.
- Usar el coding agent con **Terraform MCP, AWS Docs MCP y LocalStack MCP** para generar HCL preciso contra el schema real del provider.
- Diseñar la **spec de arquitectura** que el agente convierte en módulos Terraform — networking, compute, storage — respetando reglas de seguridad y naming.

## 🗺 Recorrido de la sesión

1. **Computación en la Nube** — Espectro **On-Premises → IaaS → PaaS → FaaS → AIaaS**. Proveedores (AWS · Azure · GCP) y alternativas PaaS. Cómo la nube democratizó capacidades antes exclusivas.
2. **Infraestructura como Código** — IaC declarativa vs scripts imperativos. **Idempotencia** y **state management**. El ecosistema: Terraform · Pulumi · CDK · Bicep · Ansible (cuándo cada uno).
3. **LocalStack: la nube en tu máquina** — El emulador intercepta el SDK de AWS. El mismo `.tf` apunta a `localhost:4566` o a `us-east-1` con un cambio de variable. Costo de un error local: 0€.
4. **IaC con IDEs Agénticos y MCPs** — Los tres MCPs clave: **Terraform MCP** (schemas en vivo), **AWS Docs MCP** (best practices) y **LocalStack MCP** (gestión del emulador desde el chat).
5. **Diseño de infraestructura** — La spec de arquitectura como **contrato agente-equipo**. Networking (VPC, subnets, SG), compute (ECS/Lambda), storage (S3/DDB). Principio de mínimo privilegio.
6. **Hands-on demostrativo** — `iac-infra` end-to-end: LocalStack en Docker → MCPs + steering file → generación de módulos desde la spec → `apply` en LocalStack → validación → provider swap → `apply` en AWS real → drift detection.

## 🎬 Qué vas a observar en vivo

- **`terraform plan` mostrando el diff** — salida en consola: `+` recursos a crear, `~` a cambiar, `-` a eliminar. Infraestructura declarativa en acción.
- **Agente consultando Terraform MCP en vivo** — preguntas "¿qué campos requiere `aws_ecs_task_definition`?" y el agente invoca el MCP en lugar de responder de memoria.
- **`terraform apply` contra LocalStack** — recursos creándose en el emulador en segundos, inspeccionables desde la UI gráfica. Sin costo, sin credenciales reales.
- **Provider swap: LocalStack → AWS real** — el mismo código `.tf`, solo cambia el endpoint del provider. `apply` despliega en la nube y recorres los recursos creados en la consola de AWS.
- **Drift detection con `terraform plan`** — sobre la infra ya desplegada, si el output es "No changes" la infraestructura está en el estado declarado. Ese es el cierre del ciclo de IaC.

## 📋 Antes de la clase

- [ ] Tener tu producto de la **Clase 8** corriendo en local y con tests pasando (`npm test`).
- [ ] **Docker** instalado y corriendo (`docker ps` debe responder) — LocalStack se ejecuta como contenedor.
- [ ] **Terraform** instalado (`terraform --version` debe responder).
- [ ] **Claude Code** instalado y con MCP habilitado (ver la guía de herramientas de la Clase 3).
- [ ] **LocalStack Pro**: `LOCALSTACK_AUTH_TOKEN` exportado en tu entorno (la demo usa ECS, ALB, EC2 y Secrets Manager).
- [ ] **Cuenta AWS** con permisos de creación de recursos (VPC, EC2, ECS, ELB, IAM, DynamoDB, S3, Secrets Manager) — la usaremos al final para el deploy real.
- [ ] Clona el repo de la sesión: `clases/clase9/repos/iac-infra`.

## ✅ Tu tarea

1. **Spec de arquitectura**: `architecture.md` con componentes, relaciones y restricciones de seguridad.
2. **Módulos Terraform**: al menos `networking`, `compute` y `storage` generados con el agente + Terraform MCP.
3. **LocalStack corriendo**: `docker compose up -d` con tu stack desplegado vía `terraform apply` contra `localhost:4566`.
4. **Provider swap documentado**: `providers-local.tfvars` vs `providers-aws.tfvars` listos para el día que despliegues a AWS real.

## 🛠 Qué vas a producir

| Artefacto | Formato |
|-----------|---------|
| Spec de arquitectura | `specs/architecture.md` |
| Módulos Terraform (networking · compute · storage) | `infra/modules/networking/` · `compute/` · `storage/` |
| Variables y outputs | `infra/variables.tf` · `infra/outputs.tf` |
| Provider configs (LocalStack y AWS) | `infra/providers-local.tfvars` · `infra/providers-aws.tfvars` |
| Scripts de validación | `scripts/validate.sh` |
| Docker Compose para LocalStack | `docker-compose.yml` |
| Skill de IaC + MCPs | `.claude/skills/iac/SKILL.md` · `.mcp.json` |

## 🤖 Herramientas que vas a usar

| Herramienta | Para qué |
|-------------|----------|
| **Terraform** | IaC multi-cloud declarativa con HCL · workflow `init → plan → apply` |
| **Terraform MCP Server** (HashiCorp) | El agente consulta el Registry en vivo: providers, schemas, recursos |
| **AWS Documentation MCP** (awslabs) | Valida configuraciones contra docs oficiales, best practices y límites |
| **LocalStack + LocalStack MCP** | Emulador AWS local + el agente lo gestiona desde el IDE |
| **Coding Agent** (Claude Code) | Genera módulos desde la spec, resuelve errores y propone scripts de validación |
| **Steering Files / Skills de IaC** | Naming, tagging y seguridad que el agente respeta al generar HCL |
| **awslocal** | Wrapper de AWS CLI apuntando a LocalStack — útil para inspección directa |

## 📦 Repositorios de la sesión

Recomendado: clonarlo antes de la sesión para tener el entorno listo.

| Repo | Contenido |
|------|-----------|
| `clase9/repos/iac-infra` | Infraestructura completa del producto: spec de arquitectura, módulos Terraform (networking · compute · storage), providers para LocalStack y AWS, scripts de validación, skill de IaC y `.mcp.json` |

## 📚 Recursos

- **Terraform Docs** — [developer.hashicorp.com/terraform](https://developer.hashicorp.com/terraform) — documentación oficial, language y CLI.
- **Terraform AWS Provider** — [registry.terraform.io/providers/hashicorp/aws](https://registry.terraform.io/providers/hashicorp/aws) — schemas y ejemplos de cada recurso.
- **LocalStack** — [docs.localstack.cloud](https://docs.localstack.cloud) — servicios soportados, configuración y CLI.
- **Terraform MCP Server** — [github.com/hashicorp/terraform-mcp-server](https://github.com/hashicorp/terraform-mcp-server) — el MCP oficial de HashiCorp.
- **AWS Documentation MCP** — [github.com/awslabs/mcp](https://github.com/awslabs/mcp) — el MCP de AWS Docs.
- **AWS Well-Architected Framework** — [aws.amazon.com/architecture/well-architected](https://aws.amazon.com/architecture/well-architected/) — los pilares para diseñar infraestructura en producción.
