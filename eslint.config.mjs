// @ts-check
// v9.9: Configuración explícita de parser/parserOptions en bloque Jest

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
      'node_modules/**',
      'dist/**',
      'build/**',
      '.nx/**',
      'coverage/**',
      'tmp/**',
      'libs/shared/.eslintignore',
      '**/*.config.{js,mjs,cjs,ts}',
      'eslint.config.mjs',
      'jest.config.ts', // Ignorar config de Jest globalmente
      'jest.preset.cjs', // Ignorar preset de Jest globalmente
      '**/vite-env.d.ts',
      'scripts/**',
      '.docs/**',
      'LICENSE',
      '*.md',
    ],
  },

  // 2. Configuración JS Base
  eslint.configs.recommended,

  // 3. Configuración TS/JS General (SIN project: true, Ignorando Tests)
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    // Excluir explícitamente archivos de test y configs de Jest aquí
    ignores: [
      'scripts/**', // Mantener ignore para scripts
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/jest.config.ts', // Excluir también configs de Jest
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      security: securityPlugin,
      sonarjs: sonarjsPlugin,
      perfectionist: perfectionistPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-unused-vars': 'off',
      ...securityPlugin.configs.recommended.rules,
      ...sonarjsPlugin.configs.recommended.rules,
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{js,jsx,ts,tsx}',
            '**/*.spec.{js,jsx,ts,tsx}',
            '**/jest.config.{js,ts}',
            '**/jest.preset.{js,cjs}',
            '**/tools/**',
            '**/scripts/**',
            '**/*.config.{js,mjs,cjs,ts}',
          ],
          optionalDependencies: false,
        },
      ],
      'import/prefer-default-export': 'off',
      'import/order': 'off',
      ...perfectionistPlugin.configs['recommended-alphabetical'].rules,
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          newlinesBetween: 'always',
          groups: [
            'type',
            ['builtin', 'external'],
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown',
          ],
          internalPattern: ['^@dfs-invest-flow/.*'],
        },
      ],
      'no-console': 'warn',
      eqeqeq: ['error', 'always'],
      'no-undef': 'error',
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

  // 4. Configuración Específica para Archivos de Test (Jest) - MÁS EXPLÍCITA
  {
    files: ['**/*.spec.{ts,tsx,js,jsx}', '**/*.test.{ts,tsx,js,jsx}', '**/jest.config.ts'],
    plugins: {
      jest: jestPlugin,
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module', // Asumir ESM para tests si jest.config.ts usa 'export default'
        // Si da problemas, probar 'commonjs' aquí
      },
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      // Desactivar 'no-undef' de JS base para permitir globales de Jest
      'no-undef': 'off',
      // Desactivar reglas TS que fallan sin 'project:true'
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      // Mantener otras reglas TS básicas si se desean para tests
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Permitir 'any' más libremente en tests
    },
  },

  // 5. Configuración React
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'jsx-a11y': jsxA11yPlugin, react: reactPlugin, 'react-hooks': reactHooksPlugin },
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: { react: { version: 'detect' } },
  },

  // 6. Configuración JSON / JSONC
  { files: ['**/*.json', '**/*.jsonc'], languageOptions: { parser: jsoncParser } },

  // 7. Perfectionist - (Ya incluido en bloque 3)
  // {
  //   files: ['**/*.{js,jsx,ts,tsx,mjs}'],
  //   plugins: { perfectionist: perfectionistPlugin },
  //   rules: {
  //     ...perfectionistPlugin.configs['recommended-alphabetical'].rules,
  //     'perfectionist/sort-imports': [ 'error', { /* ... opciones ... */ internalPattern: ['^@dfs-invest-flow/.*'] } ],
  //   },
  // }, // <- Comentado ya que se movió al bloque 3

  // 8. Prettier (Config + Regla) - Al final
  eslintConfigPrettier,
  {
    files: ['**/*'],
    plugins: { prettier: prettierPlugin },
    rules: { 'prettier/prettier': 'error' },
  },
];
