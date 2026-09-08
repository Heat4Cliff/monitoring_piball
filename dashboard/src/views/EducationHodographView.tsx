import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  BookOpen, 
  AlertTriangle, 
  Activity,
  Wind,
  Download,
  Maximize2,
  X,
  Search,
  Layers,
  FileText,
  HelpCircle,
  BarChart2,
  Plane,
  Tornado,
  CloudLightning
} from 'lucide-react';

export const EducationHodographView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'konsep' | 'fisika_bbs' | 'ekman_pbl' | 'studi_kasus' | 'stabilitas' | 'morfologi' | 'aeronautika' | 'glosarium' | 'poster'>('konsep');
  const [selectedPoster, setSelectedPoster] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Case study 26 August 2026 data from the reference textbook / poster
  const caseStudyLevels = [
    { height_ft: 0, label: 'SFC', dir: 140, speed: 7, u: -4.50, v: 5.36, desc: 'Angin permukaan dari Tenggara (140°/7kt)' },
    { height_ft: 1000, label: '1.000 ft', dir: 130, speed: 12, u: -9.19, v: 7.71, desc: 'Backing (140°→130°), akselerasi kecepatan ke 12 kt' },
    { height_ft: 2000, label: '2.000 ft', dir: 130, speed: 6, u: -4.59, v: 3.86, desc: 'Arah stabil 130°, kecepatan melambat ke 6 kt' },
    { height_ft: 3000, label: '3.000 ft', dir: 240, speed: 1, u: 0.87, v: 0.50, desc: 'Veering drastis (130°→240°), angin sangat lemah (1 kt)' },
    { height_ft: 4000, label: '4.000 ft', dir: 285, speed: 2, u: 1.93, v: 0.52, desc: 'Veering berlanjut ke 285° (Barat-Barat Laut)' },
    { height_ft: 5000, label: '5.000 ft', dir: 335, speed: 8, u: 3.28, v: 7.25, desc: 'Veering ke 335° (Utara-Barat Laut), kecepatan 8 kt' },
    { height_ft: 6000, label: '6.000 ft', dir: 165, speed: 3, u: -0.78, v: 2.90, desc: 'Backing kembali ke 165° (Selatan-Tenggara)' },
  ];

  // Comprehensive glossary extracted from BMKG Modul Operasional & Master Book
  const glossaryTerms = [
    { term: 'Adveksi (Advection)', cat: 'Termodinamika', def: 'Proses perpindahan atau pengangkutan sifat-sifat fisik atmosfer (seperti panas, kelembapan, atau momentum) secara horizontal oleh aliran angin.' },
    { term: 'Warm Air Advection (WAA)', cat: 'Termodinamika', def: 'Kondisi di mana angin meniupkan massa udara yang lebih hangat ke daerah yang lebih dingin. Di Belahan Bumi Selatan (BBS), WAA ditandai dengan perputaran arah angin yang berlawanan jarum jam (Backing).' },
    { term: 'Cold Air Advection (CAA)', cat: 'Termodinamika', def: 'Kondisi di mana angin meniupkan massa udara yang lebih dingin ke daerah yang lebih hangat. Di BBS, CAA ditandai dengan perputaran arah angin searah jarum jam (Veering).' },
    { term: 'Angin Termal (Thermal Wind, VT)', cat: 'Dinamika', def: 'Vektor geser vertikal angin geostropik antara dua level ketinggian (VT = V_atas - V_bawah), sebanding dengan gradien temperatur horizontal rata-rata lapisan tersebut.' },
    { term: 'Parameter Coriolis (f)', cat: 'Dinamika', def: 'Besaran fisis rotasi bumi: f = 2Ω sin(φ). Di Belahan Bumi Utara bernilai positif (f > 0), sedangkan di Belahan Bumi Selatan (seperti Cilacap pada 07°38\' LS) bernilai negatif (f < 0).' },
    { term: 'Hodograph', cat: 'Aerologi', def: 'Diagram grafis polar dua dimensi yang memetakan ujung-ujung vektor kecepatan dan arah angin dari permukaan tanah hingga lapisan langit atas.' },
    { term: 'Veering', cat: 'Kinematika', def: 'Perubahan arah datangnya angin yang berputar searah jarum jam (Clockwise) seiring bertambahnya ketinggian.' },
    { term: 'Backing', cat: 'Kinematika', def: 'Perubahan arah datangnya angin yang berputar berlawanan arah jarum jam (Counter-Clockwise) seiring bertambahnya ketinggian.' },
    { term: 'Spiral Ekman (Ekman Spiral)', cat: 'Dinamika', def: 'Perubahan arah dan kecepatan angin vertikal di lapisan batas gesekan (Planetary Boundary Layer) akibat keseimbangan antara gaya gradien tekanan, gaya Coriolis, dan gaya gesekan permukaan.' },
    { term: 'Low-Level Wind Shear (LLWS)', cat: 'Aeronautika', def: 'Geseran angin vertikal atau horizontal yang tajam pada ketinggian di bawah 2.000 kaki (≤ 600 meter) AGL yang berpotensi fatal bagi pesawat yang lepas landas atau mendarat.' },
    { term: 'Low-Level Jet (LLJ)', cat: 'Aeronautika', def: 'Pita arus angin sempit berkecepatan tinggi (biasanya ≥ 25 knot) yang terbentuk di lapisan troposfer bawah (antara 1.000 hingga 5.000 kaki), umum terjadi di Cilacap akibat Monsun Australia.' },
    { term: 'Storm-Relative Helicity (SRH)', cat: 'Cuaca Ekstrem', def: 'Ukuran potensi rotasi siklonik yang dapat disuplai oleh geseran angin vertikal ke dalam kolom updraft badai konvektif, dihitung dari luas area yang dibatasi kurva hodograph.' },
    { term: 'Indeks Richardson (Ri)', cat: 'Cuaca Ekstrem', def: 'Rasio tak berdimensi antara gaya apung termal (kestabilan statis) terhadap kuadrat geseran angin vertikal (gaya mekanik). Nilai Ri < 0.25 mengindikasikan timbulnya turbulensi dinamis Kelvin-Helmholtz (CAT).' },
    { term: 'Komponen Zonal (U)', cat: 'Sistem Koordinat', def: 'Proyeksi vektor angin pada sumbu Barat-Timur. Nilai U > 0 menunjukkan angin dari Barat (Westerly); nilai U < 0 menunjukkan angin dari Timur (Easterly).' },
    { term: 'Komponen Meridional (V)', cat: 'Sistem Koordinat', def: 'Proyeksi vektor angin pada sumbu Selatan-Utara. Nilai V > 0 menunjukkan angin dari Selatan (Southerly); nilai V < 0 menunjukkan angin dari Utara (Northerly).' },
    { term: 'Free Lift (Gaya Angkat Bebas)', cat: 'Aerologi', def: 'Daya apung bersih ke atas dari balon hidrogen setelah dikurangi bobot karet balon dan nosel pengisian, terkalibrasi untuk mencapai laju naik konstan ~180 m/menit.' },
    { term: 'Reticle (Benang Silang)', cat: 'Aerologi', def: 'Garis bidik optik di dalam teleskop theodolit yang digunakan observer untuk menjaga agar balon selalu berada tepat di titik pusat pandangan.' },
    { term: 'Sandi PILOT FM 32 (PPAA & PPBB)', cat: 'WMO', def: 'Format sandi telegrafis internasional WMO 5-digit untuk menyajikan data angin isobar standar (Part A) dan ketinggian geometris signifikan (Part B).' },
    { term: 'LIC (Lost in Cloud)', cat: 'WMO', def: 'Kode resmi WMO yang mengakhiri observasi optik akibat balon masuk dan tertutup oleh dasar awan (penyebab terminasi terbesar di Cilacap, rata-rata 62%).' },
    { term: 'BB (Balloon Burst)', cat: 'WMO', def: 'Kode terminasi pelacakan resmi karena balon karet meletus akibat ekspansi volume gas di lapisan bertekanan udara rendah.' },
    { term: 'LL (Lost in Distance)', cat: 'WMO', def: 'Kode terminasi pelacakan karena balon terbawa angin kencang hingga keluar dari jarak jangkauan optik theodolit pengamat.' },
    { term: 'Planetary Boundary Layer (PBL)', cat: 'Dinamika', def: 'Lapisan batas atmosfer (umumnya 1-2 km dari permukaan) di mana pergerakan angin sangat dipengaruhi oleh gaya gesekan permukaan bumi (friksi).' },
    { term: 'Free Atmosphere (Atmosfer Bebas)', cat: 'Dinamika', def: 'Lapisan udara di atas PBL di mana gaya gesekan permukaan (friksi) diabaikan, dan angin bergerak sejajar dengan isobarik (Angin Geostropik).' },
    { term: 'Ekman Layer', cat: 'Dinamika', def: 'Bagian terbawah atmosfer tempat terjadinya keseimbangan antara gaya Coriolis, Gradien Tekanan, dan Gesekan.' },
    { term: 'Crossover Altitude', cat: 'Aeronautika', def: 'Ketinggian di mana pengaruh gesekan (friksi) permukaan menghilang dan angin menjadi murni geostropik.' },
    { term: 'CAPE (Convective Available Potential Energy)', cat: 'Termodinamika', def: 'Energi potensial yang tersedia untuk konveksi (J/kg). Nilai CAPE besar indikasi labilitas dan potensi badai petir.' },
    { term: 'CIN (Convective INhibition)', cat: 'Termodinamika', def: 'Energi (J/kg) yang mencegah paket udara naik dari permukaan ke Level of Free Convection (LFC). Semakin besar CIN, semakin sulit badai terbentuk.' },
    { term: 'Lifted Index (LI)', cat: 'Termodinamika', def: 'Selisih suhu lingkungan pada 500 hPa dikurangi suhu paket udara yang diangkat adiabatik ke level tersebut. Nilai negatif indikator atmosfer tidak stabil.' },
    { term: 'K-Index (KI)', cat: 'Termodinamika', def: 'Indeks stabilitas empiris untuk memprakirakan probabilitas badai guntur. KI > 35 menunjukkan potensi badai petir sangat tinggi.' },
    { term: 'Showalter Index (SI)', cat: 'Termodinamika', def: 'Mirip Lifted Index namun mengangkat paket udara dari 850 hPa (bukan permukaan). Nilai negatif = labil.' },
    { term: 'SIGMET (Significant Meteorological Information)', cat: 'Aeronautika', def: 'Peringatan cuaca signifikan untuk penerbangan (seperti LLWS, turbulensi hebat, atau abu vulkanik) yang diterbitkan oleh MWO (Meteorological Watch Office).' },
    { term: 'PIREP (Pilot Report)', cat: 'Aeronautika', def: 'Laporan langsung dari pilot mengenai kondisi cuaca aktual yang dialami (misal: "severe wind shear at 1000 ft").' },
    { term: 'Wind Shear Tolerance', cat: 'Aeronautika', def: 'Batas maksimum perubahan arah/kecepatan angin yang masih dapat ditangani sistem kendali pesawat. Biasanya LLWS > 15-20 knot berbahaya bagi pesawat kecil.' },
    { term: 'Angin Geostropik', cat: 'Dinamika', def: 'Angin teoretis akibat keseimbangan tepat antara gaya gradien tekanan (PGF) dan gaya Coriolis (tanpa friksi), bergerak sejajar isobar.' },
    { term: 'Angin Ageostropik', cat: 'Dinamika', def: 'Komponen vektor angin riil yang menyimpang dari angin geostropik, seringkali akibat gesekan (friksi), akselerasi, atau lintasan isobarik melengkung.' },
    { term: 'Monsun Australia (Timuran)', cat: 'Dinamika', def: 'Pola angin monsunal dominan (Juni-September) di Indonesia yang bertiup dari Benua Australia (Tenggara) yang kering, sering memicu LLJ.' }
  ];

  const categories = ['Semua', 'Termodinamika', 'Dinamika', 'Aerologi', 'Aeronautika', 'Cuaca Ekstrem', 'Sistem Koordinat', 'WMO'];

  const filteredGlossary = useMemo(() => {
    return glossaryTerms.filter(item => {
      const matchCat = selectedCategory === 'Semua' || item.cat === selectedCategory;
      const matchSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) || item.def.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner with Official PDF Downloads */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Buku Ajar Master Edition & Poster BAB 10
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Stamet Tunggul Wulung Cilacap
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Analisis Hodograph & Dinamika Angin Termal
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">
            Panduan teoretis komprehensif: dekomposisi vektor koordinat U-V, hukum angin termal khusus Belahan Bumi Selatan (BBS), studi kasus 26 Agustus 2026, morfologi badai supercell, dan kamus glosarium aerologi lengkap.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/docs/Buku_Panduan_Lengkap_Pibal_dan_Hodograph_Master_Edition.pdf"
            download="Buku_Panduan_Master_Edition_PiBal_Hodograph.pdf"
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            title="Unduh Buku Panduan Master Edition (16 Halaman PDF)"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Buku Master (.PDF)</span>
          </a>
          <a
            href="/docs/modul_operasional_pibal_hodograph.pdf"
            download="Modul_Operasional_PiBal_Hodograph_Cilacap.pdf"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            title="Unduh Modul Operasional (20 Halaman PDF)"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Modul Operasional (.PDF)</span>
          </a>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('konsep')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'konsep' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          Konsep & Rumus U-V
        </button>
        <button
          onClick={() => setActiveTab('fisika_bbs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'fisika_bbs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Fisika Angin Termal di BBS
        </button>
        <button
          onClick={() => setActiveTab('ekman_pbl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ekman_pbl' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Tornado className="w-4 h-4" />
          Spiral Ekman & PBL
        </button>
        <button
          onClick={() => setActiveTab('studi_kasus')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'studi_kasus' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          Studi Kasus 26 Agustus 2026
        </button>
        <button
          onClick={() => setActiveTab('stabilitas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stabilitas' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CloudLightning className="w-4 h-4" />
          Indeks Stabilitas Atmosfer
        </button>
        <button
          onClick={() => setActiveTab('morfologi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'morfologi' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wind className="w-4 h-4" />
          Morfologi Badai & Helisitas
        </button>
        <button
          onClick={() => setActiveTab('aeronautika')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'aeronautika' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Plane className="w-4 h-4" />
          Aplikasi Aeronautika
        </button>
        <button
          onClick={() => setActiveTab('glosarium')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'glosarium' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Kamus Glosarium Lengkap
        </button>
        <button
          onClick={() => setActiveTab('poster')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'poster' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Infografis Poster & E-Book
        </button>
      </div>

      {/* TAB 1: KONSEP & RUMUS U-V */}
      {activeTab === 'konsep' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Definisi Hodograph */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Compass className="w-4 h-4" /> 1. Pengertian Hodograph
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Hodograph</strong> adalah diagram grafik polar dua dimensi yang memetakan variasi vektor kecepatan dan arah angin terhadap ketinggian dalam satu gambar tunggal. Kata hodograph berasal dari bahasa Yunani <em>hodos</em> (lintasan/jalan) dan <em>graphein</em> (menggambar).
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap titik pada hodograph merepresentasikan vektor angin pada ketinggian tertentu, dengan komponen zonal (u) pada sumbu horizontal dan komponen meridional (v) pada sumbu vertikal. Garis kontinu yang menyambung antar-titik ketinggian membentuk profil dinamika atmosfer.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">5 Kaidah Intuitif Membaca Hodograph:</span>
                <div className="space-y-1 text-slate-600">
                  <div>1. <strong>Pusat Salib Sumbu (0,0):</strong> Kecepatan angin nol (tenang / calm).</div>
                  <div>2. <strong>Jarak dari Pusat:</strong> Menggambarkan besaran skalar kecepatan angin (semakin menjauh = semakin kencang).</div>
                  <div>3. <strong>Posisi Sudut:</strong> Menunjukkan arah bertiupnya angin pada koordinat kompas.</div>
                  <div>4. <strong>Segmen Garis Penghubung:</strong> Merepresentasikan vektor wind shear (ΔV) antar-lapisan ketinggian.</div>
                  <div>5. <strong>Kurvatur Lengkungan:</strong> Arah lengkungan (searah/berlawanan jarum jam) mendeteksi adveksi termal WAA/CAA.</div>
                </div>
              </div>
            </div>

            {/* Rumus Konversi U-V Matematis */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Activity className="w-4 h-4" /> 2. Rumus Baku Konversi U-V & Rekonstruksi Vektor
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dalam konvensi meteorologi internasional, arah angin (θ) adalah arah DARI MANA angin bertiup. Oleh sebab itu, vektor pergerakan udara mengarah ke sebaliknya (tanda minus):
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs space-y-2.5 text-slate-800">
                <span className="font-bold text-blue-700 font-sans block">A. Konversi dari Arah (θ) & Kecepatan (V) ke Komponen U-V:</span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-blue-700 font-bold">
                    u = -V · sin(θ)
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-emerald-700 font-bold">
                    v = -V · cos(θ)
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-sans pt-1">
                  • <strong>u</strong> = komponen zonal (nilai positif = angin Barat; negatif = angin Timur)<br />
                  • <strong>v</strong> = komponen meridional (nilai positif = angin Selatan; negatif = angin Utara)
                </div>

                <span className="font-bold text-purple-700 font-sans block pt-2">B. Rekonstruksi Kecepatan & Arah dari Komponen U-V:</span>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-purple-700 font-bold text-center">
                  V = √(u² + v²)
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-purple-700 font-bold text-center">
                  θ = atan2(-u, -v) atau (270° - atan2(v, u)) mod 360°
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FISIKA ANGIN TERMAL DI BBS (CILACAP) */}
      {activeTab === 'fisika_bbs' && (
        <div className="space-y-6">
          {/* Card: Penjelasan Coriolis & Tanda Negatif */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  Fisika Angin Termal di Belahan Bumi Selatan (BBS / Cilacap 07°38' LS)
                </h3>
                <span className="text-xs text-amber-800 font-medium">
                  Mengapa di Cilacap aturan textbook "Veering = Warm Advection" terbalik menjadi "Backing = Warm Advection"?
                </span>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
              Buku teks meteorologi standar internasional sering kali ditulis oleh penulis dari Belahan Bumi Utara (BBU), di mana berlaku aturan ringkas <em>Veering = WAA</em> dan <em>Backing = CAA</em>. <strong>Namun di Belahan Bumi Selatan (BBS), tanda parameter Coriolis terbalik, sehingga aturannya menjadi KEBALIKANNYA!</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-2">
                <span className="font-bold text-blue-700 font-sans block text-sm">Persamaan Vektor Angin Termal (VT):</span>
                <p className="text-slate-600 font-sans text-xs">
                  Vektor geseran angin geostropik vertikal antara ketinggian z₁ dan z₂ dirumuskan eksak oleh Holton & Wallace-Hobbs:
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-blue-700 font-bold">
                  Vg(z₂) - Vg(z₁) = - (R / f) · (k × ∇_p T) · ln(p₂ / p₁)
                </div>
                <p className="text-[11px] text-slate-500 font-sans leading-relaxed">
                  Parameter Coriolis <strong>f = 2Ω sin(φ)</strong>. Karena lintang Cilacap berada di selatan ekuator (φ = -7.63°), nilai <strong>f bernilai NEGATIF</strong>. Tanda negatif membalikkan arah vektor cross-product 180°!
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-2">
                <span className="font-bold text-amber-800 font-sans block text-sm">Matriks Komparasi BBU vs BBS:</span>
                <div className="space-y-2 font-sans text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <strong className="text-blue-700 block">Belahan Bumi Utara (BBU / NH, f &gt; 0):</strong>
                    <div className="text-slate-600 text-[11px]">
                      • <strong>Veering</strong> (searah jarum jam) = Adveksi Hangat (WAA)<br />
                      • <strong>Backing</strong> (berlawanan jarum jam) = Adveksi Dingin (CAA)
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-300">
                    <strong className="text-amber-900 block">Belahan Bumi Selatan (BBS / SH - Cilacap, f &lt; 0):</strong>
                    <div className="text-amber-950 text-[11px] font-semibold">
                      • <strong>BACKING</strong> (berlawanan jarum jam) = Adveksi Hangat (WAA) → Memicu updraft & awan!<br />
                      • <strong>VEERING</strong> (searah jarum jam) = Adveksi Dingin (CAA) → Memicu penurunan massa udara / stabil!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Faktor Pembentuk Profil Hodograph */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-sm font-bold text-slate-900 block">
              5 Faktor Fisis Pembentuk Profil Hodograph Atmosfer
            </span>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-blue-700 block">1. Angin Termal</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Gradien suhu horizontal antar-wilayah menimbulkan geseran angin vertikal yang mengubah arah angin terhadap ketinggian.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-emerald-700 block">2. Adveksi Termal</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Penyusupan massa udara hangat (WAA) atau dingin (CAA) mendistorsi kurvatur profil angin di troposfer bawah.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-indigo-700 block">3. Efek Coriolis</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Rotasi bumi membelokkan aliran udara ke kiri di BBS dan ke kanan di BBU, memengaruhi sirkulasi siklonik.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-purple-700 block">4. Spiral Ekman</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Gesekan permukaan memperlambat angin dan membelokkannya memotong isobar; gesekan berkurang ke atas mendekati geostropik.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-amber-700 block">5. Sirkulasi Lokal</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Pengaruh angin darat-laut pantai selatan Cilacap dan topografi lereng Gunung Slamet di sisi utara.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDI KASUS 26 AGUSTUS 2026 */}
      {activeTab === 'studi_kasus' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Studi Kasus Resmi Poster BAB 10</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Data Reduksi Trigonometri & Plot Hodograph Pengamatan 26 Agustus 2026
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Capaian: 6.000 ft (06 UTC)
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Table Data */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Tinggi (ft)</th>
                      <th className="p-2.5">Arah (θ)</th>
                      <th className="p-2.5">Kec (kt)</th>
                      <th className="p-2.5 text-blue-700">u (kt)</th>
                      <th className="p-2.5 text-emerald-700">v (kt)</th>
                      <th className="p-2.5 font-sans">Karakteristik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {caseStudyLevels.map((lvl, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{lvl.label}</td>
                        <td className="p-2.5 text-amber-700 font-semibold">{lvl.dir}°</td>
                        <td className="p-2.5 font-bold">{lvl.speed} kt</td>
                        <td className="p-2.5 text-blue-700 font-semibold">{lvl.u.toFixed(2)}</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">{lvl.v.toFixed(2)}</td>
                        <td className="p-2.5 font-sans text-[11px] text-slate-500">{lvl.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Graphical SVG Plot representation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-800 mb-2">Diagram Hodograph 26 Agustus 2026 (SFC s/d 6.000 ft)</span>
                <svg width="340" height="260" viewBox="-80 -80 160 160" className="bg-white rounded-xl border border-slate-200 shadow-inner">
                  {/* Grid Rings */}
                  {[20, 40, 60].map(r => (
                    <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                  ))}
                  <line x1="-75" y1="0" x2="75" y2="0" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="0" y1="-75" x2="0" y2="75" stroke="#cbd5e1" strokeWidth="1" />
                  <text x="65" y="-3" fontSize="7" fill="#64748b" textAnchor="end">+U (Barat)</text>
                  <text x="-65" y="-3" fontSize="7" fill="#64748b">-U (Timur)</text>
                  <text x="3" y="-68" fontSize="7" fill="#64748b">+V (Selatan)</text>
                  <text x="3" y="72" fontSize="7" fill="#64748b">-V (Utara)</text>

                  {/* Polyline of the 7 levels */}
                  <path
                    d="M -22.5 26.8 L -45.9 38.5 L -22.9 19.3 L 4.3 2.5 L 9.6 2.6 L 16.4 36.2 L -3.9 14.5"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Level Points */}
                  <circle cx="-22.5" cy="26.8" r="4" fill="#ef4444" />
                  <text x="-20" y="24" fontSize="6.5" fill="#ef4444" fontWeight="bold">SFC</text>

                  <circle cx="-45.9" cy="38.5" r="3.5" fill="#3b82f6" />
                  <text x="-43" y="36" fontSize="6" fill="#3b82f6">1k</text>

                  <circle cx="-22.9" cy="19.3" r="3.5" fill="#10b981" />
                  <text x="-20" y="17" fontSize="6" fill="#10b981">2k</text>

                  <circle cx="4.3" cy="2.5" r="3" fill="#f59e0b" />
                  <text x="7" y="5" fontSize="6" fill="#f59e0b">3k</text>

                  <circle cx="9.6" cy="2.6" r="3" fill="#8b5cf6" />
                  <text x="12" y="5" fontSize="6" fill="#8b5cf6">4k</text>

                  <circle cx="16.4" cy="36.2" r="3.5" fill="#ec4899" />
                  <text x="19" y="34" fontSize="6" fill="#ec4899">5k</text>

                  <circle cx="-3.9" cy="14.5" r="3.5" fill="#64748b" />
                  <text x="-1" y="12" fontSize="6" fill="#64748b">6k</text>
                </svg>

                <div className="mt-3 text-[11px] text-slate-600 text-center leading-relaxed">
                  Dari SFC ke 1.000 ft terjadi <strong>Backing (Adveksi Hangat WAA)</strong>. Lalu dari 1.000 ft hingga 5.000 ft terjadi <strong>Veering tajam (Adveksi Dingin CAA)</strong> akibat dominasi massa udara kering Monsun Australia di troposfer bawah.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SPIRAL EKMAN & PBL [BARU] */}
      {activeTab === 'ekman_pbl' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Tornado className="w-5 h-5" /> Dinamika Planetary Boundary Layer (PBL) & Spiral Ekman
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Di lapisan terbawah atmosfer (lapisan batas atau <em>Planetary Boundary Layer</em> / PBL), pergerakan angin tidak hanya dipengaruhi oleh Gradien Tekanan dan Gaya Coriolis, tetapi juga diperlambat oleh gesekan permukaan (friksi). Kombinasi ketiga gaya ini menghasilkan profil angin vertikal melengkung yang disebut <strong>Spiral Ekman</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-2">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-blue-800 font-bold text-sm block">Keseimbangan 3 Gaya di Lapisan Batas:</span>
                  <div className="space-y-1 text-slate-700">
                    <div>1. <strong>Gaya Gradien Tekanan (PGF):</strong> Mendorong udara dari tekanan tinggi ke rendah.</div>
                    <div>2. <strong>Gaya Coriolis (Co):</strong> Membelokkan angin (ke kiri di Belahan Bumi Selatan/BBS).</div>
                    <div>3. <strong>Gaya Gesekan Permukaan (Fr):</strong> Memperlambat laju angin, berlawanan arah gerak.</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-center text-blue-700">
                    &Sigma;F = PGF + Coriolis + Gesekan = 0
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <span className="text-emerald-800 font-bold text-sm block">Kedalaman Lapisan Ekman (Crossover Altitude)</span>
                  <p className="text-emerald-900 leading-relaxed">
                    Ketinggian di mana efek friksi bumi menghilang dan angin menjadi sejajar murni dengan garis isobar (Angin Geostropik). Di Cilacap, ketebalan PBL bervariasi:
                  </p>
                  <ul className="list-disc list-inside text-emerald-800 space-y-0.5 ml-1">
                    <li>Darat (Siang): ~1.000 - 1.500 meter (konveksi aktif)</li>
                    <li>Darat (Malam): ~300 - 500 meter (inversi radiasi)</li>
                    <li>Laut (Lepas Pantai): Lebih konstan dan lebih rendah gesekannya.</li>
                  </ul>
                </div>
              </div>

              {/* Ekman Spiral SVG Diagram */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative">
                <span className="text-slate-800 font-bold text-sm mb-3">Diagram Spiral Ekman Ideal di BBS</span>
                <svg viewBox="0 0 200 200" className="w-full max-w-[220px]">
                  {/* Isobar */}
                  <line x1="20" y1="20" x2="180" y2="20" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="145" y="15" fontSize="10" fill="#64748b">Isobar Tinggi</text>
                  <line x1="20" y1="180" x2="180" y2="180" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="145" y="175" fontSize="10" fill="#64748b">Isobar Rendah</text>
                  
                  {/* Origin */}
                  <circle cx="100" cy="180" r="4" fill="#0f172a" />
                  <text x="90" y="195" fontSize="10" fill="#0f172a" fontWeight="bold">SFC</text>

                  {/* Gradient Force */}
                  <line x1="100" y1="180" x2="100" y2="100" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                  <polygon points="97,105 103,105 100,95" fill="#ef4444" />
                  <text x="75" y="120" fontSize="9" fill="#ef4444">PGF</text>

                  {/* Vectors representing wind at different heights turning LEFT into low pressure (BBS) */}
                  {/* SFC Wind (high friction) */}
                  <line x1="100" y1="180" x2="135" y2="145" stroke="#3b82f6" strokeWidth="2" />
                  <polygon points="132,149 130,143 138,142" fill="#3b82f6" />
                  {/* Middle Wind (less friction) */}
                  <line x1="100" y1="180" x2="160" y2="120" stroke="#2563eb" strokeWidth="2" />
                  <polygon points="156,124 153,118 162,118" fill="#2563eb" />
                  {/* Top Wind - Geostrophic (no friction) */}
                  <line x1="100" y1="180" x2="180" y2="100" stroke="#1d4ed8" strokeWidth="2.5" />
                  <polygon points="175,105 171,99 183,97" fill="#1d4ed8" />
                  
                  <text x="185" y="95" fontSize="9" fill="#1d4ed8" fontWeight="bold">V_geo</text>

                  {/* Spiral Curve */}
                  <path d="M 135 145 Q 155 135 160 120 Q 170 105 180 100" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                </svg>
                <div className="text-[10px] text-slate-500 text-center mt-2">
                  Di Belahan Bumi Selatan, gesekan permukaan menyebabkan angin berbelok ke arah <strong>KANAN</strong> tekanan rendah (cross-isobaric flow). Semakin tinggi, gesekan berkurang, dan angin berbelok searah jarum jam (Veering) menuju keseimbangan geostropik.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: INDEKS STABILITAS ATMOSFER [BARU] */}
      {activeTab === 'stabilitas' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <CloudLightning className="w-5 h-5" /> Indeks Stabilitas Atmosfer Terkait Hodograph Badai
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Meskipun hodograph murni merepresentasikan shear angin mekanis (dinamika), tipe badai yang akan terbentuk sangat bergantung pada daya apung termal (termodinamika). Hodograph sering dianalisis bersamaan dengan parameter indeks stabilitas dari diagram Skew-T:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 space-y-2">
                <span className="font-bold text-orange-800 text-sm block">CAPE (Convective Available Potential Energy)</span>
                <p className="text-orange-900 leading-relaxed">
                  Energi potensial (J/kg) yang tersedia untuk mempercepat paket udara naik secara konvektif. Semakin besar CAPE, semakin kencang kecepatan updraft dalam badai guntur.
                </p>
                <ul className="bg-white p-2.5 rounded-xl border border-orange-200 list-disc list-inside space-y-0.5 text-[11px] text-orange-800 font-mono">
                  <li>0 - 1000 : Marginal (Hujan Ringan-Sedang)</li>
                  <li>1000 - 2500 : Moderat (Potensi Badai Petir)</li>
                  <li>&gt; 2500 : Ekstrem (Badai Petir Hebat/Supercell)</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                <span className="font-bold text-blue-800 text-sm block">CIN (Convective INhibition)</span>
                <p className="text-blue-900 leading-relaxed">
                  Energi "penutup" (capping inversion) yang menghalangi udara naik dari permukaan menuju Level of Free Convection (LFC).
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 text-blue-800 text-[11px]">
                  <strong>Catatan:</strong> Badai ganas (severe storms) sering terbentuk ketika CAPE sangat besar namun tertahan CIN moderat. Saat pemanasan permukaan akhirnya menembus tutup CIN, energi meledak eksplosif.
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                <span className="font-bold text-purple-800 text-sm block">Lifted Index (LI) & Showalter Index (SI)</span>
                <p className="text-purple-900 leading-relaxed">
                  LI menghitung selisih suhu lingkungan (T_env) pada 500 hPa dikurangi suhu paket udara yang diangkat adiabatik dari permukaan (T_parcel).
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-purple-200 text-purple-800 text-[11px] font-mono font-bold text-center">
                  LI = T_env(500) - T_parcel(500)
                </div>
                <p className="text-purple-900 text-[11px] pt-1">
                  Nilai Negatif = Atmosfer Labil (Paket lebih hangat dari lingkungan sehingga akan terus naik). LI &lt; -6 = Badai Ekstrem.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-800 text-sm block">K-Index (KI)</span>
                <p className="text-emerald-900 leading-relaxed">
                  Formula empiris yang mengukur potensi badai petir massa udara, sangat sensitif terhadap profil kelembapan di lapisan bawah hingga menengah (850 - 700 - 500 hPa).
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] font-mono space-y-1">
                  <div>T_850 - T_500 + Td_850 - (T_700 - Td_700)</div>
                  <div className="pt-1.5 border-t border-emerald-200/50">KI &gt; 35 : Potensi Badai Guntur ~100%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: APLIKASI AERONAUTIKA [BARU] */}
      {activeTab === 'aeronautika' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Plane className="w-5 h-5 text-sky-600" /> Profil Wind Shear & Keselamatan Penerbangan (Aeronautika)
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Analisis hodograph dari data PiBal sangat krusial bagi ATC Bandara Tunggul Wulung Cilacap untuk mendeteksi ancaman <strong>Low-Level Wind Shear (LLWS)</strong> di jalur lepas landas dan pendaratan akhir pesawat udara.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2">
                  <span className="font-bold text-red-800 block text-sm">Definisi & Bahaya LLWS</span>
                  <p className="text-red-900 leading-relaxed">
                    Perubahan tiba-tiba arah atau kecepatan angin di bawah ketinggian 2.000 kaki (600 meter) AGL. Sangat berbahaya pada fase kritis penerbangan karena menyebabkan pesawat mendadak kehilangan daya angkat (lift) atau melenceng dari landasan pacu.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block text-sm">Ambang Batas Kritis ICAO</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    <li><strong>Light:</strong> &lt; 4 knot / 100 ft</li>
                    <li><strong>Moderate:</strong> 4 - 8 knot / 100 ft</li>
                    <li><strong>Strong:</strong> 9 - 12 knot / 100 ft</li>
                    <li><strong className="text-red-600">Severe:</strong> &ge; 13 knot / 100 ft (Fatal)</li>
                  </ul>
                  <p className="text-[11px] text-slate-500 italic mt-2">
                    Jika data PiBal mendeteksi geseran melebihi 6 knot/100ft, Forecaster wajib menerbitkan LLWS Alert ke Menara Pengendali (ATC).
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2 h-full">
                  <span className="font-bold text-blue-800 block text-sm">SIGMET & PIREP</span>
                  <p className="text-blue-900 leading-relaxed mb-3">
                    Bila data PiBal atau pelaporan langsung dari kokpit pilot (PIREP) mengonfirmasi LLWS parah, Meteorological Watch Office akan merilis peringatan cuaca signifikan (SIGMET) yang terdistribusi secara global melalui Aeronautical Fixed Telecommunication Network (AFTN).
                  </p>
                  
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-green-400 font-mono text-[10px] space-y-1">
                    <span className="text-yellow-400 block mb-1">=== CONTOH FORMAT PIREP ===</span>
                    <div>UUA /OV WICU 090005 /TM 0615 /FL005</div>
                    <div>/TP C172 /WX WS SVR AT 500FT /RM -15KT IAS</div>
                    <span className="text-slate-400 mt-2 block">(Pilot Cessna 172 melaporkan Severe Wind Shear di ketinggian 500 kaki turunnya kecepatan indikator udara sebesar 15 knot)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'morfologi' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Wind className="w-5 h-5" /> Morfologi Kurva Hodograph & Dinamika Badai Konvektif Mesoskala
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Geometri kurva hodograph menentukan pola kinematika badai guntur, potensi pemisahan sel (*storm splitting*), pembentukan mesosiklon supercell, dan risiko cuaca ekstrem:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-blue-700 font-bold text-sm block">1. Hodograph Lurus (Unidirectional Shear)</span>
                <p className="text-slate-600 leading-relaxed">
                  Kecepatan angin bertambah terhadap ketinggian namun arahnya konstan (vektor shear berada pada satu garis lurus).
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold">
                  Memicu Storm Splitting: Badai terbelah menjadi dua sel simetris (Left-Mover dan Right-Mover).
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-emerald-700 font-bold text-sm block">2. Hodograph Melengkung (Directional Shear)</span>
                <p className="text-slate-600 leading-relaxed">
                  Arah angin berputar tajam terhadap ketinggian, menghasilkan vortisitas horizontal streamwise yang tinggi.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold">
                  Mendukung Supercell: Updraft menghisap vortisitas menjadi rotasi mesosiklonik berputar kencang.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-purple-700 font-bold text-sm block">3. Helisitas (Storm-Relative Helicity / SRH)</span>
                <p className="text-slate-600 leading-relaxed">
                  Luasan area yang disapu oleh kurva hodograph sebanding dengan suplai helisitas ke dalam updraft.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold">
                  SRH &gt; 150 m²/s² mengindikasikan potensi badai terisolasi kuat / puting beliung (tornado).
                </div>
              </div>
            </div>
          </div>

          {/* Indeks Richardson & Low-Level Wind Shear */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-600" />
                Indeks Richardson Vertikal (Gradient Richardson Number / Ri)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Menghitung perbandingan antara kestabilan statis atmosfer (gaya apung termal) terhadap geseran mekanik angin:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-purple-700 font-bold text-center">
                Ri = [ (g / θ_v) · (∂θ_v / ∂z) ] / [ (∂u/∂z)² + (∂v/∂z)² ]
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jika <strong>Ri &lt; 0.25 (Critical Richardson Number)</strong>, geseran angin dinamis mampu mengatasi stabilitas termal, memicu timbulnya gelombang Kelvin-Helmholtz Billows dan turbulensi atmosfer cerah (*Clear Air Turbulence* / CAT).
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Low-Level Wind Shear (LLWS) & Keselamatan Bandara
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stasiun Meteorologi Tunggul Wulung Cilacap bertugas melindungi keselamatan penerbangan di Bandara Tunggul Wulung. Ketika hodograph mendeteksi segmen geseran angin &ge; 12 knot / 1.000 ft pada lapisan 0 - 2.000 kaki, sistem menerbitkan peringatan dini LLWS ke Air Traffic Controller (ATC).
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-semibold">
                Zona LLWS Kritis di Cilacap: Sering terdeteksi pada lapisan 1.000 - 3.000 ft di mana aliran Monsun Australia bergeser tajam dengan angin permukaan pantai.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KAMUS GLOSARIUM LENGKAP */}
      {activeTab === 'glosarium' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Kamus & Glosarium Istilah Meteorologi Udara Atas (Aerologi)
              </h3>
              <p className="text-xs text-slate-500">
                Kompilasi istilah teknis baku dari Lampiran Modul BMKG Cilacap & Buku Master Edition.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari istilah atau definisi..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Glossary Terms List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredGlossary.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-blue-900">{item.term}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                    {item.cat}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {item.def}
                </p>
              </div>
            ))}
            {filteredGlossary.length === 0 && (
              <div className="col-span-2 text-center py-8 text-xs text-slate-400">
                Tidak ditemukan istilah yang sesuai dengan kata kunci "{searchTerm}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: POSTER BAB 10 & E-BOOK */}
      {activeTab === 'poster' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Poster 1 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Poster BAB 10 (Edisi Konsep)</span>
                  <h4 className="text-sm font-bold text-slate-900">Hodograph: Konsep, Visualisasi & Interpretasi</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedPoster('/docs/poster_bab10_hodograph_konsep.png')}
                    className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
                    title="Perbesar Layar Penuh"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <a
                    href="/docs/poster_bab10_hodograph_konsep.png"
                    download="Poster_BAB10_Hodograph_Konsep.png"
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                    title="Unduh Gambar"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div 
                onClick={() => setSelectedPoster('/docs/poster_bab10_hodograph_konsep.png')}
                className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group flex items-center justify-center p-2"
              >
                <img
                  src="/docs/poster_bab10_hodograph_konsep.png"
                  alt="Poster BAB 10 Konsep"
                  className="w-full max-h-[460px] object-contain rounded-xl transition-transform group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-white/95 px-3 py-1.5 rounded-xl text-blue-700 text-xs font-bold shadow">
                    Klik untuk Memperbesar
                  </div>
                </div>
              </div>
            </div>

            {/* Poster 2 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Poster BAB 10 (Edisi Analisis Detail)</span>
                  <h4 className="text-sm font-bold text-slate-900">Komparasi BBU vs BBS & Analisis Cuaca</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedPoster('/docs/poster_bab10_hodograph_detail.png')}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                    title="Perbesar Layar Penuh"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <a
                    href="/docs/poster_bab10_hodograph_detail.png"
                    download="Poster_BAB10_Hodograph_Detail.png"
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                    title="Unduh Gambar"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div 
                onClick={() => setSelectedPoster('/docs/poster_bab10_hodograph_detail.png')}
                className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group flex items-center justify-center p-2"
              >
                <img
                  src="/docs/poster_bab10_hodograph_detail.png"
                  alt="Poster BAB 10 Detail"
                  className="w-full max-h-[460px] object-contain rounded-xl transition-transform group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <div className="bg-white/95 px-3 py-1.5 rounded-xl text-emerald-700 text-xs font-bold shadow">
                    Klik untuk Memperbesar
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Book Download Link */}
          <div className="p-6 bg-gradient-to-r from-blue-50 via-sky-50 to-white rounded-3xl border border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase">Dokumen Resmi Lengkap</span>
              <h3 className="text-base font-extrabold text-slate-900">
                Buku Ajar Master Edition: PiBal, Hodograph, & Meteorologi Udara Atas
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                16 Halaman ensiklopedia lengkap mencakup seluruh penurunan rumus, studi komparatif angin termal, dan rekapitulasi data 21 hari Agustus 2026.
              </p>
            </div>
            <a
              href="/docs/Buku_Panduan_Lengkap_Pibal_dan_Hodograph_Master_Edition.pdf"
              download="Buku_Panduan_Master_Edition_PiBal_Hodograph.pdf"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Buku Master (.PDF)</span>
            </a>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Fullscreen Poster Viewing */}
      {selectedPoster && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between text-white pb-3">
            <span className="font-bold text-sm">Pratinjau Poster Resolusi Tinggi BAB 10</span>
            <div className="flex items-center gap-3">
              <a
                href={selectedPoster}
                download={selectedPoster.split('/').pop()}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" /> Unduh Poster
              </a>
              <button
                onClick={() => setSelectedPoster(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto rounded-2xl bg-slate-950/50 flex items-center justify-center p-2">
            <img
              src={selectedPoster}
              alt="Poster BAB 10"
              className="max-w-none max-h-none w-auto h-auto object-contain cursor-zoom-out"
              onClick={() => setSelectedPoster(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationHodographView;
