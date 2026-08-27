# Estación 2 — De la idea a la definición

Segunda estación de AI for Developers, Cohorte 4. Aquí pasas de tu **Product Vision Board**
(o Solution Brief) a un **PRD v1**, co-creado con tu agente.

---

## Qué hay acá

| Archivo | Qué es |
|---|---|
| **hcai-c4-e2-manual-estudiante.pdf** | **El manual completo.** Los frameworks de la Hora 1, el refinamiento del PVB campo por campo y el paso a paso para crear el PRD. Empieza por acá |
| **hcai-c4-e2-manual-estudiante.md** | El mismo manual en Markdown, por si prefieres leerlo en tu editor |
| **prompts-especificacion.md** | Los prompts para co-crear el PRD. **El Prompt 1 es el de esta semana** |
| **docs/** | Ejemplo trabajado — AgentVault, escrow autónomo en USDC para agentes. Reemplázalo con tu caso |
| **specs/** | Donde queda tu PRD |
| **AIforDevelopers_C4_E2_slides.pdf** | Las slides de la sesión |

---

## Cómo usar esta carpeta

### 1. Clona el repo

```bash
gh repo clone hardcore-ai/c4
cd c4/estacion2
```

### 2. Arma tu `docs/`

La carpeta viene con el ejemplo de AgentVault para que veas la profundidad esperada.
**Tu trabajo es reemplazar esos archivos con los tuyos.**

| Archivo | Reemplázalo con |
|---|---|
| `docs/pvb.md` | Tu Product Vision Board de la Estación 1, ajustado con los frameworks de hoy |
| `docs/overview.md` | Tu análisis del dominio: tecnologías, tendencias, contexto del problema |
| `docs/mercado.md` | Tu análisis de mercado: tamaño, competidores, regulación, geografías |
| `docs/icp.md` | Tu Ideal Customer Profile: buyer personas, dolores, objeciones |
| `docs/critica.md` | Tu deep research de crítica: huecos, riesgos, por qué fracasan productos similares |

Agrega todos los archivos que tengas: transcripciones de entrevistas, benchmarks, notas de
campo. **Las transcripciones de conversaciones con usuarios reales son el insumo más valioso**
— son las que el Análisis de Conflictos cruza contra tu Vision Board.

> **Markdown, no PDF.** Gasta menos tokens y el modelo lo lee mejor.

### 3. Corre el Paso 0 — Análisis de Conflictos

Antes de escribir una línea del PRD. El agente lee todo tu `docs/` y busca las contradicciones
entre documentos. **No las resuelve: te obliga a decidir.** Esa fricción es el valor.

### 4. Ejecuta el Prompt 1 con tu LLM

Abre `prompts-especificacion.md`, copia el **Prompt 1 (PRD)** y pégalo en una conversación
nueva. Adjunta **todos** los archivos de tu `docs/`.

Trabaja segmento por segmento. **No avances al siguiente sin aprobar el actual.** El prompt está
diseñado para co-creación con human-in-the-loop: el agente pregunta, tú decides.

> **Si el modelo no respeta el flujo segmento por segmento**, no lo estás haciendo mal: es
> comportamiento conocido de Sonnet en medium. Abre sesión nueva con Opus, o pídele todo de una.

El resultado va a `specs/prd.md`.

---

## Tu tarea

**Deadline: martes 1 de septiembre, 7:00 PM — Estación 3.**

1. **PRD v1** — co-creado con tu agente, incorporando lo que te sacó el Análisis de Conflictos.
   Es una v0.1 para iterar.
2. **Entorno de coding agents listo** — la Estación 3 es *Ingeniería Agéntica* con Carlos
   Alarcón, hands-on: coding agents, MCP, skills, hooks y subagentes. Llega con Claude Code
   funcionando y tus credenciales resueltas.
3. **Solo FDE — Stakeholder Map:** sponsor, usuario final, quién tiene el veto, aliado técnico.
   Claro, no bonito.

**Regla de oro:** un campo en blanco honesto vale más que una respuesta inventada.

---

## Refuerzo

**Lunes 31 de agosto, 7-8pm.** Ese espacio es de esta estación: lleva tu PRD a medio camino y
lo trabajamos ahí.

Entre sesiones, el **grupo de WhatsApp de la cohorte** es tu primer recurso.

---

*AI for Developers | 30X — Cohorte 4 — Estación 2*
