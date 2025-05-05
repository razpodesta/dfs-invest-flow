import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import * as importPlugin from 'eslint-plugin-import';
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

export default tseslint.config(
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
      'jest.config.cjs',
      'jest.preset.cjs',
      '**/vite-env.d.ts',
      'scripts/**',
      '.docs/**',
      'LICENSE',
      '*.md',
      'prisma/seed.ts',
    ],
  },

  eslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    ignores: [
        'scripts/**',
        '**/*.spec.{ts,tsx,js,jsx}',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.integration-spec.{ts,js}',
        '**/jest.config.cjs',
        '**/jest.preset.cjs',
        'apps/web/**/*.{ts,tsx,js,jsx}',
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: false },
      },
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
      security: securityPlugin,
      sonarjs: sonarjsPlugin,
      perfectionist: perfectionistPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['tsconfig.base.json'],
        },
        node: true,
      },
      'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs.stylistic.rules,
      ...(securityPlugin.configs.recommended?.rules || {}),
      ...(sonarjsPlugin.configs.recommended?.rules || {}),
      ...(importPlugin.configs.recommended?.rules || {}),
      ...(importPlugin.configs.typescript?.rules || {}),
      ...(perfectionistPlugin.configs['recommended-alphabetical']?.rules || {}),

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-var-requires': 'error',

      'import/order': 'off',
      'import/no-unresolved': ['error', { commonjs: true, caseSensitive: true }],
      'import/no-extraneous-dependencies': [
        'error', {
          devDependencies: [
            '**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}', '**/*.integration-spec.{ts,js}',
            '**/jest.config.{js,ts,cjs}', '**/jest.preset.{js,cjs}',
            '**/test-setup.{js,ts}', '**/playwright.config.{js,ts}',
            '**/*.config.{js,mjs,cjs,ts}', '**/scripts/**', './tools/**',
            'apps/api-e2e/**'
          ],
          peerDependencies: true,
          optionalDependencies: false,
        }
      ],
      'import/prefer-default-export': 'off',

      'perfectionist/sort-imports': [
        'error', {
          type: 'alphabetical', order: 'asc', newlinesBetween: 'always',
          groups: [ 'type', ['builtin', 'external'], 'internal-type', 'internal', ['parent-type', 'sibling-type', 'index-type'], ['parent', 'sibling', 'index'], 'object', 'unknown' ],
          internalPattern: ['^@dfs-invest-flow/.*']
        }
      ],
      'sonarjs/cognitive-complexity': ['warn', 18],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
      'no-console': 'warn',
      'eqeqeq': ['error', 'always'],

      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
    },
  },

  {
    files: ['**/*.spec.{ts,tsx,js,jsx}', '**/*.test.{ts,tsx,js,jsx}', '**/*.integration-spec.{ts,js}',
            '**/jest.config.cjs', '**/jest.preset.cjs'],
    languageOptions: {
        parser: tseslint.parser,
        globals: { ...globals.jest, ...globals.node }
    },
    plugins: {
        '@typescript-eslint': tseslint.plugin,
        sonarjs: sonarjsPlugin,
        jest: jestPlugin,
        import: importPlugin,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'no-undef': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-identical-functions': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  eslintConfigPrettier,
  {
    files: ['**/*'],
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
    },
  },
);

