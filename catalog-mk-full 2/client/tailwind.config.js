/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Боите од логото на catalog.mk
        navy: {
          50: '#eef0f8',
          100: '#d9ddef',
          200: '#b0b7dc',
          300: '#7f89c2',
          400: '#525ea3',
          500: '#363f84',
          600: '#2a326c',
          700: '#232a5c',
          800: '#1f2456',
          900: '#171b42',
        },
        teal: {
          50: '#edfaf8',
          100: '#d2f2ee',
          200: '#a7e5de',
          300: '#76d4ca',
          400: '#4bc4b9',
          500: '#30a99e',
          600: '#258880',
          700: '#216d68',
          800: '#1f5754',
          900: '#1d4947',
        },
        viber: {
          DEFAULT: '#7360f2',
          dark: '#5b48d9',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,27,66,0.04), 0 4px 16px rgba(23,27,66,0.06)',
        sheet: '0 -8px 40px rgba(23,27,66,0.18)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        pop: 'pop 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
