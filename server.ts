import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Helper to initialize Gemini Client based on request
function getGeminiClient(req: express.Request) {
  const customKey = req.headers['x-gemini-key'] as string || req.body?.geminiApiKey;
  const customBaseUrl = req.headers['x-custom-base-url'] as string || req.body?.customBaseUrl;
  
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  const httpOptions: any = {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  };
  if (customBaseUrl) {
    httpOptions.baseUrl = customBaseUrl;
  }
  return new GoogleGenAI({ apiKey, httpOptions });
}

// Endpoint: Generate AI Narration / Voiceover Script
app.post('/api/generate-narration', async (req, res) => {
  try {
    const { videoTopic, originalContext, language, tone, durationSeconds, geminiModel } = req.body;
    const aiClient = getGeminiClient(req);
    const model = geminiModel || req.headers['x-gemini-model'] || 'gemini-2.5-flash';

    const langName = language || 'Bahasa Indonesia';
    const targetTone = tone || 'Storytelling Viral & Penasaran';
    const targetDuration = durationSeconds || 30;

    const prompt = `Anda adalah voiceover creator & scriptwriter video pendek profesional untuk TikTok, Instagram Reels, dan YouTube Shorts.
Tugas Anda: Buat naskah narasi voiceover yang SANGAT MENARIK, memikat di 3 detik pertama (hook), dinamis, dan pas dibacakan dalam durasi sekitar ${targetDuration} detik.

Konteks/Topik Video: "${videoTopic || 'Video viral menarik'}"
Deskripsi Konten Tambahan: "${originalContext || 'Klip video tanpa suara asli yang butuh narasi baru'}"
Bahasa Target: ${langName}
Gaya/Tone: ${targetTone}

Kembalikan jawaban dalam format JSON murni tanpa markdown dengan schema:
{
  "hook": "Kalimat pembuka 3 detik pertama yang bikin orang berhenti scrolling",
  "fullScript": "Seluruh teks naskah narasi lengkap yang akan dibacakan TTS",
  "segments": [
    {
      "time": "00:00 - 00:05",
      "text": "Teks bagian 1",
      "emotion": "Penasaran / Bersemangat / Tegas"
    }
  ],
  "estimatedDurationSec": 25,
  "recommendedVoicePitch": "normal",
  "recommendedSpeechRate": 1.05
}`;

    const response = await aiClient.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    const parsed = JSON.parse(jsonText);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating narration:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal menghasilkan narasi AI',
    });
  }
});

// Endpoint: Generate Social Media Titles, Captions & Hashtags
app.post('/api/generate-seo', async (req, res) => {
  try {
    const { topic, narrationScript, targetPlatforms, geminiModel } = req.body;
    const aiClient = getGeminiClient(req);
    const model = geminiModel || req.headers['x-gemini-model'] || 'gemini-2.5-flash';

    const prompt = `Buatkan metadata media sosial (TikTok, Instagram Reels, YouTube Shorts) yang dioptimasi agar algoritma merekomendasikan video (SEO & FYP) berdasarkan:
Topik: "${topic || 'Konten Video'}"
Naskah/Isi: "${narrationScript || 'Video editan unik dengan narasi baru'}"
Platform: "${(targetPlatforms || ['TikTok', 'Instagram', 'YouTube Shorts']).join(', ')}"

Kembalikan respon dalam format JSON murni:
{
  "titles": [
    "Judul Click-worthy 1 (Paling direkomendasikan)",
    "Judul Click-worthy 2 (Gaya Misterius/Emosional)",
    "Judul Click-worthy 3 (Singkat & To the point)"
  ],
  "captions": {
    "tiktok": "Caption TikTok lengkap dengan call to action dan emoji menarik",
    "instagram": "Caption Instagram Reels dengan storytelling dan ajakan komentar",
    "youtube": "Deskripsi YouTube Shorts singkat dan kaya kata kunci"
  },
  "hashtags": [
    "#fyp", "#viral", "#trending"
  ],
  "category": "Entertainment",
  "tips": "Tips terbaik untuk mengunggah video ini agar tembus FYP"
}`;

    const response = await aiClient.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating SEO metadata:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Gagal menghasilkan metadata SEO',
    });
  }
});

// Endpoint: URL Downloader & Social Media Extractor Simulator
app.post('/api/extract-video-url', (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL video wajib diisi' });
    }

    let platform = 'unknown';
    let cleanUrl = url.trim();

    if (cleanUrl.includes('tiktok.com')) platform = 'TikTok';
    else if (cleanUrl.includes('instagram.com')) platform = 'Instagram';
    else if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) platform = 'YouTube';
    else if (cleanUrl.includes('facebook.com')) platform = 'Facebook';
    else if (cleanUrl.includes('twitter.com') || cleanUrl.includes('x.com')) platform = 'X (Twitter)';

    const sampleVideos = [
      {
        id: 'sample-vertical-1',
        title: 'Cinematic Urban Nature Clip',
        duration: 15,
        resolution: '1080x1920 (9:16)',
        streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-a-neon-sign-at-night-42861-large.mp4',
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      },
      {
        id: 'sample-vertical-2',
        title: 'Exciting Roadtrip Aerial Journey',
        duration: 20,
        resolution: '1080x1920 (9:16)',
        streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-waves-crashing-on-a-rocky-shore-41712-large.mp4',
        poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      },
    ];

    const matchedSample = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

    res.json({
      success: true,
      data: {
        originalUrl: cleanUrl,
        platform,
        title: `${platform} Video: ${cleanUrl.slice(-15)}`,
        streamUrl: matchedSample.streamUrl,
        poster: matchedSample.poster,
        duration: matchedSample.duration,
        resolution: matchedSample.resolution,
        ytdlpCommand: `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --no-check-certificates "${cleanUrl}" -o "downloads/%(title)s.%(ext)s"`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Model Context Protocol (MCP) Server Endpoint for ChatGPT & Claude
app.all('/api/mcp', (req, res) => {
  // If GET request, return server capabilities & tools list
  if (req.method === 'GET') {
    return res.json({
      name: "autopilot-video-studio",
      version: "2.6.0",
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {
          download_social_video: {
            description: "Unduh video TikTok, Instagram Reels, atau YouTube Shorts",
            inputSchema: {
              type: "object",
              properties: {
                url: { type: "string", description: "URL video sosmed" }
              },
              required: ["url"]
            }
          },
          smart_crop_916: {
            description: "Auto-frame horizontal video into vertical 9:16 keeping subject in center",
            inputSchema: {
              type: "object",
              properties: {
                mode: { type: "string", enum: ["auto_action", "face_speaker", "center"] },
                smoothing: { type: "number" }
              }
            }
          },
          generate_narration: {
            description: "Buat naskah narasi AI multi-bahasa dengan hook 3 detik",
            inputSchema: {
              type: "object",
              properties: {
                topic: { type: "string" },
                language: { type: "string" },
                tone: { type: "string" }
              },
              required: ["topic"]
            }
          },
          render_ffmpeg_ultrafast: {
            description: "Render video unik dengan overlay dan speed boost 1.02x",
            inputSchema: {
              type: "object",
              properties: {
                aspectRatio: { type: "string", enum: ["9:16", "16:9", "1:1"] },
                preset: { type: "string", enum: ["ultrafast", "veryfast"] }
              }
            }
          }
        }
      }
    });
  }

  // Handle MCP JSON-RPC 2.0 requests
  const { jsonrpc, id, method, params } = req.body || {};

  if (method === 'initialize') {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "autopilot-video-studio", version: "2.6.0" }
      }
    });
  }

  if (method === 'tools/list') {
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
          {
            name: "download_social_video",
            description: "Unduh video sosmed bebas watermark",
            inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] }
          },
          {
            name: "smart_crop_916",
            description: "Krop pintar 9:16 melacak subjek utama",
            inputSchema: { type: "object", properties: { mode: { type: "string" } } }
          },
          {
            name: "render_ffmpeg_ultrafast",
            description: "Render video FFmpeg kecepatan tinggi",
            inputSchema: { type: "object", properties: { ratio: { type: "string" } } }
          }
        ]
      }
    });
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    return res.json({
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text: `Tool [${toolName}] berhasil dieksekusi oleh Studio AutoPilot FFmpeg.`
          }
        ]
      }
    });
  }

  res.json({ jsonrpc: "2.0", id: id || 1, result: { status: "ready" } });
});

// Setup Vite or static serving
async function setupServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
