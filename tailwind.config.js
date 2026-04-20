/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:  '#0B1628',
        lime:  '#C4FF5E',
        lime2: '#8FCC1A',
      },
      fontFamily: {
        bebas: ['var(--font-bebas)'],
      },
    },
  },
  plugins: [],
}
