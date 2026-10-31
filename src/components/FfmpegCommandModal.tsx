import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Copy, 
  Check, 
  Cpu, 
  Sparkles, 
  Layers, 
  Sliders,
  Crop,
  Move
} from 'lucide-react';
import { StudioSettings, VideoSource, OverlayItem } from '../types';

interface FfmpegCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  activeVideo: VideoSource | null;
  activeOverlay: OverlayItem | null;
}

export const FfmpegCommandModal: React.FC<FfmpegCommandModalProps> = ({
  isOpen,
  onClose,
  settings,
  activeVideo,
  activeOverlay,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inputVid = activeVideo?.url ? 'input_video.mp4' : 'downloaded_video.mp4';
  const inputVoice = 'narration_voiceover.mp3';
  const overlayFile = activeOverlay?.name ? 'overlay_dust.png' : null;
  
  const width = settings.aspectRatio === '9:16' ? 1080 : settings.aspectRatio === '1:1' ? 1080 : 1920;
  const height = settings.aspectRatio === '9:16' ? 1920 : settings.aspectRatio === '1:1' ? 1080 : 1080;

  let hwFlag = '';
  if (settings.hwAccel === 'nvenc') hwFlag = '-c:v h264_nvenc ';
  else if (settings.hwAccel === 'qsv') hwFlag = '-c:v h264_qsv ';
  else if (settings.hwAccel === 'vaapi') hwFlag = '-vaapi_device /dev/dri/renderD128 -vf "format=nv12,hwupload" -c:v h264_vaapi ';
  else hwFlag = '-c:v libx264 ';

  // Filter chain with Smart Crop
  const vFilters: string[] = [];

  if (settings.smartCrop?.enabled) {
    const panRatio = (settings.smartCrop.panXPercent || 50) / 100;
    vFilters.push(`crop=w=ih*9/16:h=ih:x='(iw-ow)*${panRatio}':y=0`);
    vFilters.push(`scale=${width}:${height}`);
  } else {
    vFilters.push(`scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`);
  }

  // Anti-duplication micro-speed
  vFilters.push(`setpts=PTS/${settings.speedFactor}`);

  if (settings.mirrorFlip) {
    vFilters.push('hflip');
  }

  // Pre-set FFmpeg color filters
  if (settings.colorGrading === 'vibrant') {
    vFilters.push('eq=contrast=1.15:brightness=0.02:saturation=1.25');
  } else if (settings.colorGrading === 'cinematic') {
    vFilters.push('eq=contrast=1.2:brightness=-0.02:saturation=0.9');
  } else if (settings.colorGrading === 'sepia') {
    vFilters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
  } else if (settings.colorGrading === 'grayscale') {
    vFilters.push('eq=saturation=0');
  } else if (settings.colorGrading === 'vintage') {
    vFilters.push('eq=contrast=1.15:saturation=0.85,colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
  } else if (settings.colorGrading === 'high_contrast') {
    vFilters.push('eq=contrast=1.5:saturation=1.2:brightness=0.03');
  } else if (settings.colorGrading === 'moody') {
    vFilters.push('eq=contrast=1.3:brightness=0.85,sepia=0.2');
  } else if (settings.colorGrading === 'warm') {
    vFilters.push('eq=saturation=1.2,colorchannelmixer=1:0:0:0:0:0.9:0:0:0:0:0.8:0');
  }

  // Draggable Watermark filter
  if (settings.watermark?.enabled) {
    const posX = `(w-tw)*${settings.watermark.xPercent}/100`;
    const posY = `(h-th)*${settings.watermark.yPercent}/100`;
    if (settings.watermark.type === 'text') {
      vFilters.push(
        `drawtext=text='${settings.watermark.text || '@creator'}':x=${posX}:y=${posY}:fontsize=${settings.watermark.fontSize * 2}:fontcolor=white:box=1:boxcolor=black@${settings.watermark.bgOpacity}:boxborderw=6`
      );
    }
  }

  const baseV = vFilters.join(',');

  let filterComplex = '';
  let mapArgs = '';

  if (overlayFile) {
    filterComplex = `"[0:v]${baseV}[base];[1:v]scale=${width}:${height}[ovr];[base][ovr]overlay=0:0:format=auto[v];[0:a]volume=${settings.videoVolume},atempo=${settings.speedFactor}[a0];[2:a]volume=${settings.narrationVolume}[a1];[a0][a1]amix=inputs=2:duration=first[a]"`;
    mapArgs = '-map "[v]" -map "[a]"';
  } else {
    filterComplex = `"[0:v]${baseV}[v];[0:a]volume=${settings.videoVolume},atempo=${settings.speedFactor}[a0];[1:a]volume=${settings.narrationVolume}[a1];[a0][a1]amix=inputs=2:duration=first[a]"`;
    mapArgs = '-map "[v]" -map "[a]"';
  }

  const fullCommand = `ffmpeg -y \\
  -i ${inputVid} \\
  ${overlayFile ? `-i ${overlayFile} \\\n  ` : ''}-i ${inputVoice} \\
  -filter_complex ${filterComplex} \\
  ${mapArgs} \\
  ${hwFlag}\\
  -preset ${settings.ffmpegPreset} \\
  -tune fastdecode \\
  -crf 22 \\
  -c:a aac -b:a 192k \\
  -shortest output_gallery/final_unique_video.mp4`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-white space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Perintah FFmpeg Siap Eksekusi
              </h3>
              <p className="text-xs text-slate-400">
                Filter Warna: <span className="text-emerald-400 font-bold uppercase">{settings.colorGrading}</span> • Smart Crop • Watermark
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Command Output */}
        <div className="relative">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed select-all">
            <pre>{fullCommand}</pre>
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Perintah'}</span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
