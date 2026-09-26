/** Generated from: tests/features/asistente.feature */
import { test } from "playwright-bdd";

test.describe("Asistente IA — Interacción principal", () => {

  test.beforeEach(async ({ Given, page }) => {
    await Given("que el usuario está en la página principal", null, { page });
  });

  test("El usuario recibe respuesta al enviar un mensaje", async ({ When, page, Then }) => {
    await When("el usuario envía el mensaje \"¿Cuáles son sus horarios de atención?\"", null, { page });
    await Then("el agente responde con un mensaje no vacío", null, { page });
  });

  test("El historial refleja el intercambio completo", async ({ When, page, And, Then }) => {
    await When("el usuario envía el mensaje \"Hola\"", null, { page });
    await And("el agente responde", null, { page });
    await And("el usuario envía el mensaje \"¿Qué servicios ofrecen?\"", null, { page });
    await And("el agente responde", null, { page });
    await Then("el historial contiene 2 mensajes del usuario", null, { page });
    await And("el historial contiene 2 respuestas del agente", null, { page });
  });

  test("El agente recuerda el contexto de la conversación", async ({ When, page, And, Then }) => {
    await When("el usuario envía el mensaje \"Mi nombre es Ana\"", null, { page });
    await And("el agente responde", null, { page });
    await When("el usuario envía el mensaje \"¿Cómo me llamo?\"", null, { page });
    await Then("la respuesta del agente menciona \"Ana\"", null, { page });
  });

  test("Nueva conversación limpia el historial", async ({ Given, page, When, Then }) => {
    await Given("que existe una conversación activa con un mensaje", null, { page });
    await When("el usuario inicia una nueva conversación", null, { page });
    await Then("el historial queda vacío", null, { page });
  });

});

// == technical section ==

test.use({
  $test: ({}, use) => use(test),
  $uri: ({}, use) => use("tests/features/asistente.feature"),
  $bddFileMeta: ({}, use) => use(bddFileMeta),
});

const bddFileMeta = {
  "El usuario recibe respuesta al enviar un mensaje": {"pickleLocation":"10:3"},
  "El historial refleja el intercambio completo": {"pickleLocation":"14:3"},
  "El agente recuerda el contexto de la conversación": {"pickleLocation":"22:3"},
  "Nueva conversación limpia el historial": {"pickleLocation":"28:3"},
};