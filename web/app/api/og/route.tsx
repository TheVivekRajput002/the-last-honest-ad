import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Missing ID', { status: 400 });
    }

    // Fetch ad data
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${baseUrl}/ads/${id}`);
    const data = await res.json();
    const ad = data.data;

    if (!ad) {
      return new Response('Ad not found', { status: 404 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F2ECDC',
            padding: '40px',
          }}
        >
          <div style={{ display: 'flex', border: '1px solid #1C1B19', width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden' }}>
            {/* Ad Half */}
            <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRight: '2px dashed #1C1B19' }}>
              <div style={{ background: '#1C1B19', color: '#F2ECDC', padding: '8px 16px', borderRadius: '99px', fontSize: '14px', textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 'auto' }}>
                The Illusion
              </div>
              <h2 style={{ fontSize: '48px', color: '#FF4F3F', textTransform: 'uppercase', textAlign: 'center' }}>
                {ad.originalCopy.substring(0, 80) + (ad.originalCopy.length > 80 ? '...' : '')}
              </h2>
              <div style={{ marginTop: 'auto' }}></div>
            </div>

            {/* Honest Half */}
            <div style={{ flex: 1, padding: '40px', background: '#E8E2D2', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ border: '1px solid #8A8578', color: '#8A8578', padding: '8px 16px', borderRadius: '99px', fontSize: '14px', textTransform: 'uppercase', alignSelf: 'flex-end', marginBottom: 'auto' }}>
                The Reality
              </div>
              <p style={{ fontSize: '24px', color: '#1C1B19', textAlign: 'center', marginBottom: '40px' }}>
                {ad.honestCopy.substring(0, 150) + (ad.honestCopy.length > 150 ? '...' : '')}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '4px solid #B3261E', color: '#B3261E', padding: '24px', borderRadius: '16px', marginTop: 'auto' }}>
                <p style={{ fontSize: '24px', textTransform: 'uppercase', margin: 0 }}>True Cost</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{ad.footprintSaved}kg CO2e</p>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
