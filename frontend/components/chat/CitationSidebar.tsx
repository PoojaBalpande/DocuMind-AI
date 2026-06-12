'use client';

import { useEffect, useRef } from 'react';
import { useCitation } from '@/contexts/CitationContext';

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
      // Small delay to allow transition to begin
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

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
        {/* Inner container — prevents content from shrinking during width transition */}
        <div className="w-full sm:w-[400px] md:w-[400px] h-full flex flex-col min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/10 bg-surface-container-low shrink-0">
            <div className="flex items-center gap-sm min-w-0">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">menu_book</span>
              <h3 className="text-label-lg font-bold text-primary truncate">Citation Source</h3>
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-lg">
            {!selectedCitation ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full gap-md text-center px-md">
                <div className="w-16 h-16 rounded-full bg-surface-variant/40 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50">article</span>
                </div>
                <p className="text-body-md text-on-surface-variant/70 font-medium">No citation selected</p>
                <p className="text-body-sm text-on-surface-variant/50">
                  Click on a citation card in the chat to view its source details here.
                </p>
              </div>
            ) : (
              /* Citation details */
              <div className="space-y-lg animate-fade-in">

                {/* Document title */}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant/70 uppercase tracking-wider font-semibold">
                    Document
                  </label>
                  <div className="flex items-start gap-sm p-md bg-surface-container rounded-xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-secondary text-[22px] mt-px shrink-0">picture_as_pdf</span>
                    <span className="text-body-md font-semibold text-on-surface break-words">
                      {selectedCitation.documentTitle || 'Untitled Document'}
                    </span>
                  </div>
                </div>

                {/* Page number */}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant/70 uppercase tracking-wider font-semibold">
                    Page
                  </label>
                  <div className="flex items-center gap-sm p-md bg-surface-container rounded-xl border border-outline-variant/10">
                    <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">bookmark</span>
                    {selectedCitation.pageNumber ? (
                      <span className="text-body-md font-semibold text-on-surface">
                        Page {selectedCitation.pageNumber}
                      </span>
                    ) : (
                      <span className="text-body-md text-on-surface-variant/60 italic">
                        Page not available
                      </span>
                    )}
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant/70 uppercase tracking-wider font-semibold">
                    Citation Text
                  </label>
                  <div className="p-md bg-secondary/5 rounded-xl border-l-4 border-secondary">
                    {selectedCitation.excerpt ? (
                      <p className="text-body-sm text-on-surface leading-relaxed italic">
                        &ldquo;{selectedCitation.excerpt}&rdquo;
                      </p>
                    ) : (
                      <p className="text-body-sm text-on-surface-variant/60 italic">
                        No excerpt available for this citation.
                      </p>
                    )}
                  </div>
                </div>

                {/* Relevance score (if available) */}
                {selectedCitation.relevanceScore != null && (
                  <div className="space-y-xs">
                    <label className="text-label-md text-on-surface-variant/70 uppercase tracking-wider font-semibold">
                      Relevance
                    </label>
                    <div className="p-md bg-surface-container rounded-xl border border-outline-variant/10">
                      <div className="flex items-center justify-between mb-sm">
                        <span className="text-body-sm font-semibold text-on-surface">
                          {Math.round(selectedCitation.relevanceScore * 100)}% match
                        </span>
                        <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
                      </div>
                      <div className="w-full bg-surface-dim/40 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-secondary h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(selectedCitation.relevanceScore * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Document ID (subtle footer info) */}
                {selectedCitation.documentId && (
                  <div className="pt-md border-t border-outline-variant/10">
                    <div className="flex items-center gap-xs text-label-md text-on-surface-variant/50">
                      <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                      <span className="truncate">ID: {selectedCitation.documentId}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer hint */}
          {selectedCitation && (
            <div className="px-lg py-sm border-t border-outline-variant/10 bg-surface-container-low shrink-0">
              <p className="text-[11px] text-on-surface-variant/50 flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">keyboard</span>
                Press ESC to close
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
