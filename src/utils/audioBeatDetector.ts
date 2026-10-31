/**
 * Audio Beat Detection & Rhythm Synchronizer Engine
 * Menghitung detak musik (BPM), titik beat (timestamps), dan deteksi hentakan (onset peak)
 * untuk sinkronisasi transisi visual dan kemunculan teks.
 */

export interface BeatMap {
  bpm: number;
  intervalSec: number;
  beatTimes: number[];
}

export function generateBeatMap(bpm: number, durationSec: number = 60): BeatMap {
  const safeBpm = Math.max(60, Math.min(200, bpm));
  const intervalSec = 60 / safeBpm;
  const beatTimes: number[] = [];

  for (let t = 0; t <= durationSec; t += intervalSec) {
    beatTimes.push(parseFloat(t.toFixed(3)));
  }

  return {
    bpm: safeBpm,
    intervalSec,
    beatTimes,
  };
}

/**
 * Cek apakah waktu pemutaran saat ini pas di atas hentakan beat (hit window)
 */
export function checkIsBeatHit(
  currentTime: number,
  beatMap: BeatMap,
  toleranceSec: number = 0.08
): { isHit: boolean; intensity: number; beatNumber: number } {
  if (!beatMap.beatTimes.length) return { isHit: false, intensity: 0, beatNumber: 0 };

  const interval = beatMap.intervalSec;
  // Sisa waktu relatif terhadap interval beat
  const remainder = currentTime % interval;
  const distanceToBeat = Math.min(remainder, interval - remainder);

  if (distanceToBeat <= toleranceSec) {
    // Normalisasi intensitas: 1.0 saat pas di tengah beat, melandai ke 0 di tepi toleransi
    const intensity = 1.0 - distanceToBeat / toleranceSec;
    const beatNumber = Math.floor(currentTime / interval) + 1;
    return { isHit: true, intensity, beatNumber };
  }

  return { isHit: false, intensity: 0, beatNumber: 0 };
}

/**
 * Deteksi BPM otomatis dari audio element menggunakan Web Audio API jika didukung
 */
export async function detectAudioBPM(audioUrl: string): Promise<number> {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return 124; // Fallback tempo TikTok populer

    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioCtx = new AudioContextClass();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Ambil data channel pertama (mono)
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Peak onset energy counter
    let peaks: number[] = [];
    const step = Math.floor(sampleRate / 100); // 10ms windows
    let prevVolume = 0;

    for (let i = 0; i < channelData.length; i += step) {
      let sum = 0;
      for (let j = 0; j < step && i + j < channelData.length; j++) {
        sum += Math.abs(channelData[i + j]);
      }
      const volume = sum / step;
      if (volume > 0.15 && volume > prevVolume * 1.3) {
        peaks.push(i / sampleRate);
      }
      prevVolume = volume;
    }

    // Hitung rata-rata interval antar peak
    if (peaks.length > 5) {
      let intervals: number[] = [];
      for (let i = 1; i < peaks.length; i++) {
        const diff = peaks[i] - peaks[i - 1];
        if (diff >= 0.3 && diff <= 0.9) {
          intervals.push(diff);
        }
      }
      if (intervals.length > 0) {
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const calculatedBpm = Math.round(60 / avgInterval);
        if (calculatedBpm >= 70 && calculatedBpm <= 180) {
          return calculatedBpm;
        }
      }
    }
    return 126; // Rata-rata tempo viral
  } catch (err) {
    console.warn('Fallback to standard 124 BPM due to audio context restrictions:', err);
    return 124;
  }
}
