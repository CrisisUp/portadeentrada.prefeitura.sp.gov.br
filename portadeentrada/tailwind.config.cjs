/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Cores de destaque
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        dark: 'var(--color-dark)',

        // Superfícies / Fundos
        surface: {
          DEFAULT: 'var(--bg-primary)',
          alt: 'var(--bg-secondary)',
          muted: 'var(--bg-tertiary)',
        },

        // Textos / Primeiro plano
        foreground: {
          DEFAULT: 'var(--text-primary)',
          dim: 'var(--text-secondary)',
          muted: 'var(--text-tertiary)',
        },

        // Bordas e Divisores
        line: {
          DEFAULT: 'var(--border-primary)',
          dim: 'var(--border-secondary)',
        },

        // Componentes específicos
        toast: {
          DEFAULT: 'var(--toast-bg)',
          border: 'var(--toast-border)',
          foreground: 'var(--toast-color)',
        },
        shimmer: {
          1: 'var(--shimmer-1)',
          2: 'var(--shimmer-2)',
        },
      },
    },
  },
  plugins: [],
}