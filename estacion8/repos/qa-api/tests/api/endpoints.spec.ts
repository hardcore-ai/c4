import { test, expect } from '@playwright/test';
import {
  ConversacionBuilder,
  MensajeBuilder,
  crearConversacionYObtenerID,
} from '../../fixtures/request-builders';

test.describe('API — Health & Conversaciones', () => {

  test('GET /api/health retorna status 200 y estado ok', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    const body = await response.json() as { status: string };
    expect(body.status).toBe('ok');
  });

  test.describe('POST /api/conversations', () => {

    test('Crea una conversación y retorna id y timestamp', async ({ request }) => {
      const builder = new ConversacionBuilder(request);
      const response = await builder.crear();

      expect(response.status()).toBe(201);
      const body = await response.json() as { id: string; created_at: string };
      expect(body).toHaveProperty('id');
      expect(typeof body.id).toBe('string');
      expect(body).toHaveProperty('created_at');
    });

    test('Acepta metadata adicional en la creación', async ({ request }) => {
      const builder = new ConversacionBuilder(request);
      const response = await builder.crear({ canal: 'web', version: '1.0' });

      expect(response.status()).toBe(201);
      const body = await response.json() as { metadata: Record<string, unknown> };
      expect(body.metadata?.canal).toBe('web');
    });

  });

  test.describe('GET /api/conversations', () => {

    test('Retorna una lista (array) de conversaciones', async ({ request }) => {
      const builder = new ConversacionBuilder(request);
      const response = await builder.obtenerTodas();

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

  });

  test.describe('GET /api/conversations/:id', () => {

    test('Retorna la conversación correcta por ID', async ({ request }) => {
      const id = await crearConversacionYObtenerID(request);
      const builder = new ConversacionBuilder(request);
      const response = await builder.obtenerPorId(id);

      expect(response.status()).toBe(200);
      const body = await response.json() as { id: string };
      expect(body.id).toBe(id);
    });

    test('Retorna 404 para un ID inexistente', async ({ request }) => {
      const builder = new ConversacionBuilder(request);
      const response = await builder.obtenerPorId('id-inexistente-000');

      expect(response.status()).toBe(404);
    });

  });

  test.describe('POST /api/conversations/:id/messages', () => {

    test('Agrega un mensaje de usuario a la conversación', async ({ request }) => {
      const id = await crearConversacionYObtenerID(request);
      const builder = new MensajeBuilder(request);
      const response = await builder.enviar(id, 'Mensaje de prueba de integración');

      expect(response.status()).toBe(201);
      const body = await response.json() as { content: string; role: string };
      expect(body.content).toBe('Mensaje de prueba de integración');
      expect(body.role).toBe('user');
    });

    test('El historial refleja todos los mensajes enviados', async ({ request }) => {
      const id = await crearConversacionYObtenerID(request);
      const builder = new MensajeBuilder(request);

      await builder.enviar(id, 'Primer mensaje');
      await builder.enviar(id, 'Segundo mensaje');

      const historialResponse = await builder.obtenerHistorial(id);
      const mensajes = await historialResponse.json() as unknown[];
      expect(mensajes.length).toBeGreaterThanOrEqual(2);
    });

  });

});
