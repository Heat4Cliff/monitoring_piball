import React, { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle2, XCircle, GraduationCap, ArrowRight, RefreshCw, Key, Loader2, Save, ShieldCheck, AlertCircle, History, Award } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface QuizRecord {
  date: string;
  score: number;
  total: number;
  accuracy: number;
}

export const QuizView: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  
  const [score, setScore] = useState<number>(0);
  const [isSessionCompleted, setIsSessionCompleted] = useState<boolean>(false);
  
  const [quizHistory, setQuizHistory] = useState<QuizRecord[]>(() => {
    const saved = localStorage.getItem('pibal_quiz_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key_pibal');
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    }
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim().length > 10) {
      localStorage.setItem('gemini_api_key_pibal', apiKey.trim());
      setIsKeySaved(true);
      setError(null);
    } else {
      setError("Kunci API tampaknya tidak valid. Harap periksa kembali.");
    }
  };

  const removeApiKey = () => {
    localStorage.removeItem('gemini_api_key_pibal');
    setApiKey('');
    setIsKeySaved(false);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setIsSessionCompleted(false);
  };

  const generateQuestionsBatch = async () => {
    if (!apiKey) return;
    
    setLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setIsSessionCompleted(false);

    try {
      const responseModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!responseModels.ok) {
        throw new Error("Gagal memverifikasi API Key. Coba periksa kembali kunci Anda.");
      }
      
      const dataModels = await responseModels.json();
      
      const validModels = dataModels.models
        .filter((m: any) => m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name);
      
      if (!validModels || validModels.length === 0) {
        throw new Error("API Key valid, tetapi tidak ada model Gemini yang diizinkan untuk akun ini.");
      }

      const promptContext = `
Anda adalah ahli Meteorologi Senior dari BMKG dan Instruktur WMO.
Buatlah tepat 20 pertanyaan pilihan ganda (kuis) acak yang SANGAT MENARIK, tentang Pilot Balloon (PiBal), Hodograph, Dinamika Atmosfer, atau Keselamatan Penerbangan.

Aturan Pembuatan Soal:
1. Jumlah persis 20 soal.
2. Panjang pertanyaan sedang (tidak terlalu singkat, tapi jangan terlalu bertele-tele).
3. Soal harus berbahasa Indonesia, profesional, dan menantang.
4. Format Output WAJIB berupa JSON array murni (TANPA blok kode \`\`\`json).

Contoh Format JSON:
[
  {
    "question": "Sebutkan...",
    "options": {
      "A": "Pilihan A",
      "B": "Pilihan B",
      "C": "Pilihan C",
      "D": "Pilihan D"
    },
    "correct_answer": "A",
    "explanation": "Penjelasan detail mengapa A benar."
  },
  {...}
]`;

      let generatedText = null;
      let lastError = "";

      // Try models in order
      for (const modelName of validModels) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              contents: [{ parts: [{ text: promptContext }] }],
              generationConfig: { temperature: 0.8 }
            })
          });
          
          if (res.ok) {
            const data = await res.json();
            generatedText = data.candidates[0].content.parts[0].text;
            break; 
          } else {
            const errData = await res.json();
            lastError = errData.error?.message || `Error ${res.status}`;
          }
        } catch (e: any) {
          lastError = e.message;
        }
      }

      if (!generatedText) {
        throw new Error(`Semua model menolak permintaan (Error terakhir: ${lastError})`);
      }
      
      const cleanedText = generatedText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsedData = JSON.parse(cleanedText) as QuizQuestion[];
      
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error("Format respons AI tidak sesuai standar JSON array yang diharapkan.");
      }
      
      setQuestions(parsedData);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menghubungi AI atau mem-parsing respons.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (option: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return;
    
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    const currentQuestion = questions[currentIndex];
    let isCorrect = option === currentQuestion.correct_answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Finish Quiz
      setIsSessionCompleted(true);
      const newRecord: QuizRecord = {
        date: new Date().toISOString(),
        score: score,
        total: questions.length,
        accuracy: Math.round((score / questions.length) * 100)
      };
      const updatedHistory = [newRecord, ...quizHistory].slice(0, 10);
      setQuizHistory(updatedHistory);
      localStorage.setItem('pibal_quiz_history', JSON.stringify(updatedHistory));
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-blue-400 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/20">
                <BrainCircuit className="w-6 h-6 text-blue-100" />
              </div>
              <h2 className="text-2xl font-bold">Kuis AI Dinamis (Batch)</h2>
            </div>
            <p className="text-blue-100/90 text-sm max-w-2xl leading-relaxed">
              Sistem akan meracik 20 soal unik sekaligus dalam satu sesi menggunakan Google Gemini. Menjawab seluruh soal akan menyimpan skor ke Riwayat.
            </p>
          </div>
        </div>
      </div>

      {/* API Key Setup */}
      {!isKeySaved ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col items-center text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <Key className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Hubungkan AI Studio</h3>
            <p className="text-sm text-slate-600">
              Sistem akan memanggil API Google secara pintar (mencoba model terbaik yang diizinkan untuk akun Anda secara otomatis).
            </p>
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
              Kunci Anda hanya disimpan secara lokal di peramban ini.
            </div>
            
            <div className="w-full relative mt-2">
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste API Key Gemini Anda di sini..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all pr-24"
              />
              <button 
                onClick={saveApiKey}
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-semibold bg-red-50 px-3 py-2 rounded-lg w-full">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Interface */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Quiz Panel */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Start Screen */}
            {questions.length === 0 && !loading && !error && (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                  <GraduationCap className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Mulai Sesi Kuis 20 Soal</h3>
                <p className="text-sm text-slate-600 max-w-md mb-8">
                  Sistem akan menginstruksikan AI untuk menyusun 20 soal sekaligus. Proses ini mungkin memerlukan waktu beberapa detik, mohon bersabar.
                </p>
                <button
                  onClick={generateQuestionsBatch}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                >
                  <BrainCircuit className="w-4 h-4" />
                  Generate 20 Soal Sekarang
                </button>
              </div>
            )}

            {/* Loading Screen */}
            {loading && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">AI Sedang Meracik 20 Soal...</h3>
                <p className="text-sm text-slate-500">Menganalisis pedoman WMO dan menghasilkan batch kuis yang menarik. Mohon tunggu sesaat.</p>
              </div>
            )}

            {/* Error Screen */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-bold mb-1">Terjadi Kesalahan API</p>
                  <p>{error}</p>
                  <button 
                    onClick={generateQuestionsBatch}
                    className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold text-xs transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* Completion Screen */}
            {isSessionCompleted && !loading && questions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 shadow-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-yellow-500/30">
                  <Award className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Sesi Kuis Selesai!</h3>
                <p className="text-slate-600 mb-8 max-w-sm">
                  Anda telah menyelesaikan seluruh 20 soal yang digenerate oleh AI. Hasilnya sudah tersimpan di riwayat.
                </p>
                
                <div className="flex gap-4 mb-8">
                  <div className="bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100">
                    <div className="text-sm font-bold text-blue-800 mb-1">Skor Anda</div>
                    <div className="text-4xl font-black text-blue-600">{Math.round((score / questions.length) * 100)}</div>
                  </div>
                </div>

                <button
                  onClick={() => { setQuestions([]); setIsSessionCompleted(false); setScore(0); setCurrentIndex(0); }}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4" /> Mulai Sesi Baru
                </button>
              </div>
            )}

            {/* Active Question */}
            {!isSessionCompleted && currentQuestion && !loading && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                    <span className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-blue-700">Q</span>
                    Soal {currentIndex + 1} dari {questions.length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 bg-slate-100 rounded-md">
                    Generated by Gemini
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-8 leading-snug">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                    let btnStateClass = "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700";
                    let isCorrect = currentQuestion.correct_answer === opt;
                    
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStateClass = "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500 font-semibold";
                      } else if (selectedAnswer === opt) {
                        btnStateClass = "bg-red-50 border-red-500 text-red-800 opacity-90";
                      } else {
                        btnStateClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={opt}
                        disabled={isAnswered}
                        onClick={() => handleAnswerSubmit(opt)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${btnStateClass}`}
                      >
                        <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border
                          ${isAnswered && isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 
                            isAnswered && selectedAnswer === opt && !isCorrect ? 'bg-red-500 border-red-600 text-white' : 
                            'bg-slate-100 border-slate-200 text-slate-500'}`}
                        >
                          {opt}
                        </div>
                        <div className="pt-1 text-sm leading-relaxed flex-1 font-medium">
                          {currentQuestion.options[opt]}
                        </div>
                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                        )}
                        {isAnswered && selectedAnswer === opt && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Post-Answer Explanation */}
                {isAnswered && (
                  <div className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-5 rounded-2xl border ${selectedAnswer === currentQuestion.correct_answer ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                      <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                        {selectedAnswer === currentQuestion.correct_answer ? (
                          <span className="text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Jawaban Tepat!</span>
                        ) : (
                          <span className="text-orange-700 flex items-center gap-2"><XCircle className="w-5 h-5" /> Kurang Tepat!</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed mb-5">
                        <strong className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Penjelasan AI:</strong>
                        {currentQuestion.explanation}
                      </p>
                      
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={nextQuestion}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                        >
                          {currentIndex < questions.length - 1 ? 'Lanjut Soal Berikutnya' : 'Selesaikan Kuis'} <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Stats Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Statistik Sesi Aktif</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-blue-600 mb-1">{questions.length > 0 ? (currentIndex + (isAnswered ? 1 : 0)) : 0}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Dijawab</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-black text-emerald-600 mb-1">{score}</div>
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Benar</div>
                </div>
              </div>
              
              {questions.length > 0 && (
                <>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-2 transition-all duration-500" 
                      style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4">
                    Progres: {currentIndex + (isAnswered ? 1 : 0)} / {questions.length} Soal
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                API Terhubung
              </div>
              <button
                onClick={removeApiKey}
                className="w-full px-3 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Ganti / Hapus API Key
              </button>
            </div>

            {/* History Panel */}
            {quizHistory.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Riwayat Kuis</h4>
                </div>
                <div className="space-y-3">
                  {quizHistory.map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold mb-0.5">
                          {new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs font-bold text-slate-700">Skor: {record.score}/{record.total}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-black ${record.accuracy >= 80 ? 'bg-emerald-100 text-emerald-700' : record.accuracy >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {record.accuracy}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
