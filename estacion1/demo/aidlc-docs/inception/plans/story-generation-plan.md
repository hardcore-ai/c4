# Story Generation Plan — SkillWall Live

## Story Planning Questions

Responde cada pregunta con la letra correspondiente después del tag [Answer]:

### Question 1
¿Cómo prefieres organizar las historias de usuario?

A) Por persona (Participante, Votante, Admin) — cada grupo con sus historias
B) Por feature/FR (Join, Wall, Likes, Leaderboard, Admin, Health)
C) Por flujo de usuario (journey end-to-end: registro → wall → like → leaderboard)
D) Other (please describe after [Answer]: tag below)

[Answer]: D. 

### Question 2
¿Qué nivel de granularidad para las historias?

A) Épicas con sub-historias (ej: Épica "Registro" → stories: formulario, upload foto, selección skills, validación)
B) Historias atómicas directas (una por cada acción de usuario, ~15-20 stories)
C) Historias por endpoint/feature (una por FR, ~8-10 stories con acceptance criteria detallados)
D) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3
¿Incluir historias técnicas (no user-facing) para observabilidad, seguridad e infraestructura?

A) Sí, como historias técnicas separadas (ej: "Como operador, quiero traces E2E para diagnosticar problemas")
B) No, solo incluir como acceptance criteria dentro de las historias funcionales
C) Híbrido: historias técnicas solo para OTel e infraestructura, seguridad como criteria en stories funcionales
D) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
¿Qué formato de acceptance criteria prefieres?

A) Given/When/Then (BDD style)
B) Lista de checkboxes con condiciones verificables
C) Tabla de escenarios (input → expected output)
D) Other (please describe after [Answer]: tag below)

[Answer]: A. BDD en Gherkin 

### Question 5
¿Priorización de historias? ¿Cómo definir el orden de implementación?

A) MoSCoW (Must/Should/Could/Won't) — priorizando el flujo crítico de la demo
B) Por dependencia técnica (lo que se necesita primero para que funcione lo demás)
C) Por valor de demo (lo que genera más "wow" primero)
D) Other (please describe after [Answer]: tag below)

[Answer]: D. Todas las historias

---

## Story Generation Execution Plan

Una vez aprobadas las respuestas, se ejecutarán estos pasos:

- [x] Step 1: Definir personas (Participante, Admin) con características y motivaciones
- [x] Step 2: Generar historias de usuario organizadas por feature/FR
- [x] Step 3: Agregar acceptance criteria en formato BDD Gherkin
- [x] Step 4: Incluir historias técnicas separadas (OTel, Seguridad, Infra)
- [x] Step 5: Sin priorización — todas las historias se implementan
- [x] Step 6: Mapear personas a historias
- [x] Step 7: Validar INVEST criteria en cada historia
- [x] Step 8: Generar stories.md y personas.md finales
