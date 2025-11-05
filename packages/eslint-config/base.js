import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"

export const base = tseslint.config(
  {
    ignores: ["dist", "build", "out", ".turbo", "node_modules"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: true
        }
      },
      globals: {
        ...globals.es2021
      }
    }
  }
)
