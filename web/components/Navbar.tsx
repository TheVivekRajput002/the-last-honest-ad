import Link from 'next/link';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export async function Navbar() {
  const { userId } = await auth();

  return (
    <header className="w-full border-b border-ink/10 bg-paper/80 backdrop-blur-md sticky top-0 z-50 flex justify-center">
      <div className="w-full max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 bg-ad-coral rounded flex items-center justify-center text-paper font-display text-xl leading-none group-hover:rotate-6 transition-transform">
            H
          </div>
          <span className="font-display uppercase tracking-wider text-xl text-ink">
            Honest Ad
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-mono text-sm uppercase tracking-widest text-receipt-gray">
          <Link href="/gallery" className="hover:text-ink transition-colors">
            Gallery
          </Link>
          <Link href="/leaderboard" className="hover:text-ink transition-colors">
            Leaderboard
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          {!userId ? (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-ink text-paper font-mono text-xs uppercase tracking-widest rounded hover:bg-ink/80 transition-colors">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <>
              <Link 
                href="/me" 
                className="px-4 py-2 border border-ink/20 text-ink font-mono text-xs uppercase tracking-widest rounded hover:border-ink/50 transition-colors hidden sm:block"
              >
                My Impact
              </Link>
              <UserButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
