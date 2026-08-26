# Requirements Verification Questions — SkillWall Live

Los documentos PRD y ADR son bastante completos. Las siguientes preguntas buscan clarificar detalles de implementación que no están explícitos.

## Question 1
¿Cuál es el catálogo de skills que se usará en la demo?

A) Proveer la lista exacta de skills ahora (por favor listarlos después del tag [Answer]:)
B) Usar un catálogo genérico de skills técnicos (ej: AWS, Terraform, Kubernetes, Python, Node.js, React, etc.)
C) Definirlo más adelante durante la fase de construcción
D) Other (please describe after [Answer]: tag below)

[Answer]: D. Ya se incluyó en el documento requirements.md 

## Question 2
¿Cuál es el sessionCode que se usará para la demo?

A) LATAM2026 (como sugiere el PRD)
B) Otro código específico (describir después del tag [Answer]:)
C) Configurable por variable de entorno
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
¿Cómo se protegerá el adminToken para los endpoints de administración?

A) Variable de entorno en Lambda (hardcoded para demo)
B) AWS Secrets Manager
C) Parámetro en AWS Systems Manager (SSM Parameter Store)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
Para el rate limiting de 5 TPS por IP, ¿dónde se implementará?

A) En el código de Lambda (in-memory con sliding window)
B) En API Gateway (throttling nativo de HTTP API)
C) Combinación: throttling básico en API Gateway + lógica adicional en Lambda
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
¿Cuál es la estructura de la tabla DynamoDB `participants`? El PRD indica skills y likes embebidos. ¿Confirmas este modelo?

A) Partition Key: sessionCode, Sort Key: participantId — skills como lista, likes como mapa {skillId: {count, voterIds[]}}
B) Partition Key: participantId — con sessionCode como atributo y GSI para queries por sesión
C) Single-table design con PK/SK genéricos para participantes, likes y leaderboard
D) Other (please describe after [Answer]: tag below)

[Answer]: D. Se incluye en el adr.md una definición

## Question 6
Para la lectura de fotos desde S3 (sin CloudFront), ¿qué mecanismo de acceso se usará?

A) Pre-signed read URLs generadas por el backend (con TTL)
B) Bucket con acceso público de lectura (solo el prefijo de fotos)
C) S3 Object URLs con bucket policy que permita lectura pública
D) Other (please describe after [Answer]: tag below)

[Answer]: A 

## Question 7
¿Cuál es la región AWS objetivo para el despliegue?

A) us-east-1 (N. Virginia)
B) us-west-2 (Oregon)
C) sa-east-1 (São Paulo — más cercana a LatAm)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
Para el frontend en Next.js 16, ¿se usará App Router o Pages Router?

A) App Router (recomendado en Next.js 16)
B) Pages Router (más simple para una SPA-like demo)
C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9
¿Cómo se manejará el monorepo? ¿Frontend y backend en el mismo repositorio?

A) Monorepo con carpetas separadas (ej: /frontend, /backend, /infra)
B) Monorepo con workspace de npm/pnpm para compartir tipos y constantes (skills catalog)
C) Repositorios separados
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10
Para la instrumentación OTel en el frontend (propagación de traceparent), ¿qué nivel de instrumentación se espera?

A) Mínimo: solo inyectar header traceparent en requests al backend (sin SDK OTel en browser)
B) Básico: SDK OTel en browser con auto-instrumentación de fetch/XHR
C) Completo: SDK OTel en browser con spans custom, web vitals y exportación a New Relic
D) Other (please describe after [Answer]: tag below)

[Answer]: C
