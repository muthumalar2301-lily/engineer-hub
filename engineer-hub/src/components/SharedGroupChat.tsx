import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, UserProfile, Classroom } from '../types';

interface SharedGroupChatProps {
  classroom?: Classroom | null;
  messages: ChatMessage[];
  onSendMessage: (text: string, isAskingAi: boolean) => Promise<void>;
  currentUser: UserProfile;
  isLoadingAi: boolean;
}

export const SharedGroupChat: React.FC<SharedGroupChatProps> = ({
  classroom,
  messages,
  onSendMessage,
  currentUser,
  isLoadingAi,
}) => {
  const [inputText, setInputText] = useState('');
  const [askAiToggle, setAskAiToggle] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoadingAi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoadingAi) return;

    const text = inputText.trim();
    const isAi = askAiToggle || text.toLowerCase().includes('@ai');

    setInputText('');
    await onSendMessage(text, isAi);
  };

  const handleStarterPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Group Chat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Engineering Assistant & Group Chat
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Ask technical engineering questions, evaluate system designs, debug hardware/software issues, and collaborate with your team.
          </p>
        </div>

        {/* Room indicator */}
        <div className="flex items-center space-x-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Room: {classroom?.name || 'General Engineering Hub'}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1 text-purple-600 font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Assistant Ready</span>
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Start a conversation with your AI Engineering Assistant
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ask questions about your engineering problems, projects, technologies, or solutions.
                </p>
              </div>

              {/* Clean Starter Prompts */}
              <div className="w-full pt-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sample Engineering Inquiries
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    'What sensor configuration is best for low-power indoor occupancy detection?',
                    'Compare MQTT vs HTTP REST for an IoT telemetry pipeline.',
                    'How do we structure a microgrid battery management system?',
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStarterPrompt(prompt)}
                      className="p-2.5 text-xs text-left bg-white hover:bg-purple-50 hover:border-purple-300 rounded-xl border border-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const isAi = msg.senderRole === 'ai';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isAi ? 'items-center my-4' : isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  {isAi ? (
                    <div className="w-full max-w-3xl rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-5 shadow-md border border-indigo-500/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs border border-purple-500/30">
                            <Bot className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="font-bold text-xs text-purple-300">
                            Engineer AI Assistant
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      <div className="prose prose-invert prose-xs max-w-none leading-relaxed text-slate-200">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-xl rounded-2xl p-3.5 shadow-2xs space-y-1.5 ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] space-x-2">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <User className="w-3 h-3 opacity-70" />
                          <span className={isMe ? 'text-emerald-100' : 'text-slate-700'}>
                            {msg.senderName}
                          </span>
                        </div>
                        <span className={isMe ? 'text-emerald-200' : 'text-slate-400'}>
                          {msg.timestamp}
                        </span>
                      </div>

                      <div className="text-xs leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* AI Thinking Animation */}
          {isLoadingAi && (
            <div className="flex items-center justify-center my-4">
              <div className="px-4 py-2.5 rounded-full bg-slate-900 text-purple-300 border border-purple-500/30 text-xs flex items-center space-x-2 shadow-md">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Engineer AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={askAiToggle}
                onChange={(e) => setAskAiToggle(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-semibold text-slate-700 flex items-center space-x-1">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span>Ask Engineer AI Assistant</span>
              </span>
            </label>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Press Enter to send
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask an engineering question or message your team..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoadingAi}
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition flex items-center space-x-1.5 shadow-sm ${
                !inputText.trim() || isLoadingAi
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-purple-600 hover:bg-purple-500 cursor-pointer'
              }`}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
