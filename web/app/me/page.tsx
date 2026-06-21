import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { Leaf, History, Share2 } from 'lucide-react';

export default async function PersonalTrackerPage() {
  const { getToken, userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const response = await apiFetch('/users/me/history', {}, async () => getToken() as Promise<string>);
  
  // Handle both possible response shapes: { data: [...] } or { data: { history: [...], totalFootprintSaved: number, scansCount: number } }
  let history = [];
  let scansCount = 0;
  let totalFootprint = 0;

  if (response.data && !Array.isArray(response.data) && response.data.history) {
    history = response.data.history;
    scansCount = response.data.scansCount || history.length;
    totalFootprint = response.data.totalFootprintSaved || history.reduce((sum: number, ad: any) => sum + ad.footprintSaved, 0);
  } else {
    history = Array.isArray(response.data) ? response.data : [];
    scansCount = history.length;
    totalFootprint = history.reduce((sum: number, ad: any) => sum + ad.footprintSaved, 0);
  }

  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="max-w-4xl w-full">
        <header className="mb-12 border-b border-ink/10 pb-8">
          <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight text-ink mb-2">
            My Impact Tracker
          </h1>
          <p className="font-mono text-receipt-gray text-lg">
            Your personal record of marketing illusions exposed.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="p-8 bg-white border border-ink/10 shadow-overlay rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#E8E2D2] text-ink rounded-full flex items-center justify-center mb-4">
              <History size={28} />
            </div>
            <p className="font-mono uppercase tracking-widest text-receipt-gray text-sm mb-2">Total Scans</p>
            <p className="font-display text-5xl text-ink">{scansCount}</p>
          </div>

          <div className="p-8 bg-paper border border-ink/10 shadow-overlay rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden bg-noise">
            <div className="w-16 h-16 bg-stamp-red/10 text-stamp-red rounded-full flex items-center justify-center mb-4">
              <Leaf size={28} />
            </div>
            <p className="font-mono uppercase tracking-widest text-stamp-red text-sm mb-2">Total CO₂e Revealed</p>
            <p className="font-display text-5xl text-stamp-red">{totalFootprint.toFixed(1)} <span className="text-2xl">kg</span></p>
            <div className="absolute -bottom-10 -right-10 text-stamp-red/5">
              <Leaf size={160} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-mono text-receipt-gray uppercase tracking-widest mb-6">Recent History</h2>
          
          <div className="space-y-4">
            {history.map((ad: any) => (
              <div key={ad.id} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white border border-ink/10 shadow-sm rounded-xl">
                <div className="flex-1 w-full md:w-auto text-center md:text-left">
                  <h3 className="font-display uppercase text-xl mb-1 line-clamp-1">{ad.originalCopy}</h3>
                  <p className="font-mono text-sm text-receipt-gray truncate">{ad.honestCopy}</p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <p className="font-mono text-xs uppercase text-receipt-gray tracking-widest">Impact</p>
                    <p className="font-mono font-bold text-stamp-red">{ad.footprintSaved} kg CO₂</p>
                  </div>
                  
                  <Link 
                    href={`/gallery/${ad.id}`}
                    className="p-3 bg-ink/5 hover:bg-ink/10 text-ink rounded-full transition-colors"
                  >
                    <Share2 size={20} />
                  </Link>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="text-center py-12 border border-dashed border-ink/20 rounded-xl">
                <p className="font-mono text-receipt-gray">You haven't scanned any products yet.</p>
                <p className="font-mono text-xs text-receipt-gray mt-2">Use the Chrome extension to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
