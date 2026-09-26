import { NextRequest, NextResponse } from 'next/server';
import { generateResponse, type Message } from '@/lib/agent';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, history } = body as { message: string; history: Message[] };

  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
  }

  // Simular latencia de un agente real (300-600ms)
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 300));

  const response = generateResponse(history ?? [], message);

  return NextResponse.json({ response });
}
