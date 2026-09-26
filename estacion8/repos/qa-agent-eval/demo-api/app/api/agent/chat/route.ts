import { NextRequest, NextResponse } from 'next/server';
import { generateResponse, type ChatMessage } from '@/lib/agent';
import { createConversation, getConversation, addMessage } from '@/lib/store';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, conversation_id } = body as {
    message: string;
    conversation_id?: string;
  };

  // Validar mensaje vacío
  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
  }

  // Obtener o crear conversación
  let conv = conversation_id ? getConversation(conversation_id) : null;
  if (!conv) {
    conv = createConversation();
  }

  // Construir historial para el agente
  const history: ChatMessage[] = conv.messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  // Guardar mensaje del usuario
  addMessage(conv.id, message, 'user');

  // Simular latencia (200-400ms)
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 200));

  // Generar respuesta
  const responseText = generateResponse(history, message);

  // Guardar respuesta del agente
  addMessage(conv.id, responseText, 'assistant');

  return NextResponse.json({
    response: responseText,
    conversation_id: conv.id,
    model: 'demo-agent-v1',
    usage: {
      input_tokens: message.length,
      output_tokens: responseText.length,
    },
  });
}
