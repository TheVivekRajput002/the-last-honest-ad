const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}, getClerkToken?: () => Promise<string | null>) {
  const headers = new Headers(options.headers);

  if (getClerkToken) {
    const token = await getClerkToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...Object.fromEntries(headers.entries()),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data;
}

export interface AdData {
  id: string;
  originalCopy: string;
  honestCopy: string;
  categoryId: string;
  footprintSaved: number; // For backward compatibility if used directly
  co2eKg: number;
  waterLiters: number;
  wasteKg: number;
  analysis?: {
    honestAd: string;
    impactAnalysis: string;
    badEffects: string;
    hiddenProblems: string;
    ecoAlternative?: string;
  };
  format: 'CARD' | 'RECEIPT';
  createdAt: string;
  userId?: string;
  scansCount?: number;
}
