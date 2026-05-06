/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
        danger: '#EF4444',
        dark: {
          DEFAULT: '#0F172A',
          card: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Noto Sans', 'Noto Sans Kannada', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
