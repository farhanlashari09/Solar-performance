import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ChatMessage, Language } from '../../types';
import { findChatbotResponse, defaultQuestionsByLang } from '../../data/mockChatbot';
import { chatApi } from '../../services/api';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Sparkles,
  ShieldAlert,
  Bot,
  User,
  AlertCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface SolarAssistantChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  onNavigateToTechnicians?: () => void;
}

export const SolarAssistantChatbot: React.FC<SolarAssistantChatbotProps> = ({
  isOpen,
  onToggle,
  onNavigateToTechnicians,
}) => {
  const { language, t, isRtl } = useLanguage();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: t.assistant.welcomeMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
      suggestions: defaultQuestionsByLang[language] || defaultQuestionsByLang.en,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // When language switches, add a language-aware greeting or update suggested questions if empty
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome-msg') {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: t.assistant.welcomeMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
          suggestions: defaultQuestionsByLang[language] || defaultQuestionsByLang.en,
        },
      ]);
    }
  }, [language, t.assistant.welcomeMsg]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatApi.askAssistant(query, language);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        suggestions: response.suggestions,
        isWarning: response.isWarning,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallback = findChatbotResponse(query, language);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: fallback.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        suggestions: fallback.suggestions,
        isWarning: fallback.isWarning,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: t.assistant.welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        suggestions: defaultQuestionsByLang[language] || defaultQuestionsByLang.en,
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button (Always visible at bottom right) */}
      <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-40`}>
        <button
          onClick={onToggle}
          className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-brand-dark hover:from-emerald-500 hover:to-brand-dark text-white shadow-xl shadow-emerald-950/25 transition-all hover:scale-105 active:scale-95"
          aria-label={t.assistant.floatingTooltip}
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          </div>
          <span className="font-bold text-xs tracking-wide hidden sm:inline">
            {t.assistant.title}
          </span>
        </button>
      </div>

      {/* Slide-out / Floating Chat Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 inset-y-0 sm:inset-y-auto sm:bottom-20 ${
            isRtl ? 'sm:left-6' : 'sm:right-6'
          } w-full sm:w-[420px] sm:h-[620px] bg-white rounded-none sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200`}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-brand-darkest via-brand-dark to-emerald-800 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>{t.assistant.title}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-emerald-200 leading-tight">
                  {t.assistant.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title={t.assistant.clearChat}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Safety Banner */}
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-tight">{t.assistant.safetyNotice}</p>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0 mt-1 shadow-2xs">
                    <Bot className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs space-y-2'
                  }`}
                >
                  {/* Message Markdown-like text */}
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Safety Warning Tag if applicable */}
                  {msg.isWarning && onNavigateToTechnicians && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-rose-600 font-bold">
                        ⚠️ High-Voltage Danger
                      </span>
                      <button
                        onClick={() => {
                          onToggle();
                          onNavigateToTechnicians();
                        }}
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Find Certified Technician →
                      </button>
                    </div>
                  )}

                  {/* Suggested Question Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t.assistant.quickQuestions}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(q)}
                            className="text-left text-[11px] py-1 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] text-right mt-1 ${
                      msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-slate-200" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs shrink-0">
                  <Bot className="w-4 h-4 text-amber-300" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-500 font-medium ml-1">
                    {t.assistant.typing}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.assistant.inputPlaceholder}
              className="flex-1 py-2 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl shadow-xs transition-colors shrink-0"
              aria-label={t.assistant.sendBtn}
            >
              <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
