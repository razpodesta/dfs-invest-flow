// @ts-check
// v9.6: Eliminado bloque de configuración para scripts/ (archivo ejecuta.ts borrado)

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsoncParser from 'jsonc-eslint-parser';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import jestPlugin from 'eslint-plugin-jest';
import globals from 'globals';

export default [
  // 1. Ignorados Globales
  {
    ignores: [
      'node_modules/**', 'dist/**', 'build/**', '.nx/**', 'coverage/**', 'tmp/**',
      'libs/shared/.eslintignore', '**/*.config.{js,mjs,cjs,ts}', 'eslint.config.mjs',
      'jest.config.ts', 'jest.preset.cjs', '**/vite-env.d.ts',
      'scripts/**', // <<< Mantener ignore para el directorio por si acaso
    ],
  },

  // 2. Configuración JS Base
  eslint.configs.recommended,

  // 3. Configuración TS/JS General (SIN project: true)
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    // NO ignorar scripts aquí ya que el directorio completo está en ignores globales
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { // Definir globales comunes aquí
          ...globals.node, // Asumir Node.js como entorno común para TS/JS
          // ...globals.browser, // Añadir si tienes código de navegador fuera de React
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      security: securityPlugin,
      sonarjs: sonarjsPlugin,
      perfectionist: perfectionistPlugin, // Mover Perfectionist aquí
    },
    rules: {
      // Reglas generales TS/JS
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': 'off',

      // Reglas Security/Sonar
      ...securityPlugin.configs.recommended.rules,
      ...sonarjsPlugin.configs.recommended.rules,

      // Reglas Import
      'import/no-extraneous-dependencies': [ 'error', { devDependencies: [ /* ... */ ] } ],
      'import/prefer-default-export': 'off',
      'import/order': 'off', // Perfectionist

      // Reglas Perfectionist (movidas aquí desde su propio bloque)
      ...perfectionistPlugin.configs['recommended-alphabetical'].rules,
      'perfectionist/sort-imports': [ 'error', { /* ... */ internalPattern: ['^@dfs-invest-flow/.*'] } ],

      // Otras
      'no-console': 'warn',
      'eqeqeq': ['error', 'always'],
      'no-undef': 'error', // Activar no-undef aquí

      // Desactivar reglas type-aware
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/await-thenable': 'off',
    },
    settings: {
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
      'import/resolver': { node: true },
    },
  },

  // 4. Configuración Específica para Archivos de Test (Jest)
  {
      files: ['**/*.spec.{ts,tsx,js,jsx}', '**/*.test.{ts,tsx,js,jsx}'],
      plugins: { jest: jestPlugin },
      languageOptions: {
          globals: { /* ... Globales Jest ... */ describe: 'readonly', it: 'readonly', expect: 'readonly', jest: 'readonly' /* ...etc */ },
      },
      rules: {
          ...jestPlugin.configs.recommended.rules,
          'no-undef': 'off', // <<< DESACTIVAR no-undef aquí para permitir globales Jest
      },
  },

  // 5. Configuración React
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'jsx-a11y': jsxA11yPlugin, react: reactPlugin, 'react-hooks': reactHooksPlugin },
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: { /* ... Reglas React ... */ 'react/react-in-jsx-scope': 'off', 'react/prop-types': 'off' },
    settings: { react: { version: 'detect' } },
  },

  // 6. Configuración JSON / JSONC
  { files: ['**/*.json', '**/*.jsonc'], languageOptions: { parser: jsoncParser } },

  // 7. Prettier (Config + Regla) - Al final
  eslintConfigPrettier,
  { files: ['**/*'], plugins: { prettier: prettierPlugin }, rules: { 'prettier/prettier': 'error' } },
];