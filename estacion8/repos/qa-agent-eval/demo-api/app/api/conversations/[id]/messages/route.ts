import { NextRequest, NextResponse } from 'next/server';
import { addMessage, getMessages, getConversation } from '@/lib/store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const conv = getConversation(id);
  if (!conv) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }

  const body = await request.json();
  const { content, role } = body as { content: string; role?: 'user' | 'assistant' };

  const msg = addMessage(id, content, role ?? 'user');
  if (!msg) {
    return NextResponse.json({ error: 'Error al agregar mensaje' }, { status: 500 });
  }

  return NextResponse.json(
    { id: msg.id, content: msg.content, role: msg.role, created_at: msg.created_at },
    { status: 201 },
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const messages = getMessages(id);
  if (messages === null) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }
  return NextResponse.json(messages);
}
