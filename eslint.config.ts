import tsParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import vueParser from 'vue-eslint-parser'

export default defineConfig([
  {
    files: [ '**/*.ts', '**/*.tsx', '**/*.vue' ],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: [ '.vue' ],
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // imports
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/no-duplicates': 'error',

      // spacing inside array brackets
      'array-bracket-spacing': [ 'error', 'always' ],
    },
  },
])
