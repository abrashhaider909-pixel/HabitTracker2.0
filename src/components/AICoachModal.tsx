import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Lightbulb, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Habit, Transaction, CareerMilestone } from '../types';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  habits: Habit[];
  transactions: Transaction[];
  careerMilestones: CareerMilestone[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  habits,
  transactions,
  careerMilestones,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "Hello! I am your HabitPulse Principal Engineering & Life OS Coach. I am here to help you accelerate your technical career (DSA, High-Scale System Design, Full-Stack, Cloud) while maintaining ruthless discipline in your health, finances, and spiritual grounding. What's on your mind today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInput(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const userContext = {
        totalHabits: habits.length,
        habitsSummary: habits.map(h => ({ title: h.title, streak: h.streak, category: h.category })),
        totalMilestonesMastered: careerMilestones.filter(m => m.completed).length,
        totalMilestones: careerMilestones.length,
      };

      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptText,
          userContext,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || data.error || 'No response returned from AI Coach.';

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: `Error connecting to AI Coach: ${e.message || 'Please verify server connectivity.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'How do I balance 2 LeetCode problems a day with a demanding full-time SWE job?',
    'Review my current habits and tell me what critical daily discipline is missing.',
    'How can I level up from Senior to Staff Engineer without burning out?',
    'Give me a 30-day roadmap to master Distributed Systems and System Design.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col h-[650px] max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0F766E] border border-teal-200/60 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  HabitPulse AI Coach
                </h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-100 text-[#0F766E] border border-teal-200">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Principal Software Engineer & Life OS Executive Mentor
              </p>
            </div>
          </div>
          <button
            id="close-coach-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#0F766E] text-white font-medium rounded-tr-sm shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[10px] mt-1.5 ${isUser ? 'text-teal-100 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F766E]" />
              <span>Analyzing career architecture & life balance...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 border-t border-slate-200/80 bg-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Quick:
          </span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qp)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 whitespace-nowrap transition-colors flex items-center gap-1 border border-slate-200 shadow-xs cursor-pointer"
            >
              <span>{qp.slice(0, 38)}...</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-3.5 border-t border-slate-200/80 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="coach-user-input"
              type="text"
              placeholder="Ask anything about SWE leveling, System Design, habits, or wealth..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
            />
            <button
              id="send-coach-msg-btn"
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
