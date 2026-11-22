const landingForest = {
  50: '#eff5ef',
  100: '#e5eee4',
  200: '#cfdfcf',
  300: '#b0ceb6',
  400: '#84ac8e',
  500: '#4f8465',
  600: '#3b7056',
  700: '#2e5f49',
  800: '#234d3b',
  900: '#173e32',
  950: '#0e2e25',
};

const landingNeutral = {
  50: '#f7f8f6',
  100: '#f2f3f1',
  200: '#e7e9e5',
  300: '#d8dcd7',
  400: '#b9bfba',
  500: '#919a93',
  600: '#727a74',
  700: '#535c55',
  800: '#39413b',
  900: '#232925',
  950: '#171c19',
};

const landingGold = {
  50: '#fcf8df',
  100: '#f8efbb',
  200: '#f2e381',
  300: '#ead455',
  400: '#dfbd39',
  500: '#cca52f',
  600: '#aa8526',
  700: '#83661f',
  800: '#5d491d',
  900: '#3b3018',
  950: '#252014',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shared landing-page colors for Tailwind's existing component classes.
        emerald: landingForest,
        green: landingForest,
        teal: landingForest,
        blue: landingForest,
        indigo: landingForest,
        slate: landingNeutral,
        gray: landingNeutral,
        amber: landingGold,

        // ── Core Brand Palette ────────────────────────────────
        // SolarCare forest palette shared with the landing page
        brand: {
          50:  '#f1f5ef',
          100: '#e5eee4',
          200: '#cfdfcf',
          300: '#b0ceb6',
          400: '#84ac8e',
          500: '#4f8465',
          600: '#3b7056',
          700: '#2e5f49',
          800: '#234d3b',
          900: '#173e32',
          950: '#0e2e25',
          // Legacy aliases kept for existing components
          dark:    '#234d3b',
          darker:  '#173e32',
          darkest: '#0e2e25',
          accent:  '#4f8465',
          light:   '#f1f5ef',
          border:  '#cfdfcf',
        },

        // ── Primary interactive colour ─────────────────────────
        primary: {
          DEFAULT: '#3b7056',
          hover:   '#2e5f49',
          light:   '#eff5ef',
        },

        // ── Page surfaces ──────────────────────────────────────
        surface: {
          page:        '#f2f3f1',      // landing-page neutral canvas
          card:        '#ffffff',
          cardHover:   '#eff5ef',
          border:      '#e7e9e5',
          borderLight: '#eff5ef',
          sidebar:     '#173e32',
          sidebarDeep: '#0e2e25',
          sidebarItem: '#234d3b',
          dark:        '#0a0f1a',      // hero dark section bg
          darkCard:    '#111827',
          darkBorder:  'rgba(255,255,255,0.08)',
        },

        // ── Typography ─────────────────────────────────────────
        ink: {
          DEFAULT: '#191d1a',
          strong:  '#171c19',
          muted:   '#727a74',
          subtle:  '#919a93',
          white:   '#f7f8f6',
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
        'brand-sm':  '0 2px 8px rgba(46, 95, 73, 0.12)',
        'brand-md':  '0 8px 24px rgba(46, 95, 73, 0.16)',
        'brand-lg':  '0 16px 48px rgba(46, 95, 73, 0.22)',
        'card':      '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover':'0 8px 32px rgba(46, 95, 73, 0.12)',
        'dark-card': '0 4px 24px rgba(0,0,0,0.3)',
      },

      // ── Background Gradients ───────────────────────────────────
      backgroundImage: {
        'hero-dark': 'linear-gradient(160deg, #0a0f1a 0%, #0d1f2d 50%, #071a12 100%)',
        'brand-gradient': 'linear-gradient(135deg, #2e5f49 0%, #4f8465 100%)',
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
