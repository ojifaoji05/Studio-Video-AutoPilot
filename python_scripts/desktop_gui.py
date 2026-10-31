#!/usr/bin/env python3
"""
=============================================================================
 Studio Video AutoPilot - Desktop GUI Launcher v2.6
 Mendukung Pemrosesan Tunggal & Antrean Batch Processing + Beat-Sync
=============================================================================
"""

import os
import sys
import threading
import subprocess
from pathlib import Path

try:
    import tkinter as tk
    from tkinter import ttk, filedialog, messagebox
except ImportError:
    print("Error: Tkinter tidak tersedia. Di Linux instal: sudo apt install python3-tk")
    sys.exit(1)

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output_gallery"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

class AutoPilotGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("⚡ Studio Video AutoPilot v2.6 (Batch Processing & Beat-Sync)")
        self.root.geometry("820x720")
        self.root.minsize(740, 640)
        self.root.configure(bg="#0f172a")

        self.setup_widgets()

    def setup_widgets(self):
        # Header
        hdr = tk.Frame(self.root, bg="#1e293b", padx=16, pady=12)
        hdr.pack(fill="x", padx=16, pady=(16, 8))

        lbl_title = tk.Label(hdr, text="⚡ Studio Video AutoPilot (Batch & Beat-Sync)", font=("Segoe UI", 16, "bold"), bg="#1e293b", fg="#38bdf8")
        lbl_title.pack(anchor="w")
        lbl_sub = tk.Label(hdr, text="Otomasi Unduh All Sosmed • Antrean Batch • Sinkronisasi Beat Musik • FFmpeg Ultrafast", font=("Segoe UI", 9), bg="#1e293b", fg="#94a3b8")
        lbl_sub.pack(anchor="w")

        # Tabs: Tunggal vs Batch
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill="both", expand=True, padx=16, pady=6)

        tab_single = tk.Frame(self.notebook, bg="#0f172a", padx=8, pady=8)
        tab_batch = tk.Frame(self.notebook, bg="#0f172a", padx=8, pady=8)

        self.notebook.add(tab_single, text="  🎬 Proses Video Tunggal  ")
        self.notebook.add(tab_batch, text="  📋 Antrean Batch Processing  ")

        # --- TAB TUNGGAL ---
        f_url = tk.LabelFrame(tab_single, text=" Sumber Video ", bg="#1e293b", fg="#38bdf8", font=("Segoe UI", 9, "bold"), padx=10, pady=8)
        f_url.pack(fill="x", pady=4)
        tk.Label(f_url, text="URL Sosmed (TikTok / IG / YT):", bg="#1e293b", fg="#e2e8f0").pack(anchor="w")
        self.entry_single_url = tk.Entry(f_url, font=("Segoe UI", 10), bg="#0f172a", fg="#ffffff")
        self.entry_single_url.pack(fill="x", pady=3)
        self.entry_single_url.insert(0, "https://www.tiktok.com/@contoh/video/123456789")

        # --- TAB BATCH ---
        f_batch = tk.LabelFrame(tab_batch, text=" Daftar URL Antrean Batch (1 baris per URL) ", bg="#1e293b", fg="#38bdf8", font=("Segoe UI", 9, "bold"), padx=10, pady=8)
        f_batch.pack(fill="both", expand=True, pady=4)
        self.txt_batch = tk.Text(f_batch, height=6, bg="#0f172a", fg="#38bdf8", font=("Consolas", 10))
        self.txt_batch.pack(fill="both", expand=True, pady=4)
        self.txt_batch.insert("1.0", "https://www.tiktok.com/@contoh/video/111\nhttps://www.instagram.com/reel/222\nhttps://youtube.com/shorts/333")

        # --- PENGATURAN BERSAMA (Narasi & Beat Sync) ---
        shared_f = tk.LabelFrame(self.root, text=" Pengaturan Narasi AI & Detak Beat-Sync ", bg="#1e293b", fg="#38bdf8", font=("Segoe UI", 9, "bold"), padx=12, pady=8)
        shared_f.pack(fill="x", padx=16, pady=4)

        row_voice = tk.Frame(shared_f, bg="#1e293b")
        row_voice.pack(fill="x", pady=2)
        tk.Label(row_voice, text="Bahasa Narasi:", bg="#1e293b", fg="#e2e8f0", width=14, anchor="w").pack(side="left")
        self.voice_var = tk.StringVar(value="id-female")
        cb = ttk.Combobox(row_voice, textvariable=self.voice_var, state="readonly", width=30)
        cb['values'] = ["id-female (Bahasa Indonesia - Gadis)", "id-male (Bahasa Indonesia - Ardi)", "en-female (English - Jenny)", "en-male (English - Christopher)"]
        cb.pack(side="left")

        # Beat Sync BPM
        row_bpm = tk.Frame(shared_f, bg="#1e293b")
        row_bpm.pack(fill="x", pady=4)
        tk.Label(row_bpm, text="Tempo Beat-Sync:", bg="#1e293b", fg="#e2e8f0", width=14, anchor="w").pack(side="left")
        self.bpm_var = tk.IntVar(value=128)
        tk.Spinbox(row_bpm, from_=80, to=180, textvariable=self.bpm_var, width=8, bg="#0f172a", fg="#38bdf8", font=("Segoe UI", 10, "bold")).pack(side="left")
        tk.Label(row_bpm, text="BPM (Sinkronisasi hentakan video ke musik)", bg="#1e293b", fg="#94a3b8").pack(side="left", padx=8)

        # Naskah
        tk.Label(shared_f, text="Naskah Narasi AI:", bg="#1e293b", fg="#e2e8f0").pack(anchor="w", pady=(4, 0))
        self.txt_script = tk.Text(shared_f, height=2, bg="#0f172a", fg="#ffffff", font=("Segoe UI", 9))
        self.txt_script.pack(fill="x", pady=3)
        self.txt_script.insert("1.0", "Tahukah kalian? Momen ini membuktikan betapa luar biasanya hal kecil bisa mengubah segalanya!")

        # Action Buttons
        btn_bar = tk.Frame(self.root, bg="#0f172a")
        btn_bar.pack(fill="x", padx=16, pady=8)

        self.btn_run = tk.Button(btn_bar, text="▶ MULAI PROSES OTOMATIS (FFMPEG FAST)", font=("Segoe UI", 11, "bold"), bg="#0284c7", fg="#ffffff", padx=16, pady=8, command=self.start_thread)
        self.btn_run.pack(side="left", fill="x", expand=True, padx=(0, 8))

        btn_gallery = tk.Button(btn_bar, text="📂 Buka Galeri", font=("Segoe UI", 10, "bold"), bg="#334155", fg="#ffffff", padx=12, pady=8, command=self.open_gallery)
        btn_gallery.pack(side="right")

        # Terminal Log
        f_log = tk.LabelFrame(self.root, text=" Terminal Status FFmpeg ", bg="#1e293b", fg="#94a3b8", padx=8, pady=6)
        f_log.pack(fill="both", expand=True, padx=16, pady=(0, 12))
        self.log_box = tk.Text(f_log, bg="#020617", fg="#38bdf8", font=("Consolas", 9), height=7)
        self.log_box.pack(fill="both", expand=True)
        self.log("[Sistem Siap] Pilih mode tunggal atau batch, lalu klik 'Mulai Proses Otomatis'.")

    def log(self, text):
        self.log_box.insert("end", text + "\n")
        self.log_box.see("end")

    def open_gallery(self):
        if sys.platform == "win32": os.startfile(OUTPUT_DIR)
        elif sys.platform == "darwin": subprocess.Popen(["open", str(OUTPUT_DIR)])
        else: subprocess.Popen(["xdg-open", str(OUTPUT_DIR)])

    def start_thread(self):
        self.btn_run.config(state="disabled", text="⏳ Sedang Memproses di Latar Belakang...")
        threading.Thread(target=self.run_process, daemon=True).start()

    def run_process(self):
        try:
            bot_script = BASE_DIR / "autopilot_bot.py"
            voice = self.voice_var.get().split()[0]
            bpm = str(self.bpm_var.get())
            txt = self.txt_script.get("1.0", "end").strip()

            active_tab_idx = self.notebook.index(self.notebook.select())

            if active_tab_idx == 1:  # Mode Batch
                batch_text = self.txt_batch.get("1.0", "end").strip()
                if not batch_text:
                    self.log("[!] Daftar antrean batch masih kosong.")
                    return
                # Simpan ke temp file
                batch_file = BASE_DIR / "temp_batch_urls.txt"
                with open(batch_file, "w", encoding="utf-8") as f:
                    f.write(batch_text)
                cmd = [sys.executable, str(bot_script), "--batch-file", str(batch_file), "--text", txt, "--voice", voice, "--bpm", bpm]
            else:  # Mode Tunggal
                url = self.entry_single_url.get().strip()
                if not url.startswith("http"):
                    self.log("[!] Masukkan URL sosmed yang valid.")
                    return
                cmd = [sys.executable, str(bot_script), "--url", url, "--text", txt, "--voice", voice, "--bpm", bpm]

            self.log(f"[Menjalankan]: {' '.join(cmd)}")
            p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
            for line in p.stdout:
                self.log(line.strip())
            p.wait()

            if p.returncode == 0:
                self.log("\n[SELESAI] Hasil otomatis tersimpan di galeri laptop!")
                messagebox.showinfo("Sukses!", "Video berhasil diproses dan disimpan di galeri output!")
            else:
                self.log(f"\n[Gagal] Proses berakhir dengan kode error {p.returncode}")
        except Exception as e:
            self.log(f"[Error]: {e}")
        finally:
            self.btn_run.config(state="normal", text="▶ MULAI PROSES OTOMATIS (FFMPEG FAST)")

def main():
    root = tk.Tk()
    AutoPilotGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
