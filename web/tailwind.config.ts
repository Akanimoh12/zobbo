import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07080B",
          900: "#0C0D11",
          800: "#13151B",
          700: "#1B1E26",
          600: "#2A2E39",
        },
        lime: {
          300: "#E4FF8A",
          400: "#CBFF4D",
          500: "#B7F52A",
        },
        fg: "#F4F5F7",
        mute: "#9096A3",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 80px -10px rgba(203,255,77,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
