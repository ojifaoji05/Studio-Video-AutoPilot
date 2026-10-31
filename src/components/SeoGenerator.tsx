import React, { useState } from 'react';
import { 
  Hash, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Lightbulb, 
  TrendingUp, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { SeoData, NarrationData } from '../types';

interface SeoGeneratorProps {
  seoData: SeoData | null;
  onUpdateSeo: (data: SeoData) => void;
  narrationData: NarrationData | null;
  currentVideoTitle: string;
}

export const SeoGenerator: React.FC<SeoGeneratorProps> = ({
  seoData,
  onUpdateSeo,
  narrationData,
  currentVideoTitle,
}) => {
  const [topic, setTopic] = useState(currentVideoTitle || 'Video viral edukasi dan hiburan');
  const [platforms, setPlatforms] = useState<string[]>(['TikTok', 'Instagram', 'YouTube Shorts']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Copied states
  const [copiedTitleIdx, setCopiedTitleIdx] = useState<number | null>(null);
  const [copiedCaptionKey, setCopiedCaptionKey] = useState<string | null>(null);
  const [copiedTags, setCopiedTags] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const savedSettings = localStorage.getItem('autopilot_api_settings');
      const apiSettings = savedSettings ? JSON.parse(savedSettings) : {};

      const res = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          narrationScript: narrationData?.fullScript || '',
          targetPlatforms: platforms,
          geminiApiKey: apiSettings.geminiApiKey,
          geminiModel: apiSettings.geminiModel,
          customBaseUrl: apiSettings.customBaseUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menghasilkan SEO metadata');
      }

      onUpdateSeo(json.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses data SEO.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, onSuccess: () => void) => {
    navigator.clipboard.writeText(text);
    onSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copywriting & Tag FYP Otomatis</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Deskripsi Menarik, Judul Click-Worthy & Tagar FYP Viral
          </h2>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            Dapatkan judul pancingan (click-worthy), teks deskripsi dengan ajakan interaksi (CTA), dan tagar trending yang disesuaikan secara cerdas untuk algoritma TikTok, Instagram Reels, dan YouTube Shorts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Parameter Optimasi Algoritma</span>
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Topik Utama Video:
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Contoh: Fakta unik hewan laut, trik coding cepat..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Platform Sasaran:
                </label>
                <div className="space-y-2">
                  {['TikTok', 'Instagram', 'YouTube Shorts'].map((plat) => {
                    const isChecked = platforms.includes(plat);
                    return (
                      <label
                        key={plat}
                        className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setPlatforms([...platforms, plat]);
                            else setPlatforms(platforms.filter((p) => p !== plat));
                          }}
                          className="rounded text-emerald-500 focus:ring-0 bg-slate-800 border-slate-700"
                        />
                        <span className="font-semibold">{plat}</span>
                      </label>
                    );
                  })}
                </div>
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
                    ? 'bg-emerald-600/60 cursor-wait'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25 active:scale-95'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'AI Mengoptimasi Kata Kunci...' : 'Buat Judul, Caption & Tagar'}</span>
              </button>
            </form>
          </div>

          {/* Posting Strategy Card */}
          {seoData?.tips && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
              <h4 className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>Tips Algoritma FYP:</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {seoData.tips}
              </p>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Hash className="w-5 h-5 text-emerald-400" />
                <span>Hasil Optimasi Siap Pakai</span>
              </h3>
            </div>

            {seoData ? (
              <div className="space-y-5">
                {/* 1. Title Suggestions */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Pilihan Judul Video (Click-Worthy Hooks):
                  </span>
                  <div className="space-y-2">
                    {seoData.titles.map((title, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                      >
                        <span className="font-medium text-white pr-2">
                          {idx === 0 && <span className="text-emerald-400 font-bold mr-1.5">★ Rekomendasi:</span>}
                          {title}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(title, () => {
                              setCopiedTitleIdx(idx);
                              setTimeout(() => setCopiedTitleIdx(null), 2000);
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold shrink-0 flex items-center space-x-1"
                        >
                          {copiedTitleIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Platform Captions */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 block">
                    Format Deskripsi (Caption) per Platform:
                  </span>

                  {Object.entries(seoData.captions).map(([key, text]) => {
                    const label = key === 'tiktok' ? 'TikTok' : key === 'instagram' ? 'Instagram Reels' : 'YouTube Shorts';
                    const isCopied = copiedCaptionKey === key;
                    return (
                      <div key={key} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400">
                            {label}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(text, () => {
                                setCopiedCaptionKey(key);
                                setTimeout(() => setCopiedCaptionKey(null), 2000);
                              })
                            }
                            className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Tersalin' : 'Salin Caption'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-900/70 p-2.5 rounded-lg font-sans">
                          {text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* 3. Hashtags */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Tagar Trending FYP (Hashtags):
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(seoData.hashtags.join(' '), () => {
                          setCopiedTags(true);
                          setTimeout(() => setCopiedTags(false), 2000);
                        })
                      }
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
                    >
                      {copiedTags ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTags ? 'Semua Tagar Tersalin!' : 'Salin Semua Tagar'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {seoData.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-medium hover:bg-emerald-500/20 cursor-pointer transition-colors"
                        onClick={() => copyToClipboard(tag, () => {})}
                        title="Klik untuk salin satu tagar"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <Hash className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                <p className="text-sm">
                  Belum ada metadata yang dibuat. Masukkan topik di sebelah kiri dan klik{' '}
                  <strong className="text-slate-300 font-semibold">"Buat Judul, Caption & Tagar"</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
