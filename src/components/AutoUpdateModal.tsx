import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle, GitPullRequest, ArrowUpCircle, ShieldCheck, Terminal, Sparkles } from 'lucide-react';

interface AutoUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoUpdateModal: React.FC<AutoUpdateModalProps> = ({ isOpen, onClose }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    currentVersion: string;
    currentCommit: string;
    commitMessage: string;
    hasUpdate: boolean;
    remoteRepo: string;
    notes: string;
  } | null>(null);
  const [updateResult, setUpdateResult] = useState<{ success: boolean; message: string; output?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckUpdate = async () => {
    setIsChecking(true);
    setError(null);
    setUpdateResult(null);

    try {
      const res = await fetch('/api/check-update');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal memeriksa pembaruan');
      }
      setUpdateInfo(json);
    } catch (err: any) {
      setError(err.message || 'Tidak dapat terhubung ke server Git repository.');
    } finally {
      setIsChecking(false);
    }
  };

  const handlePullUpdate = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch('/api/pull-update', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal menarik pembaruan');
      }
      setUpdateResult({
        success: true,
        message: json.message,
        output: json.output,
      });
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan git pull.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <RefreshCw className={`w-5 h-5 ${isChecking || isUpdating ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pembaruan Otomatis (Git Sync)
              </h3>
              <p className="text-xs text-slate-400">
                Periksa versi terbaru dan tarik update langsung dari GitHub
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

        {/* Content Body */}
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Versi Saat Ini:</span>
              <span className="font-mono font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                v2.7.0 (Stable)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Repository Sumber:</span>
              <span className="font-mono text-slate-300 text-[11px] truncate max-w-[240px]">
                github.com/autopilot-studio/ffmpeg-video-autopilot
              </span>
            </div>
          </div>

          {updateInfo ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <ArrowUpCircle className="w-4 h-4" />
                <span>Pembaruan Git Tersedia!</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <p className="text-[11px] font-mono text-indigo-300">
                  Commit Terakhir: {updateInfo.commitMessage} ({updateInfo.currentCommit})
                </p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {updateInfo.notes}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={isChecking}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center space-x-2 mx-auto border border-slate-700 transition-all shadow"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Memeriksa ke GitHub...' : 'Periksa Pembaruan Sekarang'}</span>
              </button>
            </div>
          )}

          {updateResult && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 space-y-2">
              <div className="flex items-center space-x-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{updateResult.message}</span>
              </div>
              {updateResult.output && (
                <pre className="p-2.5 bg-slate-950 rounded-lg font-mono text-[10px] text-emerald-300 overflow-x-auto border border-emerald-500/20">
                  {updateResult.output}
                </pre>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Tutup
          </button>

          {updateInfo && !updateResult && (
            <button
              onClick={handlePullUpdate}
              disabled={isUpdating}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center space-x-2 shadow-lg transition-all ${
                isUpdating
                  ? 'bg-indigo-600/60 cursor-wait'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/25 active:scale-95'
              }`}
            >
              <GitPullRequest className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Menarik Git Pull...' : 'Perbarui Sekarang (Git Pull)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
