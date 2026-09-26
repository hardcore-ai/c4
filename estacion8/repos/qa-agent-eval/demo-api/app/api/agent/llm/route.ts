import { NextRequest, NextResponse } from 'next/server';
import { generateLLMResponse, type LLMMessage } from '@/lib/llm-agent';
import { createConversation, getConversation, addMessage } from '@/lib/store';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, conversation_id } = body as {
    message: string;
    conversation_id?: string;
  };

  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
  }

  let conv = conversation_id ? getConversation(conversation_id) : null;
  if (!conv) {
    conv = createConversation();
  }

  const history: LLMMessage[] = conv.messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  addMessage(conv.id, message, 'user');

  const { response, model, usage } = await generateLLMResponse(history, message);

  addMessage(conv.id, response, 'assistant');

  return NextResponse.json({
    response,
    conversation_id: conv.id,
    model,
    usage,
  });
}
