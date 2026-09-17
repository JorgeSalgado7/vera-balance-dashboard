import { Test, TestingModule } from '@nestjs/testing';
import { DeleteClinicUseCase } from '../../../application/use-cases/delete-clinic.use-case';
import { ClinicNotFoundError } from '../../../domain/errors/clinic.error';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import type { IFindClinicByIdRepository } from '../../../domain/repositories/find-clinic-by-id.repository';
import type { IDeleteClinicRepository } from '../../../domain/repositories/delete-clinic.repository';

describe('DeleteClinicUseCase', () => {
  let useCase: DeleteClinicUseCase;
  let findClinicByIdRepository: {
    findById: jest.Mock;
  };
  let deleteClinicRepository: {
    delete: jest.Mock;
  };

  beforeEach(async () => {
    findClinicByIdRepository = {
      findById: jest.fn()
    };

    deleteClinicRepository = {
      delete: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClinicUseCase,
        {
          provide: 'IFindClinicByIdRepository',
          useValue: findClinicByIdRepository satisfies Partial<IFindClinicByIdRepository>
        },
        {
          provide: 'IDeleteClinicRepository',
          useValue: deleteClinicRepository satisfies Partial<IDeleteClinicRepository>
        }
      ]
    }).compile();

    useCase = module.get<DeleteClinicUseCase>(DeleteClinicUseCase);
  });

  it('should delete a clinic', async () => {
    findClinicByIdRepository.findById.mockResolvedValue({
      id: 'clinic-id'
    } as ClinicEntity);

    deleteClinicRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('clinic-id');

    expect(findClinicByIdRepository.findById).toHaveBeenCalledWith('clinic-id');
    expect(deleteClinicRepository.delete).toHaveBeenCalledWith('clinic-id');
  });

  it('should throw ClinicNotFoundError when clinic does not exist', async () => {
    findClinicByIdRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('clinic-id')
    ).rejects.toBeInstanceOf(ClinicNotFoundError);

    expect(deleteClinicRepository.delete).not.toHaveBeenCalled();
  });
});