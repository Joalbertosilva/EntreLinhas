/** Paleta alinhada ao site EntreLinhas — navy como base, verde como acento de leitura/progresso. */
export const BRAND = {
  navy: '#1a3342',
  navyMid: '#243d4d',
  navySoft: '#2f5163',
  gold: '#efb034',
  primary: '#1c756a',
  primaryLight: '#e3f7f4',
  textMuted: '#5a7282',
  border: '#cdd9e3',
  borderSoft: '#dce6ee',
} as const

/** Fundo das telas principais — azul-acinzentado suave (como o site), não verde dominante. */
export const PLATFORM_GRADIENT = ['#fafefd', '#eef3f9', '#e4edf6', '#ffffff'] as const
export const PLATFORM_GRADIENT_LOCATIONS = [0, 0.38, 0.72, 1] as const

/** Splash / abertura — mescla navy, azul claro e toque mint. */
export const SPLASH_GRADIENT = ['#f8fbfe', '#e8f0f8', '#dceaf2', '#eef7f4', '#ffffff'] as const
export const SPLASH_GRADIENT_LOCATIONS = [0, 0.28, 0.52, 0.78, 1] as const

/** Menu lateral — navy profundo com leve transição (não verde sólido). */
export const DRAWER_GRADIENT = ['#1a3342', '#243d4d', '#2a4f5e', '#1c756a'] as const
export const DRAWER_GRADIENT_LOCATIONS = [0, 0.45, 0.82, 1] as const
