import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserDomainService } from '../../domain/services/create-user.domain-service';
import { ValidateUserDataDomainService } from '../../domain/services/validate-user-data.domain-service';
import { ValidateUserRoleDomainService } from '../../domain/services/validate-user-role.domain-service';
import { UserEmailAlreadyExistsError } from '../../domain/errors/user.error';
import type { ICreateUserRepository } from '../../domain/repositories/create-user.repository';
import type { IFindUserByEmailRepository } from '../../domain/repositories/find-user-by-email.repository';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { ClinicReaderPort } from '../ports/clinic-reader.port';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly createUserDomainService: CreateUserDomainService,
    private readonly validateUserDataDomainService: ValidateUserDataDomainService,
    private readonly validateUserRoleDomainService: ValidateUserRoleDomainService,

    @Inject('ICreateUserRepository')
    private readonly createUserRepository: ICreateUserRepository,

    @Inject('IFindUserByEmailRepository')
    private readonly findUserByEmailRepository: IFindUserByEmailRepository,

    @Inject('PasswordHasherPort')
    private readonly passwordHasher: PasswordHasherPort,

    @Inject('ClinicReaderPort')
    private readonly clinicReader: ClinicReaderPort
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    this.validateUserDataDomainService.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      professionalLicense: dto.professional_license,
      clinicId: dto.clinic_id
    });
    this.validateUserRoleDomainService.execute(dto.role);

    const existing = await this.findUserByEmailRepository.findByEmail(dto.email);

    if (existing) {
      throw new UserEmailAlreadyExistsError();
    }

    await this.clinicReader.requireExisting(dto.clinic_id);

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const now = new Date().toISOString();
    const entity = this.createUserDomainService.execute({
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      passwordHash,
      professionalLicense: dto.professional_license,
      clinicId: dto.clinic_id,
      role: dto.role,
      createdAt: now,
      updatedAt: now
    });

    const saved = await this.createUserRepository.create(entity);

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
