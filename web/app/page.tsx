import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";
import { apiFetch, AdData } from "@/lib/api";

export const revalidate = 60; // ISR revalidation

export default async function Home() {
  let recentAds: AdData[] = [];
  try {
    const data = await apiFetch('/gallery?limit=3');
    if (data && data.data) {
      recentAds = data.data;
    }
  } catch (error) {
    console.error("Failed to fetch recent ads", error);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6">
      <div className="max-w-6xl w-full flex flex-col items-center text-center space-y-8 mt-12">
        <div className="inline-block px-4 py-1.5 bg-ink text-paper font-mono text-xs uppercase tracking-widest rounded-full mb-4">
          Chrome Extension MVP
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display uppercase tracking-tight text-ink leading-[1.1]">
          See the <span className="text-ad-coral inline-block transform -rotate-2">Real Cost</span> of
          <br /> What You Buy.
        </h1>
        
        <p className="font-mono text-receipt-gray text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          The Last Honest Ad cuts through the marketing fluff to expose the true environmental footprint of products on your favorite e-commerce sites.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <a 
            href="https://chromewebstore.google.com/" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-4 bg-ad-coral text-white font-display uppercase tracking-wider text-lg rounded hover:bg-ad-coral/90 transition-all shadow-stamp transform hover:-translate-y-1"
          >
            <Download size={24} />
            Install Extension
          </a>
          
          <Link 
            href="/gallery"
            className="flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-ink text-ink font-display uppercase tracking-wider text-lg rounded hover:bg-ink/5 transition-all"
          >
            View Gallery
            <ArrowRight size={24} />
          </Link>
        </div>

        {/* Hero Image Optimization */}
        <div className="w-full max-w-4xl mt-16 relative aspect-video rounded-xl overflow-hidden border-2 border-ink/10 shadow-overlay group">
          <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent z-10 pointer-events-none" />
          <Image
            src="https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?q=80&w=2071&auto=format&fit=crop"
            alt="The Last Honest Ad Extension Demo"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center">
             <div className="bg-paper/90 backdrop-blur px-6 py-4 rounded shadow-stamp border border-ink/10 text-center transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
               <p className="font-display uppercase text-ink text-xl">Sneakers that cost the earth</p>
               <p className="font-mono text-stamp-red font-bold mt-2">12.5 kg CO₂e</p>
             </div>
          </div>
        </div>

        <div className="pt-24 pb-12 border-t border-ink/10 mt-24 w-full">
          <h2 className="text-2xl font-mono text-receipt-gray uppercase tracking-widest mb-12 text-center">Recently Uncovered</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentAds.length > 0 ? (
              recentAds.map((ad) => (
                <Link 
                  key={ad.id} 
                  href={`/gallery/${ad.id}`}
                  className="bg-white border border-ink/10 shadow-overlay flex flex-col items-center justify-center p-6 bg-noise relative overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="p-4 border-b border-ink/10 border-dashed w-full flex-1 flex flex-col justify-center items-center text-center">
                    <span className="text-xs font-mono text-ad-coral uppercase tracking-widest mb-2">The Illusion</span>
                    <h3 className="text-lg font-display uppercase leading-tight line-clamp-3">
                      {ad.originalCopy}
                    </h3>
                  </div>
                  <div className="p-4 w-full bg-[#E8E2D2] flex justify-between items-center">
                    <div className="font-mono text-xs uppercase tracking-widest text-receipt-gray">
                      True Cost
                    </div>
                    <div className="font-mono text-lg font-bold text-stamp-red">
                      {ad.footprintSaved}kg CO₂e
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-white border border-ink/10 shadow-overlay flex flex-col items-center justify-center p-6 bg-noise relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-paper/80 to-transparent z-10" />
                  <div className="relative z-20 transform group-hover:scale-105 transition-transform duration-500">
                    <div className="w-16 h-16 bg-ad-coral/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="font-display text-ad-coral text-2xl">?</span>
                    </div>
                    <p className="font-mono text-sm text-ink opacity-50 text-center">Loading preview...</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
