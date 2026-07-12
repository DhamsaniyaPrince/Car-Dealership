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
        // Deep obsidian dark tones
        obsidian: {
          950: '#04050a',
          900: '#08090d',
          850: '#0d0f14',
          800: '#13151c',
          750: '#181b24',
          700: '#1a1d26',
          600: '#22263a',
          500: '#2e3348',
        },
        // Legacy brand (navy blue) — kept for backward compat
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c0d2ff',
          300: '#91b0ff',
          400: '#5b87ff',
          500: '#3d7fff',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0d1b45',
        },
        // Liquid gold accent
        gold: {
          50: '#fdf9ed',
          100: '#faf0cc',
          200: '#f5e09a',
          300: '#eecf68',
          400: '#e2c044',
          500: '#c9a84c',
          600: '#b8922d',
          700: '#9a7421',
          800: '#7c5c1c',
          900: '#5c4214',
        },
        // Legacy accent (amber) — kept for backward compat
        accent: {
          50: '#fefbeb',
          100: '#fef3c7',
          200: '#fde58a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Electric blue for highlights
        electric: {
          400: '#60a5fa',
          500: '#3d7fff',
          600: '#2563eb',
        },
        silver: {
          100: '#f0f2f6',
          200: '#e2e6ee',
          300: '#c4cdd8',
          400: '#8a9ab0',
          500: '#64748b',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-shimmer': 'linear-gradient(105deg, transparent 40%, rgba(201,168,76,0.4) 50%, transparent 60%)',
        'obsidian-gradient': 'linear-gradient(135deg, #08090d 0%, #13151c 50%, #0d0f14 100%)',
        'hero-overlay': 'linear-gradient(to right, rgba(8,9,13,0.95) 0%, rgba(8,9,13,0.7) 50%, rgba(8,9,13,0.2) 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-delayed': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        streak: {
          '0%': { transform: 'translateX(-100%) skewX(-20deg)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translateX(200%) skewX(-20deg)', opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.3)', opacity: '1' },
          '50%': { boxShadow: '0 0 40px rgba(201,168,76,0.6)', opacity: '0.9' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(201,168,76,0.3)' },
          '50%': { borderColor: 'rgba(201,168,76,0.7)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'counter-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'particle-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.6' },
          '25%': { transform: 'translate(10px, -20px) scale(1.1)', opacity: '0.8' },
          '50%': { transform: 'translate(-5px, -35px) scale(0.9)', opacity: '0.4' },
          '75%': { transform: 'translate(-15px, -15px) scale(1.05)', opacity: '0.7' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        'float-delayed': 'float-delayed 5s ease-in-out infinite 1s',
        shimmer: 'shimmer 2s linear infinite',
        streak: 'streak 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'border-glow': 'border-glow 2s ease-in-out infinite',
        marquee: 'marquee 25s linear infinite',
        'counter-up': 'counter-up 0.4s ease-out',
        ripple: 'ripple 0.6s linear',
        'particle-float': 'particle-float 6s ease-in-out infinite',
      },
      boxShadow: {
        'gold-sm': '0 0 10px rgba(201,168,76,0.2)',
        'gold-md': '0 0 20px rgba(201,168,76,0.35)',
        'gold-lg': '0 0 40px rgba(201,168,76,0.4)',
        'gold-xl': '0 0 60px rgba(201,168,76,0.5)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 20px 60px rgba(0,0,0,0.5)',
        'premium': '0 25px 80px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
        'inner-glass': 'inset 0 1px 0 rgba(255,255,255,0.05)',
        'electric': '0 0 20px rgba(61,127,255,0.4)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '4px',
        xxs: '2px',
      },
      fontSize: {
        'xxs': ['0.65rem', { lineHeight: '1rem' }],
        'tiny': ['0.6rem', { lineHeight: '0.9rem' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
