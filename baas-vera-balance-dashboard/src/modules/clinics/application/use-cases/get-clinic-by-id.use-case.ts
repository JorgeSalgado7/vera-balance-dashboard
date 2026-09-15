import { Inject, Injectable } from '@nestjs/common';
import { ClinicResponseDto } from '../dtos/clinic-response.dto';
import type { IFindClinicByIdRepository } from '../../domain/repositories/find-clinic-by-id.repository';
import { ClinicNotFoundError } from '../../domain/errors/clinic.error';

@Injectable()
export class GetClinicByIdUseCase {
  constructor(
    @Inject('IFindClinicByIdRepository')
    private readonly findClinicByIdRepository: IFindClinicByIdRepository
  ) {}

  async execute(clinicId: string): Promise<ClinicResponseDto> {
    const clinic = await this.findClinicByIdRepository.findById(clinicId);

    if (!clinic) {
      throw new ClinicNotFoundError();
    }

    return {
      id: clinic.id,
      name: clinic.name,
      logo: clinic.logo,
      address: clinic.address,
      phone_number: clinic.phoneNumber,
      therapy_types: clinic.therapyTypes
    };
  }
}