# Post-mortem C3: solicitudes para rediseñar E6 y E7 de C4

Documento para Leonardo y el equipo docente: decisiones y recomendaciones que deben orientar los decks y la preparación de las estaciones 6 y 7.

## Fuentes y límites

- **T:** `c3-post-mortem-transcript.txt`, leída completa, líneas 1-442. Reunión del 15 de julio de 2026; el encabezado registra una duración de 1 h 14 min. No hay timestamps por intervención, por lo que la evidencia se cita por líneas.
- **S:** `c3-post-mortem-summary.txt`, leído completo, líneas 1-94. Se contrasta con T; no se toma como acta independiente de compromisos.
- Las referencias parten de `/Users/magos/dev/TribuIA/Hardcore/`. Se normalizan grafías como OpenSymphony, Linear y AIDLC; las ambigüedades de la transcripción no se convierten en especificaciones técnicas.
- **Acuerdo explícito:** hay una decisión de cierre o aceptación identificable. **Solicitud/propuesta:** alguien la formula, pero no consta aprobación final de ese detalle. **Inferencia:** recomendación de este análisis, no compromiso de la reunión.
- Las prioridades son editoriales, no una votación: **P0**, necesario para preparar E6/E7; **P1**, mejora importante de enseñanza o coordinación; **P2**, alternativa pendiente que no debe bloquear el material.
- La reunión refiere comentarios de estudiantes y un dashboard, pero los archivos no contienen respuestas individuales, tamaño de muestra, distribución ni resultados cuantitativos verificables. No permiten construir una encuesta ni atribuir porcentajes de satisfacción. Las menciones a notas en T153, T405 y T414 son comentarios de participantes, no una tabla de resultados.

## Acuerdos explícitos que afectan E6 y E7

| Prioridad | Solicitud o decisión | Responsable y alcance de la atribución | Evidencia |
|---|---|---|---|
| P0 | **E6 conecta la especificación con un estado listo para implementar.** Primero evaluar la especificación; después convertir su alcance en trabajo gestionado en Linear; explicar el sistema agéntico que lo ejecutará. | Danny formula la secuencia; Leonardo acepta el cierre de los ajustes. Leonardo prepara E6. | T105-111, T129-135. |
| P0 | **Incorporar Linear en E6**, con descomposición del trabajo. Leonardo plantea un grafo de tareas con dependencias y criterios de aceptación y su publicación mediante skills. | Danny pide incorporar Linear; Leonardo concreta el recorrido. El uso de skills específicos es la implementación propuesta, no una exigencia independiente. | T105-111. |
| P0 | **E7 pasa de estar listo para implementar a implementar**, con más práctica y conceptos reforzados durante la ejecución. | Danny define el objetivo; Leonardo lo acepta. La expresión «Acepto, sí, hacer un taller» aparece en la intervención de Danny. | T111-132. |
| P0 | **E6 deja una tarea conceptual y práctica para E7**, con lectura, ejercicio e instrucciones de instalación. Debe permitir llegar preparado y con preguntas. | Leonardo, nombrado expresamente al retomar el acuerdo; los estudiantes realizan la preparación. | T117-123, T129-132, T264. |
| P0 | **Herramientas concretas de E7: OpenSymphony, Linear y GitHub**, incluyendo PRs y code reviews. | Danny enumera las dos primeras; Leonardo agrega GitHub y advierte que la familiaridad con PRs/reviews puede variar. | T123-126. |
| P1 | **La preparación de la siguiente clase forma parte del material docente**, no se limita a una recomendación verbal. La tarea debe entregarse al profesor anterior cuando corresponda. | Cada profesor prepara lo necesario para su sesión; coordinación ajusta la guía. La atribución de «los dos» en T267 es ambigua y no permite identificar con certeza a la segunda persona. | T264-270, T414. |
| P1 | **Añadir un taller práctico después de E4, antes de E5**, para introducir decisiones de calidad, seguridad y despliegue de infraestructura como código. Es una dependencia curricular, no contenido que deba trasladarse íntegro a E6. | Danny fija la ubicación y pide el diseño; Andrés Caicedo acepta. | T372-381. |
| P1 | **Revisar con cada profesor cómo incorpora el feedback.** Los ajustes generales no sustituyen la revisión de cada clase. | Danny solicita las sesiones; Andrés Caicedo acepta agendar los espacios. Leonardo participa en la revisión de E6/E7. | T405-417. |

El cierre identifica estos ajustes para C4 (T426). La fecha mencionada allí es una previsión de esa reunión, no una verificación del calendario vigente.

## Solicitudes y propuestas de diseño

### P0. Hacer visible la continuidad entre especificación, tareas y ejecución

Danny pide evaluar la especificación que los participantes ya traen y evitar saltar directamente a documentos de diseño sin secuencia. Propone un skill sencillo de validación; menciona información mínima, producto, diseño y la declaración de TDD cuando se quiera trabajar así. **No se define una rúbrica ABCD completa ni se aprueba TDD como mandato universal.** Leonardo debe concretar la validación antes de presentar el ejercicio. Evidencia: T21-27, T108-111.

Cristian Cordoba reporta fricción al pasar de AIDLC a Linear y confusión sobre la fuente de verdad. Solicita mostrar el mapeo antes de introducir la orquestación. Incorporar Linear en E6 responde parcialmente al problema, pero **no queda decidida la política de fuente de verdad, sincronización o actualización de artefactos**. Debe explicitarla Leonardo para el ejemplo docente, en coordinación con quienes entregan la especificación previa. Evidencia: T60, T72, T105-111.

**Inferencia operativa:** usar el mismo ejemplo desde la revisión de la especificación hasta el ticket y el PR permitiría comprobar esa continuidad. No consta una decisión sobre cuál repositorio, proyecto o ticket utilizar.

### P1. Recuperar el mapa conceptual y usarlo durante las demostraciones

Danny solicita recuperar el slide de capas que relacionaba LLM, coding agent, arnés, loop y orquestación, y convertirlo en marco de referencia recurrente. Propone una barra que resalte el concepto tratado. Leonardo coincide en la utilidad de apoyos visuales para ubicar conceptos abstractos. **La necesidad de orientación visual tiene aceptación; la barra y su diseño son propuestas.** No consta el número definitivo ni el orden exacto de capas. Evidencia: T27-42.

Las visitas a sitios y las demostraciones deben continuar dentro de ese marco. Danny las valora y al mismo tiempo advierte que abruman cuando falta estructura. Solicita explicar conexiones y limitaciones en contexto. El intercambio T29-39 no identifica con precisión suficiente un protocolo: no usar la palabra transcrita «Server» como especificación técnica del deck. Responsable del mapa y su uso: Leonardo. Evidencia: T27-45.

### P1. Enseñar procesos concretos, no solo presentar herramientas

Danny pide mostrar técnicas en vivo: un loop, el proceso de code review, una práctica propia o un pipeline. La intención es reducir el trabajo que el alumno necesita para construir el modelo mental por su cuenta. Leonardo defiende aterrizar los conceptos en una herramienta. Responsable de preparar los ejemplos: Leonardo. Evidencia: T45-51.

OpenSymphony da una referencia concreta y acceso al creador, pero puede absorber la atención y ocultar los conceptos transferibles. OpenHands aparece como alternativa hipotética; no se decide añadirlo ni se prohíbe mostrar otras herramientas. **Inferencia:** mantener un recorrido práctico principal y usar el mapa para explicar qué es general y qué corresponde a OpenSymphony. Evidencia: T45-48.

### P1. Distribuir teoría y práctica entre ambas estaciones

Leonardo describe el contenido conceptual de E6: skills, alcance, contexto/ingeniería de contexto, subagentes, ejecución y arneses. Después propone mover parte del arnés a E7 y abordar allí la integración del code review automatizado. **La redistribución exacta de contenidos queda abierta**, aunque la frontera por resultados sí se acuerda. Evidencia: T99-114.

Cristian Cordoba propone una progresión de una sola tarea conectada a Linear que genere un PR, seguida de la automatización con OpenSymphony. Danny reconoce su sentido metodológico y plantea un taller para continuar/cerrar construcción de AIDLC, pero no queda una agenda aprobada para ese taller. **Inferencia:** el recorrido de un ticket puede servir como ejercicio mínimo de E7; no debe presentarse como requisito ya acordado. Evidencia: T72-81.

### P2. No convertir Open Symphony Dispatch en obligación

Leonardo propone compartir el skill, ejecutarlo manualmente en el arnés preferido y mostrar qué automatiza OpenSymphony. Considera grabarlo porque hacerlo en vivo tomaría mucho tiempo. Describe un ciclo manual sin continuación automática del review ni despacho reiterado; señala que OpenSymphony atiende el review automáticamente y deja el merge al humano. Son descripciones hechas en la reunión, no verificaciones de capacidades actuales. Evidencia: T84-96.

**Danny objeta usar el skill y plantea invertir ese tiempo de otra forma** (T99). No consta un compromiso posterior de incorporarlo o compartirlo. Responsable de la propuesta: Leonardo; objeción: Danny. La grabación también queda como opción vinculada a esta propuesta, no como entregable aprobado.

## Tarea previa de E7

### Requisitos respaldados por la reunión

| Requisito | Estado y evidencia | Responsable |
|---|---|---|
| Entregarla desde E6, para preparar E7. | Acuerdo; T123, T264. Danny cuenta con el fin de semana como oportunidad de preparación, T117. | Leonardo entrega; estudiantes realizan. |
| Incluir lectura/revisión conceptual y una práctica. | Acuerdo; T123, T264. El PDF es una sugerencia de formato, no una obligación, T117. | Leonardo. |
| Incluir instrucciones de instalación de lo necesario para la siguiente estación. | Acuerdo; T264-270. Se retoma la necesidad de llegar con el software descargado, T414. | Leonardo, con la guía común del programa. |
| Proponer un intento de implementación sobre un repositorio. | Propuesta concreta de Danny, T123; no se identifica el repo, la tarea ni el resultado obligatorio. | Leonardo concreta el ejercicio. |
| Permitir que los participantes lleguen con preguntas derivadas de la práctica. | Propósito explícito; T123, T129. No se define un formato obligatorio de entrega de preguntas. | Estudiantes; Leonardo las incorpora a la sesión. |
| Preparar el contexto de OpenSymphony, Linear y GitHub, incluidos PRs y reviews. | Herramientas acordadas para E7, T123-126. La lista detallada de instalaciones y accesos no está definida. | Leonardo. |

La exclamación «3 horas» de Leonardo (T120) no constituye una duración acordada de la tarea ni de E7. Tampoco se fija fecha/hora de entrega, evaluación, repositorio definitivo o criterio de aprobación.

### Especificación recomendada para poder publicar la tarea

Los siguientes puntos son **inferencias operativas**, no acuerdos adicionales. Prioridad P0; responsable propuesto: Leonardo. Responden a las fricciones de mapeo, instalación y familiaridad con GitHub registradas en T60, T123-126 y T231-270.

1. Identificar el repositorio y su estado inicial, la especificación que se utilizará y una tarea acotada. Aclarar si es un ejercicio común o el proyecto del alumno.
2. Enumerar herramientas, cuentas, permisos y pasos de instalación realmente necesarios; incluir una comprobación sencilla de acceso al repo y a Linear y de ejecución del arnés elegido. No asumir que descargar software basta.
3. Mostrar cómo se conserva la relación entre especificación, tarea y criterio de aceptación. Declarar dónde se modifica cada artefacto en ese ejercicio.
4. Pedir evidencia breve del intento: resultado alcanzado o bloqueo, más preguntas. No exigir un PR terminado como condición de asistencia sin decidirlo expresamente.
5. Preparar una vía de recuperación para quien llegue bloqueado, de modo que E7 pueda empezar a implementar sin convertirse en una sesión completa de instalación.
6. Publicar tiempo estimado, canal de ayuda y forma de compartir dudas. La reunión no fija esos valores: deben decidirse antes de distribuir la tarea.

## Tensiones que el rediseño debe preservar

| Tensión | Posiciones registradas | Consecuencia para el material |
|---|---|---|
| Teoría suficiente frente a sobrecarga. | Cristian Cordoba advierte acumulación de conceptos; Leonardo reconoce los prerrequisitos teóricos; Danny pide estructura y demostraciones de procesos. T51-60, T102-114. | E6 no debe ser solo un glosario. Usar su recorrido de preparación como estructura; reforzar ejecución y review al hacerlos en E7. Esta concreción es una recomendación. |
| Continuidad metodológica frente a exposición a nuevas formas de trabajo. | Danny no quiere limitarse a AIDLC; Cristian pide resolver el mapeo antes de orquestar. T21, T60-75. | Conservar la especificación de entrada y explicar su transformación, sin presentar otra herramienta como un reinicio sin relación con el trabajo anterior. |
| Herramienta concreta frente a conceptos transferibles. | Danny identifica tanto el valor como el sesgo hacia OpenSymphony; Leonardo defiende lo práctico. T45-48. | Mostrar el proceso en una herramienta y ubicarlo en el mapa conceptual; no inferir una obligación de enseñar varias plataformas. |
| Demostración del profesor frente a práctica del estudiante. | Danny pide técnicas en vivo y tarea previa; Cristian propone que el alumno ejecute una tarea; Leonardo advierte del costo temporal de mostrar el ciclo manual. T51, T72-90, T123-129. | Distinguir lo que el docente muestra de lo que el alumno intenta. El formato taller no queda satisfecho únicamente por observar una demo. Esta última es una inferencia pedagógica. |
| Preparar el entorno frente a dedicar una sesión al setup. | Andrea Caro transmite la solicitud estudiantil; Andrés cuestiona la necesidad de una sesión y propone manual/prompts; Christian Braatz recuerda instalaciones adicionales. T231-258. | El cierre adopta instrucciones previas por sesión, T264-270. No describe un rechazo universal al soporte de instalación. |
| Calidad temprana frente a aprendizaje incremental. | Cristian reporta implementación sin QA, T60. Andrés defiende shift-left para calidad, seguridad, observabilidad e infraestructura, T357. Cristian prefiere enseñar qué/cómo y ampliar después el arnés, T375. | El cierre fija el taller antes de E5 para calidad, seguridad e infraestructura, T378-381. Observabilidad fue discutida, pero no aparece nombrada en ese cierre. E6 debe coordinar qué criterios recibe, sin inventar un temario previo garantizado. |
| Presión de entrega frente a dar más tiempo. | Cristian reporta estrés y orquestadores aún sin funcionar; pide una semana adicional. Danny objeta extender el programa. T384-402. | No resolver el rediseño suponiendo una semana extra aprobada. La tarea previa mejora preparación, pero la reunión no demuestra que elimine el estrés. |

## Contraste con el resumen

| Pasaje de S | Resultado del contraste con T |
|---|---|
| S3, S5, S41-49: tarea previa, preparación en E6 y ejecución en E7. | Respaldado en T105-132 y T264-270. Precisar que el PDF es opcional y que E6 también debe trabajar sobre especificación y tickets, no solo presentar teoría. |
| S4 y S50: Leonardo compartirá Open Symphony Dispatch. | **Compromiso no sustentado.** T84-90 contiene la propuesta y T99 la objeción de Danny. Retirar de la lista de obligaciones. |
| S42: skill de validación. | La evaluación de la especificación queda en la secuencia de E6, T111; implementarla como skill es una opción, T21-27. No existe una rúbrica cerrada. |
| S40: «rediseño completo acordado». | Hay acuerdo sobre los ajustes y la frontera entre E6/E7, T111-135; no un temario exhaustivo aprobado. No autoriza presentar cada propuesta como decisión final. |
| S77: se descarta usar múltiples herramientas. | T45 expresa el riesgo de dispersión y considera OpenHands como ejemplo; no establece una prohibición. |
| S26: se rechaza una sesión separada de setup. | Resume demasiado categóricamente el debate. El cierre positivo es incluir instalación en las tareas previas, T264-270, sin prohibir apoyo adicional. |
| S30: E3 atribuida a Cristian Cordoba. | T27, T276, T279 y T300 se refieren a **Carlos** al hablar de esa estación. No copiar la atribución de S. El apellido de Carlos no queda establecido. |
| S7: Christian Braatz coordinará el taller de skills. | T278-300 registra propuestas y discusión del formato, no una asignación inequívoca de coordinación a Christian Braatz. No trasladarle ese compromiso. |
| S9, S37, S84: revisión de AIDLC v2. | T378 deja pendiente la revisión de «Cristian»; Christian Braatz también habla de rehacer E4/E5 en T405. Hay riesgo de confundir a Cristian Cordoba y Christian Braatz. Confirmar el responsable y los artefactos de salida, sin resolver la atribución por conjetura. |
| S16, S32-34: taller temprano de calidad/seguridad/infraestructura. | El encargo a Andrés y su aceptación están en T378-381. La nivelación/charla bonus es una alternativa anterior, T357-363; el cierre ubica el taller entre E4 y E5. |
| S21, S61: notas aproximadas y meta numérica. | T405 y T414 contienen referencias orales distintas a notas y aspiraciones. No hay base para un promedio calculado ni una encuesta cuantitativa. |
| Omisiones importantes de S. | Incorporar el mapa visual recurrente, T27-45; la pregunta sobre fuente de verdad, T60; las dependencias y criterios de aceptación, T108; la posible redistribución del arnés/review, T114; la duda sobre familiaridad con GitHub, T126. |

La discusión de AIDLC v2 (T303-339) puede afectar la entrada de E6, pero sus capacidades son afirmaciones de la reunión y no se verificaron aquí. Los testimonios de impacto y el cierre comercial (T420-426) no añaden requisitos para el deck ni validan cuantitativamente las mejoras.

## Pendientes antes de cerrar el material

- **Leonardo, P0:** fijar la validación mínima de la especificación, el ejemplo de descomposición y el mapeo a Linear. Son concreciones pendientes del recorrido acordado.
- **Leonardo, P0:** definir y publicar el repositorio/ejercicio, guía previa e instalaciones; separar requisitos acordados de las recomendaciones operativas de este documento.
- **Leonardo y coordinación, P1:** cerrar la distribución de arnés, review y tiempo práctico entre E6/E7. No dar por aprobada una duración para E7 ni una agenda minuto a minuto.
- **Andrés Caicedo, P1:** diseñar el taller temprano y agendar la revisión individual con profesores, según T378-381 y T414-417. Confirmar qué debe llegar ya resuelto a E6.
- **Coordinación con Cristian Cordoba y Christian Braatz, P1:** aclarar la atribución de la revisión de E4/E5 y acordar sus artefactos de salida hacia E6. No asignarles indistintamente el mismo trabajo.

## Diseño propuesto de E6: 120 minutos

Propuesta de implementación solicitada para esta entrega, no agenda aprobada en el post-mortem. Leonardo conduce la sesión. Alterna explicaciones de 4-6 minutos con trabajo del participante; reserva la ejecución orquestada para E7. Los 120 minutos de E6 son consistentes con las dos horas planteadas en T111; no implican una duración para E7.

| Minutos | Teoría breve | Práctica del participante | Resultado observable |
|---|---|---|---|
| 0-15 | 5 min: objetivo de E6, frontera con E7 y mapa LLM/agente/arnés/orquestación. | 10 min: ubicar el proyecto y los artefactos que trae de estaciones anteriores; identificar qué falta para implementar. | Punto de partida y un bloqueo identificado. |
| 15-35 | 5 min: qué debe permitir decidir una especificación antes de ejecutar. | 15 min: revisar la especificación propia o un ejemplo común; corregir una ambigüedad de alcance o aceptación. | Especificación revisada y vacíos pendientes explícitos. |
| 35-55 | 5 min: alcance, tareas, dependencias y criterios de aceptación. | 15 min: descomponer una porción acotada de la especificación, con ayuda del agente si está disponible. | Conjunto pequeño de tareas relacionadas con la especificación. |
| 55-60 | Sin contenido nuevo. | 5 min: pausa. | Retomar sin acumular otro bloque conceptual. |
| 60-80 | 5 min: mapeo a Linear y política de fuente de verdad del ejercicio, con una demostración breve. | 15 min: publicar o preparar la publicación de las tareas; comprobar dependencias y aceptación. | Tickets trazables o paquete preparado con el bloqueo de acceso registrado. |
| 80-100 | 6 min: contexto, skills y subagentes aplicados a una tarea; qué hará el arnés y qué automatizará el orquestador. | 14 min: preparar las instrucciones de una tarea y revisar cómo se comprobará su resultado; contrastar en parejas. | Tarea con contexto, comprobación de calidad y punto de revisión humana. |
| 100-115 | 4 min: explicar la tarea previa de E7 y el recorrido esperado entre herramientas. | 11 min: abrir el repositorio y la guía; comprobar los accesos disponibles y registrar instalaciones o dudas pendientes. | Plan de preparación individual para E7, con bloqueos identificados. |
| 115-120 | Sin teoría nueva. | 5 min: cierre de preguntas y revisión de los resultados obtenidos. | Cada participante identifica qué está listo y qué debe completar antes de E7. |

**Distribución:** 30 minutos de explicación/demostración, 85 minutos de práctica y cierre, 5 minutos de pausa. Ningún bloque teórico supera 6 minutos. Son tiempos de diseño, no mediciones de C3.

**Criterio de salida propuesto:** el participante puede relacionar una especificación revisada con tareas y criterios de aceptación, explicar el papel de Linear y del sistema agéntico, y sabe qué debe preparar para E7. Una instalación bloqueada se registra; no se presenta como preparación terminada.

**Preparación del docente:** llevar un ejemplo común, su especificación y tareas de referencia, además de la guía de E7. Si un participante no puede acceder a Linear, trabaja el mismo mapeo en el artefacto de tareas y deja pendiente su publicación. Esta alternativa es una contingencia propuesta, no una sustitución permanente de Linear. No invertir el tiempo de E6 en el skill Dispatch objetado ni en una instalación larga de OpenSymphony.

## Síntesis para integrar al deck

1. **Acuerdo:** E6 lleva la especificación a un estado listo para implementar; E7 la lleva a ejecución.
2. **Acuerdo:** comenzar E6 evaluando la especificación. **Pendiente:** definir los criterios mínimos; el skill es opcional.
3. **Acuerdo/propuesta técnica:** descomponer el alcance en tareas para Linear; mostrar dependencias y criterios de aceptación.
4. **Solicitud:** explicar el mapeo AIDLC/especificación/Linear y aclarar la fuente de verdad del ejercicio.
5. **Solicitud:** recuperar el mapa visual de conceptos y usarlo para orientar demos y visitas a herramientas.
6. **Acuerdo:** hacer E7 más práctica, con OpenSymphony, Linear y GitHub; reforzar conceptos durante la ejecución.
7. **Solicitud:** mostrar procesos concretos, incluidos loops y code review, no solo funciones de una plataforma.
8. **Acuerdo:** dejar desde E6 lectura, práctica e instrucciones de instalación para E7; el PDF no es obligatorio.
9. **Propuesta:** usar un repositorio para intentar implementar y llegar con preguntas. **Inferencia:** comprobar accesos y admitir evidencia de bloqueos.
10. **Acuerdo curricular:** coordinar calidad, seguridad e infraestructura tempranas con el taller previo a E5; no esperar al final para introducirlas.
11. **Propuesta objetada:** Open Symphony Dispatch no es tarea ni demo comprometida; Danny cuestionó dedicarle tiempo.
12. **Acuerdo:** revisar los ajustes con cada profesor. No presentar las menciones orales a calificaciones como una encuesta cuantitativa.
