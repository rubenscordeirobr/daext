
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'utfpr-yellow': '#ffbf00',
        'utfpr-gray': '#8d9199',
        'background': '#fafdfd',
      },
    },
  },
  plugins: [],
} satisfies Config
