import { cn } from '@/lib/utils'

interface SiteWeaveArtProps {
  variant?: 'login' | 'rail'
  className?: string
}

/** Tons pastéis — login em tela cheia */
const PASTEL = {
  navy: '#c5d8eb',
  blue: '#b8d4f2',
  gold: '#f2e4c4',
  white: '#ffffff',
} as const

export function SiteWeaveArt({ variant = 'login', className }: SiteWeaveArtProps) {
  if (variant === 'rail') {
    return (
      <svg
        className={cn(className)}
        viewBox="0 0 480 48"
        preserveAspectRatio="none"
        aria-hidden
      >
        <rect width="480" height="48" fill="#efb034" />
        <path
          fill="#003366"
          d="M-12 0 L492 0 L492 16 C464 12, 432 18, 384 14 C320 10, 256 18, 192 12 C128 6, 64 14, -12 10 L-12 0 Z"
        />
        <path
          fill="#003366"
          d="M-12 6 C64 12, 128 2, 192 8 C256 14, 320 4, 384 10 C432 14, 464 6, 492 8 L492 18 C464 14, 432 20, 384 16 C320 12, 256 20, 192 14 C128 8, 64 16, -12 12 Z"
        />
        <path
          fill="#0066cc"
          d="M-12 14 C72 20, 136 10, 208 16 C280 22, 344 12, 416 18 C448 20, 472 14, 492 16 L492 30 C472 28, 448 32, 416 28 C344 22, 280 30, 208 24 C136 18, 72 26, -12 22 Z"
        />
        <path
          fill="#0066cc"
          d="M-12 22 C80 28, 152 18, 224 24 C296 30, 368 20, 492 26 L492 34 C368 28, 296 36, 224 30 C152 24, 80 32, -12 28 Z"
        />
        <path
          fill="#efb034"
          d="M-12 28 C88 34, 160 24, 232 30 C304 36, 376 26, 492 32 L492 48 L-12 48 Z"
        />
      </svg>
    )
  }

  return (
    <svg
      className={cn(className)}
      viewBox="0 0 1440 960"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="1440" height="960" fill={PASTEL.white} />
      <path
        fill={PASTEL.navy}
        d="M-40 72 C180 132 360 52 580 92 C800 132 1020 62 1240 102 C1340 122 1400 82 1480 98 L1480 188 C1400 172 1340 212 1240 192 C1020 152 800 222 580 182 C360 142 180 222 -40 182 Z"
      />
      <path
        fill={PASTEL.white}
        d="M-40 168 C220 208 460 148 720 188 C980 228 1220 168 1480 208 L1480 228 C1220 188 980 248 720 208 C460 168 220 228 -40 188 Z"
      />
      <path
        fill={PASTEL.blue}
        d="M-40 208 C240 168 480 248 720 208 C960 168 1200 238 1480 198 L1480 288 C1200 328 960 258 720 298 C480 338 240 258 -40 298 Z"
      />
      <path
        fill={PASTEL.white}
        d="M-40 278 C280 318 560 258 840 298 C1120 338 1300 278 1480 308 L1480 328 C1300 298 1120 358 840 318 C560 278 280 338 -40 298 Z"
      />
      <path
        fill={PASTEL.gold}
        d="M-40 318 C300 358 540 298 780 338 C1020 378 1260 318 1480 358 L1480 448 C1260 408 1020 468 780 428 C540 388 300 448 -40 408 Z"
      />
      <path
        fill={PASTEL.navy}
        d="M-40 512 C200 572 420 492 640 532 C860 572 1080 502 1300 542 C1380 562 1440 522 1480 538 L1480 628 C1440 612 1380 652 1300 632 C1080 592 860 662 640 622 C420 582 200 662 -40 622 Z"
      />
      <path
        fill={PASTEL.white}
        d="M-40 608 C240 648 520 588 800 628 C1080 668 1260 608 1480 638 L1480 658 C1260 628 1080 688 800 648 C520 608 240 668 -40 628 Z"
      />
      <path
        fill={PASTEL.blue}
        d="M-40 648 C260 608 500 688 740 648 C980 608 1220 678 1480 638 L1480 728 C1220 768 980 698 740 738 C500 778 260 698 -40 738 Z"
      />
      <path
        fill={PASTEL.white}
        d="M-40 718 C300 758 580 698 860 738 C1140 778 1320 718 1480 748 L1480 768 C1320 738 1140 798 860 758 C580 718 300 778 -40 738 Z"
      />
      <path
        fill={PASTEL.gold}
        d="M-40 758 C320 798 560 738 800 778 C1040 818 1280 758 1480 798 L1480 888 C1280 848 1040 908 800 868 C560 828 320 888 -40 848 Z"
      />
    </svg>
  )
}
