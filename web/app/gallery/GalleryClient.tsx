"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import useSWRInfinite from "swr/infinite";
import { AdData } from "@/lib/api";
import { motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function GalleryClient({ initialAds }: { initialAds: AdData[] }) {
  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.hasMore) return null;
      // URL to fetch
      return `${API_URL}/api/gallery?page=${pageIndex + 1}&limit=12`;
    },
    fetcher,
    {
      fallbackData: [{ data: initialAds, hasMore: initialAds.length === 12 }],
      revalidateFirstPage: false,
    }
  );

  const ads = data ? data.flatMap(page => page.data) : [];
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.hasMore === false);

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isReachingEnd && !isValidating) {
          setSize(size + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget.current, isReachingEnd, isValidating, setSize, size]);

  if (error) return <div className="text-center py-24 font-mono text-stamp-red">Failed to load ads</div>;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ads.map((ad: AdData) => (
          <Link 
            key={ad.id} 
            href={`/gallery/${ad.id}`}
            className="group flex flex-col bg-white border border-ink/10 shadow-overlay rounded-xl overflow-hidden transition-all duration-300"
          >
            <motion.div 
              whileHover={{ y: -4, scale: 1.02 }}
              className="flex flex-col h-full hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-shadow duration-300"
            >
              <div className="p-8 border-b border-ink/10 border-dashed bg-noise flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-paper/50 to-transparent pointer-events-none" />
                <span className="text-xs font-mono text-ad-coral uppercase tracking-widest mb-4 relative z-10">The Illusion</span>
                <h3 className="text-2xl font-display uppercase leading-tight line-clamp-3 relative z-10">
                  {ad.originalCopy}
                </h3>
              </div>
              <div className="p-6 bg-[#E8E2D2] flex justify-between items-center z-10">
                <div className="font-mono text-sm uppercase tracking-widest text-receipt-gray">
                  True Cost
                </div>
                <div className="font-mono text-xl font-bold text-stamp-red">
                  {ad.footprintSaved}kg CO₂e
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {isEmpty && (
        <div className="text-center py-24 font-mono text-receipt-gray">
          No honest ads found. Be the first to generate one!
        </div>
      )}

      <div ref={observerTarget} className="h-10 mt-8 flex justify-center items-center">
        {isValidating && !isReachingEnd && (
          <div className="font-mono text-sm text-receipt-gray animate-pulse uppercase tracking-widest">
            Loading more...
          </div>
        )}
        {isReachingEnd && !isEmpty && (
          <div className="font-mono text-sm text-receipt-gray uppercase tracking-widest pt-8">
            End of gallery
          </div>
        )}
      </div>
    </div>
  );
}
