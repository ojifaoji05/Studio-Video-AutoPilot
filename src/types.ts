export interface VideoSource {
  id: string;
  title: string;
  url: string;
  sourceType: 'url' | 'local' | 'sample';
  platform?: 'TikTok' | 'Instagram' | 'YouTube' | 'Local' | 'Unknown';
  duration: number;
  resolution: string;
  poster?: string;
}

export interface OverlayItem {
  id: string;
  name: string;
  category: 'dust' | 'lightleak' | 'glitch' | 'badge' | 'frame' | 'fire' | 'custom';
  sourceUrl: string;
  type: 'image' | 'video' | 'css-effect';
  previewUrl: string;
  blendMode: 'screen' | 'overlay' | 'lighten' | 'color-dodge' | 'normal' | 'multiply';
  defaultOpacity: number;
  description: string;
  sourceProvider: 'Pexels' | 'Pixabay' | 'Local' | 'Studio Preset';
}

export interface NarrationData {
  hook: string;
  fullScript: string;
  segments: {
    time: string;
    text: string;
    emotion: string;
  }[];
  estimatedDurationSec: number;
  recommendedVoicePitch: string;
  recommendedSpeechRate: number;
}

export interface SeoData {
  titles: string[];
  captions: {
    tiktok: string;
    instagram: string;
    youtube: string;
  };
  hashtags: string[];
  category: string;
  tips: string;
}

export interface BeatSyncSettings {
  enabled: boolean;
  bpm: number;
  autoDetect: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  effect: 'pulse_zoom' | 'flash_glitch' | 'color_burst' | 'bounce';
  syncCaptions: boolean;
  syncTransitions: boolean;
}

export interface BeatAnalysis {
  bpm: number;
  beatTimes: number[];
  currentBeatIndex: number;
  isBeatHit: boolean;
}

export interface CustomWatermarkSettings {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  imageUrl: string | null;
  xPercent: number; // 0% - 100% horizontal frame position
  yPercent: number; // 0% - 100% vertical frame position
  fontSize: number; // in pixels
  fontColor: string; // hex
  bgColor: string; // hex
  bgOpacity: number; // 0 - 1
  opacity: number; // 0 - 1
  scale: number; // 0.5 - 2.0
}

export interface SmartCropSettings {
  enabled: boolean;
  mode: 'auto_action' | 'face_speaker' | 'rule_of_thirds' | 'center' | 'manual';
  panXPercent: number; // 0% (Left) - 50% (Center) - 100% (Right)
  smoothing: number; // 1 - 10
}

export interface ApiIntegrationSettings {
  pexelsApiKey: string;
  pixabayApiKey: string;
  mcpEndpointEnabled: boolean;
  geminiApiKey: string;
  geminiModel: string;
  customBaseUrl: string;
}

export interface BatchQueueItem {
  id: string;
  url: string;
  title: string;
  platform: string;
  status: 'waiting' | 'downloading' | 'generating_narration' | 'rendering' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  narrationTopic?: string;
  language?: string;
  aspectRatio: '9:16' | '16:9' | '1:1';
  overlayName?: string;
  speedFactor?: number;
  errorMessage?: string;
  timestamp: number;
}

export interface StudioSettings {
  aspectRatio: '9:16' | '16:9' | '1:1';
  speedFactor: number; // e.g. 1.02 for anti-duplication
  colorGrading: 'none' | 'vibrant' | 'cinematic' | 'moody' | 'warm' | 'sepia' | 'grayscale' | 'vintage' | 'high_contrast';
  mirrorFlip: boolean;
  videoVolume: number; // 0 to 1
  narrationVolume: number; // 0 to 1.5
  bgmVolume: number; // 0 to 1
  selectedBgm: string;
  subtitleStyle: 'mrbeast-yellow' | 'clean-white' | 'cyberpunk-neon' | 'box-dark' | 'none';
  subtitleSize: number;
  overlayOpacity: number;
  overlayBlendMode: 'screen' | 'overlay' | 'lighten' | 'color-dodge' | 'normal' | 'multiply';
  overlayScale: number;
  customOverlayUrl: string | null;
  activeOverlayId: string | null;
  ffmpegPreset: 'ultrafast' | 'veryfast' | 'faster' | 'fast';
  hwAccel: 'auto' | 'nvenc' | 'qsv' | 'vaapi' | 'cpu';
  beatSync: BeatSyncSettings;
  watermark: CustomWatermarkSettings;
  smartCrop: SmartCropSettings;
}
