/** Detalhes visuais sutis — leitura, linhas e páginas */
export function LoginHeroDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-navy/[0.04] xl:h-80 xl:w-80" />

      <svg
        className="absolute left-1/2 top-[38%] h-24 w-28 -translate-x-1/2 -translate-y-1/2 text-brand-navy/[0.07] xl:h-28 xl:w-32"
        viewBox="0 0 112 96"
        fill="none"
        aria-hidden
      >
        <path
          d="M8 12C8 8 12 6 20 6H52C58 6 62 8 62 12V84C58 80 52 78 44 78H20C12 78 8 76 8 72V12Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M104 12C104 8 100 6 92 6H60C54 6 50 8 50 12V84C54 80 60 78 68 78H92C100 78 104 76 104 72V12Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M56 12V84" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" opacity="0.5" />
      </svg>

      <svg
        className="absolute right-[8%] top-[14%] h-16 w-20 text-brand-navy/12 xl:right-[10%]"
        viewBox="0 0 80 64"
        fill="none"
      >
        <rect x="0" y="4" width="56" height="3" rx="1.5" fill="currentColor" />
        <rect x="0" y="16" width="72" height="3" rx="1.5" fill="currentColor" />
        <rect x="0" y="28" width="44" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
        <rect x="52" y="28" width="20" height="3" rx="1.5" className="fill-brand-gold/35" />
        <rect x="0" y="40" width="64" height="3" rx="1.5" fill="currentColor" opacity="0.5" />
      </svg>

      <svg
        className="absolute bottom-[28%] left-[6%] h-14 w-16 text-brand-navy/12 xl:left-[8%]"
        viewBox="0 0 64 56"
        fill="none"
      >
        <rect x="0" y="0" width="48" height="3" rx="1.5" fill="currentColor" />
        <rect x="0" y="12" width="60" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
        <rect x="0" y="24" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
      </svg>

      <div className="absolute right-[14%] bottom-[22%] h-14 w-11 rotate-6 rounded-md border border-brand-navy/10 bg-white/55 shadow-[var(--shadow-soft)] xl:right-[16%]" />
      <div className="absolute left-[10%] top-[20%] h-12 w-9 -rotate-12 rounded-md border border-brand-navy/8 bg-white/45 xl:left-[12%]" />
    </div>
  )
}
