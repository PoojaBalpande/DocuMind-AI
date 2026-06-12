'use client';

import type { Citation } from '@/types';
import PdfViewer from './PdfViewer';

interface PdfViewerModalProps {
  citation: Citation;
  onClose: () => void;
}

export default function PdfViewerModal({ citation, onClose }: PdfViewerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md">
      {/* Click outside backdrop triggers close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl h-[90vh] bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-2xl flex flex-col overflow-hidden text-on-surface animate-fade-in">
        <PdfViewer
          documentId={citation.documentId || ''}
          initialPageNumber={citation.pageNumber || 1}
          documentTitle={citation.documentTitle || 'Document'}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
