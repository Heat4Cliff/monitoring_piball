import React, { useMemo } from 'react';
import { PibalBundle, AnalysisObservation } from '../types/pibal';
import { SourceBadge } from '../components/SourceBadge';
import { 
  FileText, 
  CheckCircle2, 
  Calendar, 
  HelpCircle, 
  ArrowRight, 
  Layers, 
  Wind, 
  Compass, 
  Activity, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface InterpretationViewProps {
  data: PibalBundle;
  selectedObsId: string;
  onSelectObservation: (obsId: string) => void;
}

export const InterpretationView: React.FC<InterpretationViewProps> = ({
  data,
  selectedObsId,
  onSelectObservation
}) => {
  const { analysis_observations } = data;

  const currentObs = useMemo(() => {
    return analysis_observations.find(o => o.observation_id === selectedObsId) || analysis_observations[0];
  }, [analysis_observations, selectedObsId]);

  const { findings, interpretations } = currentObs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Evidence-Based Interpretation Engine
            </span>
            <SourceBadge sourceFile={currentObs.source_file} sourcePage={2} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Interpretasi Otomatis Berbasis Bukti Numerik ({currentObs.date_iso})
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Setiap klaim narasi diturunkan langsung dari angka hasil observasi aktual dengan jejak audit dan kalkulasi transparan.
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

      {/* Narrative Section Cards (Section 23) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speed Profile Narrative */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
            <Wind className="w-4 h-4" /> 23.1 Interpretasi Profil Kecepatan Angin
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {interpretations.speed_profile}
          </p>
        </div>

        {/* Direction Profile Narrative */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2">
            <Compass className="w-4 h-4" /> 23.2 Interpretasi Profil Arah Angin
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {interpretations.direction_profile}
          </p>
        </div>

        {/* Hodograph Trajectory Narrative */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 23.3 Interpretasi Pola Trajektori Hodograph
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {interpretations.hodograph_trajectory}
          </p>
        </div>

        {/* Wind Shear Narrative */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-purple-700 flex items-center gap-2">
            <Layers className="w-4 h-4" /> 23.4 Interpretasi Lapisan Wind Shear
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {interpretations.wind_shear}
          </p>
        </div>
      </div>

      {/* Data Quality Limitation Alert */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-800 block mb-0.5">23.5 Catatan Keterbatasan Data Observasi</span>
          <p className="text-amber-950 leading-relaxed">
            {interpretations.data_quality_warning}
          </p>
        </div>
      </div>

      {/* Evidence-Based Finding Cards (Section 24) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Kartu Temuan Berbasis Bukti (Evidence Cards)
            </h3>
            <p className="text-xs text-slate-500">
              Struktur alur: Temuan (Claim) → Bukti Numerik (Evidence) → Perhitungan (Calculation) → Interpretasi → Dokumen Sumber.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {findings.map((f, idx) => (
            <div 
              key={f.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-sky-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{f.title}</h4>
                </div>
                <SourceBadge sourceFile={f.source_file} sourcePage={f.source_page} />
              </div>

              {/* Claim */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                <span className="text-slate-500 uppercase font-bold text-[10px] block mb-1">Klaim Temuan (Finding Claim):</span>
                <p className="font-semibold text-slate-900">{f.claim}</p>
              </div>

              {/* Grid: Supporting Evidence & Calculation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Evidence */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono">
                  <span className="text-emerald-700 font-bold font-sans block text-[11px]">
                    📊 Bukti Data Terukur (Supporting Evidence):
                  </span>
                  {Object.entries(f.evidence).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="text-slate-500 font-sans">{k.replace(/_/g, ' ')}:</span>
                      <span className="font-bold text-slate-900">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Calculation */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono">
                  <span className="text-amber-700 font-bold font-sans block text-[11px]">
                    🧮 Formula & Kalkulasi Matematis:
                  </span>
                  <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {f.calculation}
                  </p>
                </div>
              </div>

              {/* Scientific Interpretation */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700">
                <span className="text-blue-800 font-bold block mb-0.5">Penjelasan Ilmiah & Konteks Meteorologi:</span>
                <p className="leading-relaxed text-slate-700">{f.interpretation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
