// @ts-check
import baseConfig from '../../eslint.config.mjs';

// Crear configuración personalizada que ignora README.md
export default [
  // Primero ignoramos el README.md
  {
    ignores: ['README.md'],
  },
  // Luego incluimos la configuración base
  ...baseConfig,
];
