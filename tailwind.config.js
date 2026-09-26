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
        app: '#0e0f14',
        surface: '#14151c',
        card: '#181a22',
        'card-hover': '#1f212c',
        border: 'rgba(255, 255, 255, 0.08)',
        'border-active': 'rgba(255, 255, 255, 0.16)',
        accent: {
          DEFAULT: '#6366f1', // soft indigo
          hover: '#4f46e5',
          muted: 'rgba(99, 102, 241, 0.12)',
          border: 'rgba(99, 102, 241, 0.28)'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'card': '0 4px 12px 0 rgba(0, 0, 0, 0.35)',
        'dropdown': '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
      },
      keyframes: {
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      },
      animation: {
        slideLeft: 'slideLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        fadeIn: 'fadeIn 0.18s ease-out',
        scaleIn: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
