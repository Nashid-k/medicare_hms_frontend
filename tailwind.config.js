/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-highest": "#e0e3e5",
        "tertiary-fixed": "#dae2fd",
        "primary-fixed-dim": "#b8c4ff",
        "inverse-primary": "#b8c4ff",
        "primary": "#00288e",
        "on-secondary": "#ffffff",
        "on-primary-fixed-variant": "#173bab",
        "on-background": "#191c1e",
        "surface-container": "#eceef0",
        "on-primary-container": "#a8b8ff",
        "tertiary-fixed-dim": "#bec6e0",
        "outline": "#67697b",
        "surface-variant": "#e0e3e5",
        "secondary": "#006a61",
        "surface": "#f7f9fb",
        "on-tertiary-fixed-variant": "#3f465c",
        "inverse-surface": "#2d3133",
        "background": "#f7f9fb",
        "on-surface-variant": "#444653",
        "surface-container-low": "#f2f4f6",
        "surface-container-lowest": "#ffffff",
        "surface-tint": "#3755c3",
        "secondary-container": "#86f2e4",
        "surface-container-high": "#e6e8ea",
        "on-error-container": "#93000a",
        "on-primary-fixed": "#001453",
        "inverse-on-surface": "#eff1f3",
        "on-primary": "#ffffff",
        "on-secondary-container": "#006f66",
        "secondary-fixed-dim": "#6bd8cb",
        "surface-bright": "#f7f9fb",
        "tertiary": "#2d3449",
        "on-tertiary": "#ffffff",
        "error-container": "#ffdad6",
        "primary-fixed": "#dde1ff",
        "on-tertiary-fixed": "#131b2e",
        "outline-variant": "#c4c5d5",
        "secondary-fixed": "#89f5e7",
        "surface-dim": "#d8dadc",
        "on-secondary-fixed-variant": "#005049",
        "on-error": "#ffffff",
        "tertiary-container": "#434b60",
        "on-secondary-fixed": "#00201d",
        "on-surface": "#191c1e",
        "on-tertiary-container": "#b4bbd5",
        "primary-container": "#1e40af",
        "error": "#ba1a1a"
      },
      spacing: {
        "margin-mobile": "1rem",
        "space-sm": "0.5rem",
        "gutter-mobile": "1rem",
        "space-md": "1rem",
        "space-xl": "2rem",
        "space-xs": "0.25rem",
        "gutter": "1.5rem",
        "margin": "2rem",
        "space-lg": "1.5rem"
      },
      fontFamily: {
        "headline-md": ["Inter", "sans-serif"],
        "code-sm": ["JetBrains Mono", "monospace"],
        "body-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-xl-mobile": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "headline-xl": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "title-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "code-sm": ["12px", { lineHeight: "16px", letterSpacing: "0em", fontWeight: "500" }],
        "body-md": ["14px", { lineHeight: "20px", letterSpacing: "0em", fontWeight: "400" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "label-md": ["13px", { lineHeight: "18px", letterSpacing: "0.01em", fontWeight: "500" }],
        "headline-lg": ["30px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-xl-mobile": ["28px", { lineHeight: "36px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.005em", fontWeight: "400" }],
        "headline-xl": ["36px", { lineHeight: "44px", letterSpacing: "-0.025em", fontWeight: "700" }],
        "headline-sm": ["18px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", letterSpacing: "0em", fontWeight: "400" }],
        "title-md": ["16px", { lineHeight: "22px", letterSpacing: "-0.005em", fontWeight: "600" }],
        "label-sm": ["11px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "600" }]
      },
      animation: {
        fadeIn: 'fadeIn 0.18s ease-out both'
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [],
};
