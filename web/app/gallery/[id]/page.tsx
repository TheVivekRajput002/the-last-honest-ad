import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { apiFetch, AdData } from '@/lib/api';
import { ComparisonCard } from '@/components/ComparisonCard';
import { HonestReceipt } from '@/components/HonestReceipt';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // We can fetch data here to set dynamic title and OG image, but for MVP we'll just set OG image
  const ogUrl = `/api/og?id=${params.id}`;
  
  return {
    title: 'The Last Honest Ad - Gallery Item',
    openGraph: {
      images: [ogUrl],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogUrl],
    },
  };
}

export default async function GalleryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let ad: AdData | null = null;
  let error = null;

  try {
    const data = await apiFetch(`/ads/${params.id}`);
    if (data.success && data.data) {
      ad = data.data;
    } else {
      error = 'Ad not found';
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch ad';
  }

  if (error || !ad) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <h1 className="text-3xl font-display text-stamp-red mb-4">Not Found</h1>
        <p className="font-mono text-receipt-gray mb-8">{error}</p>
        <Link href="/gallery" className="text-ink hover:underline font-mono uppercase text-sm">
          Return to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12 px-6 min-h-[calc(100vh-140px)]">
      <div className="max-w-6xl w-full">
        <div className="mb-8">
          <Link href="/gallery" className="inline-flex items-center gap-2 text-ink/60 hover:text-ink transition-colors font-mono uppercase text-xs tracking-widest">
            <ArrowLeft size={16} />
            Back to Gallery
          </Link>
        </div>

        <div className="flex flex-col items-center w-full">
          {ad.format === 'RECEIPT' ? (
            <HonestReceipt ad={ad} />
          ) : (
            <ComparisonCard ad={ad} />
          )}
        </div>
      </div>
    </div>
  );
}
