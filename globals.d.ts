// ./globals.d.ts
// Declaración de módulos para plugins ESLint
declare module 'eslint-plugin-import';
declare module 'eslint-plugin-jsx-a11y';
declare module 'eslint-plugin-react';
declare module 'eslint-plugin-react-hooks';
declare module 'eslint-plugin-security';
declare module 'eslint-plugin-sonarjs';
declare module 'eslint-plugin-perfectionist';
declare module 'eslint-plugin-prettier';
declare module 'eslint-config-prettier';
declare module 'jsonc-eslint-parser';

// --- AÑADIDO: Extender interfaz Request de Express ---
declare namespace Express {
  export interface Request {
    rawBody?: Buffer; // Añadir nuestra propiedad personalizada opcional
  }
}
// --- FIN AÑADIDO ---
// ./globals.d.ts
