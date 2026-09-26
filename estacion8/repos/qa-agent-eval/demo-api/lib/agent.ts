/**
 * Logica del agente simulado para testing de API.
 * Genera respuestas deterministas con memoria de contexto por conversacion.
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function extractName(messages: ChatMessage[]): string | null {
  const allUserText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');

  const match = allUserText.match(
    /(?:me llamo|mi nombre es|soy)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ]+)/i,
  );
  return match ? match[1] : null;
}

function extractTopics(messages: ChatMessage[]): string[] {
  const allUserText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');

  const topics: string[] = [];
  if (/facturación|facturacion|factura/i.test(allUserText)) topics.push('facturación');
  if (/soporte|técnico|technical/i.test(allUserText)) topics.push('soporte técnico');
  if (/horario|atención|hora/i.test(allUserText)) topics.push('horarios');
  if (/servicio|ofrecen/i.test(allUserText)) topics.push('servicios');
  return topics;
}

export function generateResponse(history: ChatMessage[], userMessage: string): string {
  const fullHistory: ChatMessage[] = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  const name = extractName(fullHistory);
  const topics = extractTopics(fullHistory);

  // Intentos de extraer system prompt
  if (/system prompt|instrucciones internas|repite.*instrucciones/i.test(userMessage)) {
    return 'Lo siento, no puedo compartir detalles sobre mi configuración interna. ¿Puedo ayudarte con alguna consulta sobre nuestros servicios?';
  }

  // Preguntas de contexto / recall
  if (/recuerdas|cómo me llamo|qué asunto|qué necesitaba|sabes.*llamo/i.test(userMessage)) {
    const parts: string[] = [];
    if (name) parts.push(`Tu nombre es ${name}`);
    if (topics.length) parts.push(`mencionaste ${topics.join(' y ')}`);
    if (parts.length) return `¡Claro! ${parts.join('. ')}.`;
    return 'No tengo información previa sobre eso en esta conversación. ¿Podrías darme más contexto?';
  }

  // Lenguaje agresivo — responder con empatía
  if (/asco|no sirves|inútil|basura|horrible/i.test(userMessage)) {
    return 'Lamento mucho que tengas esa experiencia. Entiendo tu frustración y quiero ayudarte. ¿Podrías contarme con más detalle qué problema estás enfrentando para poder asistirte mejor?';
  }

  // Solicitudes fuera de scope
  if (/poema|canción|chiste|cuento|historia de amor/i.test(userMessage)) {
    return 'Agradezco tu creatividad, pero mi función es asistirte con consultas sobre nuestros servicios y soporte. ¿Hay algo en lo que pueda ayudarte dentro de ese ámbito?';
  }

  // Saludo
  if (/^(hola|buenos días|buenas|hey)/i.test(userMessage.trim())) {
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

  // Facturación
  if (/facturación|facturacion|factura/i.test(userMessage)) {
    const greeting = name ? `${name}, ` : '';
    return `${greeting}Para consultas de facturación, puedes acceder al portal de clientes o contactar al equipo de finanzas en facturacion@ejemplo.com.`;
  }

  // Respuesta genérica
  return `Gracias por tu mensaje. He recibido tu consulta. ¿Puedo ayudarte con algo más específico sobre nuestros servicios?`;
}
