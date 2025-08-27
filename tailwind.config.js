/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#ff3547",
          1: "#ff3547",
          2: "#d12b39",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#fcf4f4",
          1: "#71000a",
          2: "#fcf4f4",
          3: "#ffbf47",
          4: "#007aff",
          foreground: "#1a1a1a",
        },
        neutral: {
          200: "#f5f5f5",
          300: "#ededed",
          400: "#b3b3b3",
          500: "#808080",
          600: "#4d4d4d",
          700: "#2f2f2f",
          800: "#1a1a1a",
        },
        highlight: {
          accent: "#00bcd4",
          gold: "#ffcc33",
        },
        destructive: {
          DEFAULT: "#ff3547",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#4d4d4d",
        },
        accent: {
          DEFAULT: "#fcf4f4",
          foreground: "#1a1a1a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#1a1a1a",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1a1a1a",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
      boxShadow: {
        'button-1': '0 4px 8px #000000',
        'button-2': '0 4px 8px #b3000c',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}