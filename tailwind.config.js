/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0A0A0F',          // near-black page background
        surface: '#0D0D14',       // deep charcoal card background
        ink: '#F5F5F7',           // off-white headings
        muted: '#A1A1AA',         // muted gray body copy
        accent: {
          violet: '#7C3AED',      // primary gradient start
          cyan: '#22D3EE',        // primary gradient end
          pink: '#EC4899',        // secondary pop / hover
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(90deg, #7C3AED 0%, #22D3EE 100%)',
        'gradient-accent-diag': 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 100%)',
      },
      boxShadow: {
        glow: '0 0 45px -8px rgba(124, 58, 237, 0.45)',
        'glow-cyan': '0 0 45px -8px rgba(34, 211, 238, 0.4)',
        'glow-pink': '0 0 45px -8px rgba(236, 72, 153, 0.4)',
      },
      animation: {
        'spin-slow': 'spin 14s linear infinite',
        'pulse-soft': 'pulse 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
