import { cn } from '@/lib/utils';

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

interface TranscriptViewerProps {
  messages: Message[];
}

export function TranscriptViewer({ messages }: TranscriptViewerProps) {
  if (messages.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">Sin mensajes para mostrar.</p>;
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto p-2" data-testid="transcript-viewer">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            'flex',
            msg.role === 'agent' ? 'justify-start' : 'justify-end',
          )}
        >
          <div
            className={cn(
              'max-w-[80%] rounded-lg px-4 py-2 text-sm',
              msg.role === 'agent'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-blue-600 text-white',
            )}
            data-testid={`message-${i}`}
          >
            <p>{msg.content}</p>
            <p className={cn(
              'text-xs mt-1',
              msg.role === 'agent' ? 'text-gray-400' : 'text-blue-200',
            )}>
              {new Date(msg.timestamp).toLocaleTimeString('es')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
