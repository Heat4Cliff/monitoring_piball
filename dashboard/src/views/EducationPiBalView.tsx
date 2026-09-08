import React, { useState } from 'react';
import { 
  Compass, 
  Wind, 
  BookOpen, 
  Plane,
  ShieldCheck,
  Download,
  Maximize2,
  X,
  Smartphone,
  Activity,
  History,
  AlertTriangle,
  FileText,
  Triangle,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export const EducationPiBalView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alur' | 'smartphone' | 'geometri' | 'lapisan_wmo' | 'sejarah' | 'qc_data' | 'poster'>('alur');
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner with PDF Download Shortcuts */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Modul & Pustaka Referensi Resmi
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              WMO No. 8 Standard
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panduan Lengkap Pengamatan Pilot Balon (PiBal)
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1 leading-relaxed max-w-3xl">
            Referensi teoretis, fisika aerologi, panduan keselamatan hidrogen, digitalisasi theodolit berbasis sensor inersia smartphone, reduksi posisi 3D, dan kodifikasi sandi telegrafis WMO.
          </p>
        </div>

        {/* Action Buttons to Download Official PDFs */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            href="/docs/modul_operasional_pibal_hodograph.pdf"
            download="Modul_Operasional_PiBal_Hodograph_Cilacap.pdf"
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            title="Unduh Modul Operasional Resmi (20 Halaman)"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Modul Operasional (.PDF)</span>
          </a>
          <a
            href="/docs/Buku_Panduan_Lengkap_Pibal_dan_Hodograph_Master_Edition.pdf"
            download="Buku_Panduan_Master_Edition_PiBal_Hodograph.pdf"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            title="Unduh Buku Panduan Master Edition (16 Halaman)"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Buku Master (.PDF)</span>
          </a>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('alur')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'alur'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          Alur Pengamatan & Fisika
        </button>
        <button
          onClick={() => setActiveTab('smartphone')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'smartphone'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Digitalisasi Theodolite IMU
        </button>
        <button
          onClick={() => setActiveTab('geometri')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'geometri'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Triangle className="w-4 h-4" />
          Geometri & Trigonometri
        </button>
        <button
          onClick={() => setActiveTab('lapisan_wmo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'lapisan_wmo'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          Lapisan Standar WMO/ICAO
        </button>
        <button
          onClick={() => setActiveTab('sejarah')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sejarah'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          Sejarah & Standar WMO
        </button>
        <button
          onClick={() => setActiveTab('qc_data')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'qc_data'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Kesalahan & QC Data
        </button>
        <button
          onClick={() => setActiveTab('poster')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'poster'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Infografis Poster & E-Book
        </button>
      </div>

      {/* TAB 1: ALUR OPERASIONAL & FISIKA */}
      {activeTab === 'alur' && (
        <div className="space-y-6">
          {/* Card 1: Definisi & Prinsip Fisika Archimedes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Wind className="w-4 h-4" /> 1. Prinsip Fisika Gaya Apung (Archimedes) & Free Lift
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Balon lateks meteorologi (bobot standar 30 gram atau 100 gram) diisi gas hidrogen (H₂) dengan massa jenis yang jauh lebih ringan daripada udara sekitar (ρ_gas ≪ ρ_udara).
              </p>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs space-y-2 text-slate-800">
                <div className="font-bold text-blue-700 font-sans">A. Gaya Apung Kotor (Archimedes Force):</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-semibold text-center text-blue-700">
                  F_B = (ρ_udara - ρ_gas) · g · V
                </div>
                <div className="font-bold text-emerald-700 font-sans pt-1">B. Daya Angkat Bebas (Free Lift, L):</div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-semibold text-center text-emerald-700">
                  L = F_B - (m_balon + m_nosel) · g
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Dengan menimbang <em>free lift</em> secara tepat menggunakan anak timbangan sebelum pelepasan, balon memperoleh laju kenaikan vertikal konstan:
                <br />
                <strong className="text-slate-800">V_z ≈ 180 m/menit (3 m/detik atau ~600 ft/menit)</strong>.
              </p>
            </div>

            {/* Standar Keselamatan Gas Hidrogen */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" /> 2. Standar Operasional Keselamatan Gas Hidrogen (H₂)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gas hidrogen memiliki batas flamabilitas yang sangat lebar dan energi inisiasi ledakan yang luar biasa kecil. Prosedur di ruang pengisian wajib mematuhi standar keselamatan ketat BMKG:
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                  <span className="font-bold text-amber-800 block text-[11px]">Rentang Ledakan</span>
                  <span className="text-sm font-extrabold text-amber-700">4% - 75%</span>
                  <p className="text-[10px] text-amber-800">Volume campuran hidrogen di udara sangat mudah meledak.</p>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                  <span className="font-bold text-amber-800 block text-[11px]">Energi Penyalaan</span>
                  <span className="text-sm font-extrabold text-amber-700">0.02 mJ</span>
                  <p className="text-[10px] text-amber-800">Gesekan baju sintetis dapat memicu ledakan spontan.</p>
                </div>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Dilarang membawa ponsel biasa, rokok, korek api, atau perlengkapan non-EX proof.</li>
                <li>Wajib memakai gelang antistatis dan menyambungkan kabel grounding tembaga ke tanah.</li>
                <li>Penimbangan free lift dilakukan hingga balon melayang seimbang sebelum dibawa ke titik lepas.</li>
              </ul>
            </div>
          </div>

          {/* 5 Tahap Alur Kerja Pelacakan & Geometri */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-1">
                <Compass className="w-4 h-4" /> 3. Alur 5 Tahap Pengamatan & Reduksi Geometri 3D
              </div>
              <p className="text-xs text-slate-600">
                Langkah berurutan dari persiapan peluncuran hingga menjadi produk informasi meteorologi resmi:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">1</div>
                <span className="font-bold text-slate-800 block">Persiapan & Kalibrasi</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Pengisian H₂, timbang free lift, pastikan nivo theodolit horizontal dan arah 000° tepat ke True North.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">2</div>
                <span className="font-bold text-slate-800 block">Pelepasan Balon</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Balon dilepas di udara terbuka pada jam dinas 06.00 UTC (13.00 WIB) tepat saat stopwatch t = 0.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">3</div>
                <span className="font-bold text-slate-800 block">Tracking Optik</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Observer memusatkan balon pada reticle optik dan mencatat Azimuth (α) & Elevasi (θ) tiap 60 detik.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">4</div>
                <span className="font-bold text-slate-800 block">Reduksi Trigonometri</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Konversi sudut ke koordinat posisi 3D (x, y, z), vektor u/v, arah (dd) dan kecepatan (ff).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">5</div>
                <span className="font-bold text-slate-800 block">Produk & Diseminasi</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Publikasi Hodograph, profil bulu angin, wind shear, dan sandi telegrafis WMO PPAA & PPBB via GTS.
                </p>
              </div>
            </div>

            {/* Rumus Reduksi Matematika */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="font-bold text-blue-900 font-sans block mb-1.5">A. Penentuan Koordinat Posisi Balon di Udara:</span>
                <div className="space-y-1 text-slate-800">
                  <div>• Ketinggian vertikal: <strong className="text-blue-700">H = V_z · t</strong></div>
                  <div>• Jarak horizontal datar: <strong className="text-blue-700">D = H / tan(θ)</strong></div>
                  <div>• Koordinat Timur (+X): <strong className="text-blue-700">x = D · sin(α)</strong></div>
                  <div>• Koordinat Utara (+Y): <strong className="text-blue-700">y = D · cos(α)</strong></div>
                </div>
              </div>

              <div>
                <span className="font-bold text-blue-900 font-sans block mb-1.5">B. Kecepatan dan Arah Angin Antar-Menit:</span>
                <div className="space-y-1 text-slate-800">
                  <div>• Komponen Zonal: <strong className="text-emerald-700">u = Δx / Δt</strong></div>
                  <div>• Komponen Meridional: <strong className="text-emerald-700">v = Δy / Δt</strong></div>
                  <div>• Kecepatan Skalar: <strong className="text-emerald-700">ff = √(u² + v²)</strong></div>
                  <div>• Arah Datang: <strong className="text-emerald-700">dd = (270° - atan2(v, u)) mod 360°</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sandi WMO PPAA / PPBB & Kode Terminasi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Sandi WMO PILOT FM 32 (PPAA & PPBB)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Data PiBal ditransmisikan secara global menggunakan sandi telegrafis 5-digit padat untuk jaringan GTS:
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-blue-700 font-bold font-sans block text-xs">Bagian A (PPAA) - Lapisan Isobarik Standar:</span>
                  <code className="text-[11px] text-slate-800">PPAA 51061 96805 55285 04509 25508 77999=</code>
                  <p className="text-[10px] text-slate-500 font-sans mt-1">
                    51061: Tgl 01 (+50 = satuan knot), jam 06 UTC, alat theodolite (1). 96805: Stasiun Cilacap.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-emerald-700 font-bold font-sans block text-xs">Bagian B (PPBB) - Ketinggian Geometris Signifikan:</span>
                  <code className="text-[11px] text-slate-800">PPBB 51061 96805 90/23 13007 12515 09013=</code>
                  <p className="text-[10px] text-slate-500 font-sans mt-1">
                    Grup 13007: Arah 130°, kecepatan 07 knot. Grup 12515: Arah 125°, kecepatan 15 knot.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Kode Alasan Resmi Terminasi Pelacakan (WMO)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pelacakan visual balon harus dihentikan ketika terhalang kondisi cuaca atau jarak jauh:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-blue-700">BB (Balloon Burst)</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Balon meledak akibat pemuaian di tekanan rendah.</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-amber-700">LIC (Lost in Cloud)</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Balon masuk ke dalam awan tebal (terbanyak di Cilacap, 62%).</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-purple-700">LL (Lost in Distance)</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Balon terbawa angin kencang hingga keluar jangkauan optik.</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700">HZ (Lost in Haze)</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Penglihatan terhalang partikel kabut/haze di lapisan batas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIGITALISASI SMARTPHONE THEODOLITE */}
      {activeTab === 'smartphone' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Smartphone className="w-5 h-5" /> Modernisasi Inovasi: Theodolit Berbantuan Smartphone Rig
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Stasiun Meteorologi Kelas III Tunggul Wulung Cilacap telah mengintegrasikan perangkat smartphone Android yang dipasang sejajar (<em>coaxial clamp</em>) pada laras theodolit optik meteorologi. Ponsel memanfaatkan rangkaian sensor inersia (Inertial Measurement Unit / IMU) bawaan untuk otomatisasi pembacaan sudut azimuth dan elevasi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-blue-700 font-bold text-sm block">1. Sumbu Elevasi (Pitch, θ)</span>
                <p className="text-slate-600 leading-relaxed">
                  Laras teleskop mendongak miring ke atas saat melacak balon $\rightarrow$ Sensor <strong>Accelerometer</strong> mengukur kemiringan fisik tabung terhadap vektor percepatan gravitasi bumi:
                </p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-blue-700 font-bold text-center">
                  θ = arctan( ay / √(ax² + az²) )
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-emerald-700 font-bold text-sm block">2. Sumbu Azimuth (Yaw, α)</span>
                <p className="text-slate-600 leading-relaxed">
                  Seluruh bodi theodolit berputar melingkar 360° pada bidang horizontal nivo datar $\rightarrow$ Sensor <strong>Gyroscope 3-Axis & Magnetometer</strong> mengintegrasikan laju putaran sudut dari acuan target Utara Sebenarnya (<em>True North</em>).
                </p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-emerald-700 font-bold text-center">
                  α = ∫ ω_z dt (Terkalibrasi 000.0°)
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-purple-700 font-bold text-sm block">3. Auto-Sampling Detik ke-60</span>
                <p className="text-slate-600 leading-relaxed">
                  Aplikasi mobile <em>PiBal Auto-Logger</em> membunyikan audio countdown pada detik 55-60. Tepat di detik ke-60, data sudut di-<em>freeze</em>, dihitung trigonometrinya secara instan, dan dimasukkan ke database tanpa human error.
                </p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-purple-700 font-bold text-center">
                  Audio: 5-4-3-2-1 BEEP! → CAPTURE
                </div>
              </div>
            </div>
          </div>

          {/* Keunggulan Sistem Baru vs Cara Manual Lama */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-sm font-bold text-slate-900 block">
              Evaluasi Komparasi: Metode Konvensional Nonius vs Sistem Smartphone Auto-Logger
            </span>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Parameter Evaluasi</th>
                    <th className="p-3 text-amber-700">Metode Konvensional (Sebelumnya)</th>
                    <th className="p-3 text-blue-700">Metode Smartphone IMU (Sekarang)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3 font-semibold">Beban Kerja Observer</td>
                    <td className="p-3 text-slate-500">Mata harus bolak-balik antara lensa okuler dan mikrometer skala sudut tiap 60 detik (sangat melelahkan).</td>
                    <td className="p-3 font-semibold text-emerald-700">Mata fokus 100% pada reticle okuler melacak balon; data sudut direkam otomatis oleh sistem.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Risiko Galat (Human Error)</td>
                    <td className="p-3 text-slate-500">Tinggi (kesalahan paralaks membaca garis skala nonius menit atau salah tulis di buku log).</td>
                    <td className="p-3 font-semibold text-emerald-700">Nol galat pembacaan visual; presisi digital hingga 0.1° secara konsisten.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Kecepatan Pelaporan Sandi</td>
                    <td className="p-3 text-slate-500">Memerlukan waktu 30-45 menit pasca-observasi untuk menghitung manual dengan kalkulator dan tabel reduksi.</td>
                    <td className="p-3 font-semibold text-emerald-700">Instan (&lt; 2 menit); tabel hodograph dan sandi PPAA/PPBB langsung ter-generate otomatis.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Keterlacakan Data</td>
                    <td className="p-3 text-slate-500">Tertulis di lembar kertas fisik yang rentan rusak atau hilang.</td>
                    <td className="p-3 font-semibold text-emerald-700">Tersimpan dalam format digital terstruktur (JSON, CSV) dengan jejak audit hash SHA-256.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GEOMETRI & TRIGONOMETRI 3D [BARU] */}
      {activeTab === 'geometri' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Triangle className="w-5 h-5" /> Geometri Koordinat Bola & Reduksi Posisi 3D Pilot Balon
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Sistem koordinat bola (<em>spherical polar coordinate</em>) digunakan oleh theodolit untuk menggambarkan posisi balon di angkasa menggunakan dua sudut: <strong>Azimuth (&alpha;)</strong> diukur dari arah Utara searah jarum jam (0&deg;&ndash;360&deg;), dan <strong>Elevasi (&theta;)</strong> diukur dari bidang horizontal ke arah atas (0&deg;&ndash;90&deg;). Dengan mengetahui laju kenaikan konstan balon, posisi 3D tepat dapat dihitung.
            </p>

            {/* Diagram SVG koordinat bola */}
            <div className="flex justify-center">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 w-full max-w-lg">
                <p className="text-[11px] font-bold text-slate-700 text-center mb-3">Diagram Koordinat Bola Theodolit PiBal</p>
                <svg viewBox="0 0 320 240" className="w-full max-h-56">
                  {/* Origin */}
                  <circle cx="80" cy="180" r="4" fill="#1d4ed8" />
                  <text x="60" y="196" fontSize="9" fill="#1d4ed8" fontWeight="bold">Theodolit</text>
                  {/* Horizontal ground plane */}
                  <ellipse cx="80" cy="180" rx="70" ry="18" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />
                  {/* Vertical axis Z */}
                  <line x1="80" y1="180" x2="80" y2="20" stroke="#64748b" strokeWidth="1.2" strokeDasharray="4 3" />
                  <text x="84" y="18" fontSize="9" fill="#64748b">Z (Vertikal)</text>
                  {/* North direction */}
                  <line x1="80" y1="180" x2="140" y2="162" stroke="#64748b" strokeWidth="1.2" strokeDasharray="4 3" />
                  <text x="142" y="160" fontSize="9" fill="#64748b">N (Utara)</text>
                  {/* Balloon position */}
                  <circle cx="220" cy="70" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                  <text x="232" y="68" fontSize="9" fill="#d97706" fontWeight="bold">Balon</text>
                  {/* Range line from origin to balloon */}
                  <line x1="80" y1="180" x2="220" y2="70" stroke="#2563eb" strokeWidth="2" />
                  <text x="138" y="115" fontSize="9" fill="#2563eb" fontWeight="bold" transform="rotate(-40 138 115)">r (Range)</text>
                  {/* Horizontal projection */}
                  <line x1="80" y1="180" x2="220" y2="160" stroke="#059669" strokeWidth="1.5" strokeDasharray="3 2" />
                  <line x1="220" y1="160" x2="220" y2="70" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" />
                  {/* D label */}
                  <text x="145" y="175" fontSize="9" fill="#059669" fontWeight="bold">D (Horizontal)</text>
                  {/* H label */}
                  <text x="225" y="120" fontSize="9" fill="#7c3aed" fontWeight="bold">H (Tinggi)</text>
                  {/* Theta arc */}
                  <path d="M 115 170 Q 125 155 118 148" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="128" y="160" fontSize="9" fill="#ef4444" fontWeight="bold">&theta; (Elev)</text>
                  {/* Alpha arc on ground */}
                  <path d="M 120 175 Q 122 165 132 163" fill="none" stroke="#0891b2" strokeWidth="1.5" />
                  <text x="112" y="155" fontSize="9" fill="#0891b2" fontWeight="bold">&alpha; (Az)</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Penurunan Rumus Lengkap */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              Penurunan Rumus Reduksi Posisi 3D (Step-by-Step)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <span className="font-bold text-blue-800 block mb-2">Langkah 1: Ketinggian Balon</span>
                  <p className="text-blue-900 text-[11px] leading-relaxed mb-2">
                    Balon naik dengan laju konstan V_z &asymp; 180 m/menit. Pada menit ke-t, ketinggian geometris balon di atas titik lepas adalah:
                  </p>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200 font-mono text-blue-700 font-bold text-center text-sm">
                    H = V_z &times; t
                  </div>
                  <p className="text-blue-800 text-[10px] mt-1.5">Contoh: t=5 menit &rarr; H = 180 &times; 5 = 900 m = &asymp; 2.953 ft</p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="font-bold text-emerald-800 block mb-2">Langkah 2: Jarak Horizontal</span>
                  <p className="text-emerald-900 text-[11px] leading-relaxed mb-2">
                    Dari trigonometri segitiga siku-siku (H sebagai sisi tegak, D sebagai sisi datar, &theta; sebagai sudut elevasi):
                  </p>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200 font-mono text-emerald-700 font-bold text-center text-sm">
                    D = H / tan(&theta;)
                  </div>
                  <p className="text-emerald-800 text-[10px] mt-1.5">Catatan: Jika &theta; = 90&deg; (tepat di atas), D = 0 (angin tenang, balon naik vertikal).</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <span className="font-bold text-purple-800 block mb-2">Langkah 3: Koordinat x dan y</span>
                  <p className="text-purple-900 text-[11px] leading-relaxed mb-2">
                    Proyeksikan jarak horizontal D pada sumbu Timur (x) dan Utara (y) menggunakan Azimuth &alpha;:
                  </p>
                  <div className="bg-white p-2.5 rounded-xl border border-purple-200 font-mono text-purple-700 font-bold text-center space-y-1">
                    <div>x = D &middot; sin(&alpha;)&nbsp;&nbsp;&nbsp;[Timur (+x)]</div>
                    <div>y = D &middot; cos(&alpha;)&nbsp;&nbsp;&nbsp;[Utara (+y)]</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="font-bold text-amber-800 block mb-2">Langkah 4: Vektor Angin Antar-Menit</span>
                  <p className="text-amber-900 text-[11px] leading-relaxed mb-2">
                    Angin = pergeseran posisi balon per satuan waktu. Vektor komponen dihitung dari selisih posisi antar dua menit berurutan:
                  </p>
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200 font-mono text-amber-800 font-bold space-y-1 text-center text-xs">
                    <div>u = (x_n - x_(n-1)) / &Delta;t&nbsp;&nbsp;&nbsp;[Komponen Barat-Timur]</div>
                    <div>v = (y_n - y_(n-1)) / &Delta;t&nbsp;&nbsp;&nbsp;[Komponen Selatan-Utara]</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-2">Langkah 5: Kecepatan & Arah Akhir</span>
                  <p className="text-slate-600 text-[11px] leading-relaxed mb-2">
                    Rekonstruksi kecepatan skalar dan arah datang angin meteorologi dari komponen u dan v:
                  </p>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 font-mono text-slate-700 font-bold space-y-1 text-center text-xs">
                    <div>ff = &radic;(u&sup2; + v&sup2;)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Kecepatan, knot]</div>
                    <div>dd = (270&deg; - atan2(v, u)) mod 360&deg;&nbsp;[Arah datang]</div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                  <span className="font-bold text-red-800 block mb-2">Koreksi Refraksi Atmosfer</span>
                  <p className="text-red-900 text-[11px] leading-relaxed mb-2">
                    Sinar cahaya yang melewati atmosfer mengalami pembiasan (refraksi). Sudut elevasi yang diamati observer sedikit lebih besar dari sudut geometrik sebenarnya, terutama pada elevasi rendah (&lt; 10&deg;):
                  </p>
                  <div className="bg-white p-2.5 rounded-xl border border-red-200 font-mono text-red-700 font-bold text-center text-xs">
                    &Delta;&theta;_refraksi &asymp; 1.02&quot; / tan(&theta; + 10.3&deg; / (&theta; + 5.11&deg;))
                  </div>
                  <p className="text-red-800 text-[10px] mt-1.5">Di Cilacap, koreksi refraksi biasanya diabaikan untuk &theta; &gt; 15&deg; (signifikan hanya &lt; 5&deg;).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Contoh Reduksi 7 Menit */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Tabel Contoh Reduksi 7 Menit Pertama PiBal Cilacap (26 Agustus 2026)
            </span>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">t (mnt)</th>
                    <th className="p-2.5">&alpha; (Az&deg;)</th>
                    <th className="p-2.5">&theta; (El&deg;)</th>
                    <th className="p-2.5 text-purple-700">H (m)</th>
                    <th className="p-2.5 text-emerald-700">D (m)</th>
                    <th className="p-2.5 text-blue-700">x (m)</th>
                    <th className="p-2.5 text-blue-700">y (m)</th>
                    <th className="p-2.5 text-amber-700">u (kt)</th>
                    <th className="p-2.5 text-amber-700">v (kt)</th>
                    <th className="p-2.5">ff (kt)</th>
                    <th className="p-2.5">dd (&deg;)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { t:1, az:140, el:69.5, H:180, D:68, x:44, y:-52, u:'—', v:'—', ff:'—', dd:'—' },
                    { t:2, az:138, el:52.2, H:360, D:279, x:187, y:-207, u:'-4.1', v:'-4.7', ff:'6.2', dd:'139' },
                    { t:3, az:136, el:41.0, H:540, D:620, x:431, y:-447, u:'-8.3', v:'-8.1', ff:'11.6', dd:'134' },
                    { t:4, az:172, el:36.5, H:720, D:976, x:136, y:-966, u:'5.3', v:'-19.2', ff:'20.0', dd:'164' },
                    { t:5, az:245, el:33.1, H:900, D:1383, x:-1254, y:-584, u:'-51.0', v:'14.5', ff:'53.0', dd:'286' },
                    { t:6, az:283, el:31.0, H:1080, D:1796, x:-1749, y:404, u:'-18.0', v:'33.8', ff:'38.2', dd:'332' },
                    { t:7, az:296, el:29.4, H:1260, D:2236, x:-2009, y:980, u:'-9.5', v:'19.8', ff:'22.0', dd:'334' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{row.t}</td>
                      <td className="p-2.5 text-amber-700">{row.az}</td>
                      <td className="p-2.5 text-red-600">{row.el}</td>
                      <td className="p-2.5 text-purple-700">{row.H}</td>
                      <td className="p-2.5 text-emerald-700">{row.D}</td>
                      <td className="p-2.5 text-blue-700">{row.x}</td>
                      <td className="p-2.5 text-blue-700">{row.y}</td>
                      <td className="p-2.5 text-amber-700">{row.u}</td>
                      <td className="p-2.5 text-amber-700">{row.v}</td>
                      <td className="p-2.5 font-bold">{row.ff}</td>
                      <td className="p-2.5 font-semibold">{row.dd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              * V_z = 180 m/menit. Satuan konversi: 1 knot = 1.852 km/jam = 0.5144 m/s. Kolom u dan v dalam knot dihitung dari &Delta;x/&Delta;t dan &Delta;y/&Delta;t masing-masing dibagi 60 detik lalu dikonversi.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: LAPISAN STANDAR WMO/ICAO [BARU] */}
      {activeTab === 'lapisan_wmo' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Layers className="w-5 h-5" /> Lapisan Isobarik Standar WMO/ICAO & Hubungannya dengan Sandi PiBal
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Atmosfer standar International Civil Aviation Organization (ICAO) mendefinisikan lapisan-lapisan tekanan tetap (isobarik) sebagai referensi ketinggian internasional. Data PiBal dilaporkan pada lapisan-lapisan ini dalam Bagian A sandi PPAA, sementara Bagian B (PPBB) melaporkan ketinggian geometris signifikan di antara lapisan standar tersebut.
            </p>

            {/* Tabel Lapisan Standar */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Tekanan (hPa)</th>
                    <th className="p-3">Ketinggian Standar (m)</th>
                    <th className="p-3">Ketinggian Standar (ft)</th>
                    <th className="p-3">Lapisan Atmosfer</th>
                    <th className="p-3">Kode Sandi PPAA</th>
                    <th className="p-3">Suhu Standar (&deg;C)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { hpa: 1013, m: 0, ft: 0, layer: 'Permukaan Laut (MSL)', code: '99xxx', temp: 15.0, color: 'bg-sky-50' },
                    { hpa: 850, m: 1457, ft: 4781, layer: 'Troposfer Bawah', code: '85xxx', temp: 5.0, color: 'bg-blue-50' },
                    { hpa: 700, m: 3012, ft: 9882, layer: 'Troposfer Bawah', code: '70xxx', temp: -4.5, color: 'bg-blue-50' },
                    { hpa: 500, m: 5574, ft: 18289, layer: 'Troposfer Tengah', code: '50xxx', temp: -21.2, color: 'bg-indigo-50' },
                    { hpa: 400, m: 7185, ft: 23574, layer: 'Troposfer Tengah', code: '40xxx', temp: -31.7, color: 'bg-indigo-50' },
                    { hpa: 300, m: 9164, ft: 30065, layer: 'Troposfer Atas', code: '30xxx', temp: -44.5, color: 'bg-purple-50' },
                    { hpa: 250, m: 10363, ft: 33999, layer: 'Troposfer Atas', code: '25xxx', temp: -52.4, color: 'bg-purple-50' },
                    { hpa: 200, m: 11784, ft: 38662, layer: 'Tropopause', code: '20xxx', temp: -56.5, color: 'bg-pink-50' },
                    { hpa: 150, m: 13608, ft: 44652, layer: 'Stratosfer Bawah', code: '15xxx', temp: -56.5, color: 'bg-rose-50' },
                    { hpa: 100, m: 16180, ft: 53083, layer: 'Stratosfer', code: '10xxx', temp: -56.5, color: 'bg-red-50' },
                  ].map((row, i) => (
                    <tr key={i} className={`${row.color} hover:brightness-95`}>
                      <td className="p-3 font-bold text-slate-900 font-mono">{row.hpa}</td>
                      <td className="p-3 font-mono text-emerald-700">{row.m.toLocaleString()}</td>
                      <td className="p-3 font-mono text-blue-700">{row.ft.toLocaleString()}</td>
                      <td className="p-3 font-semibold text-slate-700">{row.layer}</td>
                      <td className="p-3 font-mono text-purple-700">{row.code}</td>
                      <td className="p-3 font-mono text-slate-600">{row.temp > 0 ? '+' : ''}{row.temp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500">* Ketinggian berdasarkan ICAO Standard Atmosphere (ISA), suhu turun 6.5&deg;C/km hingga tropopause, kemudian isothermal.</p>
          </div>

          {/* Standard vs Significant Levels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Standard Level (Bagian A / PPAA)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lapisan tekanan tetap yang sudah ditentukan sebelumnya oleh WMO. Data angin dilaporkan pada lapisan-lapisan ini meskipun data mungkin diinterpolasi dari pengamatan di antara lapisan tersebut.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="font-bold text-blue-800 block">Lapisan Wajib Dilaporkan:</span>
                  <p className="text-blue-900 text-[11px] mt-1">Surface, 850, 700, 500, 400, 300, 250, 200, 150, 100 hPa</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Format Sandi PPAA:</span>
                  <code className="text-[11px] text-purple-700">92ppD ddff</code>
                  <p className="text-slate-600 text-[10px] mt-1">pp = level (85=850hPa, 70=700hPa, dll), D = designator, ddff = arah&kecepatan</p>
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <strong className="text-amber-800">Catatan PiBal Cilacap:</strong>
                <p className="text-amber-900 text-[11px] mt-1">
                  Balon PiBal biasanya hanya mencapai lapisan 700 hPa (&asymp; 3.000 m = 10.000 ft) sebelum terhalang awan. Lapisan 850 dan 700 hPa adalah yang paling konsisten dilaporkan.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                Significant Level (Bagian B / PPBB)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ketinggian geometris yang memiliki perubahan angin signifikan (angin berbelok drastis atau kecepatan berubah tajam). Tidak ada aturan ketinggian tetap &mdash; observer menentukan berdasarkan perubahan profil.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-800 block">Kriteria Significant Level:</span>
                  <ul className="text-emerald-900 text-[11px] mt-1 space-y-0.5 list-disc list-inside">
                    <li>Perubahan arah &ge; 30&deg; dari level sebelumnya</li>
                    <li>Perubahan kecepatan &ge; 10 knot dari level sebelumnya</li>
                    <li>Angin minimum atau maksimum lokal</li>
                    <li>Perubahan shear tajam (LLWS layer)</li>
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">Format Sandi PPBB:</span>
                  <code className="text-[11px] text-purple-700">nnn/m ddff ddff ddff</code>
                  <p className="text-slate-600 text-[10px] mt-1">nnn = ketinggian dalam ratusan kaki, m = urutan, ddff = angin tiap significant level</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Estimasi Durasi Pelacakan */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-sm font-bold text-slate-900">
              Estimasi Ketinggian Balon Berdasarkan Durasi Pelacakan (V_z = 180 m/menit)
            </span>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Durasi (mnt)</th>
                    <th className="p-2.5">H (m)</th>
                    <th className="p-2.5">H (ft)</th>
                    <th className="p-2.5">Tekanan Estimasi</th>
                    <th className="p-2.5">Lapisan Atmosfer</th>
                    <th className="p-2.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { t: 1, m: 180, ft: 591, p: '~1000 hPa', layer: 'Lapisan Permukaan', note: 'Angin permukaan' },
                    { t: 3, m: 540, ft: 1771, p: '~940 hPa', layer: 'Sub-cloud layer', note: 'Lapisan batas bawah' },
                    { t: 5, m: 900, ft: 2953, p: '~910 hPa', layer: 'Mixing Layer', note: 'Angin diurnal kuat' },
                    { t: 8, m: 1440, ft: 4724, p: '~860 hPa', layer: 'Menuju 850 hPa', note: 'Mendekati standar layer' },
                    { t: 10, m: 1800, ft: 5906, p: '~825 hPa', layer: 'Di atas 850 hPa', note: 'Biasanya dalam awan Cu' },
                    { t: 15, m: 2700, ft: 8858, p: '~730 hPa', layer: 'Menuju 700 hPa', note: 'Sering LIC di sini' },
                    { t: 17, m: 3060, ft: 10039, p: '~700 hPa', layer: '700 hPa Layer', note: 'Target PPAA' },
                    { t: 20, m: 3600, ft: 11811, p: '~660 hPa', layer: 'Di atas 700 hPa', note: 'Jarang tercapai di Cilacap' },
                    { t: 27, m: 4860, ft: 15945, p: '~570 hPa', layer: 'Troposfer tengah', note: 'Menuju 500 hPa' },
                    { t: 31, m: 5580, ft: 18307, p: '~500 hPa', layer: '500 hPa Layer', note: 'Sangat jarang di Cilacap' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{row.t}</td>
                      <td className="p-2.5 text-emerald-700">{row.m.toLocaleString()}</td>
                      <td className="p-2.5 text-blue-700">{row.ft.toLocaleString()}</td>
                      <td className="p-2.5 text-purple-700">{row.p}</td>
                      <td className="p-2.5 font-semibold text-slate-700">{row.layer}</td>
                      <td className="p-2.5 text-slate-500 font-sans">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SEJARAH & TOKOH UPPER-AIR */}
      {activeTab === 'sejarah' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-1">
              <History className="w-4 h-4" /> Kronologi Evolusi Observasi Angin Udara Atas (1783 - Sekarang)
            </div>
            <p className="text-xs text-slate-600">
              Perkembangan metode Pilot Balon dari eksperimen awal balon gas hingga dibakukan oleh World Meteorological Organization (WMO):
            </p>
          </div>

          <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6 text-xs">
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
              <span className="font-bold text-blue-700 block text-sm">1783: Jacques Charles (Prancis)</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Penerbangan balon gas hidrogen berawak pertama di dunia. Menjadi tonggak sejarah pembuktian bahwa gas hidrogen dapat dimanfaatkan untuk mengangkat muatan ke lapisan atmosfer bebas.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
              <span className="font-bold text-blue-700 block text-sm">1809: Thomas Forster (Inggris)</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Pemanfaatan balon karet kecil tak berawak pertama secara khusus untuk melacak arah dan pergerakan aliran angin atmosfer pada berbagai lapisan ketinggian.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
              <span className="font-bold text-blue-700 block text-sm">1870 - 1880: Paul Schreiber (Jerman)</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Pengembangan instrumen theodolit khusus dan perumusan tabel reduksi trigonometri untuk menghitung vektor angin dari sudut azimuth dan elevasi.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white"></div>
              <span className="font-bold text-emerald-700 block text-sm">1905: Alfred de Quervain (Swiss) — Standar Pilot Balon</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Merancang theodolit optik meteorologi modern pertama dengan prisma pentagonal khusus yang memungkinkan observer mengarahkan tabung tegak lurus hingga 90&deg; tanpa leher pegal. Metode ini resmi dinamai <strong>Pilot Balloon (PIBAL)</strong>.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
              <span className="font-bold text-blue-700 block text-sm">1909: U.S. Weather Bureau (Amerika Serikat)</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Operasionalisasi jaringan stasiun pengamatan PiBal harian berskala nasional pertama untuk mendukung keselamatan penerbangan pesawat pos udara.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-amber-600 border-2 border-white"></div>
              <span className="font-bold text-amber-700 block text-sm">1946: Konvensi Chicago & Awal ICAO</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                International Civil Aviation Organization (ICAO) didirikan dan menetapkan lapisan tekanan standar (1013 hPa hingga 100 hPa) sebagai referensi ketinggian penerbangan internasional. Data PiBal diintegrasikan ke dalam prosedur keselamatan penerbangan global.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-purple-600 border-2 border-white"></div>
              <span className="font-bold text-purple-700 block text-sm">1929 - Sekarang: Standarisasi WMO No. 8</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Metode PiBal dibakukan oleh World Meteorological Organization dalam dokumen resmi <strong>WMO No. 8 (Guide to Meteorological Instruments and Methods of Observation)</strong> sebagai metode observasi aerologi standar internasional yang andal, murah, dan mandiri.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-sky-600 border-2 border-white"></div>
              <span className="font-bold text-sky-700 block text-sm">2022-2026: Era Digitalisasi IMU — Inovasi Cilacap</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                Stasiun Meteorologi Tunggul Wulung Cilacap menjadi pelopor integrasi smartphone berbasis sensor IMU sebagai pengganti pembacaan skala nonius manual. Inovasi ini meningkatkan akurasi, kecepatan pelaporan, dan keterlacakan data secara signifikan tanpa mengganti perangkat theodolit utama.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: KESALAHAN & QUALITY CONTROL DATA [BARU] */}
      {activeTab === 'qc_data' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Jenis Galat Sistematis & Metode Quality Control Data PiBal
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              Data PiBal rentan terhadap berbagai jenis galat sistematis maupun acak. BMKG menerapkan prosedur Quality Control (QC) berlapis untuk memastikan data yang diterbitkan memenuhi standar akurasi WMO sebelum ditransmisikan ke jaringan GTS global.
            </p>
          </div>

          {/* 5 Jenis Galat */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-sm font-bold text-slate-900 block">5 Jenis Galat Sistematis dalam Pengamatan PiBal</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-bold text-red-800">1. Galat Paralaks</span>
                </div>
                <p className="text-red-900 leading-relaxed text-[11px]">
                  Terjadi ketika observer membaca skala nonius dari sudut yang tidak tepat tegak lurus, menyebabkan pembacaan azimuth atau elevasi yang berbeda dari nilai sebenarnya. Umumnya &plusmn;0.5&deg; hingga &plusmn;1.0&deg;.
                </p>
                <div className="p-2 bg-white rounded-lg border border-red-200 text-[10px] text-red-700 font-semibold">
                  Mitigasi: Selalu baca dari posisi sejajar mata dengan skala.
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-amber-800">2. Galat Refraksi Atmosfer</span>
                </div>
                <p className="text-amber-900 leading-relaxed text-[11px]">
                  Sinar cahaya yang melewati lapisan atmosfer dengan kerapatan berbeda mengalami pembiasan (bending), menyebabkan sudut elevasi optik sedikit lebih besar dari sudut geometrik nyata.  Signifikan di elevasi &lt; 5&deg;.
                </p>
                <div className="p-2 bg-white rounded-lg border border-amber-200 text-[10px] text-amber-700 font-semibold">
                  Mitigasi: Terapkan koreksi tabel refraksi standar WMO.
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="font-bold text-orange-800">3. Drift Laju Naik Non-Linier</span>
                </div>
                <p className="text-orange-900 leading-relaxed text-[11px]">
                  Asumsi V_z konstan tidak 100% akurat. Balon mengalami percepatan awal saat pertama dilepas, kemudian melambat di lapisan stratosfer. Juga dipengaruhi angin vertikal (updraft/downdraft) aktif.
                </p>
                <div className="p-2 bg-white rounded-lg border border-orange-200 text-[10px] text-orange-700 font-semibold">
                  Mitigasi: Kalibrasi free lift ulang tiap musim atau kondisi cuaca ekstrem.
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-bold text-purple-800">4. Kesalahan Nivo (Leveling Error)</span>
                </div>
                <p className="text-purple-900 leading-relaxed text-[11px]">
                  Jika piringan horisontal theodolit tidak benar-benar datar (gelembung nivo tidak tepat di tengah), semua pembacaan azimuth akan mengandung error sistematis. Error 1 mm pada nivo &asymp; 0.3&deg; kesalahan.
                </p>
                <div className="p-2 bg-white rounded-lg border border-purple-200 text-[10px] text-purple-700 font-semibold">
                  Mitigasi: Cek dan setel nivo setiap sebelum pengamatan, terutama setelah hujan.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
                  <span className="font-bold text-slate-800">5. Error Sinkronisasi Waktu</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Observer terlambat 2&ndash;5 detik dalam menekan tombol sampel saat stopwatch berbunyi menyebabkan data diambil bukan tepat pada menit ke-n tetapi saat balon sudah bergerak lebih jauh.
                </p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-[10px] text-slate-700 font-semibold">
                  Mitigasi: Sistem auto-countdown audio + capture IMU menghilangkan error ini.
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-bold text-blue-800">6. Galat Pembacaan Skala Nonius</span>
                </div>
                <p className="text-blue-900 leading-relaxed text-[11px]">
                  Skala nonius vernier pada theodolit optik mengharuskan observer mengestimasi garis antara dua graduasi. Pada kondisi cahaya redup atau kelelahan mata, error &plusmn;0.5&deg; umum terjadi.
                </p>
                <div className="p-2 bg-white rounded-lg border border-blue-200 text-[10px] text-blue-700 font-semibold">
                  Mitigasi: Sistem digital IMU eliminasi galat ini sepenuhnya.
                </div>
              </div>
            </div>
          </div>

          {/* Prosedur QC */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Prosedur Quality Control BMKG (4 Lapisan)
              </span>
              <div className="space-y-3 text-xs">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">1</div>
                  <div>
                    <span className="font-bold text-slate-800 block">Range Check (Pemeriksaan Batas)</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">Kecepatan angin harus dalam rentang fisik: 0 &le; ff &le; 150 knot. Arah angin: 0&deg; &le; dd &le; 360&deg;. Data di luar batas langsung ditandai flag 3 (curiga).</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">2</div>
                  <div>
                    <span className="font-bold text-slate-800 block">Internal Consistency Check</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">Perubahan angin antar-level tidak boleh melebihi ambang fisik: &Delta;ff &lt; 50 knot/1000 ft dan &Delta;dd &lt; 180&deg;/1000 ft tanpa shear layer yang valid.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">3</div>
                  <div>
                    <span className="font-bold text-slate-800 block">Temporal Consistency Check</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">Dibandingkan dengan data 5 hari sebelumnya pada jam yang sama. Nilai yang melebihi &plusmn;3&sigma; dari rata-rata klimatologis ditandai flag 2 (perlu verifikasi manual).</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs shrink-0">4</div>
                  <div>
                    <span className="font-bold text-slate-800 block">Spatial Consistency Check</span>
                    <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">Dibandingkan dengan data stasiun tetangga (Semarang, Yogyakarta, Banyuwangi). Anomali yang tidak konsisten secara spasial ditandai untuk review forecaster.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <span className="text-sm font-bold text-slate-900">
                Flag Kualitas Data (Quality Flag / QF) WMO
              </span>
              <div className="space-y-2 text-xs">
                {[
                  { flag: '0', label: 'PASS — Data Valid', desc: 'Lulus semua uji QC. Data dapat langsung digunakan untuk analisis dan transmisi GTS.', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                  { flag: '1', label: 'INTERPOLASI', desc: 'Data tidak diukur langsung melainkan diinterpolasi dari level di atasnya dan bawahnya. Valid tetapi akurasi berkurang.', color: 'bg-blue-50 border-blue-200 text-blue-800' },
                  { flag: '2', label: 'CURIGA (Suspect)', desc: 'Nilai melewati batas statistik temporal atau spasial. Perlu verifikasi manual oleh forecaster sebelum digunakan.', color: 'bg-amber-50 border-amber-200 text-amber-800' },
                  { flag: '3', label: 'MISSING DATA', desc: 'Data tidak tersedia untuk level ini. Dapat karena terminasi dini (LIC/BB) atau kesalahan peralatan.', color: 'bg-slate-50 border-slate-200 text-slate-700' },
                  { flag: '9', label: 'DITOLAK (Reject)', desc: 'Data gagal uji range check atau internal consistency. Ditandai salah dan tidak boleh digunakan dalam analisis.', color: 'bg-red-50 border-red-200 text-red-800' },
                ].map((item, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${item.color} flex items-start gap-3`}>
                    <div className="w-7 h-7 rounded-lg bg-white border border-current font-mono font-extrabold text-sm flex items-center justify-center shrink-0">
                      {item.flag}
                    </div>
                    <div>
                      <span className="font-bold block text-[11px]">{item.label}</span>
                      <p className="text-[10px] leading-relaxed mt-0.5 opacity-80">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INFOGRAFIS POSTER & DOKUMEN PDF */}
      {activeTab === 'poster' && (
        <div className="space-y-6">
          {/* High-Resolution Poster Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Infografis Resmi BMKG</span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Poster Komprehensif Pengamatan Pilot Balon (PiBal) & Hodograph
                </h3>
                <p className="text-xs text-slate-500">
                  Stasiun Meteorologi Kelas III Tunggul Wulung Cilacap • Edisi Lengkap Periode Agustus 2026
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
                  title="Perbesar Layar Penuh"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Buka Layar Penuh (Zoom)</span>
                </button>
                <a
                  href="/docs/infografis_komprehensif_pibal_hodograph.png"
                  download="Infografis_PiBal_Hodograph_Cilacap.png"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
                  title="Unduh Berkas Gambar PNG Asli"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Unduh Poster HD</span>
                </a>
              </div>
            </div>

            {/* Poster Preview Container */}
            <div 
              onClick={() => setLightboxOpen(true)}
              className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group shadow-inner flex items-center justify-center p-2"
            >
              <img
                src="/docs/infografis_komprehensif_pibal_hodograph.png"
                alt="Infografis Komprehensif PiBal BMKG Cilacap"
                className="w-full max-h-[620px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 px-4 py-2 rounded-2xl text-blue-700 text-xs font-bold shadow-lg flex items-center gap-2">
                  <Maximize2 className="w-4 h-4" /> Klik untuk Memperbesar Gambar
                </div>
              </div>
            </div>
          </div>

          {/* Download Official PDFs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Dokumen 1 (20 Halaman)
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Modul Operasional Pengamatan Pilot Balon & Analisis Hodograph
                </h4>
                <p className="text-xs text-slate-500">
                  Kajian alur kerja digital, sensor IMU theodolit, profil vertikal angin, dan glosarium istilah BMKG Cilacap.
                </p>
              </div>
              <a
                href="/docs/modul_operasional_pibal_hodograph.pdf"
                download="Modul_Operasional_PiBal_Hodograph_Cilacap.pdf"
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md shrink-0"
                title="Unduh Modul PDF"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  Dokumen 2 (16 Halaman Master Edition)
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Buku Panduan Lengkap PiBal & Dinamika Hodograph Master Edition
                </h4>
                <p className="text-xs text-slate-500">
                  Buku ajar komprehensif: teori fisika, penurunan matematis eksak, parameter Coriolis BBS vs BBU, dan dinamika badai.
                </p>
              </div>
              <a
                href="/docs/Buku_Panduan_Lengkap_Pibal_dan_Hodograph_Master_Edition.pdf"
                download="Buku_Panduan_Master_Edition_PiBal_Hodograph.pdf"
                className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl transition-all shadow-md shrink-0"
                title="Unduh Buku Master PDF"
              >
                <Download className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Poster */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between text-white pb-3">
            <span className="font-bold text-sm">Pratinjau Infografis Resolusi Tinggi - PiBal BMKG Cilacap</span>
            <div className="flex items-center gap-3">
              <a
                href="/docs/infografis_komprehensif_pibal_hodograph.png"
                download="Infografis_PiBal_Hodograph_Cilacap.png"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" /> Unduh Gambar
              </a>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto rounded-2xl bg-slate-950/50 flex items-center justify-center p-2">
            <img
              src="/docs/infografis_komprehensif_pibal_hodograph.png"
              alt="Infografis Komprehensif PiBal BMKG Cilacap"
              className="max-w-none max-h-none w-auto h-auto object-contain cursor-zoom-out"
              onClick={() => setLightboxOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationPiBalView;
