# Antes de estación 7: prepara todas las tareas

**Fecha de clase:** martes 15 de septiembre de 2026, 7 PM Bogotá. **Tiempo orientativo:** 75–105 minutos; depende del tamaño y madurez de tu proyecto. Continúa el paquete iniciado en clase. Entrega antes de la clase en el canal habitual del curso.

Prepara todas las tareas necesarias para implementar el alcance definido de tu proyecto en estaciones 4 y 5. Usa la skill de OpenSymphony `create-implementation-plan` para generar y revisar el paquete completo. En estación 7 empezaremos a ejecutarlo por dependencias; no es necesario implementar todo antes de clase. Si te falta tu diseño, usa los artefactos de EntreVista AI de estación 5; el validador de contraseña es solo una muestra del formato.

## 1. Revisa el mapa (5 minutos)

El **modelo** interpreta y propone. El **arnés** le permite leer, editar y ejecutar con permisos. Una **skill** aporta un procedimiento reutilizable. Un **hook** reacciona a un evento del arnés. El **orquestador** coordina tareas, dependencias y estados. La **evidencia** permite revisar el resultado.

Nuestro recorrido será: tarea lista → ejecución → pruebas → revisión → merge autorizado. Un agente puede terminar una ejecución sin haber resuelto la tarea. La revisión de código y las pruebas deben confirmar el resultado.

## 2. Comprueba tus herramientas (10–15 minutos)

Mantén el arnés que ya usas en el curso. Comprueba que puedes abrir el repositorio, hacer una consulta sobre un archivo y ejecutar un comando con tu cuenta autenticada. No necesitas instalar varios arneses.

Si aún no tienes ninguno, usa Claude Code siguiendo la [instalación oficial](https://code.claude.com/docs/en/quickstart). Requiere una cuenta con acceso; instalarlo no concede una suscripción.

| Sistema | Instalación de Claude Code |
|---|---|
| macOS con Homebrew | `brew install --cask claude-code` |
| Windows con WinGet | `winget install Anthropic.ClaudeCode` |
| Linux, macOS sin Homebrew o WSL | Sigue la opción nativa de la guía oficial |

Ejecuta `claude --version`, abre `claude` en tu repo y completa la autenticación. Si ya usas otro arnés, registra su nombre y versión o pantalla de información.

Comprueba Git con `git --version`; si falta, usa [Git para tu sistema](https://git-scm.com/install/). Abre una terminal en tu proyecto y ejecuta `git status`. Debe reconocer el repositorio. No borres cambios existentes para dejarlo limpio.

En **GitHub**, inicia sesión y confirma que puedes acceder al repo donde trabajarás y crear una rama/PR. En **Linear**, entra al espacio del curso y confirma que puedes crear y editar una tarea en el equipo acordado. No hace falta configurar una API ni MCP para esta preparación: la interfaz web sirve.

**Smoke test del arnés:** pide «Lee el README y las instrucciones de este repo; dime el objetivo y el comando de pruebas, citando los archivos. No modifiques nada». Comprueba tú las referencias.

## 3. Genera el plan completo con la skill (35–50 minutos)

La [skill create-implementation-plan](../estacion6/skills/create-implementation-plan/SKILL.md) está incluida en el material. Abre su archivo en tu arnés y pídele que lo lea y siga. No necesitas instalar OpenSymphony para usar estas instrucciones. Si ya tienes la skill instalada, invócala por su nombre.

Trabaja en la raíz de tu proyecto. Proporciona las rutas reales a tu PRD, Inception, Construction, decisiones técnicas y código existente. Envía este prompt:

```text
Usa la skill create-implementation-plan para preparar TODAS las tareas
necesarias para implementar el alcance aprobado de mi proyecto.
Lee primero mis artefactos de estaciones 4 y 5 y el estado actual del repo.
No limites el plan a una feature ni a una tarea de muestra.

Crea docs/tasks/task-package.yaml, docs/tasks/milestones.md y un archivo
Markdown por tarea con el frontmatter y las secciones exigidos por la skill.
Organiza milestones, dependencias, prioridades y criterios de aceptación.
Incluye integración, pruebas y el trabajo de calidad, seguridad y despliegue
que el alcance requiera. No agregues funcionalidades fuera del spec.

Comprueba cobertura: cada requisito debe apuntar a tareas o a evidencia
de que ya está implementado. Registra esto en docs/tasks/cobertura.md.
Explicita vacíos y decisiones pendientes; no inventes requisitos.
Si hay incertidumbre, incluye una tarea para resolverla y bloquea las
dependientes. Respeta la identidad de tareas y waves ya publicadas.

Valida archivos, IDs, referencias, milestones y ausencia de ciclos.
No implementes ni publiques todavía. Entrega el paquete para mi revisión.
```

El entregable incluye:

- `docs/tasks/task-package.yaml`: inventario completo y canónico de tareas de la ronda de planificación.
- `docs/tasks/milestones.md`: objetivos y orden de los hitos.
- Un Markdown por tarea: alcance, entregables, aceptación, plan de pruebas, contexto y Definition of Ready.
- `docs/tasks/cobertura.md`: tabla requisito → tareas / evidencia existente / vacío pendiente. Es un complemento de esta actividad, no un campo nuevo del manifest.

Revisa que no falte ninguna parte del alcance. Un paquete completo puede contener tareas bloqueadas; solo las que tienen dependencias y decisiones resueltas están listas para ejecutar. Si tu proyecto ya tiene tareas, conserva IDs y evita duplicados.

## 4. Revisa cobertura y dependencias (10–15 minutos)

Pide al agente una segunda pasada de revisión del paquete y comprueba tú sus conclusiones:

- Todos los requisitos del alcance están representados.
- Cada archivo del manifest existe y cada ID es único.
- Milestones, dependencias y padres apuntan a entradas válidas; el grafo no tiene ciclos.
- Cada tarea tiene aceptación observable y un plan de validación concreto.
- Hay tareas iniciales ejecutables; los bloqueos restantes están explícitos.

Ejecuta la validación disponible del repo y registra el resultado actual. No inventes pruebas exitosas. Si no existe runner, incluye su preparación como tarea y expresa las dependencias correspondientes. Mantén contexto y decisiones en los archivos existentes de tu proyecto; no reemplaces las reglas de AI-DLC.

## 5. Prepara la publicación en Linear (10 minutos)

Revisa primero el paquete completo. `create-implementation-plan` genera el plan; la publicación es un paso separado. Con `convert-tasks-to-linear`, si lo tienes disponible, valida el paquete y revisa el dry-run antes de autorizar la publicación en el equipo y proyecto correctos.

También puedes publicarlo por la interfaz web. Mantén correspondencia entre IDs locales e issues reales, milestones y dependencias. No publiques de nuevo tareas ya existentes. Usa un proyecto de preparación sin despacho automático activo: publicar en un proyecto observado por un orquestador puede iniciar trabajo.

Si faltan acceso, integración o tiempo de publicación, entrega el paquete completo validado y registra «publicación pendiente». Ese bloqueo no justifica reducirlo a una tarea. La importación puede resolverse en E7.

## 6. Entrega (5 minutos)

- Enlace al repo con manifest, milestones y **todos** los archivos de tareas.
- Tabla de cobertura y resultado de la revisión del grafo.
- Enlace al proyecto de Linear y correspondencia de IDs, o bloqueo de publicación.
- Arnés utilizado y comando de validación con resultado real, sin credenciales.
- Primera tarea ejecutable identificada y una pregunta para clase.

**El plan está preparado** cuando cubre todo el alcance y permite decidir qué ejecutar primero y qué debe esperar. **Necesitas apoyo** si quedan requisitos sin descomponer o decisiones que impiden planificar. Reporta sistema operativo, paso, comando y error exacto después de 10 minutos de bloqueo de instalación.

## Qué haremos en estación 7

Primero revisaremos el paquete y elegiremos una tarea sin bloqueos para ejecutarla con el arnés disponible. Después veremos cómo OpenSymphony coordina el mismo ciclo con tareas de Linear y revisión en GitHub. El instructor mostrará su instalación; instalar OpenSymphony, EBO, Prime Agent o exo no es requisito de esta tarea.

Ruta del taller: 15 min de readiness; 20 min de dispatch manual guiado; 40 min de implementación; 25 min de pruebas y revisión; 10 min de demostración de orquestación; 10 min de cierre. Total: 120 minutos. Objetivo: un cambio revisable; merge solo si sus verificaciones y revisión lo permiten.

## Recursos y profundización opcional

Consulta la [lista de recursos de estaciones 6 y 7](../estacion6/recursos.md). Para la preparación, necesitas especialmente `create-implementation-plan`; `convert-tasks-to-linear` y `linear` corresponden al paso de publicación y operación en Linear.

Lee [persistencia y compaction](https://openai.com/index/how-two-settings-tripled-our-arc-agi-3-scores/) y responde: ¿qué decisiones perderías si reiniciaras tu sesión? Mira [hooks](https://code.claude.com/docs/en/hooks-guide) y propone un evento y una acción verificable. Estas lecturas no añaden instalaciones obligatorias.
