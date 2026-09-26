import { test, expect } from '@playwright/test';
import { AgenteBuilder, crearConversacionYObtenerID } from '../../fixtures/request-builders';

/**
 * Pruebas de contrato: validan que el agente cumple con el contrato
 * de respuesta definido — estructura, tipos, tiempos y headers.
 */
test.describe('API — Contratos de respuesta del agente', () => {

  test('POST /api/agent/chat retorna la estructura de contrato esperada', async ({ request }) => {
    const id = await crearConversacionYObtenerID(request);
    const agente = new AgenteBuilder(request);

    const response = await agente.chat('¿Qué servicios ofrecen?', id);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json() as {
      response: string;
      conversation_id: string;
      model?: string;
      usage?: { input_tokens: number; output_tokens: number };
    };

    // Campos obligatorios del contrato
    expect(typeof body.response).toBe('string');
    expect(body.response.trim().length).toBeGreaterThan(0);
    expect(body.conversation_id).toBe(id);
  });

  test('El agente responde en menos de 15 segundos', async ({ request }) => {
    const agente = new AgenteBuilder(request);
    const inicio = Date.now();

    const response = await agente.chat('Hola, ¿cómo estás?');
    const duracion = Date.now() - inicio;

    expect(response.status()).toBe(200);
    expect(duracion).toBeLessThan(15_000);
  });

  test('El agente retorna 400 para mensaje vacío', async ({ request }) => {
    const agente = new AgenteBuilder(request);
    const response = await agente.chat('');

    expect(response.status()).toBe(400);
    const body = await response.json() as { error: string };
    expect(body).toHaveProperty('error');
  });

  test('El agente retorna 400 para mensaje solo con espacios', async ({ request }) => {
    const agente = new AgenteBuilder(request);
    const response = await agente.chat('   ');

    expect(response.status()).toBe(400);
  });

  test('Respuestas sucesivas en la misma conversación mantienen el conversation_id', async ({ request }) => {
    const id = await crearConversacionYObtenerID(request);
    const agente = new AgenteBuilder(request);

    const r1 = await agente.chat('Primera consulta', id);
    const r2 = await agente.chat('Segunda consulta', id);

    const b1 = await r1.json() as { conversation_id: string };
    const b2 = await r2.json() as { conversation_id: string };

    expect(b1.conversation_id).toBe(id);
    expect(b2.conversation_id).toBe(id);
  });

});
