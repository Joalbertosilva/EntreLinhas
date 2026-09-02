/** Fundo do login — gradiente mint + cena inferior (livros) */
export function LoginAmbientBackground() {
  return (
    <div className="login-ambient" aria-hidden>
      <svg
        className="login-ambient__scene"
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 320 L0 248 Q240 200 480 248 T960 228 T1440 260 L1440 320 Z"
          fill="#6ec4b5"
          opacity="0.32"
        />
        <path
          d="M0 320 L0 272 Q320 230 720 268 T1440 248 L1440 320 Z"
          fill="#52b8a8"
          opacity="0.4"
        />

        <g opacity="0.55" transform="translate(120 175)">
          <path d="M0 8 C0 0 8 0 24 0 H88 C96 0 104 4 104 12 V120 C96 112 88 108 72 108 H24 C8 108 0 104 0 96 Z" fill="#1a3342" />
          <path d="M104 12 C104 4 112 0 128 0 H192 C200 0 208 4 208 12 V120 C200 112 192 108 176 108 H128 C112 108 104 104 104 96 Z" fill="#2a9d8f" />
          <path d="M104 12 V120" stroke="#fafefc" strokeWidth="1.5" opacity="0.6" />
          <path d="M16 28 H88 M16 44 H72 M16 60 H80" stroke="#fafefc" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
          <path d="M120 28 H192 M120 44 H176 M120 60 H184" stroke="#fafefc" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
        </g>

        <g opacity="0.45" transform="translate(620 190) rotate(-6)">
          <rect x="0" y="0" width="72" height="96" rx="4" fill="#fafefc" stroke="#1a3342" strokeWidth="1.5" strokeOpacity="0.2" />
          <path d="M12 20 H60 M12 34 H52 M12 48 H56" stroke="#2a9d8f" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        </g>
        <g opacity="0.4" transform="translate(700 200) rotate(8)">
          <rect x="0" y="0" width="64" height="88" rx="4" fill="#fafefc" stroke="#efb034" strokeWidth="1.5" strokeOpacity="0.35" />
          <path d="M10 18 H54 M10 32 H46" stroke="#1a3342" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
        </g>

        <g opacity="0.5" transform="translate(1120 210) rotate(-18)">
          <rect x="0" y="36" width="100" height="8" rx="4" fill="#1a3342" opacity="0.65" />
          <path d="M96 40 L118 32 L122 44 L100 48 Z" fill="#efb034" />
        </g>
      </svg>
    </div>
  )
}
