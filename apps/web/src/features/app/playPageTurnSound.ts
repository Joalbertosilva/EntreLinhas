/** Som sutil de virar página — respeita prefers-reduced-motion */
export function playPageTurnSound() {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  try {
    const ctx = new AudioContext()
    const now = ctx.currentTime

    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    }
    noise.buffer = buffer

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 820
    noiseFilter.Q.value = 0.6

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.0001, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.04, now + 0.012)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)
    noise.stop(now + 0.1)

    const thud = ctx.createOscillator()
    thud.type = 'sine'
    thud.frequency.setValueAtTime(180, now)
    thud.frequency.exponentialRampToValueAtTime(90, now + 0.14)

    const thudGain = ctx.createGain()
    thudGain.gain.setValueAtTime(0.0001, now)
    thudGain.gain.exponentialRampToValueAtTime(0.07, now + 0.02)
    thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)

    thud.connect(thudGain)
    thudGain.connect(ctx.destination)
    thud.start(now)
    thud.stop(now + 0.18)

    window.setTimeout(() => void ctx.close(), 400)
  } catch {
    /* áudio indisponível */
  }
}
