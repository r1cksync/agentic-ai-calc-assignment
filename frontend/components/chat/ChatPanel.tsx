'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { sendChatMessage } from '@/lib/api';
import { Message } from '@/lib/types';
import { v4 } from '@/store/uuid';
import MessageBubble from './MessageBubble';
import SuggestedPrompts from './SuggestedPrompts';
import StepByStepSolver from './StepByStepSolver';

export default function ChatPanel() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const {
    messages,
    addMessage,
    addGraph,
    addQuery,
    isLoading,
    setLoading,
    sessionId,
    setActivePanel,
  } = useStore();

  // Handle query param from homepage
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && messages.length === 0) {
      setInput(q);
    }
  }, [searchParams, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput('');
    const userMsg: Message = {
      id: v4(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatMessage(chatHistory, sessionId);

      const assistantMsg: Message = {
        id: v4(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        tool_calls: response.tool_calls,
        graph_data: response.graph_data,
        steps: response.steps,
        follow_up_prompts: response.follow_up_prompts,
      };
      addMessage(assistantMsg);

      // Track query
      const toolUsed = response.tool_calls.length > 0 ? response.tool_calls[0].name : null;
      let resultType: 'arithmetic' | 'graphing' | 'equation' | 'unit_conversion' | 'matrix' | 'general' = 'general';
      if (toolUsed === 'calculator') resultType = 'arithmetic';
      else if (toolUsed === 'plot_function' || toolUsed === 'compare_functions') resultType = 'graphing';
      else if (toolUsed === 'solve_equation') resultType = 'equation';
      else if (toolUsed === 'unit_converter') resultType = 'unit_conversion';
      else if (toolUsed === 'matrix_operation') resultType = 'matrix';

      addQuery({
        id: v4(),
        prompt: messageText,
        timestamp: Date.now(),
        tool_used: toolUsed,
        result_type: resultType,
        response_time: response.response_time,
      });

      // Save graph if present
      if (response.graph_data) {
        addGraph({
          id: v4(),
          message_id: assistantMsg.id,
          graph_data: response.graph_data,
          expression: messageText,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Something went wrong';
      addMessage({
        id: v4(),
        role: 'assistant',
        content: `Error: ${errMsg}`,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-surface/50 backdrop-blur-sm">
        <h2 className="font-semibold text-lg">Chat</h2>
        <p className="text-xs text-gray-500">Ask me anything about math</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-5xl mb-4">🧮</div>
            <p className="text-lg mb-6">What would you like to calculate?</p>
            <SuggestedPrompts onSelect={handleSend} />
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <MessageBubble message={msg} onGraphClick={() => setActivePanel('graph')} />
              {msg.steps && msg.steps.length > 0 && msg.role === 'assistant' && (
                <StepByStepSolver steps={msg.steps} />
              )}
              {msg.follow_up_prompts && msg.role === 'assistant' && (
                <div className="mt-2 ml-12 flex flex-wrap gap-2">
                  {msg.follow_up_prompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="text-xs px-3 py-1.5 bg-surface rounded-full border border-white/10 text-gray-400 hover:text-white hover:border-primary/50 transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-4 py-3"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center pulse-glow">
              <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="text-sm text-gray-400">Thinking...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 bg-surface-light rounded-xl px-4 py-3 border border-white/5 focus-within:border-primary/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a math question..."
            className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-primary rounded-lg text-sm font-medium disabled:opacity-30 hover:bg-primary/80 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
