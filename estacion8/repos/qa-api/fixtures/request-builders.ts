import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Builder para operaciones sobre Conversaciones.
 * Encapsula los endpoints REST y desacopla los tests de los detalles de la API.
 */
export class ConversacionBuilder {
  constructor(private request: APIRequestContext) {}

  async crear(metadata: Record<string, unknown> = {}): Promise<APIResponse> {
    return this.request.post('/api/conversations', {
      data: { metadata },
    });
  }

  async obtenerTodas(): Promise<APIResponse> {
    return this.request.get('/api/conversations');
  }

  async obtenerPorId(id: string): Promise<APIResponse> {
    return this.request.get(`/api/conversations/${id}`);
  }

  async eliminar(id: string): Promise<APIResponse> {
    return this.request.delete(`/api/conversations/${id}`);
  }
}

/**
 * Builder para operaciones sobre Mensajes dentro de una conversación.
 */
export class MensajeBuilder {
  constructor(private request: APIRequestContext) {}

  async enviar(conversationId: string, contenido: string, rol: 'user' | 'assistant' = 'user'): Promise<APIResponse> {
    return this.request.post(`/api/conversations/${conversationId}/messages`, {
      data: { content: contenido, role: rol },
    });
  }

  async obtenerHistorial(conversationId: string): Promise<APIResponse> {
    return this.request.get(`/api/conversations/${conversationId}/messages`);
  }
}

/**
 * Builder para interactuar con el endpoint del agente de IA.
 */
export class AgenteBuilder {
  constructor(private request: APIRequestContext) {}

  async chat(mensaje: string, conversationId?: string): Promise<APIResponse> {
    return this.request.post('/api/agent/chat', {
      data: {
        message: mensaje,
        ...(conversationId && { conversation_id: conversationId }),
      },
    });
  }
}

/**
 * Helpers de utilidad para tests de API.
 */
export async function crearConversacionYObtenerID(request: APIRequestContext): Promise<string> {
  const builder = new ConversacionBuilder(request);
  const response = await builder.crear();
  const body = await response.json() as { id: string };
  return body.id;
}
