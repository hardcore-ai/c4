---
name: qa-testing
description: Convenciones de QA del proyecto — pirámide de pruebas, Playwright E2E con Page Object Model, BDD/Gherkin con playwright-bdd, tests de API con request builders y evaluación de agentes IA con Persona + Juez. Usar al crear o modificar cualquier test, page object, step definition, feature file, rúbrica o golden dataset.
---

# QA Testing — convenciones del proyecto

> Steering file por defecto del programa AI for Developers | 30X. Cópialo a `.claude/skills/qa-testing/SKILL.md` en tu proyecto y ajusta rutas, umbrales y nombres a tu producto.

## 1. Dónde va cada cosa

```
tests/e2e/*.spec.ts        → tests E2E web (Playwright)
tests/features/*.feature   → escenarios Gherkin, en español
tests/bdd/                 → generado por `bddgen` — no editar a mano
steps/*.steps.ts           → step definitions (consumen Page Objects)
pages/*Page.ts             → Page Objects, uno por página
tests/api/*.spec.ts        → tests de API (endpoints · contratos · agente)
fixtures/*-builders.ts     → request builders para la API
personas/ rubrics/ datasets/ scripts/ → evaluación de agentes (Persona + Juez)
```

## 2. Pirámide: qué se prueba en cada nivel

- **Lógica pura** → unitarias (Vitest). Sin servidor ni browser. Son la base: muchas y rápidas.
- **Endpoints** → tests de API con el `request` de Playwright. Sin browser.
- **Flujo del usuario** → E2E en browser. Pocos y de alto valor: solo lo que el usuario siente.
- **Agentes IA** → Persona + Juez. Nunca `expect(respuesta).toBe("texto exacto")`: la salida no es determinista.

## 3. Page Object Model (obligatorio en E2E)

- Una clase `XxxPage` por página en `pages/`, con todos los locators `readonly` en el constructor.
- Prioridad de locators: `getByRole` > `getByLabel` > `getByText` > `data-testid` > CSS.
- Los métodos son acciones (`sendMessageAndWait`). Las assertions van en el test o en el step, nunca en el Page Object.
- Antes de escribir un locator, inspeccionar el DOM real con el MCP de Playwright. No inventar selectores.

## 4. Gherkin / BDD

- Escenarios en español. `Given` = estado inicial · `When` = acción del usuario · `Then` = resultado observable.
- `Background` para precondiciones comunes. Un escenario = una funcionalidad concreta.
- Reusar steps existentes antes de crear nuevos. Los steps llaman a los Page Objects, no a `page` directamente.
- Ejecutar con `npm run test:bdd` (regenera `tests/bdd/` y corre la suite).

## 5. Tests de API

- Nada de `request.post(...)` suelto dentro de un test: toda llamada pasa por un builder de `fixtures/`.
- Tres suites separadas: `endpoints` (happy path + errores), `contratos` (estructura, headers, tiempos) y `agente` (contexto multi-turno, adherencia al system prompt, edge cases).
- Si la API guarda estado en memoria: `fullyParallel: false` y `workers: 1`.

## 6. Evaluación de agentes (Persona + Juez)

- **Persona** = LLM que simula a un usuario definido en `personas/`. **Juez** = LLM que puntúa la conversación completa con `rubrics/evaluacion.md`.
- El Juez devuelve JSON con 6 dimensiones en escala 1–5. Aprueba si cada dimensión ≥ 3, promedio ≥ 3.5 y ninguna dimensión en 1.
- Calibrar al Juez con `datasets/golden-dataset.json` antes de confiar en sus notas: medir al medidor.
- La salida es el reporte JSON en `reports/`. Llevar los hallazgos al harness del equipo (Linear, Jira, CI) es una integración que cada equipo decide.

## 7. Playwright

- `baseURL` siempre desde `process.env.BASE_URL` con fallback a `http://localhost:3000`.
- Evidencia automática: `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`.
- Esperar con `expect(...)` y `waitFor`, nunca con `setTimeout`.
- Nombres de tests: frases completas en español que describen el comportamiento esperado.

## 8. Cómo trabaja el agente en este repo

1. Leer este skill y el test o página más parecido antes de generar código nuevo.
2. Page Object primero, después el test o el step que lo consume.
3. Ejecutar la suite (`npm test`). Si falla, leer el trace en `playwright-report/` antes de proponer un fix.
4. No agregar dependencias nuevas sin justificarlo en el PR.
