'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { Document, Page, pdfjs } from 'react-pdf';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

// Optional default react-pdf CSS styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import type { Citation } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface PdfViewerModalProps {
  citation: Citation;
  onClose: () => void;
}

export default function PdfViewerModal({ citation, onClose }: PdfViewerModalProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(citation.pageNumber || 1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Authenticate and fetch PDF file from secure backend route
  useEffect(() => {
    if (!citation.documentId) {
      const timeout = setTimeout(() => {
        setError('No document ID associated with this citation.');
        setLoading(false);
      }, 0);
      return () => clearTimeout(timeout);
    }
    const token = authService.getToken();
    let createdUrl: string | null = null;
    fetch(`${API_BASE}/api/documents/${citation.documentId}/file`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load PDF file: ${res.statusText}`);
        }
        return res.blob();
      })
      .then((blob) => {
        createdUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(createdUrl);
        setLoading(false);
      })
      .catch((err) => {
        console.error('PDF fetch error:', err);
        setError(err.message || 'Failed to fetch PDF file securely.');
        setLoading(false);
      });

    return () => {
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [citation.documentId]);

  // Handle document loading callback
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    // Clip page number within document page boundaries
    if (citation.pageNumber && citation.pageNumber > numPages) {
      setPageNumber(numPages);
    } else {
      setPageNumber(citation.pageNumber || 1);
    }
  }

  // Keyboard navigation controls
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
      }
      if (e.key === 'ArrowLeft') {
        setPageNumber((prev) => Math.max(prev - 1, 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, onClose]);

  const handlePrev = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md">
      {/* Click outside backdrop triggers close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl h-[90vh] bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-2xl flex flex-col overflow-hidden text-on-surface">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-outline-variant/10 px-lg py-sm bg-surface-container-low">
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-secondary">picture_as_pdf</span>
            <span className="text-label-lg font-bold truncate max-w-[300px] sm:max-w-[400px]">
              {citation.documentTitle}
            </span>
          </div>

          {/* Navigation and Zoom Toolbar */}
          <div className="flex items-center gap-md">
            {/* Page Nav */}
            {!error && !loading && numPages && (
              <div className="flex items-center bg-surface-variant/30 rounded-xl px-xs py-xxs border border-outline-variant/10 text-body-sm">
                <button
                  onClick={handlePrev}
                  disabled={pageNumber <= 1}
                  className="p-xxs hover:text-primary disabled:opacity-30 disabled:hover:text-inherit transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">navigate_before</span>
                </button>
                <span className="px-sm font-semibold select-none">
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={pageNumber >= numPages}
                  className="p-xxs hover:text-primary disabled:opacity-30 disabled:hover:text-inherit transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">navigate_next</span>
                </button>
              </div>
            )}

            {/* Zoom */}
            {!error && !loading && (
              <div className="flex items-center bg-surface-variant/30 rounded-xl px-xs py-xxs border border-outline-variant/10 text-body-sm">
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.6}
                  className="p-xxs hover:text-primary disabled:opacity-30 disabled:hover:text-inherit transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_out</span>
                </button>
                <span className="px-sm font-semibold select-none w-14 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 2.0}
                  className="p-xxs hover:text-primary disabled:opacity-30 disabled:hover:text-inherit transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                </button>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-auto bg-surface-dim/30 p-lg flex justify-center items-start custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-md w-full">
              <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-body-sm text-on-surface-variant/80 font-semibold animate-pulse">Loading document context...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full gap-md text-center max-w-md mx-auto w-full">
              <span className="material-symbols-outlined text-[48px] text-error animate-bounce">error</span>
              <h4 className="text-headline-sm font-bold text-error">Could not serve file</h4>
              <p className="text-body-md text-on-surface-variant">{error}</p>
            </div>
          )}

          {!loading && !error && pdfBlobUrl && (
            <div className="shadow-lg bg-white p-xs border border-outline-variant/10 rounded-lg animate-fade-in">
              <Document
                file={pdfBlobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="p-md text-body-sm text-on-surface-variant font-semibold">
                    Rendering PDF structure...
                  </div>
                }
                error={
                  <div className="p-md text-body-sm text-error font-bold">
                    Error occurred while rendering document PDF.
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                  loading={
                    <div className="p-md text-body-xs text-on-surface-variant">
                      Preparing page elements...
                    </div>
                  }
                />
              </Document>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        {!error && !loading && (
          <div className="px-lg py-xs bg-surface-container-low border-t border-outline-variant/10 text-body-xs text-on-surface-variant/70 flex justify-between select-none">
            <span>Tip: Use Left/Right Arrow keys on your keyboard to navigate pages.</span>
            <span>Document ID: {citation.documentId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
