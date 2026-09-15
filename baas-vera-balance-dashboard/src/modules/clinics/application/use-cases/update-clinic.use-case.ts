import { Inject, Injectable } from '@nestjs/common';
import { UpdateClinicDto } from '../dtos/update-clinic.dto';
import { ClinicResponseDto } from '../dtos/clinic-response.dto';
import { UpdateClinicDomainService } from '../../domain/services/update-clinic.domain-service';
import type { IFindClinicByIdRepository } from '../../domain/repositories/find-clinic-by-id.repository';
import type { IUpdateClinicRepository } from '../../domain/repositories/update-clinic.repository';
import { ClinicNotFoundError } from '../../domain/errors/clinic.error';

@Injectable()
export class UpdateClinicUseCase {
  constructor(
    private readonly updateClinicDomainService: UpdateClinicDomainService,

    @Inject('IFindClinicByIdRepository')
    private readonly findClinicByIdRepository: IFindClinicByIdRepository,

    @Inject('IUpdateClinicRepository')
    private readonly updateClinicRepository: IUpdateClinicRepository
  ) {}

  async execute(clinicId: string, dto: UpdateClinicDto): Promise<ClinicResponseDto> {
    const existing = await this.findClinicByIdRepository.findById(clinicId);

    if (!existing) {
      throw new ClinicNotFoundError();
    }

    const updated = this.updateClinicDomainService.execute(existing, {
      name: dto.name,
      logo: dto.logo,
      address: dto.address,
      phoneNumber: dto.phone_number,
      therapyTypes: dto.therapy_types?.map((therapyType) => ({
        name: therapyType.name,
        icon: therapyType.icon
      })),
      updatedAt: new Date().toISOString()
    });

    const saved = await this.updateClinicRepository.update(updated);

    return {
      id: saved.id,
      name: saved.name,
      logo: saved.logo,
      address: saved.address,
      phone_number: saved.phoneNumber,
      therapy_types: saved.therapyTypes
    };
  }
}