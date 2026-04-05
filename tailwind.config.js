/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#f97316',
          hover: '#ea6a10',
          glow: 'rgba(249, 115, 22, 0.15)',
          subtle: 'rgba(249, 115, 22, 0.08)',
        },
        surface: {
          dark: '#111111',
          card: '#1a1a1a',
          'card-hover': '#1f1f1f',
        },
        border: {
          DEFAULT: '#2a2a2a',
          light: '#333333',
        },
        success: '#22c55e',
        danger: '#ef4444',
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'orange': '0 4px 20px rgba(249, 115, 22, 0.25)',
        'card': '0 1px 2px rgba(0,0,0,0.3)',
        'card-md': '0 4px 12px rgba(0,0,0,0.4)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease',
        'msg-fade-in': 'msgFadeIn 0.3s ease',
        'pulse-orange': 'pulseOrange 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        msgFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseOrange: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(249, 115, 22, 0)' },
        },
      },
    },
  },
  plugins: [],
}
