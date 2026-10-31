import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Upload, 
  Eye, 
  Check, 
  Sliders, 
  Image as ImageIcon,
  Flame,
  Zap,
  Film,
  Award,
  Trash2
} from 'lucide-react';
import { OverlayItem, StudioSettings } from '../types';
import { STOCK_OVERLAYS } from '../data/mockAssets';

interface OverlayLibraryProps {
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  activeOverlay: OverlayItem | null;
  onSelectOverlay: (overlay: OverlayItem | null) => void;
}

export const OverlayLibrary: React.FC<OverlayLibraryProps> = ({
  settings,
  onUpdateSettings,
  activeOverlay,
  onSelectOverlay,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customOverlayName, setCustomOverlayName] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Koleksi' },
    { id: 'dust', label: '✨ Golden Dust' },
    { id: 'lightleak', label: '🌈 Light Leaks' },
    { id: 'glitch', label: '⚡ Glitch & VHS' },
    { id: 'badge', label: '🎯 Subscribe CTA' },
    { id: 'frame', label: '🎬 Cinematic Frame' },
    { id: 'fire', label: '🔥 Sparks & Fire' },
  ];

  const filteredOverlays = selectedCategory === 'all'
    ? STOCK_OVERLAYS
    : STOCK_OVERLAYS.filter(item => item.category === selectedCategory);

  // Local Custom Overlay File
  const handleLocalOverlay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const customItem: OverlayItem = {
      id: `custom-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      category: 'custom',
      sourceUrl: url,
      type: 'image',
      previewUrl: url,
      blendMode: 'normal',
      defaultOpacity: 0.9,
      description: 'Overlay kustom dari penyimpanan lokal laptop',
      sourceProvider: 'Local',
    };

    setCustomOverlayName(file.name);
    onSelectOverlay(customItem);
    onUpdateSettings({
      activeOverlayId: customItem.id,
      customOverlayUrl: url,
      overlayOpacity: 0.9,
      overlayBlendMode: 'normal',
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Koleksi Overlay Visual & B-Roll (Pexels / Pixabay)</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Tingkatkan Kualitas Video dengan Overlay Sinematik Unik
          </h2>
          <p className="text-slate-300 text-sm mt-1 leading-relaxed">
            Tambahkan partikel debu sinematik (golden dust), pantulan lensa (light leak), distorsi glitch, hingga bingkai film. Video Anda akan tampil 100% unik dan terhindar dari deteksi repost algoritma.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Overlay Grid */}
        <div className="lg:col-span-8 space-y-4">
          {/* Category Filter Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOverlays.map(item => {
              const isActive = activeOverlay?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isActive) {
                      onSelectOverlay(null);
                      onUpdateSettings({ activeOverlayId: null });
                    } else {
                      onSelectOverlay(item);
                      onUpdateSettings({
                        activeOverlayId: item.id,
                        overlayOpacity: item.defaultOpacity,
                        overlayBlendMode: item.blendMode,
                      });
                    }
                  }}
                  className={`group relative rounded-2xl overflow-hidden border p-3.5 transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30 shadow-lg'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 relative mb-3">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-purple-300 border border-white/10">
                      {item.sourceProvider}
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-[10px] text-slate-400">
                    <span className="font-mono uppercase text-sky-400">
                      Blend: {item.blendMode}
                    </span>
                    <span className="font-medium text-slate-300">
                      {isActive ? 'Aktif' : 'Klik Pasang'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Controls & Custom Upload */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Overlay Adjuster */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Pengaturan Layer Overlay</span>
            </h3>

            {activeOverlay ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[10px] text-purple-400 font-semibold uppercase block">
                      Overlay Terpasang:
                    </span>
                    <p className="font-bold text-white truncate">{activeOverlay.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectOverlay(null);
                      onUpdateSettings({ activeOverlayId: null, customOverlayUrl: null });
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Hapus Overlay"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Opacity slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Opasitas (Transparansi):</span>
                    <span className="font-mono text-purple-400 font-bold">
                      {Math.round(settings.overlayOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.overlayOpacity}
                    onChange={(e) =>
                      onUpdateSettings({ overlayOpacity: parseFloat(e.target.value) })
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Blend mode selector */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 block">Metode Pencampuran (Blend Mode):</label>
                  <select
                    value={settings.overlayBlendMode}
                    onChange={(e) =>
                      onUpdateSettings({
                        overlayBlendMode: e.target.value as any,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="screen">Screen (Cocok untuk debu & light leak latar hitam)</option>
                    <option value="overlay">Overlay (Kontras sinematik tinggi)</option>
                    <option value="lighten">Lighten (Mencerahkan bagian gelap)</option>
                    <option value="color-dodge">Color Dodge (Cahaya bersinar dramatis)</option>
                    <option value="normal">Normal (Solid / Watermark logo PNG)</option>
                    <option value="multiply">Multiply (Efek menggelapkan)</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                Belum ada overlay yang dipilih. Pilih dari galeri di samping atau unggah file PNG logo Anda di bawah.
              </p>
            )}
          </div>

          {/* Upload Custom Local Overlay / Logo */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Unggah Logo / Watermark Lokal</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tambahkan watermark akun, logo channel, sticker transparan (PNG/GIF) dari laptop Anda agar tidak ada yang bisa mencuri video Anda.
            </p>

            <label className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/60 hover:bg-slate-950">
              <ImageIcon className="w-8 h-8 text-slate-500 mb-1.5" />
              <span className="text-xs font-semibold text-white">
                {customOverlayName || 'Pilih Logo/Gambar Transparan (PNG)'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Maksimal resolusi bebas, format PNG direkomendasikan
              </span>
              <input
                type="file"
                accept="image/png,image/gif,image/webp,image/jpeg"
                onChange={handleLocalOverlay}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
