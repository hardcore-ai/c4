# Orquestación de trabajo de desarrollo para ingeniería agencial

Crea un curso en español sobre orquestación de trabajo de desarrollo para ingeniería agencial, comparando soluciones, arneses, meta-harnesses, superficies cliente y formas de integración, con enfoque en OpenAI Symphony y OpenSymphony como implementación de su especificación. Utiliza «agencial» consistentemente.

El siguiente material aporta contexto técnico: definiciones, relaciones, criterios de comparación y fuentes. La plataforma determina la metodología y organización del curso. Fecha de referencia: septiembre de 2026. Fundamenta las características de productos en sus fuentes primarias e identifica la versión o generación cuando afecte la comparación.

## Propósito y problemas centrales

La orquestación permite sostener trabajo de ingeniería durante múltiples sesiones, tareas y revisiones. El objetivo es convertir intención en resultados verificables, preservando continuidad y haciendo explícitas las responsabilidades del agente, del sistema y de las personas.

Tres problemas organizan el panorama:

- **Alcance:** transformar el alcance aprobado del proyecto en todas las tareas necesarias, establecer prioridades y dependencias, y delimitar cada unidad de ejecución.
- **Contexto:** proporcionar información relevante y preservar decisiones, resultados, convenciones y aprendizajes entre sesiones, compactaciones y relevos.
- **Ejecución:** seleccionar trabajo elegible, asignarlo, administrar recursos y permisos, observar progreso, validar resultados y resolver fallos o bloqueos.

Estos problemas existen tanto con un agente que trabaja por etapas como con múltiples agentes concurrentes. La concurrencia añade necesidades de aislamiento, coordinación e integración.

## Definiciones operativas

**Modelo:** componente que interpreta información y produce respuestas o acciones propuestas. Sus capacidades se manifiestan mediante el entorno de ejecución y la configuración utilizada.

**Arnés o agent harness:** capa operativa que conecta el modelo con herramientas y entorno. Puede administrar archivos, terminal, sesiones, eventos, permisos, contexto, extensiones y validación. Cada arnés ofrece una combinación concreta de estas capacidades.

**Herramienta:** operación que el agente puede invocar, como leer archivos, ejecutar un comando o consultar un sistema externo. MCP es una vía para exponer herramientas y recursos; la aplicación determina cómo se incorporan al trabajo.

**Skill:** procedimiento o capacidad reutilizable, con instrucciones y, según el sistema, recursos o código. Puede orientar planificación, diseño, implementación o revisión. Su descubrimiento, ejecución y cumplimiento dependen del arnés y de los controles disponibles.

**Subagente:** ejecución delegada con objetivo y contexto propios, realizada por otra sesión o instancia de agente. Puede utilizar otro modelo, arnés o conjunto de herramientas. La delegación requiere un contrato de entrada, límites y un resultado integrable.

**Ingeniería de contexto:** diseño de la información que recibe el agente en cada momento: especificaciones, instrucciones, investigación, archivos, historial, decisiones, resultados y herramientas disponibles.

**Orquestación:** coordinación de ejecuciones, dependencias, recursos, eventos y condiciones de continuidad. Puede residir dentro del arnés, en una aplicación anfitriona o en un sistema externo.

**Orquestación de trabajo:** coordinación del ciclo de vida de unidades operativas como tareas, issues e hitos: preparación, asignación, ejecución, revisión, recuperación y cierre.

**Meta-harness o meta-arnés:** término analítico para una capa que opera sobre arneses y administra aspectos compartidos de su ejecución: selección, lanzamiento, sesiones, workspaces, supervisión o políticas. El alcance del término varía entre proyectos; aquí se identifica por las responsabilidades concretas que asume. La selección de varios modelos dentro de un solo arnés y la coordinación de varios arneses son dimensiones distintas.

**Superficie cliente para arneses:** interfaz desde la cual personas u otras aplicaciones interactúan con un arnés: terminal, escritorio, navegador, móvil, extensión de editor o API. Puede presentar conversaciones, permisos, archivos, diffs y estado. Un producto puede combinar superficies cliente con funciones de meta-arnés y gestión de trabajo.

**Estado y memoria:** el estado describe la situación vigente; la memoria conserva información útil para actuar después. Conviene distinguir estado de conversación, estado operativo del agente, estado del repositorio y estado del trabajo. Cada uno tiene una autoridad y mecanismos de persistencia propios.

## Taxonomía del panorama

La siguiente clasificación es una síntesis analítica. Sus dimensiones se combinan y permiten describir arquitecturas híbridas.

| Enfoque | Mecanismo principal | Ejemplos | Pregunta que resuelve |
|---|---|---|---|
| Contexto y procedimientos | Skills, instrucciones y artefactos que orientan al agente | Superpowers, GSD original, configuraciones de arneses | ¿Qué debe saber y qué procedimiento debe seguir? |
| Ejecución externa | Ciclos que controlan invocaciones, estado y validación | Ralph y sus variantes | ¿Cuándo continuar, reiniciar o detener la ejecución? |
| Gestión persistente multiagente | Workspaces, identidades, colas y handoffs | Gas Town | ¿Cómo coordinar trabajo concurrente y recuperable? |
| Integración programática | SDK, servidor o protocolo administrado por una aplicación | pi SDK, codex app-server, Claude Agent SDK, OpenHands SDK, OpenCode SDK | ¿Cómo incorporar un arnés a otro sistema? |
| Operación sobre arneses | Lanzamiento, supervisión y administración compartida de sesiones y workspaces | Orca, Paseo y funciones de host de OpenChamber | ¿Cómo operar arneses desde un entorno común? |
| Ciclo de trabajo | Planificación, estados, dependencias, intentos y verificación | GSD Pi, Symphony/OpenSymphony | ¿Cómo llevar unidades de trabajo hasta un cierre comprobado? |

La coordinación por contexto orienta decisiones del agente. La coordinación implementada en código puede imponer transiciones, registrar intentos y verificar condiciones. Una arquitectura puede utilizar ambas: skills para preparar tareas, un runtime para ejecutarlas y un gestor de trabajo para priorizarlas.

Las superficies cliente son una dimensión transversal: describen desde dónde se opera el sistema. El meta-arnés describe qué administra sobre los arneses; la orquestación de trabajo describe cómo se gobiernan tareas y sus condiciones de cierre.

## Comparación general

| Sistema | Lugar de coordinación | Estado relevante | Unidad de trabajo | Relación con el arnés |
|---|---|---|---|---|
| oh-my-openagent | Routing y coordinación en su entorno de ejecución | Configuración, sesiones y mecanismos propios de memoria | Tarea, especialidad o equipo | Integración dependiente de versión y runtime |
| Superpowers | Skills y workflows utilizados por el agente | Especificaciones, planes y resultados | Plan y tarea | Adaptación a cada arnés |
| GSD original | Procedimientos y contexto del proyecto | Artefactos persistentes de planificación | Proyecto, fase, plan y tarea | Opera sobre arneses anfitriones |
| Ralph | Bucle controlador | Git, plan y archivos de progreso | Iteración o tarea | Depende de la interfaz de invocación elegida |
| Gas Town | Gestor persistente multiagente | Seguimiento de trabajo, mensajes y workspaces | Trabajo coordinado | Gestiona runtimes y recursos de ejecución |
| pi SDK | Aplicación anfitriona | Sesiones, historial y estado del runtime | Sesión y ejecución | Integración directa en el proceso |
| oh-my-pi | Arnés derivado de pi con herramientas y delegación integradas | Sesiones, memoria y workspaces de subagentes | Sesión y subtarea | Fork de pi con capacidades propias |
| codex app-server | Aplicación que controla el servidor | Threads, turns, items y solicitudes de aprobación | Ejecución dentro de una conversación | Contrato de servidor y eventos de Codex |
| Claude Agent SDK | Aplicación anfitriona | Sesiones, mensajes y eventos | Ejecución programática | Capacidades del entorno de Claude Code |
| OpenHands SDK | Aplicación y, cuando corresponde, Agent Server | Conversación, eventos y workspace | Ejecución de trabajo | Componentes del ecosistema OpenHands |
| OpenCode SDK | Aplicación cliente del servidor | Sesiones, mensajes y eventos | Sesión y ejecución | API del servidor OpenCode |
| GSD Pi | Motor de workflows integrado con pi, dentro de Open GSD | Estado persistente del proyecto y representaciones de consulta | Milestone, slice, tarea e intento | Control directo mediante integración con pi |
| Symphony | Servicio de orquestación | Tracker, workspaces y política de workflow | Issue y ejecución | Especificación con referencia basada en Codex |
| OpenSymphony | Implementación y extensiones de Symphony | Linear, workspaces y estado operativo | Issue y ejecuciones asociadas | OpenHands o codex app-server |

El acoplamiento debe evaluarse por superficie concreta: herramientas, sesiones, eventos, recuperación y permisos. Una interfaz común facilita integración; las garantías operativas dependen de las capacidades expuestas y de cómo las utiliza el coordinador.

## Sistemas basados en contexto, especialización y ciclos

### oh-my-openagent

oh-my-openagent (OmO) organiza especialización, routing multimodelo y delegación: distintas clases de trabajo reciben modelos, herramientas y contextos diferentes. Su documentación describe planificación, revisión del plan, ejecución por especialistas y verificación de resultados. [Guía general](https://github.com/code-yeongyu/oh-my-openagent/blob/dev/docs/guide/overview.md).

El proyecto evolucionó desde oh-my-opencode. Su sitio distingue una edición para OpenCode, una integración para Codex CLI y una beta independiente Senpi vinculada a pi; la guía actual se centra en la edición nativa. El sitio también describe grafos de dependencias, ejecución por oleadas y estado para reanudar trabajo. Atribuye cada capacidad a su edición y versión. [Sitio oficial](https://omo.dev), [repositorio](https://github.com/code-yeongyu/oh-my-openagent).

En esta taxonomía, OmO permite estudiar cómo la coordinación dentro de un entorno de ejecución puede incorporar planificación y control de trabajo. Examina por separado su diversidad de modelos, sus ediciones sobre distintos hosts y los mecanismos efectivos de coordinación de cada edición.

### Superpowers

Superpowers organiza una metodología de desarrollo mediante skills componibles: exploración de requisitos, especificación, planificación, ejecución y revisión. Los procedimientos guían el comportamiento y se apoyan en capacidades del arnés anfitrión.

Representa la coordinación mediante reglas y procedimientos reutilizables. Su efectividad combina instrucciones claras, contexto adecuado y comprobaciones observables. La compatibilidad e instalación se resuelven por arnés. [Repositorio](https://github.com/obra/superpowers).

### Get Shit Done original

El GSD original organiza planificación y ejecución mediante comandos, contexto y artefactos persistentes. Documentos de proyecto, requisitos, roadmap, estado, planes y resúmenes conservan información entre ejecuciones.

Su contribución conceptual es materializar contexto reutilizable fuera de la conversación. Los artefactos permiten reconstruir intención, progreso y decisiones durante tareas prolongadas. [Repositorio](https://github.com/gsd-build/get-shit-done).

### Ralph y sus variantes

Ralph es una familia de patrones de ejecución iterativa. Un controlador invoca al agente, este recupera estado, realiza una porción del trabajo, valida y registra resultados; después se decide la siguiente iteración.

Las variantes difieren en arnés, condiciones de salida, persistencia, límites y validación. La comparación relevante es quién determina el avance y con qué evidencia. Los ciclos con contexto fresco pueden reducir acumulación de información irrelevante; su calidad depende de conservar lo necesario para continuar.

El patrón combina alcance acotado, estado externo y validación frecuente. Una implementación robusta incorpora presupuestos, detección de falta de progreso y recuperación explícita. [Patrón de referencia](https://github.com/ghuntley/how-to-ralph-wiggum).

### Gas Town

Gas Town representa la gestión persistente de trabajo multiagente: organiza espacios de trabajo, roles, seguimiento y comunicación entre ejecuciones. Su interés arquitectónico está en la coordinación y continuidad de múltiples trabajadores.

Frente a un bucle externo simple, introduce más estructura para administrar concurrencia y handoffs. Esa estructura debe evaluarse junto con el costo operativo, los mecanismos de integración y la recuperación de trabajo interrumpido. [Repositorio actual](https://github.com/gastownhall/gastown).

## Arneses e integración programática

### pi y su SDK

pi ofrece un arnés extensible y un SDK para incorporar sus capacidades a aplicaciones. Permite administrar sesiones, herramientas, modelos, recursos y eventos. Skills, extensiones y archivos de contexto forman parte de su entorno configurable.

La sesión administra historial, ejecución y compaction; la capa de runtime permite administrar reemplazo y continuidad de sesiones. La aplicación puede observar eventos, dirigir trabajo y asociar resultados con sus propias unidades operativas.

Esto permite construir sistemas cuyo coordinador controla el arnés mediante código. El motor de planificación y las políticas de cierre pertenecen a la aplicación que utiliza esas capacidades. [SDK de pi](https://pi.dev/docs/latest/sdk).

### oh-my-pi

oh-my-pi (OMP) es un fork de pi que amplía el arnés con herramientas de ingeniería integradas. Incluye integración con servidores de lenguaje (LSP), depuración mediante DAP, ejecución persistente de código y delegación a subagentes con worktrees aislados. También documenta edición anclada en hashes, memoria y seguimiento de agentes. [Repositorio](https://github.com/can1357/oh-my-pi), [sitio oficial](https://omp.sh/).

Su lugar en el panorama es el de un arnés con decisiones propias sobre herramientas y ejecución. pi aporta la base extensible; oh-my-pi desarrolla una variante del arnés; GSD Pi construye un motor de trabajo sobre pi. Son relaciones arquitectónicas diferentes. oh-my-pi y oh-my-openagent son proyectos distintos, con nombres, responsables e integraciones propios.

### codex app-server

codex app-server expone Codex como servidor para aplicaciones anfitrionas. Su modelo incluye threads, turns, items, eventos y solicitudes de aprobación. La integración permite administrar conversaciones y ejecuciones mediante un contrato programático.

Es la superficie central para estudiar integración con Codex en este curso y para entender su uso en la referencia de Symphony y en OpenSymphony. La aplicación debe manejar identidad, resultados, interrupciones y solicitudes pendientes de acuerdo con el protocolo. [Documentación](https://developers.openai.com/codex/app-server/).

### Claude Agent SDK

Claude Agent SDK ofrece acceso programático a capacidades del entorno de Claude Code desde aplicaciones. Permite configurar herramientas y permisos, procesar mensajes y trabajar con sesiones y hooks.

Es útil para comparar cómo un host utiliza un entorno de ingeniería ya construido frente a ensamblar directamente su propio ciclo sobre una API de modelo. [Documentación](https://code.claude.com/docs/en/agent-sdk/overview).

### OpenHands Software Agent SDK y Agent Server

El SDK de OpenHands aporta componentes para construir y ejecutar agentes de software, con herramientas, conversaciones y entornos de trabajo. Agent Server proporciona una vía para administrar ejecuciones mediante un servicio.

Distingue integración con el SDK y comunicación con Agent Server. OpenSymphony utiliza esta última como una de sus rutas de ejecución. La separación permite razonar sobre dónde vive el proceso del agente y quién administra su ciclo de vida. [Documentación](https://docs.openhands.dev/sdk).

### OpenCode y su SDK

OpenCode dispone de un servidor y un SDK cliente para integrar su API en aplicaciones. Sesiones, mensajes, eventos y operaciones del servidor constituyen la superficie de coordinación.

Contrasta el acceso cliente-servidor con la integración directa del SDK de pi. La elección afecta despliegue, comunicación y recuperación ante fallos. [Documentación](https://opencode.ai/docs/sdk/).

## Meta-harnesses y superficies cliente

La separación entre arnés e interfaz permite ejecutar agentes en una máquina y supervisarlos desde otra, utilizar varios arneses desde un entorno común o construir automatizaciones sobre sus sesiones. Compara cuatro responsabilidades: presentar información, administrar ejecución, aplicar políticas y coordinar trabajo. Un producto puede asumir varias.

### Orca

Orca se presenta como un entorno de desarrollo para agentes que integra terminales, navegador, diffs y worktrees. Permite ejecutar distintos agentes CLI, entre ellos Claude Code, Codex, OpenCode, pi y oh-my-pi. Su sitio documenta trabajo paralelo, entornos remotos por SSH, integración con GitHub y Linear, y una CLI para operar el entorno. [Sitio oficial](https://www.onorca.dev/).

Ilustra una superficie de desarrollo común con administración de recursos y ejecuciones sobre varios arneses. En la definición utilizada aquí, esas funciones permiten analizarlo como meta-arnés, distinguiendo el control del entorno de las políticas que determinan cuándo una tarea está terminada.

### Paseo

Paseo permite operar arneses instalados en una máquina mediante clientes de escritorio, web y móvil. Su daemon puede ejecutarse sin interfaz gráfica; los clientes acceden a los mismos workspaces. Documenta integraciones específicas con Claude Code, Codex, OpenCode, pi y OMP, además de otros proveedores mediante ACP. [Sitio oficial](https://paseo.sh).

También expone MCP, CLI y un SDK TypeScript para automatización, y permite lanzar agentes en worktrees. Ilustra cómo acceso remoto, superficie multicliente y control programático pueden coexistir. Los arneses conservan su función de ejecución; Paseo aporta una capa para operarlos y construir coordinación sobre ellos.

### OpenChamber

OpenChamber organiza el acceso alrededor de instancias que corren en máquinas controladas por el usuario. La instancia ejecuta agentes y conserva sesiones al cerrar la aplicación; escritorio, navegador y móvil ofrecen superficies para acceder a ella. Integra terminal, archivos, notas, acciones reutilizables y datos de uso por sesión. [Sitio oficial](https://openchamber.dev/).

Permite estudiar la diferencia entre cliente, instancia anfitriona y ejecución persistente. Sus superficies e integraciones se describen según la versión documentada; la persistencia de una sesión y la coordinación del ciclo de una tarea son responsabilidades que se evalúan por separado.

### Relaciones entre capas

| Capa | Responsabilidad | Ejemplos de este panorama |
|---|---|---|
| Superficie cliente | Interacción, supervisión y revisión | Escritorio, web y móvil de Orca, Paseo y OpenChamber |
| Meta-arnés o host | Administrar arneses, sesiones y recursos comunes | Operación multiarnés de Orca y Paseo; instancias de OpenChamber |
| Arnés | Ejecutar el ciclo del agente con herramientas y contexto | pi, oh-my-pi, Codex, Claude Code, OpenCode |
| Sistema de trabajo | Gobernar alcance, dependencias, intentos y cierre | GSD Pi, Symphony/OpenSymphony |

Estas capas describen responsabilidades, no una pila obligatoria. Un cliente puede conectarse directamente a un arnés; un orquestador puede operar sin interfaz gráfica; una aplicación puede integrar varias capas. SDKs, app-servers y protocolos como ACP ofrecen contratos de integración con capacidades específicas de eventos, permisos y recuperación.

Compara cada sistema preguntando dónde corre el agente, quién conserva la sesión, quién asigna trabajo y qué evidencia autoriza su cierre. En acceso remoto, añade autenticación, revocación y alcance de los permisos. La compatibilidad de ejecución y la profundidad de observabilidad se verifican por integración.

## Open GSD y GSD Pi: del contexto al control del trabajo

Open GSD es el proyecto paraguas que reúne herramientas y superficies para ingeniería agencial. Su ecosistema incluye GSD Pi como aplicación de terminal, `gsd-core` como framework para arneses existentes, `gsd-browser` para automatización y verificación en navegador, `gsd-graph` para conocimiento local y `gsd-loop` para trabajo sobre una cola de GitHub. El sitio presenta `gsd-path`, `gsd-workbench` y `gsd-cloud` como próximos lanzamientos. Distingue componentes disponibles de capacidades anunciadas. [Ecosistema Open GSD](https://www.opengsd.net/).

La evolución del GSD original a GSD Pi amplía el enfoque: de procedimientos y artefactos que orientan al agente dentro de un arnés anfitrión a una aplicación que administra el avance del proyecto mediante su propio motor de trabajo, dentro del ecosistema Open GSD.

GSD Pi combina una aplicación basada en pi y su SDK con un motor de workflows, modo automático y gestión del proyecto. Organiza planificación, implementación, verificación y seguimiento mediante hitos, slices y tareas, con automatización de Git consciente de worktrees y memoria local del proyecto. [GSD Pi](https://github.com/open-gsd/gsd-pi).

El cambio central es la ubicación del control: además de instrucciones y artefactos, código del runtime administra avance y ejecución. En la arquitectura actual, SQLite mantiene el estado del workflow y Markdown ofrece representaciones para consulta y contexto. [Arquitectura actual](https://github.com/open-gsd/gsd-pi/blob/main/docs/dev/architecture.md).

Esto aproxima GSD Pi a la orquestación de trabajo: hitos, slices, tareas, intentos y verificación. Su relación con pi es una integración profunda, mientras OpenSymphony coordina issues del tracker y ejecuciones en arneses mediante interfaces externas. Esta ubicación en la taxonomía es una interpretación arquitectónica.

Ambos enfoques pueden perseguir continuidad y cierre verificable con autoridades de estado y fronteras de integración distintas. La comparación debe especificar generación y versión. Open GSD designa el ecosistema; GSD Pi, una implementación concreta dentro de él. Ser un proyecto paraguas describe la organización de productos, mientras que meta-arnés describe responsabilidades operativas sobre arneses.

## Symphony como especificación y OpenSymphony como implementación

OpenAI Symphony propone un servicio que convierte trabajo de proyecto en ejecuciones aisladas y coordinadas. El repositorio publica una especificación y una implementación experimental de referencia en Elixir. La especificación permite desarrollar otras implementaciones. [Symphony](https://github.com/openai/symphony), [SPEC.md](https://github.com/openai/symphony/blob/main/SPEC.md).

El tracker aporta información del trabajo; el servicio coordina selección, workspaces y ejecuciones; el workflow del repositorio establece políticas e instrucciones. Conviene distinguir las responsabilidades del servicio de las acciones que realizan agentes e integraciones.

OpenSymphony, desarrollado por Leonardo González, implementa la especificación de Symphony en Rust. Integra Linear y permite ejecutar issues mediante OpenHands Agent Server o codex app-server. Administra workspaces, dependencias, reintentos y reconciliación, y añade capacidades propias de seguimiento y memoria. [OpenSymphony repo](https://github.com/kumanday/OpenSymphony) [OpenSymphony website](https://opensymphony.dev).

La revisión automatizada y otras acciones del repositorio dependen de su configuración. Distingue el comportamiento de la especificación, las extensiones de OpenSymphony y las políticas del proyecto.

El recorrido operativo es: especificación → paquete de tareas → tracker → trabajo elegible → workspace → ejecución → pruebas → revisión → cierre autorizado. Ante una interrupción o cambio de estado, el coordinador reconcilia lo observado con el trabajo vigente.

## Planificación de todo el alcance y publicación

Un plan completo representa todos los requisitos del alcance aprobado mediante tareas implementables, dependencias y evidencia esperada. La trazabilidad permite distinguir trabajo pendiente, trabajo ya realizado y decisiones que todavía requieren resolución.

La skill `create-implementation-plan` de OpenSymphony genera un paquete con `docs/tasks/task-package.yaml`, `docs/tasks/milestones.md` y un Markdown por tarea. El manifest enumera las tareas; el índice describe los hitos; cada tarea expresa alcance, entregables, aceptación, pruebas, contexto y Definition of Ready.

La revisión comprueba cobertura, existencia de archivos, unicidad de IDs, consistencia de milestones, referencias válidas y ausencia de ciclos. Las decisiones abiertas se convierten en trabajo explícito y bloqueos identificables. Un paquete completo puede contener tareas que todavía esperan dependencias.

`convert-tasks-to-linear` aborda la validación, previsualización y publicación del paquete revisado. La correspondencia de IDs preserva identidad y permite evitar duplicados durante actualizaciones. [Skills de OpenSymphony](https://github.com/kumanday/OpenSymphony/tree/main/.agents/skills).

La política de autoridad debe definir qué gobierna cada artefacto: requisitos del producto, contrato de tarea, estado operativo y evidencia de implementación. Las revisiones del alcance requieren alinear los artefactos afectados mediante un proceso explícito.

## Continuidad, persistencia y memoria

El contexto activo es la información disponible para una interacción. El historial preserva interacciones anteriores. La memoria del proyecto conserva decisiones y conocimiento reutilizable. El estado durable permite reconstruir la situación del trabajo.

El razonamiento retenido, cuando lo admite la combinación de modelo y API, conserva estado interno relevante entre interacciones. Compaction transforma el historial en una representación que facilita continuar dentro de límites de contexto. Las notas de handoff documentan resultados, decisiones y próximos pasos para otras ejecuciones.

Estas capas resuelven necesidades diferentes. La elección entre continuar una sesión y comenzar otra depende de qué estado se conserva, cuánto cuesta recuperarlo y qué continuidad necesita la tarea.

El experimento de OpenAI sobre ARC-AGI-3 ilustra que retener razonamiento y utilizar compaction puede modificar significativamente el desempeño de una configuración. Sus resultados se interpretan junto con el modelo, conjunto evaluado, métrica y condiciones del experimento. [Artículo de OpenAI](https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores/).

## Hooks, eventos y control

Un hook conecta un evento con una acción configurada. Puede preparar un workspace, aportar contexto, registrar el resultado de una herramienta o activar una comprobación. Los hooks del arnés y los del ciclo de vida del workspace pertenecen a capas distintas.

La observación, la modificación y el bloqueo son capacidades diferentes. Cada control debe tener un punto de aplicación, un resultado interpretable y una política ante errores. Las verificaciones de CI y las decisiones de revisión pueden aportar controles adicionales al cierre del trabajo. [Hooks de Claude Code](https://code.claude.com/docs/en/hooks-guide), [extensiones de pi](https://pi.dev/docs/latest/extensions).

La autonomía operativa combina presupuestos, permisos, aislamiento, detección de falta de progreso y criterios de escalamiento. El sistema debe poder distinguir completar, fallar, quedar bloqueado y agotar un límite.

## Benchmarks, telemetría y evaluación

Un benchmark mide un sistema bajo condiciones determinadas: tarea, modelo, arnés, herramientas, configuración y presupuesto. Las comparaciones útiles controlan variables, repiten intentos y conservan tanto resultados exitosos como fallos.

El resultado debe considerar corrección, cobertura del alcance, tiempo, costo y retrabajo. Las pruebas sobre el repositorio complementan los benchmarks generales con evidencia del trabajo real.

La telemetría registra actividad y recursos. La evaluación interpreta evidencia frente a criterios. Engineering Behavior Observatory (EBO) captura trayectorias y cambios del workspace y conecta evaluaciones con sus evidencias. Las señales disponibles dependen de cada integración. [EBO](https://github.com/trilogy-group/engineering-behavior-observatory).

Distingue finalización de una ejecución, calidad de captura y cumplimiento de la tarea. Ejecutar una prueba demuestra un intento de validación; su resultado y pertinencia determinan qué conclusión puede sostenerse.

## Auto-mejora recursiva de modelos y arneses

La auto-mejora recursiva describe sistemas que participan en modificar componentes utilizados en sus propias iteraciones posteriores. En modelos, cambiar capacidades mediante pesos requiere entrenamiento y evaluación. En arneses y agentes, pueden evolucionar prompts, skills, memoria, herramientas o lógica de ejecución.

Prime Agent ofrece mecanismos para refinar estado suplementario del arnés a partir de evidencia de ejecución, con historial de cambios. exo/exoharness ilustra la separación entre infraestructura de estado durable y lógica del agente que puede evolucionar. [Prime Agent](https://github.com/PrimeIntellect-ai/prime-agent), [exoharness](https://exoharness.ai/).

El ciclo es observar → diagnosticar → proponer una modificación → evaluar → aceptar o revertir. La mejora se establece mediante resultados comparables, casos nuevos y criterios de evaluación independientes del componente modificado.

## Principios de síntesis

El contexto persistente conserva continuidad; los contratos delimitan trabajo; los runtimes administran ejecución; los sistemas de trabajo coordinan prioridades y dependencias; la evidencia permite decidir qué está terminado.

La especialización y el paralelismo son decisiones arquitectónicas cuyo valor depende de límites claros e integración de resultados. La complejidad de coordinación debe corresponder al trabajo que se pretende sostener.

Superpowers y GSD original ilustran procedimientos y memoria externa; Ralph, control iterativo; Gas Town, coordinación persistente multiagente; pi y los SDKs/servidores, integración programática; GSD Pi, dentro de Open GSD, control del proyecto desde un runtime integrado; Symphony/OpenSymphony, coordinación de trabajo mediante tracker, workspaces y ejecuciones verificables.

oh-my-pi ilustra la evolución del propio arnés; oh-my-openagent, la especialización y coordinación multimodelo; Orca, Paseo y OpenChamber, distintas combinaciones de superficies cliente, administración de sesiones y operación sobre arneses. Separar esas responsabilidades permite comparar capacidades concretas y comprender cómo se combinan.

El fundamento transferible es diseñar alcance, contexto y ejecución como partes de un mismo sistema, con autoridades de estado explícitas y criterios de cierre respaldados por evidencia.
