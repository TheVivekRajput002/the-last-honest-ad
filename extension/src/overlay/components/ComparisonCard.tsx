

export default function ComparisonCard() {
  return (
    <div className="flex border border-ink/20 rounded shadow-overlay overflow-hidden w-full max-w-lg">
      <div className="flex-1 p-6 bg-white font-display text-lg text-ink">Ad Half</div>
      <div className="flex-1 p-6 bg-paper font-mono text-sm border-l border-dashed border-receipt-gray text-ink">Honest Half</div>
    </div>
  );
}
