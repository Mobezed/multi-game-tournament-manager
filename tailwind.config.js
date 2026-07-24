/** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          fontFamily: {
            heading: ['Rajdhani', 'sans-serif'],
            body: ['Inter', 'sans-serif'],
          },
          colors: {
            'game-bg': '#0D0F14',
            'game-surface': '#1A1D24',
            'game-card': '#1F2229',
            'game-electric': '#00C2FF',
            'game-gold': '#F0B429',
            'game-red': '#FF3B3B',
            'game-border': '#2A2D35',
            'game-text': '#E4E6EA',
            'game-muted': '#9CA3AF',
          },
          boxShadow: {
            'neon': '0 0 10px rgba(0,194,255,0.3), 0 0 20px rgba(0,194,255,0.1)',
            'neon-gold': '0 0 10px rgba(240,180,41,0.3), 0 0 20px rgba(240,180,41,0.1)',
            'neon-red': '0 0 10px rgba(255,59,59,0.3), 0 0 20px rgba(255,59,59,0.1)',
          },
        },
      },
      plugins: [],
    }
