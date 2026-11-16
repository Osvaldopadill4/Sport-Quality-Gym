/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        gymtheme: {
          "primary": "#22c55e", // Verde brillante tipo gym (green-500)
          "primary-focus": "#16a34a",
          "primary-content": "#000000",
          "secondary": "#18181b", // Gris muy oscuro/negro (zinc-900)
          "accent": "#4ade80",
          "neutral": "#09090b", // Negro casi puro (zinc-950)
          "base-100": "#18181b", // Fondo principal de la app (zinc-900)
          "base-200": "#27272a", // Fondo de tarjetas (zinc-800)
          "base-300": "#3f3f46", // Bordes
          "info": "#3b82f6",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      "dark",
    ],
  },
}
