
import { Inject, Injectable } from '@nestjs/common';
import type { IDeleteClinicRepository } from '../../domain/repositories/delete-clinic.repository';
import type { IFindClinicByIdRepository } from '../../domain/repositories/find-clinic-by-id.repository';
import { ClinicNotFoundError } from '../../domain/errors/clinic.error';

@Injectable()
export class DeleteClinicUseCase {
  constructor(
    @Inject('IFindClinicByIdRepository')
    private readonly findClinicByIdRepository: IFindClinicByIdRepository,

    @Inject('IDeleteClinicRepository')
    private readonly deleteClinicRepository: IDeleteClinicRepository
  ) {}

  async execute(clinicId: string): Promise<void> {
    const clinic = await this.findClinicByIdRepository.findById(clinicId);

    if (!clinic) {
      throw new ClinicNotFoundError();
    }

    await this.deleteClinicRepository.delete(clinicId);
  }
}