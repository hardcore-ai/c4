# Clase 8: Aseguramiento de Calidad — Pruebas Web, API y Agentes con IA Generativa

**Programa:** AI for Developers | 30X · **Instructor:** Andres Caicedo · **Duración:** 2h

## 👋 Bienvenida

En la Clase 7 cerraste el ciclo de implementación: orquestación AI-DLC → Linear, code review automatizado y memoria de proyecto. Tu producto ya existe, está construido, revisado y documentado. Hoy entras al **filtro de calidad antes de producción**: cómo garantizar — y demostrar — que el producto se comporta como el usuario espera, en tres capas distintas (web, API y agentes inteligentes). La óptica de la sesión: Gherkin, Page Object Model, TDD y las rúbricas nacieron **antes** de la IA generativa para que humanos se coordinaran con texto — y hoy ese mismo texto es la mejor interfaz para que un agente haga el trabajo **completo y verificable**, no a medias. La sesión alterna teoría con demostración en vivo sobre tres repositorios reales (`qa-e2e`, `qa-api`, `qa-agent-eval`), todos atacando un mismo producto en ejecución. Tú observas, anotas y replicas el patrón sobre tu propio producto entre clases.

## 🎯 De qué se trata

Ya tienes el producto implementado. Ahora la pregunta es: ¿cómo garantizas que funciona como se espera? Esta sesión cubre las estrategias y herramientas para asegurar la calidad del producto, potenciadas por IA generativa. La primera parte alterna teoría con demostraciones en vivo — desde la pirámide de pruebas hasta el patrón Persona + Juez. La segunda parte es una demostración continua del instructor sobre tres repositorios de código que prueban un producto real en ejecución: pruebas E2E web, pruebas de API, y evaluación de agentes inteligentes.

## 📚 Qué vas a aprender

- Entender por qué patrones **pre-IA** (Gherkin, POM, rúbricas) son la interfaz que hace que un agente entregue trabajo completo y verificable — no legado a superar, sino la pieza que faltaba.
- Ubicar tus esfuerzos de testing en la **pirámide correcta** y reconocer cuándo estás cayendo en el anti-patrón Ice Cream Cone.
- Escribir **escenarios BDD/Gherkin** (spec del negocio + test ejecutable a la vez) y estructurar tu suite con **Page Object Model** y patrones de API para que escale sin volverse frágil.
- Implementar el **patrón Persona + Juez** con golden datasets para evaluar agentes inteligentes — algo que un test binario `pass/fail` no captura.
- Configurar el **stack de IA para QA**: Playwright + MCP + steering file, de modo que el coding agent genere tests siguiendo las convenciones de tu proyecto.

## 🗺 Recorrido de la sesión

1. **La Pirámide de Pruebas** — Unitarios · Integración · E2E · Performance. Dónde invertir el esfuerzo y qué evitar (anti-patrón **Ice Cream Cone**).
2. **BDD, TDD y Gherkin** — TDD como ciclo de diseño (Red → Green → Refactor), BDD como lenguaje negocio/desarrollo, y Gherkin como spec ejecutable. Anatomía de un `.feature` file.
3. **Patrones de diseño para testing** — **POM** (encapsular UI), **Screenplay** (actores con tareas) y patrones de API (request builders, contract testing). El costo de no usar patrones.
4. **Pruebas de agentes inteligentes** — Patrón **Persona + Juez**: un LLM simula al usuario, otro evalúa la conversación contra un rubric. **Golden datasets** para calibrar al Juez.
5. **El stack de IA para testing** — Coding Agent + Playwright MCP + steering file. El agente inspecciona el DOM en vivo y genera locators precisos.
6. **Hands-on demostrativo** — `qa-e2e` (Playwright + BDD + POM), `qa-api` (endpoints + contratos + agente vía API) y `qa-agent-eval` (Persona + Juez con reporte de hallazgos).

## 🎬 Qué vas a observar en vivo

- **Gherkin → step definitions → reporte HTML** — un `.feature` real con escenarios Given/When/Then se convierte en tests Playwright ejecutables.
- **POM con y sin patrón** — el mismo test E2E con selectores inline (frágil) vs. con clase `HomePage` (mantenible). La diferencia se ve.
- **Agent generando Page Objects desde el DOM real** — usa el Playwright MCP para inspeccionar la app en vivo y emite locators precisos, no inventados.
- **Agente Persona simulando al usuario** — el LLM recibe un perfil y genera mensajes naturales multi-turno contra el agente bajo prueba.
- **Agente Juez devolviendo un scorecard** — puntuaciones por dimensión (precisión, tono, alucinaciones) que tu equipo lleva a su propio harness (por ejemplo, issues en Linear). El repo termina en el reporte JSON a propósito: es un demo base y la integración la moldeas a tu necesidad.

## 📋 Antes de la clase

- [ ] Tener listo tu **producto de la fase Implementación** (Clases 4-7) — corriendo en local, con scaffolding y arnés activos.
- [ ] **Node.js 20+** instalado (`node --version` debe responder).
- [ ] **Claude Code** instalado y con MCP habilitado (ver la guía de herramientas de la Clase 3).
- [ ] (Opcional) Acceso al **harness de tu equipo** (Linear, Jira…) si quieres registrar los hallazgos del Juez al terminar.
- [ ] Familiaridad básica con terminal y TypeScript/JavaScript.

## ✅ Tu tarea

1. Crear y activar el **skill de testing** (`.claude/skills/qa-testing/SKILL.md`) con las convenciones de POM, Gherkin y API builders de tu proyecto.
2. Cubrir al menos **2 flujos críticos** de tu producto con tests E2E de Playwright usando Page Objects, generados y refinados con el coding agent.
3. Cubrir al menos **1 endpoint clave** con tests de API: request builders + contract tests.
4. Si tu producto tiene un agente: definir **golden dataset + rubric** y ejecutar el patrón **Persona + Juez** al menos 1 vez.

## 🛠 Qué vas a producir

| Artefacto | Formato |
|-----------|---------|
| Tests E2E web + Page Objects | `tests/e2e/*.spec.ts` · `pages/*.ts` |
| Tests de API (endpoints, contratos, agente) | `tests/api/*.spec.ts` · `tests/api/agente-api.spec.ts` |
| Evaluación de agentes (Persona + Juez) | `tests/agents/*.ts` · `rubrics/evaluacion.md` · `datasets/golden-dataset.json` |
| Feature files + Step definitions | `tests/features/*.feature` · `steps/*.ts` |
| Configuración Playwright + Reporte | `playwright.config.ts` · `playwright-report/` |
| Skill de QA + MCP config | `.claude/skills/qa-testing/SKILL.md` · `.mcp.json` |

## 🤖 Herramientas que vas a usar

| Herramienta | Para qué |
|-------------|----------|
| **Playwright + playwright-bdd** | Framework E2E web/API + Gherkin ejecutable sobre Playwright |
| **Playwright MCP Server** | El agente navega el producto, inspecciona DOM y genera locators precisos en vivo |
| **Coding Agent** (Claude Code) | Genera tests, page objects, step definitions y corrige fallos usando traces |
| **LLM Agente Persona + Juez** | Dos agentes: uno simula al usuario real, el otro evalúa la conversación con rubric |
| **Golden Datasets** | Conversaciones de referencia para calibrar al Juez antes de evaluar el agente real |
| **Steering Files / Skills** | Convenciones de testing del proyecto que el agente sigue sin repetirlas en cada prompt |

## 📦 Repositorios de la sesión

Recomendado: clonarlos antes de la sesión para seguir los pasos en paralelo o replicarlos después.

| Repo | Contenido |
|------|-----------|
| `clase8/repos/qa-e2e` | Playwright E2E + Page Objects + BDD/Gherkin + steering file |
| `clase8/repos/qa-api` | Playwright API testing + request builders + tests del agente vía API |
| `clase8/repos/qa-agent-eval` | Patrón Persona + Juez + golden datasets + reporte JSON de hallazgos |

> Todos los repos prueban el mismo producto ejemplo configurado vía `BASE_URL` / `AGENT_URL`.

## 📚 Recursos

- **Playwright Docs** — [playwright.dev](https://playwright.dev) — documentación oficial, ejemplos y API reference.
- **playwright-bdd** — [github.com/vitalets/playwright-bdd](https://github.com/vitalets/playwright-bdd) — Gherkin ejecutable sobre Playwright.
- **Page Object Model** — [martinfowler.com/bliki/PageObject.html](https://martinfowler.com/bliki/PageObject.html) — el artículo de referencia de Martin Fowler.
- **Cucumber Gherkin Reference** — [cucumber.io/docs/gherkin/reference](https://cucumber.io/docs/gherkin/reference) — sintaxis oficial completa de Gherkin.
- **Evaluating LLM Agents (Anthropic)** — [anthropic.com/research](https://www.anthropic.com/research) — patrones de evaluación de agentes con rubric.
- **Playwright MCP** — [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) — el MCP server oficial de Playwright para coding agents.
