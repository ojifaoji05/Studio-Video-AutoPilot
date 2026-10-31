#!/usr/bin/env bash
# =======================================================================
# Studio Video AutoPilot - Installer & Launcher macOS / Linux (Ubuntu/Debian)
# =======================================================================

set -e

echo "======================================================================="
echo "  STUDIO VIDEO AUTOPILOT - PANDUAN & INSTALASI LAPTOP (macOS / Linux)  "
echo "======================================================================="
echo ""

# Cek Python
if ! command -v python3 &> /dev/null; then
    echo "[X] Python3 belum terpasang."
    echo "    macOS: brew install python"
    echo "    Ubuntu/Debian: sudo apt update && sudo apt install -y python3 python3-pip python3-tk"
    exit 1
fi
echo "[✓] Python3 terdeteksi: $(python3 --version)"

# Cek FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "[!] FFmpeg belum terpasang. Menginstal FFmpeg..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install ffmpeg
        else
            echo "Silakan instal Homebrew dari https://brew.sh lalu jalankan: brew install ffmpeg"
            exit 1
        fi
    else
        sudo apt update && sudo apt install -y ffmpeg python3-tk
    fi
else
    echo "[✓] FFmpeg terdeteksi."
fi

# Instal Python dependencies
echo "[*] Menginstal dependensi Python dari requirements.txt..."
python3 -m pip install -r requirements.txt

echo ""
echo "======================================================================="
echo "  INSTALASI SELESAI! MEMULAI APLIKASI DESKTOP GUI..."
echo "======================================================================="
python3 desktop_gui.py
