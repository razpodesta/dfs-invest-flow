'use strict';
const nxPreset = require('@nx/jest/preset').default;
const { pathsToModuleNameMapper } = require('ts-jest');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function readTsConfigBasePaths(rootDir) {
  const tsConfigPath = path.join(rootDir, 'tsconfig.base.json');
  if (!fs.existsSync(tsConfigPath)) return undefined;
  const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
  if (tsConfig.error) {
    console.error('Error reading tsconfig.base.json:', tsConfig.error);
    return undefined;
  }
  return tsConfig.config?.compilerOptions?.paths;
}
const paths = readTsConfigBasePaths(__dirname);
const moduleNameMapper = pathsToModuleNameMapper(paths || {}, { prefix: '<rootDir>/../../' });

module.exports = {
  ...nxPreset,
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: moduleNameMapper,
  testMatch: ['**/+(*.)+(spec|test|integration-spec).[tj]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  collectCoverageFrom: [
    'libs/**/*.{ts,tsx}',
    '!libs/**/index.ts',
    '!libs/**/*.module.ts',
    '!libs/**/*.config.ts',
    '!libs/**/*.dto.ts',
    '!libs/**/*.enum.ts',
    '!libs/**/*.interface.ts',
    '!libs/**/*.port.ts',
    '!libs/**/*.constants.ts',
    '!libs/**/*.mock.ts',
    '!libs/**/prisma.service.ts',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/*.integration-spec.ts',
  ],
  testEnvironment: 'node',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  errorOnDeprecated: true,
};
