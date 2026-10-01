import { useEffect, useRef } from 'react'

interface BlobNode {
  offsetX: number
  offsetY: number
  radius: number
  phase: number
  speed: number
}

interface LivingOrganism {
  anchorX: number
  anchorY: number
  driftPhase: number
  driftSpeed: number
  color: string
  nodes: BlobNode[]
}

const ORGANISMS: LivingOrganism[] = [
  {
    anchorX: 0.22,
    anchorY: 0.28,
    driftPhase: 0,
    driftSpeed: 0.22,
    color: 'rgba(42, 157, 143, 0.42)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 168, phase: 0, speed: 0.55 },
      { offsetX: 92, offsetY: 48, radius: 132, phase: 1.4, speed: 0.48 },
      { offsetX: -68, offsetY: 72, radius: 118, phase: 2.8, speed: 0.52 },
    ],
  },
  {
    anchorX: 0.78,
    anchorY: 0.22,
    driftPhase: 1.2,
    driftSpeed: 0.18,
    color: 'rgba(28, 117, 106, 0.36)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 156, phase: 0.6, speed: 0.5 },
      { offsetX: -84, offsetY: 56, radius: 124, phase: 2.1, speed: 0.44 },
      { offsetX: 64, offsetY: -40, radius: 108, phase: 3.5, speed: 0.46 },
    ],
  },
  {
    anchorX: 0.48,
    anchorY: 0.58,
    driftPhase: 2.4,
    driftSpeed: 0.2,
    color: 'rgba(239, 176, 52, 0.28)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 148, phase: 1.1, speed: 0.42 },
      { offsetX: 76, offsetY: -52, radius: 112, phase: 2.6, speed: 0.38 },
    ],
  },
  {
    anchorX: 0.14,
    anchorY: 0.82,
    driftPhase: 0.8,
    driftSpeed: 0.17,
    color: 'rgba(82, 184, 168, 0.34)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 152, phase: 0.3, speed: 0.4 },
      { offsetX: 88, offsetY: -36, radius: 120, phase: 1.9, speed: 0.36 },
      { offsetX: -42, offsetY: 28, radius: 96, phase: 2.7, speed: 0.33 },
    ],
  },
  {
    anchorX: 0.55,
    anchorY: 0.88,
    driftPhase: 2.9,
    driftSpeed: 0.15,
    color: 'rgba(28, 117, 106, 0.3)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 140, phase: 1.5, speed: 0.38 },
      { offsetX: -72, offsetY: -48, radius: 108, phase: 0.7, speed: 0.35 },
    ],
  },
  {
    anchorX: 0.86,
    anchorY: 0.76,
    driftPhase: 3.6,
    driftSpeed: 0.19,
    color: 'rgba(42, 157, 143, 0.32)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 128, phase: 2.2, speed: 0.41 },
      { offsetX: -64, offsetY: 40, radius: 100, phase: 3.1, speed: 0.37 },
    ],
  },
  {
    anchorX: 0.32,
    anchorY: 0.94,
    driftPhase: 1.1,
    driftSpeed: 0.14,
    color: 'rgba(239, 176, 52, 0.26)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 160, phase: 0.9, speed: 0.36 },
      { offsetX: 96, offsetY: -28, radius: 124, phase: 2.4, speed: 0.32 },
    ],
  },
  {
    anchorX: 0.68,
    anchorY: 0.96,
    driftPhase: 2.2,
    driftSpeed: 0.13,
    color: 'rgba(42, 157, 143, 0.38)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 172, phase: 1.8, speed: 0.34 },
      { offsetX: -80, offsetY: -20, radius: 132, phase: 3.3, speed: 0.31 },
      { offsetX: 48, offsetY: 32, radius: 108, phase: 0.4, speed: 0.29 },
    ],
  },
  {
    anchorX: 0.08,
    anchorY: 0.72,
    driftPhase: 4.1,
    driftSpeed: 0.16,
    color: 'rgba(28, 117, 106, 0.28)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 144, phase: 2.5, speed: 0.39 },
      { offsetX: 72, offsetY: 52, radius: 112, phase: 1.2, speed: 0.35 },
    ],
  },
  {
    anchorX: 0.92,
    anchorY: 0.92,
    driftPhase: 0.5,
    driftSpeed: 0.12,
    color: 'rgba(82, 184, 168, 0.36)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 156, phase: 3.8, speed: 0.33 },
      { offsetX: -56, offsetY: -32, radius: 118, phase: 2.0, speed: 0.3 },
    ],
  },
  {
    anchorX: 0.44,
    anchorY: 0.78,
    driftPhase: 3.0,
    driftSpeed: 0.18,
    color: 'rgba(227, 247, 244, 0.55)',
    nodes: [
      { offsetX: 0, offsetY: 0, radius: 136, phase: 1.6, speed: 0.37 },
      { offsetX: 64, offsetY: 44, radius: 104, phase: 2.9, speed: 0.34 },
    ],
  },
]

function drawLivingField(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.clearRect(0, 0, width, height)

  for (const organism of ORGANISMS) {
    const anchorX =
      organism.anchorX * width +
      Math.sin(time * organism.driftSpeed + organism.driftPhase) * width * 0.07
    const anchorY =
      organism.anchorY * height +
      Math.cos(time * organism.driftSpeed * 0.85 + organism.driftPhase) * height * 0.06

    for (const node of organism.nodes) {
      const pulse = 1 + Math.sin(time * node.speed + node.phase) * 0.12
      const wobbleX = Math.sin(time * node.speed * 1.15 + node.phase) * 52
      const wobbleY = Math.cos(time * node.speed * 0.92 + node.phase * 1.3) * 44
      const x = anchorX + node.offsetX + wobbleX
      const y = anchorY + node.offsetY + wobbleY
      const radius = node.radius * pulse

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, organism.color)
      gradient.addColorStop(0.55, organism.color.replace(/[\d.]+\)$/, '0.12)'))
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.ellipse(
        x,
        y,
        radius * (1 + Math.sin(time * 0.35 + node.phase) * 0.08),
        radius * (1 + Math.cos(time * 0.28 + node.phase) * 0.1),
        Math.sin(time * 0.15 + node.phase) * 0.35,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  }
}

/** Fundo do login — campo orgânico contínuo (canvas) */
export function LoginAmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const start = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const frame = (now: number) => {
      const elapsed = (now - start) / 1000
      drawLivingField(ctx, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height, elapsed)
      if (!reducedMotion) raf = requestAnimationFrame(frame)
    }

    if (reducedMotion) {
      drawLivingField(ctx, canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height, 0)
    } else {
      raf = requestAnimationFrame(frame)
    }

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="login-ambient" aria-hidden>
      <canvas ref={canvasRef} className="login-ambient__canvas" />
    </div>
  )
}
