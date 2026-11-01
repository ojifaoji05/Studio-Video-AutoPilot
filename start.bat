@echo off
TITLE AutoPilot Studio - Menjalankan Aplikasi...
color 0b
echo ========================================================
echo       MENJALANKAN AUTOPILOT STUDIO (FFMPEG + GEMINI)
echo ========================================================
echo.
echo [1/3] Memeriksa dependensi Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js belum terinstall! Silakan jalankan install.bat terlebih dahulu.
    pause
    exit /b
)

echo [2/3] Memulai server aplikasi di port 3000...
echo Aplikasi akan terbuka otomatis di browser anda.
echo Tekan Ctrl+C jika ingin menghentikan server.
echo.
start http://localhost:3000
npm run dev
pause
