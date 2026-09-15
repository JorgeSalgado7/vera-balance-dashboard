import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateClinicDto } from '../dtos/create-clinic.dto';
import { ClinicResponseDto } from '../dtos/clinic-response.dto';
import { CreateClinicDomainService } from '../../domain/services/create-clinic.domain-service';
import type { ICreateClinicRepository } from '../../domain/repositories/create-clinic.repository';

@Injectable()
export class CreateClinicUseCase {
  constructor(
    private readonly createClinicDomainService: CreateClinicDomainService,

    @Inject('ICreateClinicRepository')
    private readonly createClinicRepository: ICreateClinicRepository
  ) {}

  async execute(dto: CreateClinicDto): Promise<ClinicResponseDto> {
    const clinicId = randomUUID();
    const now = new Date().toISOString();

    const entity = this.createClinicDomainService.execute({
      id: clinicId,
      name: dto.name,
      logo: dto.logo ?? null,
      address: dto.address,
      phoneNumber: dto.phone_number,
      therapyTypes: dto.therapy_types.map((therapyType) => ({
        name: therapyType.name,
        icon: therapyType.icon
      })),
      createdAt: now,
      updatedAt: now
    });

    const saved = await this.createClinicRepository.create(entity);

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