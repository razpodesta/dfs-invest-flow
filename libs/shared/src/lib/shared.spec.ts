// ./libs/shared/src/lib/shared.spec.ts
// Corregido: Eliminada la siguiente línea
// const { describe, it, expect } = require('@jest/globals');
const { shared } = require('./shared');

describe('shared', () => {
  it('should work', () => {
    expect(shared()).toEqual('shared');
  });
});
// ./libs/shared/src/lib/shared.spec.ts
