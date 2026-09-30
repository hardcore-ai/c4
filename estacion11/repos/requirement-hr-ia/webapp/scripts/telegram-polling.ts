/**
 * Telegram Bot Long Polling for local development.
 * Run with: npm run telegram   (desde webapp/)
 *
 * En local Telegram no puede llamar a un webhook en localhost, así que el bot
 * corre como proceso aparte que pregunta a Telegram por mensajes nuevos.
 * Solo puede haber UN proceso por token de bot (si no, Telegram responde 409).
 *
 * Connects to the full conversation engine:
 * /start → createScreeningSession → processMessage (5-phase flow) → evaluateConversation
 */
// PRIMER import: carga .env.local y arranca OpenTelemetry antes que el resto de módulos
import './otel-bootstrap';

import { trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { Bot } from 'grammy';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { processMessage } from '../src/application/conversation/process-message';
import { createScreeningSession } from '../src/application/conversation/start-screening';
import { evaluateConversation } from '../src/application/evaluation/evaluate-conversation';
import { generateConversationResponse, runEvaluatorPrompt } from '../src/infrastructure/openai/chat-client';
import { conversationRepository } from '../src/infrastructure/dynamodb/repositories';
import { logger } from '../src/infrastructure/logging/logger';
import type { Conversation } from '../src/domain/conversation/entities/conversation';
import type { Rubric } from '../src/domain/evaluation/entities/rubric';

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not set in .env.local');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-your')) {
  console.error('OPENAI_API_KEY is not configured in .env.local');
  process.exit(1);
}

// DynamoDB client
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
});
const dynamodb = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'entrevista-dev';

// Campaign cache to avoid repeated scans
const campaignCache = new Map<string, Record<string, unknown>>();

async function findCampaignById(campaignId: string): Promise<Record<string, unknown> | null> {
  if (campaignCache.has(campaignId)) return campaignCache.get(campaignId)!;

  const result = await dynamodb.send(new ScanCommand({
    TableName: `${TABLE_PREFIX}-campaigns`,
    FilterExpression: 'campaignId = :cid',
    ExpressionAttributeValues: { ':cid': campaignId },
  }));

  const campaign = result.Items?.[0] || null;
  if (campaign) campaignCache.set(campaignId, campaign);
  return campaign;
}

async function findConversationByTelegramUser(telegramUserId: string, campaignId: string): Promise<Conversation | null> {
  return conversationRepository.findByTelegramUser(telegramUserId, campaignId);
}

const bot = new Bot(token);

// ──────────────────────────────────────────────
// Span raíz por mensaje: agrupa DynamoDB + LLM en un solo trace.
// Equivale al span HTTP que Next.js crea por request en la webapp.
// ──────────────────────────────────────────────
const tracer = trace.getTracer('telegram-bot');

bot.use(async (ctx, next) => {
  const text = ctx.message?.text ?? '';
  const spanName = text.startsWith('/start') ? 'telegram /start' : 'telegram message';

  await tracer.startActiveSpan(
    spanName,
    {
      kind: SpanKind.SERVER,
      attributes: {
        'messaging.system': 'telegram',
        'messaging.operation.type': 'process',
        'telegram.update_id': ctx.update.update_id,
        'telegram.chat.type': ctx.chat?.type ?? 'unknown',
        'app.message.length': text.length,
      },
    },
    async (span) => {
      const startedAt = Date.now();
      try {
        await next();
        // Log dentro del span activo: el logger le adjunta trace_id y span_id,
        // así en Loki cada línea enlaza con su trace en Tempo
        logger.info('telegram', spanName === 'telegram /start' ? 'Screening iniciado' : 'Mensaje procesado', {
          context: {
            updateId: ctx.update.update_id,
            messageLength: text.length,
            durationMs: Date.now() - startedAt,
          },
        });
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    },
  );
});

// ──────────────────────────────────────────────
// /start — Create screening session or resume
// ──────────────────────────────────────────────
bot.command('start', async (ctx) => {
  const campaignId = ctx.match;
  const userName = ctx.from?.first_name || 'candidato/a';
  const telegramUserId = String(ctx.from?.id || '');
  const chatId = ctx.chat.id;

  console.log(`\n[/start] User: ${telegramUserId}, Campaign: ${campaignId}`);

  if (!campaignId) {
    await ctx.reply('¡Hola! Para iniciar una entrevista, necesitas un enlace válido de campaña.');
    return;
  }

  try {
    // 1. Find campaign
    const campaign = await findCampaignById(campaignId);
    if (!campaign) {
      await ctx.reply('Lo siento, no encontré la campaña asociada a este enlace.');
      return;
    }

    if (campaign.status !== 'active') {
      await ctx.reply(`La campaña "${campaign.name}" no está activa en este momento.`);
      return;
    }

    // 2. Check for existing conversation
    const existing = await findConversationByTelegramUser(telegramUserId, campaignId);
    if (existing) {
      if (existing.state === 'completed') {
        await ctx.reply('Tu entrevista ya fue completada. ¡Gracias por participar! El equipo de reclutamiento se pondrá en contacto contigo.');
      } else {
        await ctx.reply('¡Hola de nuevo! Continuemos donde lo dejamos. Puedes enviarme tu respuesta.');
      }
      return;
    }

    // 3. Create screening session
    const tenantId = campaign.tenantId as string;
    const result = await createScreeningSession(tenantId, { campaignId }, {
      telegramUserId,
      telegramChatId: chatId,
      campaignId,
    });

    if (!result.success || !result.conversation) {
      await ctx.reply('No se pudo iniciar la sesión. Por favor intenta de nuevo.');
      return;
    }

    console.log(`[OK] Session created: ${result.conversation.conversationId}`);

    // 4. Process the first message through the conversation engine (onboarding phase)
    const rubric = campaign.rubric as Rubric;
    const processResult = await processMessage({
      tenantId,
      conversation: result.conversation,
      message: '/start',
      rubric,
      knowledgeBaseContent: campaign.knowledgeBaseContent as string | undefined,
      generateAgentResponse: generateConversationResponse,
    });

    await ctx.reply(processResult.agentResponse);
    console.log(`[PHASE] ${processResult.updatedSessionState.currentPhase}`);

  } catch (error) {
    console.error('[ERROR] /start:', error);
    await ctx.reply('Lo siento, ha ocurrido un error. Por favor intenta de nuevo más tarde.');
  }
});

// ──────────────────────────────────────────────
// Text messages — Route through conversation engine
// ──────────────────────────────────────────────
bot.on('message:text', async (ctx) => {
  const telegramUserId = String(ctx.from?.id || '');
  const message = ctx.message.text;

  console.log(`\n[MSG] User: ${telegramUserId}, Text: "${message.substring(0, 50)}..."`);

  try {
    // Find active conversation for this user (scan all campaigns)
    // MVP: scan conversations table for this telegram user
    const result = await dynamodb.send(new ScanCommand({
      TableName: `${TABLE_PREFIX}-conversations`,
      FilterExpression: 'telegramUserId = :uid AND #s <> :completed',
      ExpressionAttributeNames: { '#s': 'state' },
      ExpressionAttributeValues: {
        ':uid': telegramUserId,
        ':completed': 'completed',
      },
    }));

    const conversation = result.Items?.[0] as Conversation | undefined;

    if (!conversation) {
      await ctx.reply('No tienes una entrevista activa. Usa un enlace de campaña para iniciar una.');
      return;
    }

    // Find campaign for rubric
    const campaign = await findCampaignById(conversation.campaignId);
    if (!campaign) {
      await ctx.reply('Error al encontrar la campaña. Contacta al equipo de reclutamiento.');
      return;
    }

    const tenantId = campaign.tenantId as string;
    const rubric = campaign.rubric as Rubric;

    // Process message through the conversation engine
    const processResult = await processMessage({
      tenantId,
      conversation,
      message,
      rubric,
      knowledgeBaseContent: campaign.knowledgeBaseContent as string | undefined,
      generateAgentResponse: generateConversationResponse,
    });

    await ctx.reply(processResult.agentResponse);

    console.log(`[PHASE] ${processResult.updatedSessionState.currentPhase} | Evaluate: ${processResult.shouldEvaluate} | Escalation: ${processResult.escalationTriggered}`);

    // If screening is complete, trigger evaluation
    if (processResult.shouldEvaluate) {
      console.log(`[EVAL] Starting evaluation for conversation ${conversation.conversationId}...`);
      try {
        const campaign = await findCampaignById(conversation.campaignId);
        if (campaign) {
          await evaluateConversation({
            tenantId,
            conversationId: conversation.conversationId,
            rubric: campaign.rubric as Rubric,
            runEvaluatorPrompt,
          });
        }
        console.log(`[EVAL] Evaluation completed successfully`);
      } catch (evalError) {
        console.error('[EVAL ERROR]', evalError);
        // Don't notify user about evaluation errors — it's an internal process
      }
    }

  } catch (error) {
    console.error('[ERROR] message handler:', error);
    await ctx.reply('Estoy teniendo dificultades técnicas. Puedes intentar de nuevo en unos minutos. Tu progreso está guardado.');
  }
});

// Error handler
bot.catch((err) => {
  console.error('[BOT ERROR]', err.message);
});

async function startBot() {
  console.log('🤖 Telegram bot starting in LONG POLLING mode...');
  console.log(`   Bot: @${process.env.TELEGRAM_BOT_USERNAME || 'unknown'}`);
  console.log(`   DynamoDB: ${process.env.DYNAMODB_ENDPOINT || 'AWS default'}`);
  console.log(`   OpenAI: ${process.env.OPENAI_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log('   Press Ctrl+C to stop\n');

  // Delete webhook with retry
  for (let i = 0; i < 3; i++) {
    try {
      await bot.api.deleteWebhook();
      break;
    } catch (e) {
      console.log(`Retry ${i + 1}/3 deleting webhook...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  await bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot @${botInfo.username} is running!\n`);
    },
  });
}

export { bot };

// Solo arranca el polling cuando se ejecuta como script (no al importarlo)
if (require.main === module) {
  startBot().catch((err) => {
    console.error('Failed to start bot:', err.message);
    process.exit(1);
  });
}
