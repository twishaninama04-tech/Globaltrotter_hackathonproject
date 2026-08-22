import React from 'react';
import { Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm py-10 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-white font-bold text-lg">GlobeTrotter</span>
            <span className="text-xs text-slate-500 font-medium ml-2">Plan Less. Explore More.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs">
            <a href="#destinations" className="hover:text-white transition-colors">Popular Destinations</a>
            <a href="#itineraries" className="hover:text-white transition-colors">Multi-City Itineraries</a>
            <a href="#budget" className="hover:text-white transition-colors">Budget Calculator</a>
            <a href="#sharing" className="hover:text-white transition-colors">Trip Sharing</a>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Hackathon 2026 © GlobeTrotter Inc.
          </div>
        </div>
      </div>
    </footer>
  );
}
