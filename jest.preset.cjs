'use strict';
const nxPreset = require('@nx/jest/preset').default;
const { pathsToModuleNameMapper } = require('ts-jest');
const fs = require('fs');
const ts = require('typescript');

// Función auxiliar para leer tsconfig.base.json de forma segura
function readTsConfigBasePaths(rootDir) {
  const tsconfigPath = require('path').join(rootDir, 'tsconfig.base.json');
  try {
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    const tsconfigObject = ts.parseConfigFileTextToJson(tsconfigPath, tsconfigContent);
    if (tsconfigObject.error) {
      console.error('Error parsing tsconfig.base.json for Jest:', tsconfigObject.error);
      return {};
    }
    return tsconfigObject.config?.compilerOptions?.paths || {};
  } catch (error) {
    console.error('Error reading tsconfig.base.json for Jest:', error);
    return {};
  }
}

// Obtener los paths desde la raíz real del workspace
const paths = readTsConfigBasePaths(__dirname); // __dirname debería ser la raíz aquí

module.exports = {
  ...nxPreset,
  transform: {
    // Usar ts-jest, pero apuntando al tsconfig.spec.json DENTRO de cada proyecto
    // ts-jest usará <rootDir> que se resuelve a la raíz del proyecto específico (ej: libs/shared)
    '^.+\\.(ts|tsx)?$': [
      'ts-jest',
      {
        // Apuntar al tsconfig.spec.json del proyecto que se está testeando
        tsconfig: '<rootDir>/tsconfig.spec.json', // <-- CORRECCIÓN CLAVE
        isolatedModules: true,
      },
    ],
  },
  // Mapear alias usando los paths leídos del tsconfig.base.json RAÍZ
  moduleNameMapper: pathsToModuleNameMapper(paths, {
    prefix: '<rootDir>/../../', // <-- Prefijo ajustado para salir de libs/shared y llegar a la raíz
    // Alternativa si el prefijo anterior falla: calcular ruta absoluta
    // prefix: require('path').resolve(__dirname) + '/',
  }),
};
