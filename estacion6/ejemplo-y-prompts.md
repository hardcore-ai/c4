# Del spec al plan completo de tareas

La entrega es el plan completo del alcance definido del proyecto. El validador siguiente ilustra cómo debe quedar cada tarea; no representa todo el backlog.

## 1. Punto de partida real

En [business-rules.md de EntreVista AI](../estacion5/agentic_interviewer_ai/aidlc-docs/construction/auth-lambda/functional-design/business-rules.md), las reglas BR-PASS-01 a 04 exigen al menos ocho caracteres, una mayúscula ASCII, una minúscula ASCII y un dígito. BR-PASS-06 prohíbe registrar contraseñas. BR-PASS-07 describe errores por regla.

Usamos esas reglas existentes para aprender a preparar una tarea; no son una recomendación general para diseñar políticas de contraseñas. No construiremos el sistema completo de autenticación.

## 2. Tarea trabajada: validar la política de contraseña

**ID local:** AUTH-01. **Estado:** borrador; listo solo después de resolver los pendientes.

**Resultado:** una función de dominio que devuelve códigos de reglas incumplidas y permite a la capa HTTP construir su respuesta, sin devolver ni registrar el valor recibido.

**Alcance:** validador puro y pruebas. **Fuera de alcance:** hash, almacenamiento, JWT, UI, infraestructura y despliegue. La integración con los flujos de alta/cambio de contraseña será otra tarea.

**Contexto:** BR-PASS-01 a 04, 06 y 07 del archivo enlazado; leer también las convenciones y el diseño funcional del repositorio objetivo. No copiar todo Inception al prompt.

**Criterios de aceptación:**

| Entrada ficticia | Resultado esperado |
|---|---|
| `Abcdefg1` | Sin incumplimientos |
| `Abcdef1` | Longitud insuficiente |
| `abcdefg1` | Falta mayúscula |
| `ABCDEFG1` | Falta minúscula |
| `Abcdefgh` | Falta dígito |
| Cadena vacía | Los cuatro incumplimientos |

Las pruebas y los errores no deben registrar contraseñas. Usar únicamente valores ficticios. Revisar además el comportamiento con entradas de tipo incorrecto en el límite de entrada real.

**Pendientes antes de marcar Ready:** identificar lenguaje, módulo y runner reales; acordar nombres de los códigos; confirmar semántica de longitud para caracteres Unicode y tratamiento de espacios. Las reglas originales no resuelven todos esos detalles. El agente debe preguntar o documentar una decisión aprobada, no inventar requisitos.

**Verificación:** ejecutar el comando real del proyecto para esas pruebas; registrar comando, resultado y ruta del test. Si aún no hay código ni runner, preparar una tarea previa de setup y dejar AUTH-01 bloqueada por ella. Un comando imaginado no demuestra readiness.

**Dependencias:** runner disponible y decisiones anteriores resueltas. **Evidencia esperada al ejecutar en E7:** diff, pruebas, revisión y vínculo al issue. Preparar la tarea en E6 no equivale a haberla implementado.

## 3. Fragmento ilustrativo del backlog

| ID | Trabajo | Depende de | Cierre |
|---|---|---|---|
| AUTH-00 (solo si falta) | Habilitar runner mínimo del proyecto | Nada | Una prueba de ejemplo ejecuta |
| AUTH-01 | Validador de política y sus pruebas | AUTH-00 si existe | Matriz anterior comprobada |
| AUTH-02 | Integrarlo en alta/cambio de contraseña | AUTH-01 y flujos existentes | Pruebas de integración de esos flujos |

Este fragmento no cubre toda autenticación ni todo EntreVista AI. Genera el paquete completo con la [skill incluida](skills/create-implementation-plan/SKILL.md) y el [prompt de preparación E7](../estacion7/preparacion.md). Revisa cobertura y dependencias antes de publicar; AUTH-02 sigue bloqueada si sus flujos aún no existen.

## 4. Prompts para la clase

Empieza con el prompt de generación completa de la preparación E7. Los siguientes sirven para inspeccionar y mejorar tareas individuales dentro del paquete. La skill genera `task-package.yaml`, `milestones.md` y un archivo por tarea. Añade `cobertura.md` para comprobar que todos los requisitos están representados.

### Leer y detectar vacíos

```text
Lee las reglas de negocio de mi unidad y las instrucciones del repositorio.
No implementes todavía. Propón una tarea pequeña con resultado observable.
Separa alcance, fuera de alcance, referencias y criterios de aceptación.
Cita archivos y reglas reales. Señala contradicciones y decisiones pendientes.
Identifica el runner y el comando de validación existentes. Si faltan, dilo.
```

### Revisar readiness

```text
Revisa esta tarea como alguien que tendrá que ejecutarla mañana sin este chat.
¿Sabes qué cambiar, dónde buscar y cómo demostrar que funciona?
Devuelve Listo / Bloqueado, con evidencia por criterio y preguntas concretas.
No apruebes campos vacíos ni inventes comandos o dependencias resueltas.
```

### Revisión cruzada en pareja

```text
Busca un caso que rompa los criterios de aceptación de esta tarea.
Comprueba que no amplíe el alcance, que tenga contexto suficiente y que
la evidencia propuesta demuestre el comportamiento, no solo que hubo actividad.
Propón el cambio mínimo a la tarea. No escribas código.
```

### Handoff al siguiente intento

```text
Deja una nota breve con objetivo, decisiones aceptadas, archivos relevantes,
pruebas ejecutadas y resultados, intentos fallidos, pendientes y siguiente paso.
No incluyas secretos ni afirmes verificaciones que no ejecutaste.
```

### Dispatch manual para estación 7

```text
Toma únicamente la tarea indicada. Lee sus dependencias y las instrucciones
del repositorio. Si está bloqueada, explica por qué y detente.
Resume alcance y plan, implementa el cambio mínimo y ejecuta sus verificaciones.
Entrega diff, comandos/resultados y limitaciones para revisión humana.
No marques Done ni hagas merge por haber terminado de responder.
```

Este último prompt enseña el proceso manual. No instala ni sustituye la skill específica `opensymphony-dispatch`.
