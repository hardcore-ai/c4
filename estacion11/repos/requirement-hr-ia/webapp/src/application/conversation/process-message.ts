import { conversationRepository } from '@/infrastructure/dynamodb/repositories';
import {
  isAffirmativeConsent,
  isNegativeConsent,
  isAIIdentityQuestion,
  isHumanRequestMessage,
  isSalaryOrBenefitsQuestion,
  shouldAskFollowUp,
  getNextCompetency,
  isScreeningComplete,
} from '@/domain/conversation/rules/conversation-rules';
import { logAuditEvent } from '@/application/compliance/log-audit-event';
import { recordConsent } from '@/application/compliance/record-consent';
import type { Conversation, Message, SessionState } from '@/domain/conversation/entities/conversation';
import type { Rubric } from '@/domain/evaluation/entities/rubric';
import { generateId } from '@/shared/utils/id';
import { nowISO } from '@/shared/utils/date';

export interface ProcessMessageInput {
  tenantId: string;
  conversation: Conversation;
  message: string;
  rubric: Rubric;
  knowledgeBaseContent?: string;
  generateAgentResponse: (params: {
    systemPrompt: string;
    sessionState: SessionState;
    recentMessages: Message[];
    knowledgeContext?: string;
  }) => Promise<string>;
}

export interface ProcessMessageResult {
  agentResponse: string;
  updatedSessionState: SessionState;
  conversationState: Conversation['state'];
  shouldEvaluate: boolean;
  escalationTriggered: boolean;
}

export async function processMessage(input: ProcessMessageInput): Promise<ProcessMessageResult> {
  const { tenantId, conversation, message, rubric, knowledgeBaseContent, generateAgentResponse } = input;
  const { sessionState } = conversation;
  const now = nowISO();

  // Add candidate message
  const candidateMessage: Message = {
    messageId: generateId(),
    role: 'candidate',
    content: message,
    timestamp: now,
    phase: sessionState.currentPhase,
  };

  await conversationRepository.addMessage(tenantId, conversation.conversationId, candidateMessage);

  let agentResponse: string;
  let updatedState = { ...sessionState, lastActivityAt: now };
  let conversationState = conversation.state;
  let shouldEvaluate = false;
  let escalationTriggered = false;

  // Handle based on current phase
  switch (sessionState.currentPhase) {
    case 'onboarding': {
      updatedState = { ...updatedState, currentPhase: 'consent' };
      agentResponse = buildOnboardingResponse();
      break;
    }

    case 'consent': {
      // Check negative BEFORE affirmative (e.g., "No acepto" contains "acepto")
      if (isNegativeConsent(message)) {
        await recordConsent(tenantId, {
          candidateId: conversation.candidateId,
          telegramUserId: conversation.telegramUserId,
          campaignId: conversation.campaignId,
          granted: false,
        });
        conversationState = 'completed';
        agentResponse = 'Entiendo. Gracias por tu tiempo. Si cambias de opinión, puedes volver a este enlace. ¡Te deseo mucho éxito!';
      } else if (isAffirmativeConsent(message)) {
        await recordConsent(tenantId, {
          candidateId: conversation.candidateId,
          telegramUserId: conversation.telegramUserId,
          campaignId: conversation.campaignId,
          granted: true,
        });
        updatedState = { ...updatedState, currentPhase: 'verification' };
        agentResponse = buildVerificationStartResponse(rubric);
      } else {
        agentResponse = 'Para continuar, necesito tu confirmación. ¿Aceptas participar en esta entrevista? Responde "Sí" o "No".';
      }
      break;
    }

    case 'verification': {
      // MVP: simplified — mark as passed and proceed to screening
      updatedState = { ...updatedState, currentPhase: 'screening' };
      const firstCompetency = getNextCompetency(updatedState, rubric);
      if (firstCompetency) {
        updatedState.currentCompetencyId = firstCompetency;
        updatedState.followUpAsked = false;
      }
      agentResponse = await generateAgentResponse({
        systemPrompt: buildScreeningSystemPrompt(rubric, knowledgeBaseContent),
        sessionState: updatedState,
        recentMessages: [...conversation.messages, candidateMessage],
        knowledgeContext: knowledgeBaseContent,
      });
      break;
    }

    case 'screening': {
      // Check for special messages first
      if (isAIIdentityQuestion(message)) {
        agentResponse = 'Sí, soy un asistente de inteligencia artificial. Estoy aquí para conocer tu experiencia profesional de forma conversacional. Toda la información será revisada por el equipo de reclutamiento. ¿Continuamos?';
        break;
      }

      if (isSalaryOrBenefitsQuestion(message)) {
        updatedState.escalationCount += 1;
        escalationTriggered = true;
        await logAuditEvent(tenantId, {
          eventType: 'escalation_triggered',
          entityId: conversation.conversationId,
          entityType: 'conversation',
          actorId: conversation.telegramUserId,
          actorType: 'candidate',
          details: { question: message, escalationCount: updatedState.escalationCount },
        });

        if (updatedState.escalationCount >= 2) {
          agentResponse = 'No tengo esa información. El equipo de reclutamiento podrá ayudarte con esos detalles en la siguiente etapa del proceso.';
        } else {
          agentResponse = 'No tengo esa información. El equipo de reclutamiento te dará los detalles en la siguiente etapa.';
        }
        break;
      }

      if (isHumanRequestMessage(message)) {
        escalationTriggered = true;
        await logAuditEvent(tenantId, {
          eventType: 'escalation_triggered',
          entityId: conversation.conversationId,
          entityType: 'conversation',
          actorId: conversation.telegramUserId,
          actorType: 'candidate',
          details: { reason: 'human_contact_requested' },
        });
        agentResponse = 'Entiendo. Voy a notificar al equipo de reclutamiento para que se pongan en contacto contigo. Tu progreso queda guardado. ¡Gracias por tu paciencia!';
        break;
      }

      // Normal screening flow
      if (shouldAskFollowUp(updatedState)) {
        // Ask follow-up for current competency
        updatedState.followUpAsked = true;
        updatedState.questionsAsked += 1;
      } else {
        // Move to next competency
        if (updatedState.currentCompetencyId) {
          updatedState.competenciesCovered.push(updatedState.currentCompetencyId);
        }

        if (isScreeningComplete(updatedState, rubric)) {
          updatedState.currentPhase = 'closing';
          shouldEvaluate = true;
          agentResponse = buildClosingResponse();

          await conversationRepository.updateSessionState(
            tenantId, conversation.conversationId, updatedState, 'completed',
          );

          const agentMsg: Message = {
            messageId: generateId(), role: 'agent', content: agentResponse, timestamp: nowISO(), phase: 'closing',
          };
          await conversationRepository.addMessage(tenantId, conversation.conversationId, agentMsg);

          await logAuditEvent(tenantId, {
            eventType: 'screening_completed',
            entityId: conversation.conversationId,
            entityType: 'conversation',
            actorId: conversation.telegramUserId,
            actorType: 'candidate',
          });

          return { agentResponse, updatedSessionState: updatedState, conversationState: 'completed', shouldEvaluate, escalationTriggered };
        }

        const nextComp = getNextCompetency(updatedState, rubric);
        updatedState.currentCompetencyId = nextComp ?? undefined;
        updatedState.followUpAsked = false;
        updatedState.questionsAsked += 1;
      }

      agentResponse = await generateAgentResponse({
        systemPrompt: buildScreeningSystemPrompt(rubric, knowledgeBaseContent),
        sessionState: updatedState,
        recentMessages: [...conversation.messages.slice(-10), candidateMessage],
        knowledgeContext: knowledgeBaseContent,
      });
      break;
    }

    case 'closing': {
      agentResponse = '¡Gracias! Tu entrevista ya fue completada. El equipo de reclutamiento revisará tus respuestas y se pondrá en contacto contigo con los próximos pasos.';
      break;
    }

    default:
      agentResponse = 'Lo siento, ha ocurrido un error. Por favor intenta de nuevo más tarde.';
  }

  // Save agent response message
  const agentMsg: Message = {
    messageId: generateId(),
    role: 'agent',
    content: agentResponse,
    timestamp: nowISO(),
    phase: updatedState.currentPhase,
  };
  await conversationRepository.addMessage(tenantId, conversation.conversationId, agentMsg);

  // Update session state
  await conversationRepository.updateSessionState(
    tenantId, conversation.conversationId, updatedState, conversationState,
  );

  return { agentResponse, updatedSessionState: updatedState, conversationState, shouldEvaluate, escalationTriggered };
}

function buildOnboardingResponse(): string {
  return `¡Hola! 👋 Soy un asistente de inteligencia artificial diseñado para conocer tu experiencia profesional a través de una conversación.

Antes de comenzar, quiero que sepas:
• Soy una IA, no una persona
• Esta conversación será revisada por el equipo de reclutamiento
• Tus respuestas se usarán únicamente para evaluar tu perfil para esta posición
• Puedes dejar de participar en cualquier momento

¿Aceptas participar en esta entrevista? Responde "Sí" o "No".`;
}

function buildVerificationStartResponse(rubric: Rubric): string {
  return `¡Perfecto! Gracias por aceptar.

Voy a hacerte algunas preguntas sobre tu experiencia profesional relacionadas con el rol. No hay respuestas correctas o incorrectas — quiero conocer tus experiencias reales.

Tómate el tiempo que necesites para responder. ¿Estás listo/a para comenzar?`;
}

function buildClosingResponse(): string {
  return `¡Muchas gracias por tu tiempo y tus respuestas! 🙏

He registrado toda la información de nuestra conversación. El equipo de reclutamiento revisará tu perfil y se pondrá en contacto contigo con los próximos pasos.

¿Cómo calificarías esta experiencia del 1 al 5? (1 = muy mala, 5 = excelente)`;
}

function buildScreeningSystemPrompt(rubric: Rubric, knowledgeBase?: string): string {
  const competencyList = rubric.competencies
    .map((c) => `- ${c.name}: ${c.description}\n  Pregunta sugerida: "${c.sampleQuestion}"`)
    .join('\n');

  return `Eres un entrevistador de IA conduciendo un screening para el rol evaluado con la siguiente rúbrica.

IDIOMA: Responde siempre en español neutro.

COMPETENCIAS A EVALUAR:
${competencyList}

REGLAS:
- Haz UNA pregunta por competencia
- Después de que el candidato responda, haz exactamente UNA pregunta de seguimiento para profundizar
- Después de la respuesta al seguimiento, pasa a la siguiente competencia
- NUNCA menciones puntajes, evaluaciones o niveles de la rúbrica
- NUNCA especules sobre salario, beneficios o políticas de la empresa
- Si preguntan sobre salario/beneficios: "No tengo esa información. El equipo de reclutamiento te dará los detalles en la siguiente etapa."
- Si preguntan "¿Eres IA?": Confirma que eres un asistente de IA
- Mantén un tono profesional, cálido y empático

${knowledgeBase ? `BASE DE CONOCIMIENTO:\n${knowledgeBase}` : ''}`;
}
