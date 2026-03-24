'use client';

import { Message } from '@/lib/types';
import { useStore } from '@/store/useStore';

interface Props {
  message: Message;
  onGraphClick: () => void;
}

export default function MessageBubble({ message, onGraphClick }: Props) {
  const { graphs } = useStore();
  const isUser = message.role === 'user';

  const linkedGraph = graphs.find((g) => g.message_id === message.id);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
              isUser ? 'bg-primary' : 'bg-secondary/20 text-secondary'
            }`}
          >
            {isUser ? '👤' : 'π'}
          </div>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-primary/20 border border-primary/30'
                : 'bg-surface border border-white/5'
            }`}
          >
            {/* Tool call badges */}
            {message.tool_calls && message.tool_calls.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {message.tool_calls.map((tc, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                  >
                    🔧 {tc.name}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

            {/* Graph thumbnail */}
            {linkedGraph && (
              <button
                onClick={onGraphClick}
                className="mt-3 p-2 bg-background rounded-lg border border-white/10 hover:border-primary/50 transition-all flex items-center gap-2 text-xs text-gray-400 hover:text-white"
              >
                <span className="text-lg">📊</span>
                <span>View Graph</span>
              </button>
            )}

            {/* Timestamp */}
            <div className="text-[10px] text-gray-600 mt-2">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
