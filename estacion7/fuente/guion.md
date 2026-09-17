# Guion de clase: Estación 7

## Resultado de la sesión

Cada estudiante toma una tarea elegible de su paquete, implementa un cambio acotado, ejecuta su validación, abre o actualiza un PR y recibe una revisión cruzada. El merge no es requisito: depende de la evidencia y la revisión.

## Ruta de 120 minutos

| Minutos | Slides | Actividad | Evidencia |
| --- | --- | --- | --- |
| 0–15 | 1–5 | Objetivo, mapa y gate de readiness. Cada estudiante elige una tarea. | ID, límites, dependencia y comando de validación. |
| 15–30 | 6 | Dispatch manual guiado con una tarea del ejemplo o de un estudiante. | Prompt/contrato de ejecución revisado. |
| 30–70 | 7–8 | Implementación individual o en parejas. El instructor destraba scope, contexto y herramientas. | Diff acotado o bloqueo documentado. |
| 70–90 | 9 | Ejecutar pruebas, inspeccionar diff y preparar evidencia. | Comandos, resultados y limitaciones. |
| 90–108 | 10 | Abrir/actualizar PR y revisión cruzada. Corregir un hallazgo si aplica. | PR y comentario de review. |
| 108–116 | 11–14 | Mostrar qué automatiza OpenSymphony y discutir reutilización frente a política específica. | Decisión: manual, reusable o propio; con razón. |
| 116–120 | 15–16 | Estado final, siguiente paso y recursos. | Tarea/issue actualizado, sin declarar Done sin evidencia. |

## Demo guiada de 15 minutos

La demo sí ejecuta trabajo. No consiste en explicar slides.

1. Elegir una tarea pequeña y confirmar que no está bloqueada.
2. Abrir su issue y archivo de tarea; señalar objetivo, límites y aceptación.
3. Entregar el contrato de dispatch al arnés elegido.
4. Revisar el plan corto antes de permitir ediciones.
5. Ejecutar el primer cambio y una validación rápida.
6. Mostrar cómo se registrarán diff, prueba, limitaciones y PR.

Si el entorno común falla, usar el diff ya preparado del ejemplo y hacer que la audiencia evalúe si cumple el contrato. La práctica de estudiantes se mantiene.

## Gas Town y Wheelhouse

Presentar dos afirmaciones separadas:

- La idea transferible: al crecer la autonomía emergen estructuras institucionales como identidad, roles, autoridad, memoria, colas, revisión, incidentes y recuperación.
- La advertencia empírica: Gas Town fue descontinuado y el autor reportó que no logró construir con él de forma confiable. No presentar Wheelhouse, Continuous Thunderdome ni Wish Factory como patrones validados para los proyectos de estudiantes.

La posición del curso es gradual: primero un ciclo manual observable; luego un orquestador reutilizable; solo después, si el producto necesita política, roles o gobierno inseparables de su dominio, considerar un orquestador propio. OpenSymphony busca mantener reutilizable el sustrato de coordinación e integración; EBO puede ampliar la observación desde trayectorias individuales hacia organizaciones de agentes.

## Relación con el curso de Parlina

El [prompt fuente del curso de Parlina](../../estacion6/fuente/prompt-parlina-orquestacion.md) aporta la taxonomía de arneses, meta-arneses, superficies cliente, integración programática y sistemas de trabajo. Esta estación no repite el catálogo. Usa la taxonomía para ubicar responsabilidades mientras el estudiante ejecuta un ciclo real.

## Plan de contingencia

- Sin Linear: usar el archivo de tarea y registrar “publicación pendiente”.
- Sin acceso de push: rama local, diff y evidencia; abrir PR después.
- Sin runner: elegir otra tarea lista o crear/usar la tarea de setup ya identificada.
- Sin tarea propia lista: usar el ejemplo de EntreVista AI.
