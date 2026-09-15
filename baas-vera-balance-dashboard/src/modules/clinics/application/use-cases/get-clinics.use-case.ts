import { Inject, Injectable } from '@nestjs/common';
import { ClinicResponseDto } from '../dtos/clinic-response.dto';
import type { IFindClinicsRepository } from '../../domain/repositories/find-clinics.repository';

@Injectable()
export class GetClinicsUseCase {
  constructor(
    @Inject('IFindClinicsRepository')
    private readonly findClinicsRepository: IFindClinicsRepository
  ) {}

  async execute(): Promise<ClinicResponseDto[]> {
    const clinics = await this.findClinicsRepository.findAll();

    return clinics.map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      logo: clinic.logo,
      address: clinic.address,
      phone_number: clinic.phoneNumber,
      therapy_types: clinic.therapyTypes
    }));
  }
}