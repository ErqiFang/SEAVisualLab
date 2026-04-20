import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sand: "#f6f0e8",
        accent: {
          50: "#eefaf8",
          100: "#d7f3ed",
          500: "#0f9c8d",
          600: "#0b7f73",
          700: "#0a6359"
        },
        coral: "#f97360",
        gold: "#f2b84b"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.08)",
        card: "0 8px 30px rgba(15, 23, 42, 0.08)"
      },
      fontFamily: {
        sans: ["Space Grotesk", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "sans-serif"]
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(rgba(15, 156, 141, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 156, 141, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
