import React from 'react';
import { Compass } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading your travel plan...' }) {
  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 p-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
        <Compass className="w-6 h-6 text-sky-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}
