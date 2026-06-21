

export default function Overlay() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="pointer-events-auto bg-paper text-ink p-8 border border-ink/10 rounded-xl shadow-overlay bg-noise">
        <p className="font-mono text-xs">Overlay Injected Placeholder</p>
      </div>
    </div>
  );
}
