# ADR-[Número]: [Título de la Decisión]

> [!TIP]
> Un buen ADR no justifica por qué algo es "bueno", sino por qué es la "mejor opción entre las disponibles" para este caso específico.

## Estado
- **Estado:** [Propuesto | Aceptado | Deprecado]
- **Fecha:** YYYY-MM-DD
- **Decisor:** [Nombre del estudiante / IA]

## Contexto y Problema
*Describe brevemente el desafío técnico que enfrentamos.*
*Ejemplo: Necesitamos una forma de procesar imágenes de gran tamaño sin bloquear el hilo principal de la API para mantener una buena experiencia de usuario.*

## Alternativas Consideradas
1. **Opción A:** [Ej. Procesamiento Síncrono en la API] - *Descartada por impacto en latencia.*
2. **Opción B:** [Ej. Worker con Cola de Mensajes (SQS)] - *Opción recomendada.*
3. **Opción C:** [Ej. Solución Third-party (Cloudinary)] - *Descartada por costos altos a largo plazo.*

## Decisión
*Nuestra elección es **[Opción Seleccionada]**.*

### Justificación Técnica
- **Punto 1:** [Ej. Desacoplamiento total del procesamiento].
- **Punto 2:** [Ej. Capacidad de escalar workers de forma independiente].

## Consecuencias y Trade-offs
Toda decisión técnica tiene un precio. Sé honesto:

*   **Lo bueno (Pros):** [Ej. Sistema resiliente, API siempre disponible].
*   **Lo malo (Contras):** [Ej. Introduce complejidad de infraestructura, requiere manejo de estados 'pending' en el front].
*   **Impacto en NFRs:** [Ej. Mejora la Disponibilidad pero aumenta la Latencia de finalización de tarea].

---
*Validado mediante el framework AI-DLC - Fase Inception.*