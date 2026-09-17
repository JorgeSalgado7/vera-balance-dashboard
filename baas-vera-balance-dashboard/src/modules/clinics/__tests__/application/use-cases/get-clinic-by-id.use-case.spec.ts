import { Test, TestingModule } from '@nestjs/testing';
import { GetClinicByIdUseCase } from '../../../application/use-cases/get-clinic-by-id.use-case';
import { ClinicNotFoundError } from '../../../domain/errors/clinic.error';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import type { IFindClinicByIdRepository } from '../../../domain/repositories/find-clinic-by-id.repository';

describe('GetClinicByIdUseCase', () => {
  let useCase: GetClinicByIdUseCase;
  let findClinicByIdRepository: {
    findById: jest.Mock;
  };

  beforeEach(async () => {
    findClinicByIdRepository = {
      findById: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClinicByIdUseCase,
        {
          provide: 'IFindClinicByIdRepository',
          useValue: findClinicByIdRepository satisfies Partial<IFindClinicByIdRepository>
        }
      ]
    }).compile();

    useCase = module.get<GetClinicByIdUseCase>(GetClinicByIdUseCase);
  });

  it('should return a clinic', async () => {
    const clinic = {
      id: 'clinic-id',
      name: 'Vera Balance',
      logo: null,
      address: 'Test address',
      phoneNumber: '5512345678',
      therapyTypes: [],
      status: 'active',
      createdAt: '2026-09-14T00:00:00.000Z',
      updatedAt: '2026-09-14T00:00:00.000Z'
    } as ClinicEntity;

    findClinicByIdRepository.findById.mockResolvedValue(clinic);

    const result = await useCase.execute('clinic-id');

    expect(findClinicByIdRepository.findById).toHaveBeenCalledWith('clinic-id');

    expect(result).toEqual({
      id: clinic.id,
      name: clinic.name,
      logo: clinic.logo,
      address: clinic.address,
      phone_number: clinic.phoneNumber,
      therapy_types: clinic.therapyTypes
    });
  });

  it('should throw ClinicNotFoundError when clinic does not exist', async () => {
    findClinicByIdRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('clinic-id')
    ).rejects.toBeInstanceOf(ClinicNotFoundError);
  });
});