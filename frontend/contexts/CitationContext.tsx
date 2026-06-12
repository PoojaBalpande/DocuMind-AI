'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Citation } from '@/types';

interface CitationContextValue {
  /** The currently displayed citation */
  selectedCitation: Citation | null;
  /** Index of the selected citation within availableCitations */
  selectedCitationIndex: number;
  /** All citations from the current message */
  availableCitations: Citation[];
  /** Whether the sidebar is visible */
  isSidebarOpen: boolean;
  /** Whether the PDF viewer is open inside the sidebar */
  isPdfOpen: boolean;
  /** Set the PDF viewer open state */
  setIsPdfOpen: (open: boolean) => void;
  /** Open sidebar with a citation; optionally pass the full citations array for navigation */
  openCitation: (citation: Citation, allCitations?: Citation[]) => void;
  /** Close the sidebar */
  closeCitation: () => void;
  /** Navigate to next citation */
  nextCitation: () => void;
  /** Navigate to previous citation */
  previousCitation: () => void;
  /** Navigate to a specific citation by index */
  selectCitation: (index: number) => void;
  /** Whether there is a next citation */
  hasNext: boolean;
  /** Whether there is a previous citation */
  hasPrevious: boolean;
}

const CitationContext = createContext<CitationContextValue | null>(null);

export function CitationProvider({ children }: { children: React.ReactNode }) {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [selectedCitationIndex, setSelectedCitationIndex] = useState(0);
  const [availableCitations, setAvailableCitations] = useState<Citation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openCitation = useCallback((citation: Citation, allCitations?: Citation[]) => {
    triggerRef.current = document.activeElement as HTMLElement | null;

    const citations = allCitations || [citation];
    const index = citations.findIndex((c) => c.id === citation.id);

    setAvailableCitations(citations);
    setSelectedCitation(citation);
    setSelectedCitationIndex(index >= 0 ? index : 0);
    setIsSidebarOpen(true);
  }, []);

  const closeCitation = useCallback(() => {
    setIsSidebarOpen(false);
    setIsPdfOpen(false);
    setTimeout(() => {
      triggerRef.current?.focus();
      triggerRef.current = null;
    }, 300);
  }, []);

  const nextCitation = useCallback(() => {
    setSelectedCitationIndex((prev) => {
      const next = prev + 1;
      if (next < availableCitations.length) {
        setSelectedCitation(availableCitations[next]);
        return next;
      }
      return prev;
    });
  }, [availableCitations]);

  const previousCitation = useCallback(() => {
    setSelectedCitationIndex((prev) => {
      const next = prev - 1;
      if (next >= 0) {
        setSelectedCitation(availableCitations[next]);
        return next;
      }
      return prev;
    });
  }, [availableCitations]);

  const selectCitation = useCallback((index: number) => {
    if (index >= 0 && index < availableCitations.length) {
      setSelectedCitation(availableCitations[index]);
      setSelectedCitationIndex(index);
    }
  }, [availableCitations]);

  const hasNext = selectedCitationIndex < availableCitations.length - 1;
  const hasPrevious = selectedCitationIndex > 0;

  return (
    <CitationContext.Provider
      value={{
        selectedCitation,
        selectedCitationIndex,
        availableCitations,
        isSidebarOpen,
        isPdfOpen,
        setIsPdfOpen,
        openCitation,
        closeCitation,
        nextCitation,
        previousCitation,
        selectCitation,
        hasNext,
        hasPrevious,
      }}
    >
      {children}
    </CitationContext.Provider>
  );
}

export function useCitation(): CitationContextValue {
  const context = useContext(CitationContext);
  if (!context) {
    throw new Error('useCitation must be used within a CitationProvider');
  }
  return context;
}
