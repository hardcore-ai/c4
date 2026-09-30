import { Bot } from 'grammy';

let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
    botInstance = new Bot(token);
  }
  return botInstance;
}

export async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  const bot = getBot();
  await bot.api.sendMessage(chatId, text);
}
