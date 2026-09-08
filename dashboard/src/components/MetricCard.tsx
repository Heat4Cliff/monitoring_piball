import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  badge?: string;
  color?: 'sky' | 'emerald' | 'amber' | 'indigo' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  badge,
  color = 'sky'
}) => {
  const colorMap = {
    sky: 'border-sky-200 bg-sky-50 text-sky-700 border',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 border',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 border',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 border',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 border',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>
      {(subtitle || badge) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {badge && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px]">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
