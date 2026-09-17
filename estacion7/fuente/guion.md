# Guion de clase: Estación 7

## Resultado de la sesión

Cada estudiante toma una tarea elegible de su paquete, implementa un cambio acotado, ejecuta su validación, abre o actualiza un PR y recibe una revisión cruzada. El merge no es requisito: depende de la evidencia y la revisión.

## Ruta de 120 minutos

| Minutos | Slides | Actividad | Evidencia |
| --- | --- | --- | --- |
| 0-15 | 1-5 | Revisar dependencias, alcance, aceptación y validación. Elegir una tarea. | ID, límites, dependencia y comando de validación. |
| 15-30 | 6 | Ejecutar un dispatch manual con una tarea del ejemplo o de un estudiante. | Contrato de ejecución revisado. |
| 30-70 | 7-8 | Implementar en forma individual o en parejas. Resolver dudas sobre alcance, contexto y herramientas. | Diff acotado o bloqueo documentado. |
| 70-90 | 9 | Ejecutar pruebas, inspeccionar el diff y registrar resultados. | Comandos, resultados y limitaciones. |
| 90-108 | 10 | Abrir o actualizar el PR. Hacer una revisión cruzada y corregir un hallazgo cuando corresponda. | PR y comentario de revisión. |
| 108-116 | 11-14 | Examinar qué automatiza OpenSymphony y cuándo hace falta política específica. | Elección de enfoque y justificación. |
| 116-120 | 15-16 | Actualizar el estado de la tarea y consultar los recursos. | Tarea o issue actualizado. |

## Demo guiada de 15 minutos

La demo usa una tarea pequeña y un repositorio preparado.

1. Elegir una tarea pequeña y confirmar que no está bloqueada.
2. Abrir su issue y archivo de tarea; señalar objetivo, límites y aceptación.
3. Entregar el contrato de dispatch al arnés elegido.
4. Revisar el plan corto antes de permitir ediciones.
5. Ejecutar el primer cambio y una validación rápida.
6. Mostrar cómo se registrarán diff, prueba, limitaciones y PR.

Si el entorno común falla, usar el diff preparado del ejemplo y evaluar su correspondencia con el contrato.

## Gas Town y Wheelhouse

Presentar dos afirmaciones separadas:

- La propuesta arquitectónica: al crecer la autonomía aparecen identidad, roles, autoridad, memoria, colas, revisión, incidentes y recuperación.
- El resultado reportado: Gas Town fue descontinuado y el autor dijo que no logró construir con él de forma confiable. Wheelhouse, Continuous Thunderdome y Wish Factory no tienen resultados publicados que permitan recomendarlos para los proyectos de los estudiantes.

El curso empieza con un ciclo manual para que cada estado y artefacto sea visible. OpenSymphony automatiza ese ciclo con componentes reutilizables. Un orquestador propio se justifica cuando la política, los roles o el gobierno forman parte del producto. EBO puede registrar relaciones entre agentes, delegaciones, artefactos, revisiones y efectos de producción.

## Relación con el curso de Parlina

El [prompt fuente del curso de Parlina](../../estacion6/fuente/prompt-parlina-orquestacion.md) aporta la taxonomía de arneses, meta-arneses, superficies cliente, integración programática y sistemas de trabajo. Esta estación no repite el catálogo. Usa la taxonomía para ubicar responsabilidades mientras el estudiante ejecuta un ciclo real.

## Plan de contingencia

- Sin Linear: usar el archivo de tarea y registrar “publicación pendiente”.
- Sin acceso de push: rama local, diff y evidencia; abrir PR después.
- Sin runner: elegir otra tarea lista o crear/usar la tarea de setup ya identificada.
- Sin tarea propia lista: usar el ejemplo de EntreVista AI.
