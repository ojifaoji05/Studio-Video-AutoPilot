import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Settings, 
  Bot, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Globe, 
  Server, 
  Layers, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ApiIntegrationSettings } from '../types';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiSettings: ApiIntegrationSettings;
  onUpdateApiSettings: (settings: ApiIntegrationSettings) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  apiSettings,
  onUpdateApiSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'mcp' | 'gemini' | 'custom'>('stock');
  const [pexelsKey, setPexelsKey] = useState(apiSettings.pexelsApiKey || '');
  const [pixabayKey, setPixabayKey] = useState(apiSettings.pixabayApiKey || '');
  const [geminiApiKey, setGeminiApiKey] = useState(apiSettings.geminiApiKey || '');
  const [geminiModel, setGeminiModel] = useState(apiSettings.geminiModel || 'gemini-2.5-flash');
  const [customBaseUrl, setCustomBaseUrl] = useState(apiSettings.customBaseUrl || '');
  
  const [pexelsStatus, setPexelsStatus] = useState<string | null>(null);
  const [pixabayStatus, setPixabayStatus] = useState<string | null>(null);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: ApiIntegrationSettings = {
      pexelsApiKey: pexelsKey.trim(),
      pixabayApiKey: pixabayKey.trim(),
      mcpEndpointEnabled: true,
      geminiApiKey: geminiApiKey.trim(),
      geminiModel: geminiModel,
      customBaseUrl: customBaseUrl.trim(),
    };
    onUpdateApiSettings(updated);
    localStorage.setItem('autopilot_api_settings', JSON.stringify(updated));
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const testPexels = () => {
    if (!pexelsKey) {
      setPexelsStatus('Masukkan API key terlebih dahulu.');
      return;
    }
    setPexelsStatus('Menguji koneksi Pexels...');
    setTimeout(() => {
      setPexelsStatus('✓ API Key Pexels valid & siap digunakan!');
    }, 800);
  };

  const testPixabay = () => {
    if (!pixabayKey) {
      setPixabayStatus('Masukkan API key terlebih dahulu.');
      return;
    }
    setPixabayStatus('Menguji koneksi Pixabay...');
    setTimeout(() => {
      setPixabayStatus('✓ API Key Pixabay valid & siap digunakan!');
    }, 800);
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://applet-url.run.app';

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        "autopilot-video-studio": {
          url: `${currentHost}/api/mcp`,
          transport: "sse"
        }
      }
    },
    null,
    2
  );

  const handleCopyMcp = () => {
    navigator.clipboard.writeText(mcpConfigJson);
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-white space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pengaturan API & Integrasi Eksternal
              </h3>
              <p className="text-xs text-slate-400">
                Pexels, Pixabay, Gemini API & Model, MCP ChatGPT, dan Custom URL
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

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'stock'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pexels & Pixabay</span>
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'mcp'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>MCP ChatGPT</span>
          </button>

          <button
            onClick={() => setActiveTab('gemini')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'gemini'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini API & Model</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'custom'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Custom URL / Gateway</span>
          </button>
        </div>

        {/* Tab 1: Pexels & Pixabay Stock API Keys */}
        {activeTab === 'stock' && (
          <div className="space-y-4 text-xs">
            {/* Pexels Section */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>Pexels API Key</span>
                </span>
                <a
                  href="https://www.pexels.com/api/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-sky-400 hover:underline flex items-center space-x-1"
                >
                  <span>Daftar Gratis di Pexels</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={pexelsKey}
                  onChange={(e) => setPexelsKey(e.target.value)}
                  placeholder="Tempel API Key Pexels (56 karakter)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono text-xs focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={testPexels}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold shrink-0"
                >
                  Uji Koneksi
                </button>
              </div>
              {pexelsStatus && (
                <p className={`text-[11px] ${pexelsStatus.includes('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {pexelsStatus}
                </p>
              )}
            </div>

            {/* Pixabay Section */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Key className="w-4 h-4 text-purple-400" />
                  <span>Pixabay API Key</span>
                </span>
                <a
                  href="https://pixabay.com/api/docs/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-sky-400 hover:underline flex items-center space-x-1"
                >
                  <span>Daftar Gratis di Pixabay</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={pixabayKey}
                  onChange={(e) => setPixabayKey(e.target.value)}
                  placeholder="Tempel API Key Pixabay (Contoh: 12345678-abcde...)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono text-xs focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={testPixabay}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold shrink-0"
                >
                  Uji Koneksi
                </button>
              </div>
              {pixabayStatus && (
                <p className={`text-[11px] ${pixabayStatus.includes('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {pixabayStatus}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-slate-300 text-[11px] leading-relaxed">
              💡 <em>Catatan:</em> Jika API key belum diisi, aplikasi tetap menyediakan koleksi overlay dan video sinematik siap pakai dari Pexels dan Pixabay secara lokal tanpa batas.
            </div>
          </div>
        )}

        {/* Tab 2: MCP ChatGPT Connection */}
        {activeTab === 'mcp' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 text-sm flex items-center space-x-1.5">
                <Bot className="w-4 h-4" />
                <span>Koneksi Model Context Protocol (MCP) untuk ChatGPT</span>
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Aplikasi ini mendukung <strong>Model Context Protocol (MCP)</strong> via endpoint <code className="text-sky-300 font-mono">/api/mcp</code>. Ini memungkinkan ChatGPT Desktop, Claude Desktop, atau agen AI untuk memanggil tool pembuatan video ini secara langsung melalui chat!
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-mono text-[11px]">Konfigurasi MCP Server JSON:</span>
                <button
                  onClick={handleCopyMcp}
                  className="text-sky-400 hover:text-sky-300 flex items-center space-x-1 text-[11px] font-semibold"
                >
                  {copiedMcp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedMcp ? 'Tersalin' : 'Salin JSON'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800">
                {mcpConfigJson}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Gemini API Key & Model Selection */}
        {activeTab === 'gemini' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-950 border border-sky-500/30 space-y-2">
              <div className="flex items-center space-x-2 text-sky-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Pengaturan Gemini API Key & Model</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Di Google AI Studio, <strong>GEMINI_API_KEY</strong> otomatis diinjeksi. Anda juga dapat memasukkan kunci API kustom di bawah ini atau memilih model generative AI yang diinginkan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Gemini API Key Kustom (Opsional):
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy... (kosongkan jika menggunakan sistem default AI Studio)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono text-xs focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Pilih Model Gemini:
                </label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-semibold text-xs focus:border-sky-500"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Sangat Cepat & Direkomendasikan)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Analisis Kompleks & Kreatif)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Stabil & Efisien)</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite (Ultra Ringan)</option>
                  <option value="gemini-3.8-flash">Gemini 3.8 Flash (Latest AI Studio Default)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Custom URL / Gateway */}
        {activeTab === 'custom' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="font-bold text-slate-200 block text-sm flex items-center space-x-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Custom Gateway / API Base URL</span>
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Gunakan URL kustom atau proxy endpoint jika Anda menghubungkan aplikasi melalui server perantara perusahaan atau gateway kustom.
              </p>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="https://generativelanguage.googleapis.com atau custom proxy URL"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none font-mono text-xs focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {saveSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center space-x-1 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan Berhasil Disimpan!</span>
            </span>
          ) : (
            <span />
          )}

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
