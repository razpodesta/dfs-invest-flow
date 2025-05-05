// ./apps/api/src/app/app.controller.spec.ts (Intento Simplificado)
import { Test, type TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service'; // Importar la clase real

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // SOLO lo mínimo necesario para instanciar AppController
      controllers: [AppController],
      providers: [AppService], // Proveer la clase real
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      // Solo verifica que el método se pueda llamar y devuelva algo
      expect(appController.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
// ./apps/api/src/app/app.controller.spec.ts
