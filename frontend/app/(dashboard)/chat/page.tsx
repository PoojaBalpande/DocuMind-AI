'use client';

import { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { suggestedQuestions } from '@/lib/mockData';

export default function ChatPage() {
  const { sessions, activeSessionId, messages, isGenerating, setActiveSession, createNewChat, sendMessage, regenerateLastResponse, deleteSession, initChat } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChat();
  }, [initChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;
    if (!activeSessionId) createNewChat();
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Chat Sidebar */}
      <div className="w-[280px] bg-surface-container-low/80 border-r border-outline-variant/20 flex flex-col">
        <div className="p-md">
          <button
            onClick={() => createNewChat()}
            className="w-full primary-gradient text-on-primary py-sm rounded-xl font-semibold flex items-center justify-center gap-sm hover:shadow-lg transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-sm space-y-xs">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={`group flex items-center gap-sm p-sm rounded-lg cursor-pointer transition-all ${
                activeSessionId === session.id
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-on-surface-variant hover:bg-surface-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{session.isPinned ? 'push_pin' : 'forum'}</span>
              <span className="flex-1 text-label-lg truncate">{session.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
        </div>

        {/* Storage */}
        <div className="p-md border-t border-outline-variant/20">
          <div className="bg-primary-container p-md rounded-xl text-on-primary-container">
            <p className="text-label-md font-bold mb-xs">Storage Used</p>
            <div className="w-full bg-surface-dim/30 h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full w-[65%] rounded-full transition-all duration-500"></div>
            </div>
            <p className="text-[10px] mt-xs opacity-70">450 GB / 1 TB used</p>
          </div>
        </div>
      </div>

      {/* Chat Main Area */}
      <div className="flex-1 flex flex-col bg-surface-container-lowest/50">
        {/* Chat Header */}
        <div className="h-14 border-b border-outline-variant/10 flex items-center justify-between px-xl">
          <div className="flex items-center gap-md">
            <h2 className="text-headline-sm text-primary font-semibold">
              {activeSessionId ? sessions.find((s) => s.id === activeSessionId)?.title || 'Chat' : 'Intelligence Console'}
            </h2>
          </div>
          <div className="flex items-center gap-sm">
            <button className="text-on-surface-variant hover:text-primary p-xs rounded-lg hover:bg-surface-variant/30 transition-all">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary p-xs rounded-lg hover:bg-surface-variant/30 transition-all">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-xl space-y-xl">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-xl">
              <div className="w-20 h-20 rounded-full primary-gradient flex items-center justify-center shadow-xl">
                <span className="material-symbols-outlined text-white text-[36px]">blur_on</span>
              </div>
              <div className="text-center">
                <h3 className="text-headline-md text-primary mb-sm font-semibold">What would you like to explore?</h3>
                <p className="text-body-md text-on-surface-variant mb-xl">Ask anything about your uploaded documents. I&apos;ll provide cited answers.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md max-w-[600px] w-full">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => { if (!activeSessionId) createNewChat(); setInput(q); }}
                    className="text-left p-md bg-surface-container rounded-2xl border border-outline-variant/20 text-body-sm text-on-surface-variant hover:bg-surface-dim hover:border-secondary/30 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-xs ${msg.role === 'user' ? 'max-w-[80%]' : 'max-w-[90%] ml-auto items-end'}`}
            >
              <div
                className={`p-md rounded-2xl text-body-md ${
                  msg.role === 'user'
                    ? 'bg-surface-container rounded-tl-none text-on-surface'
                    : 'bg-white border-l-4 border-secondary rounded-tr-none shadow-sm text-on-surface'
                }`}
              >
                {/* Render content with markdown-like line breaks */}
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>
                    {line.startsWith('**') && line.endsWith('**')
                      ? <strong>{line.replace(/\*\*/g, '')}</strong>
                      : line.startsWith('- ')
                      ? <span className="block ml-md">• {line.slice(2)}</span>
                      : line}
                    {i < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-md flex flex-wrap gap-xs">
                    {msg.citations.map((cit) => (
                      <div
                        key={cit.id}
                        className="bg-surface-container-low px-sm py-1 rounded-full border border-outline-variant/30 flex items-center gap-xs cursor-pointer hover:bg-surface-dim transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm text-secondary">picture_as_pdf</span>
                        <span className="text-[11px] font-semibold text-on-surface-variant">{cit.documentTitle} {cit.pageNumber ? `(p.${cit.pageNumber})` : ''}</span>
                        {cit.relevanceScore && (
                          <span className="text-[10px] text-secondary font-bold">{Math.round(cit.relevanceScore * 100)}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className={`text-label-md px-sm ${msg.role === 'user' ? 'text-on-surface-variant' : 'text-secondary'}`}>
                {msg.role === 'user' ? 'You' : 'DocuMind AI'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isGenerating && (
            <div className="flex flex-col gap-xs max-w-[90%] ml-auto items-end">
              <div className="bg-white border-l-4 border-secondary p-md rounded-2xl rounded-tr-none shadow-sm">
                <div className="flex items-center gap-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-body-sm text-on-surface-variant">Analyzing documents...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Regenerate */}
        {messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !isGenerating && (
          <div className="px-xl pb-sm flex justify-end">
            <button
              onClick={regenerateLastResponse}
              className="text-label-lg text-secondary hover:bg-secondary/5 px-md py-xs rounded-lg flex items-center gap-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span> Regenerate
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-xl border-t border-outline-variant/10">
          <div className="relative max-w-[900px] mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full py-md px-xl focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all pr-[120px]"
              placeholder="Ask anything about your documents..."
              disabled={isGenerating}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-xs">
              <button className="p-sm text-on-surface-variant hover:text-secondary transition-colors">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <button
                onClick={handleSend}
                disabled={isGenerating || !input.trim()}
                className="primary-gradient p-sm rounded-full text-on-primary disabled:opacity-40 transition-all hover:shadow-lg active:scale-90"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
