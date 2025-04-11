import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'bounce-x': 'bounceX 1s infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'pulse-slow': 'slowPulse 6s ease-in-out infinite',
        'pulse-slow-2': 'slowPulse2 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        bounceX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(4px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        slowPulse: {
          '0%, 100%': { opacity: '0.1', transform: 'scale(1)' },
          '50%': { opacity: '0.2', transform: 'scale(1.05)' },
        },
        slowPulse2: {
          '0%, 100%': { opacity: '0.1', transform: 'scale(1)' },
          '50%': { opacity: '0.15', transform: 'scale(1.08)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 15px rgba(66, 153, 225, 0.5)',
        'none': 'none',
      },
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      backgroundImage: {
        'gradient-to-t': 'linear-gradient(to top, var(--tw-gradient-stops))',
        'gradient-to-tr': 'linear-gradient(to top right, var(--tw-gradient-stops))',
        'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
        'gradient-to-b': 'linear-gradient(to bottom, var(--tw-gradient-stops))',
        'gradient-to-bl': 'linear-gradient(to bottom left, var(--tw-gradient-stops))',
        'gradient-to-l': 'linear-gradient(to left, var(--tw-gradient-stops))',
        'gradient-to-tl': 'linear-gradient(to top left, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    require('tailwindcss/plugin')(({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) => {
      addUtilities({
        '.from-blue-600': {
          '--tw-gradient-from': '#2563eb',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(37 99 235 / 0))'
        },
        '.to-purple-600': {
          '--tw-gradient-to': '#9333ea'
        },
        '.from-gray-50': {
          '--tw-gradient-from': '#f9fafb',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(249 250 251 / 0))'
        },
        '.to-gray-100': {
          '--tw-gradient-to': '#f3f4f6'
        },
        '.from-gray-900': {
          '--tw-gradient-from': '#111827',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(17 24 39 / 0))'
        },
        '.to-gray-800': {
          '--tw-gradient-to': '#1f2937'
        },
        '.from-blue-500': {
          '--tw-gradient-from': '#3b82f6',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(59 130 246 / 0))'
        },
        '.to-blue-600': {
          '--tw-gradient-to': '#2563eb'
        },
        '.from-purple-500': {
          '--tw-gradient-from': '#8b5cf6',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(139 92 246 / 0))'
        },
        '.to-purple-600-alt': {
          '--tw-gradient-to': '#9333ea'
        },
        '.from-red-500': {
          '--tw-gradient-from': '#ef4444',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(239 68 68 / 0))'
        },
        '.to-red-600': {
          '--tw-gradient-to': '#dc2626'
        },
        '.from-red-600': {
          '--tw-gradient-from': '#dc2626',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(220 38 38 / 0))'
        },
        '.to-red-700': {
          '--tw-gradient-to': '#b91c1c'
        },
        '.via-purple-500': {
          '--tw-gradient-stops': 'var(--tw-gradient-from), #8b5cf6, var(--tw-gradient-to, rgb(139 92 246 / 0))'
        },
        '.to-pink-500': {
          '--tw-gradient-to': '#ec4899'
        },
        '.from-blue-600/20': {
          '--tw-gradient-from': 'rgb(37 99 235 / 0.2)',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(37 99 235 / 0))'
        },
        '.to-purple-600/20': {
          '--tw-gradient-to': 'rgb(147 51 234 / 0.2)'
        },
        '.from-blue-500/10': {
          '--tw-gradient-from': 'rgb(59 130 246 / 0.1)',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(59 130 246 / 0))'
        },
        '.from-blue-500/20': {
          '--tw-gradient-from': 'rgb(59 130 246 / 0.2)',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(59 130 246 / 0))'
        },
        '.from-purple-500/10': {
          '--tw-gradient-from': 'rgb(139 92 246 / 0.1)',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(139 92 246 / 0))'
        },
        '.from-purple-500/20': {
          '--tw-gradient-from': 'rgb(139 92 246 / 0.2)',
          '--tw-gradient-stops': 'var(--tw-gradient-from), var(--tw-gradient-to, rgb(139 92 246 / 0))'
        },
      })
    })
  ],
};

export default config; 