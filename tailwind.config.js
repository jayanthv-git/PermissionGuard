/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pg: {
          bg: '#070A12',
          surface: '#0B1020',
          elevated: '#10162A',
          card: '#131A33',
          border: '#1E294B',
          borderLight: '#2A3766',
          cyan: '#46E5FF',
          violet: '#8B7CFF',
          emerald: '#10B981',
          amber: '#F59E0B',
          red: '#EF4444',
          muted: '#94A3B8',
          subtle: '#64748B',
        },
        dark: {
          950: '#070A12',
          900: '#0B1020',
          850: '#10162A',
          800: '#151E38',
          750: '#1C2647',
          700: '#2A3756',
        },
        cyan: {
          DEFAULT: '#46E5FF',
          glow: '#46E5FF',
        },
        violet: {
          DEFAULT: '#8B7CFF',
          glow: '#8B7CFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(70, 229, 255, 0.25)',
        'glow-violet': '0 0 25px -5px rgba(139, 124, 255, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.25)',
        'card-elevated': '0 8px 30px rgba(3, 5, 10, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 30s linear infinite',
        'reverse-spin': 'reverse-spin 40s linear infinite',
      },
      keyframes: {
        'reverse-spin': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
}
