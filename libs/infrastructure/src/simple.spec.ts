// ./libs/infrastructure/src/simple.spec.ts
// Importar explícitamente si el workaround es necesario
// import { describe, it, expect } from '@jest/globals';

describe('Simple Infrastructure Test', () => {
  it('should pass', () => {
    const value = true;
    expect(value).toBe(true);
  });

  it('should also pass', () => {
    expect(1 + 1).toEqual(2);
  });
});
// ./libs/infrastructure/src/simple.spec.ts
