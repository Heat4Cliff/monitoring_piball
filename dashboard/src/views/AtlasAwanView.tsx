import React, { useState } from 'react';
import { Download, Cloud, Layers, CloudRain, Sun, Info } from 'lucide-react';

export const AtlasAwanView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CL' | 'CM' | 'CH'>('CL');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[22px] border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Cloud className="w-6 h-6 text-blue-600 shrink-0" />
            Buku Atlas Awan BMKG & Panduan Klasifikasi
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1.5 max-w-2xl">
            Materi pendamping untuk memahami kode-kode awan WMO (World Meteorological Organization) yang digunakan dalam pengamatan cuaca permukaan dan observasi PiBal.
          </p>
        </div>
        
        <a 
          href="/Buku_Atlas_Awan.pdf" 
          download="Buku_Atlas_Awan_BMKG.pdf"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 w-fit shrink-0"
        >
          <Download className="w-4 h-4" />
          Unduh PDF Asli
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Explanation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-[22px] border border-slate-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Klasifikasi Awan (WMO)
            </h3>
            
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-5">
              <button 
                onClick={() => setActiveTab('CL')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'CL' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                C<sub>L</sub> (Rendah)
              </button>
              <button 
                onClick={() => setActiveTab('CM')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'CM' ? 'bg-white shadow-sm text-amber-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                C<sub>M</sub> (Menengah)
              </button>
              <button 
                onClick={() => setActiveTab('CH')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'CH' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                C<sub>H</sub> (Tinggi)
              </button>
            </div>

            {/* Tab Content */}
            <div className="space-y-3 h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {activeTab === 'CL' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="mb-4 bg-blue-50 border border-blue-100 p-3 rounded-xl">
                    <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5 mb-1"><Layers className="w-3.5 h-3.5"/> Awan Rendah (Low Clouds)</h4>
                    <p className="text-[11px] text-blue-600/80">Ketinggian dasar awan: Permukaan - 2.000 m (6.500 ft).</p>
                  </div>
                  
                  <CloudCard code="CL = 1" name="Cumulus humilis / fractocumulus" desc="Awan Cumulus kecil dengan dasar yang datar dan puncak membulat tipis, biasanya menandakan cuaca cerah (fair weather)." />
                  <CloudCard code="CL = 2" name="Cumulus mediocris / congestus" desc="Awan Cumulus yang tumbuh membesar secara vertikal, menyerupai kembang kol. Belum ada presipitasi yang jatuh." />
                  <CloudCard code="CL = 3" name="Cumulonimbus calvus" desc="Awan Cumulonimbus tanpa landasan (anvil) di puncaknya. Memiliki potensi hujan badai, petir, dan wind shear vertikal yang membahayakan penerbangan." />
                  <CloudCard code="CL = 4" name="Stratocumulus (dari Cumulus)" desc="Awan Stratocumulus yang terbentuk dari bentangan atau perluasan awan Cumulus yang mulai mendatar." />
                  <CloudCard code="CL = 5" name="Stratocumulus" desc="Awan Stratocumulus biasa (tidak terbentuk dari Cumulus). Terlihat seperti gumpalan abu-abu bergulung di langit." />
                  <CloudCard code="CL = 6" name="Stratus" desc="Awan Stratus berlapis abu-abu yang seragam. Bisa menghasilkan gerimis (drizzle) ringan atau kabut." />
                  <CloudCard code="CL = 7" name="Fractostratus / Fractocumulus" desc="Awan pecahan (scud clouds) yang menyertai cuaca buruk (bad cuaca), biasanya muncul di bawah Altostratus (As) atau Nimbostratus (Ns)." />
                  <CloudCard code="CL = 8" name="Cumulus dan Stratocumulus" desc="Awan Cumulus dan Stratocumulus yang terjadi bersamaan, namun dengan tingkat ketinggian dasar yang berlainan." />
                  <CloudCard code="CL = 9" name="Cumulonimbus capillatus" desc="Awan Cumulonimbus dengan bagian atas berserat atau menyerupai landasan (anvil). Sering memicu cuaca sangat ekstrem, turbulensi hebat, dan microburst." />
                </div>
              )}

              {activeTab === 'CM' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="mb-4 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                    <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-1"><CloudRain className="w-3.5 h-3.5"/> Awan Menengah (Medium Clouds)</h4>
                    <p className="text-[11px] text-amber-700/80">Ketinggian dasar awan: 2.000 m - 7.000 m (6.500 - 23.000 ft).</p>
                  </div>
                  
                  <CloudCard code="CM = 1" name="Altostratus tipis (translucidus)" desc="Lembaran tipis abu-abu/kebiruan. Matahari masih dapat terlihat samar seperti melalui kaca buram." />
                  <CloudCard code="CM = 2" name="Altostratus tebal / Nimbostratus" desc="Lapisan awan abu-abu gelap merata yang cukup tebal menutupi matahari sepenuhnya. Sering membawa hujan persisten." />
                  <CloudCard code="CM = 3" name="Altocumulus tipis tunggal" desc="Awan Altocumulus tipis dalam satu lapisan (translucidus). Berupa gumpalan atau gulungan seperti bulu domba." />
                  <CloudCard code="CM = 4" name="Altocumulus lenticularis" desc="Altocumulus berbentuk lensa (terpisah-pisah). Sering terbentuk karena gelombang orografik pegunungan. Indikator turbulensi." />
                  <CloudCard code="CM = 5" name="Altocumulus tebal" desc="Altocumulus tipis berbentuk pias-pias satu atau beberapa lapisan, atau Altocumulus yang kian menebal." />
                  <CloudCard code="CM = 6" name="Altocumulus cumulogenitus" desc="Altocumulus yang terbentuk dari penyebaran awan Cumulus atau Cumulonimbus." />
                  <CloudCard code="CM = 7" name="Altocumulus + Altostratus" desc="Altocumulus ganda (dua lapisan) bersamaan dengan Altostratus atau Nimbostratus." />
                  <CloudCard code="CM = 8" name="Altocumulus castellanus" desc="Altocumulus dengan tonjolan-tonjolan seperti menara (castellatus) atau berkas kecil." />
                  <CloudCard code="CM = 9" name="Altocumulus floccus" desc="Awan Altocumulus pada berbagai lapisan, kelihatan tidak teratur." />
                </div>
              )}

              {activeTab === 'CH' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-800 flex items-center gap-1.5 mb-1"><Sun className="w-3.5 h-3.5"/> Awan Tinggi (High Clouds)</h4>
                    <p className="text-[11px] text-indigo-700/80">Ketinggian dasar awan: &gt; 5.000 m (16.500 ft). Didominasi kristal es.</p>
                  </div>
                  
                  <CloudCard code="CH = 1" name="Cirrus fibratus" desc="Cirrus halus seperti bulu ayam/serat putih. Terpisah-pisah dan tidak bertambah tebal." />
                  <CloudCard code="CH = 2" name="Cirrus spissatus (tebal)" desc="Cirrus padat terpisah-pisah, atau sisa landasan (anvil) Cumulonimbus." />
                  <CloudCard code="CH = 3" name="Cirrus spissatus cumulonimbogenitus" desc="Cirrus padat yang terbukti berasal atau terjadi dari landasan Cumulonimbus (Cb)." />
                  <CloudCard code="CH = 4" name="Cirrus uncinus" desc="Cirrus halus berbentuk koma atau kail (bulu ayam), makin padat dan bertambah di langit." />
                  <CloudCard code="CH = 5" name="Cirrus & Cirrostratus (rendah)" desc="Pita Cirrus atau hamparan Cirrostratus, menyebar dari horizon namun belum mencapai 45 derajat." />
                  <CloudCard code="CH = 6" name="Cirrus & Cirrostratus (tinggi)" desc="Pita Cirrus atau hamparan Cirrostratus kian meluas, melewati ketinggian 45 derajat tapi tidak menutupi seluruh langit." />
                  <CloudCard code="CH = 7" name="Cirrostratus (penuh)" desc="Hamparan Cirrostratus menutupi seluruh langit secara utuh. Sering menimbulkan fenomena Halo pada matahari/bulan." />
                  <CloudCard code="CH = 8" name="Cirrostratus (sebagian)" desc="Cirrostratus yang tidak menutupi seluruh langit dan tidak bertambah tebal." />
                  <CloudCard code="CH = 9" name="Cirrocumulus" desc="Awan Cirrocumulus (seperti sisik ikan) lebih dominan atau berjumlah banyak disertai sedikit Cirrus/Cirrostratus." />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: PDF Viewer */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 rounded-[22px] overflow-hidden shadow-md h-[550px] w-full flex flex-col relative group">
            {/* Overlay hint on hover to show how to use PDF */}
            <div className="absolute top-4 left-4 right-4 bg-white/95 text-slate-800 text-[11px] font-bold py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center gap-2 shadow-lg z-10">
              <Info className="w-4 h-4 text-blue-600" /> 
              Cocokkan kode gambar pada PDF dengan daftar panduan di sebelah kiri.
            </div>

            <iframe 
              src="/Buku_Atlas_Awan.pdf#zoom=page-fit" 
              className="w-full h-full border-0 flex-1 relative z-0"
              title="Buku Atlas Awan"
            >
              <div className="p-8 text-center text-slate-500 bg-white">
                Browser Anda tidak mendukung pratinjau PDF. Silakan klik tombol Unduh di atas.
              </div>
            </iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for clean cloud cards
const CloudCard: React.FC<{ code: string; name: string; desc: string }> = ({ code, name, desc }) => (
  <div className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
    <div className="bg-slate-200 text-slate-700 font-mono text-[10px] font-bold px-2 py-1 rounded-md h-fit whitespace-nowrap mt-0.5">
      {code}
    </div>
    <div>
      <h5 className="text-xs font-bold text-slate-800 mb-0.5 leading-tight">{name}</h5>
      <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);
