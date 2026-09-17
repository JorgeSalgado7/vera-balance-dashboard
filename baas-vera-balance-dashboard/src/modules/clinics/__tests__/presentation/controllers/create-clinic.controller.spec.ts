import { Test, TestingModule } from '@nestjs/testing';
import { CreateClinicController } from '../../../presentation/controllers/create-clinic.controller';
import { CreateClinicUseCase } from '../../../application/use-cases/create-clinic.use-case';

describe('CreateClinicController', () => {
  let controller: CreateClinicController;
  let createClinicUseCase: {
    execute: jest.Mock;
  };

  beforeEach(async () => {
    createClinicUseCase = {
      execute: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        CreateClinicController
      ],
      providers: [
        {
          provide: CreateClinicUseCase,
          useValue: createClinicUseCase
        }
      ]
    }).compile();

    controller = module.get<CreateClinicController>(CreateClinicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a clinic', async () => {
    const dto = {
      name: 'Vera Balance',
      logo: null,
      address: 'Test address',
      phone_number: '5512345678',
      therapy_types: [
        {
          name: 'Terapia individual',
          icon: ''
        }
      ]
    };

    const response = {
      id: 'clinic-id',
      ...dto
    };

    createClinicUseCase.execute.mockResolvedValue(response);

    const result = await controller.execute(dto);

    expect(createClinicUseCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(response);
  });
});