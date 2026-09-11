import React, { useState, useEffect } from 'react';
import pibalRawData from './data/pibalData.json';
import { PibalBundle } from './types/pibal';

// Import Views
import { OverviewView } from './views/OverviewView';
import { DataExplorerView } from './views/DataExplorerView';
import { HodographView } from './views/HodographView';
import { WindProfileView } from './views/WindProfileView';
import { StatisticsView } from './views/StatisticsView';
import { InterpretationView } from './views/InterpretationView';
import { ConclusionView } from './views/ConclusionView';
import { EducationPiBalView } from './views/EducationPiBalView';
import { EducationHodographView } from './views/EducationHodographView';
import { QualityTraceabilityView } from './views/QualityTraceabilityView';
import { ExportReportView } from './views/ExportReportView';
import { Visualisasi3DView } from './views/Visualisasi3DView';
import { WindBarbView } from './views/WindBarbView';
import { QuizView } from './views/QuizView';
import { TimeHeightView } from './views/TimeHeightView';
import { DataUploadView } from './views/DataUploadView';
import { AtlasAwanView } from './views/AtlasAwanView';

// Import Icons
import {
  User,
  Home,
  LayoutDashboard,
  Database,
  BarChart3,
  Compass,
  Box,
  Wind,
  Layers,
  ShieldCheck,
  FileText,
  Printer,
  LogOut,
  Menu,
  X,
  Award,
  BookOpen,
  HelpCircle,
  BrainCircuit,
  Map,
  UploadCloud,
  Cloud,
  Activity
} from 'lucide-react';

export const App: React.FC = () => {
  const data = pibalRawData as unknown as PibalBundle;
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedObsId, setSelectedObsId] = useState<string>(
    data.analysis_observations.length > 0 ? data.analysis_observations[0].observation_id : ''
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Live UTC Clock state
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Navigation Items with authentic meteorological names
  const navItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'data_pibal', label: 'Data Table', icon: <Database className="w-5 h-5" /> },
    { id: 'statistics', label: 'Monthly Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'hodograph', label: 'Analisis Hodograph', icon: <Compass className="w-5 h-5" /> },
    { id: 'time_height', label: 'Kontur Hovmöller', icon: <Map className="w-5 h-5" /> },
    { id: 'visualisasi_3d', label: 'Visualisasi 3D', icon: <Box className="w-5 h-5" /> },
    { id: 'wind_barb', label: 'Bulu Angin WMO', icon: <Wind className="w-5 h-5" /> },
    { id: 'wind_profile', label: 'Profil Vertikal', icon: <Layers className="w-5 h-5" /> },
    { id: 'upload_data', label: 'Unggah Data Baru', icon: <UploadCloud className="w-5 h-5" /> },
    { id: 'traceability', label: 'Audit Kualitas Data', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'interpretation', label: 'Interpretasi Berbasis Bukti', icon: <FileText className="w-5 h-5" /> },
    { id: 'conclusion', label: 'Konklusi Analisis', icon: <Award className="w-5 h-5" /> },
    { id: 'atlas_awan', label: 'Buku Atlas Awan', icon: <Cloud className="w-5 h-5" /> },
    { id: 'edu_pibal', label: 'Panduan PiBal', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'edu_hodograph', label: 'Panduan Hodograph', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'quiz', label: 'Kuis AI', icon: <BrainCircuit className="w-5 h-5" /> },
    { id: 'export_report', label: 'Ekspor & Laporan', icon: <Printer className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fe] text-slate-800 flex flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. CLEAN SAAS SIDEBAR (Matching reference image)                          */}
      {/* ========================================================================= */}
      <aside className={`
        no-print z-50 flex flex-col justify-between w-64 px-6 py-7 shrink-0 transition-all duration-300 h-screen overflow-y-auto
        ${mobileMenuOpen 
          ? 'fixed inset-y-0 left-0 bg-[#f4f7fe] shadow-2xl flex' 
          : 'hidden lg:flex'
        }
      `}>
        <div>
          {/* Top User Avatar with Notification Dot */}
          <div className="relative mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-blue-50/90 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-100">
                <User className="w-7 h-7 stroke-[1.8] transition-transform duration-300 group-hover:scale-110" />
              </div>
              {/* Blue notification dot */}
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-blue-600 border-2 border-[#f4f7fe] rounded-full animate-pulse"></span>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Item List */}
          <nav className="space-y-1.5 overflow-hidden px-1 py-1 -mx-1">
            {navItems.map((item, index) => {
              // Both 'home' and 'overview' show the main dashboard
              const isActive = (activeTab === item.id) || (item.id === 'home' && activeTab === 'overview') || (item.id === 'overview' && activeTab === 'home');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'home') {
                      setActiveTab('overview');
                    } else {
                      setActiveTab(item.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  className={`group w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-all duration-300 ease-out text-left animate-in fade-in slide-in-from-left-8 ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 translate-x-1'
                      : 'text-slate-500 font-medium hover:text-blue-700 hover:bg-white hover:shadow-sm hover:translate-x-1'
                  }`}
                >
                  <span className={`shrink-0 transition-all duration-300 ease-out ${
                    isActive 
                      ? 'text-white scale-110 drop-shadow-md' 
                      : 'text-slate-400 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:text-blue-600'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  
                  {/* Subtle active indicator dot */}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Logout and Profile Initial Badge */}
        <div className="pt-6 border-t border-slate-200/70 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <button 
            onClick={() => setActiveTab('overview')}
            className="group flex items-center gap-2.5 text-slate-500 hover:text-slate-800 text-sm font-medium transition-all duration-300"
          >
            <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-rose-600" />
            <span className="group-hover:text-rose-600 transition-colors">Logout</span>
          </button>

          {/* Circular Initial Avatar Badge 'N' */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-bold flex items-center justify-center text-xs shadow-xs cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-md hover:shadow-blue-500/20">
            N
          </div>
        </div>
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT VIEWPORT (Frameless clean page layout)                    */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Clean Title Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white border border-slate-100 text-slate-600 shadow-sm"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {activeTab === 'overview' || activeTab === 'home' ? 'Dashboard' : navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                  BMKG Pilot Balloon (PiBal) & Upper Air Wind Analytics &#8226; Stamet Tunggul Wulung Cilacap
                </p>
              </div>
            </div>

            {/* Right Status Pill */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-100/90 shadow-xs text-xs font-mono text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">{utcTime || '06:00:00 UTC'}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-sans font-medium">WAHL 96805</span>
            </div>
          </div>

          {/* Dynamic View Rendering */}
          {(activeTab === 'overview' || activeTab === 'home') && (
            <OverviewView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId} 
              onNavigateTab={setActiveTab} 
            />
          )}

          {activeTab === 'data_pibal' && (
            <DataExplorerView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'hodograph' && (
            <HodographView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId}
            />
          )}

          {activeTab === 'visualisasi_3d' && (
            <Visualisasi3DView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId}
            />
          )}

          {activeTab === 'time_height' && (
            <TimeHeightView 
              data={data}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'upload_data' && (
            <DataUploadView 
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'wind_barb' && (
            <WindBarbView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId}
            />
          )}

          {activeTab === 'wind_profile' && (
            <WindProfileView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId}
            />
          )}

          {activeTab === 'statistics' && (
            <StatisticsView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId}
            />
          )}

          {activeTab === 'interpretation' && (
            <InterpretationView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId}
            />
          )}

          {activeTab === 'conclusion' && (
            <ConclusionView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId}
            />
          )}

          {activeTab === 'atlas_awan' && (
            <AtlasAwanView />
          )}

          {activeTab === 'edu_pibal' && (
            <EducationPiBalView />
          )}

          {activeTab === 'edu_hodograph' && (
            <EducationHodographView />
          )}

          {activeTab === 'quiz' && (
            <QuizView />
          )}

          {activeTab === 'traceability' && (
            <QualityTraceabilityView data={data} />
          )}

          {activeTab === 'export_report' && (
            <ExportReportView 
              data={data} 
              selectedObsId={selectedObsId}
              onSelectObservation={setSelectedObsId}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
