/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm & Cozy Café Design
        primary: {
          DEFAULT: '#FF8360', // Warm coral
          50: '#fff5f3',
          100: '#ffe8e3',
          200: '#ffd5cc',
          300: '#ffb8a6',
          400: '#ff9573',
          500: '#FF8360', // Main warm coral
          600: '#e6754f',
          700: '#cc6742',
          800: '#b35938',
          900: '#994b2f',
        },
        secondary: {
          DEFAULT: '#5EB1BF', // Muted teal
          50: '#f0f9fa',
          100: '#d0eff3',
          200: '#a8dfe7',
          300: '#7ccfdb',
          400: '#5EB1BF', // Main muted teal
          500: '#4d99a5',
          600: '#42818b',
          700: '#396973',
          800: '#30545c',
          900: '#28454b',
        },
        accent: {
          DEFAULT: '#FFD166', // Golden yellow
          50: '#fffef0',
          100: '#fffce0',
          200: '#fff8b8',
          300: '#fff285',
          400: '#FFE066',
          500: '#FFD166', // Main golden yellow
          600: '#e6ba4d',
          700: '#cca33a',
          800: '#b38c2f',
          900: '#997529',
        },
        cream: '#FFF8F3', // Soft cream background
        charcoal: '#333333', // Text primary
        gray: {
          DEFAULT: '#777777', // Text secondary
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#777777',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        'warm-gray': {
          DEFAULT: '#EAEAEA', // Borders / Cards
          light: '#F5F5F5',
          dark: '#D4D4D4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'warm': '0 4px 12px rgba(255, 131, 96, 0.15)',
      },
    },
  },
  plugins: [],
}

