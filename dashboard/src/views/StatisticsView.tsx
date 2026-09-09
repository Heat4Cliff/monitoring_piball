import React, { useMemo } from 'react';
import { PibalBundle, AnalysisObservation } from '../types/pibal';
import { SourceBadge } from '../components/SourceBadge';
import { MetricCard } from '../components/MetricCard';
import { 
  BarChart3, 
  Wind, 
  Layers, 
  Activity, 
  AlertTriangle, 
  Compass, 
  Calendar,
  ShieldAlert,
  Info
} from 'lucide-react';

interface StatisticsViewProps {
  data: PibalBundle;
  selectedObsId: string;
  onSelectObservation: (obsId: string) => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  data,
  selectedObsId,
  onSelectObservation
}) => {
  const { analysis_observations } = data;

  const currentObs = useMemo(() => {
    return analysis_observations.find(o => o.observation_id === selectedObsId) || analysis_observations[0];
  }, [analysis_observations, selectedObsId]);

  const { statistics, shear_layers, max_shear_layer } = currentObs;

  return (
    <div className="space-y-6">
      {/* Header & Obs Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" /> Analisis Statistik & Wind Shear
            </span>
            <SourceBadge sourceFile={currentObs.source_file} sourcePage={2} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Karakteristik Statistik & Geser Angin Vertikal ({currentObs.date_iso})
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Analisis gradien vektor geser per lapisan ketebalan troposfer untuk evaluasi kestabilan dan turbulensi penerbangan.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Tingkat Level"
          value={statistics.total_levels}
          unit="Lapisan"
          subtitle="Terekam pada theodolit"
          icon={<Layers className="w-4 h-4" />}
          color="sky"
        />
        <MetricCard
          title="Rentang Ketinggian"
          value={`${statistics.min_altitude_ft} - ${statistics.max_altitude_ft}`}
          unit="ft"
          subtitle={`Setara ${round1(statistics.max_altitude_ft * 0.3048)} m`}
          icon={<Activity className="w-4 h-4" />}
          color="indigo"
        />
        <MetricCard
          title="Kecepatan Rata-rata"
          value={statistics.mean_speed_kt}
          unit="knot"
          subtitle={`Median: ${statistics.median_speed_kt} knot`}
          icon={<Wind className="w-4 h-4" />}
          color="emerald"
        />
        <MetricCard
          title="Kecepatan Ekstrem"
          value={`${statistics.min_speed_kt} - ${statistics.max_speed_kt}`}
          unit="knot"
          subtitle={`ΔV = ${statistics.max_speed_kt - statistics.min_speed_kt} knot`}
          icon={<Wind className="w-4 h-4" />}
          color="amber"
        />
        <MetricCard
          title="Komponen Zonal U"
          value={`${statistics.u_min} s/d ${statistics.u_max}`}
          unit="kt"
          subtitle={`Rata-rata: ${statistics.u_mean} kt`}
          icon={<Compass className="w-4 h-4" />}
          color="sky"
        />
        <MetricCard
          title="Komponen Meridional V"
          value={`${statistics.v_min} s/d ${statistics.v_max}`}
          unit="kt"
          subtitle={`Rata-rata: ${statistics.v_mean} kt`}
          icon={<Compass className="w-4 h-4" />}
          color="rose"
        />
      </div>

      {/* Highlight Box: Maximum Wind Shear Layer */}
      {max_shear_layer && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-300">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">
                  Zona Wind Shear Vertikal Terkuat
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Lapisan {max_shear_layer.altitude_range_ft} ft (Tebal Δz = {max_shear_layer.delta_z_ft} ft)
                </h3>
                <p className="text-xs text-slate-700 mt-1">
                  Terjadi diskontinuitas vektor kecepatan sebesar <strong className="text-amber-800">{max_shear_layer.shear_vector_mag_kt} knot</strong> dengan laju geser vertikal <strong className="text-amber-800">{max_shear_layer.shear_rate_per_kft} knot / 1000 ft</strong> ({max_shear_layer.severity}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-200 shadow-xs text-xs">
              <div>
                <span className="text-slate-500 block">Perubahan Arah</span>
                <span className="font-bold font-mono text-slate-900">{max_shear_layer.dir_diff_deg}°</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-slate-500 block">Perubahan Kecepatan</span>
                <span className="font-bold font-mono text-slate-900">{max_shear_layer.speed_diff_kt} kt</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-slate-500 block">Klasifikasi Adveksi</span>
                <span className="font-bold text-amber-700">{max_shear_layer.calculated_advection}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layer-by-Layer Wind Shear Analysis Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Tabel Analisis Wind Shear Antar-Lapisan Ketinggian
            </h3>
            <p className="text-xs text-slate-500">
              Dihitung berdasarkan perbedaan vektor |ΔV| = √((ΔU)² + (ΔV)²) dan dinormalisasi per 1.000 ft.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono font-semibold">
            {shear_layers.length} Lapisan Teranalisis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-3">Lapisan</th>
                <th className="px-3 py-3">Rentang Ketinggian</th>
                <th className="px-3 py-3">Δz (ft)</th>
                <th className="px-3 py-3">ΔU (kt)</th>
                <th className="px-3 py-3">ΔV (kt)</th>
                <th className="px-3 py-3">|ΔV| Shear (kt)</th>
                <th className="px-3 py-3">Laju Shear (kt/kft)</th>
                <th className="px-3 py-3 font-sans">Tingkat Keparahan</th>
                <th className="px-3 py-3 font-sans">V/B (Arah)</th>
                <th className="px-3 py-3 font-sans">Adveksi Termal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shear_layers.map((layer) => {
                const isMax = max_shear_layer && max_shear_layer.layer_index === layer.layer_index;
                const sevColor = layer.severity.includes('Kuat') 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : (layer.severity.includes('Sedang') ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200');
                
                return (
                  <tr key={layer.layer_index} className={`hover:bg-slate-50 transition-all ${isMax ? 'bg-amber-50/50 font-bold' : ''}`}>
                    <td className="px-3 py-2.5 text-slate-500 font-sans">L-{layer.layer_index}</td>
                    <td className="px-3 py-2.5 text-blue-700 font-semibold">{layer.altitude_range_ft} ft</td>
                    <td className="px-3 py-2.5 text-slate-500">{layer.delta_z_ft}</td>
                    <td className="px-3 py-2.5 text-slate-600">{layer.delta_u}</td>
                    <td className="px-3 py-2.5 text-slate-600">{layer.delta_v}</td>
                    <td className="px-3 py-2.5 text-amber-700 font-bold">{layer.shear_vector_mag_kt}</td>
                    <td className="px-3 py-2.5 text-slate-900 font-bold">{layer.shear_rate_per_kft}</td>
                    <td className="px-3 py-2.5 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${sevColor}`}>
                        {layer.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-sans">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        layer.calculated_vb === 'backing' ? 'text-amber-700' : 'text-blue-700'
                      }`}>
                        {layer.calculated_vb} ({layer.dir_diff_deg}°)
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-sans">
                      <span className={`text-[11px] font-semibold ${
                        layer.calculated_advection.includes('Hangat') ? 'text-amber-700' : 'text-blue-700'
                      }`}>
                        {layer.calculated_advection}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meteorological Method Reference Box */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
        <div className="font-semibold text-blue-700 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600" /> Formula & Ambang Batas Ilmiah Wind Shear
        </div>
        <p className="text-slate-600 leading-relaxed">
          • <strong>Magnitudo Vektor Shear:</strong> |ΔV| = √((ΔU)² + (ΔV)²) di mana U dan V adalah komponen arah angin meteorologi.<br />
          • <strong>Laju Shear Vertikal:</strong> β = (|ΔV| / Δz) × 1000 (knot per 1000 ft). Standar ICAO/WMO: Ringan (&lt; 4 kt/kft), Sedang (4 - 8 kt/kft), Kuat (&gt; 8 kt/kft).<br />
          • <strong>Hukum Angin Termal di Belahan Bumi Selatan (Cilacap 7.7° LS):</strong> Rotasi berlawanan arah jarum jam terhadap ketinggian (<em>Backing</em>) mengindikasikan <em>Adveksi Hangat</em>, sedangkan rotasi searah jarum jam (<em>Veering</em>) mengindikasikan <em>Adveksi Dingin</em>.
        </p>
      </div>
    </div>
  );

  function round1(val: number) {
    return Math.round(val * 10) / 10;
  }
};
