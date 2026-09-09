import React, { useState, useMemo } from 'react';
import { PibalBundle, ProcessedObservation, PibalLevel } from '../types/pibal';
import { SourceBadge } from '../components/SourceBadge';
import { 
  Search, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Calendar,
  Layers,
  Compass,
  Download
} from 'lucide-react';

interface DataExplorerViewProps {
  data: PibalBundle;
  selectedObsId: string;
  onSelectObservation: (obsId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({
  data,
  selectedObsId,
  onSelectObservation,
  onNavigateTab
}) => {
  const { processed_observations } = data;
  const [viewMode, setViewMode] = useState<'observations' | 'levels'>('observations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObserver, setSelectedObserver] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [activeModalObs, setActiveModalObs] = useState<ProcessedObservation | null>(null);

  // Flatten all levels for level-by-level view
  const allLevels = useMemo(() => {
    const list: (PibalLevel & { date_iso: string; observer: string; obs_id: string })[] = [];
    processed_observations.forEach(obs => {
      obs.levels.forEach(lvl => {
        list.push({
          ...lvl,
          date_iso: obs.metadata.observation_date_iso,
          observer: obs.metadata.observer,
          obs_id: obs.observation_id
        });
      });
    });
    return list;
  }, [processed_observations]);

  // Unique observers
  const observers = useMemo(() => {
    const set = new Set(processed_observations.map(o => o.metadata.observer));
    return Array.from(set).sort();
  }, [processed_observations]);

  // Unique dates
  const dates = useMemo(() => {
    return processed_observations.map(o => o.metadata.observation_date_iso).sort();
  }, [processed_observations]);

  // Filtered observations
  const filteredObservations = useMemo(() => {
    return processed_observations.filter(obs => {
      const q = searchQuery.toLowerCase();
      const matchSearch = (
        obs.observation_id.toLowerCase().includes(q) ||
        obs.source_file.toLowerCase().includes(q) ||
        obs.metadata.observer.toLowerCase().includes(q) ||
        obs.metadata.termination_reason.toLowerCase().includes(q) ||
        obs.metadata.observation_date_iso.includes(q)
      );
      const matchObserver = selectedObserver === 'all' || obs.metadata.observer === selectedObserver;
      const matchDate = selectedDateFilter === 'all' || obs.metadata.observation_date_iso === selectedDateFilter;
      return matchSearch && matchObserver && matchDate;
    });
  }, [processed_observations, searchQuery, selectedObserver, selectedDateFilter]);

  // Filtered levels
  const filteredLevels = useMemo(() => {
    return allLevels.filter(lvl => {
      const q = searchQuery.toLowerCase();
      const matchSearch = (
        lvl.source_file.toLowerCase().includes(q) ||
        lvl.observer.toLowerCase().includes(q) ||
        lvl.date_iso.includes(q) ||
        lvl.height_ft.toString().includes(q) ||
        (lvl.advection_source && lvl.advection_source.toLowerCase().includes(q)) ||
        (lvl.vb_source && lvl.vb_source.toLowerCase().includes(q))
      );
      const matchObserver = selectedObserver === 'all' || lvl.observer === selectedObserver;
      const matchDate = selectedDateFilter === 'all' || lvl.date_iso === selectedDateFilter;
      return matchSearch && matchObserver && matchDate;
    });
  }, [allLevels, searchQuery, selectedObserver, selectedDateFilter]);

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (viewMode === 'observations') {
      csvContent += "Observation_ID,Date,Time,Station,Observer,Termination,File,Levels,Status\n";
      filteredObservations.forEach(obs => {
        csvContent += `${obs.observation_id},${obs.metadata.observation_date_iso},${obs.metadata.observation_time},${obs.metadata.station},${obs.metadata.observer},${obs.metadata.termination_reason},${obs.source_file},${obs.levels.length},${obs.quality.status}\n`;
      });
    } else {
      csvContent += "Date,Observer,Level_Idx,Height(ft),Direction(deg),Speed(kt),U(kt),V(kt),Quality,Notes\n";
      filteredLevels.forEach(lvl => {
        csvContent += `${lvl.date_iso},${lvl.observer},${lvl.level_index},${lvl.height_ft},${lvl.direction_deg},${lvl.speed_kt},${lvl.calculated_u},${lvl.calculated_v},${lvl.quality_status},${(lvl.validation_notes || '').replace(/,/g, ';')}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PiBal_Export_${viewMode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-[22px] p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Eksplorasi Dataset PiBal Terstruktur
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Menampilkan data terverifikasi hasil ekstraksi dari 21 dokumen PDF pengamatan asli Stasiun Tunggul Wulung Cilacap.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('observations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'observations' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Dokumen Observasi (21 PDF)
          </button>
          <button
            onClick={() => setViewMode('levels')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'levels' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Seluruh Lapisan ({allLevels.length} Level)
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-[22px] p-4 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari file PDF, tanggal, observer, alasan, atau arah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedObserver}
            onChange={(e) => setSelectedObserver(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:bg-white focus:border-blue-600 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Observer</option>
            {observers.map(obs => (
              <option key={obs} value={obs}>{obs}</option>
            ))}
          </select>

          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:bg-white focus:border-blue-600 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Tanggal</option>
            {dates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {(searchQuery || selectedObserver !== 'all' || selectedDateFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedObserver('all');
                setSelectedDateFilter('all');
              }}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Reset
            </button>
          )}

          <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Ekspor CSV
            </button>
        </div>
      </div>

      {/* Table 1: Observations List View */}
      {viewMode === 'observations' && (
        <div className="bg-white border border-slate-200/80 rounded-[22px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Tanggal & Waktu</th>
                  <th className="px-5 py-3.5">Nama File Sumber</th>
                  <th className="px-5 py-3.5">Observer</th>
                  <th className="px-5 py-3.5">Puncak Ketinggian</th>
                  <th className="px-5 py-3.5">Jumlah Level</th>
                  <th className="px-5 py-3.5">Alasan Terminasi</th>
                  <th className="px-5 py-3.5">Status Kualitas</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredObservations.map((obs) => (
                  <tr 
                    key={obs.observation_id}
                    className="hover:bg-blue-50/50 transition-all cursor-pointer"
                    onClick={() => setActiveModalObs(obs)}
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      {obs.metadata.observation_date_iso} <span className="text-slate-400 font-normal">06 UTC</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-blue-600 font-semibold">
                      {obs.source_file}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {obs.metadata.observer}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-extrabold text-slate-900">
                      {obs.levels[obs.levels.length - 1]?.height_ft.toLocaleString()} ft
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-medium">
                      {obs.levels.length} baris
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold text-xs">
                        {obs.metadata.termination_reason}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectObservation(obs.observation_id);
                          onNavigateTab('hodograph');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 font-bold text-xs transition-all inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Compass className="w-3.5 h-3.5" /> Hodograph
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table 2: All Levels View */}
      {viewMode === 'levels' && (
        <div className="bg-white border border-slate-200/80 rounded-[22px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-700 uppercase tracking-wider font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-3.5">Tanggal</th>
                  <th className="px-3.5 py-3.5">Level</th>
                  <th className="px-3.5 py-3.5">Height (ft)</th>
                  <th className="px-3.5 py-3.5">Height (m)</th>
                  <th className="px-3.5 py-3.5">Arah (°)</th>
                  <th className="px-3.5 py-3.5">Kec (kt)</th>
                  <th className="px-3.5 py-3.5">Kec (m/s)</th>
                  <th className="px-3.5 py-3.5">U (kt)</th>
                  <th className="px-3.5 py-3.5">V (kt)</th>
                  <th className="px-3.5 py-3.5">V/B</th>
                  <th className="px-3.5 py-3.5">Adveksi</th>
                  <th className="px-3.5 py-3.5">Sumber PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLevels.map((lvl, idx) => (
                  <tr key={`${lvl.obs_id}_${lvl.level_index}_${idx}`} className="hover:bg-blue-50/50 transition-all">
                    <td className="px-3.5 py-2.5 text-slate-900 font-sans font-semibold">{lvl.date_iso}</td>
                    <td className="px-3.5 py-2.5 text-slate-500 font-bold">{lvl.level_index}</td>
                    <td className="px-3.5 py-2.5 text-blue-600 font-bold">{lvl.height_ft.toLocaleString()}</td>
                    <td className="px-3.5 py-2.5 text-slate-600">{lvl.height_m}</td>
                    <td className="px-3.5 py-2.5 text-amber-600 font-bold">{lvl.direction_deg}°</td>
                    <td className="px-3.5 py-2.5 text-emerald-600 font-extrabold">{lvl.speed_kt}</td>
                    <td className="px-3.5 py-2.5 text-slate-600">{lvl.speed_ms}</td>
                    <td className="px-3.5 py-2.5 text-slate-800 font-semibold">{lvl.source_u}</td>
                    <td className="px-3.5 py-2.5 text-slate-800 font-semibold">{lvl.source_v}</td>
                    <td className="px-3.5 py-2.5 font-sans">
                      {lvl.vb_source ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          lvl.vb_source === 'backing' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {lvl.vb_source}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-3.5 py-2.5 font-sans">
                      {lvl.advection_source ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          lvl.advection_source.includes('Hangat') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {lvl.advection_source}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-500 text-[11px]">{lvl.source_file}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Observation Detail Modal / Drawer */}
      {activeModalObs && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-[26px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#f8fafc]">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                    {activeModalObs.observation_id}
                  </span>
                  <SourceBadge sourceFile={activeModalObs.source_file} sourcePage={1} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Detail Pengamatan PiBal: {activeModalObs.metadata.observation_date_iso} (06 UTC)
                </h3>
              </div>
              <button
                onClick={() => setActiveModalObs(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Metadata Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Observer</span>
                  <span className="text-slate-900 font-extrabold text-sm">{activeModalObs.metadata.observer}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Alasan Terminasi</span>
                  <span className="text-amber-700 font-extrabold text-sm">{activeModalObs.metadata.termination_reason}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{activeModalObs.metadata.termination_description}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">MSL Elevasi</span>
                  <span className="text-slate-900 font-extrabold text-sm">{activeModalObs.metadata.msl_raw}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Total Level Data</span>
                  <span className="text-emerald-700 font-extrabold text-sm">{activeModalObs.levels.length} Level</span>
                </div>
              </div>

              {/* WMO Codes (PPAA & PPBB) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono">
                  <span className="text-blue-700 font-bold block mb-1 text-xs">KODE SANDI WMO: PPAA</span>
                  <pre className="text-slate-800 text-[11px] whitespace-pre-wrap leading-relaxed">{activeModalObs.codes.ppaa || 'NIL'}</pre>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono">
                  <span className="text-blue-700 font-bold block mb-1 text-xs">KODE SANDI WMO: PPBB</span>
                  <pre className="text-slate-800 text-[11px] whitespace-pre-wrap leading-relaxed">{activeModalObs.codes.ppbb || 'NIL'}</pre>
                </div>
              </div>

              {/* Hodograph Table in this observation */}
              <div>
                <h4 className="font-bold text-slate-900 mb-2.5 flex items-center gap-2 text-sm">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Tabel Laporan Hodograph (Halaman 2 PDF)
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-[#f8fafc] text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5">No</th>
                        <th className="px-3.5 py-2.5">Height (ft)</th>
                        <th className="px-3.5 py-2.5">Arah</th>
                        <th className="px-3.5 py-2.5">Kec (kt)</th>
                        <th className="px-3.5 py-2.5">U</th>
                        <th className="px-3.5 py-2.5">V</th>
                        <th className="px-3.5 py-2.5">V/B</th>
                        <th className="px-3.5 py-2.5">Adveksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeModalObs.levels.map(l => (
                        <tr key={l.level_index} className="hover:bg-slate-50">
                          <td className="px-3.5 py-2 text-slate-400 font-bold">{l.level_index}</td>
                          <td className="px-3.5 py-2 text-blue-600 font-bold">{l.height_ft}</td>
                          <td className="px-3.5 py-2 text-amber-600 font-bold">{l.direction_deg}°</td>
                          <td className="px-3.5 py-2 text-emerald-600 font-extrabold">{l.speed_kt}</td>
                          <td className="px-3.5 py-2 text-slate-800">{l.source_u}</td>
                          <td className="px-3.5 py-2 text-slate-800">{l.source_v}</td>
                          <td className="px-3.5 py-2 font-sans font-semibold">{l.vb_source || '-'}</td>
                          <td className="px-3.5 py-2 font-sans font-semibold">{l.advection_source || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Minute Observations from Theodolite */}
              {activeModalObs.theodolite_records.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2.5 flex items-center gap-2 text-sm">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    Data Bacaan Theodolit Menit-ke-Menit (Halaman 1 PDF)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {activeModalObs.theodolite_records.map(r => (
                      <div key={r.minute} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px]">
                        <div className="text-blue-600 font-bold">Menit {r.minute}</div>
                        <div className="text-slate-700">Az: {r.azimuth ?? '-'}°</div>
                        <div className="text-slate-700">El: {r.elevation ?? '-'}°</div>
                        {r.derived_dir && (
                          <div className="text-emerald-600 font-bold">→ {r.derived_dir}° / {r.derived_speed} kt</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 bg-[#f8fafc] flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Data diverifikasi dan terhubung ke file <strong className="text-slate-800">{activeModalObs.source_file}</strong>
              </span>
              <button
                onClick={() => {
                  onSelectObservation(activeModalObs.observation_id);
                  setActiveModalObs(null);
                  onNavigateTab('hodograph');
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-md shadow-blue-500/25"
              >
                <Compass className="w-4 h-4" /> Buka di Hodograph Analisis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataExplorerView;
