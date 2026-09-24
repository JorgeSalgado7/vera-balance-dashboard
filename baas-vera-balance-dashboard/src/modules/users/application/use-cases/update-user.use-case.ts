import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UpdateUserDomainService } from '../../domain/services/update-user.domain-service';
import type { IFindUserByIdRepository } from '../../domain/repositories/find-user-by-id.repository';
import type { IFindUserByEmailRepository } from '../../domain/repositories/find-user-by-email.repository';
import type { IUpdateUserRepository } from '../../domain/repositories/update-user.repository';
import type { ClinicReaderPort } from '../ports/clinic-reader.port';
import { UserNotFoundError, UserEmailAlreadyExistsError } from '../../domain/errors/user.error';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly updateUserDomainService: UpdateUserDomainService,
    @Inject('IFindUserByIdRepository')
    private readonly findUserByIdRepository: IFindUserByIdRepository,
    @Inject('IFindUserByEmailRepository')
    private readonly findUserByEmailRepository: IFindUserByEmailRepository,
    @Inject('IUpdateUserRepository')
    private readonly updateUserRepository: IUpdateUserRepository,
    @Inject('ClinicReaderPort')
    private readonly clinicReader: ClinicReaderPort
  ) {}

  async execute(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.findUserByIdRepository.findById(userId);
    if (!existing) {
      throw new UserNotFoundError();
    }

    const previousClinicId = existing.clinicId;
    const updated = this.updateUserDomainService.execute(existing, {
      name: dto.name,
      email: dto.email,
      professionalLicense: dto.professional_license,
      clinicId: dto.clinic_id,
      role: dto.role,
      status: dto.status,
      updatedAt: new Date().toISOString()
    });

    if (dto.email !== undefined) {
      const owner = await this.findUserByEmailRepository.findByEmail(dto.email);
      if (owner && owner.id !== userId) {
        throw new UserEmailAlreadyExistsError();
      }
    }
    if (dto.clinic_id !== undefined && dto.clinic_id !== previousClinicId) {
      await this.clinicReader.requireExisting(dto.clinic_id);
    }

    const saved = await this.updateUserRepository.update(updated);
    return {
      id: saved.id,
      name: saved.name,
      email: saved.email,
      professional_license: saved.professionalLicense,
      clinic: { id: saved.clinicId },
      role: saved.role,
      status: saved.status,
      created_at: saved.createdAt,
      updated_at: saved.updatedAt
    };
  }
}
