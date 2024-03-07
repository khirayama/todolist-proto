/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        overlayshow: {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
        overlayhide: {
          from: {
            opacity: 1,
          },
          to: {
            opacity: 0,
          },
        },
        contentshow: {
          from: {
            transform: "translate(-50%, 100%)",
          },
          to: {
            transform: "translate(-50%, 0)",
          },
        },
        contenthide: {
          from: {
            transform: "translate(-50%, 0)",
          },
          to: {
            transform: "translate(-50%, 110%)",
          },
        },
      },
    },
  },
  plugins: [],
};
