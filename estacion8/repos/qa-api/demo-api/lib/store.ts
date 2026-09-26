/**
 * Almacenamiento en memoria para conversaciones y mensajes.
 * Se reinicia con cada restart del servidor — ideal para demos.
 */

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  metadata: Record<string, unknown>;
  messages: Message[];
}

// Usar globalThis para compartir estado entre API routes en Next.js dev mode.
// Sin esto, cada route handler puede tener su propia instancia del modulo.
const globalStore = globalThis as unknown as { __conversations: Map<string, Conversation> };
if (!globalStore.__conversations) {
  globalStore.__conversations = new Map<string, Conversation>();
}
const conversations = globalStore.__conversations;

function generateId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createConversation(metadata: Record<string, unknown> = {}): Conversation {
  const conv: Conversation = {
    id: generateId(),
    created_at: new Date().toISOString(),
    metadata,
    messages: [],
  };
  conversations.set(conv.id, conv);
  return conv;
}

export function getAllConversations(): Conversation[] {
  return Array.from(conversations.values());
}

export function getConversation(id: string): Conversation | undefined {
  return conversations.get(id);
}

export function deleteConversation(id: string): boolean {
  return conversations.delete(id);
}

export function addMessage(conversationId: string, content: string, role: 'user' | 'assistant'): Message | null {
  const conv = conversations.get(conversationId);
  if (!conv) return null;

  const msg: Message = {
    id: generateMessageId(),
    conversation_id: conversationId,
    content,
    role,
    created_at: new Date().toISOString(),
  };
  conv.messages.push(msg);
  return msg;
}

export function getMessages(conversationId: string): Message[] | null {
  const conv = conversations.get(conversationId);
  if (!conv) return null;
  return conv.messages;
}
