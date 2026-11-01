import React from 'react';
import { 
  Film, 
  Download, 
  Mic, 
  Layers, 
  Hash, 
  Terminal, 
  Laptop, 
  Sparkles, 
  Zap,
  ListOrdered,
  Settings,
  RefreshCw
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenFfmpegModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenUpdateModal: () => void;
  onExportVideo: () => void;
  isExporting: boolean;
  batchQueueCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenFfmpegModal,
  onOpenSettingsModal,
  onOpenUpdateModal,
  onExportVideo,
  isExporting,
  batchQueueCount = 0,
}) => {
  const tabs = [
    { id: 'editor', label: 'Studio Editor', icon: Film, badge: 'Canvas' },
    { id: 'batch', label: 'Antrean Batch', icon: ListOrdered, badge: batchQueueCount > 0 ? `${batchQueueCount}` : 'Baru' },
    { id: 'downloader', label: 'Unduh Sosmed', icon: Download, badge: 'All-in-1' },
    { id: 'narration', label: 'Narasi AI Dubbing', icon: Mic, badge: 'Gemini' },
    { id: 'overlays', label: 'Overlay & B-Roll', icon: Layers, badge: 'Pexels' },
    { id: 'seo', label: 'Deskripsi & Tag FYP', icon: Hash, badge: 'SEO' },
    { id: 'python', label: 'Otomasi Python & Leptop', icon: Laptop, badge: 'Guide' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('editor')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  AutoPilot Studio
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">
                  FFmpeg Fast v2.7
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Smart Crop 9:16 • Drag Watermark • Beat-Sync • Git Auto-Update
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenUpdateModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition-all shadow-sm"
              title="Periksa dan perbarui aplikasi dari Git repository"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span className="hidden md:inline">Pembaruan Git</span>
            </button>

            <button
              onClick={onOpenSettingsModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all shadow-sm"
              title="Pengaturan API Pexels, Pixabay, MCP ChatGPT & Gemini"
            >
              <Settings className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">API & MCP</span>
            </button>

            <button
              onClick={onOpenFfmpegModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all shadow-sm"
              title="Lihat Perintah FFmpeg Otomatis"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Perintah FFmpeg</span>
            </button>

            <button
              onClick={onExportVideo}
              disabled={isExporting}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-lg ${
                isExporting
                  ? 'bg-amber-600 text-white animate-pulse cursor-wait'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/25 active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isExporting ? 'Merender Video...' : 'Simpan ke Galeri'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isActive
                        ? 'bg-sky-500 text-slate-950'
                        : tab.id === 'batch' && batchQueueCount > 0
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
