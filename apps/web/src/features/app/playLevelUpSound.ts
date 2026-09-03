/** Fanfarra curta de conquista — respeita prefers-reduced-motion */
export function playLevelUpSound() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    const notes = [
      { freq: 523.25, at: 0, dur: 0.18 },
      { freq: 659.25, at: 0.12, dur: 0.18 },
      { freq: 783.99, at: 0.24, dur: 0.22 },
      { freq: 1046.5, at: 0.38, dur: 0.45 },
    ]

    for (const note of notes) {
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(note.freq, now + note.at)

      const gain = ctx.createGain()
      const start = now + note.at
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.14, start + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + note.dur + 0.02)
    }

    window.setTimeout(() => void ctx.close(), 1200)
  } catch {
    /* áudio indisponível */
  }
}
