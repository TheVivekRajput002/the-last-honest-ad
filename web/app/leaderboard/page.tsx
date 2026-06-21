import { apiFetch, AdData } from '@/lib/api';
import LeaderboardClient from './LeaderboardClient';

export const metadata = {
  title: 'Leaderboard | The Last Honest Ad',
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const category = searchParams.category || '';
  const data = await apiFetch(`/leaderboard?category=${category}`);
  const topAds: AdData[] = data.data || [];

  return (
    <div className="flex flex-col items-center py-12 px-6">
      <div className="max-w-4xl w-full">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight text-ink mb-4">
            The Wall of Shame
          </h1>
          <p className="font-mono text-receipt-gray text-lg max-w-2xl mx-auto">
            The products with the highest true environmental footprint, uncovered by our users.
          </p>
        </header>

        <LeaderboardClient ads={topAds} currentCategory={category} />
      </div>
    </div>
  );
}
