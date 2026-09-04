# Preguntas de Verificación de Requerimientos — EntreVista AI

El PRD provee una base muy sólida. Las siguientes preguntas cubren áreas críticas marcadas como **"TBD"** en el PRD, más decisiones técnicas y de compliance necesarias para comenzar el diseño e implementación.

Por favor responde cada pregunta llenando la letra elegida después del tag `[Answer]:`.
Si ninguna opción encaja, elige la última opción ("Otro") y describe tu respuesta.

---

## Sección 1: Stack Tecnológico (Backend)

## Pregunta 1
¿Qué lenguaje/framework de backend se usará para el Motor Conversacional y la API?

A) Python + FastAPI (recomendado para proyectos LLM/agénticos — ecosistema LangChain, LlamaIndex, SDKs nativos)
B) Python + Django REST Framework
C) Node.js + Express / Fastify (TypeScript)
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

## Pregunta 2
¿Qué framework/SDK se usará para la lógica agéntica (orquestación del agente, RAG, guardrails)?

A) LangChain + LangGraph (orquestación de grafos de agentes)
B) LlamaIndex (enfocado en RAG + razonamiento sobre documentos)
C) Anthropic Claude Agent SDK / claude-agent-sdk directo
D) SDK nativo del proveedor LLM sin framework de orquestación adicional
E) Otro (por favor describe después del tag [Answer]:)

[Answer]:C

---

## Sección 2: Modelo LLM

## Pregunta 3
¿Qué proveedor y modelo LLM se usará como núcleo del agente conversacional?

A) Anthropic Claude (claude-sonnet-4-6 o claude-opus-4-6) — mejor razonamiento en español, menor alucinación
B) OpenAI GPT-4o
C) Google Gemini 1.5 Pro
D) Modelo open-source self-hosted (Llama 3.x, Mistral)
E) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

## Sección 3: Frontend / Dashboard del Reclutador

## Pregunta 4
¿Qué stack se usará para el Dashboard del Reclutador (interfaz web)?

A) React + TypeScript (+ Vite o Next.js)
B) Next.js (React full-stack con SSR/SSG)
C) Vue.js + TypeScript
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

## Sección 4: Base de Datos

## Pregunta 5
¿Qué base de datos se usará para persistencia principal (sesiones, candidatos, transcripciones, evaluaciones)?

A) PostgreSQL — relacional, excelente para datos estructurados con compliance/auditoría
B) MongoDB — NoSQL, flexible para transcripciones y documentos semiestructurados
C) PostgreSQL + Redis (PostgreSQL para datos relacionales, Redis para sesiones/caché en tiempo real)
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:B

---

## Pregunta 6
¿Qué solución se usará para la base de conocimiento / RAG (búsqueda semántica por campaña)?

A) pgvector (extensión PostgreSQL — mantiene todo en una sola DB)
B) Pinecone (vector DB managed)
C) Weaviate o Qdrant (vector DB open-source self-hosted)
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:B

---

## Sección 5: Infraestructura y Deployment

## Pregunta 7
¿En qué plataforma cloud se desplegará el sistema?

A) AWS (Lambda, ECS/Fargate, RDS, S3)
B) Google Cloud Platform (Cloud Run, Cloud SQL, GCS)
C) Microsoft Azure
D) VPS/servidor propio (DigitalOcean, Hetzner, etc.)
E) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

## Pregunta 8
¿Qué estrategia de deployment se usará?

A) Contenedores Docker + orquestador (ECS, Cloud Run, Kubernetes)
B) Serverless functions (Lambda, Cloud Functions)
C) Monolito en servidor dedicado / VPS
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:B

---

## Sección 6: Autenticación del Dashboard

## Pregunta 9
¿Cómo se autenticarán los operadores/reclutadores en el dashboard?

A) Email + contraseña con JWT (implementación propia)
B) Auth0 o Clerk (servicio managed de autenticación)
C) Supabase Auth (incluye DB + Auth en una plataforma)
D) SSO via Google Workspace / Microsoft Entra (adecuado para empresas B2B)
E) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

## Sección 7: Telegram Bot

## Pregunta 10
¿Qué librería/framework se usará para el bot de Telegram?

A) python-telegram-bot (PTB) — librería oficial Python, bien mantenida
B) Aiogram — async-native para Python, alta performance
C) Telegraf (Node.js/TypeScript)
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:C

---

## Sección 8: Multi-tenancy

## Pregunta 11
¿Cuál es el modelo de multi-tenancy requerido para el MVP?

A) Tenant por schema de base de datos (aislamiento a nivel de schema en PostgreSQL)
B) Tenant por columna/campo en tablas compartidas (más simple, aislamiento lógico)
C) Tenant por base de datos separada (máximo aislamiento, más costoso operativamente)
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:B

---

## Sección 9: Compliance y Retención de Datos

## Pregunta 12
La política de retención default del PRD es 90 días con purga automática. ¿Esto es correcto para el MVP?

A) Sí — 90 días con purga automática es el default correcto
B) No — necesito un período diferente (describe después del tag [Answer]:)
C) Configurable por tenant desde el inicio (cada empresa define su política)
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

## Sección 10: Idioma del Código

## Pregunta 13
¿En qué idioma se escribirán los comentarios de código, variables, nombres de funciones y documentación técnica?

A) Inglés (recomendado para proyectos de software — convención universal)
B) Español
C) Inglés para código, español para comentarios de negocio/dominio
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

## Sección 11: Security Extension

## Pregunta 14 — Security Extensions
¿Se deben aplicar las reglas de seguridad (SECURITY-01 a SECURITY-15) como restricciones bloqueantes en este proyecto?

A) Sí — aplicar todas las reglas SECURITY como restricciones bloqueantes (recomendado para aplicaciones productivas)
B) No — omitir todas las reglas SECURITY (adecuado para PoCs, prototipos y proyectos experimentales)
C) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

## Sección 12: Prioridad de Desarrollo

## Pregunta 15
El PRD define un plan de 30/60/90 días. ¿Cuál es el orden de prioridad para el MVP de Día 30?

A) Seguir el plan exacto del PRD: Motor conversacional → Guardrails → Evaluación → Re-engagement
B) Priorizar primero el Dashboard del Reclutador para poder validar outputs antes del canal Telegram
C) Iniciar con el Motor de Evaluación + Rúbricas (el diferenciador clave del producto)
D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

*Por favor abre este archivo, responde todas las preguntas y avísame cuando hayas terminado.*
