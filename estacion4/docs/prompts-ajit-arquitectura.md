# Prompts para el Refinamiento Arquitectónico (AJIT) en SDD

> [!NOTE]
> Estos prompts están diseñados para ejecutarse durante la transición de la fase **Inception** a la fase **Construction** del framework AI-DLC. 
> Su objetivo es garantizar que el producto tenga una base técnica sólida antes de generar el primer archivo de código.

> [!IMPORTANT]
> **Modo de trabajo: Co-creación iterativa.** El arquitecto (tú) debe validar cada segmento. La IA actuará como un Senior Cloud Architect & Tech Lead.

---

## Prompt 1 — Diseño de Estructura: C4 Model & Mermaid

```text
Actúa como Senior Solutions Architect experto en Cloud (AWS/Azure/GCP) y patrones de Microservicios/Serverless.

Basándote en el PRD y la especificación funcional que ya definimos (en specs/prd.md), vamos a diseñar la infraestructura y los límites del sistema usando AJIT (Architecture Just-in-Time).

═══════════════════════════════════════════════
REGLAS DE DISEÑO
═══════════════════════════════════════════════
1. Simplicidad sobre complejidad: Si un monolito modular resuelve el problema, no propongas 50 microservicios.
2. Cloud-Native: Prioriza servicios gestionados para reducir carga operativa.
3. Seguridad por diseño: Los datos nunca deben estar expuestos directamente; siempre debe haber capas de mediación (API Gateways, WAF, etc.).
4. Usa diagramas Mermaid en cada segmento.

═══════════════════════════════════════════════
MODO DE TRABAJO
═══════════════════════════════════════════════
Trabaja SEGMENTO POR SEGMENTO. Detente y espera mi aprobación tras cada uno.

### Segmento 1. Diagrama de Contexto (C4 Level 1)
- Identifica el sistema central y todos los actores (usuarios, sistemas externos, APIs de terceros).
- Genera el diagrama Mermaid de contexto.
- Explica brevemente las fronteras del sistema: qué hace nuestro producto y qué delegamos a externos.

### Segmento 2. Diagrama de Contenedores (C4 Level 2)
- Desglosa el sistema en contenedores técnicos (Frontend, API, Worker, Database, Cache, File Storage).
- Genera el diagrama Mermaid detallando protocolos de comunicación (HTTPS, WebSockets, gRPC, JDBC).
- Justifica la elección de cada componente tecnológico sugerido.

### Segmento 3. Matriz de Atributos No Funcionales (NFR)
Presenta una tabla con los 3 NFRs más críticos para este producto (ej. Escalabilidad, Latencia, Disponibilidad):

| Atributo | Justificación según PRD | Táctica Arquitectónica (Cómo lo lograremos) |
|----------|-------------------------|---------------------------------------------|

### Segmento 4. Identificación de Riesgos y SPOF
- Identifica los Puntos Únicos de Falla (SPOF).
- Propón planes de contingencia (ej. Multi-AZ, colas de reintento, Circuit Breakers).

═══════════════════════════════════════════════
COMIENZA POR EL SEGMENTO 1 (Contexto)
═══════════════════════════════════════════════
Analiza el PRD y presenta el Diagrama de Contexto. Espera mi feedback.

```

---

## Prompt 2 — ADR: Toma de Decisiones y Trade-offs

```text
Actúa como Technical Lead. Vamos a documentar una decisión arquitectónica crítica para este proyecto.

═══════════════════════════════════════════════
EL DESAFÍO
═══════════════════════════════════════════════
Debemos decidir sobre: [INSERTAR TEMA: Ej. Tipo de Base de Datos / Proveedor de Auth / Estilo de API].

═══════════════════════════════════════════════
TAREA
═══════════════════════════════════════════════
1. Analiza 3 alternativas viables basándote en el contexto de nuestro PRD.
2. Crea una tabla de Comparativa Técnica incluyendo: Curva de aprendizaje, Costo Cloud, Escalabilidad y Mantenibilidad.
3. Recomienda una opción actuando como el "Abogado del Diablo" (menciona qué perdemos al elegirla).
4. Finalmente, genera el documento siguiendo el formato `specs/adr-00X.md`.

Detente después del punto 3 para que yo tome la decisión final antes de redactar el archivo .md.

```