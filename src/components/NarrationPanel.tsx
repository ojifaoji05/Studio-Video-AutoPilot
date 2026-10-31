import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Sparkles, 
  Play, 
  Square, 
  Volume2, 
  Languages, 
  Sliders, 
  Check, 
  Copy, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';
import { NarrationData, StudioSettings } from '../types';

interface NarrationPanelProps {
  narrationData: NarrationData | null;
  onUpdateNarration: (data: NarrationData) => void;
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  onApplyToStudio: () => void;
}

export const NarrationPanel: React.FC<NarrationPanelProps> = ({
  narrationData,
  onUpdateNarration,
  settings,
  onUpdateSettings,
  onApplyToStudio,
}) => {
  const [topic, setTopic] = useState('Fakta unik yang bikin tercengang');
  const [context, setContext] = useState('Momen luar biasa dan fenomena unik yang jarang diketahui penonton');
  const [language, setLanguage] = useState('Bahasa Indonesia');
  const [tone, setTone] = useState('Storytelling Viral & Penasaran');
  const [durationSec, setDurationSec] = useState(25);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // TTS State
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.05);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);

  // Load browser voices
  useEffect(() => {
    const updateVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        // Try to pick an Indonesian or English voice by default
        const idIdx = voices.findIndex(v => v.lang.includes('id') || v.lang.includes('ID'));
        if (idIdx !== -1) {
          setSelectedVoiceIndex(idIdx);
        } else {
          const enIdx = voices.findIndex(v => v.lang.includes('en'));
          if (enIdx !== -1) setSelectedVoiceIndex(enIdx);
        }
      }
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Generate narration using Gemini AI
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const savedSettings = localStorage.getItem('autopilot_api_settings');
      const apiSettings = savedSettings ? JSON.parse(savedSettings) : {};

      const res = await fetch('/api/generate-narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTopic: topic,
          originalContext: context,
          language,
          tone,
          durationSeconds: durationSec,
          geminiApiKey: apiSettings.geminiApiKey,
          geminiModel: apiSettings.geminiModel,
          customBaseUrl: apiSettings.customBaseUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghasilkan narasi');
      }

      onUpdateNarration(json.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses narasi.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Play TTS in browser
  const handlePlayTTS = () => {
    if (!narrationData?.fullScript) return;

    if (!('speechSynthesis' in window)) {
      alert('Browser Anda belum mendukung Text-to-Speech bawaan.');
      return;
    }

    window.speechSynthesis.cancel();

    if (isPlayingTTS) {
      setIsPlayingTTS(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(narrationData.fullScript);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    if (availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }

    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingTTS(true);
  };

  const handleStopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
    }
  };

  const handleCopyScript = () => {
    if (!narrationData?.fullScript) return;
    navigator.clipboard.writeText(narrationData.fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Voiceover & Dubbing Multi-Bahasa</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Ganti Suara Asli dengan Narasi AI Unik & Hook 3 Detik
          </h2>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            Hasilkan skrip narasi profesional dalam Bahasa Indonesia, Inggris, Jepang, dan bahasa lainnya. Dilengkapi teks berjalan otomatis dengan gaya subtitle MrBeast untuk retensi penonton maksimal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Generator Parameters */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Pengaturan Generator Narasi</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Topik / Inti Cerita Video:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Fakta mengejutkan gedung tertinggi..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Konteks & Detail Tambahan:
                </label>
                <textarea
                  rows={2}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Ceritakan kejadian di video agar narasi sinkron..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Bahasa Narasi:
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Bahasa Indonesia">🇮🇩 Bahasa Indonesia</option>
                    <option value="English (US)">🇺🇸 English (US)</option>
                    <option value="Japanese">🇯🇵 Japanese</option>
                    <option value="Spanish">🇪🇸 Spanish</option>
                    <option value="Arabic">🇸🇦 Arabic</option>
                    <option value="Bahasa Jawa">🇮🇩 Bahasa Jawa</option>
                    <option value="Bahasa Sunda">🇮🇩 Bahasa Sunda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Durasi Target:
                  </label>
                  <select
                    value={durationSec}
                    onChange={(e) => setDurationSec(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value={15}>15 Detik (Short Hook)</option>
                    <option value={25}>25 Detik (Optimal FYP)</option>
                    <option value={40}>40 Detik (Storytelling)</option>
                    <option value={60}>60 Detik (Full Narrative)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Gaya & Emosi (Tone):
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Storytelling Viral & Penasaran">🔥 Storytelling Viral & Penasaran</option>
                  <option value="Hook 3 Detik Menggelegar">⚡ Hook 3 Detik Menggelegar (Anti Skip)</option>
                  <option value="Fakta Edukatif & Wawasan">💡 Fakta Edukatif & Berwawasan</option>
                  <option value="Drama Emosional & Menegangkan">🎭 Drama Emosional & Menegangkan</option>
                  <option value="Santai, Kocak & Lucu">😂 Santai, Kocak & Komedi</option>
                  <option value="Motivasi & Pantang Menyerah">🏆 Motivasi & Inspiratif</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className={`w-full py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center space-x-2 shadow-lg transition-all ${
                  isGenerating
                    ? 'bg-indigo-600/60 cursor-wait'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/25 active:scale-95'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'AI Sedang Meracik Naskah...' : 'Buat Naskah Narasi AI'}</span>
              </button>
            </form>
          </div>

          {/* Subtitle Styling Preset */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Gaya Teks Subtitle di Video</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onUpdateSettings({ subtitleStyle: 'mrbeast-yellow' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.subtitleStyle === 'mrbeast-yellow'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="block text-amber-400 font-extrabold uppercase tracking-wide">MrBeast Yellow</span>
                <span className="text-[10px] text-slate-500">Teks kuning bold stroke hitam</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ subtitleStyle: 'cyberpunk-neon' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.subtitleStyle === 'cyberpunk-neon'
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="block text-cyan-400 font-extrabold uppercase">Cyber Neon</span>
                <span className="text-[10px] text-slate-500">Glow biru kehijauan modern</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ subtitleStyle: 'clean-white' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.subtitleStyle === 'clean-white'
                    ? 'bg-white/10 border-white text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="block text-white font-bold">Clean White</span>
                <span className="text-[10px] text-slate-500">Minimalis putih bayangan tipis</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ subtitleStyle: 'box-dark' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.subtitleStyle === 'box-dark'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="block text-purple-300 font-bold">Box Background</span>
                <span className="text-[10px] text-slate-500">Kotak gelap kontras tinggi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Generated Script & Voice Preview */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Mic className="w-5 h-5 text-purple-400" />
                <span>Naskah Voiceover & Studio TTS</span>
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyScript}
                  disabled={!narrationData}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Naskah'}</span>
                </button>
              </div>
            </div>

            {narrationData ? (
              <div className="space-y-4">
                {/* 3-Second Hook Highlight */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-400">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 block mb-1">
                    ⚡ Hook 3 Detik Pertama (Pemberhentian Scroll):
                  </span>
                  <p className="text-sm font-semibold text-white">
                    "{narrationData.hook}"
                  </p>
                </div>

                {/* Editable Full Script */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Teks Narasi Lengkap (Bisa Diedit Manual):
                  </label>
                  <textarea
                    rows={4}
                    value={narrationData.fullScript}
                    onChange={(e) =>
                      onUpdateNarration({
                        ...narrationData,
                        fullScript: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white leading-relaxed focus:border-indigo-500 outline-none"
                  />
                </div>

                {/* Segments breakdown */}
                {narrationData.segments && narrationData.segments.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-300 mb-2 block">
                      Segmen Waktu & Emosi Suara:
                    </span>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                      {narrationData.segments.map((seg, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-start justify-between"
                        >
                          <div className="space-y-0.5">
                            <span className="font-mono text-sky-400 text-[11px] font-bold">
                              {seg.time}
                            </span>
                            <p className="text-slate-300">{seg.text}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-medium shrink-0 ml-2">
                            {seg.emotion}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Speech Synthesis Controls (TTS) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>Pemutar Suara (Text-to-Speech)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ~{narrationData.estimatedDurationSec || 25} detik
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-400 block mb-1">Karakter Suara:</label>
                      <select
                        value={selectedVoiceIndex}
                        onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      >
                        {availableVoices.length > 0 ? (
                          availableVoices.map((v, i) => (
                            <option key={i} value={i}>
                              {v.name} ({v.lang})
                            </option>
                          ))
                        ) : (
                          <option value={0}>Suara Bawaan Sistem</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Kecepatan Suara:</span>
                        <span className="font-mono text-sky-400 font-bold">{speechRate}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="1.4"
                        step="0.05"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={handlePlayTTS}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow ${
                        isPlayingTTS
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      <span>{isPlayingTTS ? 'Sedang Membacakan...' : 'Putar Audio Narasi'}</span>
                    </button>

                    {isPlayingTTS && (
                      <button
                        type="button"
                        onClick={handleStopTTS}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={onApplyToStudio}
                      className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sinkronkan ke Video</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <Mic className="w-12 h-12 mx-auto text-slate-600 animate-bounce" />
                <p className="text-sm">
                  Belum ada naskah narasi. Tentukan topik di formulir sebelah kiri dan klik{' '}
                  <strong className="text-slate-300 font-semibold">"Buat Naskah Narasi AI"</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
