"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AdData } from '@/lib/api';

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'fast-fashion', label: 'Fast Fashion' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'flights', label: 'Flights' },
  { id: 'fast-food', label: 'Fast Food' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'home-goods', label: 'Home Goods' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function LeaderboardClient({ ads, currentCategory }: { ads: AdData[], currentCategory: string }) {
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            href={`/leaderboard${cat.id ? `?category=${cat.id}` : ''}`}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-full border transition-all ${
              currentCategory === cat.id 
                ? 'bg-ink text-paper border-ink' 
                : 'bg-transparent text-receipt-gray border-ink/20 hover:border-ink/50'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {ads.map((ad, index) => (
          <motion.div key={ad.id} variants={itemVariants} layout>
            <Link 
              href={`/gallery/${ad.id}`}
              className="group flex flex-col md:flex-row items-center gap-6 p-6 bg-white border border-ink/10 shadow-sm rounded-xl hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-ad-coral to-stamp-red" />
              
              <div className="flex items-center justify-center w-12 h-12 bg-paper rounded-full border border-ink/10 shrink-0">
                <span className="font-display text-xl text-ink">#{index + 1}</span>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display uppercase text-xl mb-1 group-hover:text-ad-coral transition-colors line-clamp-1">
                  {ad.originalCopy}
                </h3>
                <p className="font-mono text-sm text-receipt-gray truncate max-w-[300px] md:max-w-md">
                  {ad.honestCopy}
                </p>
              </div>
              
              <div className="shrink-0 text-center md:text-right">
                <p className="font-mono text-xs uppercase text-receipt-gray tracking-widest mb-1">Impact</p>
                <p className="font-mono text-2xl font-bold text-stamp-red">
                  {ad.footprintSaved} <span className="text-base text-receipt-gray">kg CO₂</span>
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
        
        {ads.length === 0 && (
          <div className="text-center py-12 font-mono text-receipt-gray">
            No records found for this category yet.
          </div>
        )}
      </motion.div>
    </div>
  );
}
