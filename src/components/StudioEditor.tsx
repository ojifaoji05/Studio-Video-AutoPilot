import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Maximize2, 
  Zap, 
  Sparkles, 
  Music, 
  Layers, 
  Download, 
  Terminal,
  ShieldCheck,
  Smartphone,
  Tv,
  Square as SquareIcon,
  Activity,
  Flame,
  Radio,
  Crop,
  Move,
  Type,
  Image as ImageIcon,
  Focus,
  Crosshair,
  Camera,
  Upload
} from 'lucide-react';
import { VideoSource, OverlayItem, NarrationData, StudioSettings } from '../types';
import { BACKGROUND_MUSIC_TRACKS } from '../data/mockAssets';
import { generateBeatMap, checkIsBeatHit } from '../utils/audioBeatDetector';

interface StudioEditorProps {
  activeVideo: VideoSource | null;
  onSelectVideo?: (video: VideoSource) => void;
  activeOverlay: OverlayItem | null;
  narrationData: NarrationData | null;
  settings: StudioSettings;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  onOpenFfmpegModal: () => void;
  onExportVideo: () => void;
  isExporting: boolean;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  activeVideo,
  onSelectVideo,
  activeOverlay,
  narrationData,
  settings,
  onUpdateSettings,
  onOpenFfmpegModal,
  onExportVideo,
  isExporting,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [isMuted, setIsMuted] = useState(false);

  // Audio Beat State
  const [isBeatHit, setIsBeatHit] = useState(false);
  const [beatIntensity, setBeatIntensity] = useState(0);
  const [currentBeatNumber, setCurrentBeatNumber] = useState(1);

  // Thumbnail Extractor State
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isExtractingThumbs, setIsExtractingThumbs] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);

  const extractThumbnails = () => {
    if (!videoRef.current) return;
    setIsExtractingThumbs(true);
    const vid = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExtractingThumbs(false);
      return;
    }

    const dur = vid.duration || 15;
    const times = [dur * 0.15, dur * 0.38, dur * 0.62, dur * 0.85];
    const captured: string[] = [];
    let idx = 0;

    const captureNext = () => {
      if (idx >= times.length) {
        setThumbnails(captured);
        setIsExtractingThumbs(false);
        return;
      }
      vid.currentTime = times[idx];
      setTimeout(() => {
        try {
          ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
          captured.push(canvas.toDataURL('image/jpeg', 0.95));
        } catch {
          captured.push('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80');
        }
        idx++;
        captureNext();
      }, 350);
    };

    captureNext();
  };

  // Drag and Drop Watermark State
  const [isDraggingWatermark, setIsDraggingWatermark] = useState(false);

  // Beat Map generated from current BPM
  const currentBpm = settings.beatSync?.bpm || 124;
  const beatMap = React.useMemo(() => {
    return generateBeatMap(currentBpm, duration || 60);
  }, [currentBpm, duration]);

  // Sync playback rate with settings
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = settings.speedFactor;
    }
  }, [settings.speedFactor]);

  // Sync video volume with settings
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = settings.videoVolume;
    }
  }, [settings.videoVolume]);

  // Sync BGM
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = settings.bgmVolume;
      const currentTrack = BACKGROUND_MUSIC_TRACKS.find(t => t.id === settings.selectedBgm);
      if (currentTrack && currentTrack.url) {
        bgmRef.current.src = currentTrack.url;
        if (isPlaying) {
          bgmRef.current.play().catch(() => {});
        }
      } else {
        bgmRef.current.pause();
      }
    }
  }, [settings.selectedBgm, settings.bgmVolume]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (bgmRef.current) bgmRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      if (bgmRef.current && settings.selectedBgm !== 'none') {
        bgmRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }

      // Check Beat Hit if BeatSync is enabled
      if (settings.beatSync?.enabled) {
        const tolerance = settings.beatSync.sensitivity === 'high' ? 0.11 : settings.beatSync.sensitivity === 'low' ? 0.06 : 0.085;
        const hitResult = checkIsBeatHit(time, beatMap, tolerance);
        setIsBeatHit(hitResult.isHit);
        setBeatIntensity(hitResult.intensity);
        if (hitResult.isHit) {
          setCurrentBeatNumber((hitResult.beatNumber % 4) + 1);
        }
      } else {
        setIsBeatHit(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Watermark Drag Handlers
  const handleWatermarkMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingWatermark(true);
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingWatermark || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    onUpdateSettings({
      watermark: {
        ...settings.watermark,
        xPercent: Math.round(x),
        yPercent: Math.round(y),
      },
    });
  };

  const handleContainerMouseUp = () => {
    if (isDraggingWatermark) {
      setIsDraggingWatermark(false);
    }
  };

  // Touch handlers for mobile / tablet drag
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingWatermark || !containerRef.current) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));

    onUpdateSettings({
      watermark: {
        ...settings.watermark,
        xPercent: Math.round(x),
        yPercent: Math.round(y),
      },
    });
  };

  // Watermark Preset Positions
  const snapWatermark = (pos: 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right') => {
    let x = 10;
    let y = 10;
    if (pos === 'top-left') { x = 6; y = 6; }
    else if (pos === 'top-right') { x = 75; y = 6; }
    else if (pos === 'center') { x = 38; y = 46; }
    else if (pos === 'bottom-left') { x = 6; y = 88; }
    else if (pos === 'bottom-right') { x = 75; y = 88; }

    onUpdateSettings({
      watermark: {
        ...settings.watermark,
        xPercent: x,
        yPercent: y,
      },
    });
  };

  // Subtitle line
  const getActiveSubtitleLine = () => {
    if (!narrationData?.fullScript) return null;
    const script = narrationData.fullScript;
    const sentences = script.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    if (sentences.length === 0) return narrationData.hook || script;

    const progressRatio = duration > 0 ? currentTime / duration : 0;
    const index = Math.min(
      Math.floor(progressRatio * sentences.length),
      sentences.length - 1
    );
    return sentences[index] || narrationData.hook;
  };

  const currentSubtitle = getActiveSubtitleLine();

  // Color grading filter style with dynamic beat boost
  const getColorGradeFilter = () => {
    const isBeatActive = settings.beatSync?.enabled && isBeatHit;
    const beatBonusContrast = isBeatActive && settings.beatSync.effect === 'color_burst' ? 0.15 : 0;
    const beatBonusSat = isBeatActive && settings.beatSync.effect === 'color_burst' ? 0.2 : 0;

    switch (settings.colorGrading) {
      case 'vibrant':
        return `contrast(${1.15 + beatBonusContrast}) saturate(${1.25 + beatBonusSat}) brightness(1.03)`;
      case 'cinematic':
        return `contrast(${1.2 + beatBonusContrast}) brightness(0.95) saturate(0.9)`;
      case 'sepia':
        return `sepia(0.85) contrast(1.1) brightness(1.02)`;
      case 'grayscale':
        return `grayscale(1.0) contrast(1.15)`;
      case 'vintage':
        return `sepia(0.4) contrast(1.15) brightness(0.95) hue-rotate(-15deg)`;
      case 'high_contrast':
        return `contrast(1.5) saturate(1.2)`;
      case 'moody':
        return `contrast(${1.3 + beatBonusContrast}) brightness(0.85) sepia(0.2)`;
      case 'warm':
        return `sepia(0.25) saturate(${1.2 + beatBonusSat}) contrast(1.05)`;
      default:
        return isBeatActive && settings.beatSync.effect === 'color_burst'
          ? 'contrast(1.15) saturate(1.2)'
          : 'none';
    }
  };

  // Aspect ratio classes
  const getAspectRatioClasses = () => {
    switch (settings.aspectRatio) {
      case '9:16':
        return 'w-[290px] sm:w-[320px] aspect-[9/16]';
      case '1:1':
        return 'w-[360px] sm:w-[420px] aspect-square';
      case '16:9':
        return 'w-full max-w-[580px] aspect-video';
      default:
        return 'w-[320px] aspect-[9/16]';
    }
  };

  // Subtitle styling classes
  const getSubtitleClasses = () => {
    switch (settings.subtitleStyle) {
      case 'mrbeast-yellow':
        return 'text-amber-300 font-black uppercase tracking-wider text-shadow-heavy drop-shadow-[0_4px_8px_rgba(0,0,0,0.95)]';
      case 'cyberpunk-neon':
        return 'text-cyan-300 font-extrabold tracking-wide drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]';
      case 'clean-white':
        return 'text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
      case 'box-dark':
        return 'bg-black/80 px-3 py-1.5 rounded-lg text-white font-semibold backdrop-blur-sm border border-white/20';
      default:
        return 'hidden';
    }
  };

  // Smart Cropping: compute object-position based on panXPercent
  const getVideoObjectPosition = () => {
    if (settings.smartCrop?.enabled) {
      return `${settings.smartCrop.panXPercent}% center`;
    }
    return 'center center';
  };

  // Dynamic Beat Scale Calculation
  const isPulseActive = settings.beatSync?.enabled && isBeatHit && (settings.beatSync.effect === 'pulse_zoom' || settings.beatSync.effect === 'bounce');
  const videoTransformScale = isPulseActive ? 1.035 : 1.0;
  const overlayOpacityBoost = settings.beatSync?.enabled && isBeatHit && settings.beatSync.effect === 'flash_glitch' ? 0.3 : 0;
  const subtitleBounceScale = isPulseActive ? 'scale(1.08) translateY(-4px)' : 'scale(1.0) translateY(0px)';

  return (
    <div className="space-y-6">
      {/* Hidden audio element for background music */}
      <audio ref={bgmRef} loop />

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Preview Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            {/* Top Canvas Bar */}
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-white truncate max-w-[180px] sm:max-w-[240px]">
                  {activeVideo?.title || 'Video Belum Dipilih'}
                </span>
                <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 text-[11px] font-semibold flex items-center space-x-1 transition-all">
                  <span>📂 Insert Video Lokal</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onSelectVideo) {
                        const blobUrl = URL.createObjectURL(file);
                        onSelectVideo({
                          id: `local-studio-${Date.now()}`,
                          title: file.name,
                          url: blobUrl,
                          sourceType: 'local',
                          platform: 'Local',
                          duration: 30,
                          resolution: '1080x1920 (Local)',
                        });
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Aspect Ratio Switcher */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ aspectRatio: '9:16' })}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                    settings.aspectRatio === '9:16'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="9:16 TikTok, Shorts, Reels"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>9:16</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ aspectRatio: '16:9' })}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                    settings.aspectRatio === '16:9'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="16:9 YouTube Landscape"
                >
                  <Tv className="w-3 h-3" />
                  <span>16:9</span>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings({ aspectRatio: '1:1' })}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                    settings.aspectRatio === '1:1'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="1:1 Instagram Feed"
                >
                  <SquareIcon className="w-3 h-3" />
                  <span>1:1</span>
                </button>
              </div>
            </div>

            {/* Viewport Frame Container (Supports Drag & Drop) */}
            <div 
              className="relative flex items-center justify-center p-2 bg-slate-950/80 rounded-2xl border border-slate-800/80 w-full overflow-hidden select-none"
              onMouseMove={handleContainerMouseMove}
              onMouseUp={handleContainerMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleContainerMouseUp}
            >
              <div
                ref={containerRef}
                className={`relative rounded-xl overflow-hidden bg-black shadow-2xl transition-transform duration-150 ${getAspectRatioClasses()}`}
                style={{
                  transform: `${settings.mirrorFlip ? 'scaleX(-1) ' : ''}scale(${videoTransformScale})`,
                }}
              >
                {/* 1. Underlying Video Element with Smart Cropping objectPosition */}
                <video
                  ref={videoRef}
                  src={activeVideo?.url}
                  className="w-full h-full object-cover transition-all duration-150"
                  style={{ 
                    filter: getColorGradeFilter(),
                    objectPosition: getVideoObjectPosition(),
                  }}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                  loop
                />

                {/* 2. Visual Overlay Layer with Beat Flash */}
                {(activeOverlay || settings.customOverlayUrl) && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-150"
                    style={{
                      opacity: Math.min(1.0, settings.overlayOpacity + overlayOpacityBoost),
                      mixBlendMode: settings.overlayBlendMode as any,
                    }}
                  >
                    <img
                      src={settings.customOverlayUrl || activeOverlay?.sourceUrl}
                      alt="Overlay"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 3. Subtitle / Caption Layer with Beat Bounce */}
                {settings.subtitleStyle !== 'none' && currentSubtitle && (
                  <div
                    className="absolute inset-x-4 bottom-14 pointer-events-none text-center flex flex-col items-center justify-center z-20 transition-transform duration-100"
                    style={{
                      transform: `${settings.mirrorFlip ? 'scaleX(-1) ' : ''}${subtitleBounceScale}`,
                    }}
                  >
                    <span
                      className={`text-base sm:text-lg leading-snug px-3 py-1 inline-block max-w-[90%] transition-all ${getSubtitleClasses()}`}
                      style={{
                        textShadow:
                          settings.subtitleStyle === 'mrbeast-yellow'
                            ? '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 4px 6px rgba(0,0,0,0.8)'
                            : undefined,
                      }}
                    >
                      {currentSubtitle}
                    </span>
                  </div>
                )}

                {/* 4. DRAGGABLE CUSTOM WATERMARK / LOGO */}
                {settings.watermark?.enabled && (
                  <div
                    onMouseDown={handleWatermarkMouseDown}
                    onTouchStart={handleWatermarkMouseDown}
                    className={`absolute z-30 cursor-grab active:cursor-grabbing transition-transform select-none ${
                      isDraggingWatermark ? 'ring-2 ring-sky-400 scale-105' : ''
                    }`}
                    style={{
                      left: `${settings.watermark.xPercent}%`,
                      top: `${settings.watermark.yPercent}%`,
                      opacity: settings.watermark.opacity,
                      transform: `translate(-50%, -50%) scale(${settings.watermark.scale})`,
                    }}
                    title="Klik dan geser (drag & drop) untuk memindahkan watermark"
                  >
                    {settings.watermark.type === 'image' && settings.watermark.imageUrl ? (
                      <img
                        src={settings.watermark.imageUrl}
                        alt="Watermark Logo"
                        className="max-w-[90px] h-auto object-contain pointer-events-none drop-shadow-lg"
                      />
                    ) : (
                      <div
                        className="px-2.5 py-1 rounded-full font-bold shadow-lg flex items-center space-x-1.5 border border-white/20 whitespace-nowrap"
                        style={{
                          backgroundColor: `${settings.watermark.bgColor}${Math.round(settings.watermark.bgOpacity * 255).toString(16).padStart(2, '0')}`,
                          color: settings.watermark.fontColor,
                          fontSize: `${settings.watermark.fontSize}px`,
                        }}
                      >
                        <Move className="w-3 h-3 opacity-60 shrink-0" />
                        <span>{settings.watermark.text || '@mybrand.official'}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Smart Crop Subject Guide Reticle (Active when smart crop enabled) */}
                {settings.smartCrop?.enabled && (
                  <div
                    className="absolute top-2 bottom-2 w-1.5 bg-sky-400/50 rounded-full pointer-events-none transition-all duration-300"
                    style={{ left: `${settings.smartCrop.panXPercent}%` }}
                    title="Pusat Fokus Subjek (Smart Crop Tracking)"
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-6 h-6 rounded-full border border-sky-400 bg-sky-500/20 flex items-center justify-center">
                      <Crosshair className="w-3.5 h-3.5 text-sky-300 animate-spin-slow" />
                    </div>
                  </div>
                )}

                {/* 6. Anti-Duplication Badge */}
                <div
                  className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-mono text-emerald-400 font-semibold z-20 pointer-events-none"
                  style={{
                    transform: settings.mirrorFlip ? 'scaleX(-1)' : 'none',
                  }}
                >
                  ⚡ AutoPilot Unique ({settings.speedFactor}x)
                </div>

                {/* 7. Beat-Sync Rhythm Indicator */}
                {settings.beatSync?.enabled && (
                  <div className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 text-[10px] font-mono z-20 pointer-events-none">
                    <span
                      className={`w-2 h-2 rounded-full transition-all duration-75 ${
                        isBeatHit
                          ? 'bg-amber-400 scale-150 shadow-[0_0_8px_#f59e0b]'
                          : 'bg-slate-600 scale-100'
                      }`}
                    />
                    <span className="text-amber-300 font-bold">
                      {currentBpm} BPM
                    </span>
                  </div>
                )}

                {/* Play / Pause overlay */}
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 cursor-pointer flex items-center justify-center bg-transparent group"
                >
                  {!isPlaying && (
                    <div className="w-14 h-14 rounded-full bg-sky-500/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 ml-1" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Controls & Timeline Scrub */}
            <div className="w-full mt-4 space-y-2">
              <div className="flex items-center space-x-3 text-xs">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Ulang dari awal"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Timeline bar with beat markers */}
                <div className="flex-1 relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={duration || 15}
                    step="0.05"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg relative z-10"
                  />
                  {settings.beatSync?.enabled && (
                    <div className="absolute inset-x-0 h-1 top-0 pointer-events-none flex justify-between px-1 opacity-40">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-amber-400" />
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onOpenFfmpegModal}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center space-x-2 border border-slate-700 transition-all shadow"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Lihat Script FFmpeg</span>
              </button>

              <button
                type="button"
                onClick={onExportVideo}
                disabled={isExporting}
                className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 text-white shadow-lg transition-all ${
                  isExporting
                    ? 'bg-amber-600 animate-pulse cursor-wait'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-sky-500/25 active:scale-95'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Merender & Menyimpan...' : 'Simpan ke Galeri Laptop'}</span>
              </button>

              <button
                type="button"
                onClick={extractThumbnails}
                disabled={isExtractingThumbs}
                className="col-span-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>{isExtractingThumbs ? 'Mengekstrak Thumbnail Sosmed...' : '📸 Ekstrak Thumbnail Sosial Media (AI High-Impact)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Custom Watermark, Smart Crop, Beat Sync, Anti-Duplication */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. FITUR WATERMARK DRAG-AND-DROP BEBAS */}
          <div className="bg-slate-900 border border-sky-500/40 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Move className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Watermark Drag & Drop Bebas
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Geser teks / logo ke posisi mana pun di frame
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    watermark: {
                      ...settings.watermark,
                      enabled: !settings.watermark?.enabled,
                    },
                  })
                }
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.watermark?.enabled
                    ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.watermark?.enabled ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {settings.watermark?.enabled && (
              <div className="space-y-3.5 pt-1 text-xs border-t border-slate-800/80 animate-in fade-in duration-200">
                {/* Tipe Watermark: Teks vs Logo Gambar */}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        watermark: { ...settings.watermark, type: 'text' },
                      })
                    }
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      settings.watermark.type === 'text'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Teks Transparan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        watermark: { ...settings.watermark, type: 'image' },
                      })
                    }
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      settings.watermark.type === 'image'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Logo PNG Transparan</span>
                  </button>
                </div>

                {settings.watermark.type === 'text' ? (
                  <div className="space-y-2">
                    <label className="text-slate-300 block">Teks Watermark:</label>
                    <input
                      type="text"
                      value={settings.watermark.text}
                      onChange={(e) =>
                        onUpdateSettings({
                          watermark: { ...settings.watermark, text: e.target.value },
                        })
                      }
                      placeholder="@creator.official"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono text-xs focus:border-sky-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-slate-300 block">Upload File Logo PNG:</label>
                    <input
                      type="file"
                      accept="image/png,image/webp,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          onUpdateSettings({
                            watermark: { ...settings.watermark, imageUrl: url },
                          });
                        }
                      }}
                      className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-sky-300 hover:file:bg-slate-700 cursor-pointer"
                    />
                  </div>
                )}

                {/* Preset Snap Positions */}
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">
                    Posisi Cepat (Preset Snap):
                  </label>
                  <div className="grid grid-cols-5 gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => snapWatermark('top-left')}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300"
                    >
                      ↖ Kiri Atas
                    </button>
                    <button
                      type="button"
                      onClick={() => snapWatermark('top-right')}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300"
                    >
                      ↗ Kanan Atas
                    </button>
                    <button
                      type="button"
                      onClick={() => snapWatermark('center')}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sky-400"
                    >
                      🎯 Tengah
                    </button>
                    <button
                      type="button"
                      onClick={() => snapWatermark('bottom-left')}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300"
                    >
                      ↙ Kiri Bawah
                    </button>
                    <button
                      type="button"
                      onClick={() => snapWatermark('bottom-right')}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300"
                    >
                      ↘ Kanan Bawah
                    </button>
                  </div>
                </div>

                {/* Sliders: Opacity & Scale */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                      <span>Transparansi:</span>
                      <span className="font-mono text-sky-400 font-bold">{Math.round(settings.watermark.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={settings.watermark.opacity}
                      onChange={(e) =>
                        onUpdateSettings({
                          watermark: { ...settings.watermark, opacity: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                      <span>Ukuran / Scale:</span>
                      <span className="font-mono text-sky-400 font-bold">{settings.watermark.scale}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.8"
                      step="0.1"
                      value={settings.watermark.scale}
                      onChange={(e) =>
                        onUpdateSettings({
                          watermark: { ...settings.watermark, scale: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Posisi Saat Ini: X={settings.watermark.xPercent}% Y={settings.watermark.yPercent}%</span>
                  <span className="text-emerald-400 font-bold">FFmpeg Ready</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. FITUR INTELLIGENT 9:16 CROP & SUBJECT TRACKING */}
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crop className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Intelligent 9:16 Subject Crop
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Deteksi fokus subjek otomatis ke format vertikal
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    smartCrop: {
                      ...settings.smartCrop,
                      enabled: !settings.smartCrop?.enabled,
                    },
                  })
                }
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.smartCrop?.enabled
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.smartCrop?.enabled ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {settings.smartCrop?.enabled && (
              <div className="space-y-3 pt-1 text-xs border-t border-slate-800/80 animate-in fade-in duration-200">
                {/* Crop Mode Selection */}
                <div>
                  <label className="text-slate-300 block mb-1">Metode Pelacakan Subjek:</label>
                  <select
                    value={settings.smartCrop.mode}
                    onChange={(e) => {
                      const mode = e.target.value as any;
                      let pan = settings.smartCrop.panXPercent;
                      if (mode === 'center') pan = 50;
                      else if (mode === 'face_speaker') pan = 48;
                      else if (mode === 'auto_action') pan = 52;
                      onUpdateSettings({
                        smartCrop: { ...settings.smartCrop, mode, panXPercent: pan },
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="auto_action">🎯 AI Auto-Track Fokus Aksi (Otomatis)</option>
                    <option value="face_speaker">👤 Follow Wajah / Pembicara Utama</option>
                    <option value="rule_of_thirds">📐 Rule of Thirds (Komposisi Sinema)</option>
                    <option value="center">⚖️ Center Crop (Tengah Seimbang)</option>
                    <option value="manual">🎛️ Manual Pan & Scan Slider</option>
                  </select>
                </div>

                {/* Horizontal Pan Focal Point Slider */}
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Titik Fokus Horisontal (Pan & Scan):</span>
                    <span className="font-mono text-purple-400 font-bold">{settings.smartCrop.panXPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.smartCrop.panXPercent}
                    onChange={(e) =>
                      onUpdateSettings({
                        smartCrop: { ...settings.smartCrop, panXPercent: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>0% (Sisi Kiri)</span>
                    <span className="text-purple-400 font-bold">50% (Tengah)</span>
                    <span>100% (Sisi Kanan)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  💡 Video lanskap 16:9 akan dipotong sempurna menjadi vertikal 9:16 tanpa batas hitam (*black bars*), memastikan objek aksi selalu berada di tengah layar penonton.
                </p>
              </div>
            )}
          </div>

          {/* 3. Audio Beat-Sync Rhythmic Engine */}
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Sinkronisasi Detak Audio (Beat-Sync)
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Transisi visual & teks memantul pas di hentakan musik
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    beatSync: {
                      ...settings.beatSync,
                      enabled: !settings.beatSync?.enabled,
                    },
                  })
                }
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  settings.beatSync?.enabled
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.beatSync?.enabled ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {settings.beatSync?.enabled && (
              <div className="space-y-3.5 pt-1 text-xs border-t border-slate-800/80 animate-in fade-in duration-200">
                <div>
                  <div className="flex items-center justify-between text-slate-300 mb-1">
                    <span>Tempo Musik (BPM):</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {currentBpm} BPM
                    </span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="160"
                    step="1"
                    value={currentBpm}
                    onChange={(e) =>
                      onUpdateSettings({
                        beatSync: {
                          ...settings.beatSync,
                          bpm: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({ beatSync: { ...settings.beatSync, bpm: 95 } })
                      }
                      className="hover:text-amber-400"
                    >
                      Lo-Fi (95)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({ beatSync: { ...settings.beatSync, bpm: 120 } })
                      }
                      className="hover:text-amber-400"
                    >
                      Pop (120)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({ beatSync: { ...settings.beatSync, bpm: 128 } })
                      }
                      className="hover:text-amber-400 font-bold text-amber-400"
                    >
                      TikTok FYP (128)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings({ beatSync: { ...settings.beatSync, bpm: 140 } })
                      }
                      className="hover:text-amber-400"
                    >
                      Trap (140)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">
                    Efek Transisi saat Hentakan Beat:
                  </label>
                  <select
                    value={settings.beatSync.effect}
                    onChange={(e) =>
                      onUpdateSettings({
                        beatSync: {
                          ...settings.beatSync,
                          effect: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="pulse_zoom">💥 Pulse Zoom (Video Membal Mengikuti Kick)</option>
                    <option value="flash_glitch">⚡ Light & Glitch Flash (Kilatan Overlay)</option>
                    <option value="color_burst">🎨 Color Burst (Peningkatan Kontras & Saturasi)</option>
                    <option value="bounce">🔤 Bouncy Caption & Video Bounce</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 4. Anti-Duplikasi & Kecepatan FFmpeg */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mesin Anti-Duplikasi Algoritma</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                100% Unik
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span>Kecepatan Video (Micro Speed):</span>
                  <span className="font-mono text-sky-400 font-bold">
                    {settings.speedFactor}x {settings.speedFactor === 1.02 && '(Rekomendasi FYP)'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1.0, 1.02, 1.05, 1.1].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onUpdateSettings({ speedFactor: s })}
                      className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        settings.speedFactor === s
                          ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* VIDEO FILTERS SECTION (Sepia, Black & White, Vintage, High Contrast, etc.) */}
              <div className="space-y-2">
                <label className="text-slate-300 block font-bold text-xs flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Video Filters (Preset FFmpeg)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'none', label: 'Asli (Normal)', desc: 'Tanpa filter' },
                    { id: 'sepia', label: 'Sepia', desc: 'Klasik hangat' },
                    { id: 'grayscale', label: 'Black & White', desc: 'Monokrom' },
                    { id: 'vintage', label: 'Vintage', desc: 'Retro 90-an' },
                    { id: 'high_contrast', label: 'High Contrast', desc: 'Tajam menonjol' },
                    { id: 'vibrant', label: 'Vibrant', desc: 'TikTok pop' },
                    { id: 'cinematic', label: 'Cinematic', desc: 'Film layar lebar' },
                    { id: 'moody', label: 'Moody', desc: 'Gelap sinematis' },
                    { id: 'warm', label: 'Warm', desc: 'Cahaya keemasan' },
                  ].map((f) => {
                    const isSelected = settings.colorGrading === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => onUpdateSettings({ colorGrading: f.id as any })}
                        className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-500 text-white font-bold ring-1 ring-sky-500/40'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <span className="font-bold text-[11px] truncate">{f.label}</span>
                        <span className="text-[9px] text-slate-500 truncate mt-0.5">{f.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Mirror Flip Horizontal</span>
                  <span className="text-[10px] text-slate-500">
                    Membalik posisi video kiri-kanan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ mirrorFlip: !settings.mirrorFlip })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    settings.mirrorFlip
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings.mirrorFlip ? 'Aktif' : 'Mati'}
                </button>
              </div>
            </div>
          </div>

          {/* 5. Audio Track Mixer (Multi-Channel) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <span>Audio Mixer 3-Channel</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>1. Volume Audio Asli:</span>
                  <span className="font-mono text-purple-400 font-bold">
                    {Math.round(settings.videoVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={settings.videoVolume}
                  onChange={(e) =>
                    onUpdateSettings({ videoVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>2. Volume Narasi Voiceover:</span>
                  <span className="font-mono text-purple-400 font-bold">
                    {Math.round(settings.narrationVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={settings.narrationVolume}
                  onChange={(e) =>
                    onUpdateSettings({ narrationVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center space-x-1">
                    <Music className="w-3.5 h-3.5 text-sky-400" />
                    <span>3. Musik Latar (BGM):</span>
                  </span>
                  <span className="font-mono text-sky-400 font-bold">
                    {Math.round(settings.bgmVolume * 100)}%
                  </span>
                </div>

                <select
                  value={settings.selectedBgm}
                  onChange={(e) => onUpdateSettings({ selectedBgm: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  {BACKGROUND_MUSIC_TRACKS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.genre})
                    </option>
                  ))}
                </select>

                <label className="border border-dashed border-slate-700 hover:border-sky-500 rounded-xl py-2 px-3 flex items-center justify-center space-x-2 text-center cursor-pointer transition-colors bg-slate-950 text-slate-300">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[11px] font-semibold">📁 Load Musik dari Lokal (.mp3/.wav/.ogg)</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const blobUrl = URL.createObjectURL(file);
                        const customTrackId = `custom-bgm-${Date.now()}`;
                        BACKGROUND_MUSIC_TRACKS.unshift({
                          id: customTrackId,
                          name: file.name,
                          genre: 'Local Audio',
                          url: blobUrl,
                        });
                        onUpdateSettings({ selectedBgm: customTrackId });
                      }
                    }}
                    className="hidden"
                  />
                </label>

                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.05"
                  value={settings.bgmVolume}
                  onChange={(e) =>
                    onUpdateSettings({ bgmVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Extractor Modal */}
      {thumbnails.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-white relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Pilih Thumbnail High-Impact untuk Sosmed
                  </h3>
                  <p className="text-xs text-slate-400">
                    AI mengekstrak momen paling dramatis dari video Anda untuk CTR maksimal di TikTok/Reels/Shorts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setThumbnails([])}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {thumbnails.map((thumb, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedThumbnail(thumb)}
                  className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer group aspect-[9/16] ${
                    selectedThumbnail === thumb ? 'border-sky-400 ring-2 ring-sky-400/40' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 text-center">
                    <span className="text-[10px] font-bold text-white">Opsi #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                {selectedThumbnail ? 'Thumbnail terpilih siap diunduh.' : 'Klik salah satu thumbnail di atas untuk memilih.'}
              </span>

              <div className="flex space-x-2">
                <button
                  onClick={() => setThumbnails([])}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Tutup
                </button>
                {selectedThumbnail && (
                  <a
                    href={selectedThumbnail}
                    download={`social_thumbnail_${Date.now()}.jpg`}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Thumbnail Pilihan</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
