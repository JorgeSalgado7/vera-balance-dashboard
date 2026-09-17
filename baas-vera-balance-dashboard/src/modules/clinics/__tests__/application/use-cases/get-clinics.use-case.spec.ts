import { Test, TestingModule } from '@nestjs/testing';
import { GetClinicsUseCase } from '../../../application/use-cases/get-clinics.use-case';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import type { IFindClinicsRepository } from '../../../domain/repositories/find-clinics.repository';

describe('GetClinicsUseCase', () => {
  let useCase: GetClinicsUseCase;
  let findClinicsRepository: {
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    findClinicsRepository = {
      findAll: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClinicsUseCase,
        {
          provide: 'IFindClinicsRepository',
          useValue: findClinicsRepository satisfies Partial<IFindClinicsRepository>
        }
      ]
    }).compile();

    useCase = module.get<GetClinicsUseCase>(GetClinicsUseCase);
  });

  it('should return all clinics', async () => {
    const clinics = [
      {
        id: 'clinic-1',
        name: 'Clinic 1',
        logo: null,
        address: 'Address 1',
        phoneNumber: '5511111111',
        therapyTypes: [],
        status: 'active',
        createdAt: '2026-09-14T00:00:00.000Z',
        updatedAt: '2026-09-14T00:00:00.000Z'
      },
      {
        id: 'clinic-2',
        name: 'Clinic 2',
        logo: null,
        address: 'Address 2',
        phoneNumber: '5522222222',
        therapyTypes: [],
        status: 'active',
        createdAt: '2026-09-14T00:00:00.000Z',
        updatedAt: '2026-09-14T00:00:00.000Z'
      }
    ] as ClinicEntity[];

    findClinicsRepository.findAll.mockResolvedValue(clinics);

    const result = await useCase.execute();

    expect(findClinicsRepository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      id: clinics[0].id,
      name: clinics[0].name,
      logo: clinics[0].logo,
      address: clinics[0].address,
      phone_number: clinics[0].phoneNumber,
      therapy_types: clinics[0].therapyTypes
    });
  });

  it('should return an empty array when there are no clinics', async () => {
    findClinicsRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});