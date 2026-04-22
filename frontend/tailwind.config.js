module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { orange: '#F57C00', green: '#388E3C', brown: '#5D4037' },
        secondary: { gray: '#757575', light: '#F5F5F5' },
        status: { success: '#4CAF50', warning: '#FFC107', error: '#F44336', info: '#2196F3' },
        ethiopian: { yellow: '#FCD116', green: '#078930', red: '#DA121A' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        amharic: ['Noto Sans Ethiopic', 'Nyala', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
