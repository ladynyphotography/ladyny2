/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
       gold: {
  50: '#fff1f7',
  100: '#ffd9e8',
  200: '#ffb3d1',
  300: '#ff8cba',
  400: '#ff73ab',
  500: '#f5619b',
  600: '#db4f87',
  700: '#b83f70',
  800: '#942f59',
  900: '#732345',
},
        cream: {
          50: '#fdfcfb',
          100: '#F9F5F0',
          200: '#F5F0EB',
          300: '#ede4d8',
          400: '#dfd0be',
          500: '#c9b49a',
          600: '#b09278',
          700: '#927660',
          800: '#785f4f',
          900: '#624e41',
        },
        charcoal: {
          50: '#f4f4f4',
          100: '#e8e8e8',
          200: '#d0d0d0',
          300: '#a8a8a8',
          400: '#808080',
          500: '#585858',
          600: '#404040',
          700: '#303030',
          800: '#1e1e1e',
          900: '#111111',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Cormorant Garamond"', '"Inter"', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out forwards',
        'fade-up': 'fadeUp 1s ease-out forwards',
        'fade-up-delay': 'fadeUp 1s ease-out 0.3s forwards',
        'fade-up-delay2': 'fadeUp 1s ease-out 0.6s forwards',
        'fade-up-delay3': 'fadeUp 1s ease-out 0.9s forwards',
        'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'kenburns': 'kenburns 8s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        kenburns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.08) translate(-2%, -1%)' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C, #e4c97a, #C9A84C)',
      },
    },
  },
  plugins: [],
};
