import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { processMessage } from '@/application/conversation/process-message';
import { createScreeningSession } from '@/application/conversation/start-screening';
import { evaluateConversation } from '@/application/evaluation/evaluate-conversation';
import { generateConversationResponse, runEvaluatorPrompt } from '@/infrastructure/openai/chat-client';
import { conversationRepository, campaignRepository } from '@/infrastructure/dynamodb/repositories';
import type { Conversation } from '@/domain/conversation/entities/conversation';
import type { Rubric } from '@/domain/evaluation/entities/rubric';

const StartSchema = z.object({
  action: z.literal('start'),
  campaignId: z.string().min(1),
  simulatedUserId: z.string().optional(),
});

const MessageSchema = z.object({
  action: z.literal('message'),
  conversationId: z.string().min(1),
  message: z.string().min(1),
});

const StatusSchema = z.object({
  action: z.literal('status'),
  conversationId: z.string().min(1),
});

const RequestSchema = z.discriminatedUnion('action', [StartSchema, MessageSchema, StatusSchema]);

/**
 * POST /api/simulator
 *
 * Simulates Telegram bot interactions via HTTP.
 *
 * Actions:
 *   - start:   Start a new screening session for a campaign
 *   - message: Send a message to an active conversation
 *   - status:  Get current conversation state and transcript
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Simulator only available in development' }, { status: 403 });
  }

  try {
    const body = RequestSchema.parse(await req.json());

    switch (body.action) {
      case 'start':
        return handleStart(body);
      case 'message':
        return handleMessage(body);
      case 'status':
        return handleStatus(body);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('[SIMULATOR ERROR]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

async function handleStart(input: z.infer<typeof StartSchema>) {
  const { campaignId, simulatedUserId } = input;
  const userId = simulatedUserId || `sim-user-${Date.now()}`;

  // Find campaign (scan for campaignId)
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
  const { getDynamoDB } = await import('@/infrastructure/dynamodb/client');
  const { getTableName, DYNAMODB_TABLES } = await import('@/shared/constants');

  const result = await getDynamoDB().send(new ScanCommand({
    TableName: getTableName(DYNAMODB_TABLES.CAMPAIGNS),
    FilterExpression: 'campaignId = :cid',
    ExpressionAttributeValues: { ':cid': campaignId },
  }));

  const campaign = result.Items?.[0];
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  if (campaign.status !== 'active') {
    return NextResponse.json({ error: `Campaign is "${campaign.status}", must be "active"` }, { status: 400 });
  }

  // Check for existing conversation
  const existing = await conversationRepository.findByTelegramUser(userId, campaignId);
  if (existing) {
    return NextResponse.json({
      conversationId: existing.conversationId,
      state: existing.state,
      phase: existing.sessionState.currentPhase,
      message: 'Conversation already exists. Use action "message" to continue.',
    });
  }

  // Create session
  const tenantId = campaign.tenantId as string;
  const session = await createScreeningSession(tenantId, { campaignId }, {
    telegramUserId: userId,
    telegramChatId: 0,
    campaignId,
  });

  if (!session.success || !session.conversation) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  // Process initial message (triggers onboarding)
  const rubric = campaign.rubric as Rubric;
  const processResult = await processMessage({
    tenantId,
    conversation: session.conversation,
    message: '/start',
    rubric,
    knowledgeBaseContent: campaign.knowledgeBaseContent as string | undefined,
    generateAgentResponse: generateConversationResponse,
  });

  return NextResponse.json({
    conversationId: session.conversation.conversationId,
    candidateId: session.candidate?.candidateId,
    simulatedUserId: userId,
    phase: processResult.updatedSessionState.currentPhase,
    agentResponse: processResult.agentResponse,
    hint: 'Send { "action": "message", "conversationId": "...", "message": "Sí" } to continue',
  }, { status: 201 });
}

async function handleMessage(input: z.infer<typeof MessageSchema>) {
  const { conversationId, message } = input;

  // Find conversation (scan by conversationId)
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
  const { getDynamoDB } = await import('@/infrastructure/dynamodb/client');
  const { getTableName, DYNAMODB_TABLES } = await import('@/shared/constants');

  const result = await getDynamoDB().send(new ScanCommand({
    TableName: getTableName(DYNAMODB_TABLES.CONVERSATIONS),
    FilterExpression: 'conversationId = :cid',
    ExpressionAttributeValues: { ':cid': conversationId },
  }));

  const conversation = result.Items?.[0] as Conversation | undefined;
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  if (conversation.state === 'completed') {
    return NextResponse.json({
      state: 'completed',
      message: 'This conversation is already completed.',
    });
  }

  // Find campaign for rubric
  const campResult = await getDynamoDB().send(new ScanCommand({
    TableName: getTableName(DYNAMODB_TABLES.CAMPAIGNS),
    FilterExpression: 'campaignId = :cid',
    ExpressionAttributeValues: { ':cid': conversation.campaignId },
  }));

  const campaign = campResult.Items?.[0];
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  const tenantId = campaign.tenantId as string;
  const rubric = campaign.rubric as Rubric;

  const processResult = await processMessage({
    tenantId,
    conversation,
    message,
    rubric,
    knowledgeBaseContent: campaign.knowledgeBaseContent as string | undefined,
    generateAgentResponse: generateConversationResponse,
  });

  // Trigger evaluation if screening complete
  let evaluation = null;
  if (processResult.shouldEvaluate) {
    try {
      evaluation = await evaluateConversation({
        tenantId,
        conversationId: conversation.conversationId,
        rubric,
        runEvaluatorPrompt,
      });
    } catch (err) {
      console.error('[SIMULATOR] Evaluation error:', err);
    }
  }

  return NextResponse.json({
    conversationId,
    state: processResult.conversationState,
    phase: processResult.updatedSessionState.currentPhase,
    agentResponse: processResult.agentResponse,
    competenciesCovered: processResult.updatedSessionState.competenciesCovered.length,
    escalationTriggered: processResult.escalationTriggered,
    shouldEvaluate: processResult.shouldEvaluate,
    ...(evaluation && { evaluation }),
  });
}

async function handleStatus(input: z.infer<typeof StatusSchema>) {
  const { conversationId } = input;

  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
  const { getDynamoDB } = await import('@/infrastructure/dynamodb/client');
  const { getTableName, DYNAMODB_TABLES } = await import('@/shared/constants');

  const result = await getDynamoDB().send(new ScanCommand({
    TableName: getTableName(DYNAMODB_TABLES.CONVERSATIONS),
    FilterExpression: 'conversationId = :cid',
    ExpressionAttributeValues: { ':cid': conversationId },
  }));

  const conversation = result.Items?.[0] as Conversation | undefined;
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  return NextResponse.json({
    conversationId,
    campaignId: conversation.campaignId,
    state: conversation.state,
    phase: conversation.sessionState.currentPhase,
    competenciesCovered: conversation.sessionState.competenciesCovered,
    currentCompetencyId: conversation.sessionState.currentCompetencyId,
    questionsAsked: conversation.sessionState.questionsAsked,
    escalationCount: conversation.sessionState.escalationCount,
    messagesCount: conversation.messages.length,
    transcript: conversation.messages.map((m) => ({
      role: m.role,
      phase: m.phase,
      content: m.content,
      timestamp: m.timestamp,
    })),
  });
}
