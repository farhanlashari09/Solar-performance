/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Core Brand Palette ────────────────────────────────
        // Forest-to-Emerald professional green scale
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',   // primary action
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
          // Legacy aliases kept for existing components
          dark:    '#064e3b',
          darker:  '#043d2e',
          darkest: '#022c22',
          accent:  '#10b981',
          light:   '#ecfdf5',
          border:  '#d1fae5',
        },

        // ── Primary interactive colour ─────────────────────────
        primary: {
          DEFAULT: '#059669',
          hover:   '#047857',
          light:   '#ecfdf5',
        },

        // ── Page surfaces ──────────────────────────────────────
        surface: {
          page:        '#f8fafc',      // lightest app background
          card:        '#ffffff',
          cardHover:   '#f0fdf4',
          border:      '#e5e7eb',
          borderLight: '#f0fdf4',
          sidebar:     '#064e3b',      // deep forest green sidebar
          sidebarDeep: '#043d2e',
          sidebarItem: '#065f46',
          dark:        '#0a0f1a',      // hero dark section bg
          darkCard:    '#111827',
          darkBorder:  'rgba(255,255,255,0.08)',
        },

        // ── Typography ─────────────────────────────────────────
        ink: {
          DEFAULT: '#111827',
          strong:  '#030712',
          muted:   '#6b7280',
          subtle:  '#9ca3af',
          white:   '#f9fafb',
        },

        // ── Accent: Solar Gold ─────────────────────────────────
        solar: {
          DEFAULT: '#f59e0b',
          light:   '#fef3c7',
          soft:    '#fde68a',
          strong:  '#b45309',
          dark:    '#78350f',
        },

        // ── Alert Severity ─────────────────────────────────────
        alert: {
          high:       '#dc2626',
          highSoft:   '#fee2e2',
          medium:     '#ea580c',
          mediumSoft: '#ffedd5',
          low:        '#2563eb',
          lowSoft:    '#dbeafe',
        },

        // ── Chart: Load / Consumption ──────────────────────────
        load: {
          DEFAULT: '#6b7280',
          soft:    '#f3f4f6',
        },

        // ── Legacy aliases (do not remove — used in charts) ────
        solarAmber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        solarRed: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },

      // ── Typography ─────────────────────────────────────────────
      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        urdu:  ['"Noto Nastaliq Urdu"', '"Noto Sans Arabic"', 'Arial', 'sans-serif'],
        mono:  ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'monospace'],
      },
      lineHeight: {
        urdu: '2.4',
      },

      // ── Box Shadows ────────────────────────────────────────────
      boxShadow: {
        'brand-sm':  '0 2px 8px rgba(5, 150, 105, 0.15)',
        'brand-md':  '0 8px 24px rgba(5, 150, 105, 0.20)',
        'brand-lg':  '0 16px 48px rgba(5, 150, 105, 0.28)',
        'card':      '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover':'0 8px 32px rgba(5, 150, 105, 0.12)',
        'dark-card': '0 4px 24px rgba(0,0,0,0.3)',
      },

      // ── Background Gradients ───────────────────────────────────
      backgroundImage: {
        'hero-dark': 'linear-gradient(160deg, #0a0f1a 0%, #0d1f2d 50%, #071a12 100%)',
        'brand-gradient': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gold-gradient':  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'card-dark': 'linear-gradient(135deg, #111827 0%, #1a2535 100%)',
      },

      // ── Spacing & Sizes ────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ── Keyframes ─────────────────────────────────────────────
      keyframes: {
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 12s linear infinite',
        'fade-in':   'fade-in 0.4s ease-out both',
        'slide-up':  'slide-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
