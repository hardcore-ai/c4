# Preguntas de Clarificación — EntreVista AI

Se detectó una contradicción en las respuestas que requiere resolución antes de proceder.

---

## Contradicción: Arquitectura del Bot de Telegram vs. Backend Python

Respondiste:
- **Q1 (A)**: Backend = **Python + FastAPI**
- **Q2 (C)**: Framework agéntico = **Anthropic Claude Agent SDK** (Python-nativo)
- **Q10 (C)**: Telegram Bot = **Telegraf (Node.js/TypeScript)**

**Por qué es una contradicción**: El Anthropic Claude Agent SDK es una librería Python. Combinarla con Telegraf (Node.js) significa tener **dos runtimes separados** (Python + Node.js):
- Servicio 1: `telegram-bot` en Node.js + Telegraf (maneja webhooks de Telegram)
- Servicio 2: `ai-backend` en Python + FastAPI (maneja lógica agéntica + Claude SDK)
- El bot Node.js llamaría al backend Python via HTTP para cada mensaje

Esto es técnicamente viable pero añade complejidad operativa (dos servicios, dos Lambdas, dos pipelines de deploy).

---

## Pregunta de Clarificación 1
¿Cuál es la arquitectura de Telegram Bot que prefieres?

A) **Poliglota intencional**: Telegraf (Node.js) como gateway de Telegram + Python FastAPI como backend de AI. El bot Node.js delega la lógica agéntica al backend Python via API REST. (Tu selección original — más separación de responsabilidades)

B) **Monolito Python unificado**: Aiogram (Python, async-native) para el bot de Telegram, unificado con FastAPI + Anthropic Claude Agent SDK en el mismo runtime Python. (Menos complejidad operativa, un solo servicio)

C) **Poliglota con TypeScript SDK**: Telegraf (Node.js/TypeScript) + Anthropic TypeScript SDK directamente en el bot, sin necesidad del backend Python para la lógica agéntica. (TypeScript/Node.js como runtime principal para el bot, Python solo para la API REST de datos)

D) Otro (por favor describe después del tag [Answer]:)

[Answer]:A

---

*Por favor responde y avísame cuando estés listo para continuar.*
