import { createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ConversacionPage } from '../pages/ConversacionPage';

const { Given, When, Then } = createBdd();

Given('que el usuario está en la página principal', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
});

Given('que existe una conversación activa con un mensaje', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.sendMessageAndWait('Mensaje inicial de contexto');
});

When('el usuario envía el mensaje {string}', async ({ page }, mensaje: string) => {
  const home = new HomePage(page);
  await home.sendMessage(mensaje);
});

When('el agente responde', async ({ page }) => {
  const home = new HomePage(page);
  await home.waitForResponse();
});

When('el usuario inicia una nueva conversación', async ({ page }) => {
  const conversacion = new ConversacionPage(page);
  await conversacion.iniciarNuevaConversacion();
});

Then('el agente responde con un mensaje no vacío', async ({ page }) => {
  const home = new HomePage(page);
  const respuesta = await home.waitForResponse();
  expect(respuesta.trim().length).toBeGreaterThan(0);
});

Then('el historial contiene {int} mensajes del usuario', async ({ page }, cantidad: number) => {
  const conversacion = new ConversacionPage(page);
  const { usuario } = await conversacion.contarMensajes();
  expect(usuario).toBe(cantidad);
});

Then('el historial contiene {int} respuestas del agente', async ({ page }, cantidad: number) => {
  const conversacion = new ConversacionPage(page);
  const { agente } = await conversacion.contarMensajes();
  expect(agente).toBe(cantidad);
});

Then('la respuesta del agente menciona {string}', async ({ page }, texto: string) => {
  const home = new HomePage(page);
  const respuesta = await home.waitForResponse();
  expect(respuesta.toLowerCase()).toContain(texto.toLowerCase());
});

Then('el historial queda vacío', async ({ page }) => {
  const conversacion = new ConversacionPage(page);
  const { agente } = await conversacion.contarMensajes();
  expect(agente).toBe(0);
});
