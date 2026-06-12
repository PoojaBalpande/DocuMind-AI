'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { Document, Page, pdfjs } from 'react-pdf';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface PdfViewerProps {
  documentId: string;
  initialPageNumber: number;
  documentTitle: string;
  onClose?: () => void;
}

export default function PdfViewer({
  documentId,
  initialPageNumber,
  documentTitle,
  onClose,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPageNumber || 1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Authenticate and fetch PDF file from secure backend route
  useEffect(() => {
    if (!documentId) {
      setError('No document ID associated with this citation.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setPdfBlobUrl(null);
    setNumPages(null);

    const token = authService.getToken();
    let createdUrl: string | null = null;

    fetch(`${API_BASE}/api/documents/${documentId}/file`, {
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
  }, [documentId]);

  // Synchronize with initialPageNumber changes (e.g. when changing citations)
  useEffect(() => {
    if (initialPageNumber) {
      setPageNumber((prev) => {
        if (numPages && initialPageNumber > numPages) {
          return numPages;
        }
        return initialPageNumber;
      });
    }
  }, [initialPageNumber, numPages]);

  // Keyboard navigation page controls (only runs when loaded)
  useEffect(() => {
    if (loading || error || !pdfBlobUrl) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') {
        setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
      }
      if (e.key === 'ArrowLeft') {
        setPageNumber((prev) => Math.max(prev - 1, 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, loading, error, pdfBlobUrl]);

  // Handle document loading callback
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    if (initialPageNumber && initialPageNumber > numPages) {
      setPageNumber(numPages);
    } else {
      setPageNumber(initialPageNumber || 1);
    }
  }

  const handlePrev = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setPageNumber((prev) => (numPages ? Math.min(prev + 1, numPages) : prev));
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-on-surface bg-surface-container-lowest">
      {/* PDF Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-sm border-b border-outline-variant/10 px-md py-sm bg-surface-container-low shrink-0 select-none">
        <div className="flex items-center gap-xs min-w-0 flex-1">
          <span className="material-symbols-outlined text-error text-[18px] shrink-0">picture_as_pdf</span>
          <span className="text-body-sm font-bold truncate max-w-[200px] sm:max-w-[300px]" title={documentTitle}>
            {documentTitle}
          </span>
        </div>

        {/* Zoom and Page controls */}
        {!error && !loading && (
          <div className="flex items-center gap-sm shrink-0">
            {/* Page navigation indicator */}
            {numPages && (
              <div className="flex items-center bg-surface-variant/30 rounded-xl px-xs py-xxs border border-outline-variant/10 text-body-xs font-semibold">
                <button
                  onClick={handlePrev}
                  disabled={pageNumber <= 1}
                  className="p-xxs hover:text-primary disabled:opacity-30 disabled:hover:text-inherit transition-colors cursor-pointer"
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined text-[16px]">navigate_before</span>
                </button>
                <span className="px-xs select-none">
                  {pageNumber} / {numPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={numPages ? pageNumber >= numPages : true}
                  className="p-xxs hover:text-primary disabled:opacity-30 disabled:hover:text-inherit transition-colors cursor-pointer"
                  aria-label="Next page"
                >
                  <span className="material-symbols-outlined text-[16px]">navigate_next</span>
                </button>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center bg-surface-variant/30 rounded-xl px-xs py-xxs border border-outline-variant/10 text-body-xs font-semibold">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.6}
                className="p-xxs hover:text-primary disabled:opacity-30 disabled:hover:text-inherit transition-colors cursor-pointer"
                aria-label="Zoom out"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_out</span>
              </button>
              <span className="px-xs select-none w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 2.0}
                className="p-xxs hover:text-primary disabled:opacity-30 disabled:hover:text-inherit transition-colors cursor-pointer"
                aria-label="Zoom in"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_in</span>
              </button>
            </div>
          </div>
        )}

        {/* Close/Collapse action */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-xs text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all shrink-0 cursor-pointer"
            aria-label="Collapse PDF view"
          >
            <span className="material-symbols-outlined text-[18px]">close_fullscreen</span>
          </button>
        )}
      </div>

      {/* PDF Viewport Scroll Area */}
      <div className="flex-1 overflow-auto bg-surface-dim/30 p-md flex justify-center items-start custom-scrollbar">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-md w-full py-xl">
            <div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[12px] text-on-surface-variant/80 font-semibold animate-pulse">Loading document PDF...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-sm text-center max-w-xs mx-auto w-full py-xl">
            <span className="material-symbols-outlined text-[36px] text-error">error</span>
            <h4 className="text-body-md font-bold text-error">Unable to load PDF</h4>
            <p className="text-body-xs text-on-surface-variant">{error}</p>
          </div>
        )}

        {!loading && !error && pdfBlobUrl && (
          <div className="shadow-lg bg-white p-xxs border border-outline-variant/10 rounded-lg animate-fade-in origin-top">
            <Document
              file={pdfBlobUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="p-sm text-body-xs text-on-surface-variant font-semibold">
                  Loading PDF structure...
                </div>
              }
              error={
                <div className="p-sm text-body-xs text-error font-bold">
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
                  <div className="p-sm text-body-xs text-on-surface-variant">
                    Preparing page elements...
                  </div>
                }
              />
            </Document>
          </div>
        )}
      </div>

      {/* Footer Info / Tip bar */}
      {!error && !loading && (
        <div className="px-md py-xs bg-surface-container-low border-t border-outline-variant/10 text-[10px] text-on-surface-variant/70 flex justify-between select-none shrink-0">
          <span>Tip: Use Left/Right Arrow keys to navigate pages.</span>
          <span className="font-mono">Doc ID: {documentId.slice(-6).toUpperCase()}</span>
        </div>
      )}
    </div>
  );
}
