import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

interface DataUploadViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DataUploadView: React.FC<DataUploadViewProps> = ({ onNavigateTab }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setStatus('parsing');
    
    // Simulate OCR and parsing process
    setTimeout(() => {
      setStatus('success');
    }, 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
            <UploadCloud className="w-8 h-8 text-blue-100" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Unggah Data Pengamatan Baru</h2>
            <p className="text-blue-100/80 text-sm max-w-2xl leading-relaxed">
              Tambahkan file laporan PiBal (.pdf) dari BMKG. Sistem akan secara otomatis membaca tabel, mengekstrak arah & kecepatan angin, menghitung komponen U/V, dan memasukkannya ke antrian *database* lokal untuk keperluan monitoring operasional.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tarik & Lepas File PDF PiBal</h3>
            <p className="text-slate-500 text-sm mb-6">atau klik tombol di bawah untuk memilih file secara manual.</p>
            <label className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md cursor-pointer transition-all inline-block">
              Pilih File PDF
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                    setStatus('idle');
                  }
                }}
              />
            </label>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {status === 'idle' && (
              <div className="text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{file.name}</h3>
                <p className="text-sm text-slate-500 mb-8">{(file.size / 1024).toFixed(1)} KB</p>
                
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setFile(null)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleUpload}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    Proses Data Sekarang <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {status === 'parsing' && (
              <div className="text-center w-full max-w-md animate-in fade-in duration-300">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Sedang Mengekstrak Data...</h3>
                <p className="text-sm text-slate-500 mb-6">Membaca format tabel PDF dan menghitung komponen Vektor Angin (U/V).</p>
                
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full animate-[progress_3.5s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
                </div>
                <style>{`
                  @keyframes progress {
                    0% { width: 0%; }
                    30% { width: 45%; }
                    70% { width: 80%; }
                    100% { width: 100%; }
                  }
                `}</style>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Data Berhasil Diproses!</h3>
                <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                  Tabel PDF berhasil diekstrak. Data telah ditambahkan ke antrean *database* lokal dan siap untuk dianalisis di dashboard.
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => { setFile(null); setStatus('idle'); }}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                  >
                    Unggah File Lain
                  </button>
                  <button 
                    onClick={() => onNavigateTab('overview')}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    Lihat di Dashboard <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
