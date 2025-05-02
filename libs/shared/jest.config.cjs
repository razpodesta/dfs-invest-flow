'use strict';
module.exports = {
  coverageDirectory: '../../coverage/libs/shared',
  displayName: 'shared',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  preset: '../../jest.preset.cjs', // El preset es CJS
  testEnvironment: 'node',
  // La transformación dentro del preset se encargará de los .ts
  transform: {}, // Podemos dejarlo vacío aquí si el preset lo maneja
};
