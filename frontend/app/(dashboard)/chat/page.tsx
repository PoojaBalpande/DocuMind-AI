'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useChatStore } from '@/stores/chatStore';
import { useDocumentStore } from '@/stores/documentStore';
import { suggestedQuestions } from '@/lib/mockData';
import { CitationProvider, useCitation } from '@/contexts/CitationContext';
import CitationSidebar from '@/components/chat/CitationSidebar';

export default function ChatPage() {
  return (
    <CitationProvider>
      <ChatPageContent />
    </CitationProvider>
  );
}

function ChatPageContent() {
  const { openCitation } = useCitation();
  const {
    sessions,
    activeSessionId,
    messages,
    isGenerating,
    isLoadingSessions,
    isLoadingMessages,
    setActiveSession,
    createNewChat,
    sendMessage,
    stopGeneration,
    regenerateLastResponse,
    deleteSession,
    renameSession,
    initChat,
  } = useChatStore();

  const { documents, initDocuments } = useDocumentStore();
  const [input, setInput] = useState('');

  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const startEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setEditingTitle(currentTitle);
  };

  const submitRename = async (id: string) => {
    if (!editingTitle.trim() || editingTitle.trim() === sessions.find(s => s.id === id)?.title) {
      setEditingSessionId(null);
      return;
    }
    if (editingTitle.trim().length > 255) {
      alert('Title is too long (maximum is 255 characters).');
      return;
    }
    await renameSession(id, editingTitle.trim());
    setEditingSessionId(null);
  };

  useEffect(() => {
    initChat();
    initDocuments();
  }, [initChat, initDocuments]);

  useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) setMounted(true);
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isGenerating ? 'auto' : 'smooth' });
  }, [messages, isGenerating]);



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
    <div className="flex h-[calc(100vh-64px)] relative overflow-hidden" id="chat-page-root">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Chat Sidebar */}
      <div
        className={`w-[280px] bg-surface-container-low/80 border-r border-outline-variant/20 flex flex-col transition-all duration-300 md:relative fixed inset-y-0 left-0 z-30 h-full md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-md flex items-center justify-between gap-sm">
          <button
            onClick={() => {
              createNewChat();
              setIsMobileSidebarOpen(false);
            }}
            className="flex-1 primary-gradient text-on-primary py-sm rounded-xl font-semibold flex items-center justify-center gap-sm hover:shadow-lg transition-all active:scale-95"
            disabled={documents.length === 0}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Chat
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden text-on-surface-variant hover:text-primary p-xs rounded-lg hover:bg-surface-variant/30 transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-sm space-y-xs">
          {isLoadingSessions ? (
            <div className="space-y-sm p-sm">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-sm animate-pulse">
                  <div className="w-5 h-5 bg-surface-variant/40 rounded-full" />
                  <div className="h-4 bg-surface-variant/40 rounded flex-1" />
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-md text-center">
              <p className="text-body-sm text-on-surface-variant opacity-70">No conversations yet.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSession(session.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`group flex items-center gap-sm p-sm rounded-lg cursor-pointer transition-all ${activeSessionId === session.id
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-on-surface-variant hover:bg-surface-variant/30'
                  }`}
              >
                <span className="material-symbols-outlined text-[18px] shrink-0">
                  {session.isPinned ? 'push_pin' : 'forum'}
                </span>

                {editingSessionId === session.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => submitRename(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitRename(session.id);
                      if (e.key === 'Escape') setEditingSessionId(null);
                    }}
                    className="flex-1 bg-white border border-secondary/30 px-xs py-xxs rounded text-label-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary min-w-0"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="flex-1 text-label-lg truncate">{session.title}</span>
                    <button
                      onClick={(e) => startEditing(session.id, session.title, e)}
                      className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-secondary transition-all p-xxs rounded hover:bg-surface-variant/50 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToDelete(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-on-surface-variant hover:text-error transition-all p-xxs rounded hover:bg-surface-variant/50 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </>
                )}
              </div>
            ))
          )}
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
      {documents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-xl text-center bg-surface-container-lowest/50 h-full">
          <div className="max-w-md p-xl bg-white rounded-3xl border border-outline-variant/20 shadow-md flex flex-col items-center gap-md">
            <span className="material-symbols-outlined text-[64px] text-secondary">picture_as_pdf</span>
            <h3 className="text-headline-md text-primary font-bold">Upload a document to start chatting</h3>
            <p className="text-body-md text-on-surface-variant">
              DocuMind AI requires PDF documents in the Knowledge Base to retrieve grounded answers and citations.
            </p>
            <a
              href="/documents"
              className="primary-gradient text-on-primary px-lg py-sm rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95 flex items-center gap-xs"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Go to Knowledge Base
            </a>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0 flex flex-col bg-surface-container-lowest/50">
          {/* Chat Header */}
          <div className="h-14 border-b border-outline-variant/10 flex items-center justify-between px-xl gap-sm">
            <div className="flex items-center gap-md min-w-0">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="md:hidden text-on-surface-variant hover:text-primary p-xs rounded-lg hover:bg-surface-variant/30 transition-all flex items-center justify-center shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
              <h2 className="text-headline-sm text-primary font-semibold truncate">
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
          <div className="flex-1 overflow-y-auto custom-scrollbar p-xl space-y-xl flex flex-col justify-start">
            {isLoadingMessages ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-sm text-on-surface-variant">
                  <svg className="animate-spin h-8 w-8 text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-body-md font-medium">Loading chat history...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
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
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-xs ${msg.role === 'user' ? 'max-w-[80%]' : 'max-w-[90%] ml-auto items-end'}`}
                >
                  <div
                    className={`p-md rounded-2xl text-body-md ${msg.role === 'user'
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
                    {msg.role === 'assistant' && isGenerating && msg.id === messages[messages.length - 1]?.id && (
                      <span className="inline-block w-1.5 h-4 bg-secondary ml-xs animate-pulse align-middle"></span>
                    )}
                  </div>

                  {/* Clickable Citation Cards (Display below AI messages) */}
                  {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-xs flex flex-wrap gap-sm justify-end max-w-full">
                      {msg.citations.map((cit) => (
                        <a
                          key={cit.id}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            openCitation(cit, msg.citations);
                          }}
                          className="bg-white hover:bg-surface-container border border-outline-variant/20 rounded-xl p-sm flex flex-col items-start min-w-[180px] max-w-[280px] transition-all cursor-pointer shadow-sm active:scale-95 text-left gap-xs"
                        >
                          <div className="flex items-center gap-xs text-[11px] font-semibold text-primary truncate max-w-full">
                            <span>📄</span>
                            <span className="truncate">{cit.documentTitle}</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant/70">Page {cit.pageNumber || 'N/A'}</span>
                          {cit.excerpt && (
                            <p className="text-[10px] text-on-surface-variant italic line-clamp-2 mt-xxs opacity-85 border-t border-outline-variant/10 pt-xs w-full">
                              &ldquo;{cit.excerpt}&rdquo;
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className={`flex items-center gap-sm px-sm mt-xs ${msg.role === 'user' ? 'text-on-surface-variant' : 'text-secondary'}`}>
                    <span className="text-label-md">
                      {msg.role === 'user' ? 'You' : 'DocuMind AI'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'assistant' && msg.content && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedMessageId(msg.id);
                          setTimeout(() => setCopiedMessageId(null), 2000);
                        }}
                        className="text-label-md hover:underline flex items-center gap-xxs active:scale-95 transition-all text-secondary"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedMessageId === msg.id ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedMessageId === msg.id ? 'Copied!' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

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
                  onClick={isGenerating ? stopGeneration : handleSend}
                  disabled={!isGenerating && !input.trim()}
                  className="primary-gradient p-sm rounded-full text-on-primary disabled:opacity-40 transition-all hover:shadow-lg active:scale-90"
                >
                  <span className="material-symbols-outlined">
                    {isGenerating ? 'stop' : 'send'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citation Sidebar — non-blocking, slides in from right */}
      <CitationSidebar />

      {/* Delete Confirmation Modal */}
      {mounted && sessionToDelete && createPortal(
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-md backdrop-blur-sm transition-all duration-200">
          {/* Click outside backdrop triggers close */}
          <div className="absolute inset-0" onClick={() => setSessionToDelete(null)}></div>

          {/* Modal Container */}
          <div className="relative z-10 bg-white rounded-3xl p-6 w-[600px] max-w-[calc(100vw-32px)] shadow-xl">
            <h2 className="text-error text-xl font-bold mb-4 flex items-center gap-sm">
              <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              Delete Chat?
            </h2>

            <p className="mb-6 text-on-surface-variant">
              Are you sure you want to delete this chat? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSessionToDelete(null)}
                className="px-lg py-sm rounded-xl text-on-surface-variant hover:bg-surface-variant/30 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const id = sessionToDelete;
                  setSessionToDelete(null);
                  if (id) await deleteSession(id);
                }}
                className="px-lg py-sm rounded-xl bg-error text-on-error font-semibold hover:bg-error/90 transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
