import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212B",
        paper: "#EDEFEA",
        panel: "#FFFFFF",
        blueprint: {
          DEFAULT: "#2D4159",
          dark: "#1D2C3D",
          light: "#405B7A",
        },
        amber: {
          DEFAULT: "#C98A3E",
          light: "#E8B876",
        },
        urgent: {
          DEFAULT: "#B33A3A",
          light: "#F3DEDE",
        },
        normal: {
          DEFAULT: "#3D7A5C",
          light: "#DCEBE3",
        },
        line: "#D8DAD3",
      },
      fontFamily: {
        display: ["var(--font-cairo)", "sans-serif"],
        body: ["var(--font-plex)", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
