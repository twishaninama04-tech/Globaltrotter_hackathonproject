import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export default function AlertBadge({ type = 'warning', title, message }) {
  const styles = {
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
    },
    danger: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
    },
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: <Info className="w-5 h-5 text-sky-600 flex-shrink-0" />
    }
  };

  const current = styles[type] || styles.info;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${current.bg} shadow-sm my-2`}>
      {current.icon}
      <div>
        {title && <h4 className="text-sm font-bold leading-none mb-1">{title}</h4>}
        <p className="text-xs font-medium opacity-90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
