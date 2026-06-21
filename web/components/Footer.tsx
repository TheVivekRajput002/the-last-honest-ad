import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-ink/10 py-12 mt-auto bg-[#E8E2D2] flex justify-center">
      <div className="w-full max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="font-display uppercase tracking-wider text-xl text-ink">
            The Last Honest Ad
          </div>
          <p className="font-mono text-xs text-receipt-gray max-w-sm">
            Exposing the true environmental footprint of products on e-commerce sites, one honest receipt at a time.
          </p>
        </div>

        <nav className="flex gap-6 font-mono text-xs uppercase tracking-widest text-receipt-gray">
          <Link href="/gallery" className="hover:text-ink transition-colors">Gallery</Link>
          <Link href="/leaderboard" className="hover:text-ink transition-colors">Leaderboard</Link>
          <a href="#" className="hover:text-ink transition-colors">Chrome Extension</a>
        </nav>

        <div className="font-mono text-xs text-receipt-gray">
          © {new Date().getFullYear()} TLHA
        </div>
      </div>
    </footer>
  );
}
