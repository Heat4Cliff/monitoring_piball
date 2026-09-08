import React from 'react';
import { FileText, ShieldCheck } from 'lucide-react';

interface SourceBadgeProps {
  sourceFile: string;
  sourcePage?: number;
  station?: string;
  date?: string;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  sourceFile,
  sourcePage = 2,
  station = "Stamet Cilacap",
  date,
  className = ""
}) => {
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-700 ${className}`}>
      <FileText className="w-3.5 h-3.5 text-sky-600" />
      <span className="font-mono text-sky-700 font-medium">{sourceFile}</span>
      <span className="text-slate-400">|</span>
      <span>Hal {sourcePage}</span>
      {date && (
        <>
          <span className="text-slate-400">|</span>
          <span>{date}</span>
        </>
      )}
      <span title="Data terverifikasi langsung dari sumber PDF resmi">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-1" />
      </span>
    </div>
  );
};
