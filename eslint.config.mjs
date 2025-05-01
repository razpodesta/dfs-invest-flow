// @ts-check

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
// Importa los plugins directamente para referencia en `plugins`
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import securityPlugin from 'eslint-plugin-security';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
// import reactPlugin from 'eslint-plugin-react';
// import reactHooksPlugin from 'eslint-plugin-react-hooks';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // 1. Ignorar archivos globales
  {
    ignores: ['node_modules/**', 'dist/**', '.nx/**', 'coverage/**'],
  },

  // 2. Configuración base para TODOS los archivos JS/TS/JSX/TSX
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser, // Usar parser TS para todos por defecto
      parserOptions: {
        ecmaFeatures: { jsx: true }, // Habilitar JSX globalmente si se usa React/Next
        project: true, // Intentar habilitar project globalmente
        // tsconfigRootDir: import.meta.dirname, // Puede ser necesario
      },
      globals: { // Globales comunes
        process: 'readonly',
        // browser: true,
        // node: true,
      },
    },
    plugins: {
      // Declarar todos los plugins aquí
      import: importPlugin, // TS7016 - Ignorar advertencia tipo
      'jsx-a11y': jsxA11yPlugin, // TS7016 - Ignorar advertencia tipo
      security: securityPlugin, // TS7016 - Ignorar advertencia tipo
      sonarjs: sonarjsPlugin,
      perfectionist: perfectionistPlugin,
      prettier: prettierPlugin,
      '@typescript-eslint': tseslint.plugin,
      // react: reactPlugin,
      // 'react-hooks': reactHooksPlugin,
    },
    rules: {
      // Reglas base JS recomendadas
      ...js.configs.recommended.rules,
      // Reglas base Import recomendadas
      ...importPlugin.configs.recommended.rules,
      // Reglas base JSX A11y recomendadas
      ...jsxA11yPlugin.configs.recommended.rules,
      // Reglas base Security recomendadas
      ...securityPlugin.configs.recommended.rules,
      // Reglas base SonarJS recomendadas
      ...sonarjsPlugin.configs.recommended.rules,

      // Reglas Perfectionist
      'perfectionist/sort-imports': [ /* ...configuración... */ ],
      'perfectionist/sort-classes': 'error',
      'perfectionist/sort-objects': 'error',
      'perfectionist/sort-interfaces': 'error',
      'perfectionist/sort-object-types': 'error',
      'perfectionist/sort-jsx-props': 'error',
      'perfectionist/sort-enums': 'error',

      // Regla Prettier
      'prettier/prettier': 'error',

       // Overrides Personalizados (Generales)
       'import/prefer-default-export': 'off',
       'import/no-extraneous-dependencies': [
         'error',
         {
           devDependencies: [ /* ... patrones ... */ ],
           optionalDependencies: false,
         },
       ],
       // Nota: Reglas específicas de TS irán en la sección siguiente
    },
    settings: { // Settings globales de plugins
        'import/resolver': {
            typescript: {
                project: './tsconfig.base.json',
            },
            node: true,
        },
        // react: { version: 'detect' },
    },
  },

  // 3. Configuración específica para archivos TypeScript (incluyendo reglas que requieren tipos)
  {
    files: ['**/*.{ts,tsx}'],
    // Hereda languageOptions/plugins del bloque anterior, solo añadimos reglas TS
    rules: {
      // Aplicar reglas TS recomendadas (con chequeo de tipos)
      // Usamos directamente las reglas de los objetos de config exportados por tseslint
      ...(tseslint.configs.recommendedTypeChecked.rules),
      ...(tseslint.configs.stylisticTypeChecked.rules),

       // Overrides específicos de TS
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // 4. Configuración específica para React (si es necesario, descomentar y ajustar)
  // {
  //   files: ['**/*.{jsx,tsx}'],
  //   plugins: {
  //     react: reactPlugin,
  //     'react-hooks': reactHooksPlugin,
  //   },
  //   rules: {
  //     ...reactPlugin.configs.recommended.rules,
  //     ...reactHooksPlugin.configs.recommended.rules,
  //     // Overrides React específicos
  //     'react/react-in-jsx-scope': 'off',
  //     'react/jsx-uses-react': 'off',
  //   }
  // },

  // 5. Desactivar reglas conflictivas con Prettier (SIEMPRE AL FINAL)
  eslintConfigPrettier,
];

export default config;

// Helper para la configuración de Perfectionist (para evitar repetición)
const perfectionistSortImportsConfig = {
  type: 'alphabetical',
  order: 'asc',
  'newlines-between': 'always',
  groups: [
    ['builtin', 'external'],
    'internal-type',
    'internal',
    ['parent-type', 'sibling-type', 'index-type'],
    ['parent', 'sibling', 'index'],
    'object',
    'unknown',
  ],
  'internal-pattern': ['@dfs-invest-flow/**'],
};

// Actualizar la regla en el objeto de configuración principal
const mainConfig = config.find(c => c.files && c.files.includes('**/*.{js,jsx,ts,tsx}'));
if (mainConfig && mainConfig.rules) {
  mainConfig.rules['perfectionist/sort-imports'] = ['error', perfectionistSortImportsConfig];
    mainConfig.rules['import/no-extraneous-dependencies'] = [
        'error',
        {
          devDependencies: [
            '**/*.test.{js,jsx,ts,tsx}',
            '**/*.spec.{js,jsx,ts,tsx}',
            '**/*.e2e-spec.{js,jsx,ts,tsx}',
            '**/*.config.{js,mjs,cjs,ts}',
            '**/jest.config.{js,ts}',
            '**/jest.preset.{js,cjs}',
            '**/tools/**',
            '**/scripts/**',
          ],
          optionalDependencies: false,
        },
      ];
}