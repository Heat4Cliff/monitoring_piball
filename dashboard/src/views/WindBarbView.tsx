import React, { useState, useMemo } from 'react';
import { PibalBundle } from '../types/pibal';
import { WindBarbSvg } from '../components/WindBarbSvg';
import { SourceBadge } from '../components/SourceBadge';
import { 
  Wind, 
  Compass, 
  Layers, 
  Sparkles, 
  Sliders, 
  HelpCircle, 
  Info, 
  Calendar, 
  ArrowUpRight, 
  Globe, 
  ChevronRight, 
  CheckCircle2,
  Table,
  BookOpen
} from 'lucide-react';

interface WindBarbViewProps {
  data: PibalBundle;
  selectedObsId: string;
  onSelectObservation: (obsId: string) => void;
}

export const WindBarbView: React.FC<WindBarbViewProps> = ({
  data,
  selectedObsId,
  onSelectObservation
}) => {
  const { analysis_observations } = data;

  // Active sub-tab mode: 'sounding' | 'curtain' | 'playground' | 'guide'
  const [activeMode, setActiveMode] = useState<'sounding' | 'curtain' | 'playground' | 'guide'>('sounding');

  // Hemisphere setting: default to 'south' for Cilacap (07°38' LS)
  const [hemisphere, setHemisphere] = useState<'south' | 'north'>('south');

  // Interactive Playground States
  const [testSpeed, setTestSpeed] = useState<number>(25);
  const [testDir, setTestDir] = useState<number>(135);

  // Selected observation
  const primaryObs = useMemo(() => {
    return analysis_observations.find(o => o.observation_id === selectedObsId) || analysis_observations[0];
  }, [analysis_observations, selectedObsId]);

  // Speed color helper
  const getSpeedColor = (speed: number) => {
    if (speed < 5) return '#64748b'; // slate
    if (speed < 10) return '#059669'; // emerald
    if (speed < 20) return '#0284c7'; // sky
    if (speed < 30) return '#d97706'; // amber
    return '#e11d48'; // rose
  };

  // Convert degrees to cardinal string (e.g. 135 -> Tenggara / SE)
  const degToCardinal = (deg: number) => {
    const val = Math.floor((deg / 22.5) + 0.5);
    const arr = [
      'Utara (N)', 'Utara Timur Laut (NNE)', 'Timur Laut (NE)', 'Timur Timur Laut (ENE)',
      'Timur (E)', 'Timur Menenggara (ESE)', 'Tenggara (SE)', 'Selatan Menenggara (SSE)',
      'Selatan (S)', 'Selatan Barat Daya (SSW)', 'Barat Daya (SW)', 'Barat Menghadap BD (WSW)',
      'Barat (W)', 'Barat Menghadap BL (WNW)', 'Barat Laut (NW)', 'Utara Barat Laut (NNW)'
    ];
    return arr[val % 16];
  };

  // Playground Barb Breakdown
  const playgroundBreakdown = useMemo(() => {
    const rounded = Math.round(testSpeed / 5) * 5;
    const pennants = Math.floor(rounded / 50);
    const rem = rounded % 50;
    const full = Math.floor(rem / 10);
    const half = Math.floor((rem % 10) / 5);

    const rad = (testDir * Math.PI) / 180;
    const u = -testSpeed * Math.sin(rad);
    const v = -testSpeed * Math.cos(rad);

    return {
      rounded,
      pennants,
      full,
      half,
      u: Number(u.toFixed(1)),
      v: Number(v.toFixed(1)),
      isCalm: testSpeed < 2.5
    };
  }, [testSpeed, testDir]);

  // Standard levels for Time-Height Curtain
  const standardCurtainLevels = [1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 30000, 35000];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-blue-600" /> Simbol Meteorologi WMO
            </span>
            <SourceBadge sourceFile={primaryObs.source_file} sourcePage={2} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Visualisasi Bulu Angin (Wind Barbs) & Panduan Lengkap
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Eksplorasi profil vertikal bulu angin, matriks evolusi waktu-ketinggian 21 hari, simulator interaktif, dan panduan standar WMO.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Observation Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <select
              value={selectedObsId}
              onChange={(e) => onSelectObservation(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer font-semibold"
            >
              {analysis_observations.map(obs => (
                <option key={obs.observation_id} value={obs.observation_id} className="bg-white text-slate-900">
                  {obs.date_iso} ({obs.statistics.max_altitude_ft} ft)
                </option>
              ))}
            </select>
          </div>

          {/* Hemisphere Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-[10px] text-slate-600 px-2 font-mono hidden sm:inline">Belahan Bumi:</span>
            <button
              onClick={() => setHemisphere('south')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1 ${
                hemisphere === 'south'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Belahan Bumi Selatan (Lokasi Cilacap: 07°38' LS)"
            >
              <Globe className="w-3 h-3" /> BBS (Cilacap)
            </button>
            <button
              onClick={() => setHemisphere('north')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1 ${
                hemisphere === 'north'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Belahan Bumi Utara"
            >
              <Globe className="w-3 h-3" /> BBU
            </button>
          </div>
        </div>
      </div>

      {/* Mode Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveMode('sounding')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'sounding'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Profil Vertikal Kolom ({primaryObs.date_iso})
        </button>

        <button
          onClick={() => setActiveMode('curtain')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'curtain'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          Matriks Waktu-Ketinggian (21 Hari)
        </button>

        <button
          onClick={() => setActiveMode('playground')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'playground'
              ? 'bg-amber-500 text-white shadow-sm font-extrabold'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Simulator & Dekomposer Interaktif
        </button>

        <button
          onClick={() => setActiveMode('guide')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'guide'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Panduan Teori & Anatomi Bulu Angin
        </button>
      </div>

      {/* MODE 1: PROFIL VERTIKAL SOUNDING KOLOM BULU ANGIN */}
      {activeMode === 'sounding' && (
        <div className="space-y-4">
          {/* Quick Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Ketinggian Puncak</span>
              <strong className="text-base text-amber-600 font-mono">
                {primaryObs.statistics.max_altitude_ft.toLocaleString()} ft
              </strong>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Kecepatan Puncak</span>
              <strong className="text-base text-rose-600 font-mono">
                {primaryObs.statistics.max_speed_kt} knot
              </strong>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Kecepatan Rata-rata</span>
              <strong className="text-base text-blue-600 font-mono">
                {primaryObs.statistics.mean_speed_kt.toFixed(1)} knot
              </strong>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 block">Lapisan Teramati</span>
              <strong className="text-base text-emerald-600 font-mono">
                {primaryObs.statistics.total_levels} Level
              </strong>
            </div>
          </div>

          {/* Vertical Sounding Card Stack */}
          <div className="p-5 bg-white rounded-[22px] border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Kolom Profil Vertikal Bulu Angin Tanggal {primaryObs.date_iso}
                </h3>
                <p className="text-xs text-slate-500">
                  Disusun dari lapisan tertinggi (puncak) hingga lapisan permukaan (bawah) sesuai urutan atmosferik.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> &lt;10 kt</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> 10-20 kt</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 20-30 kt</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> &gt;30 kt</span>
              </div>
            </div>

            {/* List of Vertical Levels in Reverse Order (Top to Bottom) */}
            <div className="divide-y divide-slate-100">
              {[...primaryObs.hodograph_points].reverse().map((level, idx) => {
                const color = getSpeedColor(level.speed_kt);
                const roundedSpeed = Math.round(level.speed_kt / 5) * 5;
                const p50 = Math.floor(roundedSpeed / 50);
                const r50 = roundedSpeed % 50;
                const f10 = Math.floor(r50 / 10);
                const h5 = Math.floor((r50 % 10) / 5);

                const barbDesc = [];
                if (p50 > 0) barbDesc.push(`${p50} Bendera (50kt)`);
                if (f10 > 0) barbDesc.push(`${f10} Bulu Panjang (10kt)`);
                if (h5 > 0) barbDesc.push(`${h5} Bulu Pendek (5kt)`);
                if (barbDesc.length === 0) barbDesc.push('Angin Tenang (Calm)');

                return (
                  <div 
                    key={level.height_ft}
                    className="py-3 px-3 hover:bg-slate-50 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Altitude & Badge */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-mono font-bold text-blue-600 text-xs shadow-xs">
                        {level.height_ft >= 10000 ? `${(level.height_ft / 1000).toFixed(0)}k` : `${level.height_ft}`}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {level.height_ft.toLocaleString()} ft
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {level.height_m.toLocaleString()} m MSL
                        </div>
                      </div>
                    </div>

                    {/* Center: Wind Barb SVG Graphic */}
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                      <WindBarbSvg
                        speedKt={level.speed_kt}
                        directionDeg={level.direction_deg}
                        hemisphere={hemisphere}
                        size={56}
                        color={color}
                        strokeWidth={2}
                      />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-800">
                          {level.direction_deg}° ({degToCardinal(level.direction_deg)})
                        </div>
                        <div className="text-[11px] font-mono font-semibold" style={{ color }}>
                          {level.speed_kt} knot ({(level.speed_kt * 0.514444).toFixed(1)} m/s)
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {barbDesc.join(' + ')}
                        </div>
                      </div>
                    </div>

                    {/* Right: Meteorological Vector & Advection */}
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Zonal (U) / Meridional (V)</span>
                        <span className="text-slate-700">
                          U: <strong className="text-sky-700">{level.u}</strong> | V: <strong className="text-indigo-700">{level.v}</strong>
                        </span>
                      </div>

                      {level.advection && (
                        <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          level.advection.includes('Warm')
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        }`}>
                          {level.advection}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: MATRIKS WAKTU-KETINGGIAN 21 HARI (TIME-HEIGHT CURTAIN) */}
      {activeMode === 'curtain' && (
        <div className="p-5 bg-white rounded-[22px] border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-emerald-600" />
              Matriks Waktu-Ketinggian Bulu Angin (Agustus 2026)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Setiap sel menampilkan simbol bulu angin aktual pada hari dan level ketinggian terkait. Menggambarkan stabilitas angin pasat tenggara (Monsun Dingin Australia) di lapisan bawah.
            </p>
          </div>

          {/* Scrollable Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-2.5 text-left font-bold text-slate-700 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 min-w-[100px]">
                    Ketinggian (ft)
                  </th>
                  {analysis_observations.map(obs => (
                    <th 
                      key={obs.observation_id} 
                      className={`p-2.5 text-center font-mono font-bold cursor-pointer transition-colors ${
                        obs.observation_id === selectedObsId ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      onClick={() => onSelectObservation(obs.observation_id)}
                      title={`Klik untuk memilih pengamatan ${obs.date_iso}`}
                    >
                      {obs.date_iso.slice(5)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {[...standardCurtainLevels].reverse().map(targetAlt => (
                  <tr key={targetAlt} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-200">
                      {targetAlt.toLocaleString()} ft
                    </td>
                    {analysis_observations.map(obs => {
                      const matchedLevel = obs.hodograph_points.find(p => p.height_ft === targetAlt);
                      if (!matchedLevel) {
                        return (
                          <td key={obs.observation_id} className="p-2 text-center text-slate-400">
                            -
                          </td>
                        );
                      }
                      const col = getSpeedColor(matchedLevel.speed_kt);
                      return (
                        <td 
                          key={obs.observation_id} 
                          className="p-1 text-center hover:bg-slate-100/80 transition-colors"
                          title={`${obs.date_iso} | ${targetAlt} ft: ${matchedLevel.direction_deg}° / ${matchedLevel.speed_kt} kt`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <WindBarbSvg
                              speedKt={matchedLevel.speed_kt}
                              directionDeg={matchedLevel.direction_deg}
                              hemisphere={hemisphere}
                              size={36}
                              color={col}
                              strokeWidth={1.5}
                              showCenterDot={false}
                            />
                            <span className="text-[9px] text-slate-500 font-semibold">
                              {matchedLevel.speed_kt}kt
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 3: SIMULATOR & DEKOMPOSER INTERAKTIF BULU ANGIN */}
      {activeMode === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Sliders & Controls */}
          <div className="lg:col-span-6 p-6 bg-white rounded-[22px] border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                Kontrol Parameter Bulu Angin
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Geser slider untuk melihat bagaimana kecepatan dan arah angin diuraikan menjadi simbol standar WMO.
              </p>
            </div>

            {/* Speed Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Kecepatan Angin (Wind Speed):</span>
                <span className="font-mono font-bold text-amber-600 text-sm">{testSpeed} knot ({(testSpeed * 0.514444).toFixed(1)} m/s)</span>
              </div>
              <input
                type="range"
                min={0}
                max={120}
                step={1}
                value={testSpeed}
                onChange={(e) => setTestSpeed(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              {/* Speed Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[0, 5, 10, 15, 20, 25, 35, 50, 65, 85, 100].map(s => (
                  <button
                    key={s}
                    onClick={() => setTestSpeed(s)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      testSpeed === s ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {s}kt
                  </button>
                ))}
              </div>
            </div>

            {/* Direction Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Arah Angin (Wind Direction):</span>
                <span className="font-mono font-bold text-blue-600 text-sm">{testDir}° ({degToCardinal(testDir)})</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={5}
                value={testDir}
                onChange={(e) => setTestDir(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              {/* Direction Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: 'Utara (0°)', val: 0 },
                  { label: 'Timur (90°)', val: 90 },
                  { label: 'Selatan (180°)', val: 180 },
                  { label: 'Barat (270°)', val: 270 },
                  { label: 'Tenggara (135°)', val: 135 },
                  { label: 'Timur Laut (45°)', val: 45 },
                  { label: 'Barat Daya (225°)', val: 225 },
                  { label: 'Barat Laut (315°)', val: 315 }
                ].map(d => (
                  <button
                    key={d.val}
                    onClick={() => setTestDir(d.val)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold transition-all truncate ${
                      testDir === d.val ? 'bg-blue-600 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Live Jumbo Graphic & Symbolic Breakdown */}
          <div className="lg:col-span-6 p-6 bg-white rounded-[22px] border border-slate-200 shadow-sm flex flex-col justify-between gap-6">
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 relative">
              <span className="absolute top-3 left-3 text-[10px] font-mono text-slate-500 uppercase font-semibold">
                Render Bulu Angin ({hemisphere.toUpperCase()})
              </span>

              {/* Jumbo SVG */}
              <WindBarbSvg
                speedKt={testSpeed}
                directionDeg={testDir}
                hemisphere={hemisphere}
                size={160}
                color={getSpeedColor(testSpeed)}
                strokeWidth={3}
                className="my-2 filter drop-shadow-sm"
              />

              <div className="text-center mt-2">
                <div className="text-lg font-bold text-slate-900 font-mono">
                  {testDir}° / {testSpeed} knot
                </div>
                <div className="text-xs text-slate-600">
                  Angin berhembus <strong>DARI</strong> {degToCardinal(testDir)}
                </div>
              </div>
            </div>

            {/* Mathematical Breakdown Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-2">
                <span>Dekomposisi Simbolik WMO:</span>
                <span className="font-mono text-amber-600 font-bold">Pembulatan: {playgroundBreakdown.rounded} kt</span>
              </div>

              {playgroundBreakdown.isCalm ? (
                <div className="text-emerald-700 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Kecepatan &lt; 2.5 knot: Digambarkan sebagai <strong>Lingkaran Tenang (Calm Wind)</strong> tanpa poros batang.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block">Bendera (50 kt)</span>
                    <strong className="text-rose-600 text-sm">{playgroundBreakdown.pennants} buah</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block">Bulu Panjang (10 kt)</span>
                    <strong className="text-blue-600 text-sm">{playgroundBreakdown.full} buah</strong>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block">Bulu Pendek (5 kt)</span>
                    <strong className="text-emerald-600 text-sm">{playgroundBreakdown.half} buah</strong>
                  </div>
                </div>
              )}

              {/* Trigonometric Components */}
              <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-600">
                <span>Komponen Zonal (U): <strong className="text-sky-700">{playgroundBreakdown.u} kt</strong></span>
                <span>Komponen Meridional (V): <strong className="text-indigo-700">{playgroundBreakdown.v} kt</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: PANDUAN TEORI & ANATOMI BULU ANGIN */}
      {activeMode === 'guide' && (
        <div className="space-y-6">
          {/* Scientific Guide Article */}
          <div className="p-6 bg-white rounded-[22px] border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">
                Landasan Teori & Standar Meteorologi Internasional (WMO No. 9 / No. 306)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-700 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-blue-700 text-sm flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-600" /> 1. Poros Batang (Staff)
                </h4>
                <p className="text-slate-600">
                  Batang bulu angin selalu menunjuk ke <strong>arah asal datangnya angin</strong> (*where wind blows from*), dengan titik pangkal terikat pada stasiun pengamatan.
                </p>
                <div className="p-2 bg-white rounded border border-slate-200 text-[11px] font-mono text-slate-700">
                  Contoh: Batang menunjuk Tenggara (135°) = Angin datang dari Tenggara menuju Barat Laut.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-amber-700 text-sm flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-600" /> 2. Nilai Bobot Bulu
                </h4>
                <ul className="space-y-1.5 text-slate-600">
                  <li>• <strong>Bendera Segitiga (Pennant):</strong> Bernilai <strong>50 knot</strong> (atau 25 m/s).</li>
                  <li>• <strong>Bulu Panjang (Full Barb):</strong> Bernilai <strong>10 knot</strong> (atau 5 m/s).</li>
                  <li>• <strong>Bulu Pendek (Half Barb):</strong> Bernilai <strong>5 knot</strong> (atau 2.5 m/s).</li>
                  <li>• <strong>Lingkaran Konsentris:</strong> Angin tenang (&lt; 2.5 knot).</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-600" /> 3. Kaidah Belahan Bumi
                </h4>
                <p className="text-slate-600">
                  Posisi bulu mengikuti sisi gradien tekanan rendah:
                </p>
                <ul className="space-y-1 text-slate-600">
                  <li>• <strong>BBU:</strong> Bulu di sisi <em>kanan</em> batang (tekanan rendah di kiri aliran).</li>
                  <li>• <strong>BBS (Cilacap 07°38' LS):</strong> Bulu digambar di sisi <em>kiri</em> batang menghadap pusat tekanan rendah Belahan Bumi Selatan.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Visual Reference Grid (Standard WMO Symbols) */}
          <div className="p-6 bg-white rounded-[22px] border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tabel Referensi Cepat Simbol Bulu Angin Standar WMO
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { speed: 0, dir: 0, label: 'Calm (< 2.5 kt)', desc: 'Lingkaran Tenang' },
                { speed: 5, dir: 135, label: '5 Knot', desc: '1 Bulu Pendek' },
                { speed: 10, dir: 135, label: '10 Knot', desc: '1 Bulu Panjang' },
                { speed: 15, dir: 135, label: '15 Knot', desc: '1 Panjang + 1 Pendek' },
                { speed: 20, dir: 135, label: '20 Knot', desc: '2 Bulu Panjang' },
                { speed: 25, dir: 135, label: '25 Knot', desc: '2 Panjang + 1 Pendek' },
                { speed: 30, dir: 135, label: '30 Knot', desc: '3 Bulu Panjang' },
                { speed: 50, dir: 135, label: '50 Knot', desc: '1 Bendera Segitiga' },
                { speed: 65, dir: 135, label: '65 Knot', desc: '1 Bendera + 1 Panjang + 1 Pendek' },
                { speed: 100, dir: 135, label: '100 Knot', desc: '2 Bendera Segitiga' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-between text-center gap-2">
                  <WindBarbSvg
                    speedKt={item.speed}
                    directionDeg={item.dir}
                    hemisphere={hemisphere}
                    size={64}
                    color={getSpeedColor(item.speed)}
                    strokeWidth={2}
                  />
                  <div>
                    <strong className="text-slate-800 text-xs block font-bold">{item.label}</strong>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
