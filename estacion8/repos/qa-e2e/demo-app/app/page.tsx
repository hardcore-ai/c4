'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      setMessages([...updatedMessages, { role: 'agent', content: data.response }]);
    } catch {
      setMessages([...updatedMessages, { role: 'agent', content: 'Error al procesar tu mensaje.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleNewConversation() {
    setMessages([]);
    setInput('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Asistente IA</h1>
        <button
          onClick={handleNewConversation}
          aria-label="Nueva conversación"
          style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}
        >
          Nueva conversación
        </button>
      </header>

      {/* Messages */}
      <div
        data-testid="conversation-history"
        style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <div data-testid="conversation-list" style={{ display: 'contents' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              data-testid={msg.role === 'user' ? 'user-message' : 'agent-message'}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#3b82f6' : '#1e293b',
                padding: '10px 16px',
                borderRadius: 12,
                maxWidth: '80%',
                lineHeight: 1.5,
              }}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {loading && (
          <div
            data-testid="loading"
            style={{ alignSelf: 'flex-start', color: '#64748b', fontStyle: 'italic' }}
          >
            El agente está escribiendo...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{ padding: '12px 20px', borderTop: '1px solid #1e293b', display: 'flex', gap: 8 }}
      >
        <input
          type="text"
          aria-label="Escribe tu mensaje"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
        />
        <button
          type="submit"
          aria-label="Enviar"
          disabled={loading || !input.trim()}
          style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, opacity: loading || !input.trim() ? 0.5 : 1 }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
