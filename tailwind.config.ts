import type { Config } from "tailwindcss";
import { ydeckTailwindExtend } from "./ydeck-landing-page/tailwind.ydeck.extend";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./ydeck-landing-page/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: ydeckTailwindExtend,
  },
};

export default config;
