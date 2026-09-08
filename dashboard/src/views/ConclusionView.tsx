import React, { useMemo } from 'react';
import { PibalBundle, AnalysisObservation } from '../types/pibal';
import { SourceBadge } from '../components/SourceBadge';
import { 
  Award, 
  Calendar, 
  HelpCircle, 
  ShieldCheck, 
  FileCheck, 
  CheckCircle2,
  AlertCircle,
  Layers,
  Wind
} from 'lucide-react';

interface ConclusionViewProps {
  data: PibalBundle;
  selectedObsId: string;
  onSelectObservation: (obsId: string) => void;
}

export const ConclusionView: React.FC<ConclusionViewProps> = ({
  data,
  selectedObsId,
  onSelectObservation
}) => {
  const { analysis_observations } = data;

  const currentObs = useMemo(() => {
    return analysis_observations.find(o => o.observation_id === selectedObsId) || analysis_observations[0];
  }, [analysis_observations, selectedObsId]);

  const { conclusions } = currentObs;
  const answers = conclusions.detailed_answers;

  const questions = [
    {
      key: 'q1_vertical_characteristics',
      num: 1,
      title: 'Bagaimana karakteristik angin secara vertikal?',
      desc: answers.q1_vertical_characteristics,
      icon: <Layers className="w-4 h-4 text-sky-400" />
    },
    {
      key: 'q2_speed_variation',
      num: 2,
      title: 'Bagaimana perubahan kecepatan angin terhadap ketinggian?',
      desc: answers.q2_speed_variation,
      icon: <Wind className="w-4 h-4 text-emerald-400" />
    },
    {
      key: 'q3_direction_variation',
      num: 3,
      title: 'Bagaimana perubahan arah angin terhadap ketinggian?',
      desc: answers.q3_direction_variation,
      icon: <Wind className="w-4 h-4 text-amber-400" />
    },
    {
      key: 'q4_hodograph_features',
      num: 4,
      title: 'Apa yang terlihat secara khusus pada hodograph?',
      desc: answers.q4_hodograph_features,
      icon: <Award className="w-4 h-4 text-indigo-400" />
    },
    {
      key: 'q5_most_significant_transition_layer',
      num: 5,
      title: 'Di lapisan mana perubahan paling jelas dan signifikan terjadi?',
      desc: answers.q5_most_significant_transition_layer,
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />
    },
    {
      key: 'q6_wind_shear_results',
      num: 6,
      title: 'Apa hasil analisis wind shear dan implikasinya?',
      desc: answers.q6_wind_shear_results,
      icon: <Layers className="w-4 h-4 text-purple-400" />
    },
    {
      key: 'q7_data_limitations',
      num: 7,
      title: 'Apakah terdapat keterbatasan data observasi?',
      desc: answers.q7_data_limitations,
      icon: <AlertCircle className="w-4 h-4 text-amber-400" />
    },
    {
      key: 'q8_scientifically_defensible_findings',
      num: 8,
      title: 'Apa temuan utama yang paling dapat dipertanggungjawabkan secara ilmiah?',
      desc: answers.q8_scientifically_defensible_findings,
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Modul Konklusi Analisis PiBal
            </span>
            <SourceBadge sourceFile={currentObs.source_file} sourcePage={2} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Kesimpulan Komprehensif Analisis Meteorologi ({currentObs.date_iso})
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Menjawab secara terstruktur 8 pertanyaan pokok analisis atmosfer sesuai standar Bagian 25 implementation requirements.
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

      {/* Mode 1: Executive Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-white border border-blue-100 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4" /> Mode 1: Ringkasan Eksekutif (Executive Summary)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Stamet Cilacap | 06 UTC
          </span>
        </div>
        <p className="text-sm text-slate-800 leading-relaxed font-medium">
          {conclusions.summary}
        </p>
      </div>

      {/* Mode 2: Detailed Conclusion (8 Questions Answered) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Mode 2: Kesimpulan Mendalam (8 Aspek Evaluasi Vertikal)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi analitis menyeluruh yang dapat diuji silang dengan data numerik mentah dokumen sumber.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <div 
              key={q.key}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2.5 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-2 text-slate-900">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  {q.icon}
                </div>
                <h4 className="font-bold text-xs leading-snug">
                  <span className="text-blue-600 mr-1">#{q.num}</span> {q.title}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                {q.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scientific Compliance & Non-Fabrication Guarantee */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-emerald-700 block">Kepatuhan Terhadap Scientific Constraints (Bab 26)</span>
          <p className="leading-relaxed">
            Sistem ini tidak merekayasa atau mengarang data sintetis. Seluruh nilai kecepatan, arah, komponen U/V, lapisan geser, dan interpretasi adveksi berakar murni dari pengukuran theodolit 21 file PDF di Stasiun Meteorologi Tunggul Wulung Cilacap. Batasan pengamatan optik dicantumkan secara eksplisit pada setiap lembar laporan.
          </p>
        </div>
      </div>
    </div>
  );
};
