// ./apps/api/webpack.config.cjs (Verificar que el contenido sea similar a esto)
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/api'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false, // O true para producción
      outputHashing: 'none',
      generatePackageJson: true, // Importante
    }),
  ],
};
// ./apps/api/webpack.config.cjs
