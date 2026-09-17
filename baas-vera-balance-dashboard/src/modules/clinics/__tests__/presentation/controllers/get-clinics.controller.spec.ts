import { Test, TestingModule } from '@nestjs/testing';
import { GetClinicsController } from '../../../presentation/controllers/get-clinics.controller';
import { GetClinicsUseCase } from '../../../application/use-cases/get-clinics.use-case';

describe('GetClinicsController', () => {
  let controller: GetClinicsController;
  let getClinicsUseCase: {
    execute: jest.Mock;
  };

  beforeEach(async () => {
    getClinicsUseCase = {
      execute: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        GetClinicsController
      ],
      providers: [
        {
          provide: GetClinicsUseCase,
          useValue: getClinicsUseCase
        }
      ]
    }).compile();

    controller = module.get<GetClinicsController>(GetClinicsController);
  });

  it('should return all clinics', async () => {
    const response = [
      {
        id: 'clinic-id',
        name: 'Vera Balance',
        logo: null,
        address: 'Test address',
        phone_number: '5512345678',
        therapy_types: []
      }
    ];

    getClinicsUseCase.execute.mockResolvedValue(response);

    const result = await controller.execute();

    expect(getClinicsUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual(response);
  });

  it('should return an empty array', async () => {
    getClinicsUseCase.execute.mockResolvedValue([]);

    const result = await controller.execute();

    expect(result).toEqual([]);
  });
});