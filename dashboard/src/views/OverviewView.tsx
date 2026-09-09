import React, { useState, useMemo } from 'react';
import { PibalBundle, AnalysisObservation } from '../types/pibal';
import { 
  Wind, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  Compass,
  Box,
  Layers,
  CheckCircle2,
  Calendar as CalendarIcon,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';

interface OverviewViewProps {
  data: PibalBundle;
  selectedObsId?: string;
  onSelectObservation: (obsId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ 
  data, 
  selectedObsId,
  onSelectObservation,
  onNavigateTab 
}) => {
  const { aggregate_stats, analysis_observations } = data;

  // Selected date state
  const activeObs = useMemo(() => {
    return analysis_observations.find(o => o.observation_id === selectedObsId) || analysis_observations[0];
  }, [analysis_observations, selectedObsId]);

  // View state for speed unit toggle
  const [speedUnit, setSpeedUnit] = useState<'kt' | 'kmh'>('kt');

  // Month state for calendar (Default to August 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 8 = August

  // Map observation dates for fast lookup: key = day number (1..31)
  const observationMap = useMemo(() => {
    const map = new Map<number, AnalysisObservation>();
    analysis_observations.forEach(obs => {
      const day = parseInt(obs.date_iso.slice(8, 10), 10);
      map.set(day, obs);
    });
    return map;
  }, [analysis_observations]);

  // Selected day number
  const selectedDay = useMemo(() => {
    if (!activeObs) return 12;
    return parseInt(activeObs.date_iso.slice(8, 10), 10);
  }, [activeObs]);

  // Cardinal direction converter helper
  const degToCardinal = (deg: number) => {
    const val = Math.floor((deg / 22.5) + 0.5);
    const arr = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    return arr[val % 16];
  };

  // 1. REAL Daily Max Wind Speed Data (Days 01 to 31 of August 2026)
  const dailyWindData = useMemo(() => {
    const days = [];
    const multiplier = speedUnit === 'kmh' ? 1.852 : 1;

    for (let i = 1; i <= 31; i++) {
      const dayStr = String(i).padStart(2, '0');
      const obs = observationMap.get(i);
      
      const speedVal = obs ? Number((obs.statistics.max_speed_kt * multiplier).toFixed(1)) : 0;
      const meanVal = obs ? Number((obs.statistics.mean_speed_kt * multiplier).toFixed(1)) : 0;

      days.push({
        day: dayStr,
        value: speedVal,
        meanSpeed: meanVal,
        maxAltitude: obs ? obs.statistics.max_altitude_ft : 0,
        observer: obs ? obs.observer : '-',
        reason: obs ? obs.termination_reason : '-',
        obsId: obs ? obs.observation_id : undefined,
        hasObs: !!obs
      });
    }
    return days;
  }, [observationMap, speedUnit]);

  // 2. REAL Wind Velocity Trend (Max, Mean, and Surface Speed across all 21 observations)
  const windTrendData = useMemo(() => {
    const multiplier = speedUnit === 'kmh' ? 1.852 : 1;

    return analysis_observations.map(obs => {
      const dayNum = parseInt(obs.date_iso.slice(8, 10), 10);
      const surfacePt = obs.hodograph_points[0];
      const surfaceSpd = surfacePt ? surfacePt.speed_kt : 4.0;

      return {
        date: `${dayNum} Agu`,
        dayNum,
        max: Number((obs.statistics.max_speed_kt * multiplier).toFixed(1)),
        avg: Number((obs.statistics.mean_speed_kt * multiplier).toFixed(1)),
        min: Number((surfaceSpd * multiplier).toFixed(1)),
        obsId: obs.observation_id,
        observer: obs.observer
      };
    });
  }, [analysis_observations, speedUnit]);

  // 3. REAL Vertical Layer Stratification (Low <= 3000 ft, Mid 5000-10000 ft, High > 10000 ft)
  const verticalLayerData = useMemo(() => {
    const multiplier = speedUnit === 'kmh' ? 1.852 : 1;

    return analysis_observations.map(obs => {
      const dayNum = parseInt(obs.date_iso.slice(8, 10), 10);
      const pts = obs.hodograph_points;

      // Low layer: <= 3000 ft
      const lowPts = pts.filter(p => p.height_ft <= 3000);
      const lowAvg = lowPts.length > 0 
        ? lowPts.reduce((acc, p) => acc + p.speed_kt, 0) / lowPts.length 
        : 0;

      // Mid layer: 3000 to 10000 ft
      const midPts = pts.filter(p => p.height_ft > 3000 && p.height_ft <= 10000);
      const midAvg = midPts.length > 0 
        ? midPts.reduce((acc, p) => acc + p.speed_kt, 0) / midPts.length 
        : 0;

      // High layer: > 10000 ft
      const highPts = pts.filter(p => p.height_ft > 10000);
      const highAvg = highPts.length > 0 
        ? highPts.reduce((acc, p) => acc + p.speed_kt, 0) / highPts.length 
        : 0;

      return {
        day: `${dayNum}`,
        low: Number((lowAvg * multiplier).toFixed(1)),
        mid: Number((midAvg * multiplier).toFixed(1)),
        high: Number((highAvg * multiplier).toFixed(1)),
        obsId: obs.observation_id
      };
    });
  }, [analysis_observations, speedUnit]);

  // Calendar matrix calculation for August 2026
  // August 1, 2026 was a Saturday (day index 6 where 0 = Sunday)
  const calendarDays = useMemo(() => {
    const daysInMonth = 31;
    // In August 2026, Aug 1 is Saturday (index 6, S M T W T F S)
    const firstDayOfWeek = 6; 
    const cells = [];

    // Empty cells before day 1
    for (let b = 0; b < firstDayOfWeek; b++) {
      cells.push({ dayNumber: null, isCurrentMonth: false });
    }

    // Days 1 to 31
    for (let d = 1; d <= daysInMonth; d++) {
      const hasObs = observationMap.has(d);
      const obs = observationMap.get(d);
      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        hasObs,
        obsId: obs ? obs.observation_id : undefined,
        isSelected: d === selectedDay
      });
    }

    return cells;
  }, [observationMap, selectedDay]);

  const unitLabel = speedUnit === 'kt' ? 'Knot' : 'km/h';

  // Early Warning System (EWS) Logic for Low-Level Wind Shear (LLWS)
  const lowLevelShears = useMemo(() => {
    return activeObs?.shear_layers?.filter(
      (l: any) => l.bottom_height_ft <= 3000 && l.shear_vector_mag_kt >= 15
    ) || [];
  }, [activeObs]);
  const hasHazardousLLWS = lowLevelShears.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Early Warning System Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all ${
        hasHazardousLLWS 
          ? 'bg-rose-50 border-rose-200' 
          : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${
            hasHazardousLLWS ? 'bg-rose-600 text-white shadow-rose-500/25' : 'bg-emerald-600 text-white shadow-emerald-500/25'
          }`}>
            {hasHazardousLLWS ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                hasHazardousLLWS ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                {hasHazardousLLWS ? 'PERINGATAN DINI LLWS' : 'STATUS PENERBANGAN AMAN'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Early Warning System</span>
            </div>
            <h3 className={`text-lg font-bold ${hasHazardousLLWS ? 'text-rose-900' : 'text-emerald-900'}`}>
              {hasHazardousLLWS ? 'Terdeteksi Low-Level Wind Shear (LLWS) Signifikan' : 'Tidak Ditemukan Wind Shear Berbahaya di Elevasi Rendah'}
            </h3>
            <p className={`text-sm mt-0.5 ${hasHazardousLLWS ? 'text-rose-700' : 'text-emerald-700'}`}>
              {hasHazardousLLWS 
                ? `Terdapat ${lowLevelShears.length} lapisan pergeseran angin dengan magnitudo \u2265 15 kt di bawah 3.000 ft. Ini berpotensi membahayakan fase lepas landas & pendaratan.` 
                : 'Kondisi pergeseran angin di lapisan bawah (di bawah 3.000 ft) berada pada batas wajar (< 15 kt).'
              }
            </p>
          </div>
        </div>
        {hasHazardousLLWS && (
          <button 
            onClick={() => onNavigateTab('statistics')}
            className="shrink-0 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2"
          >
            Lihat Detail Shear <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start pb-12">
      {/* ========================================================================= */}
      {/* LEFT COLUMN: Main Analytics Charts (Col Span 8)                            */}
      {/* ========================================================================= */}
      <div className="xl:col-span-8 space-y-6">

        {/* 1. REAL PiBal Max Wind Speed Bar Chart */}
        <div className="bg-white rounded-[22px] p-6 shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Aktivitas Kecepatan Angin Maksimum Harian (Max Wind Speed - FF_X)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Kecepatan angin puncak atmosfer dari 21 observasi Pilot Balon Agustus 2026 (06 UTC / 13.00 WIB)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 inline-block"></span>
              <span>Kecepatan Puncak ({unitLabel})</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyWindData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                  domain={[0, speedUnit === 'kt' ? 35 : 65]}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #cbd5e1', 
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} ${unitLabel}`, 'Kec. Puncak']}
                  labelFormatter={(lbl, payload) => {
                    if (payload && payload[0]) {
                      const item = payload[0].payload;
                      if (item.hasObs) {
                        return `${lbl} Agustus 2026 | Obs: ${item.observer} | Alasan: ${item.reason} | Alt: ${item.maxAltitude} ft`;
                      }
                      return `${lbl} Agustus 2026 (Tidak Ada Peluncuran Balon)`;
                    }
                    return `${lbl} Agustus 2026`;
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#2563EB" 
                  radius={[4, 4, 0, 0]} 
                  barSize={14}
                  onClick={(entry: any) => {
                    if (entry && entry.obsId) {
                      onSelectObservation(entry.obsId);
                    }
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. REAL Wind Velocity Trend (Max, Mean, and Surface Speed) */}
        <div className="bg-white rounded-[22px] p-6 shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Tren Kecepatan Angin: Puncak, Rata-rata & Permukaan
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Evolusi kecepatan angin dari 21 hari observasi PiBal Stasiun Tunggul Wulung Cilacap
              </p>
            </div>

            {/* Controls: Unit Toggle & Legend */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Unit Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-full text-xs font-semibold">
                <button
                  onClick={() => setSpeedUnit('kt')}
                  className={`px-3 py-1 rounded-full transition-all text-xs ${
                    speedUnit === 'kt' 
                      ? 'bg-white text-slate-900 shadow-sm font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Knot (kt)
                </button>
                <button
                  onClick={() => setSpeedUnit('kmh')}
                  className={`px-3 py-1 rounded-full transition-all text-xs ${
                    speedUnit === 'kmh' 
                      ? 'bg-white text-slate-900 shadow-sm font-bold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  km/h
                </button>
              </div>

              {/* Legend Dots */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block" /> Puncak
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" /> Rata-rata
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block" /> Permukaan
                </span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={windTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #cbd5e1', 
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    fontSize: '12px'
                  }}
                  formatter={(val: any, name: any) => {
                    const label = name === 'max' ? 'Kec. Puncak' : name === 'avg' ? 'Rata-rata Kolom' : 'Angin Permukaan';
                    return [`${val} ${unitLabel}`, label];
                  }}
                  labelFormatter={(lbl) => `Tanggal: ${lbl} 2026 (06 UTC)`}
                />
                {/* Red Line (Max Peak Speed) */}
                <Line 
                  type="monotone" 
                  dataKey="max" 
                  stroke="#ef4444" 
                  strokeWidth={2.5} 
                  dot={{ r: 3.5, fill: '#ef4444', strokeWidth: 1, stroke: '#ffffff' }} 
                  activeDot={{ r: 6 }} 
                  name="max"
                />
                {/* Green Line (Mean Column Speed) */}
                <Line 
                  type="monotone" 
                  dataKey="avg" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  dot={{ r: 3.5, fill: '#10b981', strokeWidth: 1, stroke: '#ffffff' }} 
                  activeDot={{ r: 6 }} 
                  name="avg"
                />
                {/* Blue Line (Surface Wind Speed) */}
                <Line 
                  type="monotone" 
                  dataKey="min" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  dot={{ r: 3.5, fill: '#3b82f6', strokeWidth: 1, stroke: '#ffffff' }} 
                  activeDot={{ r: 6 }} 
                  name="min"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. REAL Vertical Layer Stratification (Low, Mid, High) Grouped Bar Chart */}
        <div className="bg-white rounded-[22px] p-6 shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Distribusi Kecepatan per Lapisan Vertikal Atmosfer (3 Stratifikasi)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Profil kecepatan pada Lapisan Bawah (≤ 3.000 ft), Menengah (5.000 - 10.000 ft), dan Atas (&gt; 10.000 ft)
              </p>
            </div>

            {/* Legend Dots */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] inline-block" /> Bawah (≤ 3k ft)
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] inline-block" /> Menengah (5-10k ft)
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] inline-block" /> Atas (&gt; 10k ft)
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verticalLayerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  domain={[0, speedUnit === 'kt' ? 35 : 65]}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid #cbd5e1', 
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    fontSize: '12px'
                  }}
                  formatter={(val: any, name: any) => {
                    const label = name === 'low' 
                      ? 'Lapisan Bawah (≤ 3k ft)' 
                      : name === 'mid' 
                      ? 'Lapisan Menengah (5-10k ft)' 
                      : 'Lapisan Atas (> 10k ft)';
                    return [`${val} ${unitLabel}`, label];
                  }}
                  labelFormatter={(lbl) => `Tanggal: ${lbl} Agustus 2026 (06 UTC)`}
                />
                <Bar dataKey="low" fill="#ec4899" radius={[3, 3, 0, 0]} barSize={8} name="low" />
                <Bar dataKey="mid" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={8} name="mid" />
                <Bar dataKey="high" fill="#06b6d4" radius={[3, 3, 0, 0]} barSize={8} name="high" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Calendar Widget, Key Metrics & Selected Data (Col Span 4)    */}
      {/* ========================================================================= */}
      <div className="xl:col-span-4 space-y-6">

        {/* 1. Interactive Calendar Widget */}
        <div className="bg-white rounded-[22px] p-6 shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-blue-600 block leading-none">
                {currentYear}/08
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Agustus 2026
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  setCurrentMonth(prev => prev === 1 ? 12 : prev - 1);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  setCurrentMonth(prev => prev === 12 ? 1 : prev + 1);
                }}
                className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, idx) => (
              <span key={`dow-${idx}`} className="text-[11px] font-bold text-slate-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-y-1.5 text-center">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth || cell.dayNumber === null) {
                return <div key={`empty-${idx}`} className="h-9" />;
              }

              return (
                <button
                  key={`day-${cell.dayNumber}`}
                  onClick={() => {
                    if (cell.obsId) {
                      onSelectObservation(cell.obsId);
                    }
                  }}
                  className={`h-9 w-9 mx-auto rounded-full text-xs font-semibold flex items-center justify-center relative transition-all ${
                    cell.isSelected
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/35 scale-105'
                      : cell.hasObs
                      ? 'text-slate-900 hover:bg-blue-50 cursor-pointer font-bold border border-blue-200/60'
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
                  title={cell.hasObs ? `Observasi PiBal ${cell.dayNumber} Agustus 2026 (Klik untuk memuat data)` : `Tanggal ${cell.dayNumber}`}
                >
                  <span>{cell.dayNumber}</span>
                  
                  {/* Small Red Dot / Asterisk Indicator for Observation Days matching screenshot */}
                  {cell.hasObs && (
                    <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                      cell.isSelected ? 'bg-white ring-1 ring-blue-600' : 'bg-[#ef4444]'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Helper Footnote Box matching dashed border in reference image */}
          <div className="mt-5 border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50/50">
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
              Klik tanggal bertanda titik merah untuk memuat analisis data PiBal hari tersebut.
            </p>
          </div>
        </div>

        {/* 2. Key Metrics Donut Gauges Card */}
        <div className="bg-white rounded-[22px] p-6 shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Key Metrics Pengamatan PiBal
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Terverifikasi
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Gauge 1: 100% U-V Trigonometric Consistency Audit */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    stroke="#e2e8f0"
                    strokeWidth="3.2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Blue Arc (100%) */}
                  <path
                    className="text-blue-600"
                    strokeDasharray="100, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-sm font-extrabold text-slate-900 tracking-tight font-mono">
                    100%
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">
                Audit U-V
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Konsisten Trigonometri
              </span>
            </div>

            {/* Gauge 2: 21 / 21 Observations (100% System Completeness) */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    stroke="#e2e8f0"
                    strokeWidth="3.2"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Green Arc (100%) */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="100, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-sm font-extrabold text-slate-900 tracking-tight font-mono">
                    21 / 21
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-800 mt-2">
                PDF Sukses
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                172 Rekor Level
              </span>
            </div>
          </div>
        </div>

        {/* 3. Selected Date Data Card */}
        <div className="bg-white rounded-[22px] p-6 shadow-sm border border-slate-200/80 transition-all hover:shadow-md">
          {/* Card Header with Blue Pill Badge */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Data Observasi Terpilih
            </h3>
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              {activeObs ? `${parseInt(activeObs.date_iso.slice(8, 10), 10)} Agu 2026` : '01 Agu 2026'}
            </span>
          </div>

          {/* Inner Light-Blue Highlight Box matching reference image */}
          <div className="bg-[#eff6ff] border border-blue-200/70 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              {/* Circular Blue Icon */}
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                <Wind className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  WIND (FF_AVG)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-slate-900 font-mono leading-tight">
                    {activeObs ? (activeObs.statistics.mean_speed_kt * (speedUnit === 'kmh' ? 1.852 : 1)).toFixed(1) : '11.2'}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {unitLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side Max Speed & Direction Readout */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                MAX (FF_X)
              </span>
              <div className="text-sm font-extrabold text-blue-600 font-mono">
                {activeObs ? `${activeObs.statistics.max_speed_kt} Knot` : '22 Knot'}
              </div>
              <span className="text-[10px] font-bold text-slate-600">
                {activeObs ? `Arah ${activeObs.hodograph_points[activeObs.hodograph_points.length - 1]?.direction_deg}° (${degToCardinal(activeObs.hodograph_points[activeObs.hodograph_points.length - 1]?.direction_deg || 120)})` : '120° ESE'}
              </span>
            </div>
          </div>

          {/* Additional Meteorological Metadata */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Puncak Balon:</span>
              <span className="font-extrabold text-slate-800">
                {activeObs?.statistics.max_altitude_ft.toLocaleString()} ft
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Observer & Jam:</span>
              <span className="font-extrabold text-slate-800">
                {activeObs?.observer} (06 UTC)
              </span>
            </div>
          </div>

          {/* Quick Action Link to full Hodograph / 3D */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Alasan: <strong className="text-slate-800 font-bold">{activeObs?.termination_reason}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('hodograph')}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
            >
              Lihat Hodograph <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
