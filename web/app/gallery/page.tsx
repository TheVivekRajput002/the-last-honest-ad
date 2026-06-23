import { apiFetch, AdData } from '@/lib/api';
import GalleryClient from './GalleryClient';

export default async function GalleryPage() {
  let initialAds: AdData[] = [];
  try {
    const data = await apiFetch(`/gallery?page=1&limit=12`);
    if (data && data.data && data.data.items) {
      initialAds = data.data.items;
    }
  } catch (error) {
    console.error("Failed to fetch initial gallery ads", error);
  }

  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="max-w-6xl w-full">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight text-ink mb-4">
            Honest Gallery
          </h1>
          <p className="font-mono text-receipt-gray text-lg max-w-2xl">
            A growing collection of marketing illusions and the environmental reality behind them.
          </p>
        </header>

        <GalleryClient initialAds={initialAds} />
      </div>
    </div>
  );
}
