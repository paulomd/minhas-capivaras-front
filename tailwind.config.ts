import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F58220",
          blue: "#0077aa",
        },
        panel: {
          bg: "#1f2a3a",
          sidebar: "#263447",
          menu: "#384860",
          card: "#2b3b50",
          border: "#384860",
          muted: "#bbbbbb",
          hover: "#1f61c5",
        },
      },
    },
  },
  plugins: [],
};
export default config;
