/**
 * fftAnalyzer.ts
 * Pure-JS FFT (Cooley-Tukey radix-2) with Hann windowing.
 * No external dependencies.
 */

export interface FftBin {
  frequency: number; // Hz
  magnitude: number; // linear
  db: number;        // 20*log10(magnitude)
}

/** Next power of 2 >= n */
function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

/** Hann window coefficient at index i of N */
function hann(i: number, N: number): number {
  return 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
}

/**
 * In-place Cooley-Tukey radix-2 FFT.
 * re[], im[] must have length = power of 2.
 */
function fftInPlace(re: Float64Array, im: Float64Array): void {
  const N = re.length;
  // Bit-reversal permutation
  let j = 0;
  for (let i = 1; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  // Butterfly passes
  for (let len = 2; len <= N; len <<= 1) {
    const half = len >> 1;
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let curRe = 1, curIm = 0;
      for (let k = 0; k < half; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + half] * curRe - im[i + k + half] * curIm;
        const vIm = re[i + k + half] * curIm + im[i + k + half] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + half] = uRe - vRe;
        im[i + k + half] = uIm - vIm;
        const newRe = curRe * wRe - curIm * wIm;
        const newIm = curRe * wIm + curIm * wRe;
        curRe = newRe;
        curIm = newIm;
      }
    }
  }
}

/**
 * Compute FFT spectrum for a signal sampled at non-uniform time steps.
 * Resamples to uniform grid via linear interpolation before FFT.
 *
 * @param times   Array of time values (seconds)
 * @param values  Array of signal values (volts)
 * @param maxBins Maximum number of frequency bins to return (default 512)
 * @returns       Array of FftBin sorted by ascending frequency
 */
export function computeFFT(
  times: number[],
  values: number[],
  maxBins = 512
): FftBin[] {
  if (times.length < 4 || values.length !== times.length) return [];

  const tStart = times[0];
  const tEnd = times[times.length - 1];
  const duration = tEnd - tStart;
  if (duration <= 0) return [];

  // Cap at 8192 to stay non-blocking on main thread (~5ms max for 8192-pt FFT in JS).
  // Larger buffers are fine — the uniform resampling step already downsamples to N points.
  const N = Math.min(nextPow2(times.length), 8192);
  const dt = duration / (N - 1);   // uniform step = total_duration / (N-1)
  const sampleRate = 1 / dt;        // Hz — derived from uniform grid, not adaptive steps

  // Resample to uniform grid via linear interpolation
  const uniform = new Float64Array(N);
  let srcIdx = 0;
  for (let i = 0; i < N; i++) {
    const t = tStart + i * dt;
    // Advance source pointer
    while (srcIdx < times.length - 2 && times[srcIdx + 1] < t) srcIdx++;
    const t0 = times[srcIdx];
    const t1 = times[srcIdx + 1] ?? t0;
    const frac = t1 > t0 ? (t - t0) / (t1 - t0) : 0;
    uniform[i] = values[srcIdx] + frac * ((values[srcIdx + 1] ?? values[srcIdx]) - values[srcIdx]);
  }

  // Apply Hann window + remove DC offset
  const mean = uniform.reduce((a, b) => a + b, 0) / N;
  const re = new Float64Array(N);
  const im = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    re[i] = (uniform[i] - mean) * hann(i, N);
    im[i] = 0;
  }

  fftInPlace(re, im);

  // Build output: only positive frequencies (0 to Nyquist)
  const halfN = N / 2;
  const freqResolution = sampleRate / N;
  const bins: FftBin[] = [];
  const scale = 2 / N; // two-sided → one-sided correction

  for (let k = 1; k < halfN; k++) { // skip DC (k=0)
    const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]) * scale;
    const frequency = k * freqResolution;
    // Skip near-DC bins (<10Hz) — they look ugly on log scale and carry no useful info
    if (frequency < 10) continue;
    const db = mag > 1e-12 ? 20 * Math.log10(mag) : -120;
    bins.push({ frequency, magnitude: mag, db });
  }

  // Downsample to maxBins by keeping peaks in log-spaced buckets
  if (bins.length <= maxBins) return bins;

  const logMin = Math.log10(bins[0].frequency);
  const logMax = Math.log10(bins[bins.length - 1].frequency);
  const result: FftBin[] = [];
  for (let b = 0; b < maxBins; b++) {
    const fLow = Math.pow(10, logMin + (b / maxBins) * (logMax - logMin));
    const fHigh = Math.pow(10, logMin + ((b + 1) / maxBins) * (logMax - logMin));
    // Find peak bin in this bucket
    let peak: FftBin | null = null;
    for (const bin of bins) {
      if (bin.frequency >= fLow && bin.frequency < fHigh) {
        if (!peak || bin.magnitude > peak.magnitude) peak = bin;
      }
    }
    if (peak) result.push(peak);
  }

  return result;
}
