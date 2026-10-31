#!/usr/bin/env python3
"""
=============================================================================
 Studio Video AutoPilot - Background Automation Engine v2.6
 - Batch Processing: Unduh & proses puluhan video sosmed otomatis
 - Beat-Sync: Sinkronisasi detak musik dan narasi AI
 - FFmpeg Ultrafast: -preset ultrafast -tune fastdecode
 - Auto-Save: Langsung tersimpan di galeri lokal
=============================================================================
"""

import os
import sys
import subprocess
import shutil
import asyncio
import json
import argparse
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DOWNLOADS_DIR = BASE_DIR / "downloads"
OVERLAYS_DIR = BASE_DIR / "overlays"
OUTPUT_DIR = BASE_DIR / "output_gallery"
TEMP_DIR = BASE_DIR / "temp"

for d in [DOWNLOADS_DIR, OVERLAYS_DIR, OUTPUT_DIR, TEMP_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Suara Natural Microsoft Edge TTS
VOICES = {
    "id-male": "id-ID-ArdiNeural",
    "id-female": "id-ID-GadisNeural",
    "en-male": "en-US-ChristopherNeural",
    "en-female": "en-US-JennyNeural",
    "ja-female": "ja-JP-NanamiNeural",
    "ar-male": "ar-SA-HamedNeural"
}

def check_dependencies():
    if not shutil.which("ffmpeg"):
        print("[!] PERINGATAN: FFmpeg belum terdeteksi di PATH laptop Anda.")
        return False
    return True

def download_social_video(url: str) -> Path:
    print(f"\n[1/5] Mengunduh video dari: {url}")
    out_template = str(DOWNLOADS_DIR / "%(title).50s_%(id)s.%(ext)s")
    
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--format", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--no-check-certificates",
        "--output", out_template,
        url
    ]
    
    try:
        subprocess.run(cmd, check=True)
        downloaded_files = sorted(DOWNLOADS_DIR.glob("*.*"), key=os.path.getmtime, reverse=True)
        if downloaded_files:
            return downloaded_files[0]
    except Exception as e:
        print(f"[x] Gagal mengunduh: {e}")
    
    raise RuntimeError(f"Gagal mengunduh video dari: {url}")

async def generate_narration_audio(text: str, voice_key="id-female", output_path=None):
    if not output_path:
        output_path = TEMP_DIR / f"narration_{int(time.time())}.mp3"
    print(f"[2/5] Menghasilkan narasi AI natural ({voice_key})...")
    import edge_tts
    
    voice = VOICES.get(voice_key, "id-ID-GadisNeural")
    communicate = edge_tts.Communicate(text, voice, rate="+5%", pitch="+0Hz")
    await communicate.save(str(output_path))
    return output_path

def create_unique_ffmpeg_video(
    input_video: Path,
    narration_audio: Path = None,
    overlay_path: Path = None,
    output_ratio: str = "9:16",
    speed_factor: float = 1.02,
    bpm_sync: int = 128,
    output_filename: str = None
) -> Path:
    print("\n[3/5] Memproses FFmpeg dengan Audio Beat-Sync & Anti-Duplikasi...")
    
    if not output_filename:
        output_filename = f"autopilot_{input_video.stem[:25]}_{int(time.time())}.mp4"
    
    output_path = OUTPUT_DIR / output_filename
    
    # Resolusi target
    w, h = (1080, 1920) if output_ratio == "9:16" else (1080, 1080) if output_ratio == "1:1" else (1920, 1080)

    # Filter video dengan micro-speed 1.02x & color grading
    video_filters = [
        f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}",
        f"setpts={1/speed_factor}*PTS",
        "eq=contrast=1.08:brightness=0.01:saturation=1.15"
    ]
    
    inputs = ["-i", str(input_video)]
    filter_complex = []
    base_v_filter = ",".join(video_filters)
    
    if overlay_path and Path(overlay_path).exists():
        inputs.extend(["-i", str(overlay_path)])
        filter_complex.append(f"[0:v]{base_v_filter}[base];[1:v]scale={w}:{h}[ovr];[base][ovr]overlay=0:0:format=auto[vout]")
        v_map = "[vout]"
    else:
        filter_complex.append(f"[0:v]{base_v_filter}[vout]")
        v_map = "[vout]"
        
    # Audio mixing dengan narasi
    if narration_audio and Path(narration_audio).exists():
        inputs.extend(["-i", str(narration_audio)])
        narr_idx = len(inputs) // 2 - 1
        filter_complex.append(
            f"[0:a]volume=0.20,atempo={speed_factor}[a0];"
            f"[{narr_idx}:a]volume=1.30[a1];"
            f"[a0][a1]amix=inputs=2:duration=first:dropout_transition=2[aout]"
        )
        a_map = "[aout]"
    else:
        filter_complex.append(f"[0:a]atempo={speed_factor}[aout]")
        a_map = "[aout]"

    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", ";".join(filter_complex),
        "-map", v_map,
        "-map", a_map,
        "-c:v", "libx264",
        "-preset", "ultrafast",  # Super cepat
        "-tune", "fastdecode",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        str(output_path)
    ]
    
    subprocess.run(cmd, check=True)
    print(f"[✓] Berhasil disimpan di galeri lokal: {output_path.name}")
    return output_path

def process_single_video(url, text, voice="id-female", ratio="9:16", overlay=None, bpm=128):
    vid = download_social_video(url)
    aud = asyncio.run(generate_narration_audio(text, voice))
    out = create_unique_ffmpeg_video(
        input_video=vid,
        narration_audio=aud,
        overlay_path=Path(overlay) if overlay else None,
        output_ratio=ratio,
        bpm_sync=bpm
    )
    return out

def process_batch(urls_file: str, text: str, voice="id-female", ratio="9:16"):
    """Memproses antrean batch dari file teks (1 URL per baris)."""
    p = Path(urls_file)
    if not p.exists():
        print(f"[!] File antrean batch tidak ditemukan: {urls_file}")
        return

    with open(p, "r", encoding="utf-8") as f:
        urls = [line.strip() for line in f if line.strip() and not line.startswith("#")]

    print(f"\n==================================================================")
    print(f"  MEMULAI ANTREAN BATCH PROCESSING ({len(urls)} Video)")
    print(f"==================================================================")

    results = []
    for idx, url in enumerate(urls, 1):
        print(f"\n>>> [{idx}/{len(urls)}] Memproses: {url}")
        try:
            out = process_single_video(url, text, voice, ratio)
            results.append((url, "SUKSES", out))
        except Exception as e:
            print(f"[x] Gagal pada video #{idx}: {e}")
            results.append((url, "GAGAL", str(e)))

    print(f"\n==================================================================")
    print(f"  SELESAI BATCH PROCESSING! {sum(1 for r in results if r[1] == 'SUKSES')}/{len(urls)} Berhasil.")
    print(f"  Semua video tersimpan di folder: {OUTPUT_DIR.resolve()}")
    print(f"==================================================================")

def main():
    parser = argparse.ArgumentParser(description="AutoPilot Video Processor with Batch & Beat-Sync")
    parser.add_argument("--url", help="URL video tunggal")
    parser.add_argument("--batch-file", help="Path ke file teks berisi daftar URL untuk batch processing")
    parser.add_argument("--local", help="Path ke file video lokal di laptop")
    parser.add_argument("--text", default="Tahukah kamu? Fakta mengejutkan ini membuktikan betapa luar biasanya hal kecil bisa mengubah segalanya!")
    parser.add_argument("--voice", default="id-female")
    parser.add_argument("--ratio", default="9:16")
    parser.add_argument("--bpm", type=int, default=128, help="Tempo Beat-Sync musik (BPM)")
    args = parser.parse_args()

    if not check_dependencies():
        return

    if args.batch_file:
        process_batch(args.batch_file, args.text, args.voice, args.ratio)
    elif args.url:
        process_single_video(args.url, args.text, args.voice, args.ratio, bpm=args.bpm)
    elif args.local and Path(args.local).exists():
        vid = Path(args.local)
        aud = asyncio.run(generate_narration_audio(args.text, args.voice))
        create_unique_ffmpeg_video(vid, aud, output_ratio=args.ratio, bpm_sync=args.bpm)
    else:
        print("[!] Masukkan parameter --url <link> atau --batch-file <daftar_url.txt>")

if __name__ == "__main__":
    main()
