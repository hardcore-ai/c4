import { describe, it, expect } from 'vitest';
import { generateResponse, extractName, extractTopics, type Message } from '../lib/agent';

// ─── Pruebas Unitarias: Funciones auxiliares ─────────────────────────────────

describe('extractName', () => {
  it('extrae el nombre cuando el usuario dice "mi nombre es X"', () => {
    const messages: Message[] = [{ role: 'user', content: 'Mi nombre es Ana' }];
    expect(extractName(messages)).toBe('Ana');
  });

  it('extrae el nombre cuando el usuario dice "me llamo X"', () => {
    const messages: Message[] = [{ role: 'user', content: 'Hola, me llamo Carlos' }];
    expect(extractName(messages)).toBe('Carlos');
  });

  it('retorna null si no se menciona ningún nombre', () => {
    const messages: Message[] = [{ role: 'user', content: 'Necesito ayuda' }];
    expect(extractName(messages)).toBeNull();
  });

  it('ignora mensajes del agente', () => {
    const messages: Message[] = [
      { role: 'agent', content: 'Mi nombre es Bot' },
      { role: 'user', content: 'Hola' },
    ];
    expect(extractName(messages)).toBeNull();
  });
});

describe('extractTopics', () => {
  it('detecta "soporte técnico" como tema', () => {
    const messages: Message[] = [{ role: 'user', content: 'Necesito soporte técnico' }];
    expect(extractTopics(messages)).toContain('soporte técnico');
  });

  it('detecta múltiples temas', () => {
    const messages: Message[] = [
      { role: 'user', content: '¿Cuáles son sus horarios?' },
      { role: 'user', content: '¿Y qué servicios ofrecen?' },
    ];
    const topics = extractTopics(messages);
    expect(topics).toContain('horarios');
    expect(topics).toContain('servicios');
  });

  it('retorna array vacío si no hay temas reconocidos', () => {
    const messages: Message[] = [{ role: 'user', content: 'Hola' }];
    expect(extractTopics(messages)).toEqual([]);
  });
});

// ─── Pruebas Unitarias: Generación de respuestas ────────────────────────────

describe('generateResponse', () => {
  it('responde a saludos con presentación del asistente', () => {
    const response = generateResponse([], 'Hola');
    expect(response).toContain('asistente virtual');
  });

  it('proporciona horarios de atención', () => {
    const response = generateResponse([], '¿Cuáles son sus horarios de atención?');
    expect(response).toMatch(/lunes a viernes/i);
    expect(response).toMatch(/8:00/);
  });

  it('describe los servicios disponibles', () => {
    const response = generateResponse([], '¿Qué servicios ofrecen?');
    expect(response).toMatch(/consultoría|desarrollo|soporte/i);
  });

  it('ofrece información de soporte técnico', () => {
    const response = generateResponse([], 'Necesito soporte técnico');
    expect(response).toMatch(/soporte|contactar|email/i);
  });

  it('personaliza la respuesta con el nombre del usuario', () => {
    const history: Message[] = [
      { role: 'user', content: 'Mi nombre es Ana y necesito soporte técnico' },
      { role: 'agent', content: 'Hola Ana...' },
    ];
    const response = generateResponse(history, '¿Recuerdas qué necesitaba?');
    expect(response.toLowerCase()).toContain('ana');
    expect(response.toLowerCase()).toContain('soporte técnico');
  });

  it('recuerda el nombre en preguntas de recall', () => {
    const history: Message[] = [
      { role: 'user', content: 'Me llamo Carlos' },
      { role: 'agent', content: 'Mucho gusto Carlos' },
    ];
    const response = generateResponse(history, '¿Cómo me llamo?');
    expect(response).toContain('Carlos');
  });

  it('genera respuesta genérica para mensajes no reconocidos', () => {
    const response = generateResponse([], 'abc xyz 123');
    expect(response).toContain('Gracias por tu mensaje');
  });

  it('responde sin contexto cuando no hay historial de recall', () => {
    const response = generateResponse([], '¿Recuerdas mi nombre?');
    expect(response).toMatch(/no tengo contexto/i);
  });
});
