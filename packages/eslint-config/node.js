import globals from "globals"
import { base } from "./base.js"

export const node = [
  ...base,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    }
  }
]
