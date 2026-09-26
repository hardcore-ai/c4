import { NextRequest, NextResponse } from 'next/server';
import { getConversation, deleteConversation } from '@/lib/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const conv = getConversation(id);
  if (!conv) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }
  return NextResponse.json({
    id: conv.id,
    created_at: conv.created_at,
    metadata: conv.metadata,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const deleted = deleteConversation(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }
  return NextResponse.json({ deleted: true });
}
