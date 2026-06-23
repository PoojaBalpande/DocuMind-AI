'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDocumentStore } from '@/stores/documentStore';
import Footer from '@/components/layout/Footer';

export default function DocumentsPage() {
  const { filteredDocuments, searchQuery, filterStatus, isUploading, setSearchQuery, setFilterStatus, uploadDocument, deleteDocument, initDocuments } = useDocumentStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    initDocuments();
  }, [initDocuments]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => uploadDocument(file));
  }, [uploadDocument]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => uploadDocument(file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    return `${(bytes / 1_000).toFixed(0)} KB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const fileTypeIcons: Record<string, string> = { pdf: 'picture_as_pdf', docx: 'description', txt: 'article', md: 'code' };
  const fileTypeColors: Record<string, string> = { pdf: 'text-error', docx: 'text-secondary', txt: 'text-on-surface-variant', md: 'text-primary' };
  const statusColors: Record<string, string> = { ready: 'bg-green-500', processing: 'bg-amber-500 animate-pulse', error: 'bg-error', archived: 'bg-outline' };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex-1 p-lg md:p-xl space-y-xl max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <div>
            <h1 className="text-headline-lg text-primary mb-xs" style={{ fontFamily: 'Inter', fontWeight: 700 }}>Knowledge Base</h1>
            <p className="text-body-md text-on-surface-variant">Manage your documents and data sources.</p>
          </div>
          <label className="primary-gradient text-on-primary px-lg py-sm rounded-xl font-semibold flex items-center gap-sm cursor-pointer hover:shadow-lg transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Upload Document
            <input type="file" className="hidden" multiple accept=".pdf,.docx,.txt,.md" onChange={handleFileSelect} />
          </label>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragOver(false)}
          className={`border-2 border-dashed rounded-2xl p-xxl text-center transition-all duration-300 ${isDragOver ? 'border-secondary bg-secondary/5 scale-[1.01]' : 'border-outline-variant/40 hover:border-secondary/40'
            }`}
        >
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-md block">cloud_upload</span>
          <p className="text-body-md text-on-surface-variant mb-xs">
            {isDragOver ? 'Drop files here...' : 'Drag & drop documents here, or click Upload above'}
          </p>
          <p className="text-label-md text-on-surface-variant/60">Supports only PDF — Max 50 MB per file</p>
          {isUploading && (
            <div className="mt-md flex items-center justify-center gap-sm text-secondary">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="text-label-lg font-semibold">Processing...</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full py-sm pl-xl pr-md text-body-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-sm">
            <div className="flex gap-xs bg-surface-container-low rounded-lg p-xs border border-outline-variant/20">
              {['all', 'ready', 'processing', 'archived'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-md py-xs rounded-md text-label-lg font-semibold capitalize transition-all ${filterStatus === status ? 'bg-primary-container text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant/30'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="flex gap-xs border border-outline-variant/20 rounded-lg p-xs">
              <button onClick={() => setViewMode('list')} className={`p-xs rounded-md ${viewMode === 'list' ? 'bg-surface-dim' : ''}`}>
                <span className="material-symbols-outlined text-[18px]">view_list</span>
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-xs rounded-md ${viewMode === 'grid' ? 'bg-surface-dim' : ''}`}>
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
            </div>
          </div>
        </div>

        {/* Document List / Grid */}
        {viewMode === 'list' ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                  <th className="text-left py-md px-lg text-body-sm text-on-surface-variant font-semibold">Document</th>
                  <th className="text-left py-md px-lg text-body-sm text-on-surface-variant font-semibold hidden md:table-cell">Type</th>
                  <th className="text-left py-md px-lg text-body-sm text-on-surface-variant font-semibold hidden md:table-cell">Size</th>
                  <th className="text-left py-md px-lg text-body-sm text-on-surface-variant font-semibold">Status</th>
                  <th className="text-left py-md px-lg text-body-sm text-on-surface-variant font-semibold hidden lg:table-cell">Date</th>
                  <th className="text-left py-md px-lg text-body-sm text-on-surface-variant font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-lg px-lg">
                      <div className="flex items-center gap-md">
                        <span className={`material-symbols-outlined ${fileTypeColors[doc.fileType] || 'text-on-surface-variant'}`}>{fileTypeIcons[doc.fileType] || 'description'}</span>
                        <div>
                          <p className="text-body-sm text-primary font-semibold">{doc.title}</p>
                          <p className="text-label-md text-on-surface-variant">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-lg px-lg hidden md:table-cell">
                      <span className="text-label-lg text-on-surface-variant uppercase font-semibold">{doc.fileType}</span>
                    </td>
                    <td className="py-lg px-lg text-body-sm text-on-surface-variant hidden md:table-cell">{formatFileSize(doc.fileSizeBytes)}</td>
                    <td className="py-lg px-lg">
                      <div className="flex items-center gap-xs">
                        <span className={`w-2 h-2 rounded-full ${statusColors[doc.status]}`}></span>
                        <span className="text-body-sm text-on-surface-variant capitalize">{doc.status}</span>
                      </div>
                    </td>
                    <td className="py-lg px-lg text-body-sm text-on-surface-variant hidden lg:table-cell">{formatDate(doc.createdAt)}</td>
                    <td className="py-lg px-lg">
                      <div className="flex gap-xs">
                        <a href={`/chat?documentId=${doc.id}`} className="text-on-surface-variant hover:text-secondary transition-colors" title="Chat with document">
                          <span className="material-symbols-outlined text-[18px]">forum</span>
                        </a>
                        <button onClick={() => deleteDocument(doc.id)} className="text-on-surface-variant hover:text-error transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDocuments.length === 0 && (
              <div className="py-xxl text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px] opacity-30 block mb-md">folder_off</span>
                <p className="text-body-md">No documents found. Upload your first document above.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-lg hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-md">
                  <span className={`material-symbols-outlined text-[32px] ${fileTypeColors[doc.fileType]}`}>{fileTypeIcons[doc.fileType]}</span>
                  <div className="flex items-center gap-xs">
                    <span className={`w-2 h-2 rounded-full ${statusColors[doc.status]}`}></span>
                    <span className="text-label-md text-on-surface-variant capitalize">{doc.status}</span>
                  </div>
                </div>
                <h3 className="text-body-md text-primary font-semibold mb-xs truncate">{doc.title}</h3>
                <p className="text-label-md text-on-surface-variant mb-md">{formatFileSize(doc.fileSizeBytes)} • {doc.pageCount || '?'} pages • {doc.chunkCount} chunks</p>
                <div className="flex flex-wrap gap-xs mb-md">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="bg-surface-container px-sm py-0.5 rounded-full text-[10px] font-semibold text-on-surface-variant border border-outline-variant/20">{tag}</span>
                  ))}
                </div>
                <div className="flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={`/chat?documentId=${doc.id}`} className="flex-1 bg-secondary/10 text-secondary py-xs rounded-lg text-label-lg font-semibold hover:bg-secondary/20 transition-colors flex items-center justify-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">forum</span>Chat
                  </a>
                  <button onClick={() => deleteDocument(doc.id)} className="bg-error/10 text-error py-xs px-md rounded-lg hover:bg-error/20 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
