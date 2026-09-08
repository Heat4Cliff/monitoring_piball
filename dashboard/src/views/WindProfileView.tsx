import React, { useState, useMemo, useEffect } from 'react';
import { PibalBundle, AnalysisObservation } from '../types/pibal';
import { SourceBadge } from '../components/SourceBadge';
import { 
  Wind, 
  Compass, 
  Layers, 
  Calendar, 
  Activity, 
  SlidersHorizontal
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';

interface EChartProfileProps {
  data: any[];
  xKey: string;
  xCKey?: string;
  yKey: string;
  xTitle: string;
  yTitle: string;
  pColor: string;
  cColor?: string;
  pName: string;
  cName?: string;
}

const EChartProfile: React.FC<EChartProfileProps> = ({ 
  data, xKey, xCKey, yKey, xTitle, yTitle, pColor, cColor, pName, cName 
}) => {
  const pData = data.filter(d => d[xKey] !== undefined && d[yKey] !== undefined).map(d => [d[xKey], d[yKey]]);
  const cData = xCKey ? data.filter(d => d[xCKey] !== undefined && d[yKey] !== undefined).map(d => [d[xCKey], d[yKey]]) : [];

  const option = {
    grid: {
      top: 20,
      right: 30,
      bottom: 40,
      left: 55,
      containLabel: true
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        return `<b>${params.seriesName}</b><br/>${yTitle}: ${params.value[1]}<br/>${xTitle}: ${params.value[0]}`;
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#cbd5e1',
      borderWidth: 1,
      textStyle: { color: '#0f172a', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px;'
    },
    legend: {
      data: [pName, ...(cName ? [cName] : [])],
      bottom: 0,
      textStyle: { fontSize: 11, color: '#64748b' },
      icon: 'circle'
    },
    dataZoom: [
      {
        type: 'inside',
        yAxisIndex: 0,
        filterMode: 'none'
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none'
      }
    ],
    xAxis: {
      type: 'value',
      name: xTitle,
      nameLocation: 'middle',
      nameGap: 25,
      nameTextStyle: { color: '#64748b', fontSize: 11 },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      scale: true
    },
    yAxis: {
      type: 'value',
      name: yTitle,
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: '#64748b', fontSize: 11 },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      scale: true
    },
    series: [
      {
        name: pName,
        type: 'line',
        data: pData,
        itemStyle: { color: pColor },
        lineStyle: { width: 2.5 },
        symbol: 'circle',
        symbolSize: 6,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      },
      ...(cName && cData.length > 0 ? [{
        name: cName,
        type: 'line',
        data: cData,
        itemStyle: { color: cColor },
        lineStyle: { width: 2, type: 'dashed' },
        symbol: 'circle',
        symbolSize: 5,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      }] : [])
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />;
};

interface WindProfileViewProps {
  data: PibalBundle;
  selectedObsId: string;
  onSelectObservation: (obsId: string) => void;
}

export const WindProfileView: React.FC<WindProfileViewProps> = ({
  data,
  selectedObsId,
  onSelectObservation
}) => {
  const { analysis_observations } = data;

  const [compareObsId, setCompareObsId] = useState<string>('none');
  const [unitSystem, setUnitSystem] = useState<'meteorological' | 'si'>('meteorological');

  const primaryObs = useMemo(() => {
    return analysis_observations.find(o => o.observation_id === selectedObsId) || analysis_observations[0];
  }, [analysis_observations, selectedObsId]);

  const compareObs = useMemo(() => {
    if (compareObsId === 'none') return null;
    return analysis_observations.find(o => o.observation_id === compareObsId) || null;
  }, [analysis_observations, compareObsId]);

  const chartData = useMemo(() => {
    const map = new Map<number, any>();

    primaryObs.hodograph_points.forEach(pt => {
      const altKey = unitSystem === 'meteorological' ? pt.height_ft : pt.height_m;
      map.set(altKey, {
        altitude: altKey,
        altLabel: unitSystem === 'meteorological' ? `${pt.height_ft} ft` : `${pt.height_m} m`,
        speed_p: unitSystem === 'meteorological' ? pt.speed_kt : round2(pt.speed_kt * 0.514444),
        dir_p: pt.direction_deg,
        u_p: pt.u,
        v_p: pt.v,
      });
    });

    if (compareObs) {
      compareObs.hodograph_points.forEach(pt => {
        const altKey = unitSystem === 'meteorological' ? pt.height_ft : pt.height_m;
        const existing = map.get(altKey) || {
          altitude: altKey,
          altLabel: unitSystem === 'meteorological' ? `${pt.height_ft} ft` : `${pt.height_m} m`,
        };
        existing.speed_c = unitSystem === 'meteorological' ? pt.speed_kt : round2(pt.speed_kt * 0.514444);
        existing.dir_c = pt.direction_deg;
        existing.u_c = pt.u;
        existing.v_c = pt.v;
        map.set(altKey, existing);
      });
    }

    return Array.from(map.values()).sort((a, b) => a.altitude - b.altitude);
  }, [primaryObs, compareObs, unitSystem]);

  function round2(num: number) {
    return Math.round(num * 100) / 100;
  }

  const speedUnit = unitSystem === 'meteorological' ? 'knot' : 'm/s';
  const altUnit = unitSystem === 'meteorological' ? 'ft' : 'm';

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> 4 Profil Angin Vertikal
            </span>
            <SourceBadge sourceFile={primaryObs.source_file} sourcePage={2} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Profil Vertikal Atmosfer: {primaryObs.date_iso} (06 UTC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis perubahan kecepatan, arah, serta komponen zonal (U) dan meridional (V) terhadap ketinggian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <select
              value={selectedObsId}
              onChange={(e) => onSelectObservation(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer font-medium"
            >
              {analysis_observations.map(obs => (
                <option key={obs.observation_id} value={obs.observation_id} className="bg-white text-slate-800">
                  {obs.date_iso} ({obs.statistics.max_altitude_ft} ft)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50/50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs">
            <span className="text-amber-700 font-bold">Vs:</span>
            <select
              value={compareObsId}
              onChange={(e) => setCompareObsId(e.target.value)}
              className="bg-transparent text-amber-900 focus:outline-none cursor-pointer font-medium"
            >
              <option value="none" className="bg-white text-slate-500">Tidak ada komparasi</option>
              {analysis_observations.map(obs => (
                <option key={obs.observation_id} value={obs.observation_id} className="bg-white text-slate-800">
                  {obs.date_iso} ({obs.statistics.max_altitude_ft} ft)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setUnitSystem(prev => prev === 'meteorological' ? 'si' : 'meteorological')}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
            Satuan: <strong>{unitSystem === 'meteorological' ? 'Knot / Feet' : 'm/s / Meter'}</strong>
          </button>
        </div>
      </div>

      {/* 4 Vertical Profile Charts Grid (2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Wind Speed vs Altitude */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-600" />
                1. Kecepatan Angin vs Ketinggian
              </h3>
              <p className="text-[11px] text-slate-500">Sumbu X: Kecepatan ({speedUnit}) | Sumbu Y: Ketinggian ({altUnit})</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <EChartProfile
              data={chartData}
              xKey="speed_p"
              xCKey={compareObs ? "speed_c" : undefined}
              yKey="altitude"
              xTitle={`Kecepatan (${speedUnit})`}
              yTitle={`Ketinggian (${altUnit})`}
              pColor="#0284c7"
              cColor="#d97706"
              pName={primaryObs.date_iso}
              cName={compareObs?.date_iso}
            />
          </div>
        </div>

        {/* Chart 2: Wind Direction vs Altitude */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                2. Arah Angin vs Ketinggian
              </h3>
              <p className="text-[11px] text-slate-500">Sumbu X: Derajat Arah (0°-360°) | Sumbu Y: Ketinggian ({altUnit})</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <EChartProfile
              data={chartData}
              xKey="dir_p"
              xCKey={compareObs ? "dir_c" : undefined}
              yKey="altitude"
              xTitle="Derajat (°)"
              yTitle={`Ketinggian (${altUnit})`}
              pColor="#d97706"
              cColor="#db2777"
              pName={primaryObs.date_iso}
              cName={compareObs?.date_iso}
            />
          </div>
        </div>

        {/* Chart 3: U Component vs Altitude */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                3. Komponen Zonal U vs Ketinggian
              </h3>
              <p className="text-[11px] text-slate-500">Sumbu X: Komponen U (knot) [- = Timur, + = Barat] | Sumbu Y: ({altUnit})</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <EChartProfile
              data={chartData}
              xKey="u_p"
              xCKey={compareObs ? "u_c" : undefined}
              yKey="altitude"
              xTitle="U (kt)"
              yTitle={`Ketinggian (${altUnit})`}
              pColor="#059669"
              cColor="#9333ea"
              pName={primaryObs.date_iso}
              cName={compareObs?.date_iso}
            />
          </div>
        </div>

        {/* Chart 4: V Component vs Altitude */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                4. Komponen Meridional V vs Ketinggian
              </h3>
              <p className="text-[11px] text-slate-500">Sumbu X: Komponen V (knot) [+ = Selatan, - = Utara] | Sumbu Y: ({altUnit})</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <EChartProfile
              data={chartData}
              xKey="v_p"
              xCKey={compareObs ? "v_c" : undefined}
              yKey="altitude"
              xTitle="V (kt)"
              yTitle={`Ketinggian (${altUnit})`}
              pColor="#7c3aed"
              cColor="#e11d48"
              pName={primaryObs.date_iso}
              cName={compareObs?.date_iso}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

