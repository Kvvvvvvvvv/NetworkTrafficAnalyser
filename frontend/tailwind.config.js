/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-dark': '#0a0a0a',
        'cyber-darker': '#050505',
        'cyber-grid': '#1a1a2e',
        'cyber-neon': {
          green: '#00ff9d',
          blue: '#00eeff',
          purple: '#bd00ff',
          pink: '#ff00c8',
          yellow: '#fdee00',
          red: '#ff003c',
        },
        'cyber-gray': {
          900: '#0a0a0a',
          800: '#121212',
          700: '#1a1a1a',
          600: '#2a2a2a',
          500: '#3a3a3a',
        }
      },
      fontFamily: {
        'mono': ['"JetBrains Mono"', 'monospace'],
        'sans': ['"Roboto Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-green': '0 0 5px theme("colors.cyber-neon.green"), 0 0 20px theme("colors.cyber-neon.green")',
        'neon-blue': '0 0 5px theme("colors.cyber-neon.blue"), 0 0 20px theme("colors.cyber-neon.blue")',
        'neon-purple': '0 0 5px theme("colors.cyber-neon.purple"), 0 0 20px theme("colors.cyber-neon.purple")',
        'neon-glow': '0 0 5px currentColor, 0 0 10px currentColor',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { opacity: 0.7 },
          '100%': { opacity: 1 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
  safelist: [
    'bg-cyber-dark-bg',
    'text-cyber-neon-green',
    'text-cyber-neon-blue',
    'text-cyber-neon-purple',
    'text-cyber-neon-pink',
    'text-cyber-neon-yellow',
    'text-cyber-neon-red',
    'border-cyber-border',
    'bg-cyber-card-bg',
    'bg-cyber-gray-700',
    'bg-cyber-gray-800',
    'bg-cyber-neon-green',
    'bg-cyber-neon-blue',
    'bg-cyber-neon-purple',
    'bg-cyber-neon-pink',
    'bg-cyber-neon-yellow',
    'bg-cyber-neon-red',
  ]
}