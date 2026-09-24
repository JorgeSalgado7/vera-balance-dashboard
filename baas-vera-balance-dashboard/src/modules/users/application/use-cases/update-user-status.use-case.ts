import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserStatusDto } from '../dtos/update-user-status.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { UpdateUserStatusDomainService } from '../../domain/services/update-user-status.domain-service';
import type { IFindUserByIdRepository } from '../../domain/repositories/find-user-by-id.repository';
import type { IUpdateUserStatusRepository } from '../../domain/repositories/update-user-status.repository';
import { UserNotFoundError } from '../../domain/errors/user.error';

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(
    private readonly updateUserStatusDomainService: UpdateUserStatusDomainService,
    @Inject('IFindUserByIdRepository')
    private readonly findUserByIdRepository: IFindUserByIdRepository,
    @Inject('IUpdateUserStatusRepository')
    private readonly updateUserStatusRepository: IUpdateUserStatusRepository
  ) {}

  async execute(userId: string, dto: UpdateUserStatusDto): Promise<UserResponseDto> {
    const existing = await this.findUserByIdRepository.findById(userId);
    if (!existing) {
      throw new UserNotFoundError();
    }
    const updated = this.updateUserStatusDomainService.execute(existing, {
      status: dto.status,
      updatedAt: new Date().toISOString()
    });
    const saved = await this.updateUserStatusRepository.updateStatus(updated);
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
