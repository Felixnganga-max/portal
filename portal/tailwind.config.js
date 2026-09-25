/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    // Soft 6px corners like eTIMS / eRITS; hairline borders do the structure.
    borderRadius: {
      none: "0px",
      sm: "4px",
      DEFAULT: "6px",
      md: "6px",
      lg: "10px",
      full: "9999px",
    },
    boxShadow: {
      none: "none",
      DEFAULT: "0 1px 2px rgba(16,24,40,0.04)",
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        tenant: "var(--tenant-color, #C0272D)",
        "tenant-dark": "var(--tenant-color-dark, #9E1B21)",
        "tenant-soft": "var(--tenant-color-soft, #FDECEC)",
        ink: "#111214",
        subtle: "#6B7280",
        line: "#E8E9EC",
        surface: "#FFFFFF",
        canvas: "#F6F7F9",
        badge: "#DC2626",
        link: "#E8730C",
        good: "#16A34A",
      },
      spacing: { sidebar: "248px" },
    },
  },
  plugins: [],
};
