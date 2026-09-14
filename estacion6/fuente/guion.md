# Guion de clase y fuentes

Preparado para C4, 10 de septiembre de 2026. Presentación canónica: `../estacion6.html`; exportación para enseñar: `../estacion6.pdf`. Los tiempos son una propuesta docente. La urgencia de «menos de 20 minutos» se interpreta como plazo de preparación, no duración de la clase; el calendario de C4 reserva 7–9 PM.

## Decisión pedagógica

Un solo ejemplo, EntreVista AI, conecta lo que ya se diseñó en estación 5 con un plan completo de implementación. El ejemplo de una tarea ilustra el formato; la entrega cubre todas las tareas del alcance definido. Los conceptos nuevos explican decisiones que el alumno toma en ese recorrido. No abrir tours por varias herramientas. La demostración de OpenSymphony y la implementación quedan para E7. El flujo manual es una propuesta didáctica; no se presenta como el acuerdo de usar la skill Dispatch, que fue objetada en la reunión.

## Guion de 120 minutos

| Reloj | Slides | Qué hacer y preguntar |
|---|---|---|
| 0–5 | 1–2 | Mostrar resultado esperado. Preguntar qué falta en «implementa autenticación». Recoger dos respuestas. |
| 5–11 | 3–4 | Explicar alcance/contexto/ejecución y modelo/arnés. Pedir que ubiquen su herramienta en el mapa. |
| 11–18 | 5 | Explicar skill/contexto/MCP/hook durante 3 min. Dar 4 min para clasificar ejemplos; conectar Impeccable con DESIGN.md. |
| 18–25 | 6–8 | Ejemplo trabajado: regla y alcance (2 min), criterios de aceptación (2), mapeo a Linear (2), una pregunta de comprobación (1). |
| 25–55 | 9 | Plan completo: 5 min reunir specs; 13 generar con create-implementation-plan; 8 revisar cobertura y dependencias; 4 corregir y registrar bloqueos. |
| 55–60 | 9 | Pausa. |
| 60–66 | 10–11 | Explicar continuidad (3 min); leer el gráfico y preguntar qué permite concluir (3). |
| 66–75 | 12 | Explicar hooks (3 min); cada pareja propone evento, acción y evidencia, y detecta qué NO garantiza (6). |
| 75–81 | 13 | Diseñar comparación A/B: explicación 2 min; alumnos identifican variables y una conclusión inválida 4 min. |
| 81–86 | 14 | EBO: explicar captura/evaluación 2 min; interpretar tres observaciones 3 min. Sin instalación. |
| 86–90 | 15 | Auto-mejora de modelo frente a arnés (3 min); preguntar qué evidencia exigirían antes de aceptar un cambio (1). |
| 90–108 | 16–17 | Puente a E7 (3 min); revisión cruzada del paquete y corrección (15). |
| 108–118 | 18 | Abrir preparación E7, probar accesos disponibles, recoger bloqueos/preguntas. |
| 118–120 | 19 | Mostrar dónde están las skills y las lecturas; cerrar con `recursos.md`. |

No hablar durante todos los minutos de un bloque. Las preguntas y trabajo de los estudiantes forman parte del tiempo. En caso de retraso, mantener práctica y tarea previa; recorrer EBO y auto-mejora en 3 minutos y dejar sus fuentes para lectura.

## Ejemplo trabajado: 7 minutos

Este bloque explica las slides 6–8 con el caso ya escrito en `../ejemplo-y-prompts.md`. No requiere ejecutar un agente ni publicar un ticket en vivo.

1. **Slide 6, 2 min:** señalar las reglas BR-PASS-01 a 04 y acotar el cambio a validador y pruebas. Preguntar qué queda fuera. Mostrar los pendientes de Unicode, módulo y runner: AUTH-01 sigue como borrador hasta resolverlos.
2. **Slide 7, 2 min:** recorrer un caso válido, uno de error y la cadena vacía. Relacionar cada entrada con la regla que comprueba. Explicar que el comando real de validación debe identificarse en el repo.
3. **Slide 8, 2 min:** explicar el mapeo: spec para reglas, manifest para inventario completo y archivos de tareas para contratos, Linear para estado y dependencias, PR/tests para evidencia. Si cambia el contrato, hay que alinear archivos de tareas e issues; no hay sincronización automática. La tabla ilustra el mapeo, no un ticket publicado.
4. **Cierre, 1 min:** preguntar «¿Qué falta para que esta tarea esté lista?» y recoger una respuesta concreta. Pasar a la práctica de la slide 9.

## Práctica en parejas: 30 minutos

5 min para reunir los artefactos del proyecto y confirmar todo el alcance; 13 para generar el paquete con la skill `../skills/create-implementation-plan/SKILL.md`; 8 para revisar cobertura y dependencias en pareja; 4 para corregir y registrar bloqueos. Usar el prompt completo de `../../estacion7/preparacion.md`. Los 30 minutos inician el plan; completarlo y revisarlo es la tarea previa de E7. No limitar la entrega al validador ni a una feature.

El paquete debe incluir `task-package.yaml`, `milestones.md` y un archivo por tarea conforme al contrato de la skill. La tabla `cobertura.md` vincula cada requisito con tareas o evidencia existente. Revisar IDs, archivos, milestones, referencias y ausencia de ciclos. No confundir paquete completo con todas las tareas desbloqueadas: identificar cuáles pueden ejecutarse primero. Si falta el spec propio, usar los artefactos disponibles de EntreVista AI y registrar el diseño pendiente del resto del alcance.

La skill está incluida como copia de la de OpenSymphony, sin modificaciones. El alumno puede pedir al arnés que lea y siga el archivo; no requiere instalar el orquestador. La publicación en Linear es un paso separado, posterior a revisión y dry-run si usa `convert-tasks-to-linear`. Si falla el acceso, conservar el paquete completo y registrar publicación pendiente.

## Notas para explicar la teoría con precisión

- Persistencia del razonamiento: capacidad del arnés/API para conservar estado entre interacciones; no pedir al alumno revelar razonamiento privado. Una nota humana de decisiones y pendientes ayuda al handoff, pero no reproduce esa capacidad interna.
- Compaction conserva una representación útil del historial para continuar con un contexto limitado; no es memoria perfecta. Evitar afirmar que todos los arneses preservan lo mismo.
- Experimento OpenAI: comparar exclusivamente 13,3% y 38,3% RHAE del conjunto público, GPT-5.6 Sol. No mezclar con el 7,8% de otra cifra del artículo. Cambiaron razonamiento retenido y compaction; el artículo también señala diferencia en unidades de ventana. Es evidencia sobre una configuración, no un aislamiento causal perfecto ni una mejora universal en código.
- Hook: reacción configurada a un evento. La semántica de bloqueo depende del evento y del arnés. Un hook pasivo no evita un merge; CI y revisión son controles distintos.
- EBO: distinguir ejecución completada, calidad de captura y calidad del trabajo. Un juicio debe enlazar evidencia; una captura incompleta limita lo que podemos concluir. No mostrar datos sintéticos como corrida real.
- Auto-mejora recursiva: un sistema participa en modificar componentes que usa en iteraciones posteriores. En modelos, el cambio de pesos requiere un proceso de entrenamiento; un chat no los modifica por escribir una memoria. En arneses, pueden cambiar instrucciones, skills o implementación manteniendo el modelo. Prime Agent y exo ilustran mecanismos, no una demostración de mejora ilimitada.
- Subagentes: dividir trabajo con límites claros y contexto propio puede ayudar. Ejemplo: uno revisa criterios mientras otro investiga convenciones. No dividir dos ediciones del mismo módulo sin coordinación. La revisión independiente necesita criterio y evidencia, no solo otra respuesta afirmativa.

## Fuentes verificadas para esta edición

| Tema | Fuente primaria | Uso |
|---|---|---|
| Persistencia y benchmark | [OpenAI, 29 julio 2026](https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores/) | Gráfico y alcance del experimento |
| Hooks | [Claude Code: hooks](https://code.claude.com/docs/en/hooks-guide) | Eventos y acciones; semántica dependiente del hook |
| Telemetría y evaluación | [Engineering Behavior Observatory](https://github.com/trilogy-group/engineering-behavior-observatory) | Captura de trayectoria/workspace y evaluación vinculada a evidencia |
| Arnés que se adapta | [Prime Agent](https://github.com/PrimeIntellect-ai/prime-agent) | Estado suplementario durable y refinamiento con historial |
| Agente modificable | [exoharness](https://exoharness.ai/) | Separación de estado durable y lógica del agente |
| Orquestación | [Symphony](https://github.com/openai/symphony), [OpenSymphony](https://github.com/kumanday/OpenSymphony) | Referencia y herramienta de demostración |
| Instalación | [Claude Code quickstart](https://code.claude.com/docs/en/quickstart), [Git](https://git-scm.com/install/) | Preparación de herramientas |

La lista distribuible y actualizable está en `../recursos.md`. La slide 19 funciona como índice proyectado; no reemplaza los enlaces del archivo.

## Organización y regeneración

El HTML de estación 6 es la fuente editable; su PDF es el material de presentación. `../ejemplo-y-prompts.md` contiene el caso de trabajo. `../../estacion7/preparacion.md` es la fuente del material previo; su PDF es la copia distribuible. El análisis del post-mortem y las capturas de verificación son internos, dentro de `fuente/`.

Para editar el deck, modificar HTML o su texto editable en navegador y volver a exportar. Se usa impresión Chromium, tamaño 1280 × 720, fondos habilitados, sin encabezados. No hay servidor ni dependencias remotas para abrirlo. La guía de preparación usa formato A4.
