import React, { useState } from 'react';
import { 
  Download, 
  Link2, 
  UploadCloud, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Film, 
  Clock, 
  Monitor, 
  FileVideo,
  Copy,
  Check
} from 'lucide-react';
import { VideoSource } from '../types';
import { SAMPLE_VIDEOS } from '../data/mockAssets';

interface DownloaderPanelProps {
  onSelectVideo: (source: VideoSource) => void;
  activeVideo: VideoSource | null;
}

export const DownloaderPanel: React.FC<DownloaderPanelProps> = ({
  onSelectVideo,
  activeVideo,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Platform detector helper
  const detectPlatform = (url: string) => {
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('facebook.com')) return 'Facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'X (Twitter)';
    return null;
  };

  const currentPlatform = detectPlatform(urlInput);

  // Handle URL Extraction
  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) {
      setError('Masukkan URL video sosmed terlebih dahulu (misal TikTok, IG, atau YouTube).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessInfo(null);

    try {
      const res = await fetch('/api/extract-video-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal mengekstrak video');
      }

      const extracted = json.data;
      setSuccessInfo(extracted);

      // Create new video source
      const newSource: VideoSource = {
        id: `extracted-${Date.now()}`,
        title: extracted.title,
        url: extracted.streamUrl,
        sourceType: 'url',
        platform: extracted.platform,
        duration: extracted.duration || 20,
        resolution: extracted.resolution || '1080x1920 (9:16)',
        poster: extracted.poster,
      };

      onSelectVideo(newSource);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses tautan.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Local File Upload from Laptop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    const localSource: VideoSource = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      url: blobUrl,
      sourceType: 'local',
      platform: 'Local',
      duration: 30, // estimated
      resolution: 'Custom Local File',
    };

    onSelectVideo(localSource);
    setSuccessInfo({
      title: file.name,
      platform: 'Local Laptop Storage',
      streamUrl: blobUrl,
      ytdlpCommand: `# File lokal siap diedit: ${file.name}`,
    });
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Social Downloader & Media Ingestion</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Unduh Otomatis dari Semua Sosmed atau Unggah File Lokal
          </h2>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            Dukung tautan langsung dari <strong>TikTok (Tanpa Watermark)</strong>, <strong>Instagram Reels</strong>, dan <strong>YouTube Shorts/Video</strong>. Video akan langsung dimasukkan ke studio untuk dinarasi ulang, diberi overlay, dan diekspor dengan aman.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* URL Downloader Input Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 mb-4">
              <Link2 className="w-5 h-5 text-sky-400" />
              <span>Unduh via Tautan (URL) Sosmed</span>
            </h3>

            <form onSubmit={handleExtract} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Tempel URL TikTok, Reels Instagram, atau YouTube Shorts:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.tiktok.com/@creator/video/123456789 atau https://www.instagram.com/reel/..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 transition-all outline-none pr-28"
                  />
                  {currentPlatform && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30">
                      {currentPlatform}
                    </span>
                  )}
                </div>
              </div>

              {/* Supported Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                <span className="text-slate-500 font-medium">Platform Didukung:</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  🎵 TikTok (No WM)
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  📸 Instagram Reels
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  ▶️ YouTube Shorts
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                  📘 Facebook Watch
                </span>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-5 rounded-xl font-bold text-sm text-white shadow-lg transition-all ${
                    loading
                      ? 'bg-sky-600/60 cursor-wait'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-sky-500/25 active:scale-95'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>{loading ? 'Menganalisis & Mengunduh...' : 'Analisis & Ambil Video'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUrlInput('https://www.tiktok.com/@nature_explorer/video/71239823489234');
                    setTimeout(() => handleExtract(), 100);
                  }}
                  className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap"
                >
                  Coba Link Contoh
                </button>
              </div>
            </form>

            {/* Extracted Details & yt-dlp snippet */}
            {successInfo && (
              <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Video Berhasil Diambil & Dimuat ke Studio!</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[11px] font-semibold border border-emerald-500/20">
                    {successInfo.platform}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  <p className="font-semibold text-white">{successInfo.title}</p>
                  <p className="text-slate-400 mt-0.5">
                    Durasi: ~{successInfo.duration || 20}s • Resolusi: {successInfo.resolution || '1080x1920 (9:16)'}
                  </p>
                </div>

                {successInfo.ytdlpCommand && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Perintah yt-dlp di Laptop:
                      </span>
                      <button
                        onClick={() => handleCopyCmd(successInfo.ytdlpCommand)}
                        className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                      >
                        {copiedCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmd ? 'Tersalin' : 'Salin Perintah'}</span>
                      </button>
                    </div>
                    <code className="block p-2 bg-slate-900 rounded font-mono text-[10px] text-sky-300 overflow-x-auto select-all">
                      {successInfo.ytdlpCommand}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Local File Upload Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 mb-3">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span>Atau Unggah Media Lokal dari Laptop</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Punya rekaman video mentah di laptop? Unggah file (MP4, MOV, WebM, MKV) untuk diproses langsung dengan narasi dan overlay unik.
            </p>

            <label className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/50 hover:bg-slate-950 group">
              <FileVideo className="w-10 h-10 text-slate-500 group-hover:text-sky-400 transition-colors mb-2" />
              <span className="text-sm font-semibold text-white group-hover:text-sky-300">
                Klik untuk Memilih File Video Lokal
              </span>
              <span className="text-xs text-slate-500 mt-1">
                Mendukung MP4, MOV, MKV, WebM (Maksimal fleksibel)
              </span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Sample Clips Library (Right Column) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Film className="w-5 h-5 text-purple-400" />
                <span>Koleksi Klip Uji Coba Cepat</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">1-Klik Pakai</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Tidak ingin menunggu download? Klik salah satu video berkualitas tinggi di bawah ini untuk langsung mencoba studio:
            </p>

            <div className="space-y-3">
              {SAMPLE_VIDEOS.map((vid) => {
                const isCurrent = activeVideo?.id === vid.id;
                return (
                  <div
                    key={vid.id}
                    onClick={() => onSelectVideo(vid)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center space-x-3 ${
                      isCurrent
                        ? 'bg-sky-500/10 border-sky-500/50 ring-1 ring-sky-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-slate-800 overflow-hidden shrink-0 relative">
                      {vid.poster && (
                        <img
                          src={vid.poster}
                          alt={vid.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {vid.title}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{vid.duration}s</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Monitor className="w-3 h-3" />
                          <span>{vid.resolution}</span>
                        </span>
                      </div>
                      <span className="inline-block mt-1 text-[10px] text-sky-400 font-semibold">
                        Gaya {vid.platform}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Guide Tips */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
            <span className="font-bold text-slate-200 block text-sm">💡 Tips AutoPilot:</span>
            <p>
              • Mengapa perlu narasi ulang & overlay? Algoritma TikTok & Reels mendeteksi video reupload yang 100% sama.
            </p>
            <p>
              • Dengan mengganti narasi suara ke bahasa Indonesia/Inggris dan menambahkan filter overlay Pexels, video dinilai sebagai konten baru (transformative content).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
