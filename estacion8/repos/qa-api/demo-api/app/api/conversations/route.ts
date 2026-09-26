import { NextRequest, NextResponse } from 'next/server';
import { createConversation, getAllConversations } from '@/lib/store';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const metadata = body.metadata ?? {};
  const conv = createConversation(metadata);

  return NextResponse.json(
    { id: conv.id, created_at: conv.created_at, metadata: conv.metadata },
    { status: 201 },
  );
}

export async function GET() {
  const conversations = getAllConversations().map((c) => ({
    id: c.id,
    created_at: c.created_at,
    metadata: c.metadata,
  }));
  return NextResponse.json(conversations);
}
