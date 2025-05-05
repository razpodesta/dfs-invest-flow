'use strict';
module.exports = {
  displayName: 'infrastructure',
  preset: '../../jest.preset.cjs',
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/libs/infrastructure',
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.integration.json' }],
  },
  testMatch: ['**/+(*.)+(integration-spec).[tj]s?(x)'],
};
