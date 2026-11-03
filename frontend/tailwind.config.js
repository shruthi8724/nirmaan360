/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0F172A',
          darkBlue: '#1E293B',
          steel: '#334155',
          steelLight: '#475569',
          amber: '#D97706',
          amberLight: '#F59E0B',
          safety: '#0284C7',
          surface: '#F8FAFC',
          border: '#E2E8F0',
        },
      },
    },
  },
  plugins: [],
}
