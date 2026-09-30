import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // Lazy import to avoid bot initialization at build time (requires TELEGRAM_BOT_TOKEN)
  const { getWebhookHandler } = await import('@/infrastructure/telegram/webhook-handler');
  const handler = getWebhookHandler();
  return handler(req);
}
