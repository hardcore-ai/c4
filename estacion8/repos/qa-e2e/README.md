# qa-e2e — Pruebas Unitarias, E2E Web y BDD con Playwright

Proyecto de referencia para la **Clase 8: Aseguramiento de Calidad** del programa AI for Developers 30X.

Incluye una **app simulada del asistente** (Next.js) y tres niveles de pruebas: unitarias (Vitest), end-to-end (Playwright) y BDD con Gherkin (playwright-bdd). Usa **Page Object Model** como patron de diseno.

> Este repo es autocontenido: no depende de una aplicacion externa.

## Estructura del proyecto

```
qa-e2e/
├── demo-app/                          # App simulada (Next.js)
│   ├── app/
│   │   ├── layout.tsx                 # Layout raiz
│   │   ├── page.tsx                   # UI del chat
│   │   └── api/chat/route.ts         # Endpoint simulado del agente
│   ├── lib/
│   │   └── agent.ts                   # Logica del agente (funcion pura)
│   ├── __tests__/
│   │   └── agent.test.ts             # Pruebas unitarias (Vitest)
│   ├── package.json
│   ├── vitest.config.ts
│   └── tsconfig.json
├── pages/                             # Page Objects
│   ├── HomePage.ts                    # Pagina principal del chat
│   └── ConversacionPage.ts           # Historial y gestion de conversaciones
├── tests/
│   ├── e2e/
│   │   └── flujo-principal.spec.ts   # Tests E2E (4 escenarios)
│   └── features/
│       └── asistente.feature          # Escenarios BDD en Gherkin (espanol)
├── steps/
│   └── asistente.steps.ts            # Step definitions para BDD
├── playwright.config.ts               # Configuracion de Playwright + BDD
├── tsconfig.json
├── .mcp.json                          # Playwright MCP Server para Claude Code
└── .claude/skills/qa-testing/SKILL.md # Skill de QA (steering file por defecto del programa)
```

## Prerrequisitos

- **Node.js** >= 18
- Navegadores de Playwright instalados

---

## Paso 1 — Instalar dependencias

```bash
# Dependencias de la app simulada
cd demo-app
npm install
cd ..

# Dependencias de los tests
npm install

# Instalar navegadores de Playwright (Chromium, Firefox)
npx playwright install
```

## Paso 2 — Levantar la app simulada

En una terminal aparte (o en background):

```bash
cd demo-app
npm run dev
```

La app queda disponible en `http://localhost:3000`. Es un chat sencillo con:
- Input de texto + boton "Enviar"
- Mensajes del usuario (azul) y del agente (gris)
- Boton "Nueva conversacion" para limpiar el historial
- Agente simulado con respuestas deterministas y memoria de contexto

---

## Demo 1 — Pruebas unitarias (Vitest)

Las pruebas unitarias verifican la **logica pura** del agente, sin necesidad de levantar un servidor ni abrir un navegador. Son las mas rapidas y aisladas de la piramide de pruebas.

### Como ejecutar

```bash
cd demo-app
npm run test:unit
```

Para modo watch (se re-ejecutan automaticamente al guardar cambios):

```bash
npm run test:unit:watch
```

### Que se prueba

El archivo `demo-app/lib/agent.ts` exporta tres funciones puras — sin efectos secundarios, sin dependencias externas. Reciben datos y retornan un resultado. Esto las hace ideales para pruebas unitarias:

```typescript
// lib/agent.ts — Logica del agente como funcion pura

export interface Message {
  role: 'user' | 'agent';
  content: string;
}

// Extrae el nombre del usuario a partir del historial
export function extractName(messages: Message[]): string | null { ... }

// Detecta temas mencionados (soporte, horarios, servicios)
export function extractTopics(messages: Message[]): string[] { ... }

// Genera la respuesta del agente dado un historial y un mensaje nuevo
export function generateResponse(history: Message[], userMessage: string): string { ... }
```

### Ejemplo de codigo: `demo-app/__tests__/agent.test.ts`

Las pruebas se organizan con `describe` (agrupar) e `it` (caso individual). Cada test sigue el patron **Arrange-Act-Assert**:

**Probar una funcion auxiliar (`extractName`):**

```typescript
import { describe, it, expect } from 'vitest';
import { extractName, type Message } from '../lib/agent';

describe('extractName', () => {
  it('extrae el nombre cuando el usuario dice "mi nombre es X"', () => {
    // Arrange — preparar el input
    const messages: Message[] = [{ role: 'user', content: 'Mi nombre es Ana' }];

    // Act + Assert — ejecutar y verificar
    expect(extractName(messages)).toBe('Ana');
  });

  it('retorna null si no se menciona ningun nombre', () => {
    const messages: Message[] = [{ role: 'user', content: 'Necesito ayuda' }];
    expect(extractName(messages)).toBeNull();
  });

  it('ignora mensajes del agente', () => {
    const messages: Message[] = [
      { role: 'agent', content: 'Mi nombre es Bot' },  // esto NO es del usuario
      { role: 'user', content: 'Hola' },
    ];
    expect(extractName(messages)).toBeNull();
  });
});
```

**Probar la generacion de respuestas con contexto (historial multi-turno):**

```typescript
import { generateResponse, type Message } from '../lib/agent';

describe('generateResponse', () => {
  it('responde a saludos con presentacion del asistente', () => {
    const response = generateResponse([], 'Hola');
    expect(response).toContain('asistente virtual');
  });

  it('personaliza la respuesta recordando nombre y tema', () => {
    // Arrange — simular historial previo de la conversacion
    const history: Message[] = [
      { role: 'user', content: 'Mi nombre es Ana y necesito soporte tecnico' },
      { role: 'agent', content: 'Hola Ana...' },
    ];

    // Act — preguntar si recuerda
    const response = generateResponse(history, '¿Recuerdas que necesitaba?');

    // Assert — debe recordar nombre Y tema del historial
    expect(response.toLowerCase()).toContain('ana');
    expect(response.toLowerCase()).toContain('soporte tecnico');
  });

  it('responde sin contexto cuando no hay historial previo', () => {
    const response = generateResponse([], '¿Recuerdas mi nombre?');
    expect(response).toMatch(/no tengo contexto/i);
  });
});
```

### Conceptos clave

| Concepto | Que hace | Ejemplo |
|----------|----------|---------|
| `describe()` | Agrupa tests relacionados | `describe('extractName', () => { ... })` |
| `it()` | Define un caso de prueba individual | `it('retorna null si no hay nombre', ...)` |
| `expect().toBe()` | Compara igualdad exacta (primitivos) | `expect(result).toBe('Ana')` |
| `expect().toBeNull()` | Verifica que el valor es null | `expect(extractName([])).toBeNull()` |
| `expect().toContain()` | Verifica que un string/array contiene un valor | `expect(response).toContain('soporte')` |
| `expect().toMatch()` | Verifica contra una regex | `expect(response).toMatch(/lunes a viernes/i)` |
| `expect().toEqual()` | Compara igualdad profunda (objetos/arrays) | `expect(topics).toEqual([])` |

---

## Demo 2 — Tests E2E con Playwright

Las pruebas E2E simulan un **usuario real** interactuando con la aplicacion en un navegador. Abren la pagina, escriben en el chat, hacen click en botones y verifican lo que aparece en pantalla.

### Como ejecutar

> Requiere la app corriendo en `http://localhost:3000` (ver Paso 2)

```bash
# Desde la raiz del repo (no demo-app)
npm run test:e2e
```

Para ver los tests con el browser abierto:

```bash
npm run test:headed
```

Un solo worker: 
```
npx playwright test --workers=1 --headed
```

Modo interactivo (UI de Playwright — seleccionar y depurar tests visualmente):

```bash
npm run test:ui
```

### Page Object Model (POM)

En lugar de escribir selectores directamente en cada test, se encapsulan en **Page Objects**: clases que representan una pagina y exponen metodos para interactuar con ella.

**`pages/HomePage.ts` — Page Object de la pagina principal:**

```typescript
import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly latestAgentMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    // Locators usando roles de accesibilidad (preferidos) y data-testid
    this.chatInput = page.getByRole('textbox', { name: /mensaje|escribe|message/i });
    this.sendButton = page.getByRole('button', { name: /enviar|send/i });
    this.latestAgentMessage = page.locator('[data-testid="agent-message"]').last();
    this.loadingIndicator = page.locator('[data-testid="loading"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async sendMessage(message: string) {
    await this.chatInput.fill(message);
    await this.sendButton.click();
  }

  async waitForResponse(): Promise<string> {
    // Esperar a que el indicador de carga desaparezca
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 15_000 });
    // Esperar a que aparezca la respuesta del agente
    await this.latestAgentMessage.waitFor({ state: 'visible' });
    return (await this.latestAgentMessage.textContent()) ?? '';
  }

  // Metodo compuesto: enviar y esperar respuesta
  async sendMessageAndWait(message: string): Promise<string> {
    await this.sendMessage(message);
    return this.waitForResponse();
  }
}
```

**Beneficios del POM:**
- Si cambia un selector en la UI, solo se modifica en UN lugar (el Page Object)
- Los tests quedan expresivos y legibles: `home.sendMessageAndWait('Hola')`
- Se reutilizan en tests E2E y BDD por igual

**Prioridad de locators** (de mas resiliente a menos):
1. `getByRole()` — roles de accesibilidad (button, textbox, heading)
2. `getByLabel()` — por label de formulario
3. `getByText()` — por texto visible
4. `[data-testid]` — atributo explicito para testing
5. Selectores CSS — ultimo recurso

### Ejemplo de codigo: `tests/e2e/flujo-principal.spec.ts`

Cada test crea instancias de los Page Objects y los usa para interactuar con la app:

**Test basico — enviar mensaje y recibir respuesta:**

```typescript
import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test('El usuario puede enviar un mensaje y recibir respuesta del agente', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();  // Navegar a http://localhost:3000

  // Enviar mensaje y esperar que el agente responda
  const respuesta = await home.sendMessageAndWait('¿Cuales son sus horarios de atencion?');

  // Verificar que la respuesta no esta vacia y tiene contenido sustancial
  expect(respuesta.trim()).toBeTruthy();
  expect(respuesta.length).toBeGreaterThan(10);
});
```

**Test multi-turno — verificar que el historial se actualiza:**

```typescript
import { HomePage } from '../../pages/HomePage';
import { ConversacionPage } from '../../pages/ConversacionPage';

test('El historial se actualiza tras cada intercambio', async ({ page }) => {
  const home = new HomePage(page);
  const conversacion = new ConversacionPage(page);
  await home.goto();

  // Dos turnos de conversacion
  await home.sendMessageAndWait('Hola');
  await home.sendMessageAndWait('¿Que servicios ofrecen?');

  // Contar mensajes en el DOM
  const { usuario, agente } = await conversacion.contarMensajes();
  expect(usuario).toBe(2);  // 2 mensajes del usuario
  expect(agente).toBe(2);   // 2 respuestas del agente
});
```

**Test de contexto — el agente recuerda informacion previa:**

```typescript
test('El agente mantiene contexto entre turnos', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();

  // Turno 1: presentarse y dar contexto
  await home.sendMessageAndWait('Mi nombre es Ana y necesito soporte tecnico');

  // Turno 2: preguntar si recuerda
  const respuesta = await home.sendMessageAndWait('¿Recuerdas que necesitaba?');

  // La respuesta debe mencionar "soporte", "tecnico" o "ana"
  expect(respuesta.toLowerCase()).toMatch(/soporte|técnico|ana/i);
});
```

**Test de reset — nueva conversacion limpia el historial:**

```typescript
test('Una nueva conversacion limpia el historial', async ({ page }) => {
  const home = new HomePage(page);
  const conversacion = new ConversacionPage(page);
  await home.goto();

  await home.sendMessageAndWait('Mensaje de prueba');
  await conversacion.iniciarNuevaConversacion();  // Click en "Nueva conversacion"

  const { agente } = await conversacion.contarMensajes();
  expect(agente).toBe(0);  // No hay mensajes del agente
});
```

### Conceptos clave

| Concepto | Que hace | Ejemplo |
|----------|----------|---------|
| `page.goto()` | Navega a una URL | `await page.goto('/')` |
| `page.getByRole()` | Localiza por rol de accesibilidad | `page.getByRole('button', { name: /enviar/i })` |
| `page.locator()` | Localiza por selector CSS | `page.locator('[data-testid="loading"]')` |
| `.fill()` | Escribe texto en un input | `await chatInput.fill('Hola')` |
| `.click()` | Hace click en un elemento | `await sendButton.click()` |
| `.waitFor()` | Espera a que un elemento aparezca/desaparezca | `await loading.waitFor({ state: 'hidden' })` |
| `.textContent()` | Obtiene el texto de un elemento | `await message.textContent()` |
| `expect().toBeTruthy()` | Verifica que el valor es truthy | `expect(respuesta.trim()).toBeTruthy()` |

---

## Demo 3 — Tests BDD con Gherkin

BDD (Behavior-Driven Development) describe el comportamiento esperado en **lenguaje natural** usando la sintaxis Gherkin: `Given` / `When` / `Then`. Esto permite que personas no tecnicas (QA, producto, negocio) lean y validen los escenarios.

### Como ejecutar

> Requiere la app corriendo en `http://localhost:3000` (ver Paso 2)

```bash
npm run test:bdd
```

Internamente ejecuta:
1. `bddgen` — compila `tests/features/*.feature` + `steps/*.ts` → `tests/bdd/`
2. `playwright test tests/bdd/` — ejecuta los tests compilados en Chromium

### Ejemplo de codigo: Feature File

El archivo `tests/features/asistente.feature` describe los escenarios en **espanol**, usando Gherkin:

```gherkin
Feature: Asistente IA — Interaccion principal

  Como usuario registrado
  Quiero interactuar con el asistente de IA
  Para obtener respuestas relevantes a mis consultas

  Background:
    Given que el usuario esta en la pagina principal

  Scenario: El usuario recibe respuesta al enviar un mensaje
    When el usuario envia el mensaje "¿Cuales son sus horarios de atencion?"
    Then el agente responde con un mensaje no vacio

  Scenario: El historial refleja el intercambio completo
    When el usuario envia el mensaje "Hola"
    And el agente responde
    And el usuario envia el mensaje "¿Que servicios ofrecen?"
    And el agente responde
    Then el historial contiene 2 mensajes del usuario
    And el historial contiene 2 respuestas del agente

  Scenario: El agente recuerda el contexto de la conversacion
    When el usuario envia el mensaje "Mi nombre es Ana"
    And el agente responde
    When el usuario envia el mensaje "¿Como me llamo?"
    Then la respuesta del agente menciona "Ana"

  Scenario: Nueva conversacion limpia el historial
    Given que existe una conversacion activa con un mensaje
    When el usuario inicia una nueva conversacion
    Then el historial queda vacio
```

**Anatomia del feature file:**
- `Feature:` — titulo y descripcion general (quien, que, para que)
- `Background:` — pasos que se ejecutan **antes de cada Scenario**
- `Scenario:` — un caso de prueba individual
- `Given` — precondicion (estado inicial)
- `When` — accion del usuario
- `Then` — resultado esperado
- `And` — continua el paso anterior (Given/When/Then)
- `{string}` / `{int}` — parametros dinamicos entre comillas o como numeros

### Ejemplo de codigo: Step Definitions

Cada linea del `.feature` se conecta con una funcion TypeScript en `steps/asistente.steps.ts`. Los steps reutilizan los **mismos Page Objects** que los tests E2E:

```typescript
import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ConversacionPage } from '../pages/ConversacionPage';

const { Given, When, Then } = createBdd();

// ── Given ────────────────────────────────────────────────────────────────────

Given('que el usuario esta en la pagina principal', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
});

Given('que existe una conversacion activa con un mensaje', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.sendMessageAndWait('Mensaje inicial de contexto');
});

// ── When ─────────────────────────────────────────────────────────────────────

// {string} captura el texto entre comillas del .feature
When('el usuario envia el mensaje {string}', async ({ page }, mensaje: string) => {
  const home = new HomePage(page);
  await home.sendMessage(mensaje);
});

When('el agente responde', async ({ page }) => {
  const home = new HomePage(page);
  await home.waitForResponse();
});

When('el usuario inicia una nueva conversacion', async ({ page }) => {
  const conversacion = new ConversacionPage(page);
  await conversacion.iniciarNuevaConversacion();
});

// ── Then ─────────────────────────────────────────────────────────────────────

Then('el agente responde con un mensaje no vacio', async ({ page }) => {
  const home = new HomePage(page);
  const respuesta = await home.waitForResponse();
  expect(respuesta.trim().length).toBeGreaterThan(0);
});

// {int} captura un numero del .feature
Then('el historial contiene {int} mensajes del usuario', async ({ page }, cantidad: number) => {
  const conversacion = new ConversacionPage(page);
  const { usuario } = await conversacion.contarMensajes();
  expect(usuario).toBe(cantidad);
});

Then('la respuesta del agente menciona {string}', async ({ page }, texto: string) => {
  const home = new HomePage(page);
  const respuesta = await home.waitForResponse();
  expect(respuesta.toLowerCase()).toContain(texto.toLowerCase());
});
```

### Como se conectan Feature + Steps

```
asistente.feature                          asistente.steps.ts
─────────────────                          ──────────────────

When el usuario envia                      When('el usuario envia
     el mensaje "Hola"        ──────►           el mensaje {string}', ...)
                                                        │
                                                        ▼
                                           const home = new HomePage(page);
                                           await home.sendMessage(mensaje);
                                                        │
                                                        ▼
                                           // HomePage.ts → fill + click
```

El flujo es: **Gherkin → Step Definition → Page Object → Navegador**

### Conceptos clave

| Concepto | Que hace | Ejemplo |
|----------|----------|---------|
| `Feature` | Agrupa escenarios relacionados | `Feature: Asistente IA` |
| `Background` | Precondicion comun a todos los escenarios | `Given que el usuario esta en la pagina principal` |
| `Scenario` | Un caso de prueba en lenguaje natural | `Scenario: El usuario recibe respuesta...` |
| `Given/When/Then` | Precondicion / Accion / Resultado | `Given ... When ... Then ...` |
| `{string}` | Parametro de texto (captura entre comillas) | `"¿Cuales son sus horarios?"` |
| `{int}` | Parametro numerico | `2 mensajes del usuario` |
| `createBdd()` | Crea el contexto Given/When/Then de playwright-bdd | `const { Given, When, Then } = createBdd()` |
| `bddgen` | Compila .feature + steps → tests ejecutables | `npx bddgen` |

---

## Demo 4 — Todos los tests E2E + BDD juntos

```bash
npm test
```

---

## Ver el reporte HTML

Despues de ejecutar cualquier suite:

```bash
npm run report
```

Abre el reporte HTML en el navegador con resultados detallados, traces, screenshots y videos de los tests que fallaron.

## Coding agent: Claude Code

El repo trae dos piezas para que el coding agent trabaje con las convenciones del proyecto:

| Archivo | Que hace |
|---------|----------|
| `.mcp.json` | Registra el **Playwright MCP Server**. Claude Code lo levanta al abrir el repo: el agente navega la app, inspecciona el DOM y genera locators reales, no inventados. |
| `.claude/skills/qa-testing/SKILL.md` | **Skill de QA** (steering file por defecto del programa): piramide, POM, Gherkin, API builders, Persona + Juez. Claude Code lo carga automaticamente. |

Para tu propio proyecto: copia ambos archivos a la raiz de tu repo y ajusta rutas y umbrales en el skill.

## Variables de entorno

| Variable   | Descripcion                    | Default                  |
|------------|--------------------------------|--------------------------|
| `BASE_URL` | URL base de la app             | `http://localhost:3000`  |
| `CI`       | Activa retries y worker unico  | _(no definida)_          |

## Configuracion de Playwright

| Opcion        | Valor               | Descripcion                                    |
|---------------|----------------------|------------------------------------------------|
| `trace`       | `on-first-retry`     | Captura trace completo en el primer retry       |
| `screenshot`  | `only-on-failure`    | Screenshot automatico cuando un test falla      |
| `video`       | `on-first-retry`     | Graba video en el primer retry                  |
| `projects`    | chromium, firefox, bdd | E2E corre en 2 browsers, BDD solo en Chrome  |

## Resumen: piramide de pruebas en este repo

```
         ╱╲
        ╱ BDD╲          4 escenarios Gherkin — lenguaje natural
       ╱──────╲         Mas lento, valida comportamiento de negocio
      ╱  E2E   ╲        4 tests Playwright — browser real
     ╱──────────╲       Velocidad media, valida flujo completo
    ╱  Unitarias ╲      15 tests Vitest — sin browser ni servidor
   ╱──────────────╲     Mas rapido, valida logica pura
  ╱────────────────╲
```

| Nivel | Framework | Tests | Velocidad | Que valida |
|-------|-----------|-------|-----------|------------|
| Unitario | Vitest | 15 | ~140ms | Logica pura del agente |
| E2E | Playwright | 4 | ~3s | Flujo completo en browser |
| BDD | playwright-bdd | 4 | ~3s | Comportamiento en lenguaje natural |
