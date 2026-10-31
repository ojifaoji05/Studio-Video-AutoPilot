@echo off
title Studio Video AutoPilot - Installer Windows
color 0b

echo =======================================================================
echo   STUDIO VIDEO AUTOPILOT - PANDUAN DAN INSTALASI LAPTOP (WINDOWS)
echo =======================================================================
echo.

:: 1. Cek Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python belum terpasang!
    echo     Silakan unduh Python 3.10+ dari https://www.python.org/downloads/
    echo     PENTING: Centang kotak "Add python.exe to PATH" saat menginstal!
    pause
    exit /b
)
echo [V] Python terdeteksi.

:: 2. Cek FFmpeg
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [!] FFmpeg belum terpasang di sistem Windows Anda.
    echo     Mencoba menginstal FFmpeg otomatis via Windows Package Manager (winget)...
    winget install Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo     Jika winget gagal, unduh manual FFmpeg dari:
        echo     https://www.gyan.dev/ffmpeg/builds/ (ffmpeg-release-essentials.zip)
        echo     ekstrak folder bin dan tambahkan ke System Environment Variables PATH.
    )
) else (
    echo [V] FFmpeg terdeteksi dan aktif di PATH.
)

:: 3. Instal dependensi python
echo.
echo [*] Menginstal pustaka python (yt-dlp, edge-tts, customtkinter, Pillow)...
pip install -r requirements.txt

:: 4. Jalankan Desktop GUI
echo.
echo =======================================================================
echo   INSTALASI BERHASIL! MEMBUKA APLIKASI DESKTOP GUI...
echo =======================================================================
python desktop_gui.py

pause
