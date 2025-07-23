/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'trippat': {
          'primary-1': '#113c5a',     // Main Color 1
          'primary-2': '#f0ee8a',     // Main Color 2
          'secondary-1': '#a1cee8',   // Secondary Color 1
          'secondary-2': '#4391a3',   // Secondary Color 2
          'secondary-3': '#ffffff',   // Secondary Color 3
        },
        // Semantic colors mapped to brand colors
        'primary': {
          DEFAULT: '#113c5a',
          50: '#e6ecf0',
          100: '#c0d1db',
          200: '#8bafc4',
          300: '#5d8fad',
          400: '#3a6f96',
          500: '#113c5a',
          600: '#0e334e',
          700: '#0b2a42',
          800: '#082236',
          900: '#05192a',
        },
        'secondary': {
          DEFAULT: '#f0ee8a',
          50: '#fdfdf5',
          100: '#fbfbe6',
          200: '#f7f6c4',
          300: '#f3f2a2',
          400: '#f0ee8a',
          500: '#e8e65f',
          600: '#d9d635',
          700: '#b8b328',
          800: '#8f8a20',
          900: '#5e5a15',
        },
        'accent': {
          DEFAULT: '#4391a3',
          50: '#edf5f7',
          100: '#d4e7ec',
          200: '#a9cfd9',
          300: '#7eb7c6',
          400: '#5ba4b5',
          500: '#4391a3',
          600: '#357482',
          700: '#2a5a65',
          800: '#1f424a',
          900: '#162e34',
        },
      },
    },
  },
  plugins: [],
}