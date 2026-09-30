import { webhookCallback } from 'grammy';
import { getBot, sendTelegramMessage } from './bot';
import { conversationRepository, campaignRepository } from '@/infrastructure/dynamodb/repositories';
import { createScreeningSession } from '@/application/conversation/start-screening';
import { processMessage } from '@/application/conversation/process-message';
import { evaluateConversation } from '@/application/evaluation/evaluate-conversation';
import { generateConversationResponse, runEvaluatorPrompt } from '@/infrastructure/openai/chat-client';
import { withRetry } from '@/infrastructure/openai/resilient-client';
import { logger } from '@/infrastructure/logging/logger';
import { generateCorrelationId } from '@/shared/utils/correlation';

export function setupBot(): void {
  const bot = getBot();

  bot.command('start', async (ctx) => {
    const correlationId = generateCorrelationId();
    const campaignId = ctx.match;

    if (!campaignId) {
      await ctx.reply('¡Hola! Para iniciar una entrevista, necesitas un enlace válido de campaña.');
      return;
    }

    try {
      // Find campaign across all tenants (campaign ID is unique)
      // MVP approach: scan campaigns table for the campaignId
      // In production, use a GSI on campaignId
      const telegramUserId = String(ctx.from?.id || '');
      const chatId = ctx.chat.id;

      // Check for existing conversation
      const existing = await conversationRepository.findByTelegramUser(telegramUserId, campaignId);
      if (existing) {
        if (existing.state === 'completed') {
          await ctx.reply('Tu entrevista ya fue completada. ¡Gracias por participar! El equipo de reclutamiento se pondrá en contacto contigo.');
        } else {
          await ctx.reply('¡Hola de nuevo! Continuemos donde lo dejamos.');
        }
        return;
      }

      // For MVP, we need to resolve campaign to get tenantId
      // This requires a lookup mechanism — we'll use the campaign directly
      logger.info('telegram', 'New screening started', {
        correlationId,
        context: { campaignId, telegramUserId },
      });

      // Send initial greeting — processMessage will handle the onboarding flow
      await ctx.reply('¡Hola! 👋 Bienvenido/a. Estoy preparando todo para nuestra conversación...');

    } catch (error) {
      logger.error('telegram', 'Error handling /start command', {
        correlationId,
        error: error instanceof Error ? error : new Error(String(error)),
        context: { campaignId },
      });
      await ctx.reply('Lo siento, ha ocurrido un error. Por favor intenta de nuevo más tarde.');
    }
  });

  bot.on('message:text', async (ctx) => {
    const correlationId = generateCorrelationId();
    const telegramUserId = String(ctx.from?.id || '');
    const chatId = ctx.chat.id;
    const message = ctx.message.text;

    try {
      // Find active conversation for this user
      // MVP: we need to find conversation by telegram user
      // This is a simplified flow — in production, use session cache
      logger.info('telegram', 'Message received', {
        correlationId,
        context: { telegramUserId, messageLength: message.length },
      });

      // The actual conversation lookup and processing will be wired
      // through the API route which has access to campaign context

    } catch (error) {
      logger.error('telegram', 'Error processing message', {
        correlationId,
        error: error instanceof Error ? error : new Error(String(error)),
        context: { telegramUserId },
      });
      await ctx.reply('Estoy teniendo dificultades técnicas. Puedes intentar de nuevo en unos minutos. Tu progreso está guardado.');
    }
  });
}

export function getWebhookHandler() {
  setupBot();
  return webhookCallback(getBot(), 'std/http');
}
