'use strict';
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'api', 'web',
        'domain', 'application', 'infrastructure', 'shared', 'core',
        'anti-ban', 'leads', 'whatsapp', 'persistence', 'cache', 'queue',
        'ai', 'crm', 'ads', 'properties', 'users', 'auth', 'analytics',
        'config', 'repo', 'build', 'deps', 'docs', 'test', 'ci', 'lekb',
        'release', 'security', 'refactor', 'style', 'perf', 'revert', 'wip',
      ],
    ],
  },
};

