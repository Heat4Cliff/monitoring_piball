import React, { useMemo, useState } from 'react';
import { PibalBundle } from '../types/pibal';
import ReactECharts from 'echarts-for-react';
import { Map, Info } from 'lucide-react';

interface TimeHeightViewProps {
  data: PibalBundle;
  onNavigateTab: (tab: string) => void;
}

export const TimeHeightView: React.FC<TimeHeightViewProps> = ({ data, onNavigateTab }) => {
  const [metric, setMetric] = useState<'speed' | 'u' | 'v'>('speed');

  // Process data for Hovmöller
  const { chartData, dates, altitudes } = useMemo(() => {
    const obsList = [...data.processed_observations].sort((a, b) => 
      a.metadata.observation_date_iso.localeCompare(b.metadata.observation_date_iso)
    );

    const dateSet = new Set<string>();
    const altSet = new Set<number>();

    // Collect unique dates and altitudes (every 1000 ft)
    obsList.forEach(obs => {
      dateSet.add(obs.metadata.observation_date_iso);
      obs.levels.forEach(lvl => {
        if (lvl.height_ft % 1000 === 0 && lvl.height_ft <= 20000) {
          altSet.add(lvl.height_ft);
        }
      });
    });

    const dates = Array.from(dateSet).sort();
    const altitudes = Array.from(altSet).sort((a, b) => a - b);

    // [xIndex, yIndex, value]
    const cData: [number, number, number | null][] = [];

    dates.forEach((date, xIdx) => {
      const obs = obsList.find(o => o.metadata.observation_date_iso === date);
      
      altitudes.forEach((alt, yIdx) => {
        if (!obs) {
          cData.push([xIdx, yIdx, null]);
          return;
        }

        const lvl = obs.levels.find(l => l.height_ft === alt);
        if (!lvl) {
          cData.push([xIdx, yIdx, null]);
          return;
        }

        let val = null;
        if (metric === 'speed') val = lvl.speed_kt;
        else if (metric === 'u') val = lvl.calculated_u;
        else if (metric === 'v') val = lvl.calculated_v;

        cData.push([xIdx, yIdx, val !== null ? Number(val.toFixed(1)) : null]);
      });
    });

    return { chartData: cData, dates, altitudes };
  }, [data, metric]);

  const option = useMemo(() => {
    let minMap = 0;
    let maxMap = 40;
    let colorScheme = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'];
    
    if (metric === 'u' || metric === 'v') {
      minMap = -30;
      maxMap = 30;
    }

    return {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const date = dates[params.data[0]];
          const alt = altitudes[params.data[1]];
          const val = params.data[2];
          const mLabel = metric === 'speed' ? 'Speed' : metric === 'u' ? 'U-Wind' : 'V-Wind';
          return `<div class="font-mono text-xs">
            <strong>${date}</strong><br/>
            Altitude: ${alt} ft<br/>
            ${mLabel}: ${val !== null ? val + ' kt' : 'No Data'}
          </div>`;
        }
      },
      grid: {
        top: 60,
        bottom: 80,
        left: 80,
        right: 50
      },
      dataZoom: [
        { type: 'inside', xAxisIndex: 0, zoomOnMouseWheel: true },
        { type: 'slider', xAxisIndex: 0, bottom: 10, height: 25 },
        { type: 'inside', yAxisIndex: 0, zoomOnMouseWheel: true },
        { type: 'slider', yAxisIndex: 0, right: 10, width: 20 }
      ],
      xAxis: {
        type: 'category',
        data: dates,
        splitArea: { show: true },
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          color: '#64748b'
        }
      },
      yAxis: {
        type: 'category',
        data: altitudes.map(a => `${a} ft`),
        splitArea: { show: true },
        axisLabel: {
          fontSize: 10,
          color: '#64748b'
        }
      },
      visualMap: {
        min: minMap,
        max: maxMap,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: {
          color: colorScheme
        },
        textStyle: { fontSize: 10 }
      },
      series: [{
        name: 'Wind Data',
        type: 'heatmap',
        data: chartData,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  }, [chartData, dates, altitudes, metric]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500 opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Map className="w-6 h-6 text-indigo-100" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Hovmöller Diagram</h2>
              <p className="text-indigo-200 text-sm">Kontur Waktu vs Ketinggian (Time-Series Profile)</p>
            </div>
          </div>
          <p className="text-sm text-indigo-100/80 max-w-2xl leading-relaxed">
            Diagram Hovmöller digunakan secara ekstensif dalam meteorologi operasional untuk memantau evolusi profil angin dari hari ke hari. Sumbu horizontal menunjukkan waktu, dan sumbu vertikal menunjukkan ketinggian.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
            <button
              onClick={() => setMetric('speed')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${metric === 'speed' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Kecepatan Angin (Speed)
            </button>
            <button
              onClick={() => setMetric('u')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${metric === 'u' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Komponen Zonal (U)
            </button>
            <button
              onClick={() => setMetric('v')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${metric === 'v' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Komponen Meridional (V)
            </button>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4" /> Resolusi Vertikal: 1000 ft
          </div>
        </div>

        <div className="h-[450px] lg:h-[600px] w-full">
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    </div>
  );
};
