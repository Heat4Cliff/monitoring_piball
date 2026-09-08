import React, { useState, useMemo } from 'react';
import { PibalBundle, AnalysisObservation, HodographPoint } from '../types/pibal';
import { SourceBadge } from '../components/SourceBadge';
import { 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Split, 
  Eye, 
  Info,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Wind
} from 'lucide-react';

interface HodographViewProps {
  data: PibalBundle;
  selectedObsId: string;
  onSelectObservation: (obsId: string) => void;
}

export const HodographView: React.FC<HodographViewProps> = ({
  data,
  selectedObsId,
  onSelectObservation
}) => {
  const { analysis_observations } = data;

  const [mode, setMode] = useState<'single' | 'compare' | 'overlay'>('single');
  const [compareObsId, setCompareObsId] = useState<string>(
    analysis_observations.length > 1 ? analysis_observations[1].observation_id : analysis_observations[0].observation_id
  );
  const [showOriginalChart, setShowOriginalChart] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [hoveredPoint, setHoveredPoint] = useState<{ pt: HodographPoint; obs: AnalysisObservation } | null>(null);

  // Selected observations
  const primaryObs = useMemo(() => {
    return analysis_observations.find(o => o.observation_id === selectedObsId) || analysis_observations[0];
  }, [analysis_observations, selectedObsId]);

  const secondaryObs = useMemo(() => {
    return analysis_observations.find(o => o.observation_id === compareObsId) || analysis_observations[1] || analysis_observations[0];
  }, [analysis_observations, compareObsId]);

  // Max speed across observations for scale
  const maxScaleSpeed = useMemo(() => {
    if (mode === 'overlay') {
      return 35;
    }
    const s1 = primaryObs ? primaryObs.statistics.max_speed_kt : 25;
    const s2 = (mode === 'compare' && secondaryObs) ? secondaryObs.statistics.max_speed_kt : 0;
    const maxVal = Math.max(s1, s2, 25);
    return Math.ceil((maxVal + 5) / 5) * 5;
  }, [mode, primaryObs, secondaryObs]);

  // SVG Chart Dimensions
  const size = 520;
  const center = size / 2;
  const radius = (size / 2) - 45;

  // Scale function from U/V knot to SVG pixel coordinates
  // Cartesian convention: U is X (positive East), V is Y (positive North, so inverted in SVG Y)
  const scale = (val: number) => {
    return (val / maxScaleSpeed) * radius * zoom;
  };

  const toSvgX = (u: number) => center + scale(u);
  const toSvgY = (v: number) => center - scale(v); // invert Y for SVG

  // Range rings (every 5 kt)
  const ringStep = maxScaleSpeed <= 30 ? 5 : 10;
  const rings = [];
  for (let s = ringStep; s <= maxScaleSpeed; s += ringStep) {
    rings.push(s);
  }

  // Color gradient for altitude levels
  const getAltitudeColor = (h_ft: number) => {
    if (h_ft === 0) return '#0284c7'; // Surface: Sky blue
    if (h_ft <= 2000) return '#059669'; // Low: Emerald
    if (h_ft <= 5000) return '#d97706'; // Mid-low: Amber
    if (h_ft <= 10000) return '#ea580c'; // Mid: Orange
    if (h_ft <= 20000) return '#db2777'; // Mid-high: Pink
    return '#9333ea'; // High: Purple
  };

  return (
    <div className="space-y-6">
      {/* View Header & Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Bidang Koordinat U-V (Hodograph)
            </span>
            <SourceBadge sourceFile={primaryObs.source_file} sourcePage={2} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Analisis Hodograph Interaktif: {primaryObs.date_iso} (06 UTC)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Menampilkan profil vektor angin vertikal, pembelokan veering/backing, dan adveksi termal.
          </p>
        </div>

        {/* Mode Selector & Controls */}
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

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setMode('single')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mode === 'single' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setMode('compare')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mode === 'compare' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Komparasi
            </button>
            <button
              onClick={() => setMode('overlay')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mode === 'overlay' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overlay 21 Hari
            </button>
          </div>

          {/* Secondary Observation (if Compare Mode) */}
          {mode === 'compare' && (
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs">
              <span className="text-amber-700 font-bold">Vs:</span>
              <select
                value={compareObsId}
                onChange={(e) => setCompareObsId(e.target.value)}
                className="bg-transparent text-amber-900 focus:outline-none cursor-pointer font-semibold"
              >
                {analysis_observations.map(obs => (
                  <option key={obs.observation_id} value={obs.observation_id} className="bg-white text-slate-900">
                    {obs.date_iso} ({obs.statistics.max_altitude_ft} ft)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Toggle Side-by-Side Original PDF Chart */}
          <button
            onClick={() => setShowOriginalChart(!showOriginalChart)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              showOriginalChart
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            {showOriginalChart ? 'Sembunyikan Grafik Asli' : 'Bandingkan Grafik Asli PDF'}
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Hodograph SVG + (Optional) Original PDF Chart */}
      <div className={`grid grid-cols-1 ${showOriginalChart && mode !== 'overlay' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
        {/* Interactive SVG Hodograph Container */}
        <div className="bg-white border border-slate-200 rounded-[22px] p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.5))}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.6))}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* SVG Canvas */}
          <div className="w-full flex justify-center py-2">
            <svg 
              width={size} 
              height={size} 
              className="bg-slate-50 rounded-2xl border border-slate-200 shadow-inner select-none"
            >
              <defs>
                {/* Arrowhead marker for wind shear vectors */}
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
                </marker>
                <marker id="arrow-secondary" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
                </marker>
              </defs>

              {/* Polar Radial Azimuth Lines */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                const rad = (deg - 90) * (Math.PI / 180);
                const x2 = center + Math.cos(rad) * radius * zoom;
                const y2 = center + Math.sin(rad) * radius * zoom;
                const isCardinal = deg % 90 === 0;
                return (
                  <g key={`radial-${deg}`}>
                    <line
                      x1={center}
                      y1={center}
                      x2={x2}
                      y2={y2}
                      stroke={isCardinal ? "#94a3b8" : "#cbd5e1"}
                      strokeWidth={isCardinal ? 1.2 : 0.8}
                      strokeDasharray={isCardinal ? undefined : "2 3"}
                    />
                    {/* Cardinal Labels */}
                    {isCardinal && (
                      <text
                        x={center + Math.cos(rad) * (radius * zoom + 16)}
                        y={center + Math.sin(rad) * (radius * zoom + 16) + 4}
                        textAnchor="middle"
                        fill="#475569"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {deg === 0 ? "U (N)" : deg === 90 ? "T (E)" : deg === 180 ? "S" : "B (W)"}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Concentric Speed Rings */}
              {rings.map(spd => {
                const r = scale(spd);
                return (
                  <g key={`ring-${spd}`}>
                    <circle
                      cx={center}
                      cy={center}
                      r={r}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={center + 4}
                      y={center - r - 3}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {spd} kt
                    </text>
                  </g>
                );
              })}

              {/* Cartesian Axes: U-Axis (East-West) & V-Axis (North-South) */}
              <line x1={center - radius * zoom} y1={center} x2={center + radius * zoom} y2={center} stroke="#94a3b8" strokeWidth="1.5" />
              <line x1={center} y1={center - radius * zoom} x2={center} y2={center + radius * zoom} stroke="#94a3b8" strokeWidth="1.5" />

              {/* Axes Labels */}
              <text x={center + radius * zoom - 20} y={center - 8} fill="#0284c7" fontSize="10" fontWeight="bold">+U (Timur)</text>
              <text x={center - radius * zoom + 8} y={center - 8} fill="#0284c7" fontSize="10" fontWeight="bold">-U (Barat)</text>
              <text x={center + 8} y={center - radius * zoom + 18} fill="#059669" fontSize="10" fontWeight="bold">+V (Utara)</text>
              <text x={center + 8} y={center + radius * zoom - 8} fill="#059669" fontSize="10" fontWeight="bold">-V (Selatan)</text>

              {/* Mode: OVERLAY (All 21 Observations) */}
              {mode === 'overlay' && analysis_observations.map((obs, obsIdx) => {
                const points = obs.hodograph_points;
                const pathStr = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.u)} ${toSvgY(p.v)}`).join(' ');
                const isSelected = obs.observation_id === selectedObsId;
                return (
                  <g key={obs.observation_id} opacity={isSelected ? 1 : 0.45}>
                    <path
                      d={pathStr}
                      fill="none"
                      stroke={isSelected ? "#38bdf8" : "#64748b"}
                      strokeWidth={isSelected ? 3 : 1.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((p, pIdx) => (
                      <circle
                        key={`${obs.observation_id}-${pIdx}`}
                        cx={toSvgX(p.u)}
                        cy={toSvgY(p.v)}
                        r={isSelected ? 4 : 2}
                        fill={isSelected ? getAltitudeColor(p.height_ft) : "#94a3b8"}
                        className="cursor-pointer transition-opacity hover:opacity-75"
                        onMouseEnter={() => setHoveredPoint({ pt: p, obs })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </g>
                );
              })}

              {/* Mode: COMPARE (Secondary Observation Trajectory) */}
              {mode === 'compare' && secondaryObs && (
                <g>
                  {/* Line Trajectory */}
                  {secondaryObs.hodograph_points.length > 1 && (
                    <path
                      d={secondaryObs.hodograph_points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.u)} ${toSvgY(p.v)}`).join(' ')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd="url(#arrow-secondary)"
                    />
                  )}
                  {/* Points */}
                  {secondaryObs.hodograph_points.map((p, idx) => (
                    <g key={`sec-${idx}`}>
                      <circle
                        cx={toSvgX(p.u)}
                        cy={toSvgY(p.v)}
                        r={5}
                        fill="#f59e0b"
                        stroke="#78350f"
                        strokeWidth="1.5"
                        className="cursor-pointer transition-opacity hover:opacity-75"
                        onMouseEnter={() => setHoveredPoint({ pt: p, obs: secondaryObs })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <text
                        x={toSvgX(p.u) + 6}
                        y={toSvgY(p.v) - 5}
                        fill="#b45309"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {p.height_ft}
                      </text>
                    </g>
                  ))}
                </g>
              )}

              {/* Mode: SINGLE & Primary Observation Trajectory */}
              {mode !== 'overlay' && primaryObs && (
                <g>
                  {/* Connecting Shear Lines */}
                  {primaryObs.hodograph_points.length > 1 && (
                    <path
                      d={primaryObs.hodograph_points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${toSvgX(p.u)} ${toSvgY(p.v)}`).join(' ')}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd="url(#arrow)"
                    />
                  )}

                  {/* Level Points */}
                  {primaryObs.hodograph_points.map((p, idx) => {
                    const color = getAltitudeColor(p.height_ft);
                    return (
                      <g key={`pri-${idx}`}>
                        <circle
                          cx={toSvgX(p.u)}
                          cy={toSvgY(p.v)}
                          r={idx === 0 ? 6 : 5}
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth="2"
                        className="cursor-pointer transition-opacity hover:opacity-75 drop-shadow"
                          onMouseEnter={() => setHoveredPoint({ pt: p, obs: primaryObs })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <text
                          x={toSvgX(p.u) + 7}
                          y={toSvgY(p.v) - 5}
                          fill={color}
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {p.height_ft === 0 ? "Sfc (0)" : `${p.height_ft}`}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* Origin Point (0,0) */}
              <circle cx={center} cy={center} r={3} fill="#94a3b8" />
            </svg>
          </div>

          {/* Interactive Hover Tooltip Info Box */}
          <div
            className="w-full mt-3 min-h-[72px] p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
            style={{ contain: 'layout' }}
            aria-live="off"
          >
            {hoveredPoint ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                <div>
                  <span className="text-slate-500">Observasi: </span>
                  <span className="font-bold text-sky-600">{hoveredPoint.obs.date_iso} (06 UTC)</span>
                </div>
                <div>
                  <span className="text-slate-500">Ketinggian: </span>
                  <span className="font-bold text-slate-800">{hoveredPoint.pt.height_ft.toLocaleString()} ft ({hoveredPoint.pt.height_m} m)</span>
                </div>
                <div>
                  <span className="text-slate-500">Arah / Kec: </span>
                  <span className="font-bold text-amber-600">{hoveredPoint.pt.direction_deg}° / {hoveredPoint.pt.speed_kt} kt</span>
                </div>
                <div>
                  <span className="text-slate-500">U / V: </span>
                  <span className="font-mono text-slate-700">({hoveredPoint.pt.u}, {hoveredPoint.pt.v}) kt</span>
                </div>
                {hoveredPoint.pt.vb && (
                  <div>
                    <span className="text-slate-500">V/B: </span>
                    <span className="font-bold text-emerald-600">{hoveredPoint.pt.vb} ({hoveredPoint.pt.advection})</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Arahkan kursor ke titik level pada hodograph untuk melihat rincian koordinat U/V, kecepatan, dan adveksi.</span>
              </div>
            )}
          </div>

          {/* Altitude Color Legend */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Level Ketinggian:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#38bdf8]" /> 0 ft (Permukaan)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#34d399]" /> 1k - 2k ft
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#fbbf24]" /> 3k - 5k ft
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#f97316]" /> 6k - 10k ft
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ec4899]" /> 11k - 20k ft
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#a855f7]" /> &gt;20k ft
            </span>
          </div>
        </div>

        {/* Side-by-Side: Original PDF Hodograph Chart (Page 3) */}
        {showOriginalChart && mode !== 'overlay' && (
          <div className="bg-white border border-slate-200 rounded-[22px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Gambar Asli Halaman 3 PDF
                  </span>
                  <span className="text-xs text-slate-500">Verifikasi Visual 1:1</span>
                </div>
                <SourceBadge sourceFile={primaryObs.source_file} sourcePage={3} />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center min-h-[420px]">
                {primaryObs.source_file ? (
                  <img
                    src={`/extracted_images/PIBAL_${primaryObs.date_iso.replace(/-/g, '')}_06UTC_chart.png`}
                    alt={`Grafik Hodograph Asli ${primaryObs.date_iso}`}
                    className="max-h-[440px] w-auto object-contain rounded-xl shadow-xs border border-slate-200 filter invert contrast-125 hue-rotate-180"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center text-slate-500 text-xs">
                    Gambar tidak tersedia untuk observasi ini.
                  </div>
                )}
              </div>
            </div>

            {/* Verification Note */}
            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <div className="font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Traceability & Audit Verification
              </div>
              <p className="text-slate-600">
                Grafik di sebelah kiri dibuat secara matematis dari koordinat U/V hasil parsing tabel PDF.
                Gambar di sebelah kanan adalah grafik bitmap asli hasil render stasiun pengamatan BMKG Cilacap dari Halaman 3 dokumen <strong className="text-slate-900">{primaryObs.source_file}</strong> (disesuaikan ke latar terang agar jelas dibaca).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hodograph Analysis Summary Panel */}
      <div className="bg-white border border-slate-200 rounded-[22px] p-6 shadow-sm space-y-4">
        <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
          <Wind className="w-4 h-4 text-blue-600" />
          Rangkuman Dinamika Vektor Hodograph ({primaryObs.date_iso})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-semibold">Rentang Komponen U (Zonal)</span>
            <span className="text-slate-900 font-extrabold font-mono text-sm">
              {primaryObs.statistics.u_min} s/d {primaryObs.statistics.u_max} kt
            </span>
            <span className="text-slate-500 block mt-1">Negatif = Dari arah Timur</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-semibold">Rentang Komponen V (Meridional)</span>
            <span className="text-slate-900 font-extrabold font-mono text-sm">
              {primaryObs.statistics.v_min} s/d {primaryObs.statistics.v_max} kt
            </span>
            <span className="text-slate-500 block mt-1">Positif = Dari arah Selatan</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-semibold">Lapisan Geser Terkuat</span>
            <span className="text-amber-700 font-extrabold font-mono text-sm">
              {primaryObs.max_shear_layer ? primaryObs.max_shear_layer.altitude_range_ft : '-'} ft
            </span>
            <span className="text-slate-600 block mt-1">
              Laju: {primaryObs.max_shear_layer ? `${primaryObs.max_shear_layer.shear_rate_per_kft} kt/kft` : '-'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-semibold">Kondisi Terminasi Balon</span>
            <span className="text-blue-700 font-extrabold text-sm">
              {primaryObs.termination_reason} ({primaryObs.statistics.max_altitude_ft} ft)
            </span>
            <span className="text-slate-500 block mt-1 truncate">
              {primaryObs.termination_description}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
