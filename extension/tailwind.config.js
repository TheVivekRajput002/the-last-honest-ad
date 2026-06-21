/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper:        '#F2ECDC', // base background — aged receipt/catalog paper
        ink:          '#1C1B19', // primary text
        'ad-coral':   '#FF4F3F', // Ad-half CTA / accent — sale-tag red-coral
        'stamp-red':  '#B3261E', // Honest-half stamp ink — deeper, distinct from ad-coral
        'warning-amber': '#D98E04', // footprint numbers, warning-label tone
        'receipt-gray':  '#8A8578', // secondary text, dotted divider lines
      },
      fontFamily: {
        display: ['Archivo Black', 'sans-serif'], // Ad-half headlines — bold, condensed, punchy
        body:    ['Inter', 'sans-serif'],          // all UI/body text
        mono:    ['IBM Plex Mono', 'monospace'],   // Honest-half copy, stamp, footprint stats
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.025'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'stamp': '1px 1px 0px 0px #B3261E, 2px 2px 0px 0px rgba(28, 27, 25, 0.15)',
        'overlay': '0 20px 45px -10px rgba(28, 27, 25, 0.3)',
      }
    },
  },
  plugins: [],
}
