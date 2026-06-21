import type { Config } from "tailwindcss";

/**
 * Sistema visual HNV (Harmony Nexus Vitae) — El Fulcro Invisible.
 * Los tokens reflejan las variables CSS definidas en src/app/globals.css.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: "#0b1a2e",
          mid: "#122240",
          light: "#1a3058",
        },
        copper: {
          DEFAULT: "#c4875a",
          light: "#d4a574",
        },
        cream: {
          DEFAULT: "#f0e8db",
          soft: "#e8dfd0",
        },
        verified: "#5a9e6f",
        assumed: "#c4a03a",
        warning: "#bf7a3f",
        absent: "#b05050",
        canvas: "#0a0f18",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-plex)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
