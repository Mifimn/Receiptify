/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // We map these names to your CSS variables
        brand: {
          black: 'var(--primary)',
          gray: 'var(--secondary)',
          bg: 'var(--background)',
          paper: 'var(--paper)',
          border: 'var(--accent)',
        }
      },
      fontFamily: {
        mono: ['monospace'], 
      },
    },
  },
  plugins: [],
}
