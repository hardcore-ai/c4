import type { ConversationState, SessionPhase } from '@/shared/types';

export interface SessionState {
  currentPhase: SessionPhase;
  competenciesCovered: string[];
  currentCompetencyId?: string;
  followUpAsked: boolean;
  questionsAsked: number;
  verificationResults: Record<string, string>;
  escalationCount: number;
  lastActivityAt: string;
}

export interface Message {
  messageId: string;
  role: 'agent' | 'candidate';
  content: string;
  timestamp: string;
  phase: string;
}

export interface Conversation {
  conversationId: string;
  campaignId: string;
  candidateId: string;
  telegramUserId: string;
  telegramChatId: number;
  telegramUserIdCampaignId: string;
  state: ConversationState;
  sessionState: SessionState;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
