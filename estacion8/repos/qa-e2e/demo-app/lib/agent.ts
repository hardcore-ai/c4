/**
 * Lógica del agente simulado.
 * Función pura y determinista — ideal para pruebas unitarias.
 */

export interface Message {
  role: 'user' | 'agent';
  content: string;
}

/**
 * Extrae el nombre del usuario a partir del historial completo.
 */
export function extractName(messages: Message[]): string | null {
  const allUserText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');

  const match = allUserText.match(
    /(?:me llamo|mi nombre es|soy)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+)/i,
  );
  return match ? match[1] : null;
}

/**
 * Detecta temas mencionados en el historial de usuario.
 */
export function extractTopics(messages: Message[]): string[] {
  const allUserText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');

  const topics: string[] = [];
  if (/soporte|técnico|technical/i.test(allUserText)) topics.push('soporte técnico');
  if (/horario|atención|hora/i.test(allUserText)) topics.push('horarios');
  if (/servicio|ofrecen/i.test(allUserText)) topics.push('servicios');
  return topics;
}

/**
 * Genera una respuesta del agente dado el historial previo y el mensaje actual.
 */
export function generateResponse(history: Message[], userMessage: string): string {
  const fullHistory: Message[] = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  const name = extractName(fullHistory);
  const topics = extractTopics(fullHistory);

  // Preguntas de contexto / recall
  if (/recuerdas|cómo me llamo|qué necesitaba/i.test(userMessage)) {
    const parts: string[] = [];
    if (name) parts.push(`Tu nombre es ${name}`);
    if (topics.length) parts.push(`mencionaste que necesitabas ${topics.join(' y ')}`);
    if (parts.length) return `¡Claro! ${parts.join('. ')}.`;
    return 'Lo siento, no tengo contexto previo sobre esa consulta.';
  }

  // Saludo
  if (/^(hola|buenos días|buenas)/i.test(userMessage.trim())) {
    return '¡Hola! Soy el asistente virtual. ¿En qué puedo ayudarte hoy?';
  }

  // Horarios
  if (/horario|atención/i.test(userMessage)) {
    return 'Nuestros horarios de atención son de lunes a viernes de 8:00 AM a 6:00 PM, y sábados de 9:00 AM a 1:00 PM.';
  }

  // Servicios
  if (/servicio|ofrecen/i.test(userMessage)) {
    return 'Ofrecemos consultoría tecnológica, desarrollo de software a medida, soporte técnico 24/7 y capacitación empresarial en IA y automatización.';
  }

  // Soporte técnico
  if (/soporte|técnico/i.test(userMessage)) {
    const greeting = name ? `Entendido, ${name}. ` : '';
    return `${greeting}Para soporte técnico, puedes contactarnos por chat, email (soporte@ejemplo.com) o al 01-800-SOPORTE. ¿En qué necesitas ayuda específicamente?`;
  }

  // Respuesta genérica
  return `Gracias por tu mensaje. He recibido tu consulta: "${userMessage.slice(0, 50)}". ¿Puedo ayudarte con algo más específico?`;
}
