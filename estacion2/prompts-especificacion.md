# Prompts para Co-Crear la Especificación Inicial de un Producto Agéntico

> [!NOTE]
> Cada prompt está diseñado para ejecutarse **secuencialmente** en conversaciones separadas de Claude.
> El output de cada uno alimenta al siguiente.

> [!IMPORTANT]
> **Modo de trabajo: Co-creación iterativa.** Estos prompts NO piden que Claude genere todo de una vez. Cada prompt instruye a Claude a producir **un segmento a la vez**, pausar, y esperar tu revisión y aprobación antes de avanzar al siguiente. Esto garantiza que cada pieza del artefacto refleje tanto el criterio de la IA como el del creador.

---

## Convención de Carpetas

```
proyecto/
├── docs/          ← Documentos de entrada (todo lo que alimenta la especificación)
│   ├── overview.md
│   ├── icp.md
│   ├── mercado.md
│   ├── transcripcion-cliente-01.md
│   ├── benchmark-competidores.md
│   └── ... (cualquier doc adicional)
│
├── specs/         ← Especificaciones generadas (outputs de estos prompts)
│   ├── prd.md              ← Output del Prompt 1
│   ├── arquitectura.md     ← Output del Prompt 2
│   └── backlog.md          ← Output del Prompt 3
│
└── prompts-especificacion.md  ← Este archivo
```

> [!TIP]
> **Inputs**: Coloca en `docs/` todos los documentos que tengas: overview, ICP, mercado, transcripciones de entrevistas con usuarios/clientes, análisis competitivos, benchmarks, notas de campo. Adjúntalos todos en cada prompt.
> **Outputs**: Cuando Claude consolide cada documento final, guárdalo en `specs/` con el nombre indicado.

---

## Prompt 1 — PRD: Visión, Propuesta de Valor y Especificación Funcional

```text
Actúa como Head of Product + AI/Agent Architect.

Voy a construir un producto agéntico. Te adjunto todos los documentos de mi carpeta docs/: puede incluir análisis de dominio, funcionalidades de referencia, perfil de cliente ideal (ICP), análisis de mercado, transcripciones de conversaciones con usuarios o clientes potenciales, benchmarks, análisis competitivos, o cualquier otro documento relevante.

═══════════════════════════════════════════════
REGLAS
═══════════════════════════════════════════════
1. No inventes datos: si falta algo, escribe TBD y propón 2-3 opciones razonables.
2. Extrae textualmente de mis docs cuando sea clave (cifras, métricas, datos de mercado) — sin excederte.
3. Señala decisiones críticas y sus trade-offs en recuadros de alerta.
4. Usa diagramas Mermaid donde aplique.

═══════════════════════════════════════════════
MODO DE TRABAJO: CO-CREACIÓN ITERATIVA
═══════════════════════════════════════════════
NO produzcas todos los entregables de una vez.
Trabaja SEGMENTO POR SEGMENTO en el orden listado abajo.

Para cada segmento:
1. Produce el contenido del segmento.
2. Resalta las decisiones que tomaste y por qué.
3. Si detectaste información de mis docs que influyó en lo que escribiste, cita la fuente.
4. Detente y pregúntame: "¿Apruebas este segmento, tienes ajustes, o quieres que explore una dirección diferente?"
5. Solo avanza al siguiente segmento cuando yo te lo indique.

Cuando hayamos terminado todos los segmentos, consolida el documento completo. El documento final se guardará como specs/prd.md.

═══════════════════════════════════════════════
PASO 0 — ANÁLISIS DE CONFLICTOS (OBLIGATORIO, ANTES DE TODO)
═══════════════════════════════════════════════
Antes de producir cualquier entregable, haz un análisis exhaustivo cruzado de TODOS los documentos que te pegué. Busca:

1. **Contradicciones de datos**: cifras, métricas o afirmaciones que se contradigan entre documentos (ej: un doc dice que el mercado crece al 12% y otro dice 18%).
2. **Conflictos de posicionamiento**: diferencias en cómo se define al usuario, al cliente, al problema, o al producto entre documentos.
3. **Señales contradictorias de usuarios/clientes**: si hay transcripciones, identifica opiniones divergentes entre entrevistados que requieran una decisión de producto.
4. **Supuestos incompatibles**: premisas que un documento asume pero otro contradice o ignora.
5. **Vacíos críticos**: información que debería existir para tomar decisiones pero que ningún documento provee.

Presenta los hallazgos en una tabla:

| # | Tipo de Conflicto | Doc A dice... | Doc B dice... | Decisión Requerida |
|---|-------------------|---------------|---------------|--------------------|

Para cada conflicto, propón una recomendación, pero espera mi decisión antes de continuar. Estas decisiones moldearán todo el PRD.

═══════════════════════════════════════════════
SEGMENTOS DEL PRD (producir uno a la vez)
═══════════════════════════════════════════════

### Segmento 1. One-Liner del Producto + Job to be Done (JTBD)
- Una frase de producto (máx. 2 oraciones)
- JTBD principal: "Cuando [situación], quiero [motivación], para [resultado esperado]"
- Misión del producto (máx. 3 oraciones)

### Segmento 2. Contexto y Problema
- Dolores del mercado (con datos duros de mis docs)
- ¿Por qué ahora? (tendencias, regulación, movimientos de mercado que crean urgencia)
- Alternativas actuales: qué usa el ICP hoy y por qué es insuficiente

### Segmento 3. ICP Detallado
- Perfil y firmographics (tamaño, sector, geografía)
- Buyer personas: roles que toman la decisión de compra
- Pains (referencia directa a mis docs y transcripciones)
- Triggers de compra (eventos que detonan una búsqueda activa de solución)
- Objeciones probables y cómo responderlas
- Si hay transcripciones, extrae verbatims clave que validen o maticen el ICP

### Segmento 4. Propuesta de Valor Única (UVP) y Diferenciadores
- ¿Qué problema resuelve? ¿Para quién? ¿Cómo?
- Diferenciación vs. competidores identificados en mis docs
- Cuál es la brecha de mercado que este producto llena
- Matriz de posicionamiento 2x2 (diagrama Mermaid quadrantChart):
  - Elige los 2 ejes más relevantes según el dominio
  - Ubica a todos los competidores + el producto propuesto

### Segmento 5. Casos de Uso Top 5
Para cada caso de uso:
- Actor (tipo de usuario)
- Trigger (qué lo detona)
- Steps (3-5 pasos del flujo)
- Resultado esperado
- Valor medible (KPI impactado)

### Segmento 6. Principios de Diseño No Negociables
Identifica de mis docs los principios de diseño que el producto no puede violar.
Para cada principio: (a) qué significa operativamente, (b) cómo se manifiesta en la interfaz del producto, (c) qué está explícitamente PROHIBIDO.

### Segmento 7. User Journeys
Describe en detalle narrativo (pasos numerados):
1. Happy Path del usuario final (el que recibe el valor directo del agente)
2. Happy Path del operador/administrador (el que configura, supervisa y toma decisiones)
3. Edge Case 1: Un flujo se interrumpe o el usuario abandona
4. Edge Case 2: El agente no puede resolver la tarea y debe escalar a un humano

### Segmento 8. MVP Scope (MoSCoW)
Clasifica features en:
- **Must Have**: Lo que DEBE estar en v1
- **Should Have**: Alto valor pero se puede vivir sin él en v1
- **Could Have**: Diferenciadores futuros
- **Won't Have (por ahora)**: Qué está fuera del MVP y por qué

### Segmento 9. Especificación Funcional: Módulos y Features
Identifica los módulos funcionales del sistema.
Para cada módulo: features principales, roles/permisos, pantallas/flows que lo exponen.
Incluye un diagrama Mermaid de la arquitectura funcional de alto nivel.

### Segmento 10. Métricas de Éxito
- 1 métrica North Star
- KPIs de activación, retención y calidad
- Para cada KPI: baseline actual (con datos de mis docs si los hay) y meta objetivo
- Métricas de calidad del agente: factualidad, utilidad, seguridad

### Segmento 11. Plan de Evaluación del Agente
- Dataset inicial: qué datos se necesitan para evaluar el agente antes de lanzar
- Criterios de calidad: factualidad, adherencia a instrucciones, relevancia de respuestas
- QA de outputs: cómo se revisan los outputs del agente
- Red-teaming: escenarios adversariales

### Segmento 12. Riesgos y Mitigaciones
Tabla con los 10 riesgos principales (técnicos, legales, reputación, producto, mercado) con:
- Probabilidad (Alta/Media/Baja)
- Impacto (Alto/Medio/Bajo)
- Plan de mitigación específico

### Segmento 13. Plan de Entrega 30/60/90 Días
- **Días 1-30**: ¿Qué se construye? ¿Qué se valida?
- **Días 31-60**: ¿Qué se entrega? ¿Primer piloto?
- **Días 61-90**: ¿Qué se mide? ¿Iteración basada en qué datos?

═══════════════════════════════════════════════
COMIENZA POR EL PASO 0 (Análisis de Conflictos)
═══════════════════════════════════════════════
Analiza mis documentos, presenta los conflictos encontrados, y espera mis decisiones antes de empezar con el Segmento 1.

═══════════════════════════════════════════════
MIS DOCUMENTOS (todos los archivos de la carpeta docs/)
═══════════════════════════════════════════════

[ADJUNTA AQUÍ TODOS LOS ARCHIVOS DE TU CARPETA docs/]
```

---
