import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background:  "var(--bg)",
        foreground:  "var(--text)",
        surface:     "var(--surface)",
        "surface-2": "var(--surface-2)",
        nav:         "var(--nav)",
        accent:      "var(--accent)",
        "accent-pale": "var(--accent-pale)",
        btn:         "var(--btn)",
        "btn-light": "var(--btn-light)",
        cobre:       "var(--cobre)",
        tierra:      "var(--tierra)",
        ladrillo:    "var(--ladrillo)",
        musgo:       "var(--musgo)",
        antracita:   "var(--antracita)",
        muted:       "var(--muted)",
        faint:       "var(--faint)",
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
