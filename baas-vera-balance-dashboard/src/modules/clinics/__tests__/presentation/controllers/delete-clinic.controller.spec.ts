import { Test, TestingModule } from '@nestjs/testing';
import { DeleteClinicController } from '../../../presentation/controllers/delete-clinic.controller';
import { DeleteClinicUseCase } from '../../../application/use-cases/delete-clinic.use-case';

describe('DeleteClinicController', () => {
  let controller: DeleteClinicController;
  let deleteClinicUseCase: {
    execute: jest.Mock;
  };

  beforeEach(async () => {
    deleteClinicUseCase = {
      execute: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        DeleteClinicController
      ],
      providers: [
        {
          provide: DeleteClinicUseCase,
          useValue: deleteClinicUseCase
        }
      ]
    }).compile();

    controller = module.get<DeleteClinicController>(DeleteClinicController);
  });

  it('should delete a clinic', async () => {
    deleteClinicUseCase.execute.mockResolvedValue(undefined);

    const result = await controller.execute('clinic-id');

    expect(deleteClinicUseCase.execute).toHaveBeenCalledWith('clinic-id');
    expect(result).toBeUndefined();
  });
});