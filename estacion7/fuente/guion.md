# Guion de clase: Estación 7

La clase combina un recorrido por Parlina con una demostración del instructor. Los estudiantes podrán aplicar después el proceso al paquete completo de tareas preparado en E6. No hay bloques de implementación ni revisión entre estudiantes durante la sesión.

## Recorrido de 120 minutos

| Minutos | Slides | Pantalla y contenido |
| --- | --- | --- |
| 0-4 | 1-2 | Presentación: recorrido y las dos tareas de la demo. |
| 4-44 | 3-8 | Alternar cada resumen de sección con las portadas de sus lecciones en Parlina. |
| 44-50 | 9-10 | Actualización sobre Gas Town y alcance de EBO. |
| 50-60 | 11-12 | Terminal: instalación y configuración del repo de demostración. |
| 60-75 | 13 | Arnés y Linear: plan completo, revisión, dry-run y publicación. |
| 75-85 | 14 | Terminal y desktop: correr el orquestador, observar despacho y Agent Workpad. |
| 85-95 | 15-16 | GitHub y Linear: historial de revisión y landing de una tarea preparada. |
| 95-110 | 17-19 | Desktop: grafos de tareas, conocimiento y código. |
| 110-120 | 20 | Aplicación al proyecto y preguntas. |

## Recorrido por Parlina

Abrir el resumen de cada sección y después cambiar a Parlina. Dedicar 1-2 minutos por lección a su portada y a una idea aplicable al proyecto. Los 40 minutos incluyen los seis resúmenes: usar cerca de un minuto por lección sencilla y reservar dos para conceptos que necesiten ejemplo. Volver a la presentación al cambiar de sección.

| Sección proporcionada por el instructor | Slide | Ejemplo para conectar con el proyecto |
| --- | --- | --- |
| Fundamentos y Taxonomía de la Ingeniería Agencial | 3 | Quién ejecuta un comando y quién decide qué tarea sigue. |
| Patrones Arquitectónicos de Coordinación Agencial | 4 | Dónde se guarda el avance para continuar mañana. |
| Arneses de Desarrollo e Integración Programática | 5 | Cómo recibe el coordinador un error o una solicitud de aprobación. |
| OpenAI Symphony: Especificación Normativa y Motor Central | 6 | Por qué un issue puede existir sin estar habilitado para despacho. |
| OpenSymphony: Implementación Local-First en Rust y Extensiones | 7 | Seguir un issue desde Linear hasta su workspace, PR y memoria. |
| Gobernanza, Verificación Mecánica y Evaluación Empírica | 8 | Qué evidencia permite integrar el commit actual. |

La sección 3 se ajustó a los índices de las lecciones 8-11 compartidos por el instructor. Las demás secciones usan los seis títulos proporcionados y el [prompt fuente](../../estacion6/fuente/prompt-parlina-orquestacion.md); sus índices completos y URLs individuales siguen pendientes de contraste.

### Sección 3: recorrido por las lecciones 8-11

| Lección | Título en Parlina | Conceptos que señalar al abrir la portada |
| --- | --- | --- |
| 8 | Protocolo y Ciclo de Vida de Codex app-server | Transporte JSON-RPC 2.0; Thread, Turn e Item; streaming y control de turnos; aprobaciones y RPC bidireccional; contratos in-process, app-server y servidor remoto; implementación del cliente. |
| 9 | Integración en Proceso con pi SDK y Sistema de Extensiones | AgentSession y AgentSessionRuntime; concurrencia; intercepción de eventos y permisos; herramientas y cola de mutación de archivos; runtime embebido con gate de seguridad. |
| 10 | Optimización Nativa de Bajo Nivel: Análisis de oh-my-pi | Ejecución nativa en proceso; edición anclada con Hashline; LSP para comprobaciones semánticas; DAP para depuración; aislamiento de subagentes con pi-iso; diagnóstico de fallos de edición. |
| 11 | Comparativa de SDKs: Claude Agent SDK, OpenHands y OpenCode | Bibliotecas embebidas y cliente-servidor; proceso y subprocesos; arquitectura híbrida y Agent Server; cliente HTTP/REST; acoplamiento a proveedores; permisos, hooks y sandboxing; selección de SDK según requisitos. |

Estos puntos resumen los índices aportados, no una verificación independiente de las capacidades actuales de cada producto. Las actividades de las lecciones quedan como material de consulta posterior. Orca, Paseo y OpenChamber corresponden a la lección 2 de la sección 1 y se presentan allí al distinguir cliente, host y meta-arnés.

## Preparación de la demo

- Abrir Parlina, Linear, GitHub, terminal y desktop en las cuentas y proyectos de demostración.
- Usar un repo con spec pequeño pero completo, acceso de escritura, pruebas disponibles y rama de destino comprobada.
- Preparar una tarea nueva para planificación y despacho, y otra con PR revisado por agentes durante varios ciclos, CI vigente y condiciones de integración satisfechas. No depender de que la primera termine durante la sesión.
- Tener un paquete completo validado disponible por si la planificación tarda. Identificarlo como trabajo preparado previamente.
- Comprobar instalación, autenticación del arnés y arranque de desktop antes de clase. Una compilación o descarga puede exceder el bloque asignado.
- Preparar una cápsula real con enlaces a su issue/PR y un símbolo indexado para la navegación. Las capturas del deck contienen datos de ejemplo; no son evidencia de la demo.

## Instalación y configuración: 10 minutos

Desde el repo de demostración:

```sh
cargo install opensymphony
opensymphony init
```

Revisar proyecto de Linear, estados observados, rama de destino, credenciales disponibles, arnés y modelo. Abrir `WORKFLOW.md` y `config.yaml`; señalar instrucciones y política. Comprobar que las skills copiadas usen la rama de destino elegida.

Para Codex, comprobar su login y la selección `codex_app_server`. Para OpenHands, mostrar `opensymphony install openhands` y explicar su configuración de proveedor. Usar una sola ruta en vivo. Seguir los [prerrequisitos](https://github.com/kumanday/OpenSymphony/blob/main/docs/prerequisites.md) y el [README](https://github.com/kumanday/OpenSymphony#installation) correspondientes a la versión instalada.

Si la instalación tarda, continuar con la instalación ya comprobada e indicar qué paso sigue en curso. No mostrar credenciales. Mantener el orquestador detenido mientras se revisa la publicación.

## Planificación y publicación: 15 minutos

Abrir el spec y señalar su alcance. Invocar la skill con las rutas reales del repositorio:

```text
Usa create-implementation-plan para descomponer todo el alcance aprobado
del spec en tareas. Lee primero el repo y conserva el trabajo existente.
Genera el manifest, milestones y archivos de tareas con dependencias,
aceptación, contexto y validación. Comprueba la cobertura de requisitos
y la ausencia de ciclos. Explicita decisiones pendientes y sus bloqueos.
No implementes ni publiques todavía.
```

Inspeccionar `docs/tasks/task-package.yaml`, `docs/tasks/milestones.md` y una tarea. Seguir un requisito hasta su tarea y una dependencia hasta su antecedente. Revisar aceptación y comando de validación.

Usar `convert-tasks-to-linear` para validar y mostrar el dry-run. Revisar equipo, proyecto, IDs y dependencias; publicar el paquete revisado. Abrir Linear para comprobarlo. Usar `linear` para consultar o actualizar un issue.

Si el agente sigue planificando al terminar el bloque, abrir el paquete previamente preparado, explicar su procedencia y continuar desde su revisión.

## Ejecución y despacho: 10 minutos

Una vez comprobados el proyecto observado y su política:

```sh
opensymphony run
```

En otra terminal:

```sh
opensymphony desktop
```

Seleccionar una tarea elegible. Mostrar el estado que la habilita, sus dependencias, workspace y arnés. Abrir el contexto de ejecución y el Agent Workpad: plan, resultados de pruebas, decisiones y bloqueos.

Si no hay despacho, inspeccionar la causa observable: dependencia pendiente, estado no elegible, credencial faltante o error de arranque. Explicar qué necesita corregirse. Si un intento alcanza un límite de tiempo o de reintentos, mostrar el límite configurado y qué paso permite continuar. Evitar presentar nombres abstractos de estados como si explicaran el problema.

## Revisión y landing: 10 minutos

Cambiar al PR preparado. Aclarar que corresponde a otra tarea y que sus revisiones ocurrieron antes de la clase.

1. Abrir un hallazgo de un agente revisor y el commit que lo corrigió.
2. Mostrar la nueva revisión y las comprobaciones sobre el commit vigente.
3. Confirmar que los hallazgos que bloqueaban la integración están resueltos.
4. Hacer merge hacia la rama de destino y verificar el resultado en GitHub.
5. Actualizar Linear según el workflow y verificar el enlace al PR.
6. Comprobar la captura de memoria. Si está automatizada, observarla; si se hace manualmente, explicitarlo.

El merge y la transición de Linear pueden automatizarse mediante política. Explicar qué eventos los activan y qué comprobaciones los condicionan. La intervención humana puede concentrarse en alcance, riesgo, arquitectura o integración; también sirve para mantener comprensión del código. La revisión técnica puede realizarse mediante agentes y ciclos de corrección.

Si cambió el PR preparado y ya no cumple las condiciones, mostrar qué impide integrarlo y continuar con un ejemplo previamente integrado. No afirmar que el landing ocurrió si no ocurrió.

## Desktop y continuidad: 15 minutos

**Grafo de tareas, 4 minutos.** Seleccionar un issue, seguir dependencias y abrir su ejecución. Relacionar estados del tracker con lo que ejecuta el arnés. Mostrar cómo cambia la elegibilidad al completar una dependencia.

**Grafo de conocimiento, 6 minutos.** Abrir una cápsula de un trabajo completado. Seguir sus enlaces al issue, Agent Workpad o PR que respaldan las decisiones. Mostrar cómo se recupera memoria relacionada para una tarea posterior. Comprobar qué se conservó, sin asumir que las cápsulas guardan todos los eventos de la sesión.

**Grafo de código, 5 minutos.** Buscar un símbolo y navegar a sus relaciones y archivo. Explicar extracción estructural con Tree-sitter, búsqueda sobre el índice y comprobación del código vigente antes de editar. Mostrar el contexto acotado que puede recibir un agente. La mejora de rendimiento requiere medición; no prometer una aceleración cuantificada.

Referencia: [Code Intelligence](https://github.com/kumanday/OpenSymphony/blob/main/docs/code-intelligence.md). Para recuperar contexto desde CLI, sustituir el ID por uno real:

```sh
opensymphony memory context --issue ID-REAL
```

## Gas Town y EBO: atribución y alcance

Usar la síntesis aportada por el instructor de [The Shape of Things to Come](https://yegge.ai/essays/the-shape-of-things-to-come/). No se consultó el artículo original para preparar esta revisión. El giro descrito hacia Wheelhouse plantea roles, memoria, autoridad y orquestación específica del producto.

El [comentario citado en AI News](https://www.latent.space/p/ainews-reality-checks-on-ai-news) interpreta que Yegge no logró construir algo con Gas Town. Atribuir esa lectura al comentario; no convertirla en una cita directa verificada del autor ni en un benchmark. Evitar inferir resultados sobre otros sistemas a partir de ella.

EBO observa eventos de agente/arnés y añade una ontología de comportamiento y evaluación. No tiene actualmente el alcance de medir una organización de agentes, sus delegaciones, revisiones y efectos de producción a través de un grafo.

Como línea futura, vincular eventos con tareas, revisiones e integración permitiría investigar puntos de fallo en la coordinación. Eso exige instrumentación e integración adicionales y evaluaciones sobre tareas reales. La telemetría por sí sola no corrige los fallos: habría que identificar una causa, cambiar la política o el arnés y comprobar el efecto. Esta propuesta no es una capacidad actual ni una garantía de resolver las limitaciones señaladas en Gas Town.

## Aplicación posterior

Animar a probar OpenSymphony sobre una tarea del paquete completo de E6. También pueden usar otro arnés y sistema de orquestación. Conservar tarea identificable, contexto explícito, notas de trabajo, memoria durable, validación y revisión por agentes.

Plantear un orquestador propio cuando existan requisitos concretos de coordinación que las opciones disponibles no cubran y capacidad de mantenerlo. Considerar recuperación, operación e integración, además de la ejecución del agente.

## Fuentes visuales

- `assets/opensymphony-tareas.png`: `docs/images/os-tg-ancestry-critical-path.png` del repositorio OpenSymphony.
- `assets/opensymphony-memoria.png`: `docs/images/os-kg-memory-capsule.png` del mismo repositorio.

Ambas capturas contienen datos de ejemplo. La demo utiliza el estado real del proyecto seleccionado por el instructor.
