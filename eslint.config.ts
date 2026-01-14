import { defineConfig } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort'

export default defineConfig({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      window: 'readonly',
      document: 'readonly',
    },
  },
  plugins: {
    importPlugin,
    eslintPluginSimpleImportSort,
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/no-duplicates': 'error',
    'newline-per-chained-call': [
      'error',
      {
        ignoreChainWithDepth: 1,
      },
    ],
    'object-curly-spacing': ['error', 'always'],
  },
})
