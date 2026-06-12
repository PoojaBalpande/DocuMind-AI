'use client';

import { useEffect, useRef } from 'react';
import { useCitation } from '@/contexts/CitationContext';

// ── Helpers ──────────────────────────────────────

/** Derive a file-type icon from the Citation metadata */
function getSourceIcon(fileType?: string): { icon: string; label: string; color: string } {
  switch (fileType) {
    case 'pdf':
      return { icon: 'picture_as_pdf', label: 'PDF', color: 'text-red-500' };
    case 'docx':
      return { icon: 'description', label: 'Document', color: 'text-blue-500' };
    case 'txt':
      return { icon: 'article', label: 'Text', color: 'text-gray-500' };
    case 'md':
      return { icon: 'code', label: 'Markdown', color: 'text-purple-500' };
    default:
      return { icon: 'source', label: 'Knowledge Base', color: 'text-secondary' };
  }
}

/** Determine relevance tier for color coding */
function getRelevanceTier(score: number): { label: string; barColor: string; bgColor: string } {
  const pct = Math.round(score * 100);
  if (pct >= 80) return { label: 'Highly Relevant', barColor: 'bg-green-500', bgColor: 'bg-green-500/10' };
  if (pct >= 50) return { label: 'Relevant', barColor: 'bg-secondary', bgColor: 'bg-secondary/10' };
  return { label: 'Partially Relevant', barColor: 'bg-amber-500', bgColor: 'bg-amber-500/10' };
}

// ── Component ────────────────────────────────────

export default function CitationSidebar() {
  const { selectedCitation, isSidebarOpen, closeCitation } = useCitation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // ESC key to close
  useEffect(() => {
    if (!isSidebarOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeCitation();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, closeCitation]);

  // Focus close button when sidebar opens
  useEffect(() => {
    if (isSidebarOpen) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  const sourceInfo = selectedCitation ? getSourceIcon(selectedCitation.fileType) : null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCitation}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        role="complementary"
        aria-label="Citation details sidebar"
        aria-hidden={!isSidebarOpen}
        className={`
          citation-sidebar
          fixed md:relative right-0 top-0 md:top-auto h-full z-40 md:z-auto
          bg-surface-container-lowest border-l border-outline-variant/20
          flex flex-col
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isSidebarOpen
            ? 'w-full sm:w-[400px] md:w-[400px] translate-x-0 opacity-100 shadow-2xl md:shadow-lg'
            : 'w-0 md:w-0 translate-x-full md:translate-x-0 opacity-0 pointer-events-none overflow-hidden'
          }
        `}
      >
        {/* Inner container */}
        <div className="w-full sm:w-[400px] md:w-[400px] h-full flex flex-col min-w-0">

          {/* ── Header ──────────────────────────── */}
          <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/10 bg-surface-container-low shrink-0">
            <div className="flex items-center gap-sm min-w-0">
              <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[16px]">menu_book</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-label-lg font-bold text-primary truncate">Source Inspector</h3>
                <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-medium">Citation Details</p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              onClick={closeCitation}
              className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all shrink-0"
              aria-label="Close citation sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* ── Content ─────────────────────────── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!selectedCitation ? (
              /* ── Empty State ── */
              <div className="flex flex-col items-center justify-center h-full gap-lg text-center px-xl">
                <div className="w-20 h-20 rounded-2xl bg-surface-variant/30 flex items-center justify-center border border-outline-variant/10">
                  <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">article</span>
                </div>
                <div className="space-y-xs">
                  <p className="text-body-md text-on-surface-variant/70 font-semibold">No citation selected</p>
                  <p className="text-body-sm text-on-surface-variant/50 leading-relaxed">
                    Click on a citation card in the chat to inspect its source details here.
                  </p>
                </div>
                <div className="flex items-center gap-xs text-[11px] text-on-surface-variant/40 bg-surface-container px-md py-xs rounded-full border border-outline-variant/10">
                  <span className="material-symbols-outlined text-[14px]">touch_app</span>
                  <span>Select a citation to begin</span>
                </div>
              </div>
            ) : (
              /* ── Citation Card Content ── */
              <div className="p-lg space-y-md animate-fade-in">

                {/* ━━ Source Type Badge ━━ */}
                <div className="flex items-center gap-sm" role="region" aria-label="Source type">
                  <div className={`flex items-center gap-xs px-md py-xs rounded-full border border-outline-variant/15 bg-surface-container text-label-md font-semibold ${sourceInfo?.color || 'text-secondary'}`}>
                    <span className="material-symbols-outlined text-[16px]">{sourceInfo?.icon}</span>
                    <span>{sourceInfo?.label}</span>
                  </div>
                  {selectedCitation.id && (
                    <span className="text-[10px] text-on-surface-variant/40 font-mono tracking-tight">
                      #{selectedCitation.id.slice(-6).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* ━━ CARD 1: Document Information ━━ */}
                <section
                  className="rounded-2xl border border-outline-variant/15 overflow-hidden bg-white"
                  role="region"
                  aria-label="Document information"
                >
                  <div className="px-md py-sm bg-surface-container-low/60 border-b border-outline-variant/10">
                    <h4 className="text-[11px] text-on-surface-variant/60 uppercase tracking-widest font-bold flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">folder_open</span>
                      Document Information
                    </h4>
                  </div>
                  <div className="p-md space-y-sm">
                    {/* Document name */}
                    <div className="flex items-start gap-sm">
                      <span className={`material-symbols-outlined text-[22px] mt-px shrink-0 ${sourceInfo?.color || 'text-secondary'}`}>
                        {sourceInfo?.icon || 'description'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-on-surface-variant/50 font-medium uppercase tracking-wider mb-xxs">Name</p>
                        <p className="text-body-md font-semibold text-on-surface break-words leading-snug">
                          {selectedCitation.documentTitle || 'Unknown Document'}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-outline-variant/8" />

                    {/* Document ID */}
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant/40 shrink-0">fingerprint</span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-on-surface-variant/50 font-medium uppercase tracking-wider mb-xxs">Document ID</p>
                        {selectedCitation.documentId ? (
                          <p className="text-body-sm text-on-surface-variant font-mono text-[12px] truncate">
                            {selectedCitation.documentId}
                          </p>
                        ) : (
                          <p className="text-body-sm text-on-surface-variant/40 italic">Not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* ━━ CARD 2: Page Information ━━ */}
                <section
                  className="rounded-2xl border border-outline-variant/15 overflow-hidden bg-white"
                  role="region"
                  aria-label="Page information"
                >
                  <div className="px-md py-sm bg-surface-container-low/60 border-b border-outline-variant/10">
                    <h4 className="text-[11px] text-on-surface-variant/60 uppercase tracking-widest font-bold flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">menu_book</span>
                      Page Information
                    </h4>
                  </div>
                  <div className="p-md">
                    <div className="flex items-center gap-md">
                      {selectedCitation.pageNumber ? (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                            <span className="text-headline-sm font-bold text-secondary">{selectedCitation.pageNumber}</span>
                          </div>
                          <div>
                            <p className="text-body-md font-semibold text-on-surface">Page {selectedCitation.pageNumber}</p>
                            <p className="text-[11px] text-on-surface-variant/50">Source location in document</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-surface-variant/30 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px] text-on-surface-variant/30">help_outline</span>
                          </div>
                          <div>
                            <p className="text-body-md text-on-surface-variant/60 italic">Page not available</p>
                            <p className="text-[11px] text-on-surface-variant/40">Page information was not provided</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </section>

                {/* ━━ CARD 3: Relevance Score ━━ */}
                <section
                  className="rounded-2xl border border-outline-variant/15 overflow-hidden bg-white"
                  role="region"
                  aria-label="Relevance score"
                >
                  <div className="px-md py-sm bg-surface-container-low/60 border-b border-outline-variant/10">
                    <h4 className="text-[11px] text-on-surface-variant/60 uppercase tracking-widest font-bold flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">analytics</span>
                      Source Relevance
                    </h4>
                  </div>
                  <div className="p-md">
                    {selectedCitation.relevanceScore != null ? (
                      (() => {
                        const pct = Math.round(selectedCitation.relevanceScore! * 100);
                        const tier = getRelevanceTier(selectedCitation.relevanceScore!);
                        return (
                          <div className="space-y-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-sm">
                                <span className={`inline-flex items-center gap-xs px-sm py-xxs rounded-full text-[11px] font-bold ${tier.bgColor}`}>
                                  <span className="material-symbols-outlined text-[14px]">verified</span>
                                  {tier.label}
                                </span>
                              </div>
                              <span className="text-headline-sm font-bold text-on-surface">{pct}%</span>
                            </div>
                            <div className="w-full bg-surface-dim/30 h-2.5 rounded-full overflow-hidden">
                              <div
                                className={`${tier.barColor} h-full rounded-full transition-all duration-700 ease-out`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex items-center gap-sm py-xs">
                        <div className="w-10 h-10 rounded-xl bg-surface-variant/30 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant/30">remove_circle_outline</span>
                        </div>
                        <div>
                          <p className="text-body-sm text-on-surface-variant/60 italic">Not available</p>
                          <p className="text-[11px] text-on-surface-variant/40">Relevance score was not provided</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* ━━ CARD 4: Citation Preview ━━ */}
                <section
                  className="rounded-2xl border border-outline-variant/15 overflow-hidden bg-white"
                  role="region"
                  aria-label="Citation preview"
                >
                  <div className="px-md py-sm bg-surface-container-low/60 border-b border-outline-variant/10">
                    <h4 className="text-[11px] text-on-surface-variant/60 uppercase tracking-widest font-bold flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">format_quote</span>
                      Citation Preview
                    </h4>
                  </div>
                  <div className="p-md">
                    {selectedCitation.excerpt ? (
                      <div className="relative">
                        {/* Decorative quote mark */}
                        <span className="absolute -top-1 -left-0.5 text-[32px] leading-none text-secondary/15 font-serif select-none">&ldquo;</span>
                        <blockquote className="pl-lg pr-sm pt-sm pb-sm border-l-3 border-secondary/30 bg-secondary/3 rounded-r-lg">
                          <p className="text-body-sm text-on-surface leading-relaxed whitespace-pre-wrap break-words">
                            {selectedCitation.excerpt}
                          </p>
                        </blockquote>
                        {/* Source attribution */}
                        <div className="flex items-center gap-xs mt-sm text-[11px] text-on-surface-variant/50">
                          <span className="material-symbols-outlined text-[12px]">south_west</span>
                          <span>
                            Extracted from{' '}
                            <span className="font-semibold text-on-surface-variant/70">
                              {selectedCitation.documentTitle || 'source document'}
                            </span>
                            {selectedCitation.pageNumber && (
                              <>, page {selectedCitation.pageNumber}</>
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-lg gap-sm text-center">
                        <div className="w-12 h-12 rounded-xl bg-surface-variant/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[24px] text-on-surface-variant/25">text_snippet</span>
                        </div>
                        <div>
                          <p className="text-body-sm text-on-surface-variant/50 italic">Source unavailable</p>
                          <p className="text-[11px] text-on-surface-variant/40 mt-xxs">No excerpt was provided for this citation</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

              </div>
            )}
          </div>

          {/* ── Footer ──────────────────────────── */}
          {selectedCitation && (
            <div className="px-lg py-sm border-t border-outline-variant/10 bg-surface-container-low shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-on-surface-variant/50 flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px]">keyboard</span>
                  Press <kbd className="px-xs py-xxs bg-surface-variant/40 rounded text-[10px] font-mono mx-xxs">ESC</kbd> to close
                </p>
                <p className="text-[10px] text-on-surface-variant/35 font-mono">
                  {selectedCitation.id?.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
