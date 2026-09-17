import { Test, TestingModule } from '@nestjs/testing';
import { GetClinicByIdController } from '../../../presentation/controllers/get-clinic-by-id.controller';
import { GetClinicByIdUseCase } from '../../../application/use-cases/get-clinic-by-id.use-case';

describe('GetClinicByIdController', () => {
  let controller: GetClinicByIdController;
  let getClinicByIdUseCase: {
    execute: jest.Mock;
  };

  beforeEach(async () => {
    getClinicByIdUseCase = {
      execute: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        GetClinicByIdController
      ],
      providers: [
        {
          provide: GetClinicByIdUseCase,
          useValue: getClinicByIdUseCase
        }
      ]
    }).compile();

    controller = module.get<GetClinicByIdController>(GetClinicByIdController);
  });

  it('should return a clinic', async () => {
    const response = {
      id: 'clinic-id',
      name: 'Vera Balance',
      logo: null,
      address: 'Test address',
      phone_number: '5512345678',
      therapy_types: []
    };

    getClinicByIdUseCase.execute.mockResolvedValue(response);

    const result = await controller.execute('clinic-id');

    expect(getClinicByIdUseCase.execute).toHaveBeenCalledWith('clinic-id');
    expect(result).toEqual(response);
  });
});