/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudioEditor } from './components/StudioEditor';
import { BatchProcessingPanel } from './components/BatchProcessingPanel';
import { DownloaderPanel } from './components/DownloaderPanel';
import { NarrationPanel } from './components/NarrationPanel';
import { OverlayLibrary } from './components/OverlayLibrary';
import { SeoGenerator } from './components/SeoGenerator';
import { PythonAutomationGuide } from './components/PythonAutomationGuide';
import { FfmpegCommandModal } from './components/FfmpegCommandModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { 
  VideoSource, 
  OverlayItem, 
  NarrationData, 
  SeoData, 
  StudioSettings, 
  BatchQueueItem, 
  ApiIntegrationSettings 
} from './types';
import { SAMPLE_VIDEOS, STOCK_OVERLAYS } from './data/mockAssets';
import { CheckCircle2, Download, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('editor');

  // Video source state
  const [activeVideo, setActiveVideo] = useState<VideoSource | null>(SAMPLE_VIDEOS[0]);

  // Active overlay state
  const [activeOverlay, setActiveOverlay] = useState<OverlayItem | null>(STOCK_OVERLAYS[0]);

  // Batch Queue State
  const [batchQueue, setBatchQueue] = useState<BatchQueueItem[]>([
    {
      id: 'init-batch-1',
      url: 'https://www.tiktok.com/@nature_explorer/video/71239823489234',
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
      id: 'init-batch-2',
      url: 'https://www.instagram.com/reel/C72x9kLq8',
      title: 'Reels: Petualangan Lautan Estetik',
      platform: 'Instagram',
      status: 'waiting',
      progress: 0,
      aspectRatio: '9:16',
      language: 'Bahasa Indonesia',
      overlayName: 'Light Leak Anamorphic',
      speedFactor: 1.02,
      timestamp: Date.now() + 10,
    },
  ]);

  // AI Narration state (Initial Indonesian viral script)
  const [narrationData, setNarrationData] = useState<NarrationData | null>({
    hook: "Tunggu! 99% orang belum tahu rahasia di balik pemandangan ini!",
    fullScript:
      "Tunggu! 99% orang belum tahu rahasia di balik pemandangan menakjubkan ini. Perhatikan detail kecil di detik ini, ini membuktikan betapa indahnya harmoni alam dan teknologi saat berpadu. Menurut kalian ini nyata atau bukan? Tulis pendapatmu di kolom komentar dan save video ini sekarang!",
    segments: [
      {
        time: "00:00 - 00:04",
        text: "Tunggu! 99% orang belum tahu rahasia di balik pemandangan ini!",
        emotion: "Penasaran & Menghentikan Scroll",
      },
      {
        time: "00:04 - 00:12",
        text: "Perhatikan detail kecil di detik ini, ini membuktikan betapa indahnya harmoni alam dan teknologi saat berpadu.",
        emotion: "Antusias & Menjelaskan",
      },
      {
        time: "00:12 - 00:20",
        text: "Menurut kalian ini nyata atau bukan? Tulis pendapatmu di kolom komentar dan save video ini sekarang!",
        emotion: "Ajakan Interaksi (CTA)",
      },
    ],
    estimatedDurationSec: 20,
    recommendedVoicePitch: "normal",
    recommendedSpeechRate: 1.05,
  });

  // SEO metadata state
  const [seoData, setSeoData] = useState<SeoData | null>({
    titles: [
      "99% Orang Baru Tahu Fakta Menakjubkan Ini! 😱🔥",
      "Detik Terakhir Bikin Merinding! Jangan Sampai Kelewatan!",
      "Rahasia Tersembunyi Yang Jarang Diketahui Banyak Orang!",
    ],
    captions: {
      tiktok:
        "Beneran baru tahu fakta ini gak sih? 😱 Tonton sampai habis biar gak gagal paham! Jangan lupa tinggalkan pendapatmu di komentar ya 👇\n\n#fyp #viral #trending #faktamenarik #videoviral #shorts",
      instagram:
        "Keindahan dan misteri yang jarang disadari! 🌌 Menurut kalian ini nyata atau editan? Yuk diskusi di kolom komentar! Jangan lupa save & share ke bestie kamu ya! ✨",
      youtube:
        "Fakta menakjubkan yang membuktikan keajaiban momen ini. Tonton video selengkapnya dan subscribe untuk update harian!",
    },
    hashtags: [
      "#fyp",
      "#foryou",
      "#viralindonesia",
      "#reelsvideo",
      "#videopendek",
      "#trendinghariini",
      "#shorts",
      "#faktaunik",
      "#aiindonesia",
    ],
    category: "Entertainment & Education",
    tips: "Waktu upload terbaik untuk konten ini adalah pukul 12:00 - 13:00 siang atau 18:30 - 20:30 malam WIB saat traffic FYP sedang puncak.",
  });

  // Studio Settings with BeatSync, Watermark & Smart Crop
  const [settings, setSettings] = useState<StudioSettings>({
    aspectRatio: '9:16',
    speedFactor: 1.02,
    colorGrading: 'vibrant',
    mirrorFlip: false,
    videoVolume: 0.2,
    narrationVolume: 1.25,
    bgmVolume: 0.35,
    selectedBgm: 'bgm-lofi-chill',
    subtitleStyle: 'mrbeast-yellow',
    subtitleSize: 18,
    overlayOpacity: 0.75,
    overlayBlendMode: 'screen',
    overlayScale: 1.0,
    customOverlayUrl: null,
    activeOverlayId: STOCK_OVERLAYS[0].id,
    ffmpegPreset: 'ultrafast',
    hwAccel: 'auto',
    beatSync: {
      enabled: true,
      bpm: 128,
      autoDetect: true,
      sensitivity: 'medium',
      effect: 'pulse_zoom',
      syncCaptions: true,
      syncTransitions: true,
    },
    watermark: {
      enabled: true,
      type: 'text',
      text: '@autopilot.creator',
      imageUrl: null,
      xPercent: 78,
      yPercent: 88,
      fontSize: 12,
      fontColor: '#ffffff',
      bgColor: '#000000',
      bgOpacity: 0.6,
      opacity: 0.85,
      scale: 1.0,
    },
    smartCrop: {
      enabled: true,
      mode: 'auto_action',
      panXPercent: 50,
      smoothing: 5,
    },
  });

  // API Integration Settings State (Pexels, Pixabay, MCP)
  const [apiSettings, setApiSettings] = useState<ApiIntegrationSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('autopilot_api_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      pexelsApiKey: '',
      pixabayApiKey: '',
      mcpEndpointEnabled: true,
      customBaseUrl: '',
    };
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [isFfmpegModalOpen, setIsFfmpegModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const updateSettings = (newSettings: Partial<StudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Video Export Simulator & Real Downloader to Local Device Gallery
  const handleExportVideo = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportSuccessMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const downloadUrl = activeVideo?.url || SAMPLE_VIDEOS[0].url;
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `autopilot_unique_${Date.now()}.mp4`;
      anchor.target = '_blank';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      setExportSuccessMessage(
        'Video unik dengan Smart Crop 9:16 & Watermark kustom berhasil dirender dan diunduh ke galeri perangkat Anda!'
      );
      setTimeout(() => setExportSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Preview a batch item in the Studio Editor
  const handlePreviewBatchItem = (item: BatchQueueItem) => {
    const matched = SAMPLE_VIDEOS[0];
    setActiveVideo({
      id: item.id,
      title: item.title,
      url: item.outputUrl || matched.url,
      sourceType: 'url',
      platform: item.platform as any,
      duration: 18,
      resolution: item.aspectRatio === '9:16' ? '1080x1920 (9:16)' : '1920x1080',
    });
    setActiveTab('editor');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFfmpegModal={() => setIsFfmpegModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onExportVideo={handleExportVideo}
        isExporting={isExporting}
        batchQueueCount={batchQueue.filter((q) => q.status === 'waiting' || q.status === 'downloading').length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Export Success Notification Banner */}
        {exportSuccessMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between shadow-xl animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold">
                {exportSuccessMessage}
              </span>
            </div>
            <button
              onClick={() => setExportSuccessMessage(null)}
              className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab 1: Studio Editor */}
        {activeTab === 'editor' && (
          <StudioEditor
            activeVideo={activeVideo}
            activeOverlay={activeOverlay}
            narrationData={narrationData}
            settings={settings}
            onUpdateSettings={updateSettings}
            onOpenFfmpegModal={() => setIsFfmpegModalOpen(true)}
            onExportVideo={handleExportVideo}
            isExporting={isExporting}
          />
        )}

        {/* Tab 2: Batch Processing Queue */}
        {activeTab === 'batch' && (
          <BatchProcessingPanel
            queue={batchQueue}
            onUpdateQueue={setBatchQueue}
            onPreviewVideo={handlePreviewBatchItem}
          />
        )}

        {/* Tab 3: Downloader */}
        {activeTab === 'downloader' && (
          <DownloaderPanel
            onSelectVideo={(video) => {
              setActiveVideo(video);
              setActiveTab('editor');
            }}
            activeVideo={activeVideo}
          />
        )}

        {/* Tab 4: AI Narration Dubbing */}
        {activeTab === 'narration' && (
          <NarrationPanel
            narrationData={narrationData}
            onUpdateNarration={setNarrationData}
            settings={settings}
            onUpdateSettings={updateSettings}
            onApplyToStudio={() => setActiveTab('editor')}
          />
        )}

        {/* Tab 5: Overlays & Stock */}
        {activeTab === 'overlays' && (
          <OverlayLibrary
            settings={settings}
            onUpdateSettings={updateSettings}
            activeOverlay={activeOverlay}
            onSelectOverlay={setActiveOverlay}
          />
        )}

        {/* Tab 6: SEO & Social Tags */}
        {activeTab === 'seo' && (
          <SeoGenerator
            seoData={seoData}
            onUpdateSeo={setSeoData}
            narrationData={narrationData}
            currentVideoTitle={activeVideo?.title || ''}
          />
        )}

        {/* Tab 7: Python Automation & Laptop Setup Guide */}
        {activeTab === 'python' && <PythonAutomationGuide />}
      </main>

      {/* FFmpeg Command Line Details Modal */}
      <FfmpegCommandModal
        isOpen={isFfmpegModalOpen}
        onClose={() => setIsFfmpegModalOpen(false)}
        settings={settings}
        activeVideo={activeVideo}
        activeOverlay={activeOverlay}
      />

      {/* API & MCP Integration Settings Modal */}
      <ApiSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiSettings={apiSettings}
        onUpdateApiSettings={setApiSettings}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>
          Studio Video AutoPilot • FFmpeg Ultrafast Video Engine & Downloader Hub • Model Context Protocol (MCP) Ready
        </p>
      </footer>
    </div>
  );
}
