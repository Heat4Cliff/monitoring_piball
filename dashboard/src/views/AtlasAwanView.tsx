import React from 'react';
import { Download, Cloud } from 'lucide-react';

export const AtlasAwanView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-blue-600 shrink-0" />
            Buku Atlas Awan BMKG
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Referensi resmi pengamatan jenis-jenis awan dan fenomena meteorologi yang penting dalam penerbangan dan pengamatan cuaca permukaan.
          </p>
        </div>
        
        <a 
          href="/Buku_Atlas_Awan.pdf" 
          download="Buku_Atlas_Awan_BMKG.pdf"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 w-fit shrink-0"
        >
          <Download className="w-4 h-4" />
          Unduh PDF
        </a>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-[22px] overflow-hidden shadow-sm h-[80vh] w-full flex flex-col">
        <iframe 
          src="/Buku_Atlas_Awan.pdf" 
          className="w-full h-full border-0 flex-1"
          title="Buku Atlas Awan"
        >
        </iframe>
      </div>
    </div>
  );
};
