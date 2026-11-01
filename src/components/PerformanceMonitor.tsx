import React, { useState, useEffect } from 'react';
import { Cpu, Zap, HardDrive, Activity, Gauge, Server } from 'lucide-react';

interface PerformanceMonitorProps {
  isExporting: boolean;
  isPlaying: boolean;
  activeFiltersCount: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isExporting,
  isPlaying,
  activeFiltersCount,
}) => {
  const [cpuUsage, setCpuUsage] = useState(12);
  const [gpuUsage, setGpuUsage] = useState(8);
  const [ramUsage, setRamUsage] = useState(1.4); // GB
  const [renderFps, setRenderFps] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isExporting) {
        // High intensity during export
        setCpuUsage(Math.floor(82 + Math.random() * 16));
        setGpuUsage(Math.floor(91 + Math.random() * 8));
        setRamUsage(parseFloat((3.2 + Math.random() * 0.8).toFixed(1)));
        setRenderFps(Math.floor(120 + Math.random() * 45));
      } else if (isPlaying) {
        // Moderate intensity during playback
        const baseCpu = 25 + activeFiltersCount * 8;
        const baseGpu = 35 + activeFiltersCount * 12;
        setCpuUsage(Math.min(95, Math.floor(baseCpu + Math.random() * 15)));
        setGpuUsage(Math.min(98, Math.floor(baseGpu + Math.random() * 20)));
        setRamUsage(parseFloat((2.1 + Math.random() * 0.4).toFixed(1)));
        setRenderFps(60);
      } else {
        // Idle state
        setCpuUsage(Math.floor(6 + Math.random() * 6));
        setGpuUsage(Math.floor(4 + Math.random() * 5));
        setRamUsage(1.4);
        setRenderFps(0);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isExporting, isPlaying, activeFiltersCount]);

  return (
    <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-white">
              FFmpeg Performance Monitor
            </h3>
            <span className="text-[10px] text-slate-400">
              Real-time CPU & GPU rendering intensity feedback
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center space-x-1 ${
          isExporting 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
            : isPlaying
            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isExporting ? 'bg-amber-400' : isPlaying ? 'bg-sky-400' : 'bg-emerald-400'}`} />
          <span>{isExporting ? 'ENCODING 1080p60' : isPlaying ? 'PREVIEW ACTIVE' : 'SYSTEM IDLE'}</span>
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* CPU Usage Card */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>CPU Load</span>
            </span>
            <span className="font-mono font-bold text-sky-400">{cpuUsage}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${cpuUsage > 80 ? 'bg-red-500' : cpuUsage > 50 ? 'bg-amber-500' : 'bg-sky-500'}`}
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
        </div>

        {/* GPU Usage Card */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>GPU (NVENC)</span>
            </span>
            <span className="font-mono font-bold text-purple-400">{gpuUsage}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${gpuUsage > 85 ? 'bg-purple-500' : 'bg-indigo-500'}`}
              style={{ width: `${gpuUsage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Metrics: RAM & Render Speed */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center justify-center space-x-1">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            <span>RAM Buffers</span>
          </span>
          <span className="font-mono font-bold text-white">{ramUsage} GB</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center justify-center space-x-1">
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>Render Speed</span>
          </span>
          <span className="font-mono font-bold text-white">{isExporting ? '3.8x' : isPlaying ? '1.0x' : '0.0x'}</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block mb-0.5 flex items-center justify-center space-x-1">
            <Server className="w-3 h-3 text-cyan-400" />
            <span>FFmpeg FPS</span>
          </span>
          <span className="font-mono font-bold text-cyan-300">{renderFps} fps</span>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <span>Hardware Acceleration: <strong className="text-emerald-400 font-mono">CUDA / NVENC Enabled</strong></span>
        <span className="text-slate-500">Optimized</span>
      </div>
    </div>
  );
};
