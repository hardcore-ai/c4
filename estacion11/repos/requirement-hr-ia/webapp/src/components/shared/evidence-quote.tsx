interface EvidenceQuoteProps {
  quote: string;
  relevance: string;
}

export function EvidenceQuote({ quote, relevance }: EvidenceQuoteProps) {
  return (
    <div className="border-l-4 border-blue-300 pl-3 py-1" data-testid="evidence-quote">
      <blockquote className="text-sm text-gray-700 italic">&quot;{quote}&quot;</blockquote>
      <p className="text-xs text-gray-500 mt-1">{relevance}</p>
    </div>
  );
}
