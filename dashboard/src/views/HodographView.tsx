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
import ReactECharts from 'echarts-for-react';

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
        {/* Interactive ECharts Hodograph Container */}
        <div className="bg-white border border-slate-200 rounded-[22px] p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
          <div className="w-full h-[700px]">
            <ReactECharts 
              option={(() => {
                const maxRad = Math.ceil(maxScaleSpeed / 10) * 10;
                
                const option: any = {
                  animation: true,
                  animationDuration: 800,
                  toolbox: {
                    feature: {
                      saveAsImage: { title: 'Simpan Gambar' },
                      dataZoom: { title: { zoom: 'Zoom In', back: 'Reset Zoom' } }
                    },
                    right: 15,
                    top: 0
                  },
                  polar: {
                    radius: '85%',
                    center: ['50%', '50%']
                  },
                  angleAxis: {
                    type: 'value',
                    min: 0,
                    max: 360,
                    startAngle: 0,
                    clockwise: false, 
                    axisLabel: {
                      formatter: (val: number) => {
                        if (val === 0) return 'T (E) / +U';
                        if (val === 90) return 'U (N) / +V';
                        if (val === 180) return 'B (W) / -U';
                        if (val === 270) return 'S / -V';
                        return '';
                      },
                      color: '#64748b',
                      fontWeight: 'bold',
                      margin: 15
                    },
                    splitLine: { lineStyle: { color: '#cbd5e1', type: 'dashed' } },
                    axisLine: { lineStyle: { color: '#94a3b8', width: 2 } }
                  },
                  radiusAxis: {
                    type: 'value',
                    min: 0,
                    max: maxRad,
                    interval: 10,
                    axisLabel: {
                      formatter: '{value} kt',
                      color: '#64748b',
                      fontSize: 10,
                      fontWeight: 'bold'
                    },
                    splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
                    axisLine: { show: false },
                    z: 5
                  },
                  dataZoom: [
                    {
                      type: 'inside',
                      radiusAxisIndex: 0,
                      zoomOnMouseWheel: true,
                      moveOnMouseMove: true
                    },
                    {
                      type: 'slider',
                      radiusAxisIndex: 0,
                      show: false
                    }
                  ],
                  tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderColor: '#cbd5e1',
                    borderWidth: 1,
                    textStyle: { color: '#0f172a', fontSize: 12 },
                    extraCssText: 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 12px;',
                    formatter: (params: any) => {
                      if (!params.data || !params.data.meta) return '';
                      const pt = params.data.meta;
                      return `
                        <div style="font-size: 12px; padding: 2px;">
                          <div style="font-weight:900; color:#0284c7; margin-bottom:6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Ketinggian: ${pt.height_ft.toLocaleString()} ft (${pt.height_m} m)</div>
                          <div style="margin-bottom: 2px;"><span style="color:#64748b;">Arah / Kec:</span> <b style="color:#d97706">${pt.direction_deg}° / ${pt.speed_kt} kt</b></div>
                          <div style="margin-bottom: 2px;"><span style="color:#64748b;">U / V:</span> <b style="font-family:monospace; color:#334155">(${pt.u}, ${pt.v})</b></div>
                          ${pt.vb ? `<div style="margin-top:6px; padding-top:4px; border-top: 1px dashed #e2e8f0"><span style="color:#64748b">V/B:</span> <b style="color:#059669">${pt.vb}</b> <span style="color:#475569">(${pt.advection})</span></div>` : ''}
                        </div>
                      `;
                    }
                  },
                  series: []
                };

                const toPolarData = (pt: any) => {
                  let angle = Math.atan2(pt.v, pt.u) * (180 / Math.PI);
                  if (angle < 0) angle += 360;
                  return {
                    value: [Math.sqrt(pt.u*pt.u + pt.v*pt.v), angle],
                    meta: pt,
                    itemStyle: { color: getAltitudeColor(pt.height_ft), borderColor: '#ffffff', borderWidth: 1.5 },
                    label: {
                      show: mode !== 'overlay',
                      formatter: () => pt.height_ft === 0 ? 'Sfc' : String(pt.height_ft),
                      position: 'right',
                      fontSize: 10,
                      fontWeight: 'bold',
                      color: getAltitudeColor(pt.height_ft),
                      textBorderColor: '#ffffff',
                      textBorderWidth: 2
                    }
                  };
                };

                if (mode === 'overlay') {
                  analysis_observations.forEach(obs => {
                    const isSelected = obs.observation_id === selectedObsId;
                    option.series.push({
                      type: 'line',
                      coordinateSystem: 'polar',
                      data: obs.hodograph_points.map(toPolarData),
                      symbolSize: isSelected ? 10 : 5,
                      lineStyle: {
                        color: isSelected ? '#38bdf8' : '#cbd5e1',
                        width: isSelected ? 3.5 : 1.5
                      },
                      itemStyle: { opacity: isSelected ? 1 : 0.4 },
                      z: isSelected ? 10 : 1
                    });
                  });
                } else {
                  if (mode === 'compare' && secondaryObs) {
                    option.series.push({
                      type: 'line',
                      coordinateSystem: 'polar',
                      data: secondaryObs.hodograph_points.map(toPolarData),
                      symbolSize: 8,
                      lineStyle: { color: '#f59e0b', width: 3, type: 'dashed' },
                      itemStyle: { color: '#f59e0b', borderColor: '#78350f', borderWidth: 1.5 },
                      z: 5
                    });
                  }

                  if (primaryObs) {
                    option.series.push({
                      name: 'Primary Hodograph',
                      type: 'line',
                      coordinateSystem: 'polar',
                      data: primaryObs.hodograph_points.map(toPolarData),
                      symbolSize: (val: any, params: any) => params.dataIndex === 0 ? 14 : 10,
                      lineStyle: { color: '#0284c7', width: 4 },
                      z: 10
                    });
                  }
                }

                option.series.push({
                  type: 'scatter',
                  coordinateSystem: 'polar',
                  data: [[0, 0]],
                  symbolSize: 6,
                  itemStyle: { color: '#64748b' },
                  tooltip: { show: false },
                  z: 20
                });

                return option;
              })()} 
              style={{ height: '100%', width: '100%' }} 
              opts={{ renderer: 'svg' }}
            />
          </div>

          {/* OVERALL VEERING / BACKING SUMMARY */}
          {mode !== 'overlay' && primaryObs && (
            (() => {
              const pts = primaryObs.hodograph_points;
              if (pts.length < 2) return null;
              
              let netRotation = 0;
              for (let i = 1; i < pts.length; i++) {
                let diff = pts[i].direction_deg - pts[i-1].direction_deg;
                if (diff > 180) diff -= 360;
                else if (diff < -180) diff += 360;
                netRotation += diff;
              }
              
              const isVeering = netRotation > 15;
              const isBacking = netRotation < -15;
              
              let summary = {
                type: 'Netral (Straight/Unidirectional)',
                direction: 'Relatif Konstan',
                color: 'slate',
                bg: 'bg-slate-50',
                border: 'border-slate-200',
                icon: <Wind className="w-5 h-5 text-slate-600" />,
                desc: 'Arah angin tidak mengalami perputaran signifikan seiring bertambahnya ketinggian.'
              };
              
              if (isVeering) {
                summary = {
                  type: 'VEERING (Adveksi Udara Dingin untuk B.B. Selatan)',
                  direction: 'Searah Jarum Jam (Clockwise)',
                  color: 'emerald',
                  bg: 'bg-emerald-50',
                  border: 'border-emerald-200',
                  icon: <RotateCcw className="w-5 h-5 text-emerald-600 transform scale-x-[-1]" />,
                  desc: `Angin berputar searah jarum jam sebesar ${Math.round(Math.abs(netRotation))}° dari permukaan hingga puncak. Ini mengindikasikan adanya pergerakan adveksi termal.`
                };
              } else if (isBacking) {
                summary = {
                  type: 'BACKING (Adveksi Udara Hangat untuk B.B. Selatan)',
                  direction: 'Berlawanan Arah Jarum Jam (Counter-Clockwise)',
                  color: 'rose',
                  bg: 'bg-rose-50',
                  border: 'border-rose-200',
                  icon: <RotateCcw className="w-5 h-5 text-rose-600" />,
                  desc: `Angin berputar berlawanan arah jarum jam sebesar ${Math.round(Math.abs(netRotation))}° dari permukaan hingga puncak. Ini mengindikasikan adanya pergerakan adveksi termal.`
                };
              }

              return (
                <div className={`w-full mt-2 p-4 rounded-2xl border ${summary.bg} ${summary.border} flex items-start gap-4 transition-all shadow-sm`}>
                  <div className={`p-2 rounded-xl bg-white shadow-sm border ${summary.border}`}>
                    {summary.icon}
                  </div>
                  <div>
                    <h4 className={`text-sm font-extrabold text-${summary.color}-800 tracking-tight`}>
                      Kesimpulan Profil: {summary.type}
                    </h4>
                    <p className={`text-xs font-semibold text-${summary.color}-700 mt-1`}>
                      Arah Putaran: <span className="font-bold">{summary.direction}</span>
                    </p>
                    <p className={`text-xs text-${summary.color}-600 mt-1 leading-relaxed`}>
                      {summary.desc}
                    </p>
                  </div>
                </div>
              );
            })()
          )}

          {/* Altitude Color Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
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
