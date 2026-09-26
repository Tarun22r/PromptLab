/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAFA",
        surface: "#FFFFFF",
        border: {
          DEFAULT: "#E4E4E7",
          strong: "#D4D4D8",
        },
        ink: {
          DEFAULT: "#18181B",
          muted: "#71717A",
          faint: "#A1A1AA",
        },
        accent: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          subtle: "#EEF2FF",
          text: "#4338CA",
        },
        status: {
          success: "#16A34A",
          successSubtle: "#F0FDF4",
          warning: "#D97706",
          warningSubtle: "#FFFBEB",
          danger: "#DC2626",
          dangerSubtle: "#FEF2F2",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.875rem", { lineHeight: "1.4rem" }],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(24, 24, 27, 0.04)",
        panel: "0 1px 3px rgba(24, 24, 27, 0.06)",
      },
      transitionDuration: {
        DEFAULT: "160ms",
      },
    },
  },
  plugins: [],
};
