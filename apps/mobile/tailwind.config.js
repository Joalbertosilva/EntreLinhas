/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1c756a',
          hover: '#155a52',
          dark: '#124a44',
          light: '#e3f7f4',
          soft: '#2a9d8f',
          solid: '#1c756a',
        },
        accent: {
          DEFAULT: '#efb034',
          hover: '#d99a2a',
          light: '#fef6e4',
        },
        text: {
          DEFAULT: '#1a3342',
          muted: '#5a7282',
        },
        surface: {
          DEFAULT: '#ffffff',
          warm: '#f7fdfc',
        },
        border: '#cdd9e3',
        sky: {
          DEFAULT: '#eef3f9',
          light: '#f4f8fc',
          mid: '#e4edf6',
        },
        brand: {
          navy: '#1a3342',
          'navy-mid': '#243d4d',
          gold: '#efb034',
        },
        error: '#dc2626',
        success: '#15803d',
      },
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
        'sans-medium': ['PlusJakartaSans_500Medium'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold'],
        'sans-bold': ['PlusJakartaSans_700Bold'],
      },
    },
  },
  plugins: [],
}
