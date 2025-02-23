/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-10%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(10%)" },
          "100%": { transform: "translateY(0)" },
        },
        "zoom-in": {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        "zoom-out": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.95)" },
        },
      },
      animation: {
        "fadein": "fade-in 200ms ease-out",
        "fadeout": "fade-out 200ms ease-in",
        "slidefromtop": "slide-in-from-top 200ms ease-out",
        "slidefrombottom": "slide-in-from-bottom 200ms ease-out",
        "zoomin": "zoom-in 200ms ease-out",
        "zoomout": "zoom-out 200ms ease-in",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 