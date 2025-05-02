/* eslint-env node */
'use strict';

// Directiva: DFS-GIT-002-P2
// Estándar Conventional Commits v1.0.0
module.exports = {
  extends: ['@commitlint/config-conventional'],
  // Regla scope-enum con la lista de scopes válidos para el monorepo
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'core',
        'shared',
        'infra',
        'api',
        'web',
        'repo',
        'deps',
        'ci',
        'docs',
        'test',
        'config',
        'release',
        'security',
      ],
    ],
  },
};