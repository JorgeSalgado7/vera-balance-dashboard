import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClinicController } from '../../../presentation/controllers/update-clinic.controller';
import { UpdateClinicUseCase } from '../../../application/use-cases/update-clinic.use-case';

describe('UpdateClinicController', () => {
  let controller: UpdateClinicController;
  let updateClinicUseCase: {
    execute: jest.Mock;
  };

  beforeEach(async () => {
    updateClinicUseCase = {
      execute: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        UpdateClinicController
      ],
      providers: [
        {
          provide: UpdateClinicUseCase,
          useValue: updateClinicUseCase
        }
      ]
    }).compile();

    controller = module.get<UpdateClinicController>(UpdateClinicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update a clinic', async () => {
    const dto = {
      name: 'Vera Balance Updated'
    };

    const response = {
      id: 'clinic-id',
      name: dto.name,
      logo: null,
      address: 'Test address',
      phone_number: '5512345678',
      therapy_types: []
    };

    updateClinicUseCase.execute.mockResolvedValue(response);

    const result = await controller.execute('clinic-id', dto);

    expect(updateClinicUseCase.execute).toHaveBeenCalledWith(
      'clinic-id',
      dto
    );

    expect(result).toEqual(response);
  });
});