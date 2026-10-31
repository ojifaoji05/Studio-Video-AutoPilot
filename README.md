# ⚡ Studio Video AutoPilot & FFmpeg Hub

Aplikasi pengelola dan editor video otomatis berkecepatan tinggi yang dirancang khusus untuk kreator konten TikTok, Instagram Reels, dan YouTube Shorts. Dilengkapi dengan mesin **FFmpeg Ultrafast**, **Antrean Batch Processing**, **Sinkronisasi Detak Audio (Beat-Sync)**, **Smart Crop 9:16**, **Watermark Drag-and-Drop**, **Narasi AI Multi-Bahasa**, dan **Desktop GUI untuk Laptop**.

---

## 🚀 Fitur Unggulan

1. **Studio Editor & Mesin FFmpeg Ultrafast**:
   - Pemrosesan video kilat menggunakan `-preset ultrafast -tune fastdecode`.
   - **Video Filters (Preset FFmpeg)**: Sepia, Black & White (Grayscale), Vintage, High Contrast, Vibrant, Cinematic, Moody, dan Warm.
   - **Smart Crop 9:16**: Pelacakan subjek otomatis mengubah video horizontal (16:9) menjadi vertikal (9:16) tanpa garis hitam.
   - **Watermark Drag & Drop**: Tambahkan teks atau logo transparan dan geser posisinya secara bebas di atas frame video.
2. **Antrean Batch Processing (Pemrosesan Massal)**:
   - Unduh dan proses puluhan tautan video sosmed sekaligus secara otomatis di latar belakang.
3. **Sinkronisasi Detak Audio (Beat-Sync)**:
   - Transisi visual dan teks memantul pas pada setiap ketukan hentakan musik (BPM).
4. **Narasi AI Multi-Bahasa & Dubbing**:
   - Pembuatan skrip voiceover AI cerdas (Bahasa Indonesia, Inggris, Jepang, dll.) lengkap dengan pemutar suara neural dan teks berjalan (*subtitle* MrBeast style).
5. **Ekstraktor Thumbnail Otomatis**:
   - Ekstrak frame momen paling dramatis dari video untuk dijadikan thumbnail sosmed ber-CTR tinggi.

---

## 📦 Cara Upload ke GitHub

1. Buat repository baru di [GitHub](https://github.com/new).
2. Buka terminal di folder proyek Anda dan jalankan perintah berikut:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Studio Video AutoPilot v2.6"
   git branch -M main
   git remote add origin https://github.com/ojifaoji05/Studio-Video-AutoPilot.git
   git push -u origin main
   ```

---

## 🛠️ Panduan Instalasi & Menjalankan di Laptop

### 1. Prasyarat Sistem
* **Python 3.10 atau lebih baru** (Pastikan mencentang *"Add python.exe to PATH"* saat instalasi Windows).
* **FFmpeg** (Wajib terpasang di sistem dan terdaftar di Environment PATH).

---

### 2. Panduan Instalasi Cepat (1-Klik)

#### 🪟 Pengguna Windows (10 / 11)
1. Unduh atau *clone* repository ini ke laptop Anda.
2. Masuk ke folder `/python_scripts`.
3. Klik 2x pada file **`install_windows.bat`** (Skrip ini akan otomatis memeriksa Python, menginstal FFmpeg via `winget`, memasang pustaka python di `requirements.txt`, dan membuka antarmuka Desktop GUI).

#### 🍏 Pengguna macOS & 🐧 Linux (Ubuntu/Debian)
1. Buka Terminal di folder proyek.
2. Masuk ke folder skrip:
   ```bash
   cd python_scripts
   ```
3. Jalankan skrip instalasi dan launcher:
   ```bash
   bash install_mac_linux.sh
   ```

---

### 3. Menjalankan Versi Web Full-Stack (Opsional)
Jika Anda ingin menjalankan server web lokal dengan antarmuka React & Express:
1. Pastikan Node.js terpasang, lalu instal dependensi:
   ```bash
   npm install
   ```
2. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
3. Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktur Folder Proyek
* `/src` — Antarmuka web React & Tailwind CSS.
* `/python_scripts` — Skrip Python otomasi latar belakang (`autopilot_bot.py`, `desktop_gui.py`, installer).
* `/server.ts` — Server Backend Express & endpoint MCP ChatGPT.
* `/output_gallery` — Hasil render video akhir yang otomatis tersimpan.

## 📄 Lisensi
Distributed under the Apache 2.0 License.
