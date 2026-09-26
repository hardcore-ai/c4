import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { ConversacionPage } from '../../pages/ConversacionPage';

test.describe('Flujo principal — Asistente IA', () => {

  test('El usuario puede enviar un mensaje y recibir respuesta del agente', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const respuesta = await home.sendMessageAndWait('¿Cuáles son sus horarios de atención?');

    expect(respuesta.trim()).toBeTruthy();
    expect(respuesta.length).toBeGreaterThan(10);
  });

  test('El historial de conversación se actualiza tras cada intercambio', async ({ page }) => {
    const home = new HomePage(page);
    const conversacion = new ConversacionPage(page);
    await home.goto();

    await home.sendMessageAndWait('Hola');
    await home.sendMessageAndWait('¿Qué servicios ofrecen?');

    const { usuario, agente } = await conversacion.contarMensajes();
    expect(usuario).toBe(2);
    expect(agente).toBe(2);
  });

  test('El agente mantiene contexto entre turnos de la misma conversación', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.sendMessageAndWait('Mi nombre es Ana y necesito soporte técnico');
    const respuesta = await home.sendMessageAndWait('¿Recuerdas qué necesitaba?');

    expect(respuesta.toLowerCase()).toMatch(/soporte|técnico|ana/i);
  });

  test('Una nueva conversación limpia el historial', async ({ page }) => {
    const home = new HomePage(page);
    const conversacion = new ConversacionPage(page);
    await home.goto();

    await home.sendMessageAndWait('Mensaje de prueba');
    await conversacion.iniciarNuevaConversacion();

    const { agente } = await conversacion.contarMensajes();
    expect(agente).toBe(0);
  });

});
