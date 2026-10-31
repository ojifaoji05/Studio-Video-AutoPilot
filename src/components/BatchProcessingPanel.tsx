import React, { useState, useEffect } from 'react';
import { 
  ListOrdered, 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Upload, 
  FileText, 
  Layers, 
  Languages, 
  Smartphone, 
  Tv, 
  RotateCw,
  Eye,
  Check
} from 'lucide-react';
import { BatchQueueItem, VideoSource } from '../types';

interface BatchProcessingPanelProps {
  queue: BatchQueueItem[];
  onUpdateQueue: (queue: BatchQueueItem[]) => void;
  onPreviewVideo: (item: BatchQueueItem) => void;
}

export const BatchProcessingPanel: React.FC<BatchProcessingPanelProps> = ({
  queue,
  onUpdateQueue,
  onPreviewVideo,
}) => {
  const [multiUrlInput, setMultiUrlInput] = useState('');
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [batchRatio, setBatchRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [batchLanguage, setBatchLanguage] = useState('Bahasa Indonesia');
  const [batchOverlay, setBatchOverlay] = useState('Cinematic Golden Dust');
  const [batchSuccessToast, setBatchSuccessToast] = useState<string | null>(null);

  // Helper: Detect platform
  const detectPlatform = (url: string) => {
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    return 'Sosmed URL';
  };

  // Add multiple URLs to queue
  const handleAddBatchUrls = () => {
    const lines = multiUrlInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 5);

    if (lines.length === 0) return;

    const newItems: BatchQueueItem[] = lines.map((url, idx) => ({
      id: `batch-${Date.now()}-${idx}`,
      url,
      title: `${detectPlatform(url)} Clip #${queue.length + idx + 1}`,
      platform: detectPlatform(url),
      status: 'waiting',
      progress: 0,
      aspectRatio: batchRatio,
      language: batchLanguage,
      overlayName: batchOverlay,
      speedFactor: 1.02,
      timestamp: Date.now(),
    }));

    onUpdateQueue([...queue, ...newItems]);
    setMultiUrlInput('');
  };

  // Add sample batch items
  const handleAddSampleBatch = () => {
    const samples: BatchQueueItem[] = [
      {
        id: `sample-batch-1-${Date.now()}`,
        url: 'https://www.tiktok.com/@nature_viral/video/712398491283',
        title: 'TikTok: Fenomena Alam Menakjubkan',
        platform: 'TikTok',
        status: 'waiting',
        progress: 0,
        aspectRatio: '9:16',
        language: 'Bahasa Indonesia',
        overlayName: 'Cinematic Golden Dust',
        speedFactor: 1.02,
        timestamp: Date.now(),
      },
      {
        id: `sample-batch-2-${Date.now()}`,
        url: 'https://www.instagram.com/reel/C89xYzQ123',
        title: 'Reels: Teknologi Masa Depan Tercepat',
        platform: 'Instagram',
        status: 'waiting',
        progress: 0,
        aspectRatio: '9:16',
        language: 'Bahasa Indonesia',
        overlayName: 'Light Leak Anamorphic',
        speedFactor: 1.02,
        timestamp: Date.now() + 1,
      },
      {
        id: `sample-batch-3-${Date.now()}`,
        url: 'https://youtube.com/shorts/Abc123XyZ',
        title: 'Shorts: Eksperimen Luar Biasa Viral',
        platform: 'YouTube',
        status: 'waiting',
        progress: 0,
        aspectRatio: '9:16',
        language: 'English (US)',
        overlayName: 'Cyberpunk VHS Noise',
        speedFactor: 1.02,
        timestamp: Date.now() + 2,
      },
    ];

    onUpdateQueue([...queue, ...samples]);
  };

  // Batch Queue Runner Loop
  useEffect(() => {
    let timer: any;
    if (isProcessingQueue) {
      // Find the first waiting or in-progress item
      const itemToProcess = queue.find(
        (i) => i.status === 'waiting' || i.status === 'downloading' || i.status === 'generating_narration' || i.status === 'rendering'
      );

      if (!itemToProcess) {
        setIsProcessingQueue(false);
        setBatchSuccessToast('Semua video dalam antrean berhasil diproses dan siap disimpan!');
        return;
      }

      timer = setTimeout(() => {
        onUpdateQueue(
          queue.map((item) => {
            if (item.id !== itemToProcess.id) return item;

            if (item.status === 'waiting') {
              return { ...item, status: 'downloading', progress: 25 };
            }
            if (item.status === 'downloading') {
              return { ...item, status: 'generating_narration', progress: 60 };
            }
            if (item.status === 'generating_narration') {
              return { ...item, status: 'rendering', progress: 85 };
            }
            if (item.status === 'rendering') {
              return {
                ...item,
                status: 'completed',
                progress: 100,
                outputUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-a-neon-sign-at-night-42861-large.mp4',
              };
            }
            return item;
          })
        );
      }, 1200);
    }

    return () => clearTimeout(timer);
  }, [isProcessingQueue, queue]);

  // Remove single item
  const handleRemove = (id: string) => {
    onUpdateQueue(queue.filter((q) => q.id !== id));
  };

  // Clear completed
  const handleClearCompleted = () => {
    onUpdateQueue(queue.filter((q) => q.status !== 'completed'));
  };

  // Batch Download All Completed
  const handleDownloadAllCompleted = () => {
    const completed = queue.filter((q) => q.status === 'completed');
    if (completed.length === 0) return;

    completed.forEach((item, idx) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = item.outputUrl || 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-a-neon-sign-at-night-42861-large.mp4';
        a.download = `autopilot_batch_${idx + 1}_${item.platform}.mp4`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 400);
    });

    setBatchSuccessToast(`Sedang mengunduh ${completed.length} video ke galeri laptop Anda!`);
  };

  const totalCount = queue.length;
  const completedCount = queue.filter((q) => q.status === 'completed').length;
  const pendingCount = queue.filter((q) => q.status === 'waiting').length;
  const processingCount = queue.filter((q) => q.status !== 'waiting' && q.status !== 'completed' && q.status !== 'failed').length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/50 to-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Otomasi Antrean Massal (Batch Processing Queue)</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Unduh & Proses Puluhan Video Sekaligus Secara Otomatis
          </h2>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            Tempel banyak tautan video sosmed sekaligus. Sistem akan mengunduh, membuat narasi AI baru, menempelkan overlay efek, dan merender FFmpeg secara berurutan di latar belakang tanpa harus klik satu per satu.
          </p>
        </div>
      </div>

      {batchSuccessToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{batchSuccessToast}</span>
          </div>
          <button onClick={() => setBatchSuccessToast(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Grid: Bulk Input & Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Bulk URLs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-sky-400" />
              <span>Tambah Tautan ke Antrean</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Daftar URL Video (1 baris per video):
              </label>
              <textarea
                rows={5}
                value={multiUrlInput}
                onChange={(e) => setMultiUrlInput(e.target.value)}
                placeholder="https://www.tiktok.com/@user/video/12345&#10;https://www.instagram.com/reel/abcde&#10;https://youtube.com/shorts/xyz123"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:border-sky-500 outline-none font-mono"
              />
            </div>

            {/* Batch Global Presets */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Format Rasio:</label>
                <select
                  value={batchRatio}
                  onChange={(e) => setBatchRatio(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="9:16">9:16 (TikTok/Reels)</option>
                  <option value="16:9">16:9 (YouTube)</option>
                  <option value="1:1">1:1 (Instagram)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Bahasa Narasi:</label>
                <select
                  value={batchLanguage}
                  onChange={(e) => setBatchLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="Bahasa Indonesia">🇮🇩 Indonesia</option>
                  <option value="English (US)">🇺🇸 English</option>
                  <option value="Japanese">🇯🇵 Japanese</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs block mb-1">Overlay Visual Bawaan:</label>
              <select
                value={batchOverlay}
                onChange={(e) => setBatchOverlay(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="Cinematic Golden Dust">✨ Cinematic Golden Dust</option>
                <option value="Light Leak Anamorphic">🌈 Light Leak Anamorphic</option>
                <option value="Cyberpunk VHS Noise">⚡ Cyberpunk VHS Noise</option>
                <option value="Vintage 35mm Frame">🎬 Vintage 35mm Film</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={handleAddBatchUrls}
                disabled={!multiUrlInput.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Masukkan ke Antrean</span>
              </button>

              <button
                type="button"
                onClick={handleAddSampleBatch}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 whitespace-nowrap"
              >
                + 3 Contoh Viral
              </button>
            </div>
          </div>

          {/* Batch Stats Summary Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Status & Performa Antrean</span>
            </h4>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-base font-extrabold text-white">{totalCount}</span>
                <span className="text-[10px] text-slate-400">Total</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-base font-extrabold text-amber-400">{pendingCount}</span>
                <span className="text-[10px] text-slate-400">Menunggu</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-base font-extrabold text-sky-400">{processingCount}</span>
                <span className="text-[10px] text-slate-400">Diproses</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-base font-extrabold text-emerald-400">{completedCount}</span>
                <span className="text-[10px] text-slate-400">Selesai</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              ⚡ <strong>Kecepatan Render:</strong> Dengan preset <code className="text-amber-300 font-mono">-preset ultrafast</code>, estimasi waktu proses berkisar <strong>3–6 detik per video</strong>.
            </p>
          </div>
        </div>

        {/* Right: Queue Monitor Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            {/* Header toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ListOrdered className="w-5 h-5 text-purple-400" />
                <span>Daftar Antrean Video ({queue.length})</span>
              </h3>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProcessingQueue(!isProcessingQueue)}
                  disabled={queue.length === 0}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-lg transition-all ${
                    isProcessingQueue
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25'
                  }`}
                >
                  {isProcessingQueue ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Jeda Antrean</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Mulai Proses Otomatis</span>
                    </>
                  )}
                </button>

                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllCompleted}
                    className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
                    title="Unduh Semua yang Selesai"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh ({completedCount})</span>
                  </button>
                )}

                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCompleted}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    title="Hapus yang Selesai"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Queue items list */}
            {queue.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {queue.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all ${
                        item.status === 'completed'
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : item.status === 'downloading' || item.status === 'generating_narration' || item.status === 'rendering'
                          ? 'bg-sky-950/30 border-sky-500/50 ring-1 ring-sky-500/30'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 max-w-[75%]">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-slate-500 text-xs font-bold">
                              #{index + 1}
                            </span>
                            <span className="font-bold text-white text-xs truncate">
                              {item.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                              {item.platform}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate font-mono">
                            {item.url}
                          </p>
                          <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                            <span>Format: {item.aspectRatio}</span>
                            <span>•</span>
                            <span>Narasi: {item.language}</span>
                            <span>•</span>
                            <span>Overlay: {item.overlayName}</span>
                          </div>
                        </div>

                        {/* Status badges & actions */}
                        <div className="flex flex-col items-end space-y-2 shrink-0">
                          {item.status === 'waiting' && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                              Menunggu
                            </span>
                          )}

                          {item.status === 'downloading' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold animate-pulse">
                              1/3 Mengunduh...
                            </span>
                          )}

                          {item.status === 'generating_narration' && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold animate-pulse">
                              2/3 Narasi AI...
                            </span>
                          )}

                          {item.status === 'rendering' && (
                            <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-bold animate-pulse">
                              3/3 FFmpeg Render...
                            </span>
                          )}

                          {item.status === 'completed' && (
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => onPreviewVideo(item)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs flex items-center space-x-1 font-semibold"
                                title="Buka di Studio"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>

                              <a
                                href={item.outputUrl}
                                download={`autopilot_${item.id}.mp4`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center space-x-1 font-bold shadow"
                                title="Unduh ke Galeri"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh</span>
                              </a>
                            </div>
                          )}

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-slate-600 hover:text-red-400 p-1"
                            title="Hapus dari antrean"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar during processing */}
                      {item.status !== 'waiting' && item.status !== 'completed' && (
                        <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <ListOrdered className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-sm">
                  Antrean masih kosong. Masukkan beberapa URL sosmed di sebelah kiri atau klik{' '}
                  <strong className="text-slate-300 font-semibold">"+ 3 Contoh Viral"</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
